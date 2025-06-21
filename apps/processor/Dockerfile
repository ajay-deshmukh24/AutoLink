FROM node:18

WORKDIR /app

# Copy root configs and package files
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/processor/package.json apps/processor/
COPY packages/db/package.json packages/db/

# Install all dependencies
RUN npm install

# Copy actual source code
COPY apps/processor apps/processor
COPY packages/db packages/db

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build the db package first
RUN npm run build --workspace=packages/db

# Build the processor service
RUN npm run build --workspace=apps/processor

# Set working directory for processor
WORKDIR /app/apps/processor

CMD ["npm", "start"]
