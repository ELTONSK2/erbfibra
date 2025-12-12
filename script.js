class ControleInstalacoes {
    constructor() {
        this.tecnicoId = this.getTecnicoId();
        this.instalacoes = this.carregarDados();
        this.gasolina = this.carregarGasolina();
        this.init();
    }

    init() {
        // Inicializar data atual
        const hoje = this.getDataHoje();
        document.getElementById('data').value = hoje;
        document.getElementById('dataGasolina').value = hoje;
        document.getElementById('dataModal').value = hoje;
        
        // Configurar listeners
        document.getElementById('instalacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarInstalação();
        });

        document.getElementById('gasolinaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarGasolina();
        });

        // Sistema de abas
        this.inicializarAbas();
        
        // Configuração automática
        document.getElementById('nomeTecnico').addEventListener('input', () => this.salvarTecnico());
        document.getElementById('valorGasolinaConfig').addEventListener('input', () => this.salvarGasolinaConfig());
        
        // Carregar configurações
        this.carregarConfiguracoes();
        
        // Atualizar interface
        this.atualizarInterface();
        this.mostrarTecnicoAtual();
        this.atualizarDashboard();
        this.listarHistorico();
    }

    // =========================
    // SISTEMA DE ABAS
    // =========================
    inicializarAbas() {
        const tabs = document.querySelectorAll('.tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabId = e.target.getAttribute('data-tab');
                
                // Remover classe active de todas as abas e conteúdos
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Adicionar classe active à aba e conteúdo clicados
                e.target.classList.add('active');
                document.getElementById(tabId).classList.add('active');
                
                // Atualizar conteúdo específico
                if (tabId === 'dashboard') {
                    this.atualizarDashboard();
                } else if (tabId === 'historico') {
                    this.listarHistorico();
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
            id = 'tec_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('tecnicoId', id);
        }
        return id;
    }

    mostrarTecnicoAtual() {
        document.getElementById('tecnicoInfo').textContent = this.tecnicoId;
        document.getElementById('infoTecnicoId').textContent = this.tecnicoId;
    }

    getDataHoje() {
        return new Date().toISOString().split('T')[0];
    }

    calcularValor(quantidadeDia) {
        if (quantidadeDia === 1) return 90;
        if (quantidadeDia === 2) return 100;
        return 110;
    }

    // =========================
    // INSTALAÇÕES
    // =========================
    adicionarInstalação() {
        const codigo = document.getElementById('codigo').value;
        const nome = document.getElementById('nome').value;
        const data = document.getElementById('data').value;

        if (!/^\d{5}$/.test(codigo) && !/^\d{7}$/.test(codigo)) {
            alert('Código deve ter 5 ou 7 dígitos!');
            return;
        }

        if (!nome.trim()) {
            alert('Digite o nome do cliente!');
            return;
        }

        const instalacao = {
            codigo,
            nome,
            data,
            id: Date.now()
        };

        this.instalacoes.push(instalacao);
        this.salvarDados();
        this.atualizarInterface();
        this.atualizarDashboard();

        document.getElementById('instalacaoForm').reset();
        document.getElementById('data').value = data;
    }

    // =========================
    // GASOLINA
    // =========================
    adicionarGasolina() {
        const data = document.getElementById('dataGasolina').value;
        const valor = parseFloat(document.getElementById('valorGasolina').value);
        const observacao = document.getElementById('observacaoGasolina').value;

        if (!valor || valor <= 0) {
            alert('Digite um valor válido para a gasolina!');
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
    }

    // =========================
    // EXCLUSÃO
    // =========================
    excluirInstalacao(id) {
        if (confirm('Tem certeza que deseja excluir esta instalação?')) {
            this.instalacoes = this.instalacoes.filter(inst => inst.id !== id);
            this.salvarDados();
            this.atualizarInterface();
            this.atualizarDashboard();
        }
    }

    excluirGasolina(id) {
        if (confirm('Tem certeza que deseja excluir este gasto?')) {
            this.gasolina = this.gasolina.filter(gas => gas.id !==