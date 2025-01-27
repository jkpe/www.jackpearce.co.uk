---
title: Have a lightning fast blog and host it for free using Github Actions and Cloudflare Workers
slug: have-a-lightning-fast-blog-and-host-it-for-free-github-actions-cloudflare-workers
date: 2020-06-07T00:00:00.000Z
excerpt: There are so many ways to build and host a blog for free nowadays. In 2020 I am using Hugo, Github Actions and Cloudflare Workers Sites.
category: "Cloud Architecture" 
---

**Update March 2021:** Cloudflare Pages has been released in beta that replaces the workflow below.

---

There are so many ways to build and host a blog for free nowadays. In 2020 I am using [Hugo](https://gohugo.io/), Github Actions and Cloudflare Workers Sites.

Using Hugo is as simple as writing your content using any text editor in Markdown format, saving as a .md file, selecting a [Hugo compatible theme](https://themes.gohugo.io/) and running the ‘hugo’ command. Your site is then built as html which you can host anywhere you like.

Github Actions is incredibly powerful way to run a workflow on any Github event.

Cloudflare’s CDN is industry leading. Their free tier is incredibly generous and with Cloudflare Workers Sites you place your static content right at their edge with no origin to worry about.

My requirements for hosting a blog in 2020 are:

1. EASY - I don’t want to deploy and manage a server
2. FAST - Wordpress, PHP, MySQL? No thanks
3. FREE - I don’t want to pay for anything but the domain name
4. SECURE - No backend admin panel or zero days
5. MOBILE - I’d like to be able to update my blog posts from my phone

### My Workflow for 2020

Prerequisites are a Github account and a domain added to a Cloudflare account.

1. Github - I take my Hugo project (not the built HTML, the actual Hugo project itself) and commit this to Github

Github Actions - Essentially a virtual machine will spin up and run your code in a matter of seconds with zero configuration on your part. You’re charged for the number of minutes your code takes to execute with 2,000 free minutes a month and each blog update taking approximately 1 minute to run. I setup a GitHub Action that upon committing a change to the repo is going to:

1. Install Hugo
2. Build my site using Hugo
3. Install Cloudflare Wrangler; the CLI for deploying to Cloudflare Workers
4. Generate the config file required to deploy to Cloudflare (API key etc)
5. Deploy the site to Cloudflare’s Edge using Workers

To create a Github Action you must commit your workflow to .github/workflows

Here is what mine looks like at .github/workflows/cloudflare-deploy.yml

    on:
      push:
        branches:
          - master
    
    jobs:
      build:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@master
            with:
              submodules: true
          - name: Install Hugo
            run: sudo snap install hugo
          - name: Install Wrangler
            run: sudo npm i @cloudflare/wrangler -g
          - name: hugo
            run: hugo
          - name: Generate wrangler.toml
            run: ./.github/scripts/generate_wrangler.sh
            env:
              CF_ACCOUNT_ID: $
              CF_ZONE_ID: $
          - name: wrangler publish
            run: CF_EMAIL=$ CF_API_KEY=$ wrangler publish
    

You’ll notice there are 4 environmental variables being called here:

- CF_ACCOUNT_ID
- CF_ZONE_ID
- CF_EMAIL
- CF_API_KEY

These are stored as Github secrets under the repository. If your Github repository is private then you don’t need to use variables and secrets, mine is public however and it’s good practice anyway. We’ll need to commit a script that runs as part of the action, it generates wrangler.toml which is used by Cloudflare Wranger for configuration, this contains your Cloudflare account ID and zone ID for the domain which we may not want in a public repository.

Commit the file to .github/scripts/generate_wrangler.sh, it contains:

    #!/bin/sh
    
    # Generate wrangler.toml using secret variables
    
    cat > wrangler.toml <<- EOM
    name = "jkpenet"
    type = "webpack"
    account_id = "$CF_ACCOUNT_ID"
    workers_dev = false
    route = "jkpe.net/*"
    zone_id = "$CF_ZONE_ID"
    
    [site]
    bucket = "./public"
    entry-point = "jkpenet"
    EOM
    

‘route’ tells Cloudflare where to put your site domain.com/* will be at the root. You’ll need to create a dummy DNS record for the root of your domain such as an A record for ‘192.0.2.1’.

That’s it!

Commit a new post to Github, usually content/posts and Github Actions will go away and build your site and send it to Cloudflare’s network.
