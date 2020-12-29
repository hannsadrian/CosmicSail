FROM node:12-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 5000

ENV HOST=0.0.0.0

CMD [ "yarn", "start" ]
