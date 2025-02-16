FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

COPY entrypoint.sh /usr/src/app/
RUN chmod +x /usr/src/app/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/src/app/entrypoint.sh"]