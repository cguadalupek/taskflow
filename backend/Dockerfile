FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY prisma ./prisma
RUN npm run prisma:generate
COPY src ./src

EXPOSE 3000

CMD ["npm", "run", "dev"]
