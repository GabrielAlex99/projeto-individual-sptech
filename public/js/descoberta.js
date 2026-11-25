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

// Atualiza barra visual de progresso com preenchimento proporcional.
function atualizarBarraProgressoDescoberta(atual, total) {
  const barra = document.getElementById("barra_progresso_descoberta");
  const preenchimento = document.getElementById("progresso_descoberta_preenchimento");

  if (!barra || !preenchimento) {
    return;
  }

  const atualNumero = Number(atual);
  const totalNumero = Number(total);

  if (!Number.isFinite(atualNumero) || !Number.isFinite(totalNumero) || totalNumero <= 0) {
    barra.style.display = "none";
    preenchimento.style.width = "0%";
    return;
  }

  const percentual = Math.min(100, Math.max(0, (atualNumero / totalNumero) * 100));
  barra.style.display = "block";
  preenchimento.style.width = `${percentual}%`;
}

// Exibe ou oculta o link para a página de resultado.
function exibirLinkResultadoDescoberta(exibir) {
  const acoesConclusao = document.getElementById("acoes_conclusao_descoberta");

  if (acoesConclusao) {
    acoesConclusao.style.display = exibir ? "flex" : "none";
  }
}

// Exibe ou oculta o botão de continuar para próxima pergunta.
function exibirBotaoContinuarDescoberta(exibir) {
  const botaoContinuar = document.getElementById("botao_continuar_descoberta");

  if (botaoContinuar) {
    botaoContinuar.style.display = exibir ? "block" : "none";
  }
}

// Alterna entre modo ativo e modo concluído da descoberta sem alterar a regra de negócio.
function exibirBlocoConclusaoDescoberta(exibir) {
  const blocoConclusao = document.getElementById("bloco_conclusao_descoberta");
  const enunciadoPergunta = document.getElementById("enunciado_pergunta");
  const alternativas = document.getElementById("alternativas_container");

  if (blocoConclusao) {
    blocoConclusao.style.display = exibir ? "block" : "none";
  }

  if (enunciadoPergunta) {
    enunciadoPergunta.style.display = exibir ? "none" : "block";
  }

  if (alternativas) {
    alternativas.style.display = exibir ? "none" : "block";
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
    const letraAlternativa = String.fromCharCode(65 + i);
    const campo = document.createElement("section");
    campo.className = "campo";

    const botao = document.createElement("button");
    botao.className = "alternativa-descoberta";
    botao.type = "button";
    botao.dataset.idAlternativa = String(alternativas[i].idAlternativa);
    botao.setAttribute("aria-pressed", "false");
    botao.addEventListener("click", function () {
      registrarRespostaDescoberta(alternativas[i].idAlternativa);
    });

    const marcador = document.createElement("span");
    marcador.className = "alternativa-marcador";
    marcador.textContent = letraAlternativa;

    const textoAlternativa = document.createElement("span");
    textoAlternativa.className = "alternativa-texto";
    textoAlternativa.textContent = alternativas[i].texto;

    botao.appendChild(marcador);
    botao.appendChild(textoAlternativa);
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
        exibirBlocoConclusaoDescoberta(false);
        limparAlternativas();
        renderizarPerguntaDescoberta({
          enunciado: "Nenhuma pergunta ativa disponível no momento.",
        });
        atualizarProgressoDescoberta("");
        atualizarBarraProgressoDescoberta(0, 0);
        atualizarStatusDescoberta("Nenhuma pergunta ativa cadastrada para o questionário.");
        exibirBotaoContinuarDescoberta(false);
        exibirLinkResultadoDescoberta(false);
        return;
      }

      const dados = retorno.dados;

      if (dados.concluido) {
        exibirBlocoConclusaoDescoberta(true);
        limparAlternativas();
        atualizarProgressoDescoberta(`Pergunta ${dados.totalPerguntasAtivas} de ${dados.totalPerguntasAtivas}`);
        atualizarBarraProgressoDescoberta(dados.totalPerguntasAtivas, dados.totalPerguntasAtivas);
        atualizarStatusDescoberta("Questionário finalizado com sucesso.");
        exibirBotaoContinuarDescoberta(false);
        exibirLinkResultadoDescoberta(true);
        return;
      }

      exibirBlocoConclusaoDescoberta(false);
      const pergunta = dados.pergunta;

      renderizarPerguntaDescoberta(pergunta);
      renderizarAlternativasDescoberta(pergunta.alternativas || []);
      limparDestaqueAlternativasRegistradas();
      atualizarProgressoDescoberta(`Pergunta ${dados.posicaoAtual} de ${dados.totalPerguntasAtivas}`);
      atualizarBarraProgressoDescoberta(dados.posicaoAtual, dados.totalPerguntasAtivas);
      atualizarStatusDescoberta("Escolha uma alternativa para registrar sua resposta.");
      exibirBotaoContinuarDescoberta(false);
      exibirLinkResultadoDescoberta(false);
      alterarEstadoBotoesAlternativas(false);
    })
    .catch(function (erro) {
      console.log("Erro ao carregar próxima pergunta pendente:", erro);
      exibirBlocoConclusaoDescoberta(false);
      atualizarStatusDescoberta("Falha ao consultar o questionário da sua conta.");
      atualizarProgressoDescoberta("");
      atualizarBarraProgressoDescoberta(0, 0);
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
        exibirBlocoConclusaoDescoberta(false);
        limparAlternativas();
        renderizarPerguntaDescoberta({
          enunciado: "Nenhuma pergunta ativa disponível no momento.",
        });
        atualizarStatusDescoberta("No momento não há pergunta pública para exibição.");
        atualizarProgressoDescoberta("");
        atualizarBarraProgressoDescoberta(0, 0);
        exibirBotaoContinuarDescoberta(false);
        exibirLinkResultadoDescoberta(false);
        return;
      }

      exibirBlocoConclusaoDescoberta(false);
      renderizarPerguntaDescoberta(dadosPergunta);
      renderizarAlternativasDescoberta(dadosPergunta.alternativas || []);
      limparDestaqueAlternativasRegistradas();
      alterarEstadoBotoesAlternativas(true);
      atualizarProgressoDescoberta("Visualização pública da pergunta inicial.");
      atualizarBarraProgressoDescoberta(0, 0);
      atualizarStatusDescoberta("Entre na sua conta para registrar respostas e avançar no questionário.");
      exibirBotaoContinuarDescoberta(false);
      exibirLinkResultadoDescoberta(false);
    })
    .catch(function (erro) {
      console.log("Erro ao carregar pergunta pública da descoberta:", erro);
      exibirBlocoConclusaoDescoberta(false);
      atualizarStatusDescoberta("Falha ao carregar pergunta pública da descoberta.");
      atualizarProgressoDescoberta("");
      atualizarBarraProgressoDescoberta(0, 0);
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
