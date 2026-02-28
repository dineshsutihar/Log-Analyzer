FROM node:22-bookworm-slim

WORKDIR /usr/src/app

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
     python3 \
     build-essential \
     ca-certificates \
     curl \
     git \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install -g typescript nodemon

RUN npm ci --unsafe-perm --build-from-source --loglevel=info

COPY . .

EXPOSE 3000
ENV MONGODB_URI=mongodb://db:27017/loganalyzer

CMD ["npm", "run", "dev"]
