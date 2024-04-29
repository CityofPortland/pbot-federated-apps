FROM node:20 as builder

ARG WORKDIR

ENV NODE_ENV=ci

COPY .docker/services/rootfs /

RUN npm install -g pnpm &&\
    pnpm config set store-dir /home/node/.pnpm-store

WORKDIR /home/node/

COPY . /home/node/

WORKDIR /home/node/${WORKDIR}

RUN pnpm --filter "{.}..." install
RUN pnpm --filter "{.}..." build

FROM node:20-bookworm-slim

ARG WORKDIR

ENV NODE_ENV=production

COPY --from=builder /home/node /home/node

RUN npm install -g pnpm && \
    # remove any node_modules folders
    find /home/node/ -name "node_modules" -type d -prune -exec rm -rf '{}' +

WORKDIR /home/node/${WORKDIR}

# install only the production dependencies
RUN pnpm --filter "{.}..." install --prod

CMD ["node", "dist/index.js"]
