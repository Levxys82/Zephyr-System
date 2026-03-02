const allVersions = [
    // 1.21 Serisi
    "1.21.12", "1.21.11", "1.21.10", "1.21.9", "1.21.8", "1.21.7", "1.21.6", "1.21.5", "1.21.4", "1.21.3", "1.21.2", "1.21.1", "1.21", 
    // 1.20 Serisi
    "1.20.6", "1.20.5", "1.20.4", "1.20.3", "1.20.2", "1.20.1", "1.20",
    // 1.19 Serisi
    "1.19.4", "1.19.3", "1.19.2", "1.19.1", "1.19",
    // 1.18 Serisi
    "1.18.2", "1.18.1", "1.18",
    // 1.17 Serisi
    "1.17.1", "1.17",
    // 1.16 Serisi
    "1.16.5", "1.16.4", "1.16.3", "1.16.2", "1.16.1", "1.16",
    // Klasik ve Alt Sürümler
    "1.15.2", "1.15.1", "1.15",
    "1.14.4", "1.14.3", "1.14.2", "1.14.1", "1.14",
    "1.13.2", "1.13.1", "1.13",
    "1.12.2", "1.12.1", "1.12",
    "1.11.2", "1.11.1", "1.11",
    "1.10.2", "1.10.1", "1.10",
    "1.9.4", "1.9.3", "1.9.2", "1.9.1", "1.9",
    "1.8.9", "1.8.8", "1.8.7", "1.8.6", "1.8.5", "1.8.4", "1.8.3", "1.8.2", "1.8.1", "1.8",
    "1.7.10", "1.7.9", "1.7.8", "1.7.7", "1.7.6", "1.7.5", "1.7.4", "1.7.3", "1.7.2",
    "1.6.4", "1.6.2", "1.6.1",
    "1.5.2", "1.5.1",
    "1.4.7", "1.4.6", "1.4.5", "1.4.4", "1.4.2",
    "1.3.2", "1.3.1",
    "1.2.5", "1.2.4", "1.2.3", "1.2.2", "1.2.1",
    "1.1", "1.0"
];

let currentType = 'mod', currentOffset = 0, activeProject = null, selectedFilters = {};
let collapsedGroups = new Set();
let expandedItems = new Set();

const icons = {
    loaders: "https://cdn-icons-png.flaticon.com/128/606/606679.png",
    categories: "https://cdn-icons-png.flaticon.com/128/711/711284.png",
    environments: "https://cdn-icons-png.flaticon.com/128/2592/2592317.png",
    versions: "https://cdn-icons-png.flaticon.com/128/4438/4438839.png",
    resolutions: "https://cdn-icons-png.flaticon.com/128/159/159604.png",
    features: "https://cdn-icons-png.flaticon.com/128/1067/1067561.png",
    performance: "https://cdn-icons-png.flaticon.com/128/3112/3112946.png",
    platforms: "https://cdn-icons-png.flaticon.com/128/900/900618.png"
};

