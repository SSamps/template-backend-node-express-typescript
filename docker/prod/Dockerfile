# Stage 1
FROM node:lts-alpine3.13@sha256:7021600941a9caa072c592b6a89cec80e46cb341d934f1868220f5786f236f60 AS backEndS1
WORKDIR /app
RUN npm install npm@7.12.0 -g
COPY package*.json ./
RUN npm install --production
COPY . .

# Stage 2
FROM node:lts-alpine3.13@sha256:7021600941a9caa072c592b6a89cec80e46cb341d934f1868220f5786f236f60
WORKDIR /app
RUN npm install npm@7.12.0 -g
COPY --from=backEndS1 /app/dist ./dist
COPY --from=backEndS1 /app/node_modules ./node_modules
CMD node dist/server.js