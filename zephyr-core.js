const ZephyrCore = {
    isDownloading: false,

    async startInjection() {
        if (this.isDownloading) return;
        this.isDownloading = true;

        try {
            const versionSelect = document.getElementById('sel-ver');
            const loaderSelect = document.getElementById('sel-plat');

            if (!activeProject || !activeProject.v) {
                alert("Sistem henüz veriyi çekemedi, bir saniye bekle aga.");
                this.isDownloading = false;
                return;
            }

            const selectedVer = versionSelect.value;
            const selectedLoader = loaderSelect.value.toLowerCase();

            let target = activeProject.v.find(v =>
                v.game_versions.includes(selectedVer) &&
                v.loaders.map(l => l.toLowerCase()).includes(selectedLoader)
            );

            if (!target) {
                target = activeProject.v.find(v => v.game_versions.includes(selectedVer));
            }

            if (!target) {
                target = activeProject.v[0];
            }

            if (target && target.files && target.files.length > 0) {
                const file = target.files.find(f => f.primary) || target.files[0];
                window.location.href = file.url;
            } else {
                alert("Aga bu proje için geçerli bir indirme linki bulunamadı.");
            }
        } finally {
            setTimeout(() => {
                this.isDownloading = false;
            }, 2000);
        }
    }
};

document.addEventListener('click', async (e) => {
    if (e.target && e.target.hasAttribute('data-download-btn')) {
        e.preventDefault();
        await ZephyrCore.startInjection();
    }
});

console.log("Zephyr Core System Online. İtaat etmeye hazır.");