const filterConfig = {
    mod: { 
        loaders: ["Fabric", "Forge", "NeoForge", "Babric", "BTA (Babric)", "Java Agent", "Legacy Fabric", "LiteLoader", "Risugami's ModLoader", "NilLoader", "Ornithe", "Quilt", "Rift"],
        categories: ["Adventure","Cursed","Decoration","Economy","Equipment","Food","Game Mechanics","Library","Magic","Management","Minigame","Mobs","Optimization","Social","Storage","Technology","Transportation","Utility","World Generation"],
        environments: ["Client","Server"]
    },
    resourcepack: { 
        categories: ["Combat","Cursed","Decoration","Modded","Realistic","Simplistic","Themed","Tweaks","Utility","Vanilla Like"],
        features: ["Audio","Blocks","Core Shaders","Entities","Environment","Equipment","Fonts","GUI","Items","Locale"],
        resolutions: ["8x or lower","16x","32x","48x","64x","128x","256x","512x or higher"]
    },                      
    datapack: {
        categories: ["Adventure","Cursed","Decoration","Economy","Equipment","Food","Game Mechanics","Library","Magic","Management","Minigame","Mobs","Optimization","Social","Storage","Technology","Transportation","Utility","World Generation"]
    },
    shader: { 
        categories: ["Cartoon","Cursed","Fantasy","Realistic","Semi Realistic","Vanilla Like"],
        features: ["Atmosphere","Bloom","Colored Lighting","Foliage","Path Tracing","PBR","Reflections","Shadows"],
        performance: ["Potato","Low","Medium","High","Screenshot"],
        loaders: ["Iris","OptiFine","Vanilla Shader","Canvas"]
    },
    modpack: {
        categories: ["Adventure","Challenging","Combat","Kitchen Sink","Lightweight","Magic","Multiplayer","Optimization","Quests","Technology"],
        loaders: ["Fabric","Forge","NeoForge","Quilt"],
        environments: ["Client","Server"]
    },
    plugin: {
        categories: ["Adventure","Cursed","Decoration","Economy","Equipment","Food","Game Mechanics","Library","Magic","Management","Minigame","Mobs","Optimization","Social","Storage","Technology","Transportation","Utility","World Generation"],
        loaders: ["Bukkit","Folia","Paper","Purpur","Spigot","Sponge"],
        platforms: ["BungeeCord","Geyser Extension","Velocity","Waterfall"]
    }
};

// Fonksiyonlar
function toggleGroup(key) {
    const content = document.getElementById(`content-${key}`);
    const arrow = document.getElementById(`arrow-${key}`);
    if (collapsedGroups.has(key)) {
        collapsedGroups.delete(key);
        content.classList.remove('collapsed');
        arrow.style.transform = 'rotate(0deg)';
    } else {
        collapsedGroups.add(key);
        content.classList.add('collapsed');
        arrow.style.transform = 'rotate(-90deg)';
    }
}

function toggleShowMore(key) {
    if (expandedItems.has(key)) expandedItems.delete(key);
    else expandedItems.add(key);
    renderFilters();
}

function renderFilters() {
    const container = document.getElementById('filter-container');
    const config = filterConfig[currentType] || filterConfig.mod;
    let html = `
        <div class="filter-group">
            <div class="filter-title" onclick="toggleGroup('versions')">
                GAME VERSION <span id="arrow-versions" style="transition:0.3s; transform:rotate(${collapsedGroups.has('versions')?'-90':'0'}deg)">▼</span>
            </div>
            <div id="content-versions" class="filter-content ${collapsedGroups.has('versions')?'collapsed':''}" style="max-height: 500px">
                <div class="max-h-48 overflow-y-auto pr-2 space-y-1">
                    ${allVersions.map(v => `
                        <div class="filter-item ${selectedFilters.versions?.includes(v)?'active':''}" onclick="toggleFilter('versions', '${v}', this)">
                            <img src="${icons.versions}" class="filter-icon">
                            <div class="check-box"></div>${v}
                        </div>`).join('')}
                </div>
            </div>
        </div>`;

    Object.keys(config).forEach(key => {
        const items = config[key];
        const isExpanded = expandedItems.has(key);
        const displayItems = isExpanded ? items : items.slice(0, 6);

        html += `
            <div class="filter-group">
                <div class="filter-title" onclick="toggleGroup('${key}')">
                    ${key.toUpperCase()} <span id="arrow-${key}" style="transition:0.3s; transform:rotate(${collapsedGroups.has(key)?'-90':'0'}deg)">▼</span>
                </div>
                <div id="content-${key}" class="filter-content ${collapsedGroups.has(key)?'collapsed':''}" style="max-height: 1000px">
                    <div class="space-y-1">
                        ${displayItems.map(f => `
                            <div class="filter-item ${selectedFilters[key]?.includes(f.toLowerCase())?'active':''}" onclick="toggleFilter('${key}', '${f.toLowerCase()}', this)">
                                <img src="${icons[key] || icons.categories}" class="filter-icon">
                                <div class="check-box"></div>${f}
                            </div>`).join('')}
                        ${items.length > 6 ? `<span class="show-more-btn" onclick="toggleShowMore('${key}')">${isExpanded ? 'Show Fewer' : 'Show More...'}</span>` : ''}
                    </div>
                </div>
            </div>`;
    });
    container.innerHTML = html;
}

