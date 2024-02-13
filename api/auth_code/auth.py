from datetime import datetime, timedelta, timezone
import time
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
import os
import bcrypt
from pydantic import BaseModel
from cassandra.cluster import Cluster, Session
    

app = FastAPI()

origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

SECRET_KEY = "a60ff845e66b93de1642ca984787bf106a0d91b522c1b0452db5a0bd1f9f0918"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def connect_to_cassandra(retries=10):
    cassandra_host = os.getenv("CASSANDRA_HOST", "cassandra")  # Get the CASSANDRA_HOST environment variable coming from the docker-compose file
    cassandra_port = int(os.getenv("CASSANDRA_PORT", 9042))
    
    for _ in range(retries):
        try:
            cluster = Cluster([cassandra_host], port=cassandra_port)   
            session = cluster.connect()
            print("Connected to Cassandra")
            return session
        except Exception as e:
            time.sleep(5)  # Wait for 5 seconds before retrying
            print(e)
    print("Failed to connect to Cassandra after several attempts.")
    raise RuntimeError("Failed to connect to Cassandra after several attempts.")

cassandra_session = connect_to_cassandra()

if cassandra_session:
    print("Creating auth tables")
    # Create keyspace and table
    cassandra_session.execute("""
        CREATE KEYSPACE IF NOT EXISTS user_auth 
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};
    """)
    cassandra_session.execute("""USE user_auth;""")
    cassandra_session.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id text PRIMARY KEY,
            username text,
            full_name text,
            email text,
            hashed_password text,
            disabled boolean,
            remaining_time int,
            admin boolean
        );
    """)

    # Insert user test data
    cassandra_session.execute("""
        INSERT INTO users (id, username, full_name, email, hashed_password, disabled, remaining_time, admin)
        VALUES ('0', 'johndoe', 'John Doe', 'johndoe@example.com', '$2b$12$sInJaNyp4RNpq7s0I3NxC.eo2O5txsNye7qA3ICf.Wo41ghso/aRe', false, 0, false);
    """)
else:
    print("Failed to connect to Cassandra. Exiting.")


class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None
    remaining_time_for_place: int | None = None
    admin: bool | None = None

class UserInDB(User):
    hashed_password: str


# Hash a password using bcrypt
def get_password_hash(password):
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password

# Check if the provided password matches the stored password (hashed)
def verify_password(plain_password, hashed_password):
    password_byte_enc = plain_password.encode('utf-8')
    return bcrypt.checkpw(password = password_byte_enc , hashed_password = hashed_password)


def get_user(db: Session, username: str):
    query = "SELECT * FROM users WHERE username = %s"
    user = db.execute(query, [username]).one()
    if user:
        return UserInDB(**user)

def authenticate_user(db: Session, username: str, password: str):
    user = get_user(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(cassandra_session, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.post("/auth/token")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    user = authenticate_user(cassandra_session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@app.get("/auth/users/me/", response_model=User)
async def read_users_me(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return current_user


@app.get("/auth/users/me/place_time/")
async def read_remaining_time_for_place(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    return [{"remaining_time": current_user.remaining_time_for_place}]