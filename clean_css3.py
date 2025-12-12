import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove everything between </head> and <div class="action-buttons">
pattern = r'(</head>\s*<body>\s*<!-- Action Buttons -->\s*)(.*?)(\s*<div class="action-buttons")'
replacement = r'\1\3'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Also remove any remaining CSS-like lines (variables, media queries, etc.)
lines = content.split('\n')
cleaned_lines = []
skip = False

for i, line in enumerate(lines):
    # Skip CSS variable declarations
    if re.match(r'^\s*--[^:]+:\s*[^;]+;', line):
        continue
    # Skip closing braces that are part of CSS
    if re.match(r'^\s*\}\s*$', line) and i > 0 and any('--' in lines[j] for j in range(max(0, i-20), i)):
        continue
    # Skip @media blocks
    if '@media' in line:
        skip = True
        continue
    if skip and '}' in line and line.count('}') >= line.count('{'):
        skip = False
        continue
    if skip:
        continue
    # Skip CSS class definitions that are floating
    if re.match(r'^\s*\.[a-zA-Z-]+\s*\{', line):
        skip = True
        continue
    if skip and '}' in line:
        skip = False
        continue
    
    cleaned_lines.append(line)

content = '\n'.join(cleaned_lines)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS removido")

