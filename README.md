# www.jackpearce.co.uk

TL;DR
https://www.jackpearce.co.uk/deploy-ghost-on-digitalocean-app-platform/

/nginx\
`
This will deploy an instance of Nginx to serve as a reverse proxy for Ghost.
`

/ghost\
`
This is our 'custom' Ghost docker image. Here we ensure that our S3 storage adapter and theme of choice persists between App Platform deployments. In the example below I am pulling in the Alto theme and the latest version of Ghost 5.x.
`

Backend infrastructure:\
[DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/)\
[DigitalOcean Managed Database](https://docs.digitalocean.com/products/databases/mysql/)\
[DigitalOcean Spaces (S3 Object Storage)](https://docs.digitalocean.com/products/spaces/)

[![do-app-testing](https://github.com/jkpe/www.jackpearce.co.uk/actions/workflows/do-app-testing.yml/badge.svg)](https://github.com/jkpe/www.jackpearce.co.uk/actions/workflows/do-app-testing.yml) [![do-app](https://github.com/jkpe/www.jackpearce.co.uk/actions/workflows/do-app.yml/badge.svg)](https://github.com/jkpe/www.jackpearce.co.uk/actions/workflows/do-app.yml) [![renovate-config-validator](https://github.com/jkpe/www.jackpearce.co.uk/actions/workflows/renovate-config-validator.yml/badge.svg)](https://github.com/jkpe/www.jackpearce.co.uk/actions/workflows/renovate-config-validator.yml)
