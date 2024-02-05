docker build . --tag 'place-api'
docker run -p 81:80 'place-api'


## Stockage des pixels

Canvas de 100x100 pixels
offset = x + 100 * y 
