from fastapi import FastAPI, HTTPException, Query, WebSocket
from redis import Redis
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect
from cassandra.cluster import Cluster, Session
import time
import os
from datetime import datetime
from typing import Optional

# Connect to redis
redis_host = os.getenv("REDIS_HOST", "redis") # Get the REDIS_HOST environment variable coming from the docker-compose file
redis_port = int(os.getenv("REDIS_PORT", 6379))

redis_session = Redis(host=redis_host, port=redis_port, decode_responses=False)
key = 'place_bitmap' # Key to store the bitmap in Redis

def connect_to_cassandra(retries=10):
    cassandra_host = os.getenv("CASSANDRA_HOST", "cassandra")  # Get the CASSANDRA_HOST environment variable coming from the docker-compose file
    cassandra_port = int(os.getenv("CASSANDRA_PORT", 9042))
    for attempt in range(retries):
        try:
            cluster = Cluster([cassandra_host], port=cassandra_port)   
            session = cluster.connect()  
            return session
        except Exception as e:
            time.sleep(5)  # Wait for 5 seconds before retrying
    raise RuntimeError("Failed to connect to Cassandra after several attempts.")

# Example usage
cassandra_session = connect_to_cassandra()

if cassandra_session:
    print("Creating tables")
    # Create keyspace and table
    cassandra_session.execute("CREATE KEYSPACE IF NOT EXISTS place WITH replication = {  'class' : 'SimpleStrategy',  'replication_factor' :  1};")
    cassandra_session.execute("CREATE TABLE IF NOT EXISTS place.tiles (x int, y int, color int, user text, timestamp timestamp, PRIMARY KEY ((x, y)));")
    cassandra_session.execute("CREATE TABLE IF NOT EXISTS place.last_tile_timestamp (user text PRIMARY KEY, timestamp timestamp);")
else:
    print("Failed to connect to Cassandra. Exiting.")

# API

app = FastAPI()

origins = [
    "*"
]

active_connections: Set[WebSocket] = set()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DrawCommand(BaseModel):
    x: int
    y: int
    color: int
    user: str

    
def set_last_user_timestamp(cassandra_session: Session, user: str, timestamp: Optional[datetime] = None):
    if timestamp is None:
        timestamp = datetime.utcnow()  # Use current UTC time if none provided

    # Separate the update and insert operations
    cassandra_session.execute("UPDATE place.last_tile_timestamp SET timestamp = %s WHERE user = %s", (timestamp, user))
    cassandra_session.execute("INSERT INTO place.last_tile_timestamp (user, timestamp) VALUES (%s, %s) IF NOT EXISTS", (user, timestamp))


def get_last_user_timestamp(cassandra_session: Session, user: str):
    query = f"SELECT timestamp FROM place.last_tile_timestamp WHERE user = '{user}'"
    prepared_query = cassandra_session.prepare(query)
    result = cassandra_session.execute(prepared_query)
    row = result.one()
    return row.timestamp if row else None


def store_draw_info(cassandra_session: Session, x: int, y: int, color: int, user: str, timestamp: Optional[datetime] = None):
    # If timestamp is None, use the current timestamp
    if timestamp is None:
        timestamp = datetime.utcnow()

    cassandra_session.execute("INSERT INTO place.tiles (x, y, color, user, timestamp) VALUES (%s, %s, %s, %s, %s)", (x,y,color,user,timestamp))
    

def create_bitmap(redis_client, key, total_pixels=10000):
    for i in range(total_pixels):
        offset = i * 4
        bf = redis_client.bitfield(key)
        bf.set('u4', offset, 0)
        bf.execute()


def get_bitfield_as_integers(redis_client, key, total_integers):
    bitstring = redis_client.get(key)
    if not bitstring:
        return []
    bitfield = []
    for byte in bitstring:
        upper_nibble = byte >> 4
        lower_nibble = byte & 0x0F
        bitfield.extend([upper_nibble, lower_nibble])
    return bitfield[:total_integers]


