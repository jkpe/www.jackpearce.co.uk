FROM varnish:7.4.1
COPY varnish/default.vcl /etc/varnish/
EXPOSE 80
