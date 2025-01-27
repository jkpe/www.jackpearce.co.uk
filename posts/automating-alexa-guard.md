---
title: Automating Alexa Guard
slug: automating-alexa-guard
date: 2019-05-15T00:00:00.000Z
category: "Home Automation"
---

**Update:** I am now using the [alexa_media_player](https://github.com/keatontaylor/alexa_media_player) integration.

Amazon released a new feature for it’s Echo devices called “Alexa Guard”

To get Alexa Guard working in the UK I had to reset my Echo Dot and link it to a new account registered on amazon.com (instead of .co.uk). You can set your device location, language, time zone all back to UK with the new account and Alexa Guard continues to work.

> **Get Smart Alerts:** Alexa can send you Smart Alerts, via phone notifications, if your Echo device detects the sound of smoke alarms, carbon monoxide alarms, or glass breaking. Play the detected sound from your Alexa app, or Drop In on your Echo remotely to investigate what’s happening.

To activate Alexa Guard you say “Alexa, I’m leaving” and to deactivate “Alexa, I’m home”, but who would remember to do this?

[Home Assistant](https://www.home-assistant.io/) is open source home automation. I setup a simple, albiet silly automation.

1. iOS app detects I have left home

2. Triggers automation; Text-to-Speech (TTS) service runs and my Google Home says “Alexa, I’m leaving”

3. Alexa Guard is activated