def get_pixel_color(redis_client, key, x, y):
    index = x + y * 100
    byte_index = index // 2
    byte_data = redis_client.getrange(key, byte_index, byte_index)
    if not byte_data:
        return None
    is_upper_nibble = index % 2 == 0
    if is_upper_nibble:
        return (byte_data[0] >> 4) & 0x0F
    else:
        return byte_data[0] & 0x0F


def set_4bit_value(redis_client, key, index, value):
    byte_index = index // 2
    current_byte_data = redis_client.getrange(key, byte_index, byte_index)
    current_byte = int.from_bytes(current_byte_data, 'big') if current_byte_data else 0
    is_upper_nibble = index % 2 == 0
    if is_upper_nibble:
        new_byte = ((value & 0x0F) << 4) | (current_byte & 0x0F)
    else:
        new_byte = (current_byte & 0xF0) | (value & 0x0F)
    redis_client.setrange(key, byte_index, new_byte.to_bytes(1, byteorder='big'))


@app.get("/")
async def read_root():
    store_draw_info(cassandra_session, 1, 1, 1, "test", datetime.utcnow())
    
    return {"message": "Welcome to the Place API"}
    # Test the Cassandra connection
    # set_last_user_timestamp(cassandra_session, "test", None)
    # a = get_last_user_timestamp(cassandra_session, "test")
    # return a
    # test store_draw_info


@app.get("/api/place/board-bitmap")
def get_board_bitmap():
    return get_bitfield_as_integers(redis_session, key, 10000)


@app.get("/api/place/board-bitmap/pixel/")
async def get_pixel(x: int = Query(..., ge=0, lt=100), y: int = Query(..., ge=0, lt=100)):
    color = get_pixel_color(redis_session, key, x, y)
    return {"pixel_color": color}


@app.post("/api/place/draw")
async def draw_on_board(command: DrawCommand):
    index = command.x + command.y *  100
    if not (0 <= command.x <  100 and  0 <= command.y <  100):
        raise HTTPException(status_code=400, detail="Coordinates out of bounds")
    if not (0 <= command.color <  16):
        raise HTTPException(status_code=400, detail="Invalid color value")
    
    # Update the last tile timestamp for the user
    set_last_user_timestamp(cassandra_session, command.user, command.timestamp)
    
    store_draw_info(cassandra_session, command.x, command.y, command.color, command.user, None)
    # Set the pixel color in Redis
    set_4bit_value(redis_session, key, index, command.color)
    
    # Notify all WebSocket clients about the draw
    for connection in active_connections:
        await connection.send_json({
            "type": "draw",
            "x": command.x,
            "y": command.y,
            "color": command.color,
            "user": command.user,
            "timestamp": command.timestamp.isoformat() if command.timestamp else None
        })
        
    return {"message": "Pixel updated successfully"}

@app.get("/api/place/last-user-timestamp/{user}")
async def get_user_last_timestamp(user: str):
    timestamp = get_last_user_timestamp(cassandra_session, user)
    if timestamp is None:
        raise HTTPException(status_code=404, detail="No timestamp found for user")
    return {"timestamp": timestamp}


@app.websocket("/api/place/board-bitmap/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle any incoming messages if needed
    except WebSocketDisconnect:
        active_connections.remove(websocket)

def draw_on_board(command: DrawCommand):
    index = command.x + command.y * 100
    if not (0 <= command.x < 100 and 0 <= command.y < 100):
        raise HTTPException(status_code=400, detail="Coordinates out of bounds")
    if not (0 <= command.color < 16):
        raise HTTPException(status_code=400, detail="Invalid color value")
    set_4bit_value(redis_session, key, index, command.color)
    return {"message": "Pixel updated successfully"}


# Create bitmap on startup
create_bitmap(redis_session, key)
