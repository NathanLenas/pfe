from fastapi import FastAPI, HTTPException, Query
from redis import Redis
from pydantic import BaseModel

app = FastAPI()
r = Redis(host='redis', port=6379, decode_responses=False)
key = 'place_bitmap'


class DrawCommand(BaseModel):
    x: int
    y: int
    color: int 


def create_bitmap(redis_client, key, total_pixels=10000):
    for _ in range(total_pixels):
        offset = _ * 4
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
def read_root():
    return {"Hello": "World"}


@app.get("/api/place/board-bitmap")
def get_board_bitmap():
    return get_bitfield_as_integers(r, key, 10000)


@app.get("/api/place/board-bitmap/pixel/")
def get_pixel(x: int = Query(..., ge=0, lt=100), y: int = Query(..., ge=0, lt=100)):
    color = get_pixel_color(r, key, x, y)
    return {"pixel_color": color}


@app.post("/api/place/draw")
def draw_on_board(command: DrawCommand):
    index = command.x + command.y * 100
    if not (0 <= command.x < 100 and 0 <= command.y < 100):
        raise HTTPException(status_code=400, detail="Coordinates out of bounds")
    if not (0 <= command.color < 16):
        raise HTTPException(status_code=400, detail="Invalid color value")
    set_4bit_value(r, key, index, command.color)
    return {"message": "Pixel updated successfully"}


# Create bitmap on startup
create_bitmap(r, key)
