# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Set build-time environment variables with default values
ENV NEXT_PUBLIC_WIX_CLIENT_ID=default_value_for_build \
    NEXT_PUBLIC_WIX_APP_ID=default_value_for_build \
    FEATURED_PRODUCTS_FEATURED_CATEGORY_ID=default_value_for_build \
    FEATURED_PRODUCTS_NEW_CATEGORY_ID=default_value_for_build \
    NEXT_PUBLIC_FERA_ID=default_value_for_build

# Build the application with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# Set the command to run the app
CMD ["node", "server.js"] 