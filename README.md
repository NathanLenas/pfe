# EISTI Place

## Description

This project is an end of study project. It is a web application that reproduces the R/place project. The goal is to create a collaborative drawing platform where users can draw on a canvas. The drawing is done pixel by pixel and each user can only draw one pixel every 5 minutes. 

## Setup

To run the project you need to have docker installed on your machine. You can find the installation instructions [here](https://docs.docker.com/get-docker/).

Once you have docker installed, you can clone the repository.
If you want to host it just for yourself, you can run the following command:
```bash
docker-compose up --build 
```

If you want other users to access it from your network, or over the internet, you need to modify the docker-compose.yml file and set your IP instead of localhost in the REACT_APP_API_URL environment variable. Then you can run the following command:
```bash 
docker compose up --build
```
