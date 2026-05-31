with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
# Look for sections in index.html that might be games of chance
# E.g., slot, blackjack, rulet, çark, coin, dice, etc.
sections = re.findall(r'<section class="section ds-section" id="([^"]+)">', html)
print("Sections in index.html:")
for s in sections:
    print(f"  - {s}")
