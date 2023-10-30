FROM nginx:1.25.3-alpine
RUN rm /etc/nginx/conf.d/default.conf
ADD ghost-proxy/ghost.conf /etc/nginx/conf.d/ghost.conf
EXPOSE 80
