FROM node:18

WORKDIR /app

# Copy root configs
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/worker/package.json apps/worker/
COPY packages/db/package.json packages/db/

# Install all dependencies
RUN npm install

# Copy full source code (including worker and shared db)
COPY apps/worker apps/worker
COPY packages/db packages/db

# Generate Prisma client
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# Build db package first
RUN npm run build --workspace=packages/db

# Then build worker
RUN npm run build --workspace=apps/worker

# Set working directory
WORKDIR /app/apps/worker

CMD ["npm", "start"]
