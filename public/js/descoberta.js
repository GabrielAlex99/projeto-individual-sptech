function atualizarStatusDescoberta(mensagem) {
  const status = document.getElementById("status_descoberta");

  if (status) {
    status.innerText = mensagem;
  }
}

function limparAlternativas() {
  const container = document.getElementById("alternativas_container");

  if (container) {
    container.innerHTML = "";
  }
}

function renderizarPerguntaDescoberta(pergunta) {
  const enunciado = document.getElementById("enunciado_pergunta");

  if (enunciado) {
    enunciado.innerText = pergunta.enunciado;
  }
}

function renderizarAlternativasDescoberta(alternativas) {
  const container = document.getElementById("alternativas_container");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  for (let i = 0; i < alternativas.length; i++) {
    const campo = document.createElement("section");
    campo.className = "campo";

    const botao = document.createElement("button");
    botao.className = "botao";
    botao.type = "button";
    botao.innerText = alternativas[i].texto;

    campo.appendChild(botao);
    container.appendChild(campo);
  }
}

// Requisição assíncrona para buscar no back-end a pergunta ativa e as alternativas da descoberta.
function carregarPerguntaAtivaDescoberta() {
  atualizarStatusDescoberta("Carregando pergunta filosófica...");
  limparAlternativas();

  fetch("/descoberta/pergunta-ativa", {
    method: "GET",
  })
    .then(function (resposta) {
      if (resposta.status === 204) {
        return null;
      }

      if (!resposta.ok) {
        throw new Error("Falha ao consultar a API de descoberta.");
      }

      return resposta.json();
    })
    .then(function (dadosPergunta) {
      if (!dadosPergunta) {
        atualizarStatusDescoberta("Nenhuma pergunta ativa disponível no momento.");
        return;
      }

      renderizarPerguntaDescoberta(dadosPergunta);

      if (!dadosPergunta.alternativas || dadosPergunta.alternativas.length === 0) {
        atualizarStatusDescoberta("Pergunta ativa encontrada, mas sem alternativas cadastradas.");
        return;
      }

      renderizarAlternativasDescoberta(dadosPergunta.alternativas);
      atualizarStatusDescoberta("Pergunta carregada com sucesso.");
    })
    .catch(function (erro) {
      console.log("Erro ao buscar pergunta da descoberta:", erro);
      atualizarStatusDescoberta("Falha ao consultar a API de descoberta.");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  carregarPerguntaAtivaDescoberta();
});
