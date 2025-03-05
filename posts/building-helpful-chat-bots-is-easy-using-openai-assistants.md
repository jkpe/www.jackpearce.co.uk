---
title: Building helpful contextual chat bots is easy using OpenAI's Assistants (part 1)
slug: building-helpful-chat-bots-is-easy-using-openai-assistants
date: 2023-11-09T06:27:00.000Z
excerpt: How I used OpenAI GPT-4 and OpenAI Assistants to build a bot that answers questions around DigitalOcean's documentation.
category: "Language Models"
---

I think it was around August 2022 I first learnt about DALL·E and my mind was totally blown.

Today, I'm going to show how I used OpenAI GPT-4 and OpenAI Assistants to build a bot that answers questions around DigitalOcean's documentation.

### Throughout this blog post the input from me really isn't anything special, I want to show how large language models such as GPT-4 enable human beings to achieve things in hours that would have previously taken months.

Ok, so let's ask ChatGPT for help with all of this. I know that ChatGPT recently announced their [Assistants API](https://platform.openai.com/docs/assistants/overview) so perhaps we can use this to build our bot.

Creating an assistant looks pretty straight forward, it requires a few inputs such as:

1. Design a prompt for it
2. Enable the Retrieval tool which will allow the assistant to reference files to find it's answers, i.e a CSV containing all of DigitalOcean's documentation.

