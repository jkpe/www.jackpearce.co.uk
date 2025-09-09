---
title: "Build Real-Time AI Agents with Gradient and Serverless Functions"
slug: ai-agents-gradient-platform-functions
date: 2025-04-02T19:00:00.000Z
excerpt: Easily create valuable AI-powered agents that can retrieve and process real-time information using DigitalOcean's Gradient Platform.
category: "Language Models"
---

> **Originally published as a DigitalOcean community article:** [Build Real-Time AI Agents with Gradient and Serverless Functions](https://www.digitalocean.com/community/tutorials/ai-agents-gradient-platform-functions)

In today's data-driven world, the ability to create [AI-powered agents](https://www.digitalocean.com/community/tutorials/build-ai-agent-chatbot-with-genai-platform) that can retrieve and process real-time information has become increasingly valuable. This is particularly evident in industries such as finance, healthcare, and e-commerce, where timely insights can significantly impact decision-making and customer experiences.

Whether you're a developer, data scientist, or AI enthusiast, DigitalOcean's [Gradient Platform](https://www.digitalocean.com/products/gradientai/platform) offers a streamlined solution for building intelligent agents without the need for complex infrastructure. By leveraging Gradient Platform, you can focus on creating AI models that drive meaningful interactions and insights, rather than worrying about the underlying infrastructure required to support them.

In this tutorial, we'll walk through the process of creating an [AI agent](https://www.digitalocean.com/resources/articles/ai-agents) that can answer questions about your [DigitalOcean account](https://cloud.digitalocean.com/login) by retrieving data from the [DigitalOcean API](https://docs.digitalocean.com/reference/api/) in real-time. The agent will be able to provide information about [Droplets](https://www.digitalocean.com/products/droplets) (virtual machines), including their IDs, status, and other details.

## Prerequisites

1. [**DigitalOcean Gradient Platform**](https://www.digitalocean.com/products/gradientai/platform): DigitalOcean's new product for building production-ready AI agents.
2. [**DigitalOcean Functions**](https://docs.digitalocean.com/products/functions/): A serverless solution for running code in various languages (Python, Node.js, PHP, Go).

## The Power of AI Agents with Live Data Access

What makes DigitalOcean's approach particularly compelling is how it enables the creation of agents that can connect directly to [APIs](https://docs.digitalocean.com/reference/api/) and deliver up-to-the-minute answers. This capability opens up a world of possibilities for more interactive and informed AI solutions across various applications.

### Overview of Use Cases

AI agents like this are particularly useful for a wide range of use cases, including but not limited to:

- **Developers**: AI agents can provide quick insights into cloud infrastructure, helping developers monitor and manage their resources more efficiently.
- **Support teams**: These agents can automate responses to common customer inquiries, improving customer service and reducing response times.
- **System administrators**: AI agents can be used for real-time monitoring and reporting of DigitalOcean resources, providing valuable insights and alerts.

### Pros and Cons of Using AI Agents with API Integration

By integrating AI agents with APIs, we create a powerful combination that enhances decision-making capabilities through access to real-time data. This approach allows businesses to build more responsive and intelligent systems that can adapt to changing conditions. However, like any technology solution, there are trade-offs to consider when implementing AI agents with API integration.

#### Pros

- **Real-time access to data**, ensuring up-to-date information.
- **Automation of repetitive tasks**, reducing manual intervention.
- **Scalability**, as agents can handle multiple requests simultaneously.
- **Improved user experience**, with fast and intelligent responses.

#### Cons

- **Potential API rate limits**, which might restrict frequent requests.
- **Security concerns**, as sensitive data is accessed and processed.
- **Complexity in debugging**, especially when dealing with real-time errors or incorrect responses.

## Step 1 - Preparing Your Function

First, we'll create a function that the language model can call to retrieve data from the DigitalOcean API:

1. In the DigitalOcean control panel, navigate to **Functions** and click **"Create Namespace"**.
2. Select a **data center location** (e.g., Toronto)
3. Use the `doctl` command line tool to connect to your namespace:

   ```bash
   doctl serverless connect
   ```

4. Initialize a sample Python project:

   ```bash
   doctl serverless init --language python example-project
   ```

## Step 2 - Configuring Your Function

Once the sample project is initialized, you'll need to:

1. Modify the project file to define the Python runtime and set security headers.
2. Create an [environment file](https://docs.digitalocean.com/reference/api/create-personal-access-token/) for your DigitalOcean API token (this is so the Function can retrieve data from your DigitalOcean account).
3. Replace the hello world sample with your API function code that retrieves droplet information.
4. Create a build script for importing Python dependencies.
5. Deploy the function to make it available in the cloud.

   ```bash
   doctl serverless deploy
   ```

After deployment, you can test your function through the web interface to ensure it returns the expected information about your droplets.

You can find a complete example with all the required code and configuration in [this repository](https://github.com/DO-Solutions/do-api-functions).

## Step 3 - Creating Your AI Agent

You can create your AI agent either through the web interface or using the [API](https://docs.digitalocean.com/reference/api/digitalocean//#tag/GenAI-Platform-(Public-Preview)):

### Option 1 - Using the Web Interface

The web interface provides a user-friendly way to create and manage AI agents. This option is ideal for users who prefer a graphical interface over command-line interactions.

1. In the Gradient platform, click **"Create Agent"**.
2. Name your agent (e.g., **"Droplet Agent"**).
3. Provide agent instructions (system prompt) to define its purpose
   1. `You are a helpful assistant that provides information about DigitalOcean customer accounts. Your role is to help users understand their account details, team information, resource usage, and account status.`
4. Choose your preferred language model (e.g., `Llama 3.3 Instruct-70B`)
5. Create the agent.

### Option 2 - Using the API

Using the API provides a programmatic way to create and manage AI agents, offering flexibility and automation that may not be available through the web interface. This approach is particularly useful for developers and organizations that require custom integrations, large-scale deployments, or automated agent management.

You can also create an agent programmatically using the [DigitalOcean API](https://docs.digitalocean.com/reference/api/digitalocean//#tag/GenAI-Platform-(Public-Preview)). Here's an example using `curl`:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  "https://api.digitalocean.com/v2/gen-ai/agents" \
  -d '{
    "name": "Droplet Agent",
    "model_uuid": "d754f2d7-d1f0-11ef-bf8f-4e013e2ddde4",
    "instruction": "You are a helpful assistant that provides information about DigitalOcean customer accounts. Your role is to help users understand their account details, team information, resource usage, and account status.",
    "description": "AI agent for retrieving and explaining DigitalOcean account information",
    "project_id": "YOUR_PROJECT_ID",
    "tags": ["droplet-info"],
    "region": "tor1"
  }'
```

Required parameters:

- `name`: A descriptive name for your agent
- `model_uuid`: The UUID of the language model to use
- `instruction`: System prompt that defines the agent's purpose and behavior
- `region`: The datacenter region where the agent will be deployed

Optional parameters:

- `description`: A brief description of the agent's purpose
- `project_id`: The project to associate the agent with
- `tags`: Array of tags for organizing your agents

Make sure to replace `$API_TOKEN` with your actual API token and `YOUR_PROJECT_ID` with your project's ID.

## Step 4 - Connecting Your Function to the Agent

Connecting your function to the AI agent is essential for enabling real-time data retrieval and intelligent decision-making. This step ensures that your agent can access up-to-date information directly from your DigitalOcean environment, enhancing its capabilities beyond static responses.

The final step is to link your function to the agent. You can do this either through the web interface or using the [API](https://docs.digitalocean.com/reference/api/digitalocean//#tag/GenAI-Platform-(Public-Preview)):

### Option 1 - Web Interface

The web interface provides a user-friendly way to create and manage AI agents without requiring extensive programming knowledge. This option is ideal for users who prefer a graphical interface over command-line interactions.

1. Navigate to the Resources tab in the agent playground
2. Add a function route
3. Select your namespace and function
4. Provide function instructions to guide when the agent should call the function
   1. `Call this function when the user asks about their DigitalOcean droplets, virtual machines, instances, or servers. Use this function to retrieve information about one or more droplets in a DigitalOcean account.`
5. Define input and output schemas to help the language model understand how to use the function

### Option 2 - API

Using the API provides a programmatic way to create and manage AI agents, offering flexibility and automation that may not be available through the web interface. This approach is particularly useful for developers and organizations that require custom integrations, large-scale deployments, or automated agent management.

You can also connect functions to your agent programmatically using the [DigitalOcean API](https://docs.digitalocean.com/reference/api/digitalocean//#tag/GenAI-Platform-(Public-Preview)). Here's an example using `curl`:

```bash
curl -X POST \
-H "Content-Type: application/json"  \
-H "Authorization: Bearer $API_TOKEN" \
"https://api.digitalocean.com/v2/gen-ai/agents/1b418231-b7d6-11ef-bf8f-4e013e2ddde4/functions" \
-d '{
  "agent_uuid": "1b418231-b7d6-11ef-bf8f-4e013e2ddde4",
  "function_name": "droplet",
  "description": "Call this function when the user asks about their DigitalOcean droplets, virtual machines, instances, or servers. Use this function to retrieve information about one or more droplets in a DigitalOcean account.",
  "input_schema": {
      "droplet_id": {
        "required": false,
        "description": "Specific droplet ID to retrieve information for. If not provided, returns a list of droplets",
        "type": "string"
      },
      "tag": {
        "description": "Filter droplets by tag",
        "type": "string",
        "required": false
      },
      "limit": {
        "type": "number",
        "required": false,
        "description": "Maximum number of droplets to return (default: 10)"
      }
    },
  "output_schema": {
      "droplets": {
        "type": "string",
        "description": "JSON string containing list of droplet information"
      },
      "count": {
        "type": "number",
        "description": "Total number of droplets returned"
      },
      "error": {
        "type": "string",
        "required": false,
        "description": "Error message if the request failed"
      },
      "status": {
        "type": "string",
        "description": "Status of the API request (success or error)"
      }
    }'
```

Required parameters:

- `agent_uuid`: The UUID of your agent
- `function_name`: A name for the function route
- `input_schema`: JSON schema defining the function's input parameters
- `output_schema`: JSON schema defining the function's return values
- `faas_namespace`: Your Functions namespace ID
- `faas_name`: The path to your function (namespace/function-name)

Optional parameters:

- `description`: Instructions for when the agent should use this function

### Example Input Schema for Droplet Function

The input schema specifies parameters the agent can send to your function (like droplet ID).

```json
{
  "droplet_id": {
    "required": false,
    "description": "Specific droplet ID to retrieve information for. If not provided, returns a list of droplets",
    "type": "string"
  },
  "tag": {
    "description": "Filter droplets by tag",
    "type": "string",
    "required": false
  },
  "limit": {
    "type": "number",
    "required": false,
    "description": "Maximum number of droplets to return (default: 10)"
  }
}
```

### Example Output Schema

The output schema helps the agent interpret the returned data.

```json
{
  "droplets": {
    "type": "string",
    "description": "JSON string containing list of droplet information"
  },
  "count": {
    "type": "number",
    "description": "Total number of droplets returned"
  },
  "error": {
    "type": "string",
    "required": false,
    "description": "Error message if the request failed"
  },
  "status": {
    "type": "string",
    "description": "Status of the API request (success or error)"
  }
}
```

## Testing Your AI Agent

With everything set up, you can now ask your agent questions about your DigitalOcean account:

- "What droplets do I have in my account?"
- "Tell me more about droplet [ID]"

The agent will call your function, retrieve the information from the DigitalOcean API in real-time, and provide you with an intelligent response.

### Potential Issues and Debugging

While testing, you may encounter some common issues:

- **Incorrect API responses**: Ensure your DigitalOcean API token is correct and has the necessary permissions.
- **Function execution errors**: Check [function logs](https://docs.digitalocean.com/products/functions/how-to/forward-logs/) using `doctl serverless logs` to debug runtime issues.
- **Agent not responding correctly**: Verify the function is properly linked to the agent and the schemas are correctly defined.
- **Deployment issues**: If the function does not deploy, confirm that dependencies are correctly installed in your build script.

## FAQs

### 1. What is the primary benefit of using DigitalOcean's Gradient platform for building AI agents?

The primary benefit is the ability to create [AI agents](https://www.digitalocean.com/community/tutorials/build-ai-agent-chatbot-with-genai-platform) that can connect to APIs and deliver real-time information without the need for complex infrastructure. This platform offers a streamlined path to building intelligent, API-connected agents, making advanced AI capabilities accessible to developers of all skill levels.

### 2. Can I use DigitalOcean's Gradient Platform for various use cases?

Yes, the platform is versatile and can be applied to a wide range of use cases. For instance, you can leverage [Gradient Platform](https://www.digitalocean.com/products/gradientai/platform) to build internal tools that streamline business operations, such as automating workflows or generating reports.

Additionally, you can use the platform to develop customer-facing applications that provide personalized experiences, like chatbots or virtual assistants. Furthermore, Gradient is suitable for data analysis solutions that require real-time data and insights, enabling you to make informed decisions or identify trends. The possibilities are vast, and the platform's flexibility allows you to adapt it to your specific needs and goals.

### 3. What is the advantage of combining serverless functions with large language models on DigitalOcean's Gradient platform?

The integration of serverless [functions](https://www.digitalocean.com/products/functions) with large language models on DigitalOcean's [Gradient Platform](https://www.digitalocean.com/products/gradientai/platform) offers a significant advantage. It enables developers of all skill levels to access advanced AI capabilities, providing a simplified and efficient way to build intelligent agents that can seamlessly connect to APIs. This combination empowers developers to focus on creating innovative AI solutions without worrying about the underlying infrastructure, making it an ideal choice for a wide range of applications.

## Conclusion

DigitalOcean's Gradient platform offers a powerful yet accessible way to build AI agents that can connect to APIs and deliver real-time information. This approach eliminates the need for complex infrastructure while enabling sophisticated AI solutions.

The example we've walked through is just the beginning. You can apply the same principles to create agents that interact with any API, providing real-time data and insights for various use cases. Whether you're looking to build internal tools, customer-facing applications, or data analysis solutions, DigitalOcean's Gradient platform offers a streamlined path to intelligent, API-connected agents.

By combining the flexibility of serverless functions with the power of large language models, DigitalOcean has created a platform that makes advanced AI capabilities accessible to developers of all skill levels.
