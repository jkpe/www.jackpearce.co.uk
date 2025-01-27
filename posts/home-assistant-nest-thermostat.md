---
title: Home Assistant - Nest Thermostat
slug: home-assistant-nest-thermostat
date: 2019-07-15T00:00:00.000Z
category: "Home Automation"
---

**Update:** Home Assistant now has a native integration for Nest

On 16th May 2019 Nest (Google) announced they will retire the Works with Nest program at the end of August. They’ve since changed their mind and now this only affects new users.

Despite saying they will continue to support existing users it is still to this day impossible to sign up as a developer on the Nest developer site.

I’ve wanted to integrate my Nest Thermostat with my Home Assistant instance for a while but because of these changes have been unable to do so. I did sign up as a developer and had generated API credentials last year but have since misplaced them.
I have however found a workaround to this problem and that is [Wink](https://www.home-assistant.io/components/wink/).

We can use Wink to act as a proxy between us and Nest until they decide to allow new developers or create a new development platform under Google.

All of the instructions you’ll need are right [here](https://www.home-assistant.io/components/wink/), but here’s a brief step by step:

1. Sign up as a [developer](https://developer.wink.com/). It doesn’t matter which email you use, it doesn’t have to match the email used to sign up in the Wink app. I signed in using Github.
2. Create a new app in their developer portal, Name, Website can be whatever you like. Be sure to set redirect URI to http://192.168.1.5:8123/auth/wink/callback where 192.168.1.15:8123 matches your Home Assistant instance
3. Add the wink integration to Home Assistant. That’s as easy as adding this to configuration.yaml:

    wink:

1. Restart Home Assistant and you’ll see the configurator for Wink, if you configure Lovelace manually go to /dev-state and look for it there instead.
2. Download the Wink app to your phone and add your Nest Thermostat. You’ll be asked be passed to Nest’s website and asked to allow Wink as a “Works with Nest” integration.
3. Restart Home Assistant, you’ll now see your Nest Thermostat under /dev-state, enjoy!

If you want to build a sensor for just the current temperature, we’d use a Sensor template like this:

    - platform: template
      sensors:
        nest_thermostat_hallway_temperature:
          friendly_name: "Nest Hallway Temperature"
          unit_of_measurement: '°C'
          value_template: "{ state_attr('climate.home_hallway_thermostat_hallway_nest', 'current_temperature') }"
