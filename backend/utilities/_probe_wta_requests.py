import requests
from lxml import html

url = "https://www.wtatennis.com/tournaments"
response = requests.get(url, timeout=60, headers={"User-Agent": "Mozilla/5.0"})
print("status", response.status_code, "len", len(response.text))

tree = html.fromstring(response.content)
anchors = tree.xpath("//a[contains(@href, '/tournaments/')]")
print("anchors", len(anchors))

for anchor in anchors[:120]:
    href = (anchor.get("href") or "").strip()
    text = " ".join(anchor.xpath(".//text()"))
    text = " ".join(text.split())
    if href:
        print(href, "|", text[:120])
