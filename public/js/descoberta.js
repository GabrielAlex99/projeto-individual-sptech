function atualizarStatusDescoberta(mensagem) {
  const status = document.getElementById("status_descoberta");

  if (status) {
    status.textContent = mensagem;
  }
}

function exibirLinkResultadoDescoberta(exibir) {
  const linkResultado = document.getElementById("link_resultado");

  if (linkResultado) {
    linkResultado.style.display = exibir ? "inline-block" : "none";
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
    enunciado.textContent = pergunta.enunciado;
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
    botao.textContent = alternativas[i].texto;
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

function destacarAlternativaRegistrada(idAlternativa) {
  const botoes = obterBotoesAlternativas();
  let encontrouAlternativa = false;

  botoes.forEach(function (botao) {
    if (Number(botao.dataset.idAlternativa) === Number(idAlternativa)) {
      botao.classList.add("resposta-registrada");
      encontrouAlternativa = true;
    } else {
      botao.classList.remove("resposta-registrada");
    }
  });

  return encontrouAlternativa;
}

function atualizarStatusResultadoDescoberta(mensagem) {
  const status = document.getElementById("resultado_descoberta_status");

  if (status) {
    status.textContent = mensagem;
  }
}

function ocultarResultadoDescoberta() {
  const secaoResultado = document.getElementById("resultado_descoberta");
  const corrente = document.getElementById("corrente_descoberta");
  const pergunta = document.getElementById("pergunta_descoberta");
  const alternativa = document.getElementById("alternativa_descoberta");
  const explicacao = document.getElementById("explicacao_descoberta");

  if (corrente) {
    corrente.textContent = "";
  }

  if (pergunta) {
    pergunta.textContent = "";
  }

  if (alternativa) {
    alternativa.textContent = "";
  }

  if (explicacao) {
    explicacao.textContent = "";
  }

  atualizarStatusResultadoDescoberta("Consultando resultado pessoal...");

  if (secaoResultado) {
    secaoResultado.style.display = "none";
  }
}

function exibirResultadoDescoberta(resultado) {
  const secaoResultado = document.getElementById("resultado_descoberta");
  const corrente = document.getElementById("corrente_descoberta");
  const pergunta = document.getElementById("pergunta_descoberta");
  const alternativa = document.getElementById("alternativa_descoberta");
  const explicacao = document.getElementById("explicacao_descoberta");

  if (!secaoResultado || !corrente || !pergunta || !alternativa || !explicacao) {
    atualizarStatusDescoberta("Não foi possível exibir o resultado pessoal nesta página.");
    return;
  }

  corrente.textContent = resultado.correnteFilosofica;
  pergunta.textContent = resultado.enunciadoPergunta;
  alternativa.textContent = resultado.textoAlternativa;
  explicacao.textContent =
    "Nesta etapa, o resultado corresponde à corrente associada à alternativa escolhida na pergunta ativa atual.";

  atualizarStatusResultadoDescoberta("Resultado pessoal carregado com base na sua resposta registrada.");
  secaoResultado.style.display = "block";
}

// Requisição assíncrona para buscar o resultado pessoal na própria tela de descoberta.
function carregarMeuResultadoDescoberta(origemConsulta) {
  return fetch("/descoberta/meu-resultado", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        return { tipo: "semSessao" };
      }

      if (resposta.status === 204) {
        return { tipo: "semResultado" };
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível consultar o resultado pessoal.");
      }

      return resposta.json().then(function (dados) {
        return { tipo: "comResultado", dados: dados };
      });
    })
    .then(function (retornoResultado) {
      if (!retornoResultado) {
        return;
      }

      if (retornoResultado.tipo === "semSessao") {
        ocultarResultadoDescoberta();
        exibirLinkResultadoDescoberta(false);
        atualizarStatusDescoberta("Entre na sua conta para visualizar o resultado pessoal.");
        return;
      }

      if (retornoResultado.tipo === "semResultado") {
        ocultarResultadoDescoberta();
        atualizarStatusResultadoDescoberta("Você ainda não possui resultado para a pergunta ativa.");

        if (origemConsulta === "aposRegistro") {
          atualizarStatusDescoberta("Resposta registrada, mas ainda não há resultado disponível para a pergunta ativa.");
        }
        return;
      }

      exibirResultadoDescoberta(retornoResultado.dados);
      exibirLinkResultadoDescoberta(true);

      if (origemConsulta === "aposRegistro") {
        atualizarStatusDescoberta("Resposta registrada com sucesso. Seu resultado foi carregado abaixo.");
      } else {
        atualizarStatusDescoberta("Você já respondeu esta pergunta. A resposta original foi mantida.");
      }
    })
    .catch(function (erro) {
      console.log("Erro ao carregar resultado pessoal na descoberta:", erro);
      ocultarResultadoDescoberta();
      atualizarStatusResultadoDescoberta("Falha ao consultar o resultado pessoal no momento.");
      atualizarStatusDescoberta("Sua resposta foi encontrada, mas não foi possível carregar o resultado agora.");
    });
}

