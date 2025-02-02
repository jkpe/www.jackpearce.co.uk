---
title: Automating My Home Assistant History - AI-Powered GitHub Releases for Automation Tracking
slug: ai-powered-github-actions-automating-home-assistant-history
date: 2024-07-07T22:00:00.000Z
excerpt: Discover how to automate your Home Assistant journey using AI and GitHub Actions. This innovative workflow creates an intelligent, self-updating chronicle of your smart home evolution, complete with AI-generated commit messages and automatic GitHub releases. Learn how to turn your automation history into a living document that grows with your smart home.
category: "Home Automation, Language Models"
---

As a Home Assistant enthusiast, I'm always looking for ways to improve my smart home setup. Recently, I developed a GitHub Actions workflow that automatically tracks changes to my Home Assistant automations, uses AI to generate commit messages, and creates GitHub releases for each update. This post details how I automated the automation of my automation history. (Try saying that five times fast!)

![Automated GitHub Release](https://images.jackpearce.co.uk/llm-git-commit-home-assistant.png)

## Workflow at a Glance

Before diving into the details, here's a quick overview of what my [GitHub Actions workflow](https://gist.github.com/jkpe/d6c9a3f4d1db77cb24875e3a289291ad) does:

1. Checks out my automations.yaml from my Home Assistant configuration
2. Uses an AI language model to generate a commit message based on the changes
3. Commits and pushes the changes to the repository
4. Creates a new GitHub release with an incremented version number
5. Generates release notes that include all commit messages since the last release

Now, let's break down each step and see how this workflow revolutionized my Home Assistant automation management.

## The Workflow: A Technical Deep Dive

### 1. Repository Checkout

The workflow begins by checking out two repositories:

```yaml
- name: Checkout repository
  uses: actions/checkout@v4
  with:
    repository: jkpe/automations
    path: automations-repo
    token: ${{ secrets.REPO_TOKEN }}

- name: Checkout home repository
  uses: actions/checkout@v4
  with:
    path: home
    token: ${{ secrets.REPO_TOKEN }}
```

This step ensures I have access to my latest automations.

### 2. Updating the Automations File

Next, the workflow copies across the automations.yaml file so I can run a `git diff`:

```yaml
- name: Copy automations.yaml
  run: |
    cp automations-repo/automations.yaml home/home-assistant/automations.yaml
```

### 3. AI-Generated Commit Messages

One of the most exciting features of my workflow is the use of an AI language model to generate commit messages:

```yaml
- name: Generate commit message with llm
  id: generate_commit_message
  run: |
    cd home/home-assistant
    echo "commit_message"=$(git diff -U200 automations.yaml | llm -m gpt-4o --no-stream -s "Given the git diff provided, write a git commit message for the changes in the Home Assistant automations.yaml file. The commit message should only comment on the specific automation that has changed. An individual automation starts just below the mode: of the previous automation and is identified by its id. Each automation always ends with a mode:. Include the automation ID in the output. Just return text, no formatting." --key ${{ secrets.openaikey }}) >> $GITHUB_ENV
```

This step uses the ['llm'](https://llm.datasette.io/en/stable/) tool to analyze the git diff and generate a relevant commit message using GPT-4o.

### 4. Committing Changes

The workflow then commits the changes using the AI-generated commit message:

```yaml
- name: Commit changes
  run: |
    cd home/home-assistant
    git config --global user.name "github-actions[bot]"
    git config --global user.email "github-actions[bot]@users.noreply.github.com"
    git add automations.yaml
    git commit -m "$commit_message"
    git push
  env:
    GITHUB_TOKEN: ${{ secrets.REPO_TOKEN }}
```

### 5. Creating Releases

Finally, the workflow creates a new release with incremented version numbers:

```yaml
- name: Create new release
  run: |
    cd home/home-assistant
    latest_tag=${{ steps.get_latest_release.outputs.latest_tag }}
    IFS='.' read -r -a version_parts <<< "$latest_tag"

    # Get current year and month
    current_year=$(date +%Y)
    current_month=$(date +%m)

    year=${version_parts[0]}
    month=${version_parts[1]}
    version=${version_parts[2]}

    if [ "$current_year" -ne "$year" ] || [ "$current_month" -ne "$month" ]; then
      new_version="01"
      new_tag="$current_year.$current_month.$new_version"
    else
      new_version=$(printf "%02d" $((10#$version + 1)))
      new_tag="$year.$month.$new_version"
    fi

    git tag $new_tag
    git push origin $new_tag

    # Fetch commit messages
    commits=$(git log --pretty=format:"%h - %s" $latest_tag..HEAD)
    release_notes=$(printf "Automated release for $new_tag\n\nCommits:\n$commits")

    # Create release
    gh release create $new_tag --title "$new_tag" --notes "$release_notes"
  env:
    GITHUB_TOKEN: ${{ secrets.REPO_TOKEN }}
    GH_TOKEN: ${{ secrets.REPO_TOKEN }}
```

This step increments the version number, creates a new tag, and generates release notes that include all commit messages since the last release.

![Automated GitHub Release](https://images.jackpearce.co.uk/llm-git-commit-home-assistant.png)

## Why This Matters for My Home Assistant Setup

This AI-powered GitHub Actions workflow offers several benefits for my Home Assistant configuration:

1. **Intelligent Version Control**: Every change is tracked with AI-generated commit messages, providing clear, concise descriptions of each update.
2. **Automated Documentation**: The workflow creates a detailed git log, making it easy for me to understand the evolution of my automations.
3. **Streamlined Release Management**: Automatic versioning and release creation help me keep track of major updates to my setup.
4. **Enhanced Collaboration**: If I ever decide to work with others on my smart home setup, this system provides transparency on who changed what and when.
5. **Reliable Backup**: By storing my automations in a Git repository, I have an additional layer of backup for my Home Assistant configuration.

By combining the power of version control, AI-generated documentation, and automated release management, I've turned the often tedious task of tracking automation changes into a streamlined, intelligent process.

As my smart home setup continues to evolve, this tool allows me to focus more on creating and improving my automations, with the assurance that every change is thoroughly documented and easily retrievable. It's an example of how we can leverage cutting-edge technologies to make home automation more accessible, manageable, and fun.

If you're a Home Assistant enthusiast like me, I hope this inspires you to think about new ways to manage and document your own smart home journey. Happy automating!


<script src="https://gist.github.com/jkpe/d6c9a3f4d1db77cb24875e3a289291ad.js"></script>

