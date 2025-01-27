---
title: Investigating the dirty world of phishing emails
slug: investigating-the-dirty-world-of-phishing-emails
date: 2014-01-22T00:00:00.000Z
comments: false
category: "Cloud Architecture"
---

The other day I was having a quick look through my Gmail spam folder and a particular email caught my eye. “Your NatWest CreditCard Online Statement is Ready Online”. Gmail warned me about the message. That they couldn’t verify it had been sent from natwestsecure.com and disabled all images and links. I was intruiged to know what would happen if I did click the link and also exactly where they were hosting this phishing site. Was it cheap shared hosting, or even a dedicated box?

I told Gmail the email was not spam, that allowed me to see both the images and the link.
![Natwest Phishing email](https://i.imgur.com/htEICTg.png)
Hovering my mouse over the link I could see it would in fact take me to

        http://informacja.wimbp.lodz.pl/cache/fr.php
    

## Who hosts this?

First let’s do a WHOIS on lodz.pl.

        DOMAIN NAME: lodz.pl 
        registrant type: organization 
        nameservers: dns2.man.lodz.pl. 
        dns4.man.lodz.pl. dns.man.lodz.pl. ns1.tpnet.pl. 
        created: 1995.01.01 12:00:00 
        last modified: 2004.08.06 09:57:55 
        renewal date: 2014.12.31 13:00:00 
        option created: 2012.11.16 08:03:07 
        option expiration date: 2015.11.16 08:03:07 
        dnssec: Unsigned
    

Hmm. Their own vanity nameservers plus the domain was registered in 1995. Certainly doesn’t look how I’d expect it to look. Ok, let’s check out the website itself.

> Lodz, the former textile industry empire, today is a city of modern technologies, creative enterprises and grand events.

The website looks real, the official website of the city Lodz in Poland. How about``

> Department of Information Science WiMBP in Lodz

That looks genuine too.

I notice the site is running off the CMS Joomla.

        <meta name="generator" content="Joomla! 1.5  
        - Open Source Content Management" />
    

What’s the bet 1.5 isn’t the latest version? [Nope](http://docs.joomla.org/What_version_of_Joomla!_should_you_use%3F). According to Joomla’s documentation 1.5 went EOL Sept 2012, all security updates for that version have stopped. I think it’s [safe to assume](http://www.cvedetails.com/vulnerability-list/vendor_id-3496/cvssscoremin-5/cvssscoremax-5.99/Joomla.html) that /cache/fr.php has been planted there by an attacker. What happens when we visit that site? A quick CURL reveals something interesting.

        HTTP/1.1 302 Found
        Date: Wed, 22 Jan 2014 20:28:00 GMT
        Server: Apache
        X-Powered-By PHP/5.3.1
        Location: http://www.remart.com.ua/logs/index.html
        Content-Type: text/html
    

A 302 redirect to http://www.remart.com.ua/logs/index.html

A WHOIS on remart.com.au revleals a similar situation to lodz.pl. The domain was created in 2011 and the site itself appears genuine, a sort of high-end home repairs company. OK, let’s check the headers.

        <meta name="generator" content="Joomla! 1.5  
        - Open Source Content Management" />
    

There’s a theme appearing here isn’t there? Let’s visit that site in a browser.
![NatWest Phishing site](https://i.imgur.com/HkLt0Dw.png)
The source code reveals that nearly all of the site’s elements (CSS, JS) are being loaded from the natwest.com domain itself. The footer says Copyright 2005-2009, perhaps this is some old source code they stole? A quick visit to [NatWest actual site](https://cardservices.natwest.com/RBSG_Consumer/Login.do?promoCode=NatWest) shows that it potentially isn’t old as even their own website has Copyright 2005-2009 in the footer.

Interestingly at the bottom of the source code we see some javascript for Adobe’s analytics service SiteCatalyst.

        <!-- SiteCatalyst code version: H.23.3.  
        Copyright 1996-2011 Adobe, Inc. All Rights Reserved  
        More info available at http://www.omniture.com -->  
        <sript language="JavaScript" type="text/javascript"><!--  
        var s_account="tssprodrbsgnatwestconsumer"  
        var linkInternalFiltersPage="javascript:" + window.location.hostname
    	+ ",testdomain.com"  
        //-->
    

The `var s_account="tssprodrbsgnatwestconsumer"` string matches what is on NatWest.com. The attackers obviously weren’t smart enough to strip this out. I’ve never used Adobe SiteCatalyst before but NatWest *should* be able to see this dodgy domain showing up in their statistics.

I’m now fairly certain the two sites involved in hosting the phishing site do not know they’re hosting it. How about the email, where did that originate from?

## The Email

        Return-Path: 
        Received: from servhotel1.automerkit.fi (servhotel1.automerkit.fi. 
        [80.69.163.62])
        Received-SPF: pass
        (google.com: best guess record for domain of
        www-data@servhotel1.automerkit.fi
        designates 80.69.163.62 as permitted sender)
    

That’s odd, the SPF passes. There’s even a PTR record on 80.69.163.62.

WHOIS again. Created: 2010. Desc: Interactive Auto Media Oy

automerkit.fi another genuine website? Yep! Looks to be a Finnish car enthusiast site.

## What we’ve learnt

Whoever is sending these phishing emails has compromised three separate systems, I assume, to avoid being caught. They’ve compromised somebody’s email system with working SPF and PTR record to try and make their way into your inbox. Fortunately their efforts have failed, at least they do if you use Gmail & Google Chrome.

Gmail knew the email was dodgy and sent it straight to Spam:
![Gmail phishing detection](https://i.imgur.com/EZLlNmL.png)
Google Chrome knew that both links were dodgy:
![Google Chrome phishing detection](https://i.imgur.com/313tPhl.png)
Morale of the story. If you’re a web developer, don’t leave your site running on old versions of any CMS. Be that Joomla, Wordpress. If you’re really serious about security or don’t have the time to keep it patched, publish your site as static files, if possible. Lock down access to your servers using secure passwords, [two factor authentication](http://blog.authy.com/two-factor-ssh-in-thirty-seconds) and ideally [access lists](https://www.dome9.com/) too. Follow some [simple steps](https://www.vircom.com/security/top-10-tips-to-secure-your-email-server/) to locking down that SMTP server too.

Because I’m a good citizen I forwarded the phishing email to [phishing@natwest.com](mailto:phishing%40natwest.com) and notified the website owners of the two pages. I also emailed the owner of automerkit.fi to let them know their servers were spamming.
