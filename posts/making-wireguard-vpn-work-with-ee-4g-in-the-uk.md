---
title: Making Wireguard VPN work with EE 4G in the UK
slug: making-wireguard-vpn-work-with-ee-4g-in-the-uk
date: 2019-07-16T00:00:00.000Z
excerpt: For the past couple of months I have been running a permanent VPN on my iPhone.
category: "Home Lab"
---

For the past couple of months I have been running a permanent VPN on my iPhone. There are a number of advantages:

- EE can’t log my browsing history
- Ad Blocking using Pi-Hole
- I can access my home LAN as if I were on my WiFi, wherever I am

Occasionally I’ll leave the house and the Wireguard app will activate my VPN but the VPN won’t actually connect, it just sits there. Toggling the VPN on/off usually causes it to connect. Or frustratingly I’ll be out and about and the VPN will refuse to work unless I toggle VPN.

[A number of people](https://github.com/trailofbits/algo/issues/1385) have reported similar behaviour on the T-Mobile network in the states when transitioning from Wi-Fi to 4G/LTE, presumably they use the same IPv6 to IPv4 NAT technology that appears to contribute to the problem.

There is a fix (workaround?) to this and that is to force EE to use IPv4 only. I believe I only experience this problem because my WireGuard endpoint is IPv4.

1. Download and install [this profile](https://gist.githubusercontent.com/jkpe/adb9ff6c191988b8ee55ea59aaacdd41/raw/5472e3cc953b77ee63961a891f0638556a95dd52/EE%2520APN%2520IPv4.mobileconfig) to your iPhone. You can view the source code of the profile before installing [here](https://gist.github.com/jkpe/adb9ff6c191988b8ee55ea59aaacdd41)
2. Toggle airplane mode
3. Enjoy Wireguard without frequent network connectivity problems!

Thanks to [Duncan](https://blog.dotsmart.net/2019/04/03/solved-connecting-to-an-l2tp-ipsec-vpn-on-ee/) for creating the profile.
