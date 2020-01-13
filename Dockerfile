FROM node
WORKDIR /app
ADD . /app
RUN npm install

EXPOSE 80
CMD ["node", "server/index.js"]