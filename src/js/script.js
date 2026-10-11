
"use strict";

const pads = [...document.querySelectorAll(".pad")];

const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const roundEl = document.querySelector("#round");
const messageEl = document.querySelector("#message");
const statusEl = document.querySelector("#game-status");
const titleEl = document.querySelector("#game-title");

const startBtn = document.querySelector("#start-btn");
const restartBtn = document.querySelector("#restart-btn");

const STORAGE_KEY = "algo-lab-sequence-best";
const LIGHT_TIME = 430;
const GAP_TIME = 170;

let sequence = [];
let playerIndex = 0;
let score = 0;
let best = loadBest();
let mode = "idle";
let roundToken = 0;

bestEl.textContent = best;

function loadBest() {
    try {
        const value = Number(localStorage.getItem(STORAGE_KEY));
        return Number.isFinite(value) && value > 0 ? value : 0;
    } catch {
        return 0;
    }
}

function saveBest() {
    try {
        localStorage.setItem(STORAGE_KEY, String(best));
    } catch {
        // O jogo continua funcionando se o armazenamento estiver indisponível.
    }
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateDashboard() {
    scoreEl.textContent = score;
    bestEl.textContent = best;
    roundEl.textContent = sequence.length;
}

function setStatus(text) {
    statusEl.textContent = text;
}

function setMessage(text) {
    messageEl.textContent = text;
}

function setMode(nextMode) {
    mode = nextMode;

    pads.forEach(pad => {
        pad.disabled = mode !== "input";
    });

    startBtn.disabled = mode === "showing" || mode === "input";

    if (mode === "idle") {
        startBtn.textContent = "▶ Iniciar jogo";
    } else if (mode === "gameover") {
        startBtn.textContent = "↻ Tentar novamente";
        startBtn.disabled = false;
    } else {
        startBtn.textContent = "▶ Jogo em andamento";
    }
}

function lightPad(index, duration = LIGHT_TIME) {
    const pad = pads[index];

    if (!pad) return Promise.resolve();

    pad.classList.add("lit");

    return wait(duration).then(() => {
        pad.classList.remove("lit");
    });
}

async function playSequence(token) {
    setMode("showing");
    setStatus("Observe as cores");
    setMessage("Memorize a sequência antes da sua vez.");
    titleEl.textContent = "Observe com atenção";

    await wait(500);

    for (const color of sequence) {
        if (token !== roundToken) return;

        await lightPad(color);

        if (token !== roundToken) return;

        await wait(GAP_TIME);
    }

    if (token !== roundToken) return;

    playerIndex = 0;

    setMode("input");
    setStatus("Sua vez!");
    setMessage(`Repita as ${sequence.length} cores na ordem correta.`);
    titleEl.textContent = "Agora é com você!";
}

function startNextRound() {
    const token = roundToken;

    sequence.push(Math.floor(Math.random() * pads.length));

    updateDashboard();
    playSequence(token);
}

function startGame() {
    if (mode === "showing" || mode === "input") return;

    roundToken++;
    sequence = [];
    playerIndex = 0;
    score = 0;

    updateDashboard();
    startNextRound();
}

function finishGame() {
    setMode("gameover");
    setStatus("Fim de jogo");
    titleEl.textContent = "Boa tentativa!";

    setMessage(
        `Você chegou à sequência ${sequence.length}. ` +
        `Sua pontuação foi ${score}. Tente superar seu recorde!`
    );
}

async function handlePadPress(index) {
    if (mode !== "input") return;

    setMode("showing");

    await lightPad(index, 170);

    const expected = sequence[playerIndex];

    if (index !== expected) {
        finishGame();
        return;
    }

    playerIndex++;

    if (playerIndex < sequence.length) {
        setMode("input");
        setStatus("Correto!");

        setMessage(
            `Muito bem! Faltam ${sequence.length - playerIndex} cores.`
        );

        return;
    }

    score = sequence.length;

    if (score > best) {
        best = score;
        saveBest();
        setMessage("Novo recorde! Preparando a próxima rodada...");
    } else {
        setMessage("Sequência perfeita! Preparando a próxima rodada...");
    }

    updateDashboard();

    setStatus("Rodada concluída");
    titleEl.textContent = "Excelente memória!";

    const token = roundToken;

    await wait(900);

    if (token !== roundToken) return;

    startNextRound();
}

pads.forEach((pad, index) => {
    pad.addEventListener("click", () => {
        handlePadPress(index);
    });
});

startBtn.addEventListener("click", startGame);

restartBtn.addEventListener("click", () => {
    roundToken++;

    sequence = [];
    playerIndex = 0;
    score = 0;

    pads.forEach(pad => pad.classList.remove("lit"));

    updateDashboard();
    setMode("idle");

    setStatus("Aguardando início");
    titleEl.textContent = "Pronto para testar?";
    setMessage("Pressione iniciar para ver a primeira sequência.");
});

document.addEventListener("keydown", event => {
    if (event.repeat) return;

    const keyToIndex = {
        "1": 0,
        "2": 1,
        "3": 2,
        "4": 3
    };

    if (Object.hasOwn(keyToIndex, event.key)) {
        event.preventDefault();
        handlePadPress(keyToIndex[event.key]);
    }
});

updateDashboard();
setMode("idle");