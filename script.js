// =========================
// VARIÁVEIS PRINCIPAIS
// =========================
let historico = JSON.parse(localStorage.getItem("historico")) || [];
let tecnico = localStorage.getItem("tecnico") || "";
let gasolina = Number(localStorage.getItem("gasolina") || 0);

// =========================
// FUNÇÕES DE INTERFACE
// =========================
function alternarAba(aba) {
    document.querySelectorAll(".pagina").forEach(p => p.classList.remove("visible"));
    document.getElementById(aba).classList.add("visible");

    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    event.target.classList.add("active");

    atualizarDashboard();
    listar();
}

// =========================
// MODAL
// =========================
function abrirCadastro() {
    document.getElementById("modal").classList.remove("hidden");
}
function fecharCadastro() {
    document.getElementById("modal").classList.add("hidden");
}

// =========================
// SALVAR INSTALAÇÃO
// =========================
function salvarCadastro() {
    let codigo = document.getElementById("codigo").value;
    let data = document.getElementById("data").value;

    if (!codigo || !(codigo.length == 5 || codigo.length == 7)) {
        alert("Código deve ter 5 ou 7 dígitos.");
        return;
    }

    if (!data) {
        alert("Selecione a data!");
        return;
    }

    historico.push({ codigo, data });
    localStorage.setItem("historico", JSON.stringify(historico));

    fecharCadastro();
    listar();
    atualizarDashboard();
}

// =========================
// LISTAR HISTÓRICO
// =========================
function listar(filtro = historico) {
    let div = document.getElementById("lista");
    div.innerHTML = "";

    filtro.forEach((item, i) => {
        div.innerHTML += `
            <div class="item">
                <div class="info">
                    <strong>Código:</strong> ${item.codigo}<br>
                    <strong>Data:</strong> ${item.data}
                </div>
                <button onclick="excluir(${i})">Excluir</button>
            </div>
        `;
    });
}

// =========================
// EXCLUIR
// =========================
function excluir(i) {
    if (!confirm("Excluir instalação?")) return;

    historico.splice(i, 1);
    localStorage.setItem("historico", JSON.stringify(historico));
    listar();
    atualizarDashboard();
}

// =========================
// FILTROS
// =========================
function filtrar(tipo) {
    let hoje = new Date().toISOString().slice(0,10);
    let mes = hoje.slice(0,7);

    let inicio = document.getElementById("inicio").value;
    let fim = document.getElementById("fim").value;

    let filtrado = [];

    if (tipo === "hoje") {
        filtrado = historico.filter(h => h.data === hoje);
    }
    if (tipo === "mes") {
        filtrado = historico.filter(h => h.data.startsWith(mes));
    }
    if (tipo === "todos") {
        filtrado = historico;
    }
    if (tipo === "personalizado") {
        filtrado = historico.filter(h => h.data >= inicio && h.data <= fim);
    }

    listar(filtrado);
}

// =========================
// PREÇOS AUTOMÁTICOS
// =========================
function calcularGanhos() {
    let mes = new Date().toISOString().slice(0,7);

    let totalDia = {};
    historico.forEach(h => {
        if (h.data.startsWith(mes)) {
            if (!totalDia[h.data]) totalDia[h.data] = 0;
            totalDia[h.data]++;
        }
    });

    let ganhos = 0;

    for (let dia in totalDia) {
        let qtd = totalDia[dia];

        if (qtd === 1) ganhos += 90;
        else if (qtd === 2) ganhos += 100 * 2;
        else if (qtd >= 3) ganhos += 110 * qtd;
    }

    return ganhos;
}

// =========================
// DASHBOARD
// =========================
function atualizarDashboard() {
    let ganhos = calcularGanhos();
    let saldo = ganhos - gasolina;

    document.getElementById("cardTotal").innerText = historico.length;
    document.getElementById("cardGanhos").innerText = "R$ " + ganhos.toFixed(2);
    document.getElementById("cardGasolina").innerText = "R$ " + gasolina.toFixed(2);
    document.getElementById("cardSaldo").innerText = "R$ " + saldo.toFixed(2);
}

// =========================
// CONFIGURAÇÕES
// =========================
function salvarTecnico() {
    tecnico = document.getElementById("nomeTecnico").value;
    localStorage.setItem("tecnico", tecnico);
}

function salvarGasolina() {
    gasolina = Number(document.getElementById("valorGasolina").value);
    localStorage.setItem("gasolina", gasolina);
    atualizarDashboard();
}

document.getElementById("nomeTecnico").value = tecnico;
document.getElementById("valorGasolina").value = gasolina;

// =========================
// NOVO MÊS
// =========================
function novoMes() {
    if (!confirm("Iniciar novo mês? Os dados atuais serão arquivados.")) return;

    historico = [];
    gasolina = 0;

    localStorage.setItem("historico", "[]");
    localStorage.setItem("gasolina", 0);

    atualizarDashboard();
    listar();
}

// =========================
// PDF
// =========================
function gerarPDFmes() {
    let mes = new Date().toISOString().slice(0,7);

    let html = `
        <h1>Relatório - ${mes}</h1>
        <h3>Técnico: ${tecnico}</h3>
        <hr>
        <h2>Instalações</h2>
    `;

    historico.forEach(h => {
        if (h.data.startsWith(mes)) {
            html += `<p>${h.data} — Código: ${h.codigo}</p>`;
        }
    });

    html += `
        <h2>Total: R$ ${calcularGanhos().toFixed(2)}</h2>
    `;

    let opt = {
        margin: 10,
        filename: `relatorio_${mes}.pdf`,
        html2canvas: {},
        jsPDF: { unit: 'mm', format: 'a4' }
    };

    html2pdf().from(html).set(opt).save();
}

// =========================
// CSV
// =========================
function exportarCSV() {
    let csv = "data,codigo\n";
    
    historico.forEach(h => {
        csv += `${h.data},${h.codigo}\n`;
    });

    let blob = new Blob([csv], { type: "text/csv" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "historico.csv";
    a.click();

    URL.revokeObjectURL(url);
}

// =========================
// BACKUP / RESTAURAR
// =========================
function backupLocalStorage() {
    let dados = JSON.stringify(localStorage);
    let blob = new Blob([dados], { type: "application/json" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "backup_installerpro.json";
    a.click();
}

function restaurarLocalStorage() {
    let input = document.createElement("input");
    input.type = "file";

    input.onchange = e => {
        let file = e.target.files[0];
        let reader = new FileReader();

        reader.onload = () => {
            let json = JSON.parse(reader.result);

            for (let chave in json) {
                localStorage.setItem(chave, json[chave]);
            }

            historico = JSON.parse(localStorage.getItem("historico")) || [];
            tecnico = localStorage.getItem("tecnico") || "";
            gasolina = Number(localStorage.getItem("gasolina") || 0);

            atualizarDashboard();
            listar();
            alert("Backup restaurado!");
        };

        reader.readAsText(file);
    };

    input.click();
}

// INICIALIZAÇÃO
listar();
atualizarDashboard();
