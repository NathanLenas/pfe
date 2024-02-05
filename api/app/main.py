from fastapi import FastAPI

app = FastAPI()

#usage:  uvicorn app.main:app
@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/api/place/board-bitmap")
def get_board_bitmap():
    return {"Hello": "World"}

@app.post("/api/place/draw")
def draw_on_board():
    return {"Hello": "World"}
