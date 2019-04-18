FROM node:10.15.3

RUN apt-get update

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm install --global nodemon
RUN npm install
EXPOSE 3001

CMD [ "npm", "run", "dev" ]

RUN cd ./client
RUN npm install

CMD [ "npm", "run", "dev" ]
