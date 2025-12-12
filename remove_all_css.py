with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
in_css_removal = False
found_lang_switch = False

for i, line in enumerate(lines):
    # Detect language-switch opening
    if '<div class="language-switch">' in line:
        found_lang_switch = True
        output.append(line)
        in_css_removal = True
        continue
    
    # If we're removing CSS after language-switch
    if in_css_removal:
        stripped = line.strip()
        # Stop when we find the button
        if '<button id="lang-pt"' in line:
            in_css_removal = False
            output.append(line)
            continue
        # Skip CSS lines
        if (stripped.startswith('--') or
            stripped.startswith('@') or
            stripped.startswith(':') or
            stripped.startswith('*') or
            stripped.startswith('.') or
            stripped.startswith('/*') or
            stripped.startswith('*/') or
            stripped == '}' or
            stripped == '{' or
            (stripped and not stripped.startswith('<') and ('{' in line or '}' in line or (':' in line and not '<!--' in line)))):
            continue
        # If it's an empty line, skip
        if not stripped:
            continue
    
    output.append(line)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("CSS removido")
