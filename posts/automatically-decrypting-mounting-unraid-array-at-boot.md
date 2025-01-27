---
title: Automatically decrypting, unlocking and mounting an Unraid array at boot
slug: automatically-decrypting-mounting-unraid-array-at-boot
date: 2022-09-05T00:00:00.000Z
excerpt: Unraid is my favourite NAS OS to run at home. It’s super easy to get setup and administer.
category: "Home Lab"
---

Unraid is my favourite NAS OS to run at home. It’s super easy to get setup and administer. When you combine it’s built in app store (based on Docker), Traefik & Authelia for automatic HTTPS proxy and authentication you could even go as far to say it’s your very own self hosted PaaS and that I love.

All of my Array and Pool devices are encrypted using the Unraid file system type ‘xfs - encrypted’, it does this using the Linux LUKS (Linux Unified Key System) encryption modules.

Unraid will ask for either a key phrase or a file (a random photo for example) at boot to unlock the drives. These were my requirements when enabling encryption:

- Server automatically boots and unlocks encrypted drives without intervention
- Key phrase or file required to unlock the drives is not stored locally i.e on a USB drive plugged into the NAS, should be retrieved remotely
- Access to the key can be revoked at any time therefore preventing the unlock from taking place at boot

To achieve this I host my key phrase in a Github repo and instruct Unraid to download it at boot.

1. Create a private Github repo, create a new file `keyfile` and make the contents your decryption key phrase
2. Create a new [‘Personal access token’](https://github.com/settings/tokens) and select ‘Repo’ as the scope
3. SSH to your Unraid server and modify `/boot/config/go`, at the end insert `curl -H "Authorization: token ghp_xxx" https://raw.githubusercontent.com
/username/repo/main/keyfile -o /root/keyfile` where `ghp_xxx` is your Personal access token, and `username/repo` is specific to your username and repo
4. Back in the Unraid dashboard go to Settings > Disk Settings > Enable auto start > Yes
