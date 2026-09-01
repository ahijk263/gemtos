import re
import json
from pathlib import Path

html_path = Path('pages/rune-skills.html')
output_path = Path('data/rune-skills_data.json')
html = html_path.read_text(encoding='utf-8')

section_re = re.compile(
    r'<div id="(rs-legend|rs-epic|rs-rare)"[^>]*>.*?<tbody[^>]*id="([^"]+)"[^>]*>(.*?)</tbody>',
    re.S,
)
result = {}
name_map = {'rs-legend': 'legend', 'rs-epic': 'epic', 'rs-rare': 'rare'}

for section_id, tbody_id, tbody_html in section_re.findall(html):
    section_name = name_map.get(section_id)
    rows = []
    for attrs_str, row_html in re.findall(r'<tr\s+([^>]*)>(.*?)</tr>', tbody_html, flags=re.S):
        attrs = {}
        for m in re.finditer(r'(\w+)="([^"]*)"', attrs_str):
            attrs[m.group(1)] = m.group(2)
        if not attrs:
            continue

        desc_match = re.search(r'<div class="rune-desc">(.*?)</div>', row_html, re.S)
        stats_match = re.search(r'<div class="rune-stats">(.*?)</div>', row_html, re.S)
        b_match = re.search(r'<b>(.*?)</b>', row_html, re.S)

        title = attrs.get('data-title', '')
        skill = attrs.get('data-skill', '')
        shape = attrs.get('data-shape', '')
        rarity = attrs.get('data-rarity', '')
        level = attrs.get('data-level', '0')
        runes = [part.strip() for part in attrs.get('data-runes', '').split() if part.strip()]
        runeslist = attrs.get('data-runeslist', attrs.get('data-runes', ''))
        class_name = attrs.get('data-class', '')

        desc_text = re.sub(r'<.*?>', '', desc_match.group(1)).strip() if desc_match else ''
        stats_text = re.sub(r'<.*?>', '', stats_match.group(1)).strip() if stats_match else ''
        effect_title = re.sub(r'<.*?>', '', b_match.group(1)).strip() if b_match else skill

        entry = {
            'runes': runes,
            'title': title,
            'skill': skill,
            'shape': shape,
            'shapeLabel': shape,
            'rarity': rarity,
            'rarityLabel': rarity,
            'level': int(level) if str(level).isdigit() else level,
            'runeslist': runeslist,
            'className': class_name,
            'effectTitle': effect_title,
            'description': desc_text,
            'descriptionVi': desc_text,
            'stats': stats_text,
        }
        rows.append(entry)
    result[section_name] = rows

output_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
print(f'Generated {len(result.get("legend", []))} legend, {len(result.get("epic", []))} epic, {len(result.get("rare", []))} rare rows.')
