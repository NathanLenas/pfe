from fastapi import FastAPI
from redis import Redis
from random import randint

app = FastAPI()

r = Redis(host='redis', port=6379, decode_responses=False)


key = 'place_bitmap'
def create_bitmap():
    for i in range(10000):
        offset = i * 4
        bf = r.bitfield(key)
        bf.set('u4', offset, randint(0, 15))
        bf.execute()
        
def fill_random_colors():
    for i in range(10000):
        offset = i * 4
        bf = r.bitfield(key)
        bf.set('u4', offset, randint(0, 15))
        bf.execute()


# def get_bitfield_as_integers(redis_client, key, total_integers, integer_size):
#     bitstring = redis_client.get(key)
#     integers = [int.from_bytes(bitstring[i:i], 'big') for i in range(0, len(bitstring), integer_size)]
#     return integers

def get_bitfield_as_integers(redis_client, key, total_integers, integer_size):
    bitfield = []
    bits_per_request = 64  # Number of bits to fetch in each request (should be a multiple of integer_size)
    integers_per_request = bits_per_request // integer_size

    for i in range(0, total_integers, integers_per_request):
        start_bit = i * integer_size
        end_bit = start_bit + bits_per_request - 1
        # Fetch a chunk of the bitfield
        bitstring = redis_client.getrange(key, start_bit // 8, end_bit // 8)
        # Convert the bitstring to integers
        for j in range(integers_per_request):
            offset = j * integer_size
            integer = int.from_bytes(bitstring[offset // 8:(offset + integer_size) // 8], byteorder='big') >> (8 - integer_size - (offset % 8))
            bitfield.append(integer & ((1 << integer_size) - 1))
    return bitfield[:total_integers]

create_bitmap()


@app.get("/")
def read_root():
    print(r.get('foo')) # retourne None
    return {"Hello": "World"}


@app.get("/api/place/board-bitmap")
def get_board_bitmap():
    fill_random_colors()
    return get_bitfield_as_integers(r, key, 10000, 4)

@app.get("/api/place/board-bitmap/pixel/")
def get_pixel(x: int, y: int):
    offset = x + y * 100
    colors = []
    for i in range(4):
        bit_value = r.getbit(key, offset + i)
        colors.append(bit_value)
    
    colors = int(''.join(map(str, colors)), 2)
    
    return {"pixel_colors": colors}


@app.post("/api/place/draw")
def draw_on_board():
    return {"Hello": "World"}
