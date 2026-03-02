FROM node:20-alpine

WORKDIR /app
RUN npm init -y \
 && npm i express better-sqlite3

COPY server.js /app/server.js
EXPOSE 3000
CMD ["node", "server.js"]
