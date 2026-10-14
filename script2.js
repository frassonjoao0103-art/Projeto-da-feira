const NUMERO_MINIMO = 1;
const NUMERO_MAXIMO = 100;

const formularioPalpite = document.getElementById("formulario-palpite");
const campoPalpite = document.getElementById("campo-palpite");
const botaoTentar = document.getElementById("botao-tentar");
const elementoDica = document.getElementById("dica-jogo");
const elementoMensagem = document.getElementById("mensagem-jogo");
const elementoTentativas = document.getElementById("total-tentativas");
const elementoMaiorPalpite = document.getElementById("maior-palpite");
const elementoMenorPalpite = document.getElementById("menor-palpite");
const elementoHistorico = document.getElementById("historico-palpites");
const botaoNovoJogo = document.getElementById("botao-novo-jogo");
const elementoIntervalo = document.getElementById("intervalo-possivel");
const elementoBarraIntervalo = document.getElementById("barra-intervalo");

let numeroSecreto;
let menorNumeroPossivel;
let maiorNumeroPossivel;
let quantidadeTentativas;
let listaPalpites;
let jogoFinalizado;

function sortearNumero() {
    return Math.floor(Math.random() * (NUMERO_MAXIMO - NUMERO_MINIMO + 1)) + NUMERO_MINIMO;
}

function atualizarDica(textoDica) {
    elementoDica.innerHTML = "";

    const identificadorDica = document.createElement("span");
    identificadorDica.textContent = "Dica:";

    elementoDica.append(identificadorDica, " " + textoDica);
}

function atualizarIntervalo() {
    elementoIntervalo.textContent = menorNumeroPossivel + " — " + maiorNumeroPossivel;

    const quantidadeNumerosPossiveis = maiorNumeroPossivel - menorNumeroPossivel + 1;
    const quantidadeTotalNumeros = NUMERO_MAXIMO - NUMERO_MINIMO + 1;

    elementoBarraIntervalo.style.width =
        (quantidadeNumerosPossiveis / quantidadeTotalNumeros) * 100 + "%";
}

function atualizarEstatisticas() {
    elementoTentativas.textContent = quantidadeTentativas;

    if (listaPalpites.length === 0) {
        elementoMaiorPalpite.textContent = "—";
        elementoMenorPalpite.textContent = "—";
    } else {
        elementoMaiorPalpite.textContent = Math.max(...listaPalpites);
        elementoMenorPalpite.textContent = Math.min(...listaPalpites);
    }
}

function adicionarPalpiteAoHistorico(numeroPalpite, resultadoPalpite) {
    const mensagemHistoricoVazio = elementoHistorico.querySelector(".empty-history");

    if (mensagemHistoricoVazio) {
        mensagemHistoricoVazio.remove();
    }

    const simbolosResultado = {
        high: "↓",
        low: "↑",
        correct: "✓"
    };

    const itemHistorico = document.createElement("span");

    itemHistorico.className = "history-item " + resultadoPalpite;
    itemHistorico.textContent = numeroPalpite + " " + simbolosResultado[resultadoPalpite];

    elementoHistorico.appendChild(itemHistorico);
}

function sugerirNumeroDoMeio() {
    const numeroCentral = Math.floor(
        (menorNumeroPossivel + maiorNumeroPossivel) / 2
    );

    if (menorNumeroPossivel === maiorNumeroPossivel) {
        atualizarDica("só sobrou o número " + menorNumeroPossivel + "!");
    } else {
        atualizarDica(
            "o número está entre " + menorNumeroPossivel + " e " + maiorNumeroPossivel +
            ". Que tal tentar o " + numeroCentral + "?"
        );
    }
}

function iniciarNovoJogo() {
    numeroSecreto = sortearNumero();
    menorNumeroPossivel = NUMERO_MINIMO;
    maiorNumeroPossivel = NUMERO_MAXIMO;
    quantidadeTentativas = 0;
    listaPalpites = [];
    jogoFinalizado = false;

    elementoHistorico.innerHTML =
        '<span class="empty-history">Nada por aqui ainda.</span>';

    elementoMensagem.textContent = "Faça seu primeiro palpite.";

    atualizarDica(
        "escolha um número entre " + NUMERO_MINIMO + " e " + NUMERO_MAXIMO + "."
    );

    campoPalpite.value = "";
    campoPalpite.disabled = false;
    botaoTentar.disabled = false;
    campoPalpite.focus();

    atualizarEstatisticas();
    atualizarIntervalo();
}

function verificarPalpite(eventoFormulario) {
    eventoFormulario.preventDefault();

    if (jogoFinalizado) return;

    const numeroPalpite = Number(campoPalpite.value);

    if (
        !Number.isInteger(numeroPalpite) ||
        numeroPalpite < NUMERO_MINIMO ||
        numeroPalpite > NUMERO_MAXIMO
    ) {
        elementoMensagem.textContent =
            "Digite um número inteiro entre " +
            NUMERO_MINIMO + " e " + NUMERO_MAXIMO + ".";

        return;
    }

    if (
        numeroPalpite < menorNumeroPossivel ||
        numeroPalpite > maiorNumeroPossivel
    ) {
        elementoMensagem.textContent =
            "O " + numeroPalpite +
            " já foi descartado. O número está entre " +
            menorNumeroPossivel + " e " + maiorNumeroPossivel + ".";

        campoPalpite.select();

        return;
    }

    quantidadeTentativas++;
    listaPalpites.push(numeroPalpite);

    if (numeroPalpite === numeroSecreto) {
        jogoFinalizado = true;

        adicionarPalpiteAoHistorico(numeroPalpite, "correct");

        menorNumeroPossivel = maiorNumeroPossivel = numeroSecreto;

        elementoMensagem.textContent =
            "Acertou! O número era " + numeroSecreto +
            ". Você usou " + quantidadeTentativas +
            (quantidadeTentativas === 1 ? " tentativa." : " tentativas.");

        atualizarDica("fim de jogo! Clique em “Novo jogo” para jogar de novo.");

        campoPalpite.disabled = true;
        botaoTentar.disabled = true;
    } else if (numeroPalpite > numeroSecreto) {
        maiorNumeroPossivel = numeroPalpite - 1;

        adicionarPalpiteAoHistorico(numeroPalpite, "high");

        elementoMensagem.textContent =
            "Muito alto! O número é menor que " + numeroPalpite + ".";

        sugerirNumeroDoMeio();
    } else {
        menorNumeroPossivel = numeroPalpite + 1;

        adicionarPalpiteAoHistorico(numeroPalpite, "low");

        elementoMensagem.textContent =
            "Muito baixo! O número é maior que " + numeroPalpite + ".";

        sugerirNumeroDoMeio();
    }

    atualizarEstatisticas();
    atualizarIntervalo();

    if (!jogoFinalizado) {
        campoPalpite.value = "";
        campoPalpite.focus();
    }
}

formularioPalpite.addEventListener("submit", verificarPalpite);
botaoNovoJogo.addEventListener("click", iniciarNovoJogo);

iniciarNovoJogo();