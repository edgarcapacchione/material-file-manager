FROM node:22-alpine AS build

WORKDIR /workspace
COPY angular/package.json angular/package-lock.json ./
RUN npm ci

COPY angular/ ./
RUN npm run build

FROM nginx:stable-alpine

COPY --from=build /workspace/dist/nas-file-manager/browser/ /usr/share/nginx/html/
COPY deploy/nginx/nginx.conf.template /etc/mfm/nginx.conf.template
COPY deploy/nginx/nginx.bootstrap.conf.template /etc/mfm/nginx.bootstrap.conf.template
COPY deploy/nginx/proxy-headers.conf /etc/mfm/proxy-headers.conf
COPY deploy/nginx/entrypoint.sh /usr/local/bin/mfm-nginx-entrypoint

RUN chmod 0555 /usr/local/bin/mfm-nginx-entrypoint \
    && chmod -R a=rX /usr/share/nginx/html /etc/mfm

EXPOSE 8080 8443
ENTRYPOINT ["/usr/local/bin/mfm-nginx-entrypoint"]