So first let's scrape [DigitalOcean's incredible documentation](https://docs.digitalocean.com) into a CSV. I asked ChatGPT to help write a python script to achieve this.

I wanted to only scrape the titles of each article and then the main content. Each page has a sidebar, navigation, and last updated/created dates and I wanted to exclude this from our CSV.

✋

**17th Nov 23**: Builder.io has built a tool that scrapes into a format GPT is compatible with, check it out here: [**BuilderIO/gpt-crawler**](https://github.com/BuilderIO/gpt-crawler)

    Write a web scraper using Python and BeautifulSoup.
    Sample Target: https://docs.digitalocean.com
    Rationale: Scrape the content from every how-to article on the target page.
    CSS selectors are as follows:
    1. Title: #body-inner > h1
    2. Content: #body-inner
    
    Output: Save all the Titles and Content for all the pages in a CSV file
    Additional Instructions: Handle character encoding and remove undesirable symbols in the output CSV.

**My prompt to GPT**

You can see the full conversation [here](https://chat.openai.com/share/96f2719c-0c7a-4b51-a6e8-91faa05933ea), I started with this prompt that I found online and after some back and forth I ended up with a working Python script.

In addition to the above prompt I asked ChatGPT below, **ChatGPT responded with an updated, working script each time**

1. for article_urls I want it to read a sitemap.xml and get the URLs from there
2. thanks, I want the script to verbosely output each what it is doing to the console when I run it
3. thanks that worked, in each article that it is scraping the content contains two things that I want removed from the final CSV

The things that I want removed are:

1. 'Validated on 3 Oct 2023'
2. 'Last edited on 10 Oct 2023'

Note that these are just examples and the dates will be different for every scrape
4. thanks, add that to the overall script

    import csv
    import requests
    import re
    from bs4 import BeautifulSoup
    import xml.etree.ElementTree as ET
    
    # Function to clean text
    def clean_text(text):
        # Remove lines containing 'Validated on' and 'Last edited on'
        text = re.sub(r'Validated on \d{1,2} [A-Za-z]+ \d{4}', '', text)
        text = re.sub(r'Last edited on \d{1,2} [A-Za-z]+ \d{4}', '', text)
    
        # Replace HTML entities with their corresponding characters
        text = text.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<').replace('&quot;', '"').replace('&#39;', "'")
    
        # Additional step to remove extra whitespace
        text = ' '.join(text.split())
    
        return text
    
    # Function to fetch URLs from a sitemap
    def fetch_urls_from_sitemap(sitemap_url):
        print(f"Fetching sitemap: {sitemap_url}")
        response = requests.get(sitemap_url)
        response.encoding = 'utf-8'
        xml_content = response.text
        etree = ET.fromstring(xml_content)
        namespaces = {'ns': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        urlset = etree.findall('ns:url', namespaces=namespaces)
        urls = [url.find('ns:loc', namespaces=namespaces).text for url in urlset]
        print(f"Found {len(urls)} URLs in the sitemap.")
        return urls
    
    # List to hold all articles
    articles = []
    
    # Fetch URLs from the sitemap
    sitemap_url = 'https://docs.digitalocean.com/sitemap.xml'  # Replace with the actual sitemap URL
    article_urls = fetch_urls_from_sitemap(sitemap_url)
    
    for url in article_urls:
        print(f"Scraping article: {url}")
        try:
            response = requests.get(url)
            response.encoding = 'utf-8'
            html = response.text
    
            soup = BeautifulSoup(html, 'html.parser')
    
            title_tag = soup.select_one('#body-inner > h1')
            title = clean_text(title_tag.get_text(strip=True)) if title_tag else 'No Title'
    
            content_tag = soup.select_one('#body-inner')
            content = clean_text(content_tag.get_text(strip=True)) if content_tag else 'No Content'
    
            articles.append({'title': title, 'content': content})
            print(f"Scraped: {title}")
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")
    
    # Write the data to a CSV file
    csv_file_name = 'articles.csv'
    with open(csv_file_name, 'w', newline='', encoding='utf-8') as file:
        writer = csv.DictWriter(file, fieldnames=['title', 'content'])
        writer.writeheader()
        writer.writerows(articles)
        print(f"Data written to {csv_file_name}")
    

**scrape.py**
![](https://static.jackpearce.co.uk/images/posts/2023/11/Screenshot-2023-11-09-at-14.11.31.png)**Scraping away...**
**Great!** Our Python script worked first time and it is now scraping DigitalOcean's documentation into a CSV.

Ok, so lets create an OpenAI Assistant, this part was really quite easy

1. Browse to [https://platform.openai.com/assistants](https://platform.openai.com/assistants) and hit Create
2. Give it a name
3. Enter the prompt, for this I used [GitHub Copilot's leaked prompt](https://github.com/jujumilk3/leaked-system-prompts/blob/main/github-copilot-chat_20230513.md) for inspiration
4. Select `gpt-4-1106-preview` as our model
5. Enable the Retrieval tool and upload our csv

For some reason it did not like our data in csv format despite it being a [supported format](https://platform.openai.com/docs/assistants/tools/supported-files) for Retrieval, instead it appeared to want JSON Lines. No worries! I'll just ask ChatGPT to convert our CSV into JSON Lines format.
![](https://static.jackpearce.co.uk/images/posts/2023/11/Screenshot-2023-11-09-at-14.49.38.png)**I am shaking my head in amazement at each step**
### **Awesome!** Now our Assistant is ready to take questions (yes, that fast)

I'm going to ask it a simple question but I'm not going to give it much context, lets see how it does in comparison to ChatGPT...

![](https://static.jackpearce.co.uk/images/posts/2023/11/Screenshot-2023-11-09-at-14.57.05-1.png)

![](https://static.jackpearce.co.uk/images/posts/2023/11/Screenshot-2023-11-09-at-14.58.33.png)

**Assistant on the left, GPT-4 on the right**

Great! **On the left** our Assistant gives a really detailed accurate answer and didn't ask for additional context

**On the right** GPT-4 who gives a really generic answer (as expected). When I tell ChatGPT I am referring to DigitalOcean App Platform it comes back with another generic answer that yes there is a free tier but it isn't sure on the details of that.
![](https://static.jackpearce.co.uk/images/posts/2023/11/Screenshot-2023-11-09-at-15.04.18.png)
I wanted to check our prompt was clear and our assistant was following the rules. In the prompt I don't tell it not to answer questions about other clouds just that it should stay on topic and not discuss opinions.

### Stay tuned for part two where we piece this together by interfacing with our Assistant through a custom frontend.
