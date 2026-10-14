const botoesCores = [...document.querySelectorAll(".pad")];
const elementoPontuacao = document.querySelector("#pontuacao");
const elementoRecorde = document.querySelector("#recorde");
const elementoRodada = document.querySelector("#rodada");
const elementoMensagem = document.querySelector("#mensagem-jogo");
const elementoEstado = document.querySelector("#estado-jogo");
const elementoTitulo = document.querySelector("#titulo-jogo");
const botaoIniciar = document.querySelector("#iniciar-jogo");
const botaoReiniciar = document.querySelector("#reiniciar-jogo");

const CHAVE_ARMAZENAMENTO = "algo-lab-sequence-best";
const TEMPO_LUZ = 430;
const TEMPO_INTERVALO = 170;

let sequenciaCores = [];
let indiceJogador = 0;
let pontuacaoAtual = 0;
let melhorPontuacao = carregarRecorde();
let modoJogo = "idle";
let identificadorRodada = 0;

elementoRecorde.textContent = melhorPontuacao;

function carregarRecorde() {
    try {
        const valorArmazenado = Number(localStorage.getItem(CHAVE_ARMAZENAMENTO));

        return Number.isFinite(valorArmazenado) && valorArmazenado > 0
            ? valorArmazenado
            : 0;
    } catch {
        return 0;
    }
}

function salvarRecorde() {
    try {
        localStorage.setItem(CHAVE_ARMAZENAMENTO, String(melhorPontuacao));
    } catch {
    }
}

function esperar(milissegundos) {
    return new Promise(resolver => setTimeout(resolver, milissegundos));
}

function atualizarPainel() {
    elementoPontuacao.textContent = pontuacaoAtual;
    elementoRecorde.textContent = melhorPontuacao;
    elementoRodada.textContent = sequenciaCores.length;
}

function definirEstado(textoEstado) {
    elementoEstado.textContent = textoEstado;
}

function definirMensagem(textoMensagem) {
    elementoMensagem.textContent = textoMensagem;
}

function definirModo(proximoModo) {
    modoJogo = proximoModo;

    botoesCores.forEach(botao => {
        botao.disabled = modoJogo !== "input";
    });

    botaoIniciar.disabled = modoJogo === "showing" || modoJogo === "input";

    if (modoJogo === "idle") {
        botaoIniciar.textContent = "▶ Iniciar jogo";
    } else if (modoJogo === "gameover") {
        botaoIniciar.textContent = "↻ Tentar novamente";
        botaoIniciar.disabled = false;
    } else {
        botaoIniciar.textContent = "▶ Jogo em andamento";
    }
}

function iluminarBotao(indiceCor, duracao = TEMPO_LUZ) {
    const botaoCor = botoesCores[indiceCor];

    if (!botaoCor) return Promise.resolve();

    botaoCor.classList.add("lit");

    return esperar(duracao).then(() => {
        botaoCor.classList.remove("lit");
    });
}

async function reproduzirSequencia(identificadorAtual) {
    definirModo("showing");
    definirEstado("Observe as cores");
    definirMensagem("Memorize a sequência antes da sua vez.");
    elementoTitulo.textContent = "Observe com atenção";

    await esperar(500);

    for (const indiceCor of sequenciaCores) {
        if (identificadorAtual !== identificadorRodada) return;

        await iluminarBotao(indiceCor);

        if (identificadorAtual !== identificadorRodada) return;

        await esperar(TEMPO_INTERVALO);
    }

    if (identificadorAtual !== identificadorRodada) return;

    indiceJogador = 0;

    definirModo("input");
    definirEstado("Sua vez!");
    definirMensagem(`Repita as ${sequenciaCores.length} cores na ordem correta.`);
    elementoTitulo.textContent = "Agora é com você!";
}

function iniciarProximaRodada() {
    const identificadorAtual = identificadorRodada;

    sequenciaCores.push(Math.floor(Math.random() * botoesCores.length));

    atualizarPainel();
    reproduzirSequencia(identificadorAtual);
}

function iniciarJogo() {
    if (modoJogo === "showing" || modoJogo === "input") return;

    identificadorRodada++;
    sequenciaCores = [];
    indiceJogador = 0;
    pontuacaoAtual = 0;

    atualizarPainel();
    iniciarProximaRodada();
}

function finalizarJogo() {
    definirModo("gameover");
    definirEstado("Fim de jogo");
    elementoTitulo.textContent = "Boa tentativa!";

    definirMensagem(
        `Você chegou à sequência ${sequenciaCores.length}. ` +
        `Sua pontuação foi ${pontuacaoAtual}. Tente superar seu recorde!`
    );
}

async function verificarCorEscolhida(indiceCorEscolhida) {
    if (modoJogo !== "input") return;

    definirModo("showing");

    const identificadorAtual = identificadorRodada;

    await iluminarBotao(indiceCorEscolhida, 170);

    if (identificadorAtual !== identificadorRodada) return;

    const indiceCorEsperada = sequenciaCores[indiceJogador];

    if (indiceCorEscolhida !== indiceCorEsperada) {
        finalizarJogo();
        return;
    }

    indiceJogador++;

    if (indiceJogador < sequenciaCores.length) {
        definirModo("input");
        definirEstado("Correto!");

        definirMensagem(
            `Muito bem! Faltam ${sequenciaCores.length - indiceJogador} cores.`
        );

        return;
    }

    pontuacaoAtual = sequenciaCores.length;

    if (pontuacaoAtual > melhorPontuacao) {
        melhorPontuacao = pontuacaoAtual;
        salvarRecorde();
        definirMensagem("Novo recorde! Preparando a próxima rodada...");
    } else {
        definirMensagem("Sequência perfeita! Preparando a próxima rodada...");
    }

    atualizarPainel();

    definirEstado("Rodada concluída");
    elementoTitulo.textContent = "Excelente memória!";

    await esperar(900);

    if (identificadorAtual !== identificadorRodada) return;

    iniciarProximaRodada();
}

botoesCores.forEach((botaoCor, indiceCor) => {
    botaoCor.addEventListener("click", () => {
        verificarCorEscolhida(indiceCor);
    });
});

botaoIniciar.addEventListener("click", iniciarJogo);

botaoReiniciar.addEventListener("click", () => {
    identificadorRodada++;

    sequenciaCores = [];
    indiceJogador = 0;
    pontuacaoAtual = 0;

    botoesCores.forEach(botaoCor => botaoCor.classList.remove("lit"));

    atualizarPainel();
    definirModo("idle");

    definirEstado("Aguardando início");
    elementoTitulo.textContent = "Pronto para testar?";
    definirMensagem("Pressione iniciar para ver a primeira sequência.");
});

document.addEventListener("keydown", eventoTeclado => {
    if (eventoTeclado.repeat) return;

    const teclasPorIndice = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3
    };

    if (Object.hasOwn(teclasPorIndice, eventoTeclado.key)) {
        eventoTeclado.preventDefault();
        verificarCorEscolhida(teclasPorIndice[eventoTeclado.key]);
    }
});

atualizarPainel();
definirModo("idle");