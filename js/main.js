// ==========================================
// GAMETOS WIKI - MAIN ENTRY POINT
// ==========================================

import {
    initTheme,
    toggleTheme,
    toggleSettings,
    closeSettings,
    changeFont
} from "./theme.js";

import {
    openTab,
    openSubTab,
    openItemSub,
    loadPageSection
} from "./router.js";

import {
    loadSkillsData,
    renderSkills
} from "./game/skills.js";

import {
    loadItemsData,
    renderItems
} from "./game/items.js";

import {
    loadRunesData,
    toggleRune,
    removeRune,
    clearRunes,
    renderSelectedRunes,
    executeRuneCombination
} from "./game/runes.js";

import {
    loadRuneSkillsData,
    openRuneSkillSub,
    applyRuneSkillFilter
} from "./game/runeSkills.js";

import {
    loadAttributesData,
    renderAttributesView,
    selectAttributeRange,
    filterAttributesRange
} from "./game/attributes.js";

import { initializeGlobalSearch } from "./game/globalSearch.js";

// Expose functions globally for HTML inline handlers
window.toggleTheme = toggleTheme;
window.toggleSettings = toggleSettings;
window.closeSettings = closeSettings;
window.changeFont = changeFont;
window.openTab = openTab;
window.openSubTab = openSubTab;
window.openItemSub = openItemSub;
window.toggleRune = toggleRune;
window.removeRune = removeRune;
window.clearRunes = clearRunes;
window.openRuneSkillSub = openRuneSkillSub;
window.applyRuneSkillFilter = applyRuneSkillFilter;
window.filterAttributesRange = filterAttributesRange;
window.selectAttributeRange = selectAttributeRange;

// Initialize app when DOM is ready
window.addEventListener("DOMContentLoaded", async () => {
    // Clear legacy cache if present
    localStorage.removeItem("game_custom_data_v18");

    // Initialize Theme and Font
    initTheme();
    initializeGlobalSearch();

    // Default open Skills tab
    const defaultTab = document.getElementById("defaultOpen");
    if (defaultTab) {
        try {
            await loadPageSection("tab-skills");
            defaultTab.classList.add("active");
            const skillsTab = document.getElementById("tab-skills");
            if (skillsTab) skillsTab.style.display = "block";
        } catch (error) {
            console.error("Lỗi khi tải tab mặc định:", error);
        }
    }
});
