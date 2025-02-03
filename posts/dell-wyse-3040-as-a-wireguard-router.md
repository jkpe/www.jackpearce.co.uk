---
title: Dell Wyse 3040 as a WireGuard Router
slug: dell-wyse-3040-as-a-wireguard-router
date: 2023-03-23
excerpt: A guide to repurposing a Dell Wyse 3040 thin client as a WireGuard VPN router with AdGuard for DNS and DHCP services, achieving speeds up to 850Mbps.
category: "Home Lab"
---

I recently purchased a Dell Wyse 3040 off of eBay for £30. They're designed to be used as thin clients but make excellent Linux servers in any homelab. Think Raspberry Pi 4 but x86 and in stock!

Specs:

- Quad-core Atom CPU
- 2GB of RAM
- 8/16 GB of eMMC storage
- 1.3W idle

## I'm using mine as a WireGuard router

What does this mean? My 3040:

- Runs AdGuard for DNS and DHCP (on a seperate VLAN)
- Routes all traffic via a WireGuard VPN provider

I initially installed and configured OPNsense but WireGuard throughput was limited to around 220Mbps, even with Kernel WireGuard. WireGuard when used with Debian on the Wyse 3040 can hit **850Mbps**.

### It turns out configuring Debian as a router is incredibly easy:

1. Install Debian following these [instructions](https://wiki.debian.org/InstallingDebianOn/Dell/Wyse%203040), I didn't need to provide the LAN driver at boot, [add non-free to sources.list](https://serverfault.com/a/240921) and install `firmware-realtek` once booted.

```shell
apt update && apt install firmware-realtek
```

2. Configure your VLAN interface

```shell
nano /etc/network/interfaces
```

```shell
auto eth0.109
iface eth0.109 inet static
	address 192.168.109.2
	netmask 255.255.255.0
```

```shell
service networking restart
```

3. Install Docker

```shell
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

4. Install Adguard and configure this for encrypted DNS and DHCP

```shell
docker run --name adguardhome --network host --restart unless-stopped -v /opt/adguardhome/work:/opt/adguardhome/work -v /opt/adguardhome/conf:/opt/adguardhome/conf -d adguard/adguardhome
```

5. Install WireGuard and setup your tunnel, be sure to use `AllowedIPs = 0.0.0.0/0`

6. Use iptables to force all traffic for our new VLAN out via the WireGuard interface

```shell
echo 1 > /proc/sys/net/ipv4/ip_forward
iptables -t nat -A POSTROUTING -o wg0 -j MASQUERADE
iptables -A INPUT -i enp1s0.109 -j ACCEPT
iptables -A INPUT -i wg0 -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -j ACCEPT
```

```shell
apt install iptables-persistent
```
