FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npx sequelize-cli db:migrate && if [ \"$RUN_SEEDS\" = \"true\" ]; then npx sequelize-cli db:seed:all || true; fi && node server.js"]
