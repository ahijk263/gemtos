// ==========================================
// MODULE: RUNES & COMBINER
// ==========================================

import { loadJson } from "./dataLoader.js";

let runesData;

export let currentSelectedRunes = [];

export async function loadRunesData() {
    runesData ??= await loadJson("./data/runes_data.json");
    renderRunesList(runesData);
}

export function renderRunesList(data) {
    const tbody = document.getElementById("runes-table-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    const groups = ["legendary", "epic", "rare", "common"];

    groups.forEach((groupKey) => {
        const runes = data[groupKey] || [];
        // Chunk into rows of 4
        for (let i = 0; i < runes.length; i += 4) {
            const tr = document.createElement("tr");
            const chunk = runes.slice(i, i + 4);

            chunk.forEach((rune) => {
                const td = document.createElement("td");
                td.style.border = "none";
                td.style.padding = "5px";

                const isSelected = currentSelectedRunes.includes(rune.name);
                const selectedClass = isSelected ? " selected" : "";

                td.innerHTML = `
                    <div class="rune-card ${rune.className}${selectedClass}" id="rune-${rune.name}" onclick="toggleRune('${rune.name}')">
                        <span class="rune-name">${rune.name}</span>
                        <span class="stars">${rune.stars}</span>
                    </div>
                `;
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        }
    });

    renderSelectedRunes();
}

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

export function toggleRune(runeName) {
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

export function removeRune(runeName) {
    applyRuneSelectionState(runeName, false);
    renderSelectedRunes();
    executeRuneCombination();
}

export function clearRunes() {
    currentSelectedRunes.slice().forEach((runeName) => applyRuneSelectionState(runeName, false));
    renderSelectedRunes();
    executeRuneCombination();
}

export function renderSelectedRunes() {
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
    currentSelectedRunes.forEach((rune) => {
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

export function executeRuneCombination() {
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

    rows.forEach((row) => {
        const runesAttr = row.getAttribute("data-runes");
        if (!runesAttr) return;

        const recipeRunes = runesAttr.split(" ");
        const containsAll = currentSelectedRunes.every((rune) => recipeRunes.includes(rune));
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
