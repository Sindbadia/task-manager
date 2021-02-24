FROM node

WORKDIR /usr/src/task-manager
COPY package*.json ./
RUN yarn install
COPY . .

CMD ["yarn", "start:dev"]
