import json
import time

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


options = Options()
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
try:
    driver.get("https://www.wtatennis.com/tournaments")
    time.sleep(8)
    for _ in range(6):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.8)

    links = driver.execute_script(
        """
        return Array.from(document.querySelectorAll('a[href*="/tournaments/"]')).map((a) => ({
            href: a.getAttribute('href') || '',
            text: (a.textContent || '').trim(),
            cls: a.className || ''
        }));
        """
    )
    print("count", len(links))
    print(json.dumps(links[:120], ensure_ascii=False)[:30000])
finally:
    driver.quit()
