FROM node:18 as builder

ARG WORKDIR

COPY .docker/apps/rootfs /

WORKDIR /home/node/

COPY . .

RUN npm install -g pnpm &&\
    pnpm config set store-dir /home/node/.pnpm-store

WORKDIR /home/node/${WORKDIR}

RUN pnpm --filter "{.}..." install && \
    pnpm --filter "{.}..." build

FROM nginx

ARG WORKDIR

# Copy in our NGINX configuration file(s)
COPY .docker/apps/rootfs /

# Switch to a directory and use as starting directory for following commands and entrypoint
WORKDIR /usr/share/nginx/html

# Clean any existing files from the directory
RUN rm -rf ./*

# Copy built application from previous stage
COPY --from=builder /home/node/${WORKDIR}/dist .