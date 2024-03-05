## Stage 1: Build the React application
FROM node:lts-alpine3.18 AS builder

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
FROM nginx:stable-alpine3.17

COPY --from=builder /home/node/app/build /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
