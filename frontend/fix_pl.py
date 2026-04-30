import os
import glob
import re

files = glob.glob('src/**/*.tsx', recursive=True)
count = 0
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # We want to find absolute Search icons and make sure the input following them has pl-12
    pattern = r'(<Search[^>]*absolute[^>]*>.*?(?:<input|<Input)[^>]*className=[\"\'\{][^\"]*)(pl-\d+)(.*?)'
    
    def replacer(match):
        return match.group(1) + 'pl-12' + match.group(3)
        
    new_content = re.sub(pattern, replacer, content, flags=re.DOTALL)
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print('Updated:', f)
        count += 1
print('Total updated:', count)
