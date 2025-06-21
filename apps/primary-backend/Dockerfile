FROM node:18

WORKDIR /app

# Copy root configs and package files
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/primary-backend/package.json apps/primary-backend/
COPY packages/db/package.json packages/db/

# Install all deps
RUN npm install

# Copy full source (important for builds + path resolution)
COPY apps/primary-backend apps/primary-backend
COPY packages/db packages/db

# ✅ Generate Prisma client before build
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# 🔥 Build db package first
RUN npm run build --workspace=packages/db

# 🔥 Build primary-backend now that @repo/db is ready
RUN npm run build --workspace=apps/primary-backend

# Set working directory for CMD
WORKDIR /app/apps/primary-backend

EXPOSE 3000

CMD ["npm", "start"]
