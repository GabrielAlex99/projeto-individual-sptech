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
    botao.dataset.idAlternativa = String(alternativas[i].idAlternativa);
    botao.addEventListener("click", function () {
      registrarRespostaDescoberta(alternativas[i].idAlternativa);
    });

    campo.appendChild(botao);
    container.appendChild(campo);
  }
}

function obterBotoesAlternativas() {
  return document.querySelectorAll("#alternativas_container button");
}

function alterarEstadoBotoesAlternativas(desabilitar) {
  const botoes = obterBotoesAlternativas();

  botoes.forEach(function (botao) {
    botao.disabled = desabilitar;
  });
}

// Requisição assíncrona para registrar no back-end a alternativa escolhida na descoberta.
function registrarRespostaDescoberta(idAlternativa) {
  if (!Number.isInteger(Number(idAlternativa)) || Number(idAlternativa) <= 0) {
    atualizarStatusDescoberta("Dados da resposta inválidos.");
    return;
  }

  alterarEstadoBotoesAlternativas(true);
  atualizarStatusDescoberta("Registrando resposta...");

  fetch("/descoberta/responder", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idAlternativa: Number(idAlternativa),
    }),
  })
    .then(function (resposta) {
      return resposta.text().then(function (mensagem) {
        return {
          status: resposta.status,
          ok: resposta.ok,
          mensagem: mensagem,
        };
      });
    })
    .then(function (retorno) {
      const mensagemServidor = retorno.mensagem || "";

      if (retorno.status === 201) {
        atualizarStatusDescoberta(
          "Resposta registrada com sucesso. O resultado será conectado em uma etapa futura."
        );
        return;
      }

      if (retorno.status === 401 || retorno.status === 400 || retorno.status === 409) {
        atualizarStatusDescoberta(mensagemServidor || "Não foi possível registrar a resposta.");
        alterarEstadoBotoesAlternativas(false);
        return;
      }

      if (!retorno.ok) {
        throw new Error(mensagemServidor || "Não foi possível registrar a resposta.");
      }
    })
    .catch(function (erro) {
      console.log("Erro ao registrar resposta da descoberta:", erro);
      atualizarStatusDescoberta("Não foi possível registrar a resposta no momento.");
      alterarEstadoBotoesAlternativas(false);
    });
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
