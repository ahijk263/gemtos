// ==========================================
// MODULE: SKILLS
// ==========================================

import skillsData from "../../data/skills_data.json";

export function loadSkillsData() {
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
                </td>
            `;

            tbody.appendChild(tr);
        });
    });
}
