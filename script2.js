/*ADIVINHE O NÚMERO*/
const MIN = 1;
const MAX = 100;

/*Referências aos elementos do HTML*/
const form        = document.getElementById("guess-form");
const input       = document.getElementById("guess-input");
const guessBtn    = document.getElementById("guess-btn");
const hintEl      = document.getElementById("hint");
const messageEl   = document.getElementById("message");
const attemptsEl  = document.getElementById("attempts");
const highestEl   = document.getElementById("highest");
const lowestEl    = document.getElementById("lowest");
const historyEl   = document.getElementById("history");
const restartBtn  = document.getElementById("restart-btn");
const rangeEl     = document.getElementById("range");
const rangeBarEl  = document.getElementById("range-bar");

/*Estado do jogo*/
let secret;     // número secreto
let low;        // menor valor ainda possível
let high;       // maior valor ainda possível
let attempts;   // quantidade de tentativas
let guesses;    // lista de palpites
let finished;   // true quando o jogador acerta

/*Funções auxiliares*/

// Sorteia um inteiro entre MIN e MAX
function randomNumber() {
  return Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;
}

// Troca o texto da dica mantendo o "Dica:" em um <span>
function setHint(text) {
  hintEl.innerHTML = "";
  const label = document.createElement("span");
  label.textContent = "Dica:";
  hintEl.append(label, " " + text);
}

// Atualiza o intervalo possível e a barra de progresso
function updateRange() {
  rangeEl.textContent = low + " — " + high;
  const size = high - low + 1;
  const total = MAX - MIN + 1;
  rangeBarEl.style.width = (size / total) * 100 + "%";
}

// Atualiza contador, maior e menor palpite
function updateStats() {
  attemptsEl.textContent = attempts;
  if (guesses.length === 0) {
    highestEl.textContent = "—";
    lowestEl.textContent = "—";
  } else {
    highestEl.textContent = Math.max(...guesses);
    lowestEl.textContent = Math.min(...guesses);
  }
}

// Adiciona um palpite ao histórico (status= high, low ou correct)
function addToHistory(value, status) {
  const empty = historyEl.querySelector(".empty-history");
  if (empty) empty.remove();

  const symbols = { high: "↓", low: "↑", correct: "✓" };
  const item = document.createElement("span");
  item.className = "history-item " + status;
  item.textContent = value + " " + symbols[status];
  historyEl.appendChild(item);
}

// Dica de busca binária: sugere o meio dos numeros possiveis
function suggestMiddle() {
  const middle = Math.floor((low + high) / 2);
  if (low === high) {
    setHint("só sobrou o número " + low + "!");
  } else {
    setHint(
      "o número está entre " + low + " e " + high +
      ". Que tal tentar o " + middle + "?"
    );
  }
}

/*Novo jogo*/
function startGame() {
  secret   = randomNumber();
  low      = MIN;
  high     = MAX;
  attempts = 0;
  guesses  = [];
  finished = false;

  historyEl.innerHTML = '<span class="empty-history">Nada por aqui ainda.</span>';
  messageEl.textContent = "Faça seu primeiro palpite.";
  setHint("escolha um número entre " + MIN + " e " + MAX + ".");

  input.value = "";
  input.disabled = false;
  guessBtn.disabled = false;
  input.focus();

  updateStats();
  updateRange();
}

/*Processar o palpite */
function handleGuess(event) {
  event.preventDefault();
  if (finished) return;

  const guess = Number(input.value);

  // validaçao (pra ver se ta entre 1 e 100)
  if (!Number.isInteger(guess) || guess < MIN || guess > MAX) {
    messageEl.textContent = "Digite um número inteiro entre " + MIN + " e " + MAX + ".";
    return;
  }

  // palpite fora do intervalo possível: não conta tentativa
  if (guess < low || guess > high) {
    messageEl.textContent =
      "O " + guess + " já foi descartado. O número está entre " + low + " e " + high + ".";
    input.select();
    return;
  }

  attempts++;
  guesses.push(guess);

  if (guess === secret) {
    // Acertou
    finished = true;
    addToHistory(guess, "correct");
    low = high = secret;
    messageEl.textContent =
      "Acertou! O número era " + secret + ". Você usou " + attempts +
      (attempts === 1 ? " tentativa." : " tentativas.");
    setHint("fim de jogo! Clique em “Novo jogo” para jogar de novo.");
    input.disabled = true;
    guessBtn.disabled = true;
  } else if (guess > secret) {
    // Palpite alto demais
    high = guess - 1;
    addToHistory(guess, "high");
    messageEl.textContent = "Muito alto! O número é menor que " + guess + ".";
    suggestMiddle();
  } else {
    // Palpite baixo demais
    low = guess + 1;
    addToHistory(guess, "low");
    messageEl.textContent = "Muito baixo! O número é maior que " + guess + ".";
    suggestMiddle();
  }

  updateStats();
  updateRange();

  if (!finished) {
    input.value = "";
    input.focus();
  }
}

/*Eventos*/
form.addEventListener("submit", handleGuess);
restartBtn.addEventListener("click", startGame);

/*Começa o primeiro jogo*/
startGame();