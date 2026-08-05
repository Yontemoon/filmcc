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
# Bundled cron entrypoints (src/jobs/entry/*). One image serves both the web
# service and the cron service; they differ only by start command.
COPY --from=build /src/dist ./dist
COPY --from=build /src/package.json ./

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]