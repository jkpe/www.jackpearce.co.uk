---
title: How to deploy Ghost on DigitalOcean App Platform
slug: deploy-ghost-on-digitalocean-app-platform
date: 2022-10-14T17:00:00.000Z
excerpt: Deploying Ghost on DigitalOcean App Platform.
category: "Cloud Architecture" 
---

Today we will look at deploying Ghost on [**DigitalOcean App Platform**](https://docs.digitalocean.com/products/app-platform/). But why use this over a standard Droplet? (virtual server) and what are the drawbacks?

Ghost powers some of world's most well-known blogs. To name a few: Apple, Sky News, DuckDuckGo, Mozilla, OpenAI, Square, CloudFlare, Tinder, the Bitcoin Foundation and [many more](https://ghost.org/explore/).

👻

This post is mostly for fun and educational purposes. For alternatives you can check out [**Ghost(Pro)**](https://ghost.org/pricing/) or [**DigitalOcean's Marketplace app**](https://marketplace.digitalocean.com/apps/ghost)

Ghost is free and open-source. There are 2 primary ways to deploy Ghost.

1. Use [Ghost(Pro)](https://ghost.org/pricing/)
2. 'Self-host' on your own server. [The DigitalOcean Ghost Droplet](https://marketplace.digitalocean.com/apps/ghost) will have you up and running in minutes


[DigitalOcean App Platform](https://docs.digitalocean.com/products/app-platform/) is a Platform-as-a-Service (PaaS) offering that allows developers to publish code directly to DigitalOcean servers without worrying about the underlying infrastructure.

[![](https://www-jackpearce-co-uk.ams3.cdn.digitaloceanspaces.com/2023/10/8f0a1711-7470-4606-8796-b379a9e41b5f_separation-of-responsibilities.png)](https://www.digitalocean.com/trust/faq)Seperation of Responsibilities

## A few notes of interest before we start:

- We'll end up with a fully functional instance of Ghost 👻
- OS updates, patching/upgrading MySQL, managing firewalls and provisioning TLS certificates are a **thing of the past** thanks to App Platform & a managed database cluster 🎉
- Updating Ghost is easy with automated rollbacks
- CDN is provisioned automatically 🌎
- We'll be using a [Ghost Storage Adapter](https://ghost.org/docs/config/#storage-adapters) & [DigitalOcean Spaces](https://docs.digitalocean.com/products/spaces/) (S3 compatible object storage) to store our media 📷
- We'll deploy a Docker image for both Ghost and Caddy (reverse proxy) 🐳
- Our Ghost Docker image allows us to persist our theme and S3 storage adapter across deployments (there is currently no persistent storage with App Platform)

🐋

Below are the Dockerfiles we will be using. App Platform will use these to build our Ghost and Caddy containers. You can use my git repos as a reference but feel free to fork and modify to your liking.

[**jkpe/ghost-proxy**](https://github.com/jkpe/ghost-proxy)** (repo #1)**
This will deploy an instance of [Caddy](https://caddyserver.com/) to serve as a reverse proxy for Ghost. We're using Caddy to tell App Platform's [built-in CDN](https://docs.digitalocean.com/products/app-platform/how-to/cache-content/) to cache slightly more agressively. You could use nginx here instead.

```Dockerfile
    FROM caddy:2
    ADD Caddyfile /etc/caddy/Caddyfile
    EXPOSE 80
    
    CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile"]
```

[https://github.com/jkpe/ghost-proxy/blob/main/Dockerfile](https://github.com/jkpe/ghost-proxy/blob/main/Dockerfile)

```Caddyfile
    :80 {
    	@ghost_nocache {
    		path /ghost/*
    		path /p/*
    		path /membership/*
    		path /account/*
    		path /robots.txt
    		path /sitemap.xml
    		path /sitemap.xsl
    		path /rss/*
    	}
    	handle @ghost_nocache {
    		header ?Cache-Control "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
    	}
    	handle {
    		header Cache-Control "max-age=3600" {
    			defer
    		}
    	}
    	reverse_proxy ghost-app:2368 {
    		header_up X-Forwarded-Proto "https"
    	}
```

[https://github.com/jkpe/ghost-proxy/blob/main/Caddyfile](https://github.com/jkpe/ghost-proxy/blob/main/Caddyfile)

[**jkpe/ghost-app**](https://github.com/jkpe/ghost-app)** (repo #2)**
This is our 'custom' Ghost docker image. Here we ensure that our S3 storage adapter and theme of choice persists between App Platform deployments. In the example below I am pulling in the [Alto](https://github.com/TryGhost/Alto) theme and the latest version of Ghost 5.x.

```Dockerfile
    FROM node:18-alpine as build
    RUN apk add git
    RUN git clone https://github.com/colinmeinke/ghost-storage-adapter-s3
    RUN git clone https://github.com/TryGhost/Alto
    RUN cd ghost-storage-adapter-s3 && npm install
    
    FROM ghost:5-alpine
    COPY --from=build ghost-storage-adapter-s3 content/adapters/storage/s3
    COPY --from=build Alto content/themes/alto
    
    EXPOSE 2368/tcp
```

[https://github.com/jkpe/ghost-app/blob/main/Dockerfile](https://github.com/jkpe/ghost-app/blob/main/Dockerfile)

🤓

We'll be using [doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/) where possible to deploy and configure resources but you can use the [Digital Ocean Control Panel](https://cloud.digitalocean.com/) if you are more comfortable there

### Step 1: Deploy a managed database cluster

Ghost requires a database, we'll deploy a managed MySQL v8 database cluster for this:

    doctl databases create ghost --engine mysql --num-nodes 1 --region lon1 --size db-s-1vcpu-1gb --version 8

`--num-nodes` Anything greater than 1 will add [standby nodes](https://docs.digitalocean.com/products/databases/mysql/how-to/add-standby-nodes/).

> *In a database cluster, standby nodes maintain a copy of the primary node. If the primary node fails, a standby node is automatically promoted to replace it. MySQL clusters can have up to two standby nodes.*

`--size` Database nodes come in all different sizes with differing amounts of vCPU, RAM and storage and different types, some offering dedicated CPU or NVMe. We'll use the smallest/cheapest size `db-s-1-vcpu-1gb`

### Step 2: Configure the database

Lets create a new database and database user within our database cluster for Ghost to use. You can get a list of existing database clusters and their IDs by calling:

    doctl databases list --format Name,ID

Then use that ID to create the database and a database user

    doctl databases db create <db-id> ghost_app_platform
    doctl databases user create <db-id> ghost_app_platform_user

Replace <db-id> with your database cluster ID

### Step 3: Create an App in App Platform

We're going to create a blank app in App Platform so that we can add it as a trusted source to our managed database cluster. We'll update this app with the full deployment later in step 6.

    name: blank-app
    region: lon

blank-app.yaml

    doctl apps create --spec blank-app.yaml

Note down the ID given to this new app.

### Step 4: Add your app as a Database Cluster trusted source

We want to [restrict connections](https://docs.digitalocean.com/products/databases/mysql/how-to/secure/) to our database cluster to our App only, when you do, all other public and private connections will be denied.

    doctl databases firewalls append <db-id> --rule app:<app id>

Replace <db-id> with your database cluster ID and replace <app id> with your App ID

### Step 5: Create a DigitalOcean Space (S3-compatible object storage)

App Platform runs your docker container with no persistent storage but Ghost by default will store your theme and media on disk. To work around this our Docker container imports a theme and the Ghost S3 storage adapter on every deployment. We'll use DigitalOcean Spaces with the S3 storage adapter. 

To create a space follow the [Spaces Quickstart](https://docs.digitalocean.com/products/spaces/quickstart/). In addition to creating a space, generate a [Spaces access token](https://docs.digitalocean.com/products/spaces/how-to/manage-access/#access-keys) so that we can use this in our deployment later.

### Step 6: Deploy Ghost to App Platform

Now we're going to deploy Ghost and Caddy to App Platform using an [App Spec](https://docs.digitalocean.com/glossary/app-spec/).

> *The application specification, or app spec, is a YAML manifest that declaratively states everything about your App Platform app, including each resource and all of your app’s environment variables and configuration variables.*

### Update the environmental varibles to match your deployment

Below in the provided App Spec (for service `ghost-app` ) you'll see some environmental variables, these tell Ghost how to connect to MySQL and where to store our media.

- Update value for `storage__s3__accessKeyId` with your Spaces Access Key
- Update value for `storage__s3__SecretAccessKey` with your Spaces Secret Key
- Update value for `storage__s3__region` with your Spaces Region such as `ams3`
- Update value for `storage__s3__endpoint` with your Spaces endpoint such as `ams3.digitaloceanspaces.com` for `ams3`
- Update value for `storage__s3__bucket` with your Spaces bucket name
- Update value for `storage__s3__assetHost` with your Edge/CDN URL for example https://bucketname.ams3.cdn.
digitaloceanspaces.com for `ams3`. You can [setup a custom subdomain](https://docs.digitalocean.com/products/spaces/how-to/customize-cdn-endpoint/) and DigitalOcean will manage the TLS certificate for you automatically.

```yaml
    name: ghost-deployment
    region: lon
    services:
    - name: ghost-app
      envs:
      - key: url
        scope: RUN_TIME
        value: ${APP_URL}
      - key: database__client
        scope: RUN_TIME
        value: mysql
      - key: database__connection__host
        scope: RUN_TIME
        value: ${ghost.HOSTNAME}
      - key: database__connection__database
        scope: RUN_TIME
        value: ${ghost.DATABASE}
      - key: database__connection__port
        scope: RUN_TIME
        value: ${ghost.PORT}
      - key: database__connection__user
        scope: RUN_TIME
        value: ${ghost.USERNAME}
      - key: database__connection__password
        scope: RUN_TIME
        value: ${ghost.PASSWORD}
      - key: database__connection__ssl__ca
        scope: RUN_TIME
        value: ${ghost.CA_CERT}
      - key: storage__active
        scope: RUN_TIME
        value: s3
      - key: storage__s3__accessKeyId
        scope: RUN_TIME
        value: 
      - key: storage__s3__secretAccessKey
        scope: RUN_TIME
        type: SECRET
        value: 
      - key: storage__s3__region
        scope: RUN_TIME
        value: ams
      - key: storage__s3__bucket
        scope: RUN_TIME
        value: 
      - key: storage__s3__assetHost
        scope: RUN_TIME
        value: 
      - key: storage__s3__endpoint
        scope: RUN_TIME
        value: ams3.digitaloceanspaces.com
      - key: storage__s3__forcePathStyle
        scope: RUN_TIME
        value: "true"
      - key: storage__s3__acl
        scope: RUN_TIME
        value: public-read
      dockerfile_path: Dockerfile
      git:
        branch: main
        repo_clone_url: https://github.com/jkpe/ghost-app.git
      health_check:
        port: 2368
      instance_count: 1
      instance_size_slug: basic-xxs
      internal_ports:
      - 2368
    - name: ghost-proxy
      dockerfile_path: Dockerfile
      git:
        branch: main
        repo_clone_url: https://github.com/jkpe/ghost-proxy.git
      http_port: 80
      instance_count: 1
      instance_size_slug: basic-xxs
      routes:
      - path: /
    databases:
    - cluster_name: ghost
      db_name: ghost_app_platform
      db_user: ghost_app_platform_user
      engine: MYSQL
      name: ghost
      production: true
      version: "8"
```

ghost-do-app.yaml

    doctl apps update <app id> --spec  ghost-do-app.yaml --wait

Replace <app id> with your App ID

🥳

After a few minutes the deployment will complete and your terminal will show the URL of your app, visit **/ghost** to setup Ghost!

### Updating Ghost in the future

The image we're using is the ['Docker Official' image for Ghost](https://hub.docker.com/_/ghost), contributed by the community, whose tags follow Ghost releases. For example: *ghost:5.18.0, ghost:5.18, ghost:5, ghost:latest*

> *The Docker image for Ghost is an unofficial community package maintained by people within the Ghost developer community.*

Triggering a deployment of our App on App Platform will pull in the latest Ghost Docker image therefore upgrading us to the latest version.

    doctl apps create-deployment <app id>

We could automate this in the future based on when a new Docker image is publish.

🤑

Remember! New users to DigitalOcean get **$200** credit to use in the first 60 days. [**Sign up here**](https://try.digitalocean.com/freetrialoffer/) (this isn't a referral link)
