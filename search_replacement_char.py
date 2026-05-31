with open('index.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

with open('app.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

print("Checking for '\\ufffd' ():")
print(f"  index.html: {html.count('\\ufffd')} / {html.count('')} times")
print(f"  app.js: {js.count('\\ufffd')} / {js.count('')} times")

# Let's also check for common double-encoded or raw Latin-1-decoded patterns in app.js
bad_patterns = ['Ã¼', 'Ä±', 'ÅŸ', 'Ã¶', 'Ã§', 'ÄŸ']
print("\nChecking for bad patterns in app.js:")
for p in bad_patterns:
    print(f"  '{p}': {js.count(p)} times")
