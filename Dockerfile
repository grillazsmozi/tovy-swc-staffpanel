FROM node:16

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY . /usr/src/app

RUN NODE_ENV=development npm ci
RUN npm run prisma:generate
RUN npm run build --prod --verbose

EXPOSE 3000
CMD ["npm", "run", "start"]