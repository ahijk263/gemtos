// ==========================================
// MODULE: SKILLS
// ==========================================

import { loadJson } from "./dataLoader.js";

let skillsData;
let skillDetailsData;

export async function loadSkillsData() {
    skillsData ??= await loadJson("./data/skills_data.json");
    renderSkills(skillsData);
}

export function renderSkills(data) {
    const categories = [
        { key: "basic", tbodyId: "skills-basic-tbody" },
        { key: "specials", tbodyId: "skills-specials-tbody" },
        { key: "auras", tbodyId: "skills-auras-tbody" },
        { key: "totems", tbodyId: "skills-totems-tbody" },
    ];

    categories.forEach(({ key, tbodyId }) => {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        const items = data[key] || [];
        tbody.innerHTML = "";

        items.forEach((skill) => {
            const tr = document.createElement("tr");

            const elementBadge = skill.elementClass
                ? `<span class="${skill.elementClass}">${skill.element}</span>`
                : `<span>${skill.element}</span>`;

            const viHtml = skill.descVi
                ? `<div class="skill-translation">(${skill.descVi})</div>`
                : "";

            const gemHtml = skill.gems
                ? `<span class="gem-icon">💎</span> ${skill.gems}`
                : `<span class="gem-icon">💎</span> Chưa rõ`;

            tr.innerHTML = `
                <td>${elementBadge}</td>
                <td><b>${skill.name}</b></td>
                <td>
                    <div>${skill.descEn}</div>
                    ${viHtml}
                </td>
                <td class="gem-text">
                    ${gemHtml}
                    <button class="skill-detail-btn" type="button" data-skill-name="${encodeURIComponent(skill.name)}">Xem chi tiết →</button>
                </td>
            `;

            tbody.appendChild(tr);
        });

        tbody.querySelectorAll(".skill-detail-btn").forEach((button) => {
            button.addEventListener("click", () => openSkillDetails(decodeURIComponent(button.dataset.skillName)));
        });
    });
}

export async function openSkillDetails(skillName) {
    skillDetailsData ??= await loadJson("./data/skills-update-detail_data.json");
    const details = skillDetailsData[skillName];
    const modal = getSkillDetailsModal();
    modal.querySelector("#skillDetailsTitle").textContent = skillName;
    const body = modal.querySelector("#skillDetailsBody");
    body.replaceChildren();

    if (!details) {
        const message = document.createElement("p");
        message.className = "skill-detail-empty";
        message.textContent = "Chưa có dữ liệu chi tiết cho skill này.";
        body.appendChild(message);
    } else {
        const table = document.createElement("table");
        table.className = "skill-detail-table";
        table.innerHTML = "<thead><tr><th>Cấp</th><th>Gem</th><th>Chỉ số</th></tr></thead>";
        const tableBody = document.createElement("tbody");
        const levels = [{ label: "Mở khóa", ...details.unlock }, ...(details.levels || []).map((level, index) => ({ label: `Lv. ${index + 1}`, ...level }))];

        levels.forEach(({ label, cost, stats }) => {
            const row = document.createElement("tr");
            [label, cost, stats].forEach((value, index) => {
                const cell = document.createElement("td");
                if (index === 1 && value != null) {
                    cell.innerHTML = `<span class="gem-icon">💎</span> ${value}`;
                } else {
                    cell.textContent = value ?? "—";
                }
                row.appendChild(cell);
            });
            tableBody.appendChild(row);
        });
        table.appendChild(tableBody);
        body.appendChild(table);
    }

    modal.style.display = "flex";
    requestAnimationFrame(() => modal.classList.add("show"));
}

function getSkillDetailsModal() {
    let modal = document.getElementById("skillDetailsModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "skillDetailsModal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
        <div class="modal-content skill-details-modal" role="dialog" aria-modal="true" aria-labelledby="skillDetailsTitle">
            <div class="modal-header">
                <h3 id="skillDetailsTitle"></h3>
                <button class="close-btn" type="button" aria-label="Đóng">&times;</button>
            </div>
            <div id="skillDetailsBody"></div>
        </div>`;

    const close = () => {
        modal.classList.remove("show");
        setTimeout(() => { modal.style.display = "none"; }, 250);
    };
    modal.addEventListener("click", (event) => {
        if (event.target === modal) close();
    });
    modal.querySelector(".close-btn").addEventListener("click", close);
    document.body.appendChild(modal);
    return modal;
}
