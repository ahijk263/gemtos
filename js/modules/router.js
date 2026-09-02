// ==========================================
// MODULE: ROUTER & PAGE LOADER
// ==========================================

// Plain static server can't use bundler-specific `?raw` imports.
// We'll fetch the HTML pages at runtime and cache them.

const PAGE_PATHS = {
    "tab-skills": "./pages/skills.html",
    "tab-items": "./pages/items.html",
    "tab-runes": "./pages/runes.html",
    "tab-runeskills": "./pages/rune-skills.html",
    "tab-documents": "./pages/documents.html",
    "tab-attributes": "./pages/attributes.html"
};

const PAGE_TEMPLATES = {};

import { loadSkillsData } from "./skills.js";
import { loadItemsData } from "./items.js";
import { loadRunesData } from "./runes.js";
import { loadRuneSkillsData } from "./runeSkills.js";
import { loadAttributesData } from "./attributes.js";

const loadedPages = new Set();

async function fetchPageTemplate(tabId) {
    if (PAGE_TEMPLATES[tabId]) return PAGE_TEMPLATES[tabId];
    const path = PAGE_PATHS[tabId];
    if (!path) return null;
    try {
        const resp = await fetch(path);
        if (!resp.ok) throw new Error(`Failed to fetch ${path}: ${resp.status}`);
        const text = await resp.text();
        PAGE_TEMPLATES[tabId] = text;
        return text;
    } catch (e) {
        console.error("Error fetching page template:", e);
        return null;
    }
}

export async function loadPageSection(tabId) {
    const container = document.getElementById("page-container");
    if (!container) return null;

    const markup = await fetchPageTemplate(tabId);
    if (!markup) return null;

    let section = document.getElementById(tabId);
    if (section) return section;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = markup.trim();

    section = wrapper.querySelector(".tab-content") || wrapper.firstElementChild;
    if (!section || !section.classList || !section.classList.contains("tab-content")) {
        section = document.createElement("div");
        section.className = "tab-content";
        section.id = tabId;
        section.innerHTML = markup.trim();
    }

    section.id = tabId;
    section.classList.add("tab-content");
    container.appendChild(section);

    // Render dynamic data for the loaded tab
    if (tabId === "tab-skills") {
        loadSkillsData();
    } else if (tabId === "tab-items") {
        loadItemsData();
    } else if (tabId === "tab-runes") {
        loadRunesData();
        // Pre-load rune skills if not loaded so combiner finds formulas
        if (!document.getElementById("tab-runeskills")) {
            await loadPageSection("tab-runeskills");
            const rsTab = document.getElementById("tab-runeskills");
            if (rsTab) rsTab.style.display = "none";
        }
    } else if (tabId === "tab-runeskills") {
        loadRuneSkillsData();
    } else if (tabId === "tab-attributes") {
        loadAttributesData();
    }

    loadedPages.add(tabId);
    return section;
}

export async function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("btn");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    if (!document.getElementById(tabName)) {
        await loadPageSection(tabName);
    }

    const targetTab = document.getElementById(tabName);
    if (targetTab) {
        targetTab.style.display = "block";
    }

    const activeBtn = (evt && evt.currentTarget) ? evt.currentTarget : document.querySelector(`.btn[data-tab="${tabName}"]`);
    if (activeBtn) {
        activeBtn.classList.add("active");
    }

    // Default sub-tab triggers
    if (tabName === "tab-items") {
        setTimeout(() => {
            const activeSub = document.querySelector("#tab-items .sub-btn.active") || document.getElementById("defaultItemSub");
            if (activeSub) activeSub.click();
        }, 0);
    } else if (tabName === "tab-skills") {
        setTimeout(() => {
            const activeSub = document.querySelector("#tab-skills .sub-btn.active") || document.getElementById("defaultSkillSub");
            if (activeSub) activeSub.click();
        }, 0);
    }
}

export function openSubTab(evt, subTabName, groupClass) {
    const subcontent = document.getElementsByClassName(groupClass);
    for (let i = 0; i < subcontent.length; i++) {
        subcontent[i].style.display = "none";
    }

    const parent = evt.currentTarget.parentNode;
    const sublinks = parent.getElementsByClassName("sub-btn");
    for (let i = 0; i < sublinks.length; i++) {
        sublinks[i].classList.remove("active");
    }

    const target = document.getElementById(subTabName);
    if (target) {
        target.style.display = "block";
    }
    evt.currentTarget.classList.add("active");
}

export function openItemSub(evt, subId) {
    const items = document.getElementsByClassName("item-sub");
    for (let i = 0; i < items.length; i++) {
        items[i].style.display = "none";
    }

    const target = document.getElementById(subId);
    if (target) {
        target.style.display = "block";
    }

    const buttons = document.querySelectorAll("#tab-items .sub-btn");
    buttons.forEach((b) => b.classList.remove("active"));
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
}
