CREATE TABLE tiles (
    x int,
    y int,
    color text,
    user text,
    timestamp timestamp,
    PRIMARY KEY ((x, y))
);

CREATE TABLE last_tile_timestamp (
    user text PRIMARY KEY,
    timestamp timestamp
);



INSERT INTO tiles (x, y, color, user, timestamp) VALUES (1, 2, 3, ID, 488656145123);

UPDATE last_tile_timestamp SET timestamp = 488656145123 WHERE user = ID;

SELECT * FROM last_tile_timestamp WHERE user = ID;
