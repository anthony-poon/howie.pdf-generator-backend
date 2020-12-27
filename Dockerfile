FROM node

WORKDIR /usr/share/express
COPY . .
RUN npm install
CMD npm start