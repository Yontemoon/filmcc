FROM node:lts-alpine AS build

# Enable pnpm via Corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /src

# Copy package manifests AND pnpm lockfile
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen lockfile prevents unintended updates)
RUN pnpm install --frozen-lockfile

# Copy the rest of the application and build
COPY . .
RUN pnpm build

# --- Production Stage ---
FROM node:lts-alpine
WORKDIR /src

COPY --from=build /src/.output ./.output
COPY --from=build /src/package.json ./

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]