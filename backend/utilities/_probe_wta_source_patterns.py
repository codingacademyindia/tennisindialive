import re
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
    for _ in range(10):
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1.5)
    src = driver.page_source
    print("source_len", len(src))

    patterns = [
        r"/tournaments/\\d+/[a-z0-9-]+/\\d+",
        r"/tournaments/[a-z0-9-]+",
        r"WTA\\s*250",
        r"WTA\\s*500",
        r"WTA\\s*1000",
        r"Grand Slam",
        r"__NEXT_DATA__",
        r"window\\.__INITIAL_STATE__",
        r"application/ld\\+json",
        r"api",
    ]
    for p in patterns:
        c = len(re.findall(p, src, flags=re.IGNORECASE))
        print(p, c)

    # Print snippets near likely API/data markers.
    for marker in ["__NEXT_DATA__", "INITIAL_STATE", "tournaments", "calendar", "250k-tag.svg"]:
        idx = src.find(marker)
        if idx != -1:
            print("\nMARKER", marker, "AT", idx)
            print(src[max(0, idx - 250): idx + 500])
finally:
    driver.quit()
