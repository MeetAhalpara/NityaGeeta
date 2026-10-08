"""
tests/test_playwright_e2e.py
────────────────────────────
Python Playwright End-to-End Browser Test Suite for NityaGeeta:
Validates headless Chromium execution, DOM manipulation, and UI assertion.
"""

import pytest


def test_playwright_browser_launch(page):
    """Verifies Playwright Chromium launches headlessly and interacts with DOM."""
    page.set_content("""
        <html>
            <head><title>NityaGeeta - Eternal Wisdom</title></head>
            <body>
                <header>
                    <h1 id="app-title">NityaGeeta</h1>
                    <span id="domain-badge">nityageeta.tech</span>
                </header>
                <main>
                    <div id="verse-card" data-chapter="2" data-verse="47">
                        <p class="sanskrit">कर्मण्येवाधिकारस्ते मा फलेषु कदाचन</p>
                        <p class="translation">You have a right to perform your prescribed duty...</p>
                    </div>
                </main>
            </body>
        </html>
    """)

    assert page.title() == "NityaGeeta - Eternal Wisdom"
    assert page.inner_text("#app-title") == "NityaGeeta"
    assert page.inner_text("#domain-badge") == "nityageeta.tech"
    assert page.is_visible("#verse-card") is True
    assert "कर्मण्येवाधिकारस्ते" in page.inner_text(".sanskrit")


def test_playwright_interactive_counter_and_input(page):
    """Simulates user interaction, button click, and input events in Playwright."""
    page.set_content("""
        <html>
            <body>
                <input id="search-input" type="text" placeholder="Search Bhagavad Gita" />
                <button id="search-btn" onclick="document.getElementById('status').innerText = 'Querying: ' + document.getElementById('search-input').value">Search</button>
                <div id="status">Idle</div>
            </body>
        </html>
    """)

    page.fill("#search-input", "BG 2.47 duty without attachment")
    page.click("#search-btn")

    status_text = page.inner_text("#status")
    assert status_text == "Querying: BG 2.47 duty without attachment"
