import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('app.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# Find all getElementById calls
get_id_patterns = [
    r"getElementById\(['\"]([^'\"]+)['\"]\)",
    r"querySelector\(['\"]#([^'\"]+)['\"]\)"
]

js_ids = set()
for pat in get_id_patterns:
    for match in re.finditer(pat, js):
        js_ids.add(match.group(1))

print(f"Found {len(js_ids)} unique IDs referenced in app.js. Checking if they exist in index.html...")

missing_ids = []
for el_id in sorted(js_ids):
    # check if id="..." exists in html
    id_pattern = f'id="{el_id}"'
    id_pattern_single = f"id='{el_id}'"
    if id_pattern not in html and id_pattern_single not in html:
        missing_ids.append(el_id)

if missing_ids:
    print(f"\nWARNING: Found {len(missing_ids)} IDs referenced in app.js that are missing from index.html:")
    for m_id in missing_ids:
        print(f"  - {m_id}")
else:
    print("\nSUCCESS: All IDs referenced in app.js exist in index.html!")
