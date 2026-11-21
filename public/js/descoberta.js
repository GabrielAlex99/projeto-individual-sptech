/*
  Arquivo: public/js/descoberta.js
  Responsabilidade: fluxo da tela de descoberta (questionário filosófico).
  Organização:
  1) utilitários de tela (status, progresso, exibição de botões/links);
  2) renderização de pergunta e alternativas;
  3) chamadas de API (buscar pergunta e registrar resposta);
  4) inicialização da interação de continuidade.
*/

// Atualiza mensagem de status principal da descoberta.
function atualizarStatusDescoberta(mensagem) {
  const status = document.getElementById("status_descoberta");

  if (status) {
    status.textContent = mensagem;
  }
}

// Atualiza texto de progresso (ex.: pergunta X de N).
function atualizarProgressoDescoberta(mensagem) {
  const progresso = document.getElementById("progresso_descoberta");

  if (progresso) {
    progresso.textContent = mensagem || "";
  }
}

// Exibe ou oculta o link para a página de resultado.
function exibirLinkResultadoDescoberta(exibir) {
  const linkResultado = document.getElementById("link_resultado");

  if (linkResultado) {
    linkResultado.style.display = exibir ? "inline-block" : "none";
  }
}

// Exibe ou oculta o botão de continuar para próxima pergunta.
function exibirBotaoContinuarDescoberta(exibir) {
  const botaoContinuar = document.getElementById("botao_continuar_descoberta");

  if (botaoContinuar) {
    botaoContinuar.style.display = exibir ? "block" : "none";
  }
}

// Limpa alternativas renderizadas na tela.
function limparAlternativas() {
  const container = document.getElementById("alternativas_container");

  if (container) {
    container.innerHTML = "";
  }
}

// Renderiza o enunciado da pergunta.
function renderizarPerguntaDescoberta(pergunta) {
  const enunciado = document.getElementById("enunciado_pergunta");

  if (enunciado) {
    enunciado.textContent = pergunta.enunciado;
  }
}

// Renderiza botões das alternativas e conecta cada clique ao registro da resposta.
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
    botao.textContent = alternativas[i].texto;
    botao.dataset.idAlternativa = String(alternativas[i].idAlternativa);
    botao.setAttribute("aria-pressed", "false");
    botao.addEventListener("click", function () {
      registrarRespostaDescoberta(alternativas[i].idAlternativa);
    });

    campo.appendChild(botao);
    container.appendChild(campo);
  }
}

// Retorna todos os botões de alternativa renderizados.
function obterBotoesAlternativas() {
  return document.querySelectorAll("#alternativas_container button");
}

// Habilita/desabilita todos os botões de alternativa.
function alterarEstadoBotoesAlternativas(desabilitar) {
  const botoes = obterBotoesAlternativas();

  botoes.forEach(function (botao) {
    botao.disabled = desabilitar;
  });
}

// Remove destaque visual de resposta registrada.
function limparDestaqueAlternativasRegistradas() {
  const botoes = obterBotoesAlternativas();

  botoes.forEach(function (botao) {
    botao.classList.remove("resposta-registrada");
    botao.setAttribute("aria-pressed", "false");
  });
}

// Destaca alternativa já registrada para o usuário.
function destacarAlternativaRegistrada(idAlternativa) {
  const idAlternativaConvertido = Number(idAlternativa);
  const botoes = obterBotoesAlternativas();

  botoes.forEach(function (botao) {
    const idAlternativaBotao = Number(botao.dataset.idAlternativa);
    const alternativaSelecionada = idAlternativaBotao === idAlternativaConvertido;

    if (alternativaSelecionada) {
      botao.classList.add("resposta-registrada");
      botao.setAttribute("aria-pressed", "true");
    } else {
      botao.classList.remove("resposta-registrada");
      botao.setAttribute("aria-pressed", "false");
    }
  });
}

/*
  Requisição assíncrona para carregar a próxima pergunta pendente da sessão autenticada.
  Endpoint: GET /descoberta/proxima-pergunta
  Resultado esperado:
  - pergunta pendente com progresso, ou
  - estado concluído, ou
  - fallback para pergunta pública sem sessão.
*/
function carregarProximaPerguntaPendenteDescoberta() {
  fetch("/descoberta/proxima-pergunta", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        return { tipo: "semSessao" };
      }

      if (resposta.status === 204) {
        return { tipo: "semPerguntaAtiva" };
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar sua próxima pergunta pendente.");
      }

      return resposta.json().then(function (dados) {
        return { tipo: "comSessao", dados: dados };
      });
    })
    .then(function (retorno) {
      if (!retorno) {
        return;
      }

      if (retorno.tipo === "semSessao") {
        carregarPerguntaPublicaDescoberta();
        return;
      }

      if (retorno.tipo === "semPerguntaAtiva") {
        limparAlternativas();
        renderizarPerguntaDescoberta({
          enunciado: "Nenhuma pergunta ativa disponível no momento.",
        });
        atualizarProgressoDescoberta("");
        atualizarStatusDescoberta("Nenhuma pergunta ativa cadastrada para o questionário.");
        exibirBotaoContinuarDescoberta(false);
        exibirLinkResultadoDescoberta(false);
        return;
      }

      const dados = retorno.dados;

      if (dados.concluido) {
        limparAlternativas();
        renderizarPerguntaDescoberta({
          enunciado: "Questionário concluído.",
        });
        atualizarProgressoDescoberta(`Concluído: ${dados.totalRespondidas} de ${dados.totalPerguntasAtivas} perguntas.`);
        atualizarStatusDescoberta("Você já respondeu todas as perguntas ativas. Acesse seu resultado final.");
        exibirBotaoContinuarDescoberta(false);
        exibirLinkResultadoDescoberta(true);
        return;
      }

      const pergunta = dados.pergunta;

      renderizarPerguntaDescoberta(pergunta);
      renderizarAlternativasDescoberta(pergunta.alternativas || []);
      limparDestaqueAlternativasRegistradas();
      atualizarProgressoDescoberta(
        `Pergunta ${dados.posicaoAtual} de ${dados.totalPerguntasAtivas} · Respondidas: ${dados.totalRespondidas}`
      );
      atualizarStatusDescoberta("Escolha uma alternativa para registrar sua resposta.");
      exibirBotaoContinuarDescoberta(false);
      exibirLinkResultadoDescoberta(false);
      alterarEstadoBotoesAlternativas(false);
    })
    .catch(function (erro) {
      console.log("Erro ao carregar próxima pergunta pendente:", erro);
      atualizarStatusDescoberta("Falha ao consultar o questionário da sua conta.");
      atualizarProgressoDescoberta("");
      exibirBotaoContinuarDescoberta(false);
      exibirLinkResultadoDescoberta(false);
    });
}

