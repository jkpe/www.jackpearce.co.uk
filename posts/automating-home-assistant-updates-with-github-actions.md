---
title: How I Automated Home Assistant Updates with GitHub Actions
slug: automating-home-assistant-updates-with-github-actions
date: 2024-07-06T09:00:00.000Z
excerpt: In this post, I share how I automated the update process for my Home Assistant setup using GitHub Actions, Renovate, Tailscale, and the Home Assistant CLI. This project not only ensured my system is always up-to-date but also provided a great opportunity to practice building CI/CD pipelines.
category: "Language Models"
---

As an avid Home Assistant user and a fan of automation, I embarked on a project to streamline the update process of my Home Assistant setup. This journey led me to create a set of workflows using GitHub Actions, Renovate, Tailscale, and the Home Assistant CLI (ha). While this automation might seem unnecessary, it was an excellent opportunity to practice building CI/CD pipelines for one of my favorite projects.

The repository I created contains workflows that automate the deployment and updating of various Home Assistant components. Here's a detailed breakdown of how each part works.

![Automated GitHub Release](https://images.jackpearce.co.uk/homeassistant-github-actions-updates.png)

#### [Core Workflow](https://github.com/jkpe/homeassistant-update-automation/blob/main/.github/workflows/core.yml)
[github.com/jkpe/homeassistant-update-automation/blob/main/.github/workflows/core.yml](https://github.com/jkpe/homeassistant-update-automation/blob/main/.github/workflows/core.yml)

The core workflow handles updates to the Home Assistant Core. The process is initiated whenever a new release is published in the Home Assistant Core repository.

1. **Release Detection**: Renovate detects the new release and automatically creates a pull request with the updated version.
2. **Merge Action**: Once the pull request is reviewed and merged, it triggers the GitHub Action.
3. **Deployment**: The GitHub Action uses Tailscale connectivity to establish an SSH connection to my Home Assistant Yellow device.
4. **Update Execution**: The action utilizes the `ha` CLI tool to run the update command, e.g., `ha core update --version $VERSION`.

#### [OS Workflow](https://github.com/jkpe/homeassistant-update-automation/blob/main/.github/workflows/os.yml)
[github.com/jkpe/homeassistant-update-automation/blob/main/.github/workflows/os.yml](https://github.com/jkpe/homeassistant-update-automation/blob/main/.github/workflows/os.yml)

The OS workflow is quite similar to the Core workflow but focuses on the Home Assistant Operating System. It follows these steps:

1. **Release Detection**: Renovate detects the new OS release and creates a pull request with the updated version.
2. **Merge Action**: Upon merging the pull request, the GitHub Action is triggered.
3. **Deployment**: Tailscale is used to SSH into the Home Assistant Yellow device.
4. **Update Execution**: The action runs the update command via the `ha os update --version $VERSION` CLI tool.

By automating the OS updates, I ensure that my Home Assistant setup remains stable and secure.

#### Secrets Management

For secure operations, the workflows rely on several secrets:

- `TS_OAUTH_CLIENT_ID`: OAuth client ID for Tailscale.
- `TS_OAUTH_SECRET`: OAuth secret for Tailscale.
- `HASSIOKEY`: SSH key for accessing the Home Assistant instance.
- `YELLOW_IP_ADDRESS`: IP address of the Home Assistant instance.

These secrets are securely stored in GitHub and are essential for the workflows to function correctly.

While automating the update process for Home Assistant might seem unnecessary, it has provided me with valuable experience in building CI/CD pipelines. Moreover, it ensures that my Home Assistant setup is always up-to-date with minimal manual intervention.

You can explore the details of this project and the workflows in my [GitHub repository](https://github.com/jkpe/homeassistant-update-automation).
