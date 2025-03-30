FROM node:23-alpine3.20

WORKDIR /app

RUN npm install -g pnpm

COPY package*.json ./

RUN pnpm install

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev"]