/*
  Requisição assíncrona pública para apresentar a pergunta inicial para visitantes sem sessão.
  Endpoint: GET /descoberta/pergunta-ativa
*/
function carregarPerguntaPublicaDescoberta() {
  fetch("/descoberta/pergunta-ativa", {
    method: "GET",
  })
    .then(function (resposta) {
      if (resposta.status === 204) {
        return null;
      }

      if (!resposta.ok) {
        throw new Error("Falha ao consultar a pergunta pública da descoberta.");
      }

      return resposta.json();
    })
    .then(function (dadosPergunta) {
      if (!dadosPergunta) {
        limparAlternativas();
        renderizarPerguntaDescoberta({
          enunciado: "Nenhuma pergunta ativa disponível no momento.",
        });
        atualizarStatusDescoberta("No momento não há pergunta pública para exibição.");
        atualizarProgressoDescoberta("");
        exibirBotaoContinuarDescoberta(false);
        exibirLinkResultadoDescoberta(false);
        return;
      }

      renderizarPerguntaDescoberta(dadosPergunta);
      renderizarAlternativasDescoberta(dadosPergunta.alternativas || []);
      limparDestaqueAlternativasRegistradas();
      alterarEstadoBotoesAlternativas(true);
      atualizarProgressoDescoberta("Visualização pública da pergunta inicial.");
      atualizarStatusDescoberta("Entre na sua conta para registrar respostas e avançar no questionário.");
      exibirBotaoContinuarDescoberta(false);
      exibirLinkResultadoDescoberta(false);
    })
    .catch(function (erro) {
      console.log("Erro ao carregar pergunta pública da descoberta:", erro);
      atualizarStatusDescoberta("Falha ao carregar pergunta pública da descoberta.");
      atualizarProgressoDescoberta("");
      exibirBotaoContinuarDescoberta(false);
      exibirLinkResultadoDescoberta(false);
    });
}

/*
  Requisição assíncrona para registrar no backend a resposta do usuário autenticado.
  Endpoint: POST /descoberta/responder
  Observação didática:
  - o front envia apenas idAlternativa;
  - o backend resolve usuário da sessão e pergunta pendente.
*/
function registrarRespostaDescoberta(idAlternativa) {
  if (!Number.isInteger(Number(idAlternativa)) || Number(idAlternativa) <= 0) {
    atualizarStatusDescoberta("Dados da resposta inválidos.");
    return;
  }

  alterarEstadoBotoesAlternativas(true);
  atualizarStatusDescoberta("Registrando resposta...");
  exibirBotaoContinuarDescoberta(false);

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
        destacarAlternativaRegistrada(idAlternativa);
        atualizarStatusDescoberta("Resposta registrada com sucesso. Clique em continuar para carregar a próxima pergunta.");
        exibirBotaoContinuarDescoberta(true);
        return;
      }

      if (retorno.status === 409) {
        atualizarStatusDescoberta("Sua resposta já estava registrada. Atualizando o estado atual do questionário...");
        exibirBotaoContinuarDescoberta(false);
        carregarProximaPerguntaPendenteDescoberta();
        return;
      }

      if (retorno.status === 401) {
        atualizarStatusDescoberta("Sua sessão expirou. Entre novamente para responder.");
        exibirBotaoContinuarDescoberta(false);
        return;
      }

      if (retorno.status === 400) {
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
      exibirBotaoContinuarDescoberta(false);
    });
}

// Fluxo do botão "Continuar" para carregar a próxima pergunta pendente.
function inicializarBotaoContinuarDescoberta() {
  const botaoContinuar = document.getElementById("botao_continuar_descoberta");

  if (!botaoContinuar) {
    return;
  }

  botaoContinuar.addEventListener("click", function () {
    atualizarStatusDescoberta("Carregando próxima pergunta pendente...");
    limparAlternativas();
    exibirBotaoContinuarDescoberta(false);
    carregarProximaPerguntaPendenteDescoberta();
  });
}

// Ponto de entrada da tela de descoberta.
document.addEventListener("DOMContentLoaded", function () {
  inicializarBotaoContinuarDescoberta();
  atualizarStatusDescoberta("Carregando pergunta filosófica...");
  carregarProximaPerguntaPendenteDescoberta();
});
