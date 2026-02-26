const allVersions = [
    "1.21.12", "1.21.11", "1.21.10", "1.21.9", "1.21.8", "1.21.7", "1.21.6", "1.21.5", "1.21.4", "1.21.3", "1.21.2", "1.21.1", "1.21",
    "1.20.6", "1.20.5", "1.20.4", "1.20.3", "1.20.2", "1.20.1", "1.20", "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19",
    "1.18.2", "1.18.1", "1.18", "1.17.1", "1.17", "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16", "1.15.2", "1.15.1", "1.15"
];

let currentType = "mod";
let currentOffset = 0;
let currentTotal = 0;
let activeProject = null;
let selectedFilters = {};
let collapsedGroups = new Set();
let expandedItems = new Set();

const pageSize = 12;
const icons = {
    loaders: "🧩",
    categories: "🏷️",
    environments: "🌍",
    versions: "📅",
    resolutions: "🖼️",
    features: "✨",
    performance: "⚡",
    platforms: "🧱"
};

const valueIconMap = {
    Fabric: "🧵",
    Forge: "🛠️",
    NeoForge: "⚙️",
    Quilt: "🪡",
    Combat: "⚔️",
    Adventure: "🧭",
    Decoration: "🪴",
    Optimization: "🚀",
    Technology: "🤖",
    Utility: "🧰",
    Magic: "🔮",
    World: "🌎"
};

const filterConfig = {
    mod: {
        loaders: ["Fabric", "Forge", "NeoForge", "Quilt"],
        categories: ["Adventure", "Combat", "Decoration", "Magic", "Optimization", "Technology", "Utility"],
        environments: ["Client", "Server"]
    },
    resourcepack: {
        categories: ["Combat", "Decoration", "Realistic", "Simplistic", "Utility", "Vanilla Like"],
        features: ["Audio", "Blocks", "Entities", "Environment", "GUI", "Items"],
        resolutions: ["16x", "32x", "64x", "128x"]
    },
    datapack: {
        categories: ["Adventure", "Combat", "Decoration", "Game Mechanics", "Magic", "Technology", "Utility"]
    },
    shader: {
        categories: ["Cartoon", "Fantasy", "Realistic", "Vanilla Like"],
        features: ["Atmosphere", "Bloom", "Reflections", "Shadows"],
        performance: ["Low", "Medium", "High"]
    },
    modpack: {
        categories: ["Adventure", "Combat", "Magic", "Optimization", "Quests", "Technology"],
        loaders: ["Fabric", "Forge", "NeoForge", "Quilt"],
        environments: ["Client", "Server"]
    },
    plugin: {
        categories: ["Adventure", "Combat", "Economy", "Management", "Social", "Utility"],
        loaders: ["Paper", "Purpur", "Spigot"],
        platforms: ["BungeeCord", "Velocity", "Waterfall"]
    }
};

const filterKeyToFacet = {
    categories: "categories",
    loaders: "categories",
    environments: "client_side",
    versions: "versions",
    features: "categories",
    performance: "categories",
    resolutions: "categories",
    platforms: "categories"
};

function getValueIcon(group, value) {
    if (group === "categories" || group === "loaders") return valueIconMap[value] || "🏷️";
    return icons[group] || "•";
}

function toggleGroup(key) {
    if (collapsedGroups.has(key)) collapsedGroups.delete(key);
    else collapsedGroups.add(key);
    renderFilters();
}

function toggleShowMore(key) {
    if (expandedItems.has(key)) expandedItems.delete(key);
    else expandedItems.add(key);
    renderFilters();
}

function renderFilterGroup(key, list) {
    const max = expandedItems.has(key) ? list.length : Math.min(6, list.length);
    const visibleItems = list.slice(0, max);

    return `
        <div class="filter-group">
            <div class="filter-title" onclick="toggleGroup('${key}')">
                ${key.toUpperCase()} <span style="transform:rotate(${collapsedGroups.has(key) ? "-90" : "0"}deg);transition:.2s">▼</span>
            </div>
            <div class="filter-content ${collapsedGroups.has(key) ? "collapsed" : ""}" style="max-height:${collapsedGroups.has(key) ? "0" : "520px"}">
                <div class="space-y-1">
                    ${visibleItems.map((value) => `
                        <div class="filter-item ${selectedFilters[key]?.includes(value) ? "active" : ""}" onclick="toggleFilter('${key}', '${value.replace(/'/g, "\\'")}')">
                            <span class="category-icon">${getValueIcon(key, value)}</span>
                            <div class="check-box"></div>
                            <span>${value}</span>
                        </div>
                    `).join("")}
                    ${list.length > 6 ? `<button class="show-more-btn" onclick="toggleShowMore('${key}')">${expandedItems.has(key) ? "Show Less" : "Show More"}</button>` : ""}
                </div>
            </div>
        </div>
    `;
}

