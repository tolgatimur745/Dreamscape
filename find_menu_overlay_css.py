with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('style.css', 'r', encoding='utf-8', errors='ignore') as f:
    css = f.read()

with open('new_styles.css', 'r', encoding='utf-8', errors='ignore') as f:
    new_css = f.read()

print("Checking for '.menu-overlay' in styles:")
print(f"  index.html: {html.count('.menu-overlay')} times")
print(f"  style.css: {css.count('.menu-overlay')} times")
print(f"  new_styles.css: {new_css.count('.menu-overlay')} times")
