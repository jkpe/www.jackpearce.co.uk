---
title: Sky Broadband - Transparent DNS proxy
slug: sky-broadband-transparent-dns-proxy
date: 2019-05-14T00:00:00.000Z
comments: false
excerpt: Unfortunately this means they now proxy all your DNS traffic using a transparent DNS proxy, regardless of what DNS resolver you have set on your client.
category: "Home Lab"
---

As of April 2019 Sky Broadband have started rolling out firmware (2.09.2510.R and newer) to all their routers to add support for the “Sky Broadband Boost” add-on.

> **Broadband Buddy** – Customers can manage their family’s screen time in & out of their home via the Sky Buddy app (iOS and Android); even “*pause the internet*”. The app allows parents to monitor family online internet usage, including internet history. It also includes location tracking. Parents will be notified on their own device if children uninstall Sky Buddy.

Unfortunately this means they now **proxy all your DNS traffic** using a transparent DNS proxy, regardless of what DNS resolver you have set on your client.

I.e you may have Cloudflare’s 1.1.1.1 configured on your local device, DNS requests will still be answered by Sky. If you’re a Sky Broadband customer you can confirm this yourself here: https://www.dnsleaktest.com/

Is this a problem? It can be if you use “Smart DNS” services that allow you to watch streaming services only available in certain countries or if you simply don’t want your ISP logging which sites you visit.

DNS is unencrypted, this is why it can be so easily intercepted.

A number of well known public recursive DNS resolvers support encrypted DNS via DNS over TLS, DNS over HTTPS or DNSCrypt. [Clients](https://dnscrypt.info/implementations/) exist for Mac OS, iOS, Windows.

I like to use Cloudflare, they support both DNS over TLS and DNS over HTTPS.

If you already have a Raspberry Pi on your network you’re likely already utilizing Pi-hole for excellent ad blocking and DNS analytics, **implementing encrypted DNS is easy**, follow [these instructions](https://docs.pi-hole.net/guides/dns-over-https/)

If you have a router running OpenWRT setting up encrypted DNS is easy:

1. Install luci-app-unbound and it’s dependancies
2. In the [GUI](http://openwrt.lan/cgi-bin/luci/admin/services/unbound/zones) add a new zone

- Zone Type: Forward
- Zone Names: .
- Servers: 1.0.0.1, 1.1.1.1
- DNS over TLS: Yes
- TLS Name Index: cloudflare-dns.com
