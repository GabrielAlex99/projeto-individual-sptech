function atualizarStatusResultado(mensagem) {
  const status = document.getElementById("status_resultado");

  if (status) {
    status.textContent = mensagem;
  }
}

function exibirResultado(resultado) {
  const corrente = document.getElementById("corrente_resultado");
  const pergunta = document.getElementById("pergunta_resultado");
  const alternativa = document.getElementById("alternativa_resultado");
  const conteudo = document.getElementById("resultado_conteudo");

  if (!corrente || !pergunta || !alternativa || !conteudo) {
    atualizarStatusResultado("Não foi possível exibir seu resultado.");
    return;
  }

  corrente.textContent = resultado.correnteFilosofica;
  pergunta.textContent = resultado.enunciadoPergunta;
  alternativa.textContent = resultado.textoAlternativa;
  conteudo.style.display = "block";
  atualizarStatusResultado("Resultado baseado na sua resposta à pergunta ativa.");
}

// Requisição assíncrona para carregar o resultado pessoal da sessão atual.
function carregarMeuResultado() {
  fetch("/descoberta/meu-resultado", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        document.getElementById("corrente_resultado").textContent = "Entre na sua conta";
        atualizarStatusResultado("Faça login para consultar seu resultado.");
        return null;
      }

      if (resposta.status === 204) {
        document.getElementById("corrente_resultado").textContent = "Resposta não encontrada";
        atualizarStatusResultado("Responda à pergunta ativa na tela de descoberta para ver seu resultado.");
        return null;
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar seu resultado.");
      }

      return resposta.json();
    })
    .then(function (resultado) {
      if (resultado) {
        exibirResultado(resultado);
      }
    })
    .catch(function (erro) {
      console.log("Erro ao carregar resultado pessoal:", erro);
      document.getElementById("corrente_resultado").textContent = "Resultado indisponível";
      atualizarStatusResultado("Não foi possível consultar seu resultado no momento.");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  carregarMeuResultado();
});
