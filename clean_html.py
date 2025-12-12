with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and remove all CSS between action-buttons div and action-buttons-container
import re

# Pattern to match CSS between action-buttons opening and action-buttons-container
pattern = r'(<div class="action-buttons"[^>]*>)\s*(.*?)(<div class="action-buttons-container">)'

def clean_css(match):
    opening = match.group(1)
    css_content = match.group(2)
    container = match.group(3)
    
    # Remove all CSS-like content
    lines = css_content.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()
        # Skip CSS
        if (stripped.startswith('@') or 
            stripped.startswith(':root') or
            stripped.startswith('*') or
            stripped.startswith('body') or
            stripped.startswith('.') or
            stripped.startswith('/*') or
            stripped.startswith('*/') or
            stripped == '}' or
            stripped == '{' or
            (stripped and not stripped.startswith('<') and ('{' in line or '}' in line or ':' in line and not line.strip().startswith('<!--')))):
            continue
        cleaned.append(line)
    
    return opening + '\n' + container

content = re.sub(pattern, clean_css, content, flags=re.DOTALL)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS removido")

