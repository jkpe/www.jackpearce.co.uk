---
title: Using Trooli FTTP with a Ubiquiti Dream Machine (IPv6)
slug: trooli-fttp-ubiquiti-dream-machine-pppoe
date: 2024-08-25T00:00:00.000Z
excerpt: A technical guide for configuring a Ubiquiti Dream Machine to work with Trooli's FTTP service in the UK, including steps to obtain PPPoE credentials and set up IPv6 connectivity by bypassing the provided Technicolor DGA4134 router.
category: "Home Lab"
---

![Ubiquiti Dream Machine Pro](https://static.jackpearce.co.uk/images/posts/ubiquiti-dream-machine-pro.png)

This guide will walk you through the process of setting up your Ubiquiti Dream Machine with Trooli's network, bypassing the default Technicolor DGA4134 router.

### **Step 1: Connect the Technicolor DGA4134 Router**

After installation, connect the Technicolor DGA4134 router provided by Trooli. This router is pre-configured to work with your broadband connection. Power it on and wait for it to establish a connection to the internet.

### **Step 2: Connect to Trooli Wi-Fi**

Using your computer or smartphone, connect to the Wi-Fi network broadcasted by the Technicolor DGA4134. The network name (SSID) and password should be on a sticker on the back of the router.

### **Step 3: SSH into the Technicolor DGA4134 Router**

To extract the PPPoE (Point-to-Point Protocol over Ethernet) username and password needed for your Ubiquiti Dream Machine, you'll need to access the router via SSH. Follow these steps:

1. Open a terminal on your computer.
2. SSH into the router using the following credentials:
   - **Username:** `engineer`
   - **Password:** The password is written on the back of the router. You might need to peel the Trooli sticker carefully off the back to reveal the password written underneath.
   
   ```bash
   ssh engineer@192.168.1.1
   ```

### **Step 4: Extract the PPPoE Username and Password**

Once you're SSH'd into the router, run the `top` command to check for active processes. Look for the `pppd` command, which should contain the PPPoE username and password. 

Here's what the relevant line might look like:

```plaintext
/usr/sbin/pppd nodetach ipparam wan ifname pppoe-wan lcp-echo-interval 10 lcp-echo-failure 5 lcp-echo-adaptive set PEERDNS=0 nodefaultroute usepeerdns maxfail 1 user PPPOEUSERNAME password PPPOEPASSWORD ip-up-script /lib/netifd/ppp-up ipv6-up-script /lib/netifd/ppp6-up ip-down-script /lib/netifd/ppp-down ipv6-down-script /lib/netifd/ppp-down plugin connstate.so mtu 1500 mru 1500 plugin rp-pppoe.so graceful_restart /etc/ppp/pppoesession_vlan_wan nic-vlan_wan host-uniq SOMMESTRING
```

- **PPPOEUSERNAME** is your actual PPPoE username.
- **PPPOEPASSWORD** is your actual PPPoE password.

Make a note of both the username and password, as you'll need them to set up your Ubiquiti Dream Machine.

### **Step 5: Configure Your Ubiquiti Dream Machine**

Now that you have your PPPoE credentials, it's time to configure your UDM:

1. **Access the UDM Settings:** Connect to the UDM's Wi-Fi network and open the Ubiquiti Network application. Alternatively, you can connect directly via a wired connection to the UDM and access the settings through a web browser.
   
2. **Navigate to Network Settings:** Go to `Network` > `Settings`.

3. **Set Up Internet Connection:** Under the `Internet` section, go to `Primary WAN`.

4. **MAC Address Clone (Optional):** Enable MAC address cloning and enter the MAC address of the Technicolor DGA4134 router.

5. **Select IPv4 Connection Type:** Choose `PPPoE` from the dropdown menu.

6. **Enter PPPoE Credentials:** Use the PPPoE username and password you extracted earlier.

7. **Select IPv6 Connection Type:** Choose DHCPv6, Prefix Delegation Size: 56

8. **Apply Settings:** Save your changes and allow the UDM to connect. It should now establish a connection using your Trooli broadband.
