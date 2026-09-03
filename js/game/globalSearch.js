// ==========================================
// MODULE: GLOBAL NAME SEARCH
// ==========================================

import { loadJson } from "./dataLoader.js";
import { openTab } from "../router.js";

let searchIndexPromise;

function clearSearchResultHighlights() {
    document.querySelectorAll(".search-result-highlight").forEach((element) => {
        element.classList.remove("search-result-highlight");
    });
}

function normalizeText(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .toLowerCase()
        .trim();
}

function createSearchIndex([skills, items, runes, runeSkills]) {
    const index = [];

    Object.entries(skills || {}).forEach(([category, rows]) => {
        (rows || []).forEach((skill) => index.push({
            name: skill.name,
            type: "Skill",
            tabId: "tab-skills",
            subId: `skill-${category}`,
            targetId: `skills-${category}-tbody`,
            selector: `#skills-${category}-tbody tr`,
            category
        }));
    });

    Object.entries(items || {}).forEach(([category, rows]) => {
        (rows || []).forEach((item) => index.push({
            name: item.name,
            type: "Item",
            tabId: "tab-items",
            subId: `item-${category}`,
            targetId: `items-${category}-tbody`,
            selector: `#items-${category}-tbody tr`,
            category
        }));
    });

    Object.entries(runes || {}).forEach(([rarity, rows]) => {
        (rows || []).forEach((rune) => index.push({
            name: rune.name,
            type: "Rune",
            detail: rarity,
            tabId: "tab-runes",
            targetId: `rune-${rune.name}`
        }));
    });

    const runeSkillTabs = { legend: "rs-legend", epic: "rs-epic", rare: "rs-rare" };
    Object.entries(runeSkills || {}).forEach(([rarity, rows]) => {
        (rows || []).forEach((runeSkill) => {
            const tabResult = {
                name: runeSkill.title,
                type: "Rune Skill",
                detail: runeSkill.skill,
                tabId: "tab-runeskills",
                subId: runeSkillTabs[rarity],
                targetId: `rune-skills-${rarity === "legend" ? "table" : rarity}-table-body`,
                selector: ".runeskills-sub tr[data-title]"
            };
            index.push(tabResult);

            if (runeSkill.skill && normalizeText(runeSkill.skill) !== normalizeText(runeSkill.title)) {
                index.push({ ...tabResult, name: runeSkill.skill, detail: runeSkill.title });
            }
        });
    });

    return index;
}

function getSearchIndex() {
    searchIndexPromise ??= Promise.all([
        loadJson("./data/skills_data.json"),
        loadJson("./data/items_data.json"),
        loadJson("./data/runes_data.json"),
        loadJson("./data/rune-skills_data.json")
    ]).then(createSearchIndex);
    return searchIndexPromise;
}

function activateSubSection(result) {
    if (!result.subId) return;

    const section = document.getElementById(result.subId);
    if (!section) return;

    const groupClass = result.tabId === "tab-items"
        ? "item-sub"
        : result.tabId === "tab-runeskills"
            ? "runeskills-sub"
            : "skill-sub";
    document.querySelectorAll(`#${result.tabId} .${groupClass}`).forEach((element) => {
        element.style.display = "none";
    });
    section.style.display = "block";

    document.querySelectorAll(`#${result.tabId} .sub-btn`).forEach((button) => {
        button.classList.toggle("active", button.getAttribute("onclick")?.includes(`'${result.subId}'`));
    });
}

function focusResult(result) {
    let target;
    if (result.selector) {
        const resultName = normalizeText(result.name);
        target = [...document.querySelectorAll(result.selector)].find((row) => {
            const rowNames = [
                row.dataset.title,
                row.dataset.skill,
                ...[...row.querySelectorAll("b, td:first-child > span")].map((element) => element.textContent)
            ];
            return rowNames.some((name) => normalizeText(name) === resultName);
        });

        // This is only a fallback for rows without a dedicated name element.
        target ??= [...document.querySelectorAll(result.selector)].find((row) =>
            normalizeText(row.textContent).includes(resultName)
        );
    }
    target ??= document.getElementById(result.targetId);
    if (!target) return;

    target.style.display = "";
    target.classList.remove("search-result-highlight");
    void target.offsetWidth;
    target.classList.add("search-result-highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function selectResult(result, input, results) {
    input.value = result.name;
    results.hidden = true;
    await openTab(null, result.tabId);
    activateSubSection(result);
    requestAnimationFrame(() => focusResult(result));
}

function renderResults(matches, input, results) {
    results.innerHTML = "";
    results.hidden = matches.length === 0;

    matches.forEach((result) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "global-search-result";
        button.innerHTML = `<span class="global-search-result-name">${result.name}</span>
            <span class="global-search-result-meta">${result.type}${result.detail ? ` · ${result.detail}` : ""}</span>`;
        button.addEventListener("click", () => selectResult(result, input, results));
        results.appendChild(button);
    });
}

export function initializeGlobalSearch() {
    const input = document.getElementById("globalSearchInput");
    const results = document.getElementById("globalSearchResults");
    if (!input || !results) return;

    input.addEventListener("input", async () => {
        // A new query replaces the previously located result.
        clearSearchResultHighlights();
        const query = normalizeText(input.value);
        if (!query) {
            results.hidden = true;
            results.innerHTML = "";
            return;
        }

        results.innerHTML = '<div class="global-search-status">Đang tìm kiếm...</div>';
        results.hidden = false;
        const index = await getSearchIndex();
        if (query !== normalizeText(input.value)) return;

        const matches = index
            .filter((entry) => normalizeText(entry.name).includes(query))
            .slice(0, 12);

        if (matches.length === 0) {
            results.innerHTML = '<div class="global-search-status">Không tìm thấy tên phù hợp.</div>';
            return;
        }
        renderResults(matches, input, results);
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".global-search")) results.hidden = true;
    });
}
