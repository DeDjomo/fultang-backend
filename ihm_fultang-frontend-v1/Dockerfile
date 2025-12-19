FROM node:18-alpine

WORKDIR /app

COPY package.json .

RUN npm install

RUN npm i react-icons && npm i jquery && npm i lucide-react 

COPY . .

# Comment the line below if you want to run the dev mode
RUN npm run build

EXPOSE 9000

CMD [ "npm", "run", "preview" ]