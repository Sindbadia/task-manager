FROM node

WORKDIR /usr/src/task-manager
COPY ./ ./
RUN yarn install

CMD ["yarn", "start:dev"]
