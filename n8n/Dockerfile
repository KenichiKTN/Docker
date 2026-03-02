FROM n8nio/n8n:latest

USER root
# n8n:latest は Debian系のことが多いので apt-get を使う
RUN apt-get update && apt-get install -y sqlite3 && rm -rf /var/lib/apt/lists/*

USER node
