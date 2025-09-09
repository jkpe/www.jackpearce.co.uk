---
title: "Building a Slack AI Chatbot"
slug: build-slack-ai-chatbot-gradient
date: 2025-04-10T19:00:00.000Z
excerpt: Create a chatbot that summarizes Slack conversations and answers questions using DigitalOcean's Gradient Platform.
category: "Language Models"
---

> **Originally published as a DigitalOcean community article:** [Building a Slack AI Chatbot with DigitalOcean Gradient Platform](https://www.digitalocean.com/community/tutorials/build-slack-ai-chatbot-gradient)

In today's collaborative workplace, messaging platforms like [Slack](https://slack.com/intl/en-in/blog/news/slack-ai-has-arrived) have become central hubs for team communication. By integrating [AI capabilities](https://www.digitalocean.com/products/ai-ml) into these platforms, organizations can enhance productivity, streamline workflows, and create more engaging user experiences. This is where AI-powered chatbots come into play, offering intelligent assistance directly within the communication channels teams already use.

Whether you're a developer looking to enhance your team's Slack workspace or a product manager seeking to streamline communication processes, DigitalOcean's [Gradient Platform](https://www.digitalocean.com/products/gradientai/platform) provides an elegant solution for building sophisticated AI chatbots without complex infrastructure. By leveraging Gradient Platform, you can focus on creating meaningful interactions rather than managing the underlying AI infrastructure.

In this tutorial, we'll walk through the process of creating a [Slack AI chatbot](https://slack.com/intl/en-in/blog/news/slack-ai-has-arrived) that can summarize conversations, answer questions, and interact with your team using DigitalOcean's Gradient Platform. The bot will respond when mentioned in channels, accept direct messages, and even provide AI-generated summaries of Slack threads on demand.

## Prerequisites

1. [**A Slack workspace**](https://slack.com/create) with permissions to install apps.
2. [**DigitalOcean Gradient Platform**](https://www.digitalocean.com/products/gradientai/platform/): DigitalOcean's solution for building AI-powered applications
3. [**DigitalOcean App Platform**](https://www.digitalocean.com/products/app-platform) (optional): For deploying your chatbot as a managed application

## The Power of AI-Powered Slack Bots

What makes this approach particularly compelling is how it brings the capabilities of [large language models](https://www.digitalocean.com/resources/articles/large-language-models) directly into your team's everyday communication channels. This integration opens up possibilities for more efficient collaboration and information processing within Slack.

### Overview of Use Cases

AI-powered Slack bots are particularly useful for a wide range of use cases, including but not limited to:

- **Knowledge workers**: These bots can quickly answer questions about company policies, procedures, or documentation, saving time and reducing interruptions.
- **Development teams**: Bots can assist with code reviews, explain technical concepts, or suggest debugging approaches within development-focused channels.
- **Project managers**: AI bots can summarize long discussion threads, extract action items, and help keep everyone aligned on project goals.
- **Customer support teams**: Bots can provide quick answers to common questions, suggest response templates, or summarize customer issues for faster resolution.

### Pros and Cons of Using AI Chatbots in Slack

By integrating AI chatbots with Slack, we create a powerful combination that enhances team productivity through instant access to AI capabilities. However, like any technology solution, there are trade-offs to consider when implementing AI chatbots in Slack.

#### Pros

- **Seamless integration** with existing workflow and communication channels.
- **Reduced context switching**, as users don't need to leave Slack to access AI capabilities.
- **Customizable interactions** that can be tailored to team-specific needs.
- **Improved productivity** through automated summaries and instant answers.

#### Cons

- **Potential privacy concerns**, as conversations are processed by AI systems.
- **Learning curve** for team members to understand how to effectively interact with the bot.
- **API rate limits** from both Slack and AI providers that may restrict usage during peak times.
- **Maintenance requirements** to keep the bot running smoothly and updated.

## Step 1 - Creating a Slack App

First, we'll create a Slack app that will serve as the foundation for our AI chatbot:

1. Open [https://api.slack.com/apps/new](https://api.slack.com/apps/new) and choose **"From an app manifest"**.
2. Select your workspace
3. Use this manifest template (you can find the full version in the project repository):

   ```json
   {
     "display_information": {
       "name": "Sailor",
       "description": "Your AI assistant powered by DigitalOcean Gradient",
       "background_color": "#0069ff"
     },
     "features": {
       "bot_user": {
         "display_name": "Sailor",
         "always_online": true
       },
       "slash_commands": [
         {
           "command": "/ask-sailor",
           "description": "Ask a question to Sailor AI",
           "usage_hint": "[your question]",
           "should_escape": false
         },
         {
           "command": "/sailor-summary",
           "description": "Have Sailor summarize this thread",
           "usage_hint": "[optional focus area]",
           "should_escape": false
         }
       ]
     },
     "oauth_config": {
       "scopes": {
         "bot": [
           "app_mentions:read",
           "channels:history",
           "chat:write",
           "commands",
           "groups:history",
           "im:history",
           "mpim:history"
         ]
       }
     },
     "settings": {
       "event_subscriptions": {
         "bot_events": [
           "app_mention",
           "message.im"
         ]
       },
       "interactivity": {
         "is_enabled": true
       },
       "org_deploy_enabled": false,
       "socket_mode_enabled": true
     }
   }
   ```

4. Review the configuration and click **"Create"**.
5. Install the app to your workspace by clicking **"Install to Workspace"** and **"Allow"**.

After installation, you'll need to collect some important credentials:

1. From your app's configuration page, go to **OAuth & Permissions** and copy the Bot User OAuth Token (`SLACK_BOT_TOKEN`)
2. From **Basic Information**, create an app-level token with the `connections:write` scope (`SLACK_APP_TOKEN`)

## Step 2 - Setting Up Your Development Environment

With your Slack app created, you'll need to set up the development environment:

1. Clone the project repository:

   ```bash
   git clone https://github.com/DO-Solutions/slack-digitalocean-genai-agent.git
   cd slack-digitalocean-genai-agent
   ```

2. Set up a Python virtual environment:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Configure your environment variables:

   ```bash
   export SLACK_BOT_TOKEN=<your-bot-token>
   export SLACK_APP_TOKEN=<your-app-token>
   export GENAI_API_KEY=<your-genai-api-key>
   export GENAI_API_URL=<your-genai-api-url>  # Append /api/v1
   ```

The `GENAI_API_KEY` and `GENAI_API_URL` can be obtained from the DigitalOcean [Gradient Platform dashboard](https://cloud.digitalocean.com/gen-ai).

## Step 3 - Understanding the Application Structure

The application is structured to provide a clean separation of concerns between AI functionality and Slack integration:

### The AI Module

The `/ai` directory contains the core AI functionality:

- `ai_constants.py`: Defines constants used throughout the AI module
- `/providers/__init__.py`: Contains utility functions for handling API responses and available providers

The provider enables communication with DigitalOcean's Gradient Platform through an [OpenAI-compatible API](https://platform.openai.com/).

### State Storage

The application needs to store user preferences, such as their preferred AI model. Two options are provided:

1. **File-based state store**: Creates a file per user in the `/data` directory
2. **Redis state store**: For distributed deployments (recommended for App Platform)

For local development, the file-based store works well. For production deployments, Redis provides better reliability and scalability.

## Step 4 - Implementing Key Chatbot Features

Let's look at how the chatbot implements its key features:

### Responding to Mentions

The bot listens for mentions using Slack's event API and responds with AI-generated content:

```python
@app.event("app_mention")
def handle_app_mention(event, say):
    user_id = event["user"]
    thread_ts = event.get("thread_ts", event["ts"])
    
    # Get user preferred model from state store
    model = state_store.get_user_preference(user_id, "model") or DEFAULT_MODEL
    
    # Extract the text without the bot mention
    text = re.sub(f"<@{app.client.auth_test()['user_id']}>", "", event["text"]).strip()
    
    # Send request to AI provider
    response = ai_provider.generate_response(text, model)
    
    # Reply in thread
    say(text=response, thread_ts=thread_ts)
```

### Thread Summarization

The `/sailor-summary` command triggers an AI-powered summary of a Slack thread:

```python
@app.command("/sailor-summary")
def handle_summary_command(ack, command, say, client):
    ack()
    
    channel_id = command["channel_id"]
    thread_ts = command["thread_ts"] if "thread_ts" in command else command["ts"]
    user_id = command["user_id"]
    
    # Get thread messages
    messages = client.conversations_replies(
        channel=channel_id,
        ts=thread_ts
    )["messages"]
    
    # Format thread for AI
    thread_text = format_thread(messages)
    
    # Generate summary with AI
    summary_prompt = f"Summarize this Slack thread: {thread_text}"
    summary = ai_provider.generate_response(summary_prompt, DEFAULT_MODEL)
    
    # Send summary as DM to user
    client.chat_postMessage(
        channel=user_id,
        text=f"*Summary of thread:*\n\n{summary}"
    )
```

### Home Tab Configuration

The bot provides a home tab interface where users can select their preferred AI model:

```python
@app.event("app_home_opened")
def update_home_tab(client, event):
    user_id = event["user"]
    current_model = state_store.get_user_preference(user_id, "model") or DEFAULT_MODEL
    
    # Create home tab view with model selection
    home_view = {
        "type": "home",
        "blocks": [
            {
                "type": "header",
                "text": {
                    "type": "plain_text",
                    "text": "Sailor AI Settings"
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Choose your preferred AI model:"
                }
            },
            {
                "type": "actions",
                "elements": [
                    {
                        "type": "radio_buttons",
                        "action_id": "model_selection",
                        "options": [
                            {"text": {"type": "plain_text", "text": "DigitalOcean GenAI"}, "value": "genai"},
                            {"text": {"type": "plain_text", "text": "OpenAI GPT-4"}, "value": "gpt-4"},
                            {"text": {"type": "plain_text", "text": "Anthropic Claude"}, "value": "claude"}
                        ],
                        "initial_option": {"text": {"type": "plain_text", "text": model_display_name(current_model)}, "value": current_model}
                    }
                ]
            }
        ]
    }
    
    client.views_publish(user_id=user_id, view=home_view)
```

## Step 5 - Implementing Security with Gradient Platform Guardrails

Before deploying to production, it's important to implement appropriate security measures, especially for a bot that will be processing workplace communications. DigitalOcean's Gradient Platform offers [Guardrails](https://docs.digitalocean.com/products/genai-platform/how-to/manage-guardrail/attach/), a powerful security feature that helps protect sensitive information:

1. In the DigitalOcean control panel, navigate to the Gradient Platform section
2. Select your agent and go to the **"Guardrails"** tab
3. Click **"Attach Guardrail"** and choose from available options or create a custom one
4. Configure the guardrail to detect and prevent sharing of sensitive information such as:
   - Login credentials
   - API keys
   - Credit card information
   - Personal identifiable information (PII)
   - Inappropriate content

Guardrails act as a security layer that overrides an agent's output when it detects sensitive or inappropriate content, adding crucial protection for enterprise environments.

## Step 6 - Deploying to DigitalOcean App Platform

While local development is great for testing, a production chatbot needs reliable hosting. [DigitalOcean's App Platform](https://www.digitalocean.com/products/app-platform) provides a managed environment that's perfect for running your Slack bot:

1. Fork or clone the repository to your GitHub account
2. In the DigitalOcean control panel, go to App Platform and create a new app
3. Connect your GitHub repository
4. Configure the environment variables (`SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`, `GENAI_API_KEY`, `GENAI_API_URL`)
5. For state storage, add a Redis database component:
   - In the App Platform UI, add a new database component
   - Choose Redis
   - Select an appropriate plan
   - Connect it to your app
   - Set the `REDIS_URL` environment variable to the connection string

Once deployed, your bot will be available **24/7 in your Slack workspace**, ready to assist your team.

## Testing Your Slack AI Chatbot

With everything set up, you can now interact with your chatbot in several ways:

- **Direct messages**: Send a message directly to the bot
- **Channel mentions**: Tag the bot with `@Sailor` in any channel it's been added to
- **Slash commands**: Use `/ask-sailor` to interact with the bot in channels it hasn't been added to
- **Thread summaries**: Use `/sailor-summary` in a thread to get an AI-generated summary

## Extending the Chatbot

The base implementation (found at [https://github.com/DO-Solutions/slack-digitalocean-genai-agent](https://github.com/DO-Solutions/slack-digitalocean-genai-agent)) provides a solid foundation, but there are many ways to extend it:

### Alternative AI Providers

While DigitalOcean Gradient platform is the primary focus, the template supports other AI providers:

- **OpenAI**: Add your API key with `export OPENAI_API_KEY=<your-api-key>`
- **Anthropic**: Configure with `export ANTHROPIC_API_KEY=<your-api-key>`

### Custom Functionality

You can extend the bot with additional features:

- **Knowledge base integration**: Connect to your documentation system
- **Custom workflows**: Create Slack workflows that trigger AI-assisted tasks
- **Team-specific commands**: Add commands tailored to your team's needs

### Custom AI Providers

You can add support for other AI providers by:

1. Creating a new provider class that extends the base class in `ai/providers/base_api.py`
2. Updating `ai/providers/__init__.py` to include your implementation

## FAQs

### 1. What is the primary benefit of using DigitalOcean's Gradient platform for a Slack chatbot?

The primary benefit is the ability to create AI-powered interactions within Slack without managing complex AI infrastructure. [DigitalOcean's Gradient Platform](https://www.digitalocean.com/products/gen-ai) provides a streamlined path to building [intelligent chatbots](https://www.digitalocean.com/community/conceptual-articles/integrate-gen-ai-agents), making advanced AI capabilities accessible to developers of all skill levels. Additionally, it offers robust tools and integrations that simplify the development process. This allows teams to focus on creating meaningful interactions rather than dealing with the complexities of AI deployment.

### 2. How does the bot handle privacy and security concerns?

The bot processes messages only when explicitly mentioned or directly messaged, and it's configured to operate within the permissions granted during installation. For enhanced security, DigitalOcean's Gradient Platform offers a [Guardrails](https://docs.digitalocean.com/products/genai-platform/how-to/manage-guardrail/attach/) feature, which acts as a security component that you can attach to GenAI Platform agents.

A guardrail overrides an agent's output when it detects sensitive or inappropriate content in the agent's input or output. For example, it can prevent an agent from sharing login credentials or credit card information. This adds an additional layer of protection for sensitive workplace communications.

You can learn more about implementing Guardrails in the [DigitalOcean documentation](https://docs.digitalocean.com/products/genai-platform/how-to/manage-guardrail/attach/). Organizations concerned about sensitive data should also review the AI provider's data processing policies and consider using private agents where possible.

### 3. Can the chatbot be customized for specific team needs?

Yes, the chatbot is highly customizable. You can modify the AI prompts, add new commands, integrate with additional services, or even implement custom logic for specific types of requests. The modular structure makes it easy to extend the functionality without compromising the core features.

### 4. How scalable is this solution for large Slack workspaces?

When deployed to [DigitalOcean App Platform](https://www.digitalocean.com/products/app-platform) with [Redis state storage](https://www.digitalocean.com/products/managed-databases-redis), the solution scales well for large workspaces. The architecture efficiently handles concurrent requests, and both Slack's APIs and DigitalOcean's infrastructure are designed for scalability. For very large deployments, consider implementing additional caching or upgrading to higher-tier App Platform plans.

## Conclusion

Building an AI-powered Slack chatbot with DigitalOcean's Gradient Platform provides a powerful way to enhance team collaboration and productivity. By bringing AI capabilities directly into your team's communication channels, you create opportunities for more efficient information sharing, automated summaries, and intelligent assistance.

The example we've walked through demonstrates how to create a fully-functional chatbot that responds to mentions, summarizes threads, and adapts to user preferences. This foundation can be extended in countless ways to address your team's specific needs and workflows.

By combining the accessibility of Slack with the power of DigitalOcean's Gradient Platform, you can create AI experiences that feel like a natural extension of your team's everyday communication.

To further enhance your understanding and capabilities with the DigitalOcean Gradient Platform, consider following the below tutorials:

- [Getting Started with DigitalOcean Gradient Platform](https://www.digitalocean.com/community/tutorials/getting-started-with-digitalocean-genai-platform): A comprehensive guide to help you get started with the Gradient Platform.
- [How to Build an AI Agent or Chatbot with Gradient Platform Integration](https://www.digitalocean.com/community/tutorials/build-ai-agent-chatbot-with-genai-platform): Learn how to create and integrate AI agents or chatbots using the Gradient Platform.

Continue building with [DigitalOcean Gen AI Platform](https://www.digitalocean.com/products/gen-ai) and unlock the full potential of AI in your applications!