async function fetchData() {
    const grid = document.getElementById('mod-grid');
    grid.innerHTML = '<div class="col-span-full py-40 text-center opacity-10 text-4xl font-black animate-pulse uppercase tracking-[10px]">Syncing Core...</div>';
    const search = document.getElementById('global-search').value;
    const sort = document.getElementById('sort-select').value;

    const facets = [["project_type:" + currentType]];
    Object.keys(selectedFilters).forEach(key => {
        if (selectedFilters[key].length > 0) {
            facets.push(selectedFilters[key].map(val => (key === 'versions' ? 'versions:' : 'categories:') + val));
        }
    });

    const url = `https://api.modrinth.com/v2/search?query=${search}&facets=${encodeURIComponent(JSON.stringify(facets))}&index=${sort}&limit=12&offset=${currentOffset}`;

    try {
        const data = await fetch(url).then(r => r.json());
        document.getElementById('total-results').innerText = data.total_hits.toLocaleString();
        grid.innerHTML = data.hits.map(m => `
            <div class="mod-card ${['mod','plugin','datapack'].includes(currentType) ? 'no-banner' : ''}" onclick="openDetail('${m.project_id}')">
                <div class="banner-area">
                    ${!['mod','plugin','datapack'].includes(currentType) ? `<img src="${m.gallery?.[0] || 'https://via.placeholder.com/400x200?text=Zephyr'}" class="banner-img">` : ''}
                    <img src="${m.icon_url}" class="card-logo" onerror="this.src='https://via.placeholder.com/50'">
                </div>
                <div class="p-6 flex-1 flex flex-col ${['mod','plugin','datapack'].includes(currentType) ? 'pt-12' : 'pt-10'}">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg font-extrabold tracking-tight line-clamp-1">${m.title}</h3>
                        <span class="text-[10px] font-black opacity-40">👁 ${Math.floor(m.downloads * 1.7).toLocaleString()}</span>
                    </div>
                    <p class="text-slate-400 text-xs font-semibold leading-relaxed mb-6 line-clamp-2 h-8">${m.description}</p>
                    <div class="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                        <div class="flex flex-col">
                            <span class="text-[8px] font-black opacity-20 uppercase">Downloads</span>
                            <span class="text-[11px] font-black italic">⬇ ${m.downloads.toLocaleString()}</span>
                        </div>
                        <span class="bg-blue-50 text-blue-600 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase">${m.latest_version || 'v1.0'}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch(e) { grid.innerHTML = 'Error syncing assets.'; }
}

async function openDetail(id) {
    const panel = document.getElementById('detail-panel');
    const content = document.getElementById('detail-content-wrapper');

    panel.classList.add('active');
    content.classList.remove('cloud-anim');
    void content.offsetWidth; 
    content.classList.add('cloud-anim');

    document.body.style.overflow = 'hidden';
    const [p, v] = await Promise.all([
        fetch(`https://api.modrinth.com/v2/project/${id}`).then(r => r.json()),
        fetch(`https://api.modrinth.com/v2/project/${id}/version`).then(r => r.json())
    ]);
    activeProject = { p, v };
    setDetailTab('desc');
}

