# Code Minificatie Instructies

Om de code functioneel te houden maar moeilijker leesbaar te maken voor random mensen, zijn er verschillende opties:

## Optie 1: Online Minifier (Eenvoudigst - Geen installatie nodig)

1. Ga naar een van deze websites:
   - https://www.minifier.org/
   - https://javascript-minifier.com/
   - https://www.toptal.com/developers/javascript-minifier

2. Kopieer de inhoud van `web/script.js`
3. Plak het in de minifier
4. Klik op "Minify"
5. Kopieer de geminificeerde code
6. Sla het op als `web/script.min.js`

7. Update `web/index.html`:
   ```html
   <!-- Vervang deze regel: -->
   <script src="script.js"></script>
   
   <!-- Door deze: -->
   <script src="script.min.js"></script>
   ```

## Optie 2: Met Node.js (Als je Node.js hebt)

```bash
# Installeer dependencies
npm install

# Minify de code
npm run build
```

Dit maakt automatisch `web/script.min.js` aan.

## Optie 3: Met Python (Als je Python hebt)

Maak een bestand `minify.py`:

```python
import re
import sys

def minify_js(code):
    # Remove comments
    code = re.sub(r'//.*?$', '', code, flags=re.MULTILINE)
    code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
    
    # Remove extra whitespace
    code = re.sub(r'\s+', ' ', code)
    code = re.sub(r'\s*([{}();,=+\-*/%<>!&|?:])\s*', r'\1', code)
    
    return code.strip()

if __name__ == '__main__':
    with open('web/script.js', 'r', encoding='utf-8') as f:
        content = f.read()
    
    minified = minify_js(content)
    
    with open('web/script.min.js', 'w', encoding='utf-8') as f:
        f.write(minified)
    
    print(f"Minified: {len(content)} -> {len(minified)} bytes")
```

Run: `python minify.py`

## Belangrijk

- **Development**: Gebruik `script.js` (leesbaar, makkelijk te debuggen)
- **Production**: Gebruik `script.min.js` (geminificeerd, moeilijker te lezen)
- De geminificeerde code werkt exact hetzelfde, maar is veel moeilijker te lezen
- Voeg `script.min.js` toe aan `.gitignore` als je de source code privé wilt houden

## Resultaat

Na minificatie:
- ✅ Code werkt nog steeds perfect
- ✅ Moeilijker te lezen voor casual gebruikers
- ✅ Kleinere bestandsgrootte (sneller laden)
- ⚠️ Volledige bescherming is niet mogelijk (maar wel veel moeilijker)

