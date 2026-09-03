// ==========================================
// MODULE: THEME & SETTINGS
// ==========================================

export function initTheme() {
    const savedTheme = localStorage.getItem("game_theme_clean");
    const themeBtn = document.getElementById("themeToggleBtn");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        if (themeBtn) themeBtn.innerHTML = "☀️";
    } else {
        document.body.classList.remove("light-mode");
        if (themeBtn) themeBtn.innerHTML = "🌙";
    }

    const savedFont = localStorage.getItem("game_font");
    if (savedFont) {
        applyFont(savedFont);
        const fontSelect = document.getElementById("fontSelect");
        if (fontSelect) fontSelect.value = savedFont;
    }
}

export function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById("themeToggleBtn");
    body.classList.toggle("light-mode");

    if (body.classList.contains("light-mode")) {
        localStorage.setItem("game_theme_clean", "light");
        if (themeBtn) themeBtn.innerHTML = "☀️";
    } else {
        localStorage.setItem("game_theme_clean", "dark");
        if (themeBtn) themeBtn.innerHTML = "🌙";
    }

    try {
        const activeMain = document.querySelector(".btn.active");
        if (activeMain) activeMain.click();

        const skillsTab = document.getElementById("tab-skills");
        if (skillsTab && window.getComputedStyle(skillsTab).display !== "none") {
            const activeSub = document.querySelector("#tab-skills .sub-btn.active") || document.getElementById("defaultSkillSub");
            if (activeSub) activeSub.click();
        }
    } catch (e) {
        console.warn("Error while refreshing tabs after theme toggle", e);
    }
}

export function toggleSettings() {
    const modal = document.getElementById("settingsModal");
    if (!modal) return;
    if (modal.classList.contains("show")) {
        modal.classList.remove("show");
        setTimeout(() => (modal.style.display = "none"), 250);
    } else {
        modal.style.display = "flex";
        void modal.offsetWidth;
        modal.classList.add("show");
    }
}

export function closeSettings(event) {
    if (event.target === document.getElementById("settingsModal")) {
        toggleSettings();
    }
}

export function changeFont() {
    const fontSelect = document.getElementById("fontSelect");
    if (!fontSelect) return;
    const font = fontSelect.value;
    applyFont(font);
    localStorage.setItem("game_font", font);
}

function applyFont(font) {
    const root = document.documentElement.style;
    root.setProperty("--font-body", font);
    root.setProperty("--font-heading", font);
    root.setProperty("--font-main", font);
}