function renderFilters() {
    const container = document.getElementById("filter-container");
    const config = filterConfig[currentType] || filterConfig.mod;

    let html = renderFilterGroup("versions", allVersions);
    Object.entries(config).forEach(([key, values]) => {
        html += renderFilterGroup(key, values);
    });

    container.innerHTML = html;
}

function buildFacets() {
    const facets = [];
    Object.entries(selectedFilters).forEach(([filterKey, values]) => {
        if (!values.length) return;
        const facetKey = filterKeyToFacet[filterKey];
        if (!facetKey) return;

        if (filterKey === "environments") {
            const envFacet = values.map((v) => `client_side:${v.toLowerCase() === "client" ? "required" : "optional"}`);
            facets.push(envFacet);
            return;
        }

        facets.push(values.map((v) => `${facetKey}:${v}`));
    });
    return JSON.stringify(facets);
}

function updatePagingUI() {
    const currentPage = Math.floor(currentOffset / pageSize) + 1;
    const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));
    document.getElementById("page-display").innerText = `/ ${totalPages}`;
    document.getElementById("page-input").value = currentPage;
}

async function fetchData() {
    const grid = document.getElementById("mod-grid");
    grid.innerHTML = `<p class="text-sm opacity-60">Syncing assets...</p>`;

    const q = document.getElementById("global-search").value.trim();
    const sort = document.getElementById("sort-select").value;
    const facets = buildFacets();

    try {
        const params = new URLSearchParams({
            query: q,
            limit: String(pageSize),
            offset: String(currentOffset),
            index: sort,
            facets,
            project_type: currentType
        });

        const data = await fetch(`https://api.modrinth.com/v2/search?${params.toString()}`).then((r) => r.json());
        currentTotal = data.total_hits || 0;
        document.getElementById("total-results").innerText = currentTotal.toLocaleString();
        updatePagingUI();

        if (!data.hits?.length) {
            grid.innerHTML = `<div class="opacity-60 font-semibold">Sonuç bulunamadı.</div>`;
            return;
        }

        grid.innerHTML = data.hits.map((m) => `
            <div class="mod-card ${["mod", "plugin", "datapack"].includes(currentType) ? "no-banner" : ""}" onclick="openDetail('${m.project_id}')">
                <div class="banner-area">
                    ${!["mod", "plugin", "datapack"].includes(currentType) ? `<img src="${m.gallery?.[0] || "https://via.placeholder.com/400x200?text=Zephyr"}" class="banner-img">` : ""}
                    <img src="${m.icon_url || "https://via.placeholder.com/50"}" class="card-logo" onerror="this.src='https://via.placeholder.com/50'">
                </div>
                <div class="p-6 flex-1 flex flex-col ${["mod", "plugin", "datapack"].includes(currentType) ? "pt-12" : "pt-10"}">
                    <div class="flex justify-between items-start mb-2 gap-2">
                        <h3 class="text-lg font-extrabold tracking-tight line-clamp-1">${m.title}</h3>
                        <span class="text-[10px] font-black opacity-40">👁 ${Math.floor((m.downloads || 0) * 1.7).toLocaleString()}</span>
                    </div>
                    <p class="text-slate-400 text-xs font-semibold leading-relaxed mb-6 line-clamp-2 h-10">${m.description || "Açıklama yok."}</p>
                    <div class="mt-auto flex items-center justify-between pt-4 border-t" style="border-color:var(--border)">
                        <div class="flex flex-col">
                            <span class="text-[8px] font-black opacity-20 uppercase">Downloads</span>
                            <span class="text-[11px] font-black italic">⬇ ${(m.downloads || 0).toLocaleString()}</span>
                        </div>
                        <span class="text-[9px] font-black px-3 py-1.5 rounded-lg uppercase" style="background:color-mix(in srgb, var(--accent) 14%, transparent);color:var(--accent)">${m.latest_version || "v1.0"}</span>
                    </div>
                </div>
            </div>
        `).join("");
    } catch (error) {
        grid.innerHTML = `<div class="text-red-400 font-semibold">Error syncing assets.</div>`;
    }
}

async function openDetail(id) {
    const panel = document.getElementById("detail-panel");
    panel.classList.add("active");
    document.body.style.overflow = "hidden";

    const [p, v] = await Promise.all([
        fetch(`https://api.modrinth.com/v2/project/${id}`).then((r) => r.json()),
        fetch(`https://api.modrinth.com/v2/project/${id}/version`).then((r) => r.json())
    ]);

    activeProject = { p, v };
    setDetailTab("desc");
}

