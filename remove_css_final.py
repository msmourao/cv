with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
in_css_block = False
found_container = False

for i, line in enumerate(lines):
    # Detect action-buttons-container opening
    if '<div class="action-buttons-container">' in line:
        found_container = True
        output.append(line)
        continue
    
    # If we found container, skip CSS until we find language-switch
    if found_container and not in_css_block:
        stripped = line.strip()
        # Check if this is CSS (not HTML)
        if (stripped.startswith(':root') or
            stripped.startswith('@media') or
            stripped.startswith('*') or
            stripped.startswith('body') or
            stripped.startswith('.') or
            stripped.startswith('/*') or
            stripped == '}' or
            stripped == '{' or
            (stripped and not stripped.startswith('<') and ('{' in line or '}' in line or (':' in line and not '<!--' in line)))):
            in_css_block = True
            continue
    
    # Skip CSS lines
    if in_css_block:
        stripped = line.strip()
        # Stop when we find HTML (language-switch or any HTML tag)
        if stripped.startswith('<div') or stripped.startswith('<!--'):
            in_css_block = False
            output.append(line)
        # Continue skipping CSS
        elif (stripped.startswith('@') or
              stripped.startswith(':') or
              stripped.startswith('*') or
              stripped.startswith('.') or
              stripped.startswith('/*') or
              stripped.startswith('*/') or
              stripped == '}' or
              stripped == '{' or
              (stripped and not stripped.startswith('<') and ('{' in line or '}' in line or ':' in line))):
            continue
        else:
            # Empty line or something else, skip if we're in CSS block
            if not stripped:
                continue
            # If it's not CSS, stop skipping
            in_css_block = False
            output.append(line)
    else:
        output.append(line)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("CSS removido completamente")

