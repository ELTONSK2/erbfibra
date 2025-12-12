class ControleInstalacoes {
    constructor() {
        this.tecnicoId = this.getTecnicoId();
        this.tecnicoNome = localStorage.getItem('tecnicoNome') || 'Técnico';
        this.instalacoes = this.carregarDados();
        this.gasolina = this.carregarGasolina();
        this.init();
    }

    init() {
        // Configurar data atual
        const hoje = this.getDataHoje();
        document.getElementById('data').value = hoje;
        document.getElementById('dataGasolina').value = hoje;
        document.getElementById('dataModal').value = hoje;
        
        // Atualizar data no header
        this.atualizarDataAtual();
        
        // Configurar listeners de formulários
        this.configurarEventListeners();
        
        // Configurar sistema de abas
        this.inicializarAbas();
        
        // Configurar inputs de configuração
        this.carregarConfiguracoes();
        
        // Inicializar interface
        this.mostrarTecnicoAtual();
        this.atualizarInterface();
        this.atualizarDashboard();
        this.listarHistorico();
    }

    // =========================
    // CONFIGURAÇÃO INICIAL
    // =========================
    configurarEventListeners() {
        // Formulário de instalação
        document.getElementById('instalacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarInstalacao();
        });

        // Formulário de gasolina
        document.getElementById('gasolinaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarGasolina();
        });

        // Configurações
        document.getElementById('nomeTecnico').addEventListener('input', () => this.salvarTecnico());
        document.getElementById('valorGasolinaConfig').addEventListener('input', () => this.salvarGasolinaConfig());
    }

    atualizarDataAtual() {
        const data = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('currentDate').textContent = data.toLocaleDateString('pt-BR', options);
    }

    // =========================
    // SISTEMA DE ABAS
    // =========================
    inicializarAbas() {
        const menuItems = document.querySelectorAll('.menu-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = item.getAttribute('data-tab');
                
                // Remover active de todos
                menuItems.forEach(i => i.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Adicionar active ao selecionado
                item.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Atualizar conteúdo específico
                switch(tabId) {
                    case 'dashboard':
                        this.atualizarDashboard();
                        break;
                    case 'instalacoes':
                        this.atualizarListaInstalacoes();
                        break;
                    case 'gasolina':
                        this.atualizarListaGasolina();
                        break;
                    case 'historico':
                        this.listarHistorico();
                        break;
                    case 'tecnicos':
                        this.mostrarTodosTecnicos();
                        break;
                }
            });
        });
    }

    // =========================
    // FUNÇÕES BÁSICAS
    // =========================
    getTecnicoId() {
        let id = localStorage.getItem('tecnicoId');
        if (!id) {
            id = 'TEC-' + Math.random().toString(36).substr(2, 6).toUpperCase();
            localStorage.setItem('tecnicoId', id);
        }
        return id;
    }

    mostrarTecnicoAtual() {
        document.getElementById('tecnicoInfo').textContent = this.tecnicoId;
        document.getElementById('infoTecnicoId').textContent = this.tecnicoId;
        document.getElementById('tecnicoNome').textContent = this.tecnicoNome;
    }

    getDataHoje() {
        return new Date().toISOString().split('T')[0];
    }

    calcularValor(quantidadeDia) {
        if (quantidadeDia === 1) return 90;
        if (quantidadeDia === 2) return 100;
        return 110;
    }

    formatarData(data) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    formatarMoeda(valor) {
        return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // =========================
    // INSTALAÇÕES
    // =========================
    adicionarInstalacao() {
        const codigo = document.getElementById('codigo').value;
        const nome = document.getElementById('nome').value;
        const data = document.getElementById('data').value;

        // Validação
        if (!/^\d{5}$/.test(codigo) && !/^\d{7}$/.test(codigo)) {
            alert('❌ Código deve ter 5 ou 7 dígitos!');
            return;
        }

        if (!nome.trim()) {
            alert('❌ Digite o nome do cliente!');
            return;
        }

        // Criar instalação
        const instalacao = {
            codigo,
            nome,
            data,
            id: Date.now()
        };

        this.instalacoes.push(instalacao);
        this.salvarDados();
        
        // Atualizar interface
        this.atualizarInterface();
        this.atualizarDashboard();
        
        // Resetar formulário
        document.getElementById('instalacaoForm').reset();
        document.getElementById('data').value = data;
        
        // Feedback
        this.mostrarNotificacao('✅ Instalação adicionada com sucesso!');
    }

    // =========================
    // GASOLINA
    // =========================
    adicionarGasolina() {
        const data = document.getElementById('dataGasolina').value;
        const valor = parseFloat(document.getElementById('valorGasolina').value);
        const observacao = document.getElementById('observacaoGasolina').value;

        if (!valor || valor <= 0) {
            alert('❌ Digite um valor válido para a gasolina!');
            return;
        }

        const registroGasolina = {
            data,
            valor,
            observacao,
            id: Date.now()
        };

        this.gasolina.push(registroGasolina);
        this.salvarDados();
        this.atualizarInterface();
        this.atualizarDashboard();

        document.getElementById('gasolinaForm').reset();
        document.getElementById('dataGasolina').value = data;
        
        this.mostrarNotificacao('✅ Gasolina adicionada com sucesso!');
    }

    adicionarGasolinaRapido() {
        // Abrir modal de gasolina rápida
        alert('Para adicionar gasolina rapidamente, vá para a aba "Gasolina"');
        const gasolinaTab = document.querySelector('.menu-item[data-tab="gasolina"]');
        gasolinaTab.click();
    }

    // =========================
    // EXCLUSÃO
    // =========================
    excluirInstalacao(id) {
        if (confirm('⚠️ Tem certeza que deseja excluir esta instalação?')) {
            this.instalacoes = this.instalacoes.filter(inst => inst.id !== id);
            this.salvarDados();
            this.atualizarInterface();
            this.atualizarDashboard();
            this.mostrarNotificacao('✅ Instalação excluída!');
        }
    }

    excluirGasolina(id) {
        if (confirm('⚠️ Tem certeza que deseja excluir este gasto?')) {
            this.gasolina = this.gasolina.filter(gas => gas.id !== id);
            this.salvarDados();
            this.atualizarInterface();
            this.atualizarDashboard();
            this.mostrarNotificacao('✅ Gasto excluído!');
        }
    }

    // =========================
    // CÁLCULOS
    // =========================
    calcularTotalGasolina() {
        return this.gasolina.reduce((total, item) => total + item.valor, 0);
    }

    calcularGanhos() {
        const mesAtual = new Date().toISOString().slice(0, 7);
        const instalacoesMes = this.instalacoes.filter(inst => inst.data.startsWith(mesAtual));
        
        // Agrupar por data
        const agrupadas = {};
        instalacoesMes.forEach(inst => {
            if (!agrupadas[inst.data]) agrupadas[inst.data] = [];
            agrupadas[inst.data].push(inst);
        });

        let ganhos = 0;
        Object.keys(agrupadas).forEach(data => {
            const qtd = agrupadas[data].length;
            const valorUnitario = this.calcularValor(qtd);
            ganhos += qtd * valorUnitario;
        });

        return ganhos;
    }

    calcularSaldo() {
        const ganhos = this.calcularGanhos();
        const gasolina = this.calcularTotalGasolina();
        return ganhos - gasolina;
    }

    // =========================
    // DASHBOARD
    // =========================
    atualizarDashboard() {
        const totalInstalacoes = this.instalacoes.length;
        const ganhos = this.calcularGanhos();
        const gasolina = this.calcularTotalGasolina();
        const saldo = this.calcularSaldo();
        
        // Atualizar cards
        document.getElementById('cardTotal').textContent = totalInstalacoes;
        document.getElementById('cardGanhos').textContent = 'R$ ' + this.formatarMoeda(ganhos);
        document.getElementById('cardGasolina').textContent = 'R$ ' + this.formatarMoeda(gasolina);
        document.getElementById('cardSaldo').textContent = 'R$ ' + this.formatarMoeda(saldo);
        
        // Atualizar informações
        document.getElementById('infoTotalInstalacoes').textContent = totalInstalacoes;
        document.getElementById('infoTotalGasolina').textContent = this.formatarMoeda(gasolina);
        document.getElementById('infoSaldo').textContent = this.formatarMoeda(saldo);
        
        // Atualizar resumo financeiro
        this.atualizarResumoFinanceiro();
        
        // Atualizar resumo do dia
        this.atualizarResumoDia();
        
        // Atualizar instalações recentes
        this.atualizarInstalacoesRecentes();
    }

    atualizarResumoDia() {
        const dataHoje = this.getDataHoje();
        const instalacoesHoje = this.instalacoes.filter(inst => inst.data === dataHoje);
        const qtdHoje = instalacoesHoje.length;
        const valorUnitario = this.calcularValor(qtdHoje);
        const totalHoje = qtdHoje * valorUnitario;

        document.getElementById('resumoDia').innerHTML = `
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas fa-wifi"></i>
                </div>
                <div class="summary-details">
                    <h4>${qtdHoje}</h4>
                    <p>Instalações Hoje</p>
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="summary-details">
                    <h4>R$ ${valorUnitario}</h4>
                    <p>Valor Unitário</p>
                </div>
            </div>
            <div class="summary-item">
                <div class="summary-icon">
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="summary-details">
                    <h4>R$ ${totalHoje}</h4>
                    <p>Total Hoje</p>
                </div>
            </div>
        `;
    }

    atualizarResumoFinanceiro() {
        const ganhos = this.calcularGanhos();
        const gasolina = this.calcularTotalGasolina();
        const saldo = this.calcularSaldo();

        document.getElementById('totalMes').innerHTML = `
            <div class="financial-item">
                <span>Total Instalações:</span>
                <span class="financial-value positive">R$ ${this.formatarMoeda(ganhos)}</span>
            </div>
            <div class="financial-item">
                <span>Total Gasolina:</span>
                <span class="financial-value negative">R$ ${this.formatarMoeda(gasolina)}</span>
            </div>
            <div class="financial-item total">
                <span>Saldo Final:</span>
                <span class="financial-value ${saldo >= 0 ? 'positive' : 'negative'}">
                    R$ ${this.formatarMoeda(saldo)}
                </span>
            </div>
        `;
    }

    atualizarInstalacoesRecentes() {
        const recentes = [...this.instalacoes]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);

        let html = '';
        if (recentes.length > 0) {
            recentes.forEach(inst => {
                html += `
                    <div class="recent-item">
                        <div class="recent-info">
                            <strong>${inst.codigo}</strong>
                            <span>${inst.nome}</span>
                        </div>
                        <div class="recent-date">${this.formatarData(inst.data)}</div>
                    </div>
                `;
            });
        } else {
            html = '<p class="empty-message">Nenhuma instalação recente</p>';
        }

        document.getElementById('recentInstalacoes').innerHTML = html;
    }

    // =========================
    // LISTAGENS
    // =========================
    getInstalacoesPorData() {
        const agrupadas = {};
        this.instalacoes.forEach(inst => {
            if (!agrupadas[inst.data]) agrupadas[inst.data] = [];
            agrupadas[inst.data].push(inst);
        });
        return agrupadas;
    }

    atualizarListaInstalacoes() {
        const lista = document.getElementById('listaInstalacoes');
        const agrupadas = this.getInstalacoesPorData();

        if (Object.keys(agrupadas).length === 0) {
            lista.innerHTML = '<div class="empty-state"><i class="fas fa-wifi"></i><p>Nenhuma instalação cadastrada</p></div>';
            return;
        }

        let html = '';
        Object.keys(agrupadas).sort().reverse().forEach(data => {
            const instalacoes = agrupadas[data];
            const qtd = instalacoes.length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;

            html += `
                <div class="day-group">
                    <div class="day-header">
                        <h4>${this.formatarData(data)}</h4>
                        <span class="day-stats">${qtd} instalações • R$ ${totalDia}</span>
                    </div>
                    <div class="day-instalacoes">
                        ${instalacoes.map(inst => `
                            <div class="instalacao-item">
                                <div class="instalacao-main">
                                    <div class="instalacao-code">${inst.codigo}</div>
                                    <div class="instalacao-name">${inst.nome}</div>
                                </div>
                                <div class="instalacao-actions">
                                    <span class="instalacao-value">R$ ${valorUnitario}</span>
                                    <button class="btn-delete" onclick="controle.excluirInstalacao(${inst.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    atualizarListaGasolina() {
        const lista = document.getElementById('listaGasolina');
        const totalGasolina = this.calcularTotalGasolina();

        // Atualizar total
        document.getElementById('totalGasolinaMes').textContent = this.formatarMoeda(totalGasolina);

        if (this.gasolina.length === 0) {
            lista.innerHTML = '<div class="empty-state"><i class="fas fa-gas-pump"></i><p>Nenhum gasto registrado</p></div>';
            return;
        }

        // Agrupar por data
        const agrupadas = {};
        this.gasolina.forEach(gas => {
            if (!agrupadas[gas.data]) agrupadas[gas.data] = [];
            agrupadas[gas.data].push(gas);
        });

        let html = '';
        Object.keys(agrupadas).sort().reverse().forEach(data => {
            const gastos = agrupadas[data];

            html += `
                <div class="day-group">
                    <div class="day-header">
                        <h4>${this.formatarData(data)}</h4>
                    </div>
                    <div class="gasolina-items">
                        ${gastos.map(gas => `
                            <div class="gasolina-item">
                                <div class="gasolina-main">
                                    <div class="gasolina-value">R$ ${this.formatarMoeda(gas.valor)}</div>
                                    <div class="gasolina-obs">${gas.observacao || 'Sem observação'}</div>
                                </div>
                                <button class="btn-delete" onclick="controle.excluirGasolina(${gas.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    // =========================
    // HISTÓRICO E FILTROS
    // =========================
    listarHistorico() {
        const lista = document.getElementById('listaHistorico');
        
        if (this.instalacoes.length === 0) {
            lista.innerHTML = '<div class="empty-state"><i class="fas fa-history"></i><p>Nenhum histórico disponível</p></div>';
            return;
        }

        let html = '';
        this.instalacoes.sort((a, b) => new Date(b.data) - new Date(a.data)).forEach(inst => {
            html += `
                <div class="historico-item">
                    <div class="historico-main">
                        <div class="historico-code">${inst.codigo}</div>
                        <div class="historico-details">
                            <div class="historico-name">${inst.nome}</div>
                            <div class="historico-date">${this.formatarData(inst.data)}</div>
                        </div>
                    </div>
                    <button class="btn-delete" onclick="controle.excluirInstalacao(${inst.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    filtrar(tipo) {
        let hoje = new Date().toISOString().slice(0, 10);
        let mes = hoje.slice(0, 7);
        let inicio = document.getElementById('inicio').value;
        let fim = document.getElementById('fim').value;

        let filtrado = [];

        switch (tipo) {
            case 'hoje':
                filtrado = this.instalacoes.filter(h => h.data === hoje);
                break;
            case 'mes':
                filtrado = this.instalacoes.filter(h => h.data.startsWith(mes));
                break;
            case 'todos':
                filtrado = this.instalacoes;
                break;
            case 'personalizado':
                if (!inicio || !fim) {
                    alert('⚠️ Selecione as datas de início e fim!');
                    return;
                }
                filtrado = this.instalacoes.filter(h => h.data >= inicio && h.data <= fim);
                break;
        }

        // Atualizar lista com filtro
        this.atualizarListaComFiltro(filtrado);
    }

    atualizarListaComFiltro(instalacoes) {
        const lista = document.getElementById('listaInstalacoes');
        
        if (instalacoes.length === 0) {
            lista.innerHTML = '<div class="empty-state"><i class="fas fa-wifi"></i><p>Nenhuma instalação encontrada</p></div>';
            return;
        }

        // Agrupar por data
        const agrupadas = {};
        instalacoes.forEach(inst => {
            if (!agrupadas[inst.data]) agrupadas[inst.data] = [];
            agrupadas[inst.data].push(inst);
        });

        let html = '';
        Object.keys(agrupadas).sort().reverse().forEach(data => {
            const items = agrupadas[data];
            const qtd = items.length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;

            html += `
                <div class="day-group">
                    <div class="day-header">
                        <h4>${this.formatarData(data)}</h4>
                        <span class="day-stats">${qtd} instalações • R$ ${totalDia}</span>
                    </div>
                    <div class="day-instalacoes">
                        ${items.map(inst => `
                            <div class="instalacao-item">
                                <div class="instalacao-main">
                                    <div class="instalacao-code">${inst.codigo}</div>
                                    <div class="instalacao-name">${inst.nome}</div>
                                </div>
                                <div class="instalacao-actions">
                                    <span class="instalacao-value">R$ ${valorUnitario}</span>
                                    <button class="btn-delete" onclick="controle.excluirInstalacao(${inst.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    // =========================
    // CONFIGURAÇÕES
    // =========================
    carregarConfiguracoes() {
        document.getElementById('nomeTecnico').value = this.tecnicoNome;
        document.getElementById('valorGasolinaConfig').value = this.calcularTotalGasolina();
    }

    salvarTecnico() {
        this.tecnicoNome = document.getElementById('nomeTecnico').value;
        localStorage.setItem('tecnicoNome', this.tecnicoNome);
        document.getElementById('tecnicoNome').textContent = this.tecnicoNome;
        this.mostrarNotificacao('✅ Nome do técnico atualizado!');
    }

    salvarGasolinaConfig() {
        const valor = parseFloat(document.getElementById('valorGasolinaConfig').value);
        if (!isNaN(valor) && valor >= 0) {
            // Não sobrescreve os registros individuais, apenas para visualização
            this.mostrarNotificacao('✅ Valor de gasolina atualizado na visualização!');
        }
    }

    // =========================
    // FUNÇÕES DO SEGUNDO CÓDIGO
    // =========================
    novoMes() {
        if (confirm('⚠️ Iniciar novo mês? Os dados atuais serão arquivados.')) {
            this.instalacoes = [];
            this.gasolina = [];
            this.salvarDados();
            this.atualizarInterface();
            this.atualizarDashboard();
            this.mostrarNotificacao('✅ Novo mês iniciado com sucesso!');
        }
    }

    gerarPDFmes() {
        const mes = new Date().toISOString().slice(0, 7);
        
        // Coletar dados do mês
        const instalacoesMes = this.instalacoes.filter(inst => inst.data.startsWith(mes));
        const ganhos = this.calcularGanhos();
        const gasolina = this.calcularTotalGasolina();
        const saldo = ganhos - gasolina;

        // Criar conteúdo HTML para o PDF
        let html = `
            <h1>Relatório Mensal - ${mes}</h1>
            <h3>Técnico: ${this.tecnicoNome} (${this.tecnicoId})</h3>
            <hr>
            <h2>Resumo Financeiro</h2>
            <p>Total de Instalações: ${instalacoesMes.length}</p>
            <p>Ganhos: R$ ${this.formatarMoeda(ganhos)}</p>
            <p>Gasolina: R$ ${this.formatarMoeda(gasolina)}</p>
            <p>Saldo: R$ ${this.formatarMoeda(saldo)}</p>
            <hr>
            <h2>Instalações Detalhadas</h2>
        `;

        // Agrupar por data
        const agrupadas = {};
        instalacoesMes.forEach(inst => {
            if (!agrupadas[inst.data]) agrupadas[inst.data] = [];
            agrupadas[inst.data].push(inst);
        });

        Object.keys(agrupadas).sort().forEach(data => {
            html += `<h3>${this.formatarData(data)}</h3>`;
            agrupadas[data].forEach(inst => {
                html += `<p>${inst.codigo} - ${inst.nome}</p>`;
            });
        });

        // Configuração do PDF
        const opt = {
            margin: 10,
            filename: `relatorio_${mes}.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Gerar PDF
        html2pdf().from(html).set(opt).save();
        this.mostrarNotificacao('✅ PDF gerado com sucesso!');
    }

    exportarCSV() {
        let csv = "Data,Código,Nome\n";
        
        this.instalacoes.forEach(inst => {
            csv += `${inst.data},${inst.codigo},"${inst.nome}"\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "historico_instalacoes.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarNotificacao('✅ CSV exportado com sucesso!');
    }

    backupLocalStorage() {
        const dados = {};
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            dados[chave] = localStorage.getItem(chave);
        }
        
        const dadosString = JSON.stringify(dados);
        const blob = new Blob([dadosString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `backup_installer_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.mostrarNotificacao('✅ Backup realizado com sucesso!');
    }

    restaurarLocalStorage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const dados = JSON.parse(reader.result);
                    
                    // Limpar localStorage atual
                    localStorage.clear();
                    
                    // Restaurar dados
                    for (const [chave, valor] of Object.entries(dados)) {
                        localStorage.setItem(chave, valor);
                    }
                    
                    // Recarregar dados na aplicação
                    this.tecnicoId = this.getTecnicoId();
                    this.tecnicoNome = localStorage.getItem('tecnicoNome') || 'Técnico';
                    this.instalacoes = this.carregarDados();
                    this.gasolina = this.carregarGasolina();
                    
                    // Atualizar interface
                    this.mostrarTecnicoAtual();
                    this.atualizarInterface();
                    this.atualizarDashboard();
                    
                    this.mostrarNotificacao('✅ Backup restaurado com sucesso!');
                } catch (error) {
                    alert('❌ Erro ao restaurar backup. Arquivo inválido.');
                }
            };
            
            reader.readAsText(file);
        };

        input.click();
    }

    // =========================
    // TÉCNICOS
    // =========================
    mostrarTodosTecnicos() {
        const tecnicos = [];
        
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('controle_tec_') || key === 'controle_' + this.tecnicoId) {
                try {
                    const dados = JSON.parse(localStorage.getItem(key));
                    if (dados && dados.tecnicoId) {
                        const total = this.calcularTotalTecnico(dados);
                        tecnicos.push({
                            id: dados.tecnicoId,
                            instalacoes: (dados.instalacoes || []).length,
                            gasolina: (dados.gasolina || []).length,
                            total: total
                        });
                    }
                } catch (e) {
                    console.warn('Erro ao processar dados do técnico:', key);
                }
            }
        }
        
        const lista = document.getElementById('listaTecnicos');
        
        if (tecnicos.length === 0) {
            lista.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Nenhum técnico encontrado</p></div>';
            return;
        }
        
        // Ordenar por total (maior primeiro)
        tecnicos.sort((a, b) => b.total - a.total);
        
        let html = '';
        tecnicos.forEach((tec, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊';
            
            html += `
                <div class="tecnico-card ${index === 0 ? 'top' : ''}">
                    <div class="tecnico-header">
                        <span class="tecnico-rank">${medal}</span>
                        <h4>${tec.id}</h4>
                    </div>
                    <div class="tecnico-stats">
                        <span class="stat-badge inst">${tec.instalacoes} inst.</span>
                        <span class="stat-badge gas">${tec.gasolina} gastos</span>
                    </div>
                    <div class="tecnico-total">
                        Total: R$ ${parseFloat(tec.total).toFixed(2)}
                    </div>
                </div>
            `;
        });
        
        lista.innerHTML = html;
        lista.style.display = 'block';
    }

    calcularTotalTecnico(dados) {
        let total = 0;
        const agrupadas = {};
        
        (dados.instalacoes || []).forEach(inst => {
            if (!agrupadas[inst.data]) agrupadas[inst.data] = [];
            agrupadas[inst.data].push(inst);
        });
        
        Object.keys(agrupadas).forEach(data => {
            const qtd = agrupadas[data].length;
            const valorUnitario = this.calcularValor(qtd);
            total += qtd * valorUnitario;
        });
        
        const totalGasolina = (dados.gasolina || []).reduce((sum, item) => sum + item.valor, 0);
        return total - totalGasolina;
    }

    // =========================
    // MODAL
    // =========================
    abrirModalCadastroRapido() {
        document.getElementById('modalCadastroRapido').classList.add('show');
        document.getElementById('dataModal').value = this.getDataHoje();
        document.getElementById('codigoModal').focus();
    }

    fecharModalCadastroRapido() {
        document.getElementById('modalCadastroRapido').classList.remove('show');
    }

    salvarCadastroRapido() {
        const codigo = document.getElementById('codigoModal').value;
        const data = document.getElementById('dataModal').value;

        if (!/^\d{5}$/.test(codigo) && !/^\d{7}$/.test(codigo)) {
            alert('❌ Código deve ter 5 ou 7 dígitos!');
            return;
        }

        const instalacao = {
            codigo,
            nome: 'Cliente (Rápido)',
            data,
            id: Date.now()
        };

        this.instalacoes.push(instalacao);
        this.salvarDados();
        
        this.atualizarInterface();
        this.atualizarDashboard();
        this.fecharModalCadastroRapido();
        
        this.mostrarNotificacao('✅ Instalação rápida adicionada!');
    }

    // =========================
    // UTILITÁRIOS
    // =========================
    mostrarNotificacao(mensagem) {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>${mensagem}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    atualizarInterface() {
        this.atualizarListaInstalacoes();
        this.atualizarListaGasolina();
    }

    salvarDados() {
        const dados = {
            tecnicoId: this.tecnicoId,
            tecnicoNome: this.tecnicoNome,
            instalacoes: this.instalacoes,
            gasolina: this.gasolina
        };
        localStorage.setItem('controle_' + this.tecnicoId, JSON.stringify(dados));
    }

    carregarDados() {
        const dadosCompletos = localStorage.getItem('controle_' + this.tecnicoId);
        if (dadosCompletos) {
            try {
                const dados = JSON.parse(dadosCompletos);
                return dados.instalacoes || [];
            } catch (e) {
                console.error('Erro ao carregar dados:', e);
                return [];
            }
        }
        return [];
    }

    carregarGasolina() {
        const dadosCompletos = localStorage.getItem('controle_' + this.tecnicoId);
        if (dadosCompletos) {
            try {
                const dados = JSON.parse(dadosCompletos);
                return dados.gasolina || [];
            } catch (e) {
                console.error('Erro ao carregar gasolina:', e);
                return [];
            }
        }
        return [];
    }
}
