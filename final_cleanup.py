with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove CSS between language-switch opening and button tags
import re

# Pattern 1: Remove CSS between language-switch div and button
pattern1 = r'(<div class="language-switch">)\s*(.*?)(<button id="lang-pt")'
def clean1(match):
    return match.group(1) + '\n                ' + match.group(3)

content = re.sub(pattern1, clean1, content, flags=re.DOTALL)

# Pattern 2: Remove any remaining CSS blocks that look like CSS variables or rules
# Remove lines that are CSS but not HTML between action-buttons-container and language-switch
pattern2 = r'(<div class="action-buttons-container">)\s*(.*?)(<div class="language-switch">)'
def clean2(match):
    return match.group(1) + '\n            ' + match.group(3)

content = re.sub(pattern2, clean2, content, flags=re.DOTALL)

# Also remove any standalone CSS lines that might be floating
lines = content.split('\n')
cleaned_lines = []
skip_next_few = False
skip_count = 0

for i, line in enumerate(lines):
    stripped = line.strip()
    
    # Skip CSS variable declarations and rules
    if (stripped.startswith(':root') or
        stripped.startswith('@media') or
        (stripped.startswith('--') and ':' in stripped) or
        (stripped.startswith('*') and '{' in line) or
        (stripped.startswith('body') and '{' in line) or
        (stripped.startswith('.') and '{' in line and not stripped.startswith('<!--')) or
        stripped == '}' or
        (stripped.startswith('/*') and '===' in stripped) or
        (stripped and not stripped.startswith('<') and '{' in line and '}' in line and ':' in line)):
        continue
    
    cleaned_lines.append(line)

content = '\n'.join(cleaned_lines)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("CSS removido")

