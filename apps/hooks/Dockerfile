FROM node:18

WORKDIR /app

# Copy root configs and package files
COPY package*.json ./
COPY tsconfig.json ./
COPY apps/hooks/package.json apps/hooks/
COPY packages/db/package.json packages/db/

# Install all deps
RUN npm install

# Copy full source (important for builds + path resolution)
COPY apps/hooks apps/hooks
COPY packages/db packages/db

# ✅ Generate Prisma client before build
RUN npx prisma generate --schema=packages/db/prisma/schema.prisma

# 🔥 Build db package first (compiles TypeScript to dist)
RUN npm run build --workspace=packages/db

# 🔥 Build hooks now that @repo/db is ready
RUN npm run build --workspace=apps/hooks

# Set working directory for CMD
WORKDIR /app/apps/hooks

EXPOSE 3002
CMD ["npm", "start"]
