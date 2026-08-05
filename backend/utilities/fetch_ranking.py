from lxml import html

# Example HTML content (can be from a file or fetched from a URL)
html_content = '''
<html>
  <body>
    <div>
      <h1>Welcome to Tennis India Live</h1>
      <p id="intro">Track Indian tennis player scores and stats.</p>
      <a href="https://www.tennisindialive.com" class="link">Visit Us</a>
    </div>
  </body>
</html>
'''

# Parse the HTML content
tree = html.fromstring(html_content)

# Use XPath to get the h1 tag content
h1_text = tree.xpath('//h1/text()')
print("H1 Text:", h1_text)

# Use XPath to get the href attribute of the anchor tag
link_href = tree.xpath('//a/@href')
print("Link Href:", link_href)

# Use XPath to get the text inside the p tag with a specific id
p_text = tree.xpath('//p[@id="intro"]/text()')
print("Paragraph Text:", p_text)
