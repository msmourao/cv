with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
skip_css = False
in_action_buttons = False

for i, line in enumerate(lines):
    # Detect when we enter action-buttons div
    if '<div class="action-buttons"' in line:
        in_action_buttons = True
        output.append(line)
        continue
    
    # Detect when we exit action-buttons div (find action-buttons-container)
    if in_action_buttons and '<div class="action-buttons-container">' in line:
        skip_css = False
        in_action_buttons = False
        output.append(line)
        continue
    
    # Skip CSS lines when in action-buttons but before container
    if in_action_buttons:
        stripped = line.strip()
        # Skip CSS-like content
        if (stripped.startswith('@media') or 
            stripped.startswith(':root') or
            stripped.startswith('*') or
            stripped.startswith('body') or
            stripped.startswith('.') or
            stripped.startswith('/*') or
            stripped.startswith('*/') or
            stripped == '}' or
            stripped == '{' or
            (stripped and not stripped.startswith('<') and ('{' in line or '}' in line or ':' in line))):
            continue
    
    output.append(line)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("CSS removido do action-buttons")

