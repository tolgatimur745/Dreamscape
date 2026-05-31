with open('app.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()
    print('window.onload:', text.find('window.onload'))
    print('DOMContentLoaded:', text.find('DOMContentLoaded'))
    print('initApp():', text.find('initApp('))
