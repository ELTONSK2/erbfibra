class ControleInstalacoes {
    constructor() {
        this.tecnicoId = this.getTecnicoId();
        this.nomeTecnico = this.getNomeTecnico();
        this.instalacoes = this.carregarDados();
        this.gasolina = this.carregarGasolina();
        this.mesAtual = this.getMesAtual();
        this.filtroPeriodo = 'mes'; // 'hoje', 'mes', 'tudo', 'personalizado'
        this.init();
    }

    init() {
        // Configurar formulários
        document.getElementById('instalacaoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarInstalacao();
            closeModal('instalacao');
        });

        document.getElementById('gasolinaForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.adicionarGasolina();
            closeModal('gasolina');
        });

        // Configurar nome do técnico
        document.getElementById('nomeTecnico').value = this.nomeTecnico;
        document.getElementById('nomeTecnico').addEventListener('change', (e) => {
            this.salvarNomeTecnico(e.target.value);
        });

        // Configurar data atual
        const hoje = this.getDataHoje();
        document.getElementById('data').value = hoje;
        document.getElementById('dataGasolina').value = hoje;
        
        // Atualizar interface
        this.atualizarInterface();
        this.atualizarMesAtualDisplay();
        
        // Configurar navegação
        this.configurarNavegacao();
        
        // Verificar se é novo mês
        this.verificarNovoMes();
    }

    configurarNavegacao() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const target = item.getAttribute('href').substring(1);
                this.mudarSecao(target);
            });
        });
    }

    mudarSecao(secaoId) {
        // Remover classe active de todos
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
        });
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Adicionar classe active ao item clicado
        document.querySelector(`[href="#${secaoId}"]`).classList.add('active');
        document.getElementById(secaoId).classList.add('active');
        
        // Atualizar conteúdo específico da seção
        if (secaoId === 'instalacoes') {
            this.atualizarListaInstalacoesCompleta();
        } else if (secaoId === 'financeiro') {
            this.atualizarFinanceiro();
        }
    }

    // 🔧 FUNÇÕES DE CONFIGURAÇÃO
    getTecnicoId() {
        let id = localStorage.getItem('tecnicoId');
        if (!id) {
            id = 'TEC-' + Math.floor(1000 + Math.random() * 9000);
            localStorage.setItem('tecnicoId', id);
        }
        return id;
    }

    getNomeTecnico() {
        return localStorage.getItem('nomeTecnico') || 'Técnico 01';
    }

    salvarNomeTecnico(nome) {
        this.nomeTecnico = nome;
        localStorage.setItem('nomeTecnico', nome);
        this.showNotification('Nome do técnico atualizado!', 'success');
    }

    getMesAtual() {
        const hoje = new Date();
        return `${hoje.getFullYear()}-${(hoje.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    verificarNovoMes() {
        const ultimoMes = localStorage.getItem('ultimoMes');
        const mesAtual = this.getMesAtual();
        
        if (ultimoMes && ultimoMes !== mesAtual) {
            this.showNotification(`Novo mês detectado! ${this.formatarNomeMes(mesAtual)}`, 'info');
        }
        
        localStorage.setItem('ultimoMes', mesAtual);
    }

    getDataHoje() {
        return new Date().toISOString().split('T')[0];
    }

    // 💰 SISTEMA DE PREÇOS
    calcularValor(quantidadeDia) {
        if (quantidadeDia === 1) return 90;
        if (quantidadeDia === 2) return 100;
        return 110; // 3 ou mais instalações
    }

    getInstalacoesPorData(data) {
        return this.instalacoes.filter(inst => inst.data === data);
    }

    // 📊 FUNÇÕES DE DADOS
    getInstalacoesFiltradas() {
        const hoje = this.getDataHoje();
        const mesAtual = this.mesAtual;
        
        switch(this.filtroPeriodo) {
            case 'hoje':
                return this.instalacoes.filter(inst => inst.data === hoje);
            case 'mes':
                return this.instalacoes.filter(inst => 
                    inst.data.startsWith(mesAtual.substring(0, 7))
                );
            case 'tudo':
                return [...this.instalacoes];
            case 'personalizado':
                const inicio = document.getElementById('dataInicio').value;
                const fim = document.getElementById('dataFim').value;
                return this.instalacoes.filter(inst => 
                    inst.data >= inicio && inst.data <= fim
                );
            default:
                return this.instalacoes;
        }
    }

    getGasolinaFiltrada() {
        const mesAtual = this.mesAtual;
        
        switch(this.filtroPeriodo) {
            case 'hoje':
                const hoje = this.getDataHoje();
                return this.gasolina.filter(gas => gas.data === hoje);
            case 'mes':
                return this.gasolina.filter(gas => 
                    gas.data.startsWith(mesAtual.substring(0, 7))
                );
            case 'tudo':
                return [...this.gasolina];
            case 'personalizado':
                const inicio = document.getElementById('dataInicio').value;
                const fim = document.getElementById('dataFim').value;
                return this.gasolina.filter(gas => 
                    gas.data >= inicio && gas.data <= fim
                );
            default:
                return this.gasolina;
        }
    }

    // 📝 FUNÇÕES DE CADASTRO
    adicionarInstalacao() {
        const codigo = document.getElementById('codigo').value;
        const nome = document.getElementById('nome').value;
        const data = document.getElementById('data').value;

        // ✅ VALIDAÇÃO: 5 OU 7 DÍGITOS
        if (!/^\d{5}$/.test(codigo) && !/^\d{7}$/.test(codigo)) {
            this.showNotification('Código deve ter 5 ou 7 dígitos!', 'error');
            return;
        }

        const instalacao = {
            codigo,
            nome,
            data,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mes: data.substring(0, 7) // YYYY-MM
        };

        this.instalacoes.push(instalacao);
        this.salvarDados();
        this.atualizarInterface();
        this.showNotification('✅ Instalação adicionada com sucesso!', 'success');

        document.getElementById('instalacaoForm').reset();
        document.getElementById('data').value = data;
    }

    adicionarGasolina() {
        const data = document.getElementById('dataGasolina').value;
        const valor = parseFloat(document.getElementById('valorGasolina').value);
        const observacao = document.getElementById('observacaoGasolina').value;

        if (!valor || valor <= 0) {
            this.showNotification('❌ Digite um valor válido para a gasolina!', 'error');
            return;
        }

        const registroGasolina = {
            data,
            valor,
            observacao,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mes: data.substring(0, 7)
        };

        this.gasolina.push(registroGasolina);
        this.salvarDados();
        this.atualizarInterface();
        this.showNotification('✅ Abastecimento registrado com sucesso!', 'success');

        document.getElementById('gasolinaForm').reset();
        document.getElementById('dataGasolina').value = data;
    }

    excluirInstalacao(id) {
        if (confirm('⚠️ Tem certeza que deseja excluir esta instalação?')) {
            this.instalacoes = this.instalacoes.filter(inst => inst.id !== id);
            this.salvarDados();
            this.atualizarInterface();
            this.showNotification('🗑️ Instalação excluída com sucesso!', 'info');
        }
    }

    excluirGasolina(id) {
        if (confirm('⚠️ Tem certeza que deseja excluir este gasto?')) {
            this.gasolina = this.gasolina.filter(gas => gas.id !== id);
            this.salvarDados();
            this.atualizarInterface();
            this.showNotification('🗑️ Gasto excluído com sucesso!', 'info');
        }
    }

    // 📈 CÁLCULOS FINANCEIROS
    calcularTotais() {
        const instalacoesFiltradas = this.getInstalacoesFiltradas();
        const gasolinaFiltrada = this.getGasolinaFiltrada();
        
        // Agrupar instalações por data para calcular valor unitário
        const agrupadas = {};
        let totalMes = 0;
        
        instalacoesFiltradas.forEach(inst => {
            if (!agrupadas[inst.data]) {
                agrupadas[inst.data] = [];
            }
            agrupadas[inst.data].push(inst);
        });

        Object.keys(agrupadas).forEach(data => {
            const qtd = agrupadas[data].length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;
            totalMes += totalDia;
        });

        const totalGasolina = gasolinaFiltrada.reduce((total, item) => total + item.valor, 0);
        const saldoFinal = totalMes - totalGasolina;

        return { 
            totalMes, 
            totalGasolina,
            saldoFinal,
            quantidade: instalacoesFiltradas.length
        };
    }

    getValorUnitarioAtual() {
        const hoje = this.getDataHoje();
        const instalacoesHoje = this.instalacoes.filter(inst => inst.data === hoje).length;
        return this.calcularValor(instalacoesHoje + 1); // +1 para próxima instalação
    }

    // 🎛️ ATUALIZAÇÃO DA INTERFACE
    atualizarInterface() {
        this.atualizarDashboard();
        this.atualizarListaInstalacoesRecentes();
        this.atualizarStatsSidebar();
    }

    atualizarDashboard() {
        const { totalMes, totalGasolina, saldoFinal, quantidade } = this.calcularTotais();
        const valorUnitarioAtual = this.getValorUnitarioAtual();
        
        // Atualizar estatísticas principais
        document.getElementById('totalInstalacoesMes').textContent = quantidade;
        document.getElementById('faturamentoMes').textContent = `R$ ${totalMes}`;
        document.getElementById('totalCombustivel').textContent = `R$ ${totalGasolina.toFixed(2)}`;
        document.getElementById('saldoFinal').textContent = `R$ ${saldoFinal.toFixed(2)}`;
        document.getElementById('valorUnitarioInfo').textContent = `Próxima: R$ ${valorUnitarioAtual}`;
        
        // Atualizar cor do saldo
        const saldoElement = document.getElementById('saldoFinal');
        if (saldoFinal >= 0) {
            saldoElement.style.color = '#10b981';
        } else {
            saldoElement.style.color = '#ef4444';
        }
        
        // Atualizar informações do técnico
        document.getElementById('tecnicoInfo').textContent = `ID: ${this.tecnicoId}`;
    }

    atualizarStatsSidebar() {
        const hoje = this.getDataHoje();
        const instalacoesHoje = this.instalacoes.filter(inst => inst.data === hoje).length;
        const gasolinaMes = this.getGasolinaFiltrada().reduce((total, item) => total + item.valor, 0);
        
        document.getElementById('instalacoesHoje').textContent = instalacoesHoje;
        document.getElementById('gasolinaMes').textContent = `R$ ${gasolinaMes.toFixed(2)}`;
    }

    atualizarListaInstalacoesRecentes() {
        const lista = document.getElementById('listaInstalacoesRecentes');
        const instalacoesFiltradas = this.getInstalacoesFiltradas();
        
        if (instalacoesFiltradas.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma instalação encontrada</p>
                    <button class="btn-primary" onclick="showModal('instalacao')">Adicionar primeira</button>
                </div>
            `;
            return;
        }

        // Pegar apenas as últimas 5 instalações para o dashboard
        const ultimasInstalacoes = [...instalacoesFiltradas]
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        let html = '';
        
        ultimasInstalacoes.forEach(inst => {
            const dataFormatada = this.formatarData(inst.data);
            const instalacoesDia = this.getInstalacoesPorData(inst.data).length;
            const valorUnitario = this.calcularValor(instalacoesDia);
            
            html += `
                <div class="instalacao-item">
                    <div class="instalacao-info">
                        <div class="instalacao-codigo">#${inst.codigo}</div>
                        <div class="instalacao-nome">${inst.nome}</div>
                        <div class="instalacao-data">${dataFormatada}</div>
                    </div>
                    <div class="instalacao-actions">
                        <div class="instalacao-valor">R$ ${valorUnitario}</div>
                        <button class="btn-excluir" onclick="controle.excluirInstalacao(${inst.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    atualizarListaInstalacoesCompleta() {
        const lista = document.getElementById('listaInstalacoesCompleta');
        const instalacoesFiltradas = this.getInstalacoesFiltradas();
        
        if (instalacoesFiltradas.length === 0) {
            lista.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma instalação no período selecionado</p>
                    <button class="btn-primary" onclick="showModal('instalacao')">Adicionar instalação</button>
                </div>
            `;
            return;
        }

        // Agrupar por data
        const agrupadas = {};
        instalacoesFiltradas.forEach(inst => {
            if (!agrupadas[inst.data]) {
                agrupadas[inst.data] = [];
            }
            agrupadas[inst.data].push(inst);
        });

        let html = '';
        
        Object.keys(agrupadas).sort().reverse().forEach(data => {
            const instalacoes = agrupadas[data];
            const qtd = instalacoes.length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;
            const dataFormatada = this.formatarData(data);
            
            html += `
                <div class="dia-group" style="margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <h3 style="color: #4f46e5; margin: 0;">
                            <i class="fas fa-calendar-day"></i> ${dataFormatada}
                        </h3>
                        <div style="display: flex; gap: 15px; align-items: center;">
                            <span style="background: #4f46e5; color: white; padding: 5px 10px; border-radius: 5px;">
                                ${qtd} instalação${qtd > 1 ? 'ões' : ''}
                            </span>
                            <span style="background: #10b981; color: white; padding: 5px 10px; border-radius: 5px; font-weight: bold;">
                                Total: R$ ${totalDia}
                            </span>
                        </div>
                    </div>
                    <div class="instalacoes-dia">
            `;
            
            instalacoes.forEach(inst => {
                html += `
                    <div class="instalacao-item">
                        <div class="instalacao-info">
                            <div class="instalacao-codigo">#${inst.codigo}</div>
                            <div class="instalacao-nome">${inst.nome}</div>
                        </div>
                        <div class="instalacao-actions">
                            <div class="instalacao-valor">R$ ${valorUnitario}</div>
                            <button class="btn-excluir" onclick="controle.excluirInstalacao(${inst.id})" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        });

        lista.innerHTML = html;
    }

    atualizarFinanceiro() {
        const { totalMes, totalGasolina, saldoFinal } = this.calcularTotais();
        const gasolinaFiltrada = this.getGasolinaFiltrada();
        
        // Atualizar resumo financeiro
        document.getElementById('resumoFinanceiro').innerHTML = `
            <div style="display: grid; gap: 15px;">
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span>Total em Instalações:</span>
                    <span style="font-weight: bold; color: #4f46e5;">R$ ${totalMes}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span>Total em Gasolina:</span>
                    <span style="font-weight: bold; color: #f59e0b;">R$ ${totalGasolina.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                    <span>Saldo Final:</span>
                    <span style="font-weight: bold; color: ${saldoFinal >= 0 ? '#10b981' : '#ef4444'};">
                        R$ ${saldoFinal.toFixed(2)}
                    </span>
                </div>
            </div>
        `;
        
        // Atualizar lista de gasolina
        const listaGasolina = document.getElementById('listaGasolinaFinanceiro');
        if (gasolinaFiltrada.length === 0) {
            listaGasolina.innerHTML = '<p style="color: #6b7280; text-align: center;">Nenhum gasto registrado</p>';
        } else {
            let html = '<div style="display: grid; gap: 10px;">';
            gasolinaFiltrada.forEach(gas => {
                html += `
                    <div style="display: flex; justify-content: space-between; padding: 12px; background: #f3f4f6; border-radius: 8px;">
                        <div>
                            <div style="font-weight: 500;">${this.formatarData(gas.data)}</div>
                            <div style="font-size: 12px; color: #6b7280;">${gas.observacao || 'Sem observação'}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <span style="font-weight: bold; color: #f59e0b;">R$ ${gas.valor.toFixed(2)}</span>
                            <button class="btn-excluir" onclick="controle.excluirGasolina(${gas.id})" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            listaGasolina.innerHTML = html;
        }
    }

    // 📅 FILTROS POR PERÍODO
    filtrarPorPeriodo(periodo) {
        this.filtroPeriodo = periodo;
        
        // Atualizar botões ativos
        document.querySelectorAll('.btn-periodo').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Atualizar interface
        this.atualizarInterface();
        this.showNotification(`Filtro: ${this.getNomePeriodo(periodo)}`, 'info');
    }

    filtrarPorDataPersonalizada() {
        const inicio = document.getElementById('dataInicio').value;
        const fim = document.getElementById('dataFim').value;
        
        if (!inicio || !fim) {
            this.showNotification('Selecione ambas as datas!', 'error');
            return;
        }
        
        if (inicio > fim) {
            this.showNotification('Data inicial maior que final!', 'error');
            return;
        }
        
        this.filtroPeriodo = 'personalizado';
        this.atualizarInterface();
        this.showNotification(`Período: ${this.formatarData(inicio)} a ${this.formatarData(fim)}`, 'info');
    }

    getNomePeriodo(periodo) {
        const periodos = {
            'hoje': 'Hoje',
            'mes': 'Este Mês',
            'tudo': 'Todo Histórico',
            'personalizado': 'Período Personalizado'
        };
        return periodos[periodo] || periodo;
    }

    // 🔄 GERENCIAMENTO DE MÊS
    prepararNovoMes() {
        showModal('novoMes');
    }

    confirmarNovoMes() {
        // Não apaga o histórico, apenas marca novo mês
        this.mesAtual = this.getMesAtual();
        localStorage.setItem('ultimoMes', this.mesAtual);
        
        // Atualizar display
        this.atualizarMesAtualDisplay();
        this.atualizarInterface();
        
        closeModal('novoMes');
        this.showNotification(`✅ Novo mês iniciado: ${this.formatarNomeMes(this.mesAtual)}`, 'success');
    }

    limparMesAtual() {
        if (confirm('⚠️ ATENÇÃO: Esta ação irá REMOVER TODAS as instalações e gastos do mês atual. O histórico será mantido. Continuar?')) {
            const mesAtual = this.mesAtual;
            
            // Filtrar apenas dados do mês atual
            this.instalacoes = this.instalacoes.filter(inst => !inst.data.startsWith(mesAtual.substring(0, 7)));
            this.gasolina = this.gasolina.filter(gas => !gas.data.startsWith(mesAtual.substring(0, 7)));
            
            this.salvarDados();
            this.atualizarInterface();
            this.showNotification('🗑️ Dados do mês atual removidos!', 'info');
        }
    }

    atualizarMesAtualDisplay() {
        const hoje = new Date();
        const meses = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        document.getElementById('mesAtual').textContent = 
            `${meses[hoje.getMonth()]} ${hoje.getFullYear()}`;
    }

    // 📄 RELATÓRIOS PDF
    gerarRelatorioCompleto() {
        showModal('relatorio');
    }

    gerarRelatorioPDFPersonalizado() {
        const nomeTecnicoPDF = document.getElementById('nomeTecnicoPDF').value || this.nomeTecnico;
        const periodoSelecionado = document.querySelector('input[name="periodo"]:checked').value;
        
        let dataInicio, dataFim, instalacoesRelatorio, gasolinaRelatorio;
        const hoje = new Date();
        
        if (periodoSelecionado === 'mes') {
            // Mês atual
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
            
            instalacoesRelatorio = this.instalacoes.filter(inst => 
                new Date(inst.data) >= dataInicio && new Date(inst.data) <= dataFim
            );
            gasolinaRelatorio = this.gasolina.filter(gas => 
                new Date(gas.data) >= dataInicio && new Date(gas.data) <= dataFim
            );
        } else {
            // Período personalizado
            dataInicio = new Date(document.getElementById('dataInicioPDF').value);
            dataFim = new Date(document.getElementById('dataFimPDF').value);
            
            instalacoesRelatorio = this.instalacoes.filter(inst => 
                new Date(inst.data) >= dataInicio && new Date(inst.data) <= dataFim
            );
            gasolinaRelatorio = this.gasolina.filter(gas => 
                new Date(gas.data) >= dataInicio && new Date(gas.data) <= dataFim
            );
        }
        
        // Calcular totais do período
        const agrupadas = {};
        let totalInstalacoes = 0;
        
        instalacoesRelatorio.forEach(inst => {
            if (!agrupadas[inst.data]) {
                agrupadas[inst.data] = [];
            }
            agrupadas[inst.data].push(inst);
        });

        Object.keys(agrupadas).forEach(data => {
            const qtd = agrupadas[data].length;
            const valorUnitario = this.calcularValor(qtd);
            const totalDia = qtd * valorUnitario;
            totalInstalacoes += totalDia;
        });

        const totalGasolina = gasolinaRelatorio.reduce((total, item) => total + item.valor, 0);
        const saldoFinal = totalInstalacoes - totalGasolina;
        
        // Preenche o template
        document.getElementById('relatorioTecnico').textContent = nomeTecnicoPDF;
        document.getElementById('relatorioPeriodo').textContent = 
            `${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}`;
        
        // Cria o corpo do relatório
        const corpo = document.getElementById('corpoRelatorio');
        corpo.innerHTML = `
            <div style="margin-bottom: 30px;">
                <h2 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                    Resumo Financeiro
                </h2>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px;">
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; text-align: center;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0;">Total Instalações</p>
                        <h3 style="color: #4f46e5; margin: 10px 0; font-size: 24px;">R$ ${totalInstalacoes},00</h3>
                        <p style="font-size: 14px; color: #10b981;">${instalacoesRelatorio.length} serviços</p>
                    </div>
                    <div style="background: #fffbeb; padding: 20px; border-radius: 10px; text-align: center;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0;">Total Combustível</p>
                        <h3 style="color: #f59e0b; margin: 10px 0; font-size: 24px;">R$ ${totalGasolina.toFixed(2)}</h3>
                        <p style="font-size: 14px; color: #f59e0b;">${gasolinaRelatorio.length} abastecimentos</p>
                    </div>
                    <div style="background: ${saldoFinal >= 0 ? '#d1fae5' : '#fee2e2'}; padding: 20px; border-radius: 10px; text-align: center;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0;">Saldo Final</p>
                        <h3 style="color: ${saldoFinal >= 0 ? '#10b981' : '#ef4444'}; margin: 10px 0; font-size: 24px;">
                            R$ ${saldoFinal.toFixed(2)}
                        </h3>
                        <p style="font-size: 14px; color: ${saldoFinal >= 0 ? '#10b981' : '#ef4444'};">
                            ${saldoFinal >= 0 ? '✅ Lucro' : '⚠️ Prejuízo'}
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        // Adiciona as instalações agrupadas por data
        if (instalacoesRelatorio.length > 0) {
            corpo.innerHTML += `
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                        Detalhamento das Instalações
                    </h2>
            `;
            
            Object.keys(agrupadas).sort().reverse().forEach(data => {
                const instalacoes = agrupadas[data];
                const qtd = instalacoes.length;
                const valorUnitario = this.calcularValor(qtd);
                const totalDia = qtd * valorUnitario;
                
                corpo.innerHTML += `
                    <div style="margin-bottom: 20px; background: #f9fafb; padding: 15px; border-radius: 8px;">
                        <h3 style="color: #374151; margin: 0 0 10px 0; font-size: 16px;">
                            ${this.formatarData(data)} - ${qtd} serviço(s) - R$ ${totalDia},00
                        </h3>
                        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                            <thead>
                                <tr style="background: #e5e7eb;">
                                    <th style="padding: 8px; text-align: left;">Código</th>
                                    <th style="padding: 8px; text-align: left;">Cliente</th>
                                    <th style="padding: 8px; text-align: left;">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${instalacoes.map(inst => `
                                    <tr style="border-bottom: 1px solid #e5e7eb;">
                                        <td style="padding: 8px;">#${inst.codigo}</td>
                                        <td style="padding: 8px;">${inst.nome}</td>
                                        <td style="padding: 8px;">R$ ${valorUnitario},00</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            });
            
            corpo.innerHTML += `</div>`;
        }
        
        // Adiciona os gastos com gasolina se houver
        if (gasolinaRelatorio.length > 0) {
            corpo.innerHTML += `
                <div style="margin-top: 30px;">
                    <h2 style="color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
                        Gastos com Combustível
                    </h2>
                    <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 15px;">
                        <thead>
                            <tr style="background: #e5e7eb;">
                                <th style="padding: 8px; text-align: left;">Data</th>
                                <th style="padding: 8px; text-align: left;">Valor</th>
                                <th style="padding: 8px; text-align: left;">Observação</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gasolinaRelatorio.map(gas => `
                                <tr style="border-bottom: 1px solid #e5e7eb;">
                                    <td style="padding: 8px;">${this.formatarData(gas.data)}</td>
                                    <td style="padding: 8px;">R$ ${gas.valor.toFixed(2)}</td>
                                    <td style="padding: 8px;">${gas.observacao || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
        
        // Configurações do PDF
        const opcoes = {
            margin: 0.5,
            filename: `Relatorio_${nomeTecnicoPDF.replace(/\s+/g, '_')}_${dataInicio.getFullYear()}_${(dataInicio.getMonth()+1).toString().padStart(2, '0')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait',
                compress: true
            }
        };
        
        // Gera e baixa o PDF
        html2pdf().set(opcoes).from(document.getElementById('templateRelatorio')).save();
        
        closeModal('relatorio');
        this.showNotification('📄 Relatório PDF gerado com sucesso!', 'success');
    }

    imprimirResumo() {
        const { totalMes, totalGasolina, saldoFinal, quantidade } = this.calcularTotais();
        
        const conteudoImpressao = `
            <html>
                <head>
                    <title>Resumo - Installer Pro</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #4f46e5; text-align: center; }
                        .resumo { margin: 30px 0; }
                        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #ddd; }
                        .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
                        .data { text-align: center; color: #666; margin-bottom: 30px; }
                    </style>
                </head>
                <body>
                    <h1>📊