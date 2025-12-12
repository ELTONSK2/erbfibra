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
        this.showNotification('Instalação registrada com sucesso!', 'success');
    }

    deleteInstallation(id) {
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
        this.showNotification('Instalação removida!', 'warning');
    }

    updateSummary() {
        const today = new Date().toISOString().split('T')[0];
        const todayInstallations = this.currentInstallations.filter(i => i.date === today);
        
        const todayCount = todayInstallations.length;
        const todayTotal = todayInstallations.reduce((sum, i) => sum + i.unitValue, 0);
        const fuelTotal = todayInstallations.reduce((sum, i) => sum + (i.fuelValue || 0), 0);

        document.getElementById('todayCount').textContent = todayCount;
        document.getElementById('todayTotal').textContent = 
            `R$ ${todayTotal.toFixed(2).replace('.', ',')}`;
        document.getElementById('fuelTotal').textContent = 
            `R$ ${fuelTotal.toFixed(2).replace('.', ',')}`;
    }

    renderInstallations() {
        const today = new Date().toISOString().split('T')[0];
        const todayInstallations = this.currentInstallations.filter(i => i.date === today);
        const tbody = document.getElementById('installationsBody');
        
        tbody.innerHTML = '';
        
        todayInstallations.forEach(inst => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${inst.techName}</td>
                <td>${inst.clientId}</td>
                <td>${inst.clientName}</td>
                <td>R$ ${inst.unitValue.toFixed(2).replace('.', ',')}</td>
                <td>${inst.hasFuel ? `R$ ${inst.fuelValue.toFixed(2).replace('.', ',')}` : 'Não'}</td>
                <td>
                    <button class="delete-btn" onclick="manager.deleteInstallation(${inst.id})">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    generatePDFReport() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const monthNames = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        
        const [year, month] = this.currentMonth.split('-');
        const monthName = monthNames[parseInt(month) - 1];
        
        // Título
        doc.setFontSize(20);
        doc.text(`Relatório de Instalações - ${monthName}/${year}`, 20, 20);
        
        // Resumo do Mês
        const monthInstallations = this.currentInstallations;
        const totalInstallations = monthInstallations.length;
        const totalValue = monthInstallations.reduce((sum, i) => sum + i.unitValue, 0);
        const totalFuel = monthInstallations.reduce((sum, i) => sum + (i.fuelValue || 0), 0);
        
        doc.setFontSize(12);
        doc.text(`Total de Instalações: ${totalInstallations}`, 20, 40);
        doc.text(`Valor Total: R$ ${totalValue.toFixed(2).replace('.', ',')}`, 20, 50);
        doc.text(`Total Abastecimento: R$ ${totalFuel.toFixed(2).replace('.', ',')}`, 20, 60);
        
        // Tabela de Instalações
        const tableData = monthInstallations.map(inst => [
            inst.date,
            inst.techName,
            inst.clientId,
            inst.clientName,
            `R$ ${inst.unitValue.toFixed(2)}`,
            inst.hasFuel ? `R$ ${inst.fuelValue.toFixed(2)}` : 'Não'
        ]);
        
        doc.autoTable({
            head: [['Data', 'Técnico', 'Matrícula', 'Cliente', 'Valor', 'Abastecimento']],
            body: tableData,
            startY: 70,
            theme: 'striped',
            headStyles: { fillColor: [37, 99, 235] }
        });
        
        doc.save(`relatorio_fibra_${this.currentMonth}.pdf`);
        this.showNotification('PDF gerado com sucesso!', 'success');
    }

    startNewMonth() {
        if (this.currentInstallations.length > 0) {
            // Salvar no histórico
            const monthReport = {
                month: this.currentMonth,
                installations: [...this.currentInstallations],
                total: this.currentInstallations.reduce((sum, i) => sum + i.unitValue, 0),
                fuelTotal: this.currentInstallations.reduce((sum, i) => sum + (i.fuelValue || 0), 0)
            };
            
            this.history.push(monthReport);
            localStorage.setItem('fibraHistory', JSON.stringify(this.history));
            
            // Limpar instalações do mês atual
            this.currentInstallations = [];
            this.currentMonth = this.getCurrentMonth();
            localStorage.setItem('currentMonth', this.currentMonth);
            this.saveCurrentMonthData();
            
            this.updateSummary();
            this.renderInstallations();
            this.loadHistory();
            
            this.showNotification('Novo mês iniciado! Histórico salvo.', 'success');
        }
    }

    loadHistory() {
        const historyList = document.getElementById('historyList');
        if (!historyList) return;
        
        if (this.history.length === 0) {
            historyList.innerHTML = '<p>Nenhum histórico disponível.</p>';
            return;
        }
        
        historyList.innerHTML = this.history.map(month => `
            <div class="history-month">
                <h3>${month.month}</h3>
                <p>Instalações: ${month.installations.length}</p>
                <p>Valor Total: R$ ${month.total.toFixed(2).replace('.', ',')}</p>
                <p>Abastecimento: R$ ${month.fuelTotal.toFixed(2).replace('.', ',')}</p>
            </div>
        `).join('');
    }

    updateDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = 
            now.toLocaleDateString('pt-BR', options);
    }

    setupEventListeners() {
        const form = document.getElementById('installationForm');
        const fuelCheckbox = document.getElementById('fuelToday');
        const fuelValueInput = document.getElementById('fuelValue');
        
        fuelCheckbox.addEventListener('change', () => {
            fuelValueInput.disabled = !fuelCheckbox.checked;
            if (!fuelCheckbox.checked) fuelValueInput.value = '';
        });
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const techName = document.getElementById('techName').value;
            const clientId = document.getElementById('clientId').value;
            const clientName = document.getElementById('clientName').value;
            const hasFuel = fuelCheckbox.checked;
            const fuelValue = fuelValueInput.value;
            
            if (!/^\d{3,7}$/.test(clientId)) {
                this.showNotification('Matrícula deve ter entre 3 e 7 dígitos!', 'error');
                return;
            }
            
            this.addInstallation(techName, clientId, clientName, hasFuel, fuelValue);
            form.reset();
            fuelValueInput.disabled = true;
        });
        
        document.getElementById('generateReport').addEventListener('click', () => {
            this.generatePDFReport();
        });
        
        document.getElementById('newMonth').addEventListener('click', () => {
            if (confirm('Deseja iniciar um novo mês? O mês atual será salvo no histórico.')) {
                this.startNewMonth();
            }
        });
        
        document.getElementById('viewHistory').addEventListener('click', () => {
            const modal = document.getElementById('historyModal');
            modal.style.display = 'block';
        });
        
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('historyModal').style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('historyModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 10px;
            color: white;
            font-weight: bold;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        if (type === 'success') notification.style.background = '#10b981';
        if (type === 'error') notification.style.background = '#ef4444';
        if (type === 'warning') notification.style.background = '#f59e0b';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Inicializar o gerenciador
let manager;

document.addEventListener('DOMContentLoaded', () => {
    manager = new InstallationManager();
});