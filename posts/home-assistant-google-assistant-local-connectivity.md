---
title: Home Assistant / Google Assistant local connectivity
slug: home-assistant-google-assistant-local-connectivity
date: 2022-10-08T12:58:46.000Z
category: "Home Automation, Home Lab"
---

Historically if you integrated Google Assistant with Home Assistant every time you asked "Hey Google, switch the light off" your Google device would do this:

"Hey Google" > Google Cloud > Public Internet > Home Assistant

We want it to do this:

"Hey Google" > Home Assistant

Assuming you already have the `google_assistant:` integration setup 

1. Open the project you created in the [Actions on Google console](https://console.actions.google.com/).
2. Click `Develop` on the top of the page, then click `Actions` located in the hamburger menu on the top left.
3. Upload `app.js` from [here](https://github.com/NabuCasa/home-assistant-google-assistant-local-sdk/releases/latest) for both Node and Chrome by clicking the `Upload Javascript files` button.
4. Add device scan configuration:
5. Click `+ New scan config` if no configuration exists
6. Select `MDNS`
7. Set `MDNS service name` to `_home-assistant._tcp.local`
8. Click `Add field`, then under `Select a field` choose `Name`
9. Enter a new `Value` field set to `.*\._home-assistant\._tcp\.local`
10. Check the box `Support local query` under `Add capabilities`.
11. `Save` your changes.
12. Either wait for 30 minutes, or restart all your Google Assistant devices.
13. Restart Home Assistant Core.
14. With a Google Assistant device, try saying “OK Google, sync my devices.” This can be helpful to avoid issues, especially if you are enabling local fulfillment sometime after adding cloud Google Assistant support.

Alternatively, [Home Assistant Cloud](https://www.home-assistant.io/cloud/) will configure this all for you automatically
