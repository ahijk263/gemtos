// ==========================================
// MODULE: ITEMS
// ==========================================

import itemsData from "../../data/items_data.json" assert { type: "json" };

export function loadItemsData() {
    renderItems(itemsData);
}

export function renderItems(data) {
    const categories = [
        { key: "helmet", tbodyId: "items-helmet-tbody" },
        { key: "artifact", tbodyId: "items-artifact-tbody" },
        { key: "collar", tbodyId: "items-collar-tbody" },
        { key: "frontlegs", tbodyId: "items-frontlegs-tbody" },
        { key: "rearlegs", tbodyId: "items-rearlegs-tbody" },
        { key: "armor", tbodyId: "items-armor-tbody" },
    ];

    categories.forEach(({ key, tbodyId }) => {
        const tbody = document.getElementById(tbodyId);
        if (!tbody) return;

        const items = data[key] || [];
        tbody.innerHTML = "";

        items.forEach((item) => {
            const tr = document.createElement("tr");

            const nameClass = item.nameClass || "legend-title";
            const elementClass = item.elementClass || "";

            const baseStatsHtml = (item.baseStats || [])
                .map((stat) => `<div>${stat}</div>`)
                .join("");

            const tiersHtml = (item.tiers || [])
                .map((tier) => `
                    <div>
                        <span class="tier-title">${tier.tier}</span>
                        ${tier.desc}
                    </div>
                `)
                .join("");

            tr.innerHTML = `
                <td>
                    <span class="${nameClass}">${item.name}</span>
                </td>
                <td>
                    <span class="${elementClass}">${item.element}</span>
                </td>
                <td class="item-stats">
                    ${baseStatsHtml}
                </td>
                <td class="item-stats">
                    ${tiersHtml}
                </td>
            `;

            tbody.appendChild(tr);
        });
    });
}
