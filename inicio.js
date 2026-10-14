document.addEventListener("DOMContentLoaded", () => {
    const linksParaOsJogos = document.querySelectorAll(".botao");

    linksParaOsJogos.forEach((linkDoJogo) => {
        linkDoJogo.addEventListener("click", (eventoClique) => {
            const enderecoDestino = linkDoJogo.getAttribute("href");

            if (!enderecoDestino || enderecoDestino === "#") {
                eventoClique.preventDefault();
            }
        });
    });
});