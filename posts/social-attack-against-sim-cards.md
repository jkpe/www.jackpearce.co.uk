---
title: Social attack against Subscriber Identity Module (SIM cards)
slug: social-attack-against-sim-cards
date: 2014-08-06T00:00:00.000Z
comments: false
category: "Cloud Architecture"
---

A number of attacks on high profile individuals that have made the news recently are of a social nature more so than a vulnerability in a certain software’s code. [Mat Honan](http://www.wired.com/2012/08/apple-amazon-mat-honan-hacking/all/) perhaps being one of the most well known cases.

> [*In the space of one hour, my entire digital life was destroyed.*](http://www.wired.com/2012/08/apple-amazon-mat-honan-hacking/all/)

Two factor authentication is being used by more as different services begin to support it, but it won’t make you entirely hack-proof. Matthew Prince, CEO of Cloudflare was the victim of an attack where by somebody socially engineered AT&T to redirect Matthew’s voicemail to a number the attacker owned at which point two factor authentication in the way he had it setup became useless.

**SIM card replacement, a new kind of vulnerability**

This leads me onto an attack method that I would like to share. If somebody were determined enough, it would be incredibly quick and easy to visit a network carrier’s store, present a fake ID and have them issue a new SIM card that replaces the old and immediately have access to your phone number. The important thing to note here is that they will hand you the physical SIM card replacement in the store near immediately disabling the original SIM card. The victim’s phone would lose signal but it could be days before they realise what has happened. I can’t imagine any of the other well known network carriers have more stringent security checks than asking for ID, in this case I was told a debit card with my name on it would have been enough.

**How to protect yourself**

In some cases you can setup two factor authentication in a way that it does not use your phone number to issue codes or account recovery, in these cases you should almost always use an app such as [Authy](https://www.authy.com/). Authy will backup your two factor tokens in an encrypted manner too.

Google

> *We’ll use your phone to do things like challenge hijackers or to send you a text message to help you access your account if you forget your password.*

On Google’s account recovery page we see the above text and the option to provide a phone number, don’t. On their 2-step Verification page you have the option of adding backup phone numbers for when you cannot access your primary way of receiving codes such as Authy, do not set a backup number.

Dropbox

Their settings page allows you to set a backup phone number in case you lose access to your two factor authentication device, don’t set this.

Tumblr

On your account settings page under Two Factor Authentication switch off SMS and switch on ‘Generate code via authenticator app’

These are just a few examples of how you can better protect yourself when using two factor authentication. Two factor authentication itself adds massive amounts of security to your accounts and in most instances using SMS or phone calls for code generation is secure enough however if you want to take it that one step further I would recommend relying on Authy or [Yubikey](http://www.yubico.com/) + [myotp.net](https://myotp.net/)
