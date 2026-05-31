with open('app.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# Let's search for functions that handle switching between sections,
# e.g., showSection, activeSection, dsGoToHub, etc.
lines = js.splitlines()
matches = []
for idx, line in enumerate(lines, 1):
    if 'showsection' in line.lower() or 'gotohub' in line.lower() or 'activesection' in line.lower() or 'display' in line.lower():
        if 'function' in line or 'switch' in line or 'block' in line:
            matches.append((idx, line))

print(f"Found {len(matches)} navigation related lines in app.js:")
for idx, line in matches[:40]:
    line_safe = line.strip().encode('ascii', errors='replace').decode('ascii')
    print(f"  Line {idx}: {line_safe[:120]}")
