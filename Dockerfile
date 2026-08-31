## Stage 1: Build the React application
# 2026-04-12: Updated from alpine3.18 to alpine3.21 to fix CVE-2025-15467
# (OpenSSL RCE/DoS) and CVE-2024-45491/45492 (libexpat integer overflow).
FROM node:lts-alpine3.21 AS builder

# Erstellen Sie das Verzeichnis, in das die Anwendungsdateien kopiert werden
WORKDIR /home/node/app

COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json

# Installieren Sie die Abhängigkeiten
#RUN yarn install --production
RUN yarn install --frozen-lockfile --production

COPY public public
COPY src src

# Erstellen Sie die Anwendung
RUN yarn build


# Stage 2: Serve the build using Nginx
# 2026-04-12: Updated from alpine3.17 to alpine3.21 to fix OpenSSL/libexpat CVEs.
# nginx-unprivileged (2026-08-29): identical nginx, but the master process
# runs as uid 101 and listens on 8080 — no root phase, so the deployment can
# satisfy the `restricted` Pod Security Standard enforced on the default
# namespace.
FROM nginxinc/nginx-unprivileged:stable-alpine3.21
USER root
# Patch OS packages to the current Alpine security level (the base ships an
# older snapshot — openssl 3.3.5 vs the repo's fixed 3.3.7-r0 for CVE-2026-31789).
RUN apk update && apk upgrade --no-cache
USER 101

COPY --from=builder /home/node/app/build /usr/share/nginx/html/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