function setDetailTab(tab) {
    const body = document.getElementById("detail-body");
    document.querySelectorAll("#detail-panel .nav-tab").forEach((t) => t.classList.remove("active"));
    document.getElementById(`tab-${tab}`).classList.add("active");

    if (!activeProject) return;
    const { p, v } = activeProject;

    if (tab === "desc") {
        body.innerHTML = `
            <div class="flex gap-16">
                <div class="flex-1">
                    <div class="flex items-center gap-8 mb-12">
                        <img src="${p.icon_url}" class="w-32 h-32 rounded-[32px] shadow-2xl">
                        <div>
                            <h2 class="text-5xl font-black tracking-tighter mb-2">${p.title}</h2>
                            <p class="text-blue-500 font-bold text-xs uppercase tracking-[3px]">ID: ${p.id}</p>
                        </div>
                    </div>
                    <div class="prose max-w-none opacity-80 leading-loose">${p.body || p.description || "İçerik yok."}</div>
                </div>
            </div>
        `;
    } else if (tab === "gal") {
        body.innerHTML = `<div class="grid grid-cols-2 gap-8">${(p.gallery || []).map((i) => `<img src="${i.url}" class="rounded-[20px]">`).join("") || "Galeri yok."}</div>`;
    } else if (tab === "chan") {
        body.innerHTML = `<div class="space-y-6">${v.slice(0, 5).map((ver) => `<div class="p-6 rounded-2xl" style="background:var(--soft)"><h3 class="font-black mb-2">${ver.version_number}</h3><div class="text-sm opacity-70">${ver.changelog || "No changelog provided."}</div></div>`).join("")}</div>`;
    } else {
        body.innerHTML = `<div class="space-y-3">${v.map((ver) => `<div class="p-6 rounded-2xl flex justify-between items-center" style="border:1px solid var(--border)"><div><p class="font-black">${ver.version_number}</p><p class="text-[10px] opacity-40 font-bold uppercase">${(ver.game_versions || []).join(" • ")}</p></div><a href="${ver.files?.[0]?.url || "#"}" class="w-12 h-12 flex items-center justify-center rounded-xl" style="background:var(--soft)">⬇</a></div>`).join("")}</div>`;
    }
}

function closePanel() {
    document.getElementById("detail-panel").classList.remove("active");
    document.body.style.overflow = "auto";
}

function toggleFilter(type, value) {
    if (!selectedFilters[type]) selectedFilters[type] = [];
    const idx = selectedFilters[type].indexOf(value);
    if (idx > -1) selectedFilters[type].splice(idx, 1);
    else selectedFilters[type].push(value);

    currentOffset = 0;
    renderFilters();
    fetchData();
}

function navPage(delta) {
    const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));
    const currentPage = Math.floor(currentOffset / pageSize) + 1;
    const next = Math.min(totalPages, Math.max(1, currentPage + delta));
    currentOffset = (next - 1) * pageSize;
    fetchData();
}

function jumpToPage(page) {
    const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));
    const safePage = Math.min(totalPages, Math.max(1, page || 1));
    currentOffset = (safePage - 1) * pageSize;
    fetchData();
}

function applyTheme(theme, withAnimation = true) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = theme === "system" ? (prefersDark ? "dark" : "light") : theme;

    document.body.classList.remove("theme-dark", "anim-dark", "anim-light");
    if (resolved === "dark") document.body.classList.add("theme-dark");

    if (withAnimation) {
        document.body.classList.add(resolved === "dark" ? "anim-dark" : "anim-light");
        setTimeout(() => document.body.classList.remove("anim-dark", "anim-light"), 1200);
    }

    localStorage.setItem("themePreference", theme);
}

function toggleSettings() {
    document.getElementById("theme-menu").classList.toggle("hidden");
}

window.onclick = (event) => {
    const menu = document.getElementById("theme-menu");
    if (!menu.contains(event.target) && !event.target.closest("button[onclick='toggleSettings()']")) {
        menu.classList.add("hidden");
    }
};

function attachEvents() {
    document.querySelectorAll("#type-nav button").forEach((button) => {
        button.onclick = () => {
            document.querySelector("#type-nav button.active")?.classList.remove("active");
            button.classList.add("active");
            currentType = button.dataset.type;
            selectedFilters = {};
            expandedItems = new Set();
            currentOffset = 0;
            renderFilters();
            fetchData();
        };
    });

    document.getElementById("sort-select").addEventListener("change", () => {
        currentOffset = 0;
        fetchData();
    });

    document.getElementById("global-search").addEventListener("input", () => {
        clearTimeout(window.searchTimer);
        window.searchTimer = setTimeout(() => {
            currentOffset = 0;
            fetchData();
        }, 400);
    });

    document.getElementById("page-input").addEventListener("change", (e) => {
        jumpToPage(Number(e.target.value));
    });

    document.querySelectorAll(".theme-item").forEach((item) => {
        item.addEventListener("click", () => {
            applyTheme(item.dataset.theme);
            document.getElementById("theme-menu").classList.add("hidden");
        });
    });
}

window.onload = () => {
    document.getElementById("footer-year").textContent = new Date().getFullYear();
    attachEvents();
    renderFilters();
    applyTheme(localStorage.getItem("themePreference") || "system", false);
    fetchData();
};
