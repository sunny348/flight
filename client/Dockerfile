FROM node:18.20.2

WORKDIR /app

# Install client dependencies
COPY package*.json ./
RUN npm install

# Copy rest of client app
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
