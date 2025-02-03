---
title: How I used GPT-4o to rewrite and improve all my Home Assistant automation titles and descriptions.
slug: home-assistant-automation-rewrite-llm-gpt4o
date: 2024-07-12T18:00:00.000Z
excerpt: A technical walkthrough of using GPT-4o to automatically generate clear, descriptive titles and descriptions for Home Assistant automations from their YAML configurations.
category: "Home Automation, Language Models"
---

Over the years, I've set up multiple automations using Home Assistant. I'll admit I've been lazy when it comes to naming and describing these automations. Adding a quick keyword or two and calling it a day. As an example, an automation that turns on a light when a car is detected might simply be called "car light".

Recently, I decided it was time for a change. I wanted to give my Home Assistant setup the polish it deserves, starting with clear, descriptive titles and explanations for each automation. But the thought of manually rewriting dozens (or maybe hundreds) of automations was daunting. That's when I had an idea: why not leverage AI to do the heavy lifting?

## The Process: From YAML to AI and Back Again

To accomplish this task, I created a series of scripts to transform my basic automation labels into detailed, contextual descriptions. Here's a breakdown of the process:

### 1. Converting YAML to JSON

First, I needed to convert my Home Assistant `automations.yaml` file into a JSON format:

```bash
#!/bin/bash
yq eval -o=json automations.yaml > automations.json
```

This script takes my YAML file and outputs a JSON version, making it easier to work with in the subsequent steps.

### 2. Splitting JSON into Individual Files

Next, I split the large JSON file into individual files for each automation. This makes it easier to process them one by one. Here's a snippet of the [Python script](https://github.com/jkpe/home-assistant-rewrite-automations-ai) that handles this:

```python
def split_json_into_files(json_file, output_dir):
    with open(json_file, 'r') as file:
        data = json.load(file)
    
    for item in data:
        file_name = f"{item['id']}.json"
        file_path = os.path.join(output_dir, file_name)
        with open(file_path, 'w') as out_file:
            json.dump(item, out_file, indent=4)
```

This script creates a separate JSON file for each automation, named after its ID.

### 3. The AI Magic: Rewriting with LLM

Now comes the exciting part – using AI to rewrite the automation titles and descriptions. For this, I used a CLI tool called `llm` (https://llm.datasette.io/en/stable/) which interfaces with GPT-4o. Here's a key part of the script:

```python
def call_llm(file_path):
    command = f'cat {file_path} | llm -m gpt-4o --no-stream -s "Based on what this Home Assistant automation does and how it works, rewrite a new Alias and Description for it. In your response just give me the updated alias and description. Respond with JSON objects."'
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return result.stdout.strip()
```

This function reads each automation file, sends its content to the LLM, and asks it to generate a new alias and description based on what the automation does. The AI then returns a JSON object with the updated information.

### 4. Converting JSON Back to YAML

After processing all automations, the final step is to convert the updated JSON files back to YAML format, ready to be used in Home Assistant. For this, I use a [Python script](https://github.com/jkpe/home-assistant-rewrite-automations-ai) that utilizes the ruamel.yaml library:

```python
from ruamel.yaml import YAML
import json
import os

yaml = YAML()
yaml.preserve_quotes = True
yaml.indent(mapping=2, sequence=4, offset=2)

def convert_json_to_yaml(json_dir, output_file):
    yaml_data = []
    for filename in os.listdir(json_dir):
        if filename.endswith('.json'):
            with open(os.path.join(json_dir, filename), 'r') as json_file:
                json_data = json.load(json_file)
                yaml_data.append(json_data)
    
    with open(output_file, 'w') as yaml_file:
        yaml.dump(yaml_data, yaml_file)

# Usage
json_directory = 'path/to/json/files'
output_yaml_file = 'automations.yaml'
convert_json_to_yaml(json_directory, output_yaml_file)
```

This script reads all the JSON files in a directory, converts them to YAML format, and writes them to a single YAML file, preserving the structure and formatting required by Home Assistant.

## The Results

After running these scripts, my Home Assistant automations were transformed. Instead of cryptic labels like "car light", I now have clear, descriptive titles and explanations for each automation. For example:

- Before: "car light"
- After: "Driveway Illumination on Vehicle Detection"
  Description: "This automation activates the exterior lights when a vehicle is detected entering the driveway, enhancing safety and visibility during nighttime arrivals."

## Conclusion

By leveraging AI, I was able to quickly and efficiently improve the organization and clarity of my Home Assistant setup.

While AI isn't a magic solution for everything, this project demonstrates how it can be a powerful tool for enhancing and streamlining our smart home setups.

As AI continues to evolve, I'm excited to explore more ways it can help improve our home automation experiences.

If you're interested in trying this out for your own Home Assistant setup, don't forget to check out the complete set of scripts in my GitHub repository: [jkpe/home-assistant-rewrite-automations-ai](https://github.com/jkpe/home-assistant-rewrite-automations-ai). Feel free to use, modify, and improve upon these scripts for your own smart home needs!
