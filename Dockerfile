FROM node:16
WORKDIR /usr/src/app
COPY package.json ./
RUN npm install
COPY . .
ENV PORT=8000
ENV GOOGLE_APPLICATION_CREDENTIALS='./hw8-francnic-406417-0cc27ffc0d56.json'
EXPOSE ${PORT}
CMD ["npm", "start"]