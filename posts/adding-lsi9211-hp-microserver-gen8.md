---
title: Adding a LSI 9211-8i to a HP MicroServer gen8 & flashing IT mode in 2022
slug: adding-lsi9211-hp-microserver-gen8
date: 2022-03-25T00:00:00.000Z
excerpt: I recently installed a LSI 9211-8i HBA into my HP MicroServer gen8 as a replacement for a PCI-e M2 SSD adapter that kept putting my filesystem into read-only mode.
category: "Home Lab"
---

I recently installed a LSI 9211-8i HBA into my HP MicroServer gen8 as a replacement for a PCI-e M2 SSD adapter that kept putting my filesystem into read-only mode.

During the install I faced an issue with the version of BIOS and firmware that comes with the card and this prevented me from using it with my server. There are plenty of guides explaining how to flash IT mode firmware to the card but only a few hidden forum posts that explain which BIOS versions you’ll need. **I’ll explain how to flash the LSI 9211-8i BIOS and firmware to a version that is compatible with the Microserver gen8.**

Also; the stock B120i Controller only supports 2x 6Gbps ports of the Microserver’s 4 HDD cage.

### HP B120i vs LSI 9211-8i
I purchased the [“ipolex LSI 9211-8i Internal SAS/SATA Raid Controller Host Bus Adapter, LSI SAS2008 Chip, PCI Express x8-Port 6Gb/s, High Profile & Low Profile”](https://www.amazon.co.uk/gp/product/B0832Q2XPQ/) from Amazon which came with a low profile bracket. I’m not sure why it is branded as ipolex, there are a few different brands to pick from on Amazon.

As standard the LSI 9211-8i operates as a RAID controller and not a typical HBA. By this I mean that it is designed to perform RAID0/1/5/10 operations and present the underlying OS with a virtual disk. We don’t want this as I am running a software RAID in the form of Unraid. You may be running TrueNAS or similar software RAID solution. To fix this we’ll need to flash the card into IT mode and the card will then present to the OS a bunch of disks.

#### Out of the box my LSI 9211-8i came with (BIOS incompatible):

**Note:** when I refer to the BIOS I am referring to the LSI card’s BIOS

Firmware version: P20**IR**(20.00.07.00)
BIOS version: 7.39.**02**.00

Unfortuantely BIOS version 7.39.02.00 is incompatible with the Microserver. We’ll need to downgrade this. We need to flash the card to get it into IT mode so we’ll just do it then.

#### Working version:
Firmware version: P20**IT**(20.00.07.00)
BIOS version 7.39.**00**.00

### Upon booting the Microserver with the card inserted I was greeted with a red screen ‘NMI Detected’

This is how you know the card is using a BIOS that is incompatible (slightly too recent). Unfortunately I was unable to find a way to bypass this screen so I could flash the card. I had to take the card and place it into another server.

### Steps to downgrade the BIOS & flash IT mode firmware

I tried lots of different ways to get the EFI shell required to boot (mostly involving Rufus) but [this](https://www.tfir.io/easiest-way-to-flash-lsi-sas-9211-8i-on-motherboards-without-efi-shell/) was the method that worked for me. I’ll re-iterate the steps below incase the article is deleted.

#### What you need:

- Alternative PC/Server with PCI-e slot
- An Ubuntu or any other Linux distribution (Live ISO/USB boot is fine)
- [rEFInd](http://www.rodsbooks.com/refind/installing.html)
- USB drive (minimum 2GB)
- LSI SAS 9211-8i card
- Files from [this git repo](https://github.com/jkpe/LSI-9211-8i-MicroServer-Gen8)
- Git repo contains:
- EFI shell (shell.efi)
- UEFI installer from LSI (sas2flash.efi)
- The compatible BIOS (mptsas2.rom)
- 9211 IT mode firmware (2118it.bin)

[Install rEFInd](http://www.rodsbooks.com/refind/installing.html) (installs to /usr/share/refind)

Plug in the USB drive and find the block device name (in my case, it was /dev/sda)

    lsblk
    

Install rEFInd to the USB stick

    /usr/share/refind-install --usedefault /dev/sda1 --alldrivers
    

Once the installation is complete, cd to EFI directory of the USB drive. Then create a folder called ‘tools’ Copy shell.efi to the tools directory. Copy these three files – sas2flash.efi, 2118it.bin and mptsas2.rom to the root directory.

Now, plug the USB drive into your computer. Install the LSI SAS 9211-8i card and start your PC. Once your system boots, choose UEFI boot device from the boot menu. You should see the rEFInd boot menu. Now select the EFI shell.

You should see the list of the drives. In my case ‘fs0’ was the USB drive where needed firmware was stored; mount this directory:

    Shell> mount fs0
    

Now change directory to ‘fs0.

    Shell> fs0:
    

First, remove the existing IR firmware: This command will put the card into advanced mode -o and then erase the flash memory -e 6.

    Shell> sas2flash.efi -o -e 6
    

**Do NOT reboot the machine at this stage or you will leave the HBA card in an unrecoverable state.**

Now flash the IT mode firmware: The command will put the card into advanced mode again -o and then flash with firmware -f 2118it.bin and bios -b mtpsas2.rom.

    Shell> sas2flash.efi -o -f 2118it.bin -b mptsas2.rom
    

The output should tell you everything was succesful. Verify the install has been completed correctly before rebooting with `sas2flash.efi -listall` If you enter the HBA cards BIOS again by pressing CTRL-C during boot, you’ll see confirmation you are now running in IT mode with v20 firmware. You can now use the card with your Microserver as a HBA.

These LSI HBAs run very hot (people on [Reddit](https://www.reddit.com/r/DataHoarder/comments/8u7syj/how_i_cooled_my_lsi_sas92118i_card_with_a_noctua/) reporting 85c+) and the MicroServer is a tight space with limited airflow so I purchased a [40x20mm fan](https://www.amazon.co.uk/gp/product/B07125KWG1/) and cable tied it to the heatsink.
![](https://www-jackpearce-co-uk.ams3.cdn.digitaloceanspaces.com/2023/10/lsi8i-with-fan.jpeg)LSI 9211-8i with Noctua fan attached
