with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove ALL CSS between language-switch and the closing of action-buttons-container
import re

# Pattern: Remove everything between language-switch opening and lang-en button
pattern1 = r'(<button id="lang-pt"[^>]*>PT</button>)\s*(.*?)(<button id="lang-en")'
def clean1(match):
    return match.group(1) + '\n                ' + match.group(3)

content = re.sub(pattern1, clean1, content, flags=re.DOTALL)

# Also remove any CSS that might be between other elements in action-buttons
# Remove lines that are CSS (not HTML) between action-buttons-container and its closing
lines = content.split('\n')
output = []
in_action_buttons = False
skip_css = False

for i, line in enumerate(lines):
    if '<div class="action-buttons-container">' in line:
        in_action_buttons = True
        output.append(line)
        continue
    
    if in_action_buttons:
        if '</div>' in line and '</div>' in lines[i+1] if i+1 < len(lines) else False:
            # Closing action-buttons-container
            in_action_buttons = False
            output.append(line)
            continue
        
        stripped = line.strip()
        # Skip CSS lines
        if (stripped.startswith('--') or
            (stripped.startswith('@') and 'media' in stripped) or
            (stripped.startswith(':') and 'root' in stripped) or
            (stripped.startswith('*') and '{' in line) or
            (stripped.startswith('body') and '{' in line) or
            (stripped.startswith('.') and '{' in line and not stripped.startswith('<!--')) or
            stripped == '}' or
            (stripped.startswith('/*') and not '-->' in line) or
            (stripped and not stripped.startswith('<') and '{' in line and '}' in line and ':' in line and not '<!--' in line)):
            continue
    
    output.append(line)

content = '\n'.join(output)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS removido completamente")

