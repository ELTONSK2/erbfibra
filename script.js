class InstallationManager {
    constructor() {
        this.currentInstallations = [];
        this.history = JSON.parse(localStorage.getItem('fibraHistory')) || [];
        this.currentMonth = localStorage.getItem('currentMonth') || this.getCurrentMonth();
        this.initialize();
    }

    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    initialize() {
        this.loadCurrentMonthData();
        this.setupEventListeners();
        this.updateDate();
        this.updateSummary();
        this.renderInstallations();
        this.loadHistory();
    }

    loadCurrentMonthData() {
        const saved = localStorage.getItem(`installations_${this.currentMonth}`);
        if (saved) {
            this.currentInstallations = JSON.parse(saved);
        }
    }

    saveCurrentMonthData() {
        localStorage.setItem(`installations_${this.currentMonth}`, 
            JSON.stringify(this.currentInstallations));
    }

    calculateInstallationValue(count) {
        if (count === 1) return 90;
        if (count === 2) return 100;
        return 110;
    }

    calculateTotalValue(count) {
        if (count === 1) return 90;
        if (count === 2) return 200;
        return 110 * count;
    }

    addInstallation(techName, clientId, clientName, hasFuel, fuelValue) {
        const today = new Date().toISOString().split('T')[0];
        const todayInstallations = this.currentInstallations.filter(i => i.date === today);
        
        const installationCount = todayInstallations.length + 1;
        const unitValue = this.calculateInstallationValue(installationCount);
        const totalValue = this.calculateTotalValue(installationCount);
        
        const installation = {
            id: Date.now(),
            date: today,
            techName,
            clientId,
            clientName,
            unitValue,
            totalValue,
            hasFuel: hasFuel || false,
            fuelValue: parseFloat(fuelValue) || 0,
            timestamp: new Date().toISOString()
        };

        // Atualizar valores das instalações do dia
        todayInstallations.forEach((inst, index) => {
            const newCount = index + 1;
            inst.unitValue = this.calculateInstallationValue(newCount);
            inst.totalValue = this.calculateTotalValue(newCount);
        });

        this.currentInstallations.push(installation);
        this.saveCurrentMonthData();
        this.updateSummary();
        this.renderInstallations();
        this.showToast('✅ Instalação registrada com sucesso!', 'success');
    }

    deleteInstallation(id) {
        if (!confirm('Tem certeza que deseja excluir esta instalação?')) return;
        
        this.currentInstallations = this.currentInstallations.filter(i => i.id !== id);
        this.saveCurrentMonthData();
        
        // Recalcular valores do dia
        const today = new Date().toISOString().split('T')[0];
        const todayInstallations = this.currentInstallations.filter(i => i.date === today);
        
        todayInstallations.forEach((inst, index) => {
            const newCount = index + 1;
            inst.unitValue = this.calculateInstallationValue(newCount);
            inst.totalValue = this.calculateTotalValue(newCount);
        });

        this.saveCurrentMonthData();
        this.updateSummary();
        this.renderInstallations();
        this.showToast('🗑️ Instalação removida!', 'warning');
    }

    updateSummary() {
        const today = new Date().toISOString().split('T')[0