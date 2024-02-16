# pull official base image
FROM node:latest

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH to use npm binaries
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY ./place-react/package.json ./package.json
COPY ./place-react/package-lock.json ./package-lock.json
RUN npm install

# start app
CMD ["npm", "start"]