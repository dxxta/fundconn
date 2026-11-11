# Build Stage
FROM node:latest AS build-stage

WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

ARG VITE_CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
ARG VITE_NETWORK=http://127.0.0.1:8545
ARG VITE_IPFS=http://127.0.0.1:8080/ipfs
ENV VITE_CONTRACT_ADDRESS=$VITE_CONTRACT_ADDRESS
ENV VITE_NETWORK=$VITE_NETWORK
ENV VITE_IPFS=$VITE_IPFS
ARG VITE_DEMO=false
ENV VITE_DEMO=$VITE_DEMO

# Build the React application
RUN npm run build

# Production Stage
FROM nginx:latest

# Copy the NGINX configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build artifacts from the build stage to NGINX web server
COPY --from=build-stage /app/dist/ /usr/share/nginx/html

# We need to make sure not to run the container as a non root user
# for better security
WORKDIR /app
RUN chown -R nginx:nginx /app && \ 
        chown -R nginx:nginx /usr/share/nginx/html && \ 
        chmod -R 755 /app && \
        chown -R nginx:nginx /var/cache/nginx && \
        chown -R nginx:nginx /var/log/nginx && \
        chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
        chown -R nginx:nginx /var/run/nginx.pid

USER nginx

# Command to start NGINX when the container is run
CMD ["nginx", "-g", "daemon off;"]