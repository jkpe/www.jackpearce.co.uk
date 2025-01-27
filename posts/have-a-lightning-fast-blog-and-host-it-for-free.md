---
title: Have a lightning fast blog and host it for free
slug: have-a-lightning-fast-blog-and-host-it-for-free
date: 2014-01-17T00:00:00.000Z
excerpt: I recently migrated my blog from Wordpress to Silvrback to Ghost. I was very happy with Silvrback, it’s an excellent writing platform. In the end I got fed up not being able to change how my site looked (no theming), so switched to Ghost.
comments: false
category: "Cloud Architecture" 
---

💡 **This post is very old now and the information below may well be inaccurate.**

I recently migrated my blog from Wordpress to [Silvrback](https://dsowers.silvrback.com/introducing-silvrback) to [Ghost](http://ghost.org/). I was very happy with Silvrback, it’s an excellent writing platform. In the end I got fed up not being able to change how my site looked (no theming), so switched to Ghost.

I’m a bit of an uptime and performance freak. This website is relatively lightweight and performs well in most situations. I wanted to ensure it performed the best it ever could and sustained 100% uptime. Ghost isn’t difficult to setup on your own server but there are so many advantages to hosting a static site vs one that is dynamically generated server side with a database backend. Nor did I want to pay for a hosted solution once I discovered you can host your static site for free using [GitHub Pages](http://pages.github.com/).

## Static Ghost

Enter [Buster](https://github.com/axitkhurana/buster). Buster is a static site generator for Ghost. There are many reasons you might want a static site

- Host it anywhere
- No database dependancy
- Better performance
- Easy to backup
- Far more secure, no admin backend

Getting Buster [setup](http://www.metacotta.com/ghost-static-site-generation-with-buster/) was easy and in 10 minutes I had a static copy of my then hosted Ghost blog. You can actually target any Ghost blog hosted on any server with Buster, it’s quite powerful.

## GitHub Pages

Before you `buster deploy` you’ll want to setup a GitHub account (free) if you don’t already have one and then configure a GitHub Pages respository (also free) as per [instructions here.](http://pages.github.com/) Make sure you follow the guide on [configuring a custom domain](https://help.github.com/articles/setting-up-a-custom-domain-with-pages) before you make and DNS changes.

## My Workflow

I have a locally hosted copy of Ghost running on my Macbook and I target this using Buster. [Getting Ghost up and running locally](http://docs.ghost.org/installation/) is very simple. The great thing about having a local install of Ghost is that I can publish posts before I’m finished, make styling changes etc and preview what they look like on the site before statically generating the updated version and pushing that to GitHub. I store my Ghost installation in my Dropbox along with the static files.

1) [http://127.0.0.1:2368/ghost](http://127.0.0.1:2368/ghost)
2) Write post 
3) buster generate –domain=http://127.0.0.1:2368 
4) buster deploy

## Performance

GitHub sits behind the [Fastly CDN.](https://www.fastly.com/) You may not of heard of Fastly but they CDN for the likes of Twitter, Disqus, The Guardian, Shazam. Converting your site to static files and hosting with GitHub Pages will guarentee to improve performance. My site’s load time before I moved was 1.6s. My site now loads in just over 330ms.
![Pingdom test](https://i.imgur.com/vxw9bsP.png)
Make the switch today. [Loads](http://alexcican.com/post/guide-hosting-website-dropbox-github/)[of](http://sirupsen.com/the-switch-to-github-pages)[people](http://hpehl.info/moved-blog-to-github-pages.html)[are](http://jtimberman.housepub.org/blog/2011/09/29/blog-moved-to-github-pages/)[moving](http://ocramius.github.io/blog/moving-my-blog-to-jekyll/)[to](http://www.alexrothenberg.com/2011/01/27/moved-blog-to-jekyll-and-github-pages.html)[static.](http://hugogiraudel.com/2013/02/21/jekyll/)

## Amazon S3 + CloudFront

If you don’t feel comfortable hosting your website for free then I’d highly recommend reading Paul’s[“How To: Hosting on Amazon S3 with CloudFront”](http://paulstamatiou.com/hosting-on-amazon-s3-with-cloudfront/). Paul’s site is built using Jekyll 1, as are most blogs hosted on GitHub Pages, but you can follow pretty much everything he does to get your Buster generated static blog online.

1. Buster is built from Jekyll

{{< rawhtml >}}
  <div id="disqus_thread"></div>
  <script>
    (function() { 
    var d = document, s = d.createElement('script');
    s.src = 'https://kerneldump.disqus.com/embed.js';
    s.setAttribute('data-timestamp', +new Date());
    (d.head || d.body).appendChild(s);
    })();
  </script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
{{< /rawhtml >}}