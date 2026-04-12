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
FROM nginx:stable-alpine3.21

COPY --from=builder /home/node/app/build /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