// Requisição assíncrona para consultar se o usuário logado já respondeu a pergunta ativa.
function consultarRespostaRegistradaDescoberta() {
  return fetch("/descoberta/resposta-ativa", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        return { tipo: "semSessao" };
      }

      if (resposta.status === 204) {
        return { tipo: "semResposta" };
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível consultar a resposta registrada.");
      }

      return resposta.json().then(function (dados) {
        return {
          tipo: "respostaRegistrada",
          idAlternativa: dados.idAlternativa,
        };
      });
    })
    .then(function (resultadoConsulta) {
      if (!resultadoConsulta) {
        return null;
      }

      if (resultadoConsulta.tipo === "semSessao") {
        exibirLinkResultadoDescoberta(false);
        alterarEstadoBotoesAlternativas(true);
        ocultarResultadoDescoberta();
        atualizarStatusDescoberta("Entre na sua conta para registrar uma resposta.");
        return resultadoConsulta;
      }

      if (resultadoConsulta.tipo === "semResposta") {
        exibirLinkResultadoDescoberta(false);
        alterarEstadoBotoesAlternativas(false);
        ocultarResultadoDescoberta();
        atualizarStatusResultadoDescoberta("Responda a pergunta ativa para visualizar seu resultado aqui.");
        atualizarStatusDescoberta("Pergunta carregada com sucesso. Escolha uma alternativa para responder.");
        return resultadoConsulta;
      }

      const encontrouAlternativa = destacarAlternativaRegistrada(resultadoConsulta.idAlternativa);
      alterarEstadoBotoesAlternativas(true);

      if (encontrouAlternativa) {
        carregarMeuResultadoDescoberta("respostaExistente");
      } else {
        exibirLinkResultadoDescoberta(false);
        ocultarResultadoDescoberta();
        atualizarStatusDescoberta("Há uma resposta registrada, mas a alternativa não está disponível nesta pergunta.");
      }

      return resultadoConsulta;
    })
    .catch(function (erro) {
      console.log("Erro ao consultar resposta registrada da descoberta:", erro);
      ocultarResultadoDescoberta();
      atualizarStatusResultadoDescoberta("Falha ao verificar a resposta registrada.");
      atualizarStatusDescoberta("Não foi possível verificar sua resposta salva no momento.");
      alterarEstadoBotoesAlternativas(false);
      return null;
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
        const encontrouAlternativa = destacarAlternativaRegistrada(idAlternativa);
        alterarEstadoBotoesAlternativas(true);

        if (encontrouAlternativa) {
          carregarMeuResultadoDescoberta("aposRegistro");
        } else {
          exibirLinkResultadoDescoberta(false);
          ocultarResultadoDescoberta();
          atualizarStatusDescoberta(
            "Resposta registrada com sucesso, mas a alternativa não foi localizada na tela atual."
          );
        }
        return;
      }

      if (retorno.status === 409) {
        atualizarStatusDescoberta(mensagemServidor || "Você já respondeu esta pergunta.");
        consultarRespostaRegistradaDescoberta();
        return;
      }

      if (retorno.status === 401 || retorno.status === 400) {
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
      consultarRespostaRegistradaDescoberta();
    })
    .catch(function (erro) {
      console.log("Erro ao buscar pergunta da descoberta:", erro);
      atualizarStatusDescoberta("Falha ao consultar a API de descoberta.");
    });
}

document.addEventListener("DOMContentLoaded", function () {
  carregarPerguntaAtivaDescoberta();
});
