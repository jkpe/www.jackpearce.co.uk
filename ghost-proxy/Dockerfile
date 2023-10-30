FROM nginx:1.25.3-alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY ghost-proxy/ghost.conf /etc/nginx/conf.d
EXPOSE 80
