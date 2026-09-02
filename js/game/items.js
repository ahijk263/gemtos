// ==========================================
// MODULE: ITEMS
// ==========================================

import { loadJson } from "./dataLoader.js";

let itemsData;

export async function loadItemsData() {
    itemsData ??= await loadJson("./data/items_data.json");
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
                    ${item.shrinePrice ? `<div class="shrine-price">Giá shop shrine: ${item.shrinePrice}</div>` : ""}
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
