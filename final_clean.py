import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the pattern: <!-- Action Buttons --> followed by CSS, then <div class="action-buttons">
# Remove everything between <!-- Action Buttons --> and <div class="action-buttons">
pattern = r'(<!-- Action Buttons -->\s*)(.*?)(\s*<div class="action-buttons")'
match = re.search(pattern, content, re.DOTALL)

if match:
    # Keep Action Buttons comment and div, remove CSS in between
    new_content = match.group(1) + match.group(3)
    content = content[:match.start()] + new_content + content[match.end():]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("CSS removido com sucesso")
else:
    print("Padrão não encontrado, tentando abordagem alternativa...")
    # Alternative: remove lines that look like CSS
    lines = content.split('\n')
    cleaned = []
    in_css_block = False
    
    for line in lines:
        # Detect start of CSS block after Action Buttons
        if '<!-- Action Buttons -->' in line:
            cleaned.append(line)
            in_css_block = True
            continue
        
        # Detect end of CSS block (start of action-buttons div)
        if in_css_block and '<div class="action-buttons"' in line:
            in_css_block = False
            cleaned.append(line)
            continue
        
        # Skip CSS lines
        if in_css_block:
            # Skip CSS variable declarations, media queries, class definitions, etc.
            if (re.match(r'^\s*--', line) or 
                re.match(r'^\s*@', line) or 
                re.match(r'^\s*\.', line) or 
                re.match(r'^\s*\*', line) or
                re.match(r'^\s*[a-z-]+\s*\{', line) or
                re.match(r'^\s*\}', line) or
                re.match(r'^\s*/\*', line) or
                re.match(r'^\s*\*/', line) or
                (line.strip() and not line.strip().startswith('<'))):
                continue
        
        cleaned.append(line)
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write('\n'.join(cleaned))
    print("CSS removido (método alternativo)")

