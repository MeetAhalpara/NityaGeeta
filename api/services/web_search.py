import os
import logging
import asyncio
import httpx
import urllib.parse
import re
from html.parser import HTMLParser
from typing import List, Dict, Any

logger = logging.getLogger("nityageeta.web_search")

class DDGParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.results = []
        self.current_title = ""
        self.current_snippet = ""
        self.current_href = ""
        self.in_title = False
        self.in_snippet = False

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == "a" and "result__a" in attrs_dict.get("class", ""):
            self.in_title = True
            self.current_href = attrs_dict.get("href", "")
        elif tag == "a" and "result__snippet" in attrs_dict.get("class", ""):
            self.in_snippet = True

    def handle_endtag(self, tag):
        if tag == "a":
            if self.in_title:
                self.in_title = False
            if self.in_snippet:
                self.in_snippet = False
                if self.current_title and self.current_snippet:
                    clean_url = self.current_href
                    if "uddg=" in clean_url:
                        clean_url = urllib.parse.unquote(clean_url.split("uddg=")[-1].split("&")[0])
                    self.results.append({
                        "title": re.sub(r'\s+', ' ', self.current_title).strip(),
                        "snippet": re.sub(r'\s+', ' ', self.current_snippet).strip(),
                        "url": clean_url,
                        "source": "Web Search"
                    })
                    self.current_title = ""
                    self.current_snippet = ""

    def handle_data(self, data):
        if self.in_title:
            self.current_title += data
        if self.in_snippet:
            self.current_snippet += data

def _extract_domain(url: str) -> str:
    """Helper to extract clean domain name from URL."""
    try:
        domain = urllib.parse.urlparse(url).netloc.replace("www.", "").strip()
        return domain if domain else "Web"
    except Exception:
        return "Web"

async def _search_tavily(query: str, api_key: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Searches via Tavily AI Search API."""
    try:
        url = "https://api.tavily.com/search"
        payload = {
            "api_key": api_key.strip(),
            "query": query,
            "max_results": max_results,
            "search_depth": "basic"
        }
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("results", []):
                    item_url = item.get("url", "")
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("content", "") or item.get("snippet", ""),
                        "url": item_url,
                        "source": _extract_domain(item_url)
                    })
                if results:
                    logger.info(f"Retrieved {len(results)} search results via Tavily.")
                    return results
    except Exception as e:
        logger.warning(f"Tavily search API error: {e}")
    return []

async def _search_serper(query: str, api_key: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Searches via Serper Google Search API (POST to google.serper.dev/search)."""
    try:
        url = "https://google.serper.dev/search"
        headers = {
            "X-API-KEY": api_key.strip(),
            "Content-Type": "application/json"
        }
        payload = {"q": query, "num": max_results}
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("organic", []):
                    item_url = item.get("link", "")
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "url": item_url,
                        "source": _extract_domain(item_url)
                    })
                if results:
                    logger.info(f"Retrieved {len(results)} search results via Serper.")
                    return results
    except Exception as e:
        logger.warning(f"Serper search API error: {e}")
    return []

async def _search_serpapi(query: str, api_key: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Searches via SerpAPI Google Search."""
    try:
        url = f"https://serpapi.com/search.json?q={urllib.parse.quote(query)}&api_key={api_key.strip()}"
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data.get("organic_results", [])[:max_results]:
                    item_url = item.get("link", "")
                    results.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "url": item_url,
                        "source": _extract_domain(item_url)
                    })
                if results:
                    logger.info(f"Retrieved {len(results)} search results via SerpAPI.")
                    return results
    except Exception as e:
        logger.warning(f"SerpAPI search error: {e}")
    return []


async def search_web_async(query: str, max_results: int = 4) -> List[Dict[str, str]]:
    """Executes live web search using Tavily, Serper, SerpAPI, or DuckDuckGo fallback."""
    search_term = f"Bhagavad Gita {query}" if "gita" not in query.lower() else query
    logger.info(f"Executing web search for: '{search_term}'")
    
    # 1. Tavily API
    tavily_key = os.getenv("TAVILY_API_KEY")
    if tavily_key and tavily_key.strip():
        tavily_res = await _search_tavily(search_term, tavily_key, max_results)
        if tavily_res:
            return tavily_res

    # 2. Serper API
    serper_key = os.getenv("SERPER_API_KEY")
    if serper_key and serper_key.strip():
        serper_res = await _search_serper(search_term, serper_key, max_results)
        if serper_res:
            return serper_res

    # 3. SerpAPI
    serp_key = os.getenv("SERPAPI_KEY")
    if serp_key and serp_key.strip():
        serp_res = await _search_serpapi(search_term, serp_key, max_results)
        if serp_res:
            return serp_res

    # 4. DuckDuckGo Parser Fallback
    encoded_query = urllib.parse.quote(search_term)
    url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9"
    }
    
    try:
        async with httpx.AsyncClient(timeout=6.0, follow_redirects=True) as client:
            r = await client.get(url, headers=headers)
            if r.status_code == 200:
                parser = DDGParser()
                parser.feed(r.text)
                results = parser.results[:max_results]
                logger.info(f"Retrieved {len(results)} web search results via DuckDuckGo.")
                return results
    except Exception as e:
        logger.warning(f"DuckDuckGo search execution error: {e}")
        
    return []

