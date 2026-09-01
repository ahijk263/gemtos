const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'pages', 'rune-skills.html'), 'utf8');
const result = {};
const sectionMap = { 'rs-legend': 'legend', 'rs-epic': 'epic', 'rs-rare': 'rare' };
const sectionIds = Object.keys(sectionMap);
const rowRegex = /<tr\s+([^>]*)>(.*?)<\/tr>/gs;

for (const sectionId of sectionIds) {
  const startMarker = `id="${sectionId}"`;
  const startIndex = html.indexOf(startMarker);
  if (startIndex === -1) continue;

  let depth = 0;
  let endIndex = -1;
  let i = startIndex;

  while (i < html.length) {
    const nextOpen = html.indexOf('<div', i);
    const nextClose = html.indexOf('</div>', i);
    if (nextOpen === -1 && nextClose === -1) break;
    if (nextOpen !== -1 && (nextClose === -1 || nextOpen < nextClose)) {
      depth += 1;
      i = nextOpen + 4;
      continue;
    }
    if (nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen)) {
      depth -= 1;
      if (depth === 0) {
        endIndex = nextClose + '</div>'.length;
        break;
      }
      i = nextClose + '</div>'.length;
      continue;
    }
    i += 1;
  }

  if (endIndex === -1) continue;

  const sectionHtml = html.slice(startIndex, endIndex);
  const tbodyMatches = [...sectionHtml.matchAll(/<tbody[^>]*>([\s\S]*?)<\/tbody>/g)];
  const rows = [];

  for (const tbodyMatch of tbodyMatches) {
    const tbodyHtml = tbodyMatch[1];
    for (const rowMatch of tbodyHtml.matchAll(rowRegex)) {
      const rowFull = rowMatch[0];
      const rowHtml = rowMatch[2];
      const title = /data-title="([^"]*)"/.exec(rowFull)?.[1] || '';
      const skill = /data-skill="([^"]*)"/.exec(rowFull)?.[1] || '';
      const shape = /data-shape="([^"]*)"/.exec(rowFull)?.[1] || '';
      const rarity = /data-rarity="([^"]*)"/.exec(rowFull)?.[1] || '';
      const level = /data-level="([^"]*)"/.exec(rowFull)?.[1] || '0';
      const runesString = /data-runes="([^"]*)"/.exec(rowFull)?.[1] || '';
      const runeslist = /data-runeslist="([^"]*)"/.exec(rowFull)?.[1] || runesString;
      const className = /data-class="([^"]*)"/.exec(rowFull)?.[1] || '';

      const descMatch = /<div class="rune-desc">(.*?)<\/div>/s.exec(rowHtml);
      const statsMatch = /<div class="rune-stats">(.*?)<\/div>/s.exec(rowHtml);
      const bMatch = /<b>(.*?)<\/b>/s.exec(rowHtml);

      const runes = runesString.split(/\s+/).filter(Boolean);
      const descText = descMatch ? stripTags(descMatch[1]) : '';
      const statsText = statsMatch ? stripTags(statsMatch[1]) : '';
      const effectTitle = bMatch ? stripTags(bMatch[1]) : skill;
      const parsedDesc = splitBilingualText(descText);

      rows.push({
        runes,
        title,
        skill,
        shape,
        shapeLabel: shape,
        rarity,
        rarityLabel: rarity,
        level: Number.isInteger(Number(level)) ? Number(level) : level,
        runeslist,
        className,
        effectTitle,
        description: parsedDesc.en,
        descriptionVi: parsedDesc.vi,
        stats: statsText,
      });
    }
  }

  result[sectionMap[sectionId]] = rows;
}

fs.writeFileSync(path.join(__dirname, '..', 'data', 'rune-skills_data.json'), JSON.stringify(result, null, 2), 'utf8');
console.log(`Generated ${result.legend?.length ?? 0} legend, ${result.epic?.length ?? 0} epic, ${result.rare?.length ?? 0} rare rows.`);

function stripTags(value) {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function splitBilingualText(value) {
  if (!value) return { en: '', vi: '' };

  const match = value.match(/^(.+?)\s*\((.+)\)$/s);
  if (!match) {
    return { en: value, vi: value };
  }

  const en = match[1].trim();
  const vi = match[2].trim();
  return { en, vi };
}
