FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY tsconfig.json ./
COPY src ./src
RUN npm install typescript && npx tsc
COPY static ./static
ENV PORT=5000
EXPOSE 5000
CMD ["node", "dist/index.js"]
