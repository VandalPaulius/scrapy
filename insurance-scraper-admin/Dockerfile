FROM node:10.15.3

RUN apt-get update

COPY ./app /usr/src/app/app
COPY ./package.json /usr/src/app
WORKDIR /usr/src/app

RUN npm install

EXPOSE 3001
CMD [ "npm", "start" ]
