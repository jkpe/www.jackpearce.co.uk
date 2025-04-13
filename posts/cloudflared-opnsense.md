---
title: Running cloudflared on OPNSense
slug: cloudflared-opnsense
date: 2022-09-22T06:27:00.000Z
excerpt: I use cloudflared to provide a secure tunnel to my home resources. I struggled to find any instructions for running cloudflared on OPNSense so here is a quick how-to.
category: "Home Lab"
---

I use [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/) to provide a secure tunnel to my home resources. I struggled to find any instructions for running cloudflared on OPNSense so here is a quick how-to:

SSH to your OPNSense router and run:

1. `opnsense-code ports tools`
2. `cd /usr/ports/net/cloudflared`
3. `make install`
4. [Create a tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/tunnel-guide/remote/) and grab your token string from the docker example given
5. `nano /usr/local/etc/rc.d/cloudflared` modify so that it matches below. We're just removing `${cloudflared_conf}` from the command arguments as we're supplying a token instead of using a config.yaml

```sh
#!/bin/sh

name="cloudflared"
rcvar="cloudflared_enable"
logfile="/var/log/cloudflared.log"
pidfile="/var/run/cloudflared.pid"
procname="/usr/local/bin/cloudflared"

load_rc_config $name

: ${cloudflared_enable:="NO"}
: ${cloudflared_conf:="/usr/local/etc/cloudflared/config.yml"}
: ${cloudflared_mode:="tunnel"}

command="/usr/sbin/daemon"
command_args="-o ${logfile} -p ${pidfile} -f ${procname} ${cloudflared_mode}"

run_rc_command "$1"
```

6. `nano /etc/rc.conf` and add:

```text
cloudflared_enable="YES"
cloudflared_mode="tunnel --post-quantum --no-autoupdate run --token your_token_here"
```

That's it! 'cloudflared' will now start at boot. To start the tunnel immediately:

`/usr/sbin/daemon -o /var/log/cloudflared.log -p /var/run/cloudflared.pid -f /usr/local/bin/cloudflared tunnel --post-quantum --no-autoupdate run --token your_token_here`