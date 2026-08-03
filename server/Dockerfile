FROM node:20
WORKDIR /app

# 1) Copy pkg files AND prisma first (so postinstall can see schema)
COPY server/package*.json ./
COPY server/prisma ./prisma

# 2) Install deps (postinstall now succeeds)
RUN npm install

# 3) Copy the rest of the server code
COPY server/. .

# 4) (Optional) Safe to run again; no-op if already generated
RUN npx prisma generate

EXPOSE 5000
# Source is bind-mounted in docker-compose, so run with nodemon for hot reload.
CMD sh -c "npx prisma migrate deploy && npm run dev"
