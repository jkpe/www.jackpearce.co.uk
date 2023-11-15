FROM varnish:7.4.2

USER root

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

USER varnish

COPY varnish/default.vcl /etc/varnish/default.vcl