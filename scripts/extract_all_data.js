const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'pages');
const dataDir = path.join(__dirname, '..', 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function stripTags(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '').trim();
}

function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

// ----------------------------------------------------
// 1. EXTRACT ITEMS
// ----------------------------------------------------
function extractItems() {
  const filePath = path.join(pagesDir, 'items.html');
  const html = fs.readFileSync(filePath, 'utf8');

  const categories = [
    { id: 'item-helmet', key: 'helmet' },
    { id: 'item-artifact', key: 'artifact' },
    { id: 'item-collar', key: 'collar' },
    { id: 'item-frontlegs', key: 'frontlegs' },
    { id: 'item-rearlegs', key: 'rearlegs' },
    { id: 'item-armor', key: 'armor' },
  ];

  const result = {};

  for (const cat of categories) {
    const startIdx = html.indexOf(`id="${cat.id}"`);
    if (startIdx === -1) {
      console.warn(`Category not found: ${cat.id}`);
      result[cat.key] = [];
      continue;
    }

    // Find the end of this sub-section
    const nextStartIdx = categories
      .map(c => html.indexOf(`id="${c.id}"`, startIdx + 1))
      .filter(idx => idx !== -1)
      .sort((a, b) => a - b)[0] || html.length;

    const sectionHtml = html.slice(startIdx, nextStartIdx);
    const tbodyMatch = /<tbody>([\s\S]*?)<\/tbody>/i.exec(sectionHtml);
    if (!tbodyMatch) {
      result[cat.key] = [];
      continue;
    }

    const tbody = tbodyMatch[1];
    const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    const items = [];

    for (const rowMatch of rows) {
      const rowContent = rowMatch[1];
      const cells = [...rowContent.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1]);
      if (cells.length < 4) continue;

      // Col 1: Name & class
      const nameMatch = /<span\s+class="([^"]*)">([\s\S]*?)<\/span>/i.exec(cells[0]);
      const name = nameMatch ? cleanText(stripTags(nameMatch[2])) : cleanText(stripTags(cells[0]));
      const nameClass = nameMatch ? nameMatch[1].trim() : 'legend-title';

      // Col 2: Element & class
      const elemMatch = /<span\s+class="([^"]*)">([\s\S]*?)<\/span>/i.exec(cells[1]);
      const element = elemMatch ? cleanText(stripTags(elemMatch[2])) : cleanText(stripTags(cells[1]));
      const elementClass = elemMatch ? elemMatch[1].trim() : '';

      // Col 3: Base stats
      const baseStatDivs = [...cells[2].matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi)];
      let baseStats = [];
      if (baseStatDivs.length > 0) {
        baseStats = baseStatDivs
          .map(d => cleanText(stripTags(d[1])))
          .filter(Boolean);
      } else {
        baseStats = cleanText(stripTags(cells[2]))
          .split('\n')
          .map(s => cleanText(s))
          .filter(Boolean);
      }

      // Col 4: Tiers
      const tierDivs = [...cells[3].matchAll(/<div[^>]*>([\s\S]*?)<\/div>/gi)];
      const tiers = [];
      if (tierDivs.length > 0) {
        for (const tDiv of tierDivs) {
          const tHtml = tDiv[1];
          const tierSpanMatch = /<span\s+class="tier-title">([\s\S]*?)<\/span>/i.exec(tHtml);
          const tierLabel = tierSpanMatch ? cleanText(stripTags(tierSpanMatch[1])) : '';
          const desc = cleanText(stripTags(tHtml.replace(/<span\s+class="tier-title">[\s\S]*?<\/span>/i, '')));
          if (tierLabel || desc) {
            tiers.push({ tier: tierLabel, desc });
          }
        }
      }

      items.push({
        name,
        nameClass,
        element,
        elementClass,
        baseStats,
        tiers,
      });
    }

    result[cat.key] = items;
    console.log(`Extracted ${items.length} items for ${cat.key}`);
  }

  const outPath = path.join(dataDir, 'items_data.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved items_data.json successfully.`);
}

// ----------------------------------------------------
// 2. EXTRACT SKILLS
// ----------------------------------------------------
function extractSkills() {
  const filePath = path.join(pagesDir, 'skills.html');
  const html = fs.readFileSync(filePath, 'utf8');

  const categories = [
    { id: 'skill-basic', key: 'basic' },
    { id: 'skill-specials', key: 'specials' },
    { id: 'skill-auras', key: 'auras' },
    { id: 'skill-totems', key: 'totems' },
  ];

  const result = {};

  for (const cat of categories) {
    const startIdx = html.indexOf(`id="${cat.id}"`);
    if (startIdx === -1) {
      console.warn(`Category not found: ${cat.id}`);
      result[cat.key] = [];
      continue;
    }

    const nextStartIdx = categories
      .map(c => html.indexOf(`id="${c.id}"`, startIdx + 1))
      .filter(idx => idx !== -1)
      .sort((a, b) => a - b)[0] || html.length;

    const sectionHtml = html.slice(startIdx, nextStartIdx);
    const tbodyMatch = /<tbody>([\s\S]*?)<\/tbody>/i.exec(sectionHtml);
    if (!tbodyMatch) {
      result[cat.key] = [];
      continue;
    }

    const tbody = tbodyMatch[1];
    const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)];
    const skills = [];

    for (const rowMatch of rows) {
      const rowContent = rowMatch[1];
      const cells = [...rowContent.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m => m[1]);
      if (cells.length < 4) continue;

      // Col 1: Type
      const typeSpanMatch = /<span\s+class="([^"]*)">([\s\S]*?)<\/span>/i.exec(cells[0]);
      const element = typeSpanMatch ? cleanText(stripTags(typeSpanMatch[2])) : cleanText(stripTags(cells[0]));
      const elementClass = typeSpanMatch ? typeSpanMatch[1].trim() : '';

      // Col 2: Name
      const nameMatch = /<b>([\s\S]*?)<\/b>/i.exec(cells[1]);
      const name = nameMatch ? cleanText(stripTags(nameMatch[1])) : cleanText(stripTags(cells[1]));

      // Col 3: Descriptions
      const viMatch = /<div\s+class="skill-translation">([\s\S]*?)<\/div>/i.exec(cells[2]);
      let descVi = viMatch ? cleanText(stripTags(viMatch[1])) : '';
      if (descVi.startsWith('(') && descVi.endsWith(')')) {
        descVi = descVi.slice(1, -1).trim();
      }

      const descEnHtml = cells[2].replace(/<div\s+class="skill-translation">[\s\S]*?<\/div>/i, '');
      const descEn = cleanText(stripTags(descEnHtml));

      // Col 4: Gems
      const gemText = cleanText(cells[3].replace(/<span\s+class="gem-icon">[\s\S]*?<\/span>/i, '').replace(/<[^>]+>/g, ''));

      skills.push({
        element,
        elementClass,
        name,
        descEn,
        descVi,
        gems: gemText,
      });
    }

    result[cat.key] = skills;
    console.log(`Extracted ${skills.length} skills for ${cat.key}`);
  }

  const outPath = path.join(dataDir, 'skills_data.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved skills_data.json successfully.`);
}

// ----------------------------------------------------
// 3. EXTRACT RUNES
// ----------------------------------------------------
function extractRunes() {
  const filePath = path.join(pagesDir, 'runes.html');
  const html = fs.readFileSync(filePath, 'utf8');

  const cardRegex = /<div\s+class="rune-card\s+([^"]*)"\s+id="rune-([^"]*)"[^>]*>([\s\S]*?)<\/div>/gi;
  const cards = [...html.matchAll(cardRegex)];

  const result = {
    legendary: [],
    epic: [],
    rare: [],
    common: []
  };

  for (const card of cards) {
    const cardClass = card[1].trim();
    const runeId = card[2].trim();
    const cardInner = card[3];

    const nameMatch = /<span\s+class="rune-name">([\s\S]*?)<\/span>/i.exec(cardInner);
    const starMatch = /<span\s+class="stars">([\s\S]*?)<\/span>/i.exec(cardInner);

    const name = nameMatch ? cleanText(stripTags(nameMatch[1])) : runeId;
    const stars = starMatch ? cleanText(stripTags(starMatch[1])) : '';

    let matchedGroup = 'common';
    if (cardClass.includes('rune-legendary')) matchedGroup = 'legendary';
    else if (cardClass.includes('rune-epic')) matchedGroup = 'epic';
    else if (cardClass.includes('rune-rare')) matchedGroup = 'rare';

    result[matchedGroup].push({
      name,
      stars,
      className: `rune-${matchedGroup}`,
    });
  }

  for (const g of Object.keys(result)) {
    console.log(`Extracted ${result[g].length} runes for ${g}`);
  }

  const outPath = path.join(dataDir, 'runes_data.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`Saved runes_data.json successfully.`);
}

console.log('--- START DATA EXTRACTION ---');
extractItems();
extractSkills();
extractRunes();
console.log('--- FINISHED DATA EXTRACTION ---');
