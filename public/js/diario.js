/*
  Arquivo: public/js/diario.js
  Responsabilidade: comportamento da página de diário (listar, publicar e excluir reflexões).
  Organização deste arquivo:
  1) Helpers visuais;
  2) Sessão/autorização;
  3) Listagem e renderização;
  4) Publicação e exclusão.
*/

// Indica se a sessão já foi validada para liberar ações na tela.
let sessaoDiarioValidada = false;

// Formata data/hora para exibição amigável no histórico.
function formatarDataDiario(dataRegistro) {
  const data = new Date(dataRegistro);

  if (Number.isNaN(data.getTime())) {
    return "Data indisponível";
  }

  return `${data.toLocaleDateString("pt-BR")} ${data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

// Atualiza o texto de status principal da página de diário.
function atualizarStatusDiario(mensagem) {
  const statusDiario = document.getElementById("status_diario");

  if (statusDiario) {
    statusDiario.innerText = mensagem;
  }
}

/*
  Cria botão "Excluir reflexão" para um item do histórico.
  Quando clicado, chama o fluxo de exclusão da API para esse registro.
*/
function criarBotaoExcluirReflexao(registro, itemHistorico) {
  const botaoExcluir = document.createElement("button");
  botaoExcluir.type = "button";
  botaoExcluir.className = "botao-excluir-reflexao";
  botaoExcluir.textContent = "Excluir reflexão";

  botaoExcluir.addEventListener("click", function () {
    excluirReflexaoDiario(registro.idDiario, itemHistorico, botaoExcluir);
  });

  return botaoExcluir;
}

// Oculta o conteúdo principal do diário enquanto sessão não está pronta.
function ocultarConteudoDiario() {
  const conteudoDiario = document.getElementById("diario_conteudo");
  const botaoPublicar = document.getElementById("botao_publicar_reflexao");

  if (conteudoDiario) {
    conteudoDiario.style.display = "none";
  }

  if (botaoPublicar) {
    botaoPublicar.disabled = true;
  }
}

// Exibe o conteúdo principal do diário após validar sessão.
function exibirConteudoDiario() {
  const conteudoDiario = document.getElementById("diario_conteudo");
  const botaoPublicar = document.getElementById("botao_publicar_reflexao");

  if (conteudoDiario) {
    conteudoDiario.style.display = "";
  }

  if (botaoPublicar) {
    botaoPublicar.disabled = false;
  }
}

/*
  Redireciona para login quando sessão está inválida/expirada.
  Também bloqueia a tela para evitar ações sem autenticação.
*/
function redirecionarParaLoginPorSessao(mensagem) {
  sessaoDiarioValidada = false;
  atualizarStatusDiario(mensagem || "Sessão expirada. Redirecionando para login...");
  ocultarConteudoDiario();

  setTimeout(function () {
    window.location = "./login.html";
  }, 1500);
}

// Renderiza estado visual de erro no histórico de reflexões.
function renderizarErroHistoricoDiario() {
  const historicoLista = document.getElementById("historico_lista");

  if (!historicoLista) {
    return;
  }

  historicoLista.innerHTML = `
    <li class="historico-item">
      <strong>Não foi possível carregar suas reflexões.</strong>
      <span>Tente novamente em instantes.</span>
    </li>
  `;
}

/*
  Renderiza lista de reflexões no histórico.
  Cada item possui:
  - título clicável para expandir/recolher conteúdo;
  - data de registro;
  - botão para excluir.
*/
function renderizarHistoricoDiario(listaRegistros) {
  const historicoLista = document.getElementById("historico_lista");

  if (!historicoLista) {
    return;
  }

  historicoLista.innerHTML = "";

  if (!Array.isArray(listaRegistros) || listaRegistros.length === 0) {
    historicoLista.innerHTML = `
      <li class="historico-item">
        <strong>Você ainda não possui reflexões registradas.</strong>
        <span>Publique sua primeira reflexão.</span>
      </li>
    `;
    atualizarStatusDiario("Histórico vazio. Faça sua primeira publicação.");
    return;
  }

  listaRegistros.forEach(function (registro) {
    const item = document.createElement("li");
    item.className = "historico-item";

    const botaoTitulo = document.createElement("button");
    botaoTitulo.type = "button";
    botaoTitulo.className = "historico-titulo-toggle";
    botaoTitulo.textContent = registro.titulo || "Sem título";

    const dataRegistro = document.createElement("span");
    dataRegistro.textContent = formatarDataDiario(registro.data_registro);

    const conteudoCompleto = document.createElement("p");
    conteudoCompleto.className = "historico-conteudo";
    conteudoCompleto.style.display = "none";
    conteudoCompleto.textContent = registro.conteudo || "Sem conteúdo.";

    botaoTitulo.addEventListener("click", function () {
      const estaAberto = item.classList.toggle("aberto");
      conteudoCompleto.style.display = estaAberto ? "block" : "none";
    });

    item.appendChild(botaoTitulo);
    item.appendChild(dataRegistro);
    item.appendChild(conteudoCompleto);
    item.appendChild(criarBotaoExcluirReflexao(registro, item));
    historicoLista.appendChild(item);
  });

  atualizarStatusDiario("Histórico atualizado com sucesso.");
}

/*
  Requisição assíncrona para validar sessão antes de acessar a tela protegida.
  Endpoint usado: GET /usuarios/sessao
*/
function verificarSessaoUsuario() {
  return fetch("/usuarios/sessao", {
    method: "GET",
    credentials: "same-origin",
  }).then(function (resposta) {
    if (resposta.status === 401) {
      redirecionarParaLoginPorSessao();
      return null;
    }

    if (!resposta.ok) {
      throw new Error("Não foi possível validar a sessão.");
    }

    return resposta.json();
  });
}

/*
  Requisição assíncrona para carregar histórico do usuário logado.
  Endpoint usado: GET /diario/listar
*/
function carregarHistoricoDiario() {
  atualizarStatusDiario("Carregando histórico...");

  fetch("/diario/listar", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        redirecionarParaLoginPorSessao();
        return null;
      }

      if (resposta.status === 204) {
        return [];
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar o histórico do diário.");
      }

      return resposta.json();
    })
    .then(function (listaRegistros) {
      if (listaRegistros === null) {
        return;
      }

      renderizarHistoricoDiario(listaRegistros);
    })
    .catch(function (erro) {
      console.log("Erro ao carregar histórico do diário:", erro);
      atualizarStatusDiario("Erro ao carregar histórico. Tente novamente.");
      renderizarErroHistoricoDiario();
    });
}

/*
  Requisição assíncrona para publicar uma nova reflexão no diário.
  Endpoint usado: POST /diario/publicar
*/
function publicarReflexao() {
  if (!sessaoDiarioValidada) {
    atualizarStatusDiario("Aguarde a validação da sessão para publicar.");
    return false;
  }

  const tituloInput = document.getElementById("titulo_reflexao_input");
  const conteudoInput = document.getElementById("conteudo_reflexao_input");
  const botaoPublicar = document.getElementById("botao_publicar_reflexao");

  if (!tituloInput || !conteudoInput) {
    atualizarStatusDiario("Não foi possível localizar os campos do diário.");
    return false;
  }

  const titulo = tituloInput.value.trim();
  const conteudo = conteudoInput.value.trim();

  if (!titulo || !conteudo) {
    atualizarStatusDiario("Preencha título e conteúdo para publicar.");
    return false;
  }

  if (botaoPublicar) {
    botaoPublicar.disabled = true;
  }

  atualizarStatusDiario("Publicando reflexão...");

  fetch("/diario/publicar", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      titulo: titulo,
      conteudo: conteudo,
    }),
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        redirecionarParaLoginPorSessao();
        return null;
      }

      if (!resposta.ok) {
        return resposta.text().then(function (textoErro) {
          throw new Error(textoErro || "Falha ao publicar reflexão.");
        });
      }

      return resposta.json();
    })
    .then(function (resultadoPublicacao) {
      if (resultadoPublicacao === null) {
        return;
      }

      tituloInput.value = "";
      conteudoInput.value = "";
      atualizarStatusDiario("Reflexão publicada com sucesso.");
      carregarHistoricoDiario();
    })
    .catch(function (erro) {
      console.log("Erro ao publicar reflexão:", erro);
      atualizarStatusDiario("Erro ao publicar reflexão. Tente novamente.");
    })
    .finally(function () {
      if (botaoPublicar) {
        botaoPublicar.disabled = false;
      }
    });

  return false;
}

/*
  Requisição assíncrona para excluir uma reflexão específica do usuário autenticado.
  Endpoint usado: DELETE /diario/deletar/:idDiario
*/
function excluirReflexaoDiario(idDiario, itemHistorico, botaoExcluir) {
  const idConvertido = Number(idDiario);

  if (!Number.isInteger(idConvertido) || idConvertido <= 0) {
    atualizarStatusDiario("Não foi possível identificar a reflexão para exclusão.");
    return;
  }

  if (!sessaoDiarioValidada) {
    atualizarStatusDiario("Sessão inválida. Faça login novamente para excluir.");
    return;
  }

  const confirmouExclusao = window.confirm("Deseja realmente excluir esta reflexão?");
  if (!confirmouExclusao) {
    return;
  }

  if (botaoExcluir) {
    botaoExcluir.disabled = true;
    botaoExcluir.textContent = "Excluindo...";
  }

  atualizarStatusDiario("Excluindo reflexão...");

  fetch(`/diario/deletar/${idConvertido}`, {
    method: "DELETE",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        redirecionarParaLoginPorSessao();
        return null;
      }

      if (!resposta.ok) {
        return resposta.text().then(function (textoErro) {
          throw new Error(textoErro || "Não foi possível excluir a reflexão.");
        });
      }

      return resposta.json();
    })
    .then(function (resultadoExclusao) {
      if (resultadoExclusao === null) {
        return;
      }

      const totalAfetado = Number(resultadoExclusao.affectedRows);
      if (!Number.isInteger(totalAfetado) || totalAfetado < 1) {
        throw new Error("Não foi possível excluir a reflexão solicitada.");
      }

      if (itemHistorico && itemHistorico.parentNode) {
        itemHistorico.parentNode.removeChild(itemHistorico);
      }

      const historicoLista = document.getElementById("historico_lista");
      if (historicoLista && historicoLista.children.length === 0) {
        renderizarHistoricoDiario([]);
      } else {
        atualizarStatusDiario("Reflexão excluída com sucesso.");
      }
    })
    .catch(function (erro) {
      console.log("Erro ao excluir reflexão:", erro);
      atualizarStatusDiario(erro.message || "Erro ao excluir reflexão. Tente novamente.");

      if (botaoExcluir) {
        botaoExcluir.disabled = false;
        botaoExcluir.textContent = "Excluir reflexão";
      }
    });
}

// Inicializa toda a tela de diário (validação de sessão + carregamento de histórico).
/*
  Inicialização da página de diário.
  Ordem:
  1) valida sessão;
  2) libera conteúdo;
  3) carrega histórico.
*/
function inicializarPaginaDiario() {
  const historicoLista = document.getElementById("historico_lista");

  if (!historicoLista) {
    return;
  }

  atualizarStatusDiario("Verificando sessão...");
  ocultarConteudoDiario();

  verificarSessaoUsuario()
    .then(function (dadosSessao) {
      if (!dadosSessao) {
        return;
      }

      sessaoDiarioValidada = true;
      exibirConteudoDiario();
      carregarHistoricoDiario();
    })
    .catch(function (erro) {
      console.log("Erro ao validar sessão:", erro);
      redirecionarParaLoginPorSessao(
        "Não foi possível validar a sessão (conexão indisponível). Redirecionando para login..."
      );
    });
}

// Expõe função global para uso no onclick do HTML.
window.publicarReflexao = publicarReflexao;

// Ponto de entrada do JS da página de diário.
document.addEventListener("DOMContentLoaded", function () {
  inicializarPaginaDiario();
});
