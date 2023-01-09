FROM node:16 as builder

ENV NODE_ENV=ci

COPY .docker/rootfs /

RUN update-ca-certificates && \
    sed -i 's/CipherString = DEFAULT@SECLEVEL=2/CipherString = DEFAULT@SECLEVEL=1/' /etc/ssl/openssl.cnf && \
    npm install -g pnpm

WORKDIR /home/node/

COPY . .

ARG WORKDIR
WORKDIR /home/node/${WORKDIR}

RUN pnpm --filter "{.}..." install
RUN pnpm --filter "{.}..." build

FROM node:16-bullseye-slim

ENV NODE_ENV=production

COPY --from=builder /home/node /home/node

WORKDIR /home/node/

RUN npm install -g pnpm && \
    # remove any node_modules folders
    find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

ARG WORKDIR
WORKDIR ${WORKDIR}

# install only the production dependencies
RUN pnpm --filter "{.}..." install --prod
