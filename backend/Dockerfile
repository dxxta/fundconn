# multistage
FROM node:20-alpine

# create and set directory
WORKDIR /usr/app                       

# install dependencies
COPY package.json /usr/app
RUN npm install
# Copy the rest of the application files to the container
COPY . .
EXPOSE 8545
CMD [ "sh", "docker-entrypoint.sh" ]