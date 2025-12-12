import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove CSS between </head> and <body> tags
pattern = r'(</head>\s*<body>\s*<!-- Action Buttons -->\s*)(.*?)(\s*<div class="action-buttons")'
match = re.search(pattern, content, re.DOTALL)

if match:
    # Keep the first part, remove CSS, keep the last part
    new_content = match.group(1) + match.group(3)
    content = content[:match.start()] + new_content + content[match.end():]

# Also remove any remaining CSS blocks that might be floating
content = re.sub(r'^\s*--[^:]+:\s*[^;]+;.*?$', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*@media[^}]+}.*?$', '', content, flags=re.MULTILINE | re.DOTALL)
content = re.sub(r'^\s*\.[^{]+{[^}]+}.*?$', '', content, flags=re.MULTILINE | re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS removido")

