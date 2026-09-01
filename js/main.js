// --- MODAL CÀI ĐẶT ---
function toggleSettings() {
    const modal = document.getElementById("settingsModal");
    if (modal.classList.contains("show")) {
        modal.classList.remove("show");
        setTimeout(() => modal.style.display = "none", 250);
    } else {
        modal.style.display = "flex";
        void modal.offsetWidth;
        modal.classList.add("show");
    }
}

function closeSettings(event) {
    if (event.target === document.getElementById("settingsModal")) {
        toggleSettings();
    }
}

// --- CHỈNH SỬA (EDIT MODE) VÀ LƯU DỮ LIỆU ---
let isEditing = false;

function toggleEditMode() {
    isEditing = !isEditing;
    const editToggleBtn = document.getElementById("editToggleBtn");
    const resetBtn = document.getElementById("resetBtn");
    const editableElements = document.querySelectorAll(".tab-content td, .tab-content th, .tab-content h2, .tab-content p, .rune-desc, .rune-stats, .gem-text");

    if (isEditing) {
        editToggleBtn.innerHTML = "💾 Lưu lại";
        resetBtn.style.display = "inline-block";
        document.body.classList.add("editing-mode");
        editableElements.forEach(el => el.setAttribute("contenteditable", "true"));
    } else {
        editToggleBtn.innerHTML = "✏️ Chỉnh sửa";
        resetBtn.style.display = "none";
        document.body.classList.remove("editing-mode");
        editableElements.forEach(el => el.removeAttribute("contenteditable"));

        if (typeof clearRunes === 'function') clearRunes();

        const dataToSave = {
            skills: document.getElementById("tab-skills") ? sanitizeTabHtml("tab-skills", document.getElementById("tab-skills").innerHTML) : "",
            items: document.getElementById("tab-items") ? sanitizeTabHtml("tab-items", document.getElementById("tab-items").innerHTML) : "",
            runes: document.getElementById("tab-runes") ? sanitizeTabHtml("tab-runes", document.getElementById("tab-runes").innerHTML) : "",
            runeskills: document.getElementById("tab-runeskills") ? sanitizeTabHtml("tab-runeskills", document.getElementById("tab-runeskills").innerHTML) : "",
            documents: document.getElementById("tab-documents") ? sanitizeTabHtml("tab-documents", document.getElementById("tab-documents").innerHTML) : "",
            attributes: document.getElementById("tab-attributes") ? sanitizeTabHtml("tab-attributes", document.getElementById("tab-attributes").innerHTML) : ""
        };
        localStorage.setItem("game_custom_data_v18", JSON.stringify(dataToSave));
        alert("Đã lưu nội dung chỉnh sửa thành công!");
        toggleSettings();
    }
}

function resetData() {
    if (confirm("Bạn có chắc muốn khôi phục toàn bộ dữ liệu về mặc định gốc? Các thay đổi sẽ bị mất.")) {
        localStorage.removeItem("game_custom_data_v18");
        location.reload();
    }
}

function changeFont() {
    const font = document.getElementById('fontSelect').value;
    document.body.style.fontFamily = font;
    localStorage.setItem('game_font', font);
}

const PAGE_FILES = {
    "tab-skills": "skills",
    "tab-items": "items",
    "tab-runes": "runes",
    "tab-runeskills": "rune-skills",
    "tab-documents": "documents",
    "tab-attributes": "attributes"
};

const loadedPages = new Set();

function getSavedTabData() {
    const savedDataStr = localStorage.getItem("game_custom_data_v18");
    if (!savedDataStr) return {};

    try {
        const parsed = JSON.parse(savedDataStr) || {};
        const cleaned = {};
        Object.entries(parsed).forEach(([key, value]) => {
            if (typeof value !== "string") return;
            cleaned[key] = sanitizeTabHtml(key, value);
        });
        return cleaned;
    } catch (error) {
        console.error("Lỗi đọc dữ liệu lưu trữ:", error);
        return {};
    }
}

