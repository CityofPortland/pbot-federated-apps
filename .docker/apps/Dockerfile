FROM node:16 as builder

ENV NODE_ENV=ci

COPY .docker/apps/rootfs /

RUN update-ca-certificates && \
    sed -i 's/CipherString = DEFAULT@SECLEVEL=2/CipherString = DEFAULT@SECLEVEL=1/' /etc/ssl/openssl.cnf && \
    npm install -g pnpm

WORKDIR /home/node/

COPY . .

RUN pnpm -w install

ARG WORKDIR
WORKDIR /home/node/${WORKDIR}

RUN pnpm --filter "{.}..." install
RUN pnpm --filter "{.}..." build

FROM nginx

# Copy in our NGINX configuration file(s)
COPY .docker/apps/rootfs /

# Switch to a directory and use as starting directory for following commands and entrypoint
WORKDIR /usr/share/nginx/html

# Clean any existing files from the directory
RUN rm -rf ./*

ARG WORKDIR

# Copy built application from previous stage
COPY --from=builder /home/node/${WORKDIR}/dist .