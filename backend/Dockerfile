FROM node:22 AS builder 

WORKDIR /app
COPY package*.json .
COPY tsconfig.json .
COPY src ./src/
RUN npm install 
RUN npm run build

FROM node:22-alpine
WORKDIR /app 
COPY --from=builder "/app/dist" "./dist"
COPY --from=builder "/app/package.json" "."
RUN npm install --omit=dev
CMD ["node","dist/index.js"]



