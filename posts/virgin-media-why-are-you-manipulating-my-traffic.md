---
title: Virgin Media, why are you manipulating my traffic?
slug: virgin-media-why-are-you-manipulating-my-traffic
date: 2014-01-04T00:00:00.000Z
excerpt: Virgin Media why does www.google.com resolve to host-62-253-8-99.not-set-yet.virginmedia.net? What a funny name for a PTR record, but seriously, why are you manipulating my traffic?
comments: false
category: "Home Lab"
---

💡 **This post is very old now and the information below may well be inaccurate.**

🤔 **6th April 2014:** TalkTalk [appear](https://gist.github.com/Joev-/0e3cc1a3b613c54d97bb) to be doing something similar

🤓 **7th April 2014:** [Plusnet](http://equk.co.uk/2014/04/07/uk-isps-providing-cdn-for-google/) are doing it too. The responses to my post have hightlighted that using DNSCrypt + OpenDNS doesn’t allow you to opt out of this behaviour which suggests a deal between the ISPs, Google and OpenDNS has been made.

---

Virgin Media why does *[www.google.com](http://www.google.com/) resolve to host-62-253-8-99.not-set-yet.virginmedia.net*? What a funny name for a PTR record, but seriously, why are you manipulating my traffic?

I was testing something only to find that google.com, google.co.uk both resolve to an IP address owned by Virgin Media.

    PING google.com (62.253.3.103): 56 data bytes 64 bytes from 62.253.3.103: icmp_seq=0 ttl=58 time=17.569 ms
    
    nslookup www.google.com Server: 208.67.222.222 Address: 208.67.222.222#53 Non-authoritative answer: Name: www.google.com Address: 62.253.3.103
    
    host 62.253.3.103 103.3.253.62.in-addr.arpa domain name pointer host-62-253-8-103.not-set-yet.virginmedia.net.

Performing a `dig a google.com +trace` fools me into thinking that ns1.google.com is dishing out these Virgin owned IPs, yet a query from elsewhere tells me otherwise.

**Using Virgin Media**

    dig a google.com @ns1.google.com
    ;; ANSWER SECTION: google.com. 300 IN A 62.253.3.99 
    google.com. 300 IN A 62.253.3.93 
    google.com. 300 IN A 62.253.3.109 
    google.com. 300 IN A 62.253.3.103 
    google.com. 300 IN A 62.253.3.119 
    google.com. 300 IN A 62.253.3.94 
    google.com. 300 IN A 62.253.3.118 
    google.com. 300 IN A 62.253.3.108 
    google.com. 300 IN A 62.253.3.84 
    google.com. 300 IN A 62.253.3.88 
    google.com. 300 IN A 62.253.3.98 
    google.com. 300 IN A 62.253.3.123 
    google.com. 300 IN A 62.253.3.113 
    google.com. 300 IN A 62.253.3.114 
    google.com. 300 IN A 62.253.3.104 
    google.com. 300 IN A 62.253.3.89
    

**Another ISP**

    dig a google.com @ns1.google.com
    ;; ANSWER SECTION: google.com. 300 IN A 74.125.136.113 
    google.com. 300 IN A 74.125.136.100 
    google.com. 300 IN A 74.125.136.102 
    google.com. 300 IN A 74.125.136.138 
    google.com. 300 IN A 74.125.136.101 
    google.com. 300 IN A 74.125.136.139
    

Most odd. Especially seeing as I **do not use Virgin Media’s DNS resolvers**, I use OpenDNS.*m7.lon.opendns.com* to be exact, according to [www.dnsleaktest.com](http://www.dnsleaktest.com/). [OpenDNS’ cache check](http://cachecheck.opendns.com/) matches my other ISP, a whole bunch of IPs none of which are anywhere near this 62.253.3.0/24 we’re seeing from Virgin Media.

So for some reason Virgin Media someone is manipulating the DNS response I recieve from OpenDNS’ 208.67.222.222, 208.67.220.220 for google.com, google.co.uk and possibly other domains. They’re also proxying google.com to me as loading [http://62.253.3.103](http://62.253.3.103/) in a web browser shows me Google’s home page, creepy. Ok so where does a traceroute take me?

> *traceroute: Warning: google.com has multiple addresses; using 62.253.3.93 traceroute to google.com (62.253.3.93), 64 hops max, 52 byte packets*

- 1 192.168.1.1 (192.168.1.1) 4.610 ms 4.257 ms 34.474 ms
- 2 cpc10-sotn8-2-0-gw.15-1.cable.virginm.net (81.101.98.1) 22.904 ms 79.800 ms 14.122 ms
- 3 sotn-core-2a-ae6-610.network.virginmedia.net (80.4.225.53) 13.692 ms 12.621 ms 11.575 ms
- 4 popl-bb-1c-ae14-0.network.virginmedia.net (62.253.175.30) 33.107 ms 16.609 ms 27.541 ms
- 5 brnt-bb-1c-et-000-0.network.virginmedia.net (62.253.175.238) 28.404 ms brnt-bb-1c-et-510-0.network.virginmedia.net (62.253.175.242) 15.146 ms 25.651 ms
- 6 haye-icdn-1-ae0-0.network.virginmedia.net (62.253.174.242) 14.849 ms 16.701 ms 16.381 ms
- 7 * * *
- 8 * * *

Most interesting that it stops here: *haye-**icdn**-1-ae0-0.network.virginmedia.net (62.253.174.242)*

**haye-icdn-1, what do you do?** A quick google (ironic) reveals [this thread](http://www.cableforum.co.uk/board/12/33694218-virgin-hijacking.html) titled ‘Virgin hijacking’. One user suggests:

> Content Distribution Network ran by Virgin to try and speed things up. It’s not really hijacking, per-se and if it worked, it would actually be a good thing. The problem is, it’s heavily congested so has the opposite effect.

….

I have no idea why Virgin and OpenDNS feel the need to proxy or CDN google.com for me. The ping response time to one of Google’s actual IPs is 20.049 ms. From now on I will encrypt my DNS traffic to OpenDNS using [DNSCrypt](http://dnscrypt.org/) and one of the suggested DNS providers, it takes 5 seconds to install their app.

Ahh, that’s better :-)

---

## Some Notes

- My Virgin SuperHub is in modem mode
- It’s entirely possible Virgin Media has struck a deal with OpenDNS however I couldn’t find mention of that anywhere and it seems unlikely. The responses to this post have led me to believe some deal has been made.


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
