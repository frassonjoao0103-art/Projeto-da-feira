"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const linksDosJogos = document.querySelectorAll(".botao");

    linksDosJogos.forEach((link) => {
        link.addEventListener("click", (event) => {
            const destino = link.getAttribute("href");

            if (!destino || destino === "#") {
                event.preventDefault();
            }
        });
    });
});