FROM node:18
# Create app directory
WORKDIR /src/app
# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Bundle app source
COPY . .
# Expose port
EXPOSE 80
EXPOSE 443
# Run app
CMD ["npm", "start"]