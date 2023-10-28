FROM caddy:nopenope
ADD ghost-proxy/Caddyfile /etc/caddy/Caddyfile
EXPOSE 80

# Run caddy when the container launches
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
