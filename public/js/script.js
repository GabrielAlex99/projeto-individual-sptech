/*
  Arquivo: public/js/script.js
  Responsabilidade: utilitários globais reutilizados em várias páginas.
  Este arquivo NÃO contém regra de negócio específica (auth/diário/dashboard ficam em arquivos próprios).
  Organização:
  1) exibição de erro padrão;
  2) ação global de logout;
  3) efeito visual de revelação.
*/

// Exibe uma mensagem de erro visual no card padrão da página.
function exibirErro(mensagem) {
  const cardErro = document.getElementById("cardErro");
  const mensagemErro = document.getElementById("mensagem_erro");

  if (!cardErro || !mensagemErro) {
    return;
  }

  cardErro.style.display = "block";
  mensagemErro.textContent = mensagem;
  setTimeout(sumirMensagem, 5000);
}

// Oculta o card de erro padrão da página.
function sumirMensagem() {
  const cardErro = document.getElementById("cardErro");
  if (cardErro) {
    cardErro.style.display = "none";
  }
}

// Requisição assíncrona para encerrar sessão e limpar dados locais do navegador.
function encerrarSessaoUsuario() {
  fetch("/usuarios/sair", {
    method: "POST",
    credentials: "same-origin",
  })
    .catch(function (erro) {
      console.log("Erro ao encerrar sessão:", erro);
    })
    .finally(function () {
      sessionStorage.removeItem("EMAIL_USUARIO");
      sessionStorage.removeItem("NOME_USUARIO");
      window.location = "./login.html";
    });
}

// Liga o clique dos links "Sair" para chamar logout no backend.
function inicializarAcaoSair() {
  const linksSair = document.querySelectorAll(".acao-sair");

  linksSair.forEach(function (linkSair) {
    linkSair.addEventListener("click", function (evento) {
      evento.preventDefault();
      encerrarSessaoUsuario();
    });
  });
}

// Aplica animação suave de entrada para elementos com classe ".reveal".
function inicializarRevelacaoSuave() {
  const elementosReveal = document.querySelectorAll(".reveal");

  if (!elementosReveal.length) {
    return;
  }

  elementosReveal.forEach(function (elemento) {
    elemento.classList.add("pre-reveal");
  });

  if (!("IntersectionObserver" in window)) {
    elementosReveal.forEach(function (elemento) {
      elemento.classList.add("visivel");
      elemento.classList.remove("pre-reveal");
    });
    return;
  }

  const observador = new IntersectionObserver(
    function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          entrada.target.classList.remove("pre-reveal");
          observador.unobserve(entrada.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -20px 0px",
    }
  );

  elementosReveal.forEach(function (elemento) {
    observador.observe(elemento);
  });
}

// Disponibiliza utilitários para outros arquivos JS da aplicação.
window.exibirErro = exibirErro;
window.sumirMensagem = sumirMensagem;
window.encerrarSessaoUsuario = encerrarSessaoUsuario;

document.addEventListener("DOMContentLoaded", function () {
  inicializarAcaoSair();
  inicializarRevelacaoSuave();
});
