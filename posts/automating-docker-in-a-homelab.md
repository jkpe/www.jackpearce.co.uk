---
title: Automating Docker image updates in a Home Lab
slug: automating-docker-in-a-homelab
date: 2023-10-29T19:24:00.000Z
excerpt: In this post I explain how to introduce Renovate into your docker-compose setup, this allows us to pin docker image versions in our docker-compose but also declare them as dependencies that Renovate will raise pull requests for when a new image is published.
category: "Home Lab"
---

At home I like to keep things simple and that's why everything I self-host is maintained using **docker-compose**. I'm also a big **changelog** fan, and by that I mean I love keeping on top of new improvements, fixes and security updates.

In this post I explain how to introduce [**Renovate**](https://docs.renovatebot.com/) into your docker-compose setup, this allows us to pin docker image versions in our docker-compose but also declare them as dependencies that Renovate will raise pull requests for when a new image is published. This way we can avoid using `:latest` tags, stay up to date but also keep on top of what's new.

We'll then use **GitHub Actions** to SSH into our **Docker** hosts, copy across the updated `compose.yaml` and `docker-compose up -d`. We'll use **Tailscale **and **Tailscale SSH** with ephemeral nodes to enable temporarily connectivity from GitHub's runners into my Home Lab.

### Option #1 (the easy way)

There are a number of ways to keep your self-hosted services (docker images) up-to-date. One is to use a `:latest`  docker tag and have [containrrr/watchtower](https://github.com/containrrr/watchtower) periodically check for new images, pull them and restart your services on a schedule.**This method is perfect for most people in a Home Lab environment.**

> *Watchtower will pull down your new image, gracefully shut down your existing container and restart it with the same options that were used when it was deployed initially.*

### Option #2 (the control freak way?)

**Step 1.**

Commit all of your `compose.yaml` to a git repository, I create a folder for each service that I host.

A quick and easy way to generate **compose.yaml** from your existing running Docker services is to use **ghcr.io/red5d/docker-autocompose***.*

Here is an example that will output **compose.yaml** for all running Docker containers on a single host.

**docker run --rm -v /var/run/docker.sock:/var/run/docker.sock ghcr.io/red5d/docker-autocompose $(docker ps -aq)**

![](https://static.jackpearce.co.uk/images/posts/2023/11/dockercompose.png)docker-compose.yml in GitHub
**Step 2.
[Install Renovate](https://github.com/marketplace/renovate)** to your GitHub Repo. In my `compose.yaml` above as an example, Renovate will detect the docker image `cloudflare/cloudflared:2023.10.0` as a dependancy.

Install the Renovate app and select the repos you would like. For each selected repo, an Onboarding PR will be created. Merge the onboarding PR and from now on Renovate will create new PRs whenever a new image is published to Docker Hub.
![](https://static.jackpearce.co.uk/images/posts/2023/11/cd2f4b90-da7b-4025-94e0-7162b34cb354.webp)
**Step 3.**
Next we'll setup a GitHub action workflow that uses Tailscale SSH to connect to our Docker Host, pushes the updated `compose.yaml` (after merging a PR from Renovate) and updates the running service using `docker-compose up -d`

1. Waits for updates to our `compose.yaml`, a new PR merge from Renovate would trigger this.
2. Spins up an ephemeral Tailscale node and uses Tailscale SSH to SSH into our Docker host.
3. Copies across the new `compose.yaml` to the appropriate directory and runs `docker-compose up -d` so that Docker pulls the new image and replaces the container.

It looks a bit like this:

    name: traefik
    on:
        push:
          paths:
            - traefik/**
            - .github/workflows/traefik.yml
          branches:
            - main
            - dev
    
    jobs:
      deploy-docker:
        runs-on: ubuntu-latest
        steps:
        - uses: actions/checkout@v4
        - name: tailscale
          uses: tailscale/github-action@v2
          with:
            oauth-client-id: ${{ secrets.TS_OAUTH_CLIENT_ID }}
            oauth-secret: ${{ secrets.TS_OAUTH_SECRET }}
            
            version: 1.52.1
        
        - name: docker compose up
          uses: jkpe/docker-compose-tailscale-gitops-action@v1.0.0
          with:
            remote_docker_host: root@100.x.x.x
            tailscale_ssh: true
            compose_file_path: traefik/compose.yaml
            upload_directory: true
            docker_compose_directory: traefik
            args: up -d

.github/workflows/traefik.yml

### Declaring Tailscale as a dependancy

In our GitHub Action we are telling it to use Tailscale version 1.52.1, we can tell Renovate this is a dependancy and Renovate will check for new versions of Tailscale.

Here is an example of `renovate.json` that will look for the version string and compare it against the latest [tailscale/tailscale](https://github.com/tailscale/tailscale) GitHub Release.

    {
      "$schema": "https://docs.renovatebot.com/renovate-schema.json",
      "extends": [
        "config:recommended"
      ],
      "customManagers": [
        {
          "customType": "regex",
          "fileMatch": ["^(workflow-templates|\.(?:github|gitea|forgejo)/workflows)/[^/]+\.ya?ml$"],
          "matchStrings": ["uses: tailscale\\/github-action@v2(?:\\s+.*\\n)*?.*version: (?<currentValue>.*?)\\n"],
          "depNameTemplate": "tailscale/tailscale",
          "datasourceTemplate": "github-releases",
          "extractVersionTemplate": "v(?<version>.*)"
        }
      ]
    }

`renovate.json`

And now we'll get Pull requests with full release notes inline for us to review and then merge, perfect! 🎉
![](https://static.jackpearce.co.uk/images/posts/2023/11/pullrequest.png)