function sanitizeTabHtml(tabId, html) {
    if (!html || typeof html !== "string") return html;

    let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleaned = cleaned.replace(/<div[^>]*id=["']tab-runes["'][\s\S]*?<\/div>/gi, "");
    cleaned = cleaned.replace(/<div[^>]*id=["']tab-runeskills["'][\s\S]*?<\/div>/gi, "");
    cleaned = cleaned.replace(/<div[^>]*class=["'][^"']*(combiner-section|selected-runes-container|filter-result-box|rune-card)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi, "");

    return cleaned;
}

function renderRuneSkillRows(rows, targetId) {
    const target = document.getElementById(targetId);
    if (!target) return;

    target.innerHTML = "";
    rows.forEach((row) => {
        const tr = document.createElement("tr");
        const runes = Array.isArray(row.runes) ? row.runes.join(" ") : (row.runes || "");
        const shape = row.shape || "N/A";
        const rarity = row.rarity || "";
        const level = row.level || "";
        const runesList = row.runeslist || runes;
        const cssClass = row.className || "legend-title";
        const descEn = row.description || "";
        const descVi = row.descriptionVi || "";
        const showVi = descVi && descVi !== descEn;

        tr.setAttribute("data-runes", runes);
        tr.setAttribute("data-title", row.title || "");
        tr.setAttribute("data-skill", row.skill || "");
        tr.setAttribute("data-shape", shape);
        tr.setAttribute("data-rarity", rarity);
        tr.setAttribute("data-level", String(level));
        tr.setAttribute("data-runeslist", runesList);
        tr.setAttribute("data-class", cssClass);

        const viColor = cssClass === "epic-title" ? "#a855f7" : "#b7791f";

        tr.innerHTML = `
            <td>
                <span class="${cssClass}">${row.title || ""}</span><br>
                <span style="font-weight:600; font-size:13px; color:var(--text-muted)">${row.skill || ""}</span><br>
                <span style="font-size:12px;">${rarity}</span>
            </td>
            <td>
                Cấp độ: ${level}<br>
                Ngọc: ${runesList}<br>
                <span style="font-size:12px; color:var(--text-muted)">${shape}</span>
            </td>
            <td>
                <b>${row.effectTitle || row.skill || ""}</b><br>
                <div class="rune-desc">${descEn}</div>
                ${showVi ? `<div class="rune-desc" style="margin-top:6px; color: ${viColor};">(${descVi})</div>` : ""}
                <div class="rune-stats">${row.stats || ""}</div>
            </td>
        `;

        target.appendChild(tr);
    });
}

async function loadRuneSkillsData() {
    const targetBodies = [
        { key: "legend", id: "rune-skills-table-body" },
        { key: "epic", id: "rune-skills-epic-table-body" },
        { key: "rare", id: "rune-skills-rare-table-body" }
    ];

    try {
        const response = await fetch("data/rune-skills_data.json");
        if (!response.ok) {
            throw new Error(`Không tải được dữ liệu rune-skills (${response.status})`);
        }

        const data = await response.json();
        targetBodies.forEach(({ key, id }) => {
            const rows = Array.isArray(data[key]) ? data[key] : [];
            renderRuneSkillRows(rows, id);
        });
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu rune-skills:", error);
    }
}

async function loadPageSection(tabId) {
    const container = document.getElementById("page-container");
    if (!container || !PAGE_FILES[tabId]) return null;
    if (document.getElementById(tabId)) return document.getElementById(tabId);

    try {
        const response = await fetch(`pages/${PAGE_FILES[tabId]}.html`);
        if (!response.ok) {
            throw new Error(`Không tải được ${PAGE_FILES[tabId]}.html (${response.status})`);
        }

        const markup = await response.text();
        const wrapper = document.createElement("div");
        wrapper.innerHTML = markup.trim();

        let section = wrapper.querySelector(`.${"tab-content"}`) || wrapper.firstElementChild;
        if (!section || !section.classList || !section.classList.contains("tab-content")) {
            section = document.createElement("div");
            section.className = "tab-content";
            section.id = tabId;
            section.innerHTML = markup.trim();
        }

        section.id = tabId;
        section.classList.add("tab-content");

        const savedData = getSavedTabData();
        const pageKey = PAGE_FILES[tabId];
        if (savedData[pageKey]) {
            section.innerHTML = sanitizeTabHtml(tabId, savedData[pageKey]);
        }

        container.appendChild(section);
        if (tabId === "tab-runeskills") {
            await loadRuneSkillsData();
        }
        if (tabId === "tab-attributes") {
            await loadAttributesData();
        }
        loadedPages.add(tabId);
        return section;
    } catch (error) {
        console.error(error);
        const fallback = document.createElement("div");
        fallback.className = "tab-content";
        fallback.id = tabId;
        fallback.style.display = "block";
        fallback.style.padding = "16px";
        fallback.style.color = "var(--danger)";
        fallback.innerHTML = `Không thể tải dữ liệu ${PAGE_FILES[tabId]}.html.`;
        container.appendChild(fallback);
        loadedPages.add(tabId);
        return fallback;
    }
}

// --- KHỞI TẠO TẢI DỮ LIỆU KHI MỞ TRANG (MẶC ĐỊNH LUÔN Ở SKILLS, BASIC) ---
window.addEventListener("DOMContentLoaded", async () => {
    const rawSavedData = localStorage.getItem("game_custom_data_v18");
    if (rawSavedData) {
        try {
            const parsed = JSON.parse(rawSavedData);
            const hasStaleRuneMarkup = Object.values(parsed || {}).some(value => typeof value === "string" && /id=["']tab-runes["']|rune-card|combiner-section|selected-runes-container|filter-result-box/.test(value));
            if (hasStaleRuneMarkup) {
                localStorage.removeItem("game_custom_data_v18");
            }
        } catch (error) {
            localStorage.removeItem("game_custom_data_v18");
        }
    }

    const savedTheme = localStorage.getItem("game_theme_clean");
    const themeBtn = document.getElementById("themeToggleBtn");

    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        if (themeBtn) themeBtn.innerHTML = "☀️";
    } else {
        document.body.classList.remove("light-mode");
        if (themeBtn) themeBtn.innerHTML = "🌙";
    }

    const defaultTab = document.getElementById("defaultOpen");
    if (defaultTab) {
        try {
            await loadPageSection("tab-skills");
            defaultTab.click();
        } catch (error) {
            console.error("Lỗi khi tải nội dung tab mặc định:", error);
        }
    }

    const savedFont = localStorage.getItem("game_font");
    if (savedFont) {
        document.body.style.fontFamily = savedFont;
        const fontSelect = document.getElementById('fontSelect');
        if (fontSelect) fontSelect.value = savedFont;
    }

    // Mặc định luôn mở Tab Skills và Tab con Basic khi load trang hoặc F5
    var defaultSkillSub = document.getElementById("defaultSkillSub");
    if (defaultSkillSub) defaultSkillSub.click();

    // Mặc định mở Tab Items → Helmet
    var defaultItemSub = document.getElementById("defaultItemSub");
    if (defaultItemSub) defaultItemSub.click();
});

// --- CHUYỂN ĐỔI DARK / LIGHT THEME ---
function toggleTheme() {
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
    // Re-ensure currently active tab and its sub-tab remain visible after theme switch.
    try {
        // Re-click the active main tab to re-apply visibility rules
        const activeMain = document.querySelector('.btn.active');
        if (activeMain) activeMain.click();

        // If Skills tab is visible, ensure a sub-tab is opened (restore default if none active)
        const skillsTab = document.getElementById('tab-skills');
        if (skillsTab && window.getComputedStyle(skillsTab).display !== 'none') {
            const activeSub = document.querySelector('#tab-skills .sub-btn.active') || document.getElementById('defaultSkillSub');
            if (activeSub) activeSub.click();
        }
    } catch (e) {
        console.warn('Error while refreshing tabs after theme toggle', e);
    }
}

// --- CÁC HÀM XỬ LÝ TAB ---
async function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) tabcontent[i].style.display = "none";
    tablinks = document.getElementsByClassName("btn");
    for (i = 0; i < tablinks.length; i++) tablinks[i].classList.remove("active");

    if (!document.getElementById(tabName)) {
        await loadPageSection(tabName);
    }

    const targetTab = document.getElementById(tabName);
    if (targetTab) targetTab.style.display = "block";
    // prefer the event's currentTarget, fallback to data-tab selector
    const activeBtn = (evt && evt.currentTarget) ? evt.currentTarget : document.querySelector(`.btn[data-tab="${tabName}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    // If Items tab opened, ensure default sub 'Helmet' is activated
    if (tabName === "tab-items") {
        // Some pages build sub-buttons after insertion; schedule click on next tick
        setTimeout(() => {
            const defaultItemSub = document.getElementById("defaultItemSub");
            if (defaultItemSub) {
                defaultItemSub.click();
            }
        }, 0);
    }
}

function openSubTab(evt, subTabName, groupClass) {
    var i, subcontent, sublinks;
    subcontent = document.getElementsByClassName(groupClass);
    for (i = 0; i < subcontent.length; i++) subcontent[i].style.display = "none";
    var parent = evt.currentTarget.parentNode;
    sublinks = parent.getElementsByClassName("sub-btn");
    for (i = 0; i < sublinks.length; i++) sublinks[i].className = sublinks[i].className.replace(" active", "");
    document.getElementById(subTabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function openRuneSkillSub(evt, subId) {
    var subs = document.getElementsByClassName("runeskills-sub");
    for (var i = 0; i < subs.length; i++) subs[i].style.display = "none";
    document.getElementById(subId).style.display = "block";
    var buttons = document.querySelectorAll("#tab-runeskills .sub-btn");
    buttons.forEach(b => b.classList.remove("active"));
    evt.currentTarget.classList.add("active");
    applyRuneSkillFilter();
}

function openItemSub(evt, subId) {
    var items = document.getElementsByClassName("item-sub");
    for (var i = 0; i < items.length; i++) items[i].style.display = "none";
    document.getElementById(subId).style.display = "block";
    var buttons = document.querySelectorAll("#tab-items .sub-btn");
    buttons.forEach(b => b.classList.remove("active"));
    evt.currentTarget.classList.add("active");
}

// --- COMBINER ---
let currentSelectedRunes = [];

function applyRuneSelectionState(runeName, isSelected) {
    const runeIndex = currentSelectedRunes.indexOf(runeName);

    if (isSelected && runeIndex === -1) {
        currentSelectedRunes.push(runeName);
    } else if (!isSelected && runeIndex > -1) {
        currentSelectedRunes.splice(runeIndex, 1);
    }

    const runeElement = document.getElementById("rune-" + runeName);
    if (runeElement) {
        runeElement.classList.toggle("selected", isSelected);
    }
}

function toggleRune(runeName) {
    if (currentSelectedRunes.includes(runeName)) {
        applyRuneSelectionState(runeName, false);
    } else {
        if (currentSelectedRunes.length >= 4) {
            alert("Chỉ có thể chọn tối đa 4 Rune để tổ hợp!");
            return;
        }
        applyRuneSelectionState(runeName, true);
    }

    renderSelectedRunes();
    executeRuneCombination();
}

function removeRune(runeName) {
    applyRuneSelectionState(runeName, false);
    renderSelectedRunes();
    executeRuneCombination();
}

function clearRunes() {
    currentSelectedRunes.slice().forEach(runeName => applyRuneSelectionState(runeName, false));
    renderSelectedRunes();
    executeRuneCombination();
}

function renderSelectedRunes() {
    const container = document.getElementById("selected-runes-container");
    const clearBtn = document.getElementById("clear-runes-btn");

    if (!container || !clearBtn) return;

    container.innerHTML = "";
    if (currentSelectedRunes.length === 0) {
        clearBtn.style.display = "none";
        container.innerHTML = `<span style="color: var(--text-muted); font-size: 13px; font-style: italic;">Chưa có Rune nào được chọn...</span>`;
        return;
    }

    clearBtn.style.display = "inline-block";
    currentSelectedRunes.forEach(rune => {
        const badge = document.createElement("span");
        badge.className = "selected-rune-badge";
        badge.innerHTML = `${rune} <span class="remove-x" onclick="removeRune('${rune}')">&times;</span>`;
        container.appendChild(badge);
    });
}

function createRuneCombinationCard(row, isExactMatch) {
    const card = document.createElement("div");
    const cssClass = row.getAttribute("data-class") || "legend-title";
    const titleText = row.getAttribute("data-title");
    const skillText = row.getAttribute("data-skill");
    const shapeText = row.getAttribute("data-shape") || "N/A";
    const rarityText = row.getAttribute("data-rarity");
    const levelText = row.getAttribute("data-level");
    const runesListText = row.getAttribute("data-runeslist");
    const fullDetailsHTML = row.cells[2].innerHTML;

    card.className = "grid-card";
    if (isExactMatch) card.classList.add("exact-match-card");

    card.innerHTML = `
        <div class="${cssClass}" style="margin-bottom: 5px; font-size: 15px;">${titleText}</div>
        <div class="grid-card-skill">Hỗ trợ kỹ năng: ${skillText}</div>
        <div class="grid-card-meta">Hình dạng: ${shapeText} | Độ hiếm: ${rarityText}</div>
        <div class="grid-card-runes">Cấp độ yêu cầu: ${levelText} | Ngọc: ${runesListText}</div>
        <div class="grid-card-toggle-text">Nhấn để xem chi tiết ▼</div>
        <div class="grid-card-details">${fullDetailsHTML}</div>
    `;

    card.addEventListener("click", function () {
        this.classList.toggle("expanded");
        const toggleText = this.querySelector(".grid-card-toggle-text");
        if (toggleText) {
            toggleText.innerHTML = this.classList.contains("expanded") ? "Thu gọn ▲" : "Nhấn để xem chi tiết ▼";
        }
    });

    return card;
}

function executeRuneCombination() {
    const rows = document.querySelectorAll(".runeskills-sub tr[data-runes]");
    const container = document.getElementById("filter-content");
    const title = document.getElementById("filter-title");
    const box = document.getElementById("filter-result-box");

    if (!container || !title || !box) return;
    if (currentSelectedRunes.length === 0) {
        box.style.display = "none";
        return;
    }

    title.textContent = "Kết quả tổ hợp: " + currentSelectedRunes.join(" + ");
    container.innerHTML = "";

    const gridDiv = document.createElement("div");
    gridDiv.className = "grid-container";
    let matchCount = 0;
    let exactMatchFound = false;

    rows.forEach(row => {
        const runesAttr = row.getAttribute("data-runes");
        if (!runesAttr) return;

        const recipeRunes = runesAttr.split(" ");
        const containsAll = currentSelectedRunes.every(rune => recipeRunes.includes(rune));
        if (!containsAll) return;

        matchCount++;
        const isExactMatch = currentSelectedRunes.length === recipeRunes.length;
        if (isExactMatch) exactMatchFound = true;

        gridDiv.appendChild(createRuneCombinationCard(row, isExactMatch));
    });

    if (matchCount === 0) {
        container.innerHTML = "<p style='color: var(--text-muted);'>Không có công thức nào phù hợp với tổ hợp này.</p>";
    } else {
        const statusMessage = document.createElement("div");
        statusMessage.style.marginBottom = "15px";
        statusMessage.style.color = exactMatchFound ? "var(--success)" : "var(--text-muted)";
        statusMessage.innerHTML = exactMatchFound
            ? "🎉 <b style='font-size: 14px;'>Tổ hợp thành công!</b> Bạn đã tìm ra công thức hoàn chỉnh:"
            : "Các công thức có chứa tổ hợp này:";
        container.appendChild(statusMessage);
        container.appendChild(gridDiv);
    }

    box.style.display = "block";
}

// --- BỘ LỌC KỸ NĂNG & HÌNH DẠNG ---
function applyRuneSkillFilter() {
    var typeFilter = document.getElementById("filterSkillType").value;
    var shapeFilter = document.getElementById("filterRuneShape").value;
    var rows = document.querySelectorAll(".runeskills-sub tr[data-runes]");

    rows.forEach(row => {
        var shape = row.getAttribute("data-shape") || "";
        var htmlContent = row.innerHTML.toLowerCase();
        var isPassive = htmlContent.includes("cơ hội thi triển") || htmlContent.includes("chance to cast") || htmlContent.includes("kích hoạt bổ trợ");
        var isActive = !isPassive;

        var matchType = (typeFilter === "all") || (typeFilter === "active" && isActive) || (typeFilter === "passive" && isPassive);
        var matchShape = (shapeFilter === "all") || shape.includes(shapeFilter);

        row.style.display = (matchType && matchShape) ? "" : "none";
    });
}

// --- ATTRIBUTES DATA LOADING ---
let attributesData = [];

async function loadAttributesData() {
    const container = document.getElementById("attributes-table-container");
    if (!container) return;

    try {
        const response = await fetch("data/attributes_data.json");
        if (!response.ok) {
            throw new Error(`Không tải được dữ liệu attributes (${response.status})`);
        }

        attributesData = await response.json();
        displayAttributesTable(attributesData);
    } catch (error) {
        console.error("Lỗi khi tải dữ liệu attributes:", error);
        container.innerHTML = "<p style='color: var(--danger);'>Lỗi tải dữ liệu chỉ số!</p>";
    }
}

function displayAttributesTable(data) {
    const container = document.getElementById("attributes-table-container");
    if (!container) return;

    let html = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
                <tr style="background: var(--table-header); border-bottom: 2px solid var(--border-color);">
                    <th style="padding: 12px; text-align: left; color: var(--text-main); font-weight: 700;">Level</th>
                    <th style="padding: 12px; text-align: right; color: var(--text-main); font-weight: 700;">Coin</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach((row, index) => {
        const bgColor = index % 2 === 0 ? "transparent" : "var(--table-hover)";
        html += `
            <tr class="attributes-row" data-level="${row.lvl}" style="background: ${bgColor}; border-bottom: 1px solid var(--border-color);">
                <td style="padding: 12px; text-align: left; color: var(--text-main);">${row.lvl}</td>
                <td style="padding: 12px; text-align: right; color: var(--accent-primary); font-weight: 600;">${row.coin}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

function filterAttributesRange() {
    const filterValue = document.getElementById("filterAttrRange").value;
    const rows = document.querySelectorAll(".attributes-row");

    if (filterValue === "all") {
        rows.forEach(row => row.style.display = "");
    } else {
        const [minLevel, maxLevel] = filterValue.split("-").map(Number);
        rows.forEach(row => {
            const level = parseInt(row.getAttribute("data-level"));
            row.style.display = (level >= minLevel && level <= maxLevel) ? "" : "none";
        });
    }
}

