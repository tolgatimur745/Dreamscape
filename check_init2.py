import re
with open('app.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()
    print('init calls:')
    for match in re.finditer(r'\binit\w*\(', text):
        print(match.group())
    print('listeners:')
    for match in re.finditer(r'(window|document)\.addEventListener\([^)]*\)', text):
        print(match.group())
