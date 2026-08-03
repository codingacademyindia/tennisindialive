import time
from urllib.parse import urlparse

from lxml import html
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

options = Options()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
try:
    driver.get("https://www.wtatennis.com/tournaments")
    time.sleep(8)
    for _ in range(12):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.2)

    tree = html.fromstring(driver.page_source)
    anchors = tree.xpath("//a[contains(@href, '/tournaments/')]")
    hrefs = []
    for a in anchors:
        h = (a.get('href') or '').strip()
        if not h:
            continue
        if h.startswith('//'):
            h = 'https:' + h
        elif h.startswith('/'):
            h = 'https://www.wtatennis.com' + h
        hrefs.append(h)

    unique = sorted(set(hrefs))
    print('total anchors', len(anchors), 'unique links', len(unique))

    tourney_like = [u for u in unique if '/tournaments/' in urlparse(u).path and 'tickets' not in u and 'wta-125' not in u]
    print('tourney_like', len(tourney_like))
    for u in tourney_like[:120]:
        print(u)
finally:
    driver.quit()
