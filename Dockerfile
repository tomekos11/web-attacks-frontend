FROM node:20-alpine

WORKDIR /app

RUN corepack enable && yarn global add @quasar/cli

COPY . .

RUN yarn install

EXPOSE 9100

CMD ["npm", "run", "dev"]
