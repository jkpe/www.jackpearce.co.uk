---
title: "Home Assistant Yellow: 5 Months Later"
slug: home-assistant-yellow-review
date: 2023-12-07T06:27:00.000Z
excerpt: My review of the Home Assistant Yellow 5 having used it for 5 months.
category: "Home Automation, Home Lab"
---

### What is Home Assistant Yellow

Home Assistant Yellow is a compact, powerful, and privacy-focused smart home hub designed to run Home Assistant, an open-source home automation platform. It is built on top of the Raspberry Pi Compute Module 4 and features a Zigbee radio for direct communication with smart home devices. The device aims to provide a more user-friendly and accessible way for users to control and automate their homes while ensuring data privacy and local control without relying on cloud services.

### Why not use a Raspberry Pi 4?

Using a Raspberry Pi 4 for home automation is indeed a popular choice, but Home Assistant Yellow offers some specific advantages:

1. **Integrated Zigbee Radio**: Home Assistant Yellow includes a built-in Zigbee radio.
2. **Console Access**: Easily access console output, great for troubleshooting
3. **Plug-and-Play Experience**: For users who prefer a more straightforward setup, Home Assistant Yellow offers a more plug-and-play experience compared to setting up Home Assistant on a Raspberry Pi 4 from scratch.
4. **Compact and Unified Design**: It has a more compact and unified design compared to a Raspberry Pi setup with built-in NVMe slot and Zigbee radio.

### My Review of the Home Assistant Yellow

I purchased the Home Assistant Yellow from Seeed on 23 June 2023 it shipped from China to the UK and arrived on 28th June.

I opted for the PoE model that came with a Raspberry Pi Compute Module 4. At the time the only online retailer with CM4 in stock was Seeed.

Initially I installed a Samsung 980 500 GB NVMe however the Yellow would crash every few days with no output at console when I tried to debug. Randomly [some NVMes are known](https://yellow.home-assistant.io/faq/#which-ssds-are-not-supported) to have issue with the CM4 board. I switched to a Crucial P3 500GB NVMe and have had no issues since.

**Setup and Configuration**:

Setting up the Home Assistant Yellow was relatively straightforward, especially compared to a traditional DIY Raspberry Pi project. I simply slotted in the NVMe drive, powered up the unit, and the device automatically initiated the installation of Home Assistant OS. No manual input or intricate procedures were necessary; it was a hands-off experience that had the smart home hub up and running in no time.

**Compatibility with Devices**:

My smart home ecosystem contains a diverse range of Zigbee devices, and Zigbee2MQTT has worked flawlessly. As migrating to the Yellow required me to re-pair all my Zigbee devices I did try ZHA initially but found weird bugs such as:

- Colour bulbs would pair as White ambient (the same model of bulb would pair with different features?!)
- Lots of devices were unsupported

 I've successfully integrated lights, sensors, switches. My devices consist of:

- Philips Hue bulbs. You can get cheaper bulbs such as IKEA however I personally believe Hue bulbs are worth the extra money due to their ability to recover from power outages much faster. IKEA bulbs will drop off the network and stay off for far longer, Hue recovers instantly.
- Linkind Water sensors
- IKEA buttons and motion sensors
- Develco smoke alarms, Electricity Meter
- Sonoff relays
- SmartThings smart plugs
- Xiaomi Light switches, Motion sensors, radiator TRVs

**Performance Review**:

Since switching to a Crucial P3 500GB NVMe, the Home Assistant Yellow has been incredibly stable, running 24/7 without a single hiccup. Response times are quick, and I haven't noticed any lag, even with complex automations.

**Final Thoughts**:

The Home Assistant Yellow is a robust and compact hub that caters well to enthusiasts and newcomers alike. Its plug-and-play nature, combined with the open-source flexibility of Home Assistant, makes it a standout option in the smart home market. The built-in Zigbee radio and the ease of console access are features that truly set it apart from using a Raspberry Pi 4.

While there was a hiccup with the initial NVMe compatibility, the unit has run without fault after switching to a compatible drive. Users should be aware of potential compatibility issues with certain NVMe drives and prepare to troubleshoot or choose a known compatible option like the Crucial P3.

**Conclusion**:

Overall, the Home Assistant Yellow has impressed me with its capabilities and reliability. It's a smart choice for anyone looking to take their smart home to the next level while maintaining data privacy and control. I look forward to future updates from the Home Assistant team and the growing list of integrations and automations that this hub can support.
