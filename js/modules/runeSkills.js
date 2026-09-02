// ==========================================
// MODULE: RUNE SKILLS
// ==========================================

import { loadJson } from "./dataLoader.js";

let runeSkillsData;

export function renderRuneSkillRows(rows, targetId) {
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

export async function loadRuneSkillsData() {
    runeSkillsData ??= await loadJson("./data/rune-skills_data.json");
    const targetBodies = [
        { key: "legend", id: "rune-skills-table-body" },
        { key: "epic", id: "rune-skills-epic-table-body" },
        { key: "rare", id: "rune-skills-rare-table-body" }
    ];

    targetBodies.forEach(({ key, id }) => {
        const rows = Array.isArray(runeSkillsData[key]) ? runeSkillsData[key] : [];
        renderRuneSkillRows(rows, id);
    });
}

export function openRuneSkillSub(evt, subId) {
    const subs = document.getElementsByClassName("runeskills-sub");
    for (let i = 0; i < subs.length; i++) subs[i].style.display = "none";
    const target = document.getElementById(subId);
    if (target) target.style.display = "block";

    const buttons = document.querySelectorAll("#tab-runeskills .sub-btn");
    buttons.forEach((b) => b.classList.remove("active"));
    if (evt && evt.currentTarget) {
        evt.currentTarget.classList.add("active");
    }
    applyRuneSkillFilter();
}

export function applyRuneSkillFilter() {
    const typeFilterEl = document.getElementById("filterSkillType");
    const shapeFilterEl = document.getElementById("filterRuneShape");
    if (!typeFilterEl || !shapeFilterEl) return;

    const typeFilter = typeFilterEl.value;
    const shapeFilter = shapeFilterEl.value;
    const rows = document.querySelectorAll(".runeskills-sub tr[data-runes]");

    rows.forEach((row) => {
        const shape = row.getAttribute("data-shape") || "";
        const htmlContent = row.innerHTML.toLowerCase();
        const isPassive = htmlContent.includes("cơ hội thi triển") || htmlContent.includes("chance to cast") || htmlContent.includes("kích hoạt bổ trợ");
        const isActive = !isPassive;

        const matchType = (typeFilter === "all") || (typeFilter === "active" && isActive) || (typeFilter === "passive" && isPassive);
        const matchShape = (shapeFilter === "all") || shape.includes(shapeFilter);

        row.style.display = (matchType && matchShape) ? "" : "none";
    });
}
