import os
import re

count = 0
for root, _, files in os.walk('src'):
    for f in files:
        if not f.endswith('.tsx') and not f.endswith('.ts'):
            continue
        if f.endswith('.d.ts'):
            continue
        path = os.path.join(root, f)
        with open(path, 'r', encoding='utf-8') as fh:
            content = fh.read()
        cleaned = re.sub(r'^"use client";?\s*\n?', '', content)
        if cleaned != content:
            with open(path, 'w', encoding='utf-8') as fh:
                fh.write(cleaned)
            count += 1

print(f'Stripped "use client" from {count} files')
