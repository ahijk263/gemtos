// ==========================================
// MODULE: ATTRIBUTES
// ==========================================

import attributesData from "../../data/attributes_data.json";

const ATTRIBUTE_RANGES = [
    { min: 1, max: 100, label: "Level 1 - 100" },
    { min: 101, max: 200, label: "Level 101 - 200" },
    { min: 201, max: 300, label: "Level 201 - 300" },
    { min: 301, max: 400, label: "Level 301 - 400" },
    { min: 401, max: 500, label: "Level 401 - 500" },
    { min: 501, max: 600, label: "Level 501 - 600" },
    { min: 601, max: 700, label: "Level 601 - 700" },
    { min: 701, max: 750, label: "Level 701 - 750 (Max)" }
];

function parseCoinValue(coinStr) {
    if (!coinStr || coinStr === "MAX") return 0;
    return parseInt(String(coinStr).replace(/,/g, "")) || 0;
}

export function loadAttributesData() {
    renderAttributesView();
}

export function renderAttributesView() {
    const container = document.getElementById("attributes-table-container");
    if (!container || !attributesData || !attributesData.length) return;

    const selectElem = document.getElementById("filterAttrRange");
    const searchElem = document.getElementById("filterAttrSearch");
    const filterValue = selectElem ? selectElem.value : "all";
    const searchValue = searchElem ? searchElem.value.trim() : "";

    // 1. Tìm kiếm level cụ thể
    if (searchValue !== "") {
        const targetLevel = parseInt(searchValue);
        const matched = attributesData.filter((r) => r.lvl === targetLevel);
        if (matched.length === 0) {
            container.innerHTML = `<p style="color: var(--text-muted); padding: 15px;">Không tìm thấy kết quả cho Level ${targetLevel} (Hỗ trợ Level 1 - 750).</p>`;
            return;
        }

        let html = `<div class="attributes-grid">`;
        matched.forEach((row) => {
            html += `
                <div class="attributes-row attributes-item" data-level="${row.lvl}">
                    <span class="attr-lvl">Level ${row.lvl}</span>
                    <span class="attr-coin">🪙 ${row.coin}</span>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
        return;
    }

    // 2. Mốc "all" -> Hiển thị 2 cột, mỗi bên 4 hàng
    if (filterValue === "all") {
        let totalAll = 0;
        const leftRanges = ATTRIBUTE_RANGES.slice(0, 4);
        const rightRanges = ATTRIBUTE_RANGES.slice(4, 8);

        const renderSubTable = (rangesList) => {
            let tableHtml = `
                <table class="attributes-summary-table">
                    <thead>
                        <tr>
                            <th>Mốc Level</th>
                            <th>Tổng số Coin</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            rangesList.forEach((range) => {
                const rangeRows = attributesData.filter((r) => r.lvl >= range.min && r.lvl <= range.max);
                const sumCoin = rangeRows.reduce((acc, r) => acc + parseCoinValue(r.coin), 0);
                totalAll += sumCoin;

                tableHtml += `
                    <tr class="summary-row" onclick="selectAttributeRange('${range.min}-${range.max}')" title="Bấm để xem chi tiết mốc ${range.label}">
                        <td style="color: var(--text-main); font-weight: 600;">
                            <span style="color: var(--accent-primary); margin-right: 6px;">▶</span> ${range.label}
                        </td>
                        <td style="color: var(--accent-primary); font-weight: 700; font-size: 14px;">
                            ${sumCoin.toLocaleString("en-US")} 🪙
                        </td>
                    </tr>
                `;
            });

            tableHtml += `
                    </tbody>
                </table>
            `;
            return tableHtml;
        };

        const leftTableHtml = renderSubTable(leftRanges);
        const rightTableHtml = renderSubTable(rightRanges);

        let html = `
            <div style="margin-bottom: 14px; font-size: 14px; color: var(--text-muted);">
                💡 Bấm vào một mốc level bất kỳ dưới đây để xem chi tiết từng cấp độ.
            </div>
            <div class="attributes-summary-container">
                <div class="summary-columns-grid">
                    <div>${leftTableHtml}</div>
                    <div>${rightTableHtml}</div>
                </div>
                <div class="summary-grand-total">
                    <span class="total-label">Tổng cộng toàn bộ (Level 1 - 750):</span>
                    <span class="total-value">${totalAll.toLocaleString("en-US")} 🪙</span>
                </div>
            </div>
        `;

        container.innerHTML = html;
        return;
    }

    // 3. Mốc cụ thể -> Hiển thị dạng lưới 5 cột
    const [minLevel, maxLevel] = filterValue.split("-").map(Number);
    const filteredRows = attributesData.filter((r) => r.lvl >= minLevel && r.lvl <= maxLevel);
    const rangeTotal = filteredRows.reduce((acc, r) => acc + parseCoinValue(r.coin), 0);

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 8px;">
            <span style="font-weight: 700; color: var(--text-main); font-size: 15px;">
                Chi tiết Level ${minLevel} - ${maxLevel}
            </span>
            <span style="font-weight: 700; color: #f59e0b; font-size: 14px; background: rgba(245, 158, 11, 0.1); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(245, 158, 11, 0.3);">
                Tổng mốc: ${rangeTotal.toLocaleString("en-US")} 🪙
            </span>
        </div>
        <div class="attributes-grid">
    `;

    filteredRows.forEach((row) => {
        html += `
            <div class="attributes-row attributes-item" data-level="${row.lvl}">
                <span class="attr-lvl">Level ${row.lvl}</span>
                <span class="attr-coin">${row.coin} 🪙</span>
            </div>
        `;
    });

    html += `</div>`;
    container.innerHTML = html;
}

export function selectAttributeRange(rangeVal) {
    const selectElem = document.getElementById("filterAttrRange");
    if (selectElem) {
        selectElem.value = rangeVal;
        renderAttributesView();
    }
}

export function filterAttributesRange() {
    renderAttributesView();
}
