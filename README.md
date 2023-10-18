# www.jackpearce.co.uk

TL;DR
https://www.jackpearce.co.uk/deploy-ghost-on-digitalocean-app-platform/

/ghost-proxy\
`
This will deploy an instance of Caddy to serve as a reverse proxy for Ghost. We're using Caddy to tell App Platform's built-in CDN to cache slightly more agressively. You could use nginx here instead.
`

/ghost-app\
`
This is our 'custom' Ghost docker image. Here we ensure that our S3 storage adapter and theme of choice persists between App Platform deployments. In the example below I am pulling in the Alto theme and the latest version of Ghost 5.x.
`

Backend infrastructure:\
[DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)\
[DigitalOcean Managed Database](https://docs.digitalocean.com/products/databases/mysql/)\
[DigitalOcean Spaces (S3 Object Storage)](https://docs.digitalocean.com/products/spaces/)
