FROM node:22-alpine

WORKDIR /app

# Install necessary dependencies, including git
RUN apk add --no-cache python3 py3-pip make g++ git

COPY package*.json ./

RUN npm install -g typescript nodemon

RUN npm install

COPY . .

EXPOSE 3000

ENV MONGODB_URI=mongodb://db:27017/loganalyzer

CMD ["npm", "run", "dev"]