function setDetailTab(tab) {
    const body = document.getElementById('detail-body');
    document.querySelectorAll('#detail-panel .nav-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    const { p, v } = activeProject;

    if(tab === 'desc') {
        // Tüm benzersiz versiyonları ve loaderları ayıkla
        const versions = [...new Set(v.flatMap(ver => ver.game_versions))].sort().reverse();
        const loaders = [...new Set(v.flatMap(ver => ver.loaders))].sort();

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
                    <div class="prose prose-slate max-w-none text-slate-500 leading-loose">${p.body || p.description}</div>
                </div>
                <div class="w-80 space-y-8">
                    <div class="bg-slate-50 p-8 rounded-[40px] space-y-6">
                        <h4 class="text-[10px] font-black opacity-30 tracking-widest uppercase">Deployment</h4>
                        
                        <div class="space-y-4">
                            <div>
                                <label class="text-[9px] font-bold opacity-40 ml-2">VERSION</label>
                                <select id="download-version" class="w-full mt-1 p-4 rounded-2xl bg-white border-none font-bold text-sm shadow-sm outline-none">
                                    ${versions.map(ver => `<option value="${ver}">${ver}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="text-[9px] font-bold opacity-40 ml-2">LOADER</label>
                                <select id="download-loader" class="w-full mt-1 p-4 rounded-2xl bg-white border-none font-bold text-sm shadow-sm outline-none">
                                    ${loaders.map(load => `<option value="${load}">${load}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <button onclick="downloadActiveAsset()" class="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-black transition shadow-xl shadow-blue-100 active:scale-95">
                            DOWNLOAD ASSETS
                        </button>
                    </div>
                </div>
            </div>`;
    } 
    // ... diğer tablar (gal, chan, vers) aynı kalabilir
    else if(tab === 'gal') {
        body.innerHTML = `<div class="grid grid-cols-2 gap-8">${p.gallery.map(i => `<img src="${i.url}" class="rounded-[32px] shadow-lg">`).join('')}</div>`;
    } else if(tab === 'chan') {
        body.innerHTML = `<div class="space-y-6">${v.slice(0,5).map(ver => `<div class="p-6 bg-slate-50 rounded-2xl"><h3 class="font-black mb-2">${ver.version_number}</h3><div class="text-sm opacity-60">${ver.changelog || 'No changelog provided.'}</div></div>`).join('')}</div>`;
    } else if(tab === 'vers') {
        body.innerHTML = `<div class="space-y-3">${v.map(ver => `<div class="p-6 border border-slate-100 rounded-2xl flex justify-between items-center"><div><p class="font-black">${ver.version_number}</p><p class="text-[10px] opacity-30 font-bold uppercase">${ver.game_versions.join(' • ')}</p></div><a href="${ver.files[0].url}" class="w-12 h-12 bg-slate-50 flex items-center justify-center rounded-xl">⬇</a></div>`).join('')}</div>`;
    }
}

// İndirme işlemini gerçekleştiren ana fonksiyon
function downloadActiveAsset() {
    const selectedVer = document.getElementById('download-version').value;
    const selectedLoader = document.getElementById('download-loader').value;
    
    // Filtreye uyan en güncel sürümü bul
    const match = activeProject.v.find(ver => 
        ver.game_versions.includes(selectedVer) && 
        ver.loaders.includes(selectedLoader.toLowerCase())
    );

    if (match && match.files && match.files.length > 0) {
        const fileUrl = match.files[0].url;
        window.open(fileUrl, '_blank'); // İndirmeyi başlat
    } else {
        alert("Aga, bu versiyon ve loader kombinasyonu için uygun dosya bulunamadı! ⚠️");
    }
}

function closePanel() { document.getElementById('detail-panel').classList.remove('active'); document.body.style.overflow = 'auto'; }
function navPage(d) { currentOffset = Math.max(0, currentOffset + (d * 12)); document.getElementById('page-display').innerText = `Page ${(currentOffset/12)+1}`; fetchData(); }

// Event Listeners
document.querySelectorAll('#type-nav button').forEach(b => {
    b.onclick = () => {
        document.querySelector('#type-nav button.active').classList.remove('active');
        b.classList.add('active'); currentType = b.dataset.type;
        selectedFilters = {}; expandedItems = new Set(); renderFilters(); fetchData();
    }
});

document.getElementById('global-search').oninput = () => { clearTimeout(window.sT); window.sT = setTimeout(fetchData, 500); };
window.onload = () => { renderFilters(); fetchData(); };
