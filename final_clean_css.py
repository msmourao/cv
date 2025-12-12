with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

output = []
skip = False

for i, line in enumerate(lines):
    # Start skipping after action-buttons div opens
    if '<div class="action-buttons"' in line and 'id="action-buttons-template"' in line:
        output.append(line)
        skip = True
        continue
    
    # Stop skipping when we find action-buttons-container
    if skip and '<div class="action-buttons-container">' in line:
        skip = False
        output.append(line)
        continue
    
    # Also stop skipping if we find another </head> or <body> (duplicate)
    if skip and ('</head>' in line or '<body>' in line):
        # Skip these duplicate tags
        continue
    
    # Skip CSS lines
    if skip:
        continue
    
    output.append(line)

with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(output)

print("CSS removido completamente")

