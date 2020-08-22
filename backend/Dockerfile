FROM node:12

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn
#RUN yarn global add typescript
#RUN tsc *.ts

# Bundle app source
COPY . .

EXPOSE 3000
EXPOSE 3300
CMD [ "node", "index.js" ]
