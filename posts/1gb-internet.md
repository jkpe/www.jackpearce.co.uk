---
title: 1Gb Internet at home - Cuckoo broadband & Ubiquiti Dream Machine
slug: 1gb-internet
date: 2023-03-01T00:00:00.000Z
excerpt: I recently switched from using a HP T730 Thin Client running OPNsense as my home router to something more 'off the shelf'... a Ubiquiti Dream Machine Special Edition. My OPNsense router ran absolutely fine and I absolutely loved the reliability and performance it gave me.
category: "Home Lab"
---

I recently switched from using a HP T730 Thin Client running OPNsense as my home router to something more 'off the shelf'... a Ubiquiti Dream Machine Special Edition. My OPNsense router ran absolutely fine and I absolutely loved the reliability and performance it gave me.

## So why switch?

* I am a sucker for Ubiquiti's hardware and software experience
* I am moving house soon so will want an NVR + Cameras
* I'm a networking nerd so having my own rack with 1U switches is pure excitement
* Dream Machine OS 3.x now supports client VPN routing (my main reason for using OPNsense)

## The issue with UK FTTP

I delve into a bit of a rabbit hole switching to the UDM SE. My property supports Openreach FTTP, this means there is a fibre cable entering my property terminating at a BT ONT which then converts this to ethernet for your ISP router to connect to (or in my instance the UDM SE). However, running a few speed tests both from the UDM itself and my laptop that is wired to the UDM I am hitting 330-350Mbps when I was previously able to hit 900Mbps+.

### PPPoE sucks

To aid in troubleshooting I connected my laptop directly to the BT ONT and established a PPPoE connection. I ran a speed test and was able to hit 900Mbps.
Having done some research it would appear that all UK ISPs apart from Sky and TalkTalk Residential use PPPoE to authenticate/establish a connection via the BT ONT, unfortunately this introduces some overhead and slowness. 

### Ubiquiti sucks?

There is a [30 page thread](https://community.ui.com/questions/ETA-on-bugfix-for-UDM-Pro-bad-PPPoE-performance/9119aa98-412f-41c7-9188-a30036c2e4c2?page=30) on Ubiquiti's community discussing a PPPoE 'bug' affecting the UDM and even on recent firmware versions this still appears to be the case.

### My ISP sucks?

My ISP is [Cuckoo](https://www.cuckoo.co). I chose them because they had a relatively short contract term (12 months) and only a £60 early exit fee, which meant I could switch to another provider with relative ease in the future. I have been happy with Cuckoo however they are partnered with TalkTalk Business which means... they're using PPPoE.

## The fix

It would appear the combination of a UDM, Cuckoo and PPPoE is just a bad mix, there are 2x ways to fix this problem.

1. Ask Cuckoo for a free router, have that terminate the PPPoE connection and the uplink this to my UDM.
2. Switch to TalkTalk Residential or Sky Broadband who use DHCP and not PPPoE, this is the option I will opt with.

## Goodbye Cuckoo

Cuckoo, you have been an excellent provider but our time has now come to an end through no fault of your own. Thanks for the consistently good performance.
