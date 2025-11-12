#!/usr/bin/env python3
"""
Simple JavaScript minifier
Usage: python minify.py
"""

import re
import os

def minify_js(code):
    """Minify JavaScript code by removing comments and whitespace"""
    
    # Remove single-line comments (but preserve URLs)
    code = re.sub(r'//[^\n]*', '', code)
    
    # Remove multi-line comments
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    
    # Remove extra whitespace (but keep spaces in strings)
    # First, protect strings
    strings = []
    def protect_string(match):
        strings.append(match.group(0))
        return f'__STRING_{len(strings)-1}__'
    
    code = re.sub(r'["\'][^"\']*["\']', protect_string, code)
    
    # Remove whitespace around operators and brackets
    code = re.sub(r'\s+', ' ', code)
    code = re.sub(r'\s*([{}();,=+\-*/%<>!&|?:\[\]])\s*', r'\1', code)
    code = re.sub(r'\s+', ' ', code)
    
    # Restore strings
    for i, string in enumerate(strings):
        code = code.replace(f'__STRING_{i}__', string)
    
    return code.strip()

def main():
    script_path = os.path.join('web', 'script.js')
    
    if not os.path.exists(script_path):
        print(f"Error: {script_path} not found!")
        return
    
    print(f"Reading {script_path}...")
    with open(script_path, 'r', encoding='utf-8') as f:
        original = f.read()
    
    print("Minifying...")
    minified = minify_js(original)
    
    output_path = os.path.join('web', 'script.min.js')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(minified)
    
    original_size = len(original)
    minified_size = len(minified)
    reduction = (1 - minified_size / original_size) * 100
    
    print(f"\n[OK] Minified script written to: {output_path}")
    print(f"  Original size: {original_size:,} bytes")
    print(f"  Minified size: {minified_size:,} bytes")
    print(f"  Reduction: {reduction:.1f}%")
    print(f"\n[!] Don't forget to update index.html to use script.min.js!")

if __name__ == '__main__':
    main()

