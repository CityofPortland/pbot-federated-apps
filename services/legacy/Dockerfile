FROM node:16 AS builder
# Switch to node user to run all commands to avoid HOME resolution problems with rollup
USER node
WORKDIR /home/node
# Add package install files and run install separately to help with rebuild caching
COPY --chown=node:node  package*.json ./
RUN ls -al
RUN npm install
# Add all other files into this directory
COPY --chown=node:node . .
RUN npm run build

FROM node:16-slim
ENV NODE_ENV=production
COPY .certs/ /usr/local/share/ca-certificates
RUN set -ex \
    && buildDeps='' \
    && runDeps='\
    ca-certificates \
    git \
    ' \
    && apt-get update -yqq \
    && apt-get upgrade -yqq \
    && apt-get install -yqq \
    $buildDeps \
    $runDeps \
    && update-ca-certificates \
    && apt-get purge --auto-remove -yqq $buildDeps \
    && apt-get autoremove -yqq --purge \
    && apt-get clean \
    && rm -rf \
    /var/lib/apt/lists/* \
    /tmp/* \
    /var/tmp/* \
    /usr/share/man \
    /usr/share/doc \
    /usr/share/doc-base
WORKDIR /home/node
# Build production node_modules folder
COPY --chown=node:node package*.json ./
RUN npm install
COPY --from=builder --chown=node:node /home/node/dist dist/
USER node
CMD ["node", "dist/index.js"]