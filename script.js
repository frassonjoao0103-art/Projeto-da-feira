const botoes = document.querySelectorAll(".pad");
const botaoIniciar = document.getElementById("start-btn");
const botaoReiniciar = document.getElementById("restart-btn");
const pontuacaoElemento = document.getElementById("score");
const recordeElemento = document.getElementById("best");
const rodadaElemento = document.getElementById("round");
const mensagemElemento = document.getElementById("message");
const tituloElemento = document.getElementById("game-title");
const statusElemento = document.getElementById("game-status");

let sequencia = [];
let respostaJogador = [];
let pontuacao = 0;
let rodada = 0;
let recorde = Number(localStorage.getItem("recordeSequencia")) || 0;
let jogoAtivo = false;
let mostrandoSequencia = false;
let rodadaAtual = 0;
let temporizadores = [];

recordeElemento.textContent = recorde;

const cores = ["green", "red", "yellow", "blue"];

function esperar(ms) {
    return new Promise(resolve => {
        const temporizador = setTimeout(resolve, ms);
        temporizadores.push(temporizador);
    });
}

function cancelarTemporizadores() {
    temporizadores.forEach(clearTimeout);
    temporizadores = [];
}

function atualizarPainel() {
    pontuacaoElemento.textContent = pontuacao;
    recordeElemento.textContent = recorde;
    rodadaElemento.textContent = rodada;
}

function atualizarStatus(texto) {
    statusElemento.textContent = texto;
}

function bloquearBotoes(bloquear) {
    botoes.forEach(botao => {
        botao.disabled = bloquear;
    });
}

async function iluminarCor(indice, duracao = 500) {
    const botao = botoes[indice];

    if (!botao) return;

    botao.classList.add("active");
    await esperar(duracao);
    botao.classList.remove("active");
    await esperar(180);
}

async function mostrarSequencia() {
    mostrandoSequencia = true;
    respostaJogador = [];
    bloquearBotoes(true);

    atualizarStatus("Observe a sequência");
    mensagemElemento.textContent = "Memorize as cores e a ordem em que aparecem.";

    await esperar(600);

    for (const indice of sequencia) {
        if (!jogoAtivo) return;
        await iluminarCor(indice);
    }

    if (!jogoAtivo) return;

    mostrandoSequencia = false;
    bloquearBotoes(false);

    atualizarStatus("Sua vez!");
    mensagemElemento.textContent = "Agora repita a sequência clicando nas cores.";
}

function adicionarCor() {
    sequencia.push(Math.floor(Math.random() * cores.length));
}

async function iniciarRodada() {
    if (!jogoAtivo) return;

    rodadaAtual++;
    rodada = rodadaAtual;
    adicionarCor();
    atualizarPainel();

    tituloElemento.textContent = `Rodada ${rodada}`;
    await mostrarSequencia();
}

function iniciarJogo() {
    cancelarTemporizadores();

    sequencia = [];
    respostaJogador = [];
    pontuacao = 0;
    rodada = 0;
    rodadaAtual = 0;
    jogoAtivo = true;
    mostrandoSequencia = false;

    botoes.forEach(botao => botao.classList.remove("active"));
    atualizarPainel();

    tituloElemento.textContent = "Prepare-se!";
    atualizarStatus("Iniciando...");
    mensagemElemento.textContent = "Observe as cores com atenção.";

    botaoIniciar.disabled = true;

    iniciarRodada();
}

async function selecionarCor(indice) {
    if (!jogoAtivo || mostrandoSequencia) return;

    const botao = botoes[indice];

    if (!botao || botao.disabled) return;

    respostaJogador.push(indice);
    await iluminarCor(indice, 180);

    const posicao = respostaJogador.length - 1;

    if (respostaJogador[posicao] !== sequencia[posicao]) {
        finalizarJogo();
        return;
    }

    if (respostaJogador.length === sequencia.length) {
        pontuacao++;
        if (pontuacao > recorde) {
            recorde = pontuacao;
            localStorage.setItem("recordeSequencia", recorde);
        }

        atualizarPainel();
        bloquearBotoes(true);
        mostrandoSequencia = true;

        atualizarStatus("Correto!");
        mensagemElemento.textContent = "Muito bem! Preparando a próxima sequência...";

        await esperar(800);

        if (jogoAtivo) {
            iniciarRodada();
        }
    }
}

function finalizarJogo() {
    jogoAtivo = false;
    mostrandoSequencia = false;

    cancelarTemporizadores();
    botoes.forEach(botao => botao.classList.remove("active"));
    bloquearBotoes(true);

    tituloElemento.textContent = "Fim de jogo!";
    atualizarStatus("Jogo encerrado");

    mensagemElemento.textContent =
        `Você chegou à rodada ${rodada} e fez ${pontuacao} ponto(s). Tente novamente!`;

    botaoIniciar.disabled = false;
    botaoIniciar.textContent = "▶ Jogar novamente";
}

function reiniciarJogo() {
    cancelarTemporizadores();

    jogoAtivo = false;
    mostrandoSequencia = false;
    sequencia = [];
    respostaJogador = [];
    pontuacao = 0;
    rodada = 0;
    rodadaAtual = 0;

    botoes.forEach(botao => botao.classList.remove("active"));

    bloquearBotoes(true);
    atualizarPainel();

    tituloElemento.textContent = "Pronto para testar?";
    atualizarStatus("Aguardando início");
    mensagemElemento.textContent =
        "Pressione iniciar para ver a primeira sequência...";

    botaoIniciar.disabled = false;
    botaoIniciar.textContent = "▶ Iniciar jogo";
}

botoes.forEach((botao, indice) => {
    botao.addEventListener("click", () => {
        selecionarCor(indice);
    });
});

botaoIniciar.addEventListener("click", iniciarJogo);
botaoReiniciar.addEventListener("click", reiniciarJogo);

document.addEventListener("keydown", evento => {
    if (evento.key >= "1" && evento.key <= "4") {
        selecionarCor(Number(evento.key) - 1);
    }
});

atualizarPainel();
bloquearBotoes(true);