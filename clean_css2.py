import re

with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find where </head> ends and <body> starts
head_end = -1
body_start = -1
action_buttons_start = -1

for i, line in enumerate(lines):
    if '</head>' in line:
        head_end = i
    if head_end >= 0 and '<body>' in line:
        body_start = i
    if body_start >= 0 and '<!-- Action Buttons -->' in line:
        action_buttons_start = i
        break

if head_end >= 0 and body_start >= 0 and action_buttons_start >= 0:
    # Remove everything between </head> and <!-- Action Buttons -->
    new_lines = lines[:head_end+1] + lines[action_buttons_start:]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"Removido CSS das linhas {head_end+2} até {action_buttons_start-1}")
else:
    print("Não foi possível encontrar os marcadores")

