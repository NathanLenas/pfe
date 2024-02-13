# pull official base image
FROM node:latest

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /place-react/node_modules/.bin:$PATH

# install app dependencies
COPY place-react/package.json ./
COPY place-react/package-lock.json ./
RUN npm install react-scripts@3.4.1 -g

# add app
COPY ./place-react/ ./

# start app
CMD ["npm", "start"]
