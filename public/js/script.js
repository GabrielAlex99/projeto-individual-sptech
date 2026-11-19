// Utilitários de interface
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

function sumirMensagem() {
  const cardErro = document.getElementById("cardErro");
  if (cardErro) {
    cardErro.style.display = "none";
  }
}

let sessaoDiarioValidada = false;
let chartDisponivelDashboard = false;
let chartCarregamentoDashboardConcluido = false;
let graficoDashboardInicializado = false;
let metricasDashboardCarregadas = null;
let progressoPerguntasDashboardCarregado = null;
let graficoCorrentesDashboard = null;
let graficoProgressoPerguntasDashboard = null;
let loginEmAndamento = false;
let cadastroEmAndamento = false;

function atualizarStatusFormulario(idStatus, mensagem) {
  const status = document.getElementById(idStatus);

  if (!status) {
    return;
  }

  status.textContent = mensagem || "";
}

function atualizarEstadoEnvioFormulario(idBotao, idAguardo, idStatus, emEnvio, textoBotaoPadrao, mensagemStatus) {
  const botao = document.getElementById(idBotao);
  const aguardando = document.getElementById(idAguardo);

  if (botao) {
    botao.disabled = emEnvio;
    botao.textContent = emEnvio ? "Aguarde..." : textoBotaoPadrao;
  }

  if (aguardando) {
    aguardando.style.display = emEnvio ? "block" : "none";
    aguardando.setAttribute("aria-hidden", emEnvio ? "false" : "true");
  }

  if (typeof mensagemStatus === "string") {
    atualizarStatusFormulario(idStatus, mensagemStatus);
  }
}

// Função de login (usada no login.html)
function entrar() {
  const emailInput = document.getElementById("email_input");
  const senhaInput = document.getElementById("senha_input");
  const textoBotaoPadrao = "Retomar Reflexão";

  if (!emailInput || !senhaInput) {
    return false;
  }

  if (loginEmAndamento) {
    return false;
  }

  const emailVar = emailInput.value.trim();
  const senhaVar = senhaInput.value;

  if (emailVar === "" || senhaVar === "") {
    exibirErro("Preencha email e senha para continuar.");
    atualizarStatusFormulario("status_formulario_login", "Preencha os campos para enviar.");
    return false;
  }

  sumirMensagem();
  loginEmAndamento = true;
  atualizarEstadoEnvioFormulario(
    "botao_entrar",
    "div_aguardar",
    "status_formulario_login",
    true,
    textoBotaoPadrao,
    "Enviando dados de login..."
  );

  // Requisição de autenticação do usuário
  fetch("/usuarios/autenticar", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      emailServer: emailVar,
      senhaServer: senhaVar,
    }),
  })
    .then(function (resposta) {
      if (resposta.ok) {
        return resposta.json().then(function (json) {
          sessionStorage.EMAIL_USUARIO = json.email;
          sessionStorage.NOME_USUARIO = json.nome;
          atualizarStatusFormulario("status_formulario_login", "Login realizado. Redirecionando...");

          setTimeout(function () {
            window.location = "./diario.html";
          }, 1000);
        });
      }

      if (resposta.status === 401 || resposta.status === 403) {
        exibirErro("Email ou senha incorretos.");
        atualizarStatusFormulario("status_formulario_login", "Falha de autenticação.");
        return null;
      }

      exibirErro("Não foi possível concluir o login no momento.");
      atualizarStatusFormulario("status_formulario_login", "Falha ao realizar login.");
      return null;
    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
      exibirErro("Erro de conexão. Verifique sua internet e tente novamente.");
      atualizarStatusFormulario("status_formulario_login", "Erro de conexão ao enviar login.");
    })
    .finally(function () {
      loginEmAndamento = false;
      atualizarEstadoEnvioFormulario(
        "botao_entrar",
        "div_aguardar",
        "status_formulario_login",
        false,
        textoBotaoPadrao,
        null
      );
    });

  return false;
}

function obterMensagemCadastroSegura(mensagemServidor) {
  const mensagem = (mensagemServidor || "").trim();

  if (!mensagem) {
    return "Não foi possível concluir o cadastro.";
  }

  const mensagemMinuscula = mensagem.toLowerCase();
  const possuiTermoTecnico =
    mensagemMinuscula.includes("sql") ||
    mensagemMinuscula.includes("mysql") ||
    mensagemMinuscula.includes("er_") ||
    mensagemMinuscula.includes("syntax") ||
    mensagemMinuscula.includes("stack");

  if (possuiTermoTecnico) {
    return "Não foi possível concluir o cadastro.";
  }

  return mensagem;
}

// Função de cadastro (usada no cadastro.html)
function cadastrar() {
  const nomeInput = document.getElementById("nome_input");
  const emailInput = document.getElementById("email_input");
  const senhaInput = document.getElementById("senha_input");
  const confirmacaoSenhaInput = document.getElementById("confirmacao_senha_input");
  const textoBotaoPadrao = "Iniciar Jornada";

  if (!nomeInput || !emailInput || !senhaInput || !confirmacaoSenhaInput) {
    return false;
  }

  if (cadastroEmAndamento) {
    return false;
  }

  const nomeVar = nomeInput.value.trim();
  const emailVar = emailInput.value.trim();
  const senhaVar = senhaInput.value;
  const confirmacaoSenhaVar = confirmacaoSenhaInput.value;

  if (
    nomeVar === "" ||
    emailVar === "" ||
    senhaVar === "" ||
    confirmacaoSenhaVar === ""
  ) {
    exibirErro("Preencha todos os campos para continuar.");
    atualizarStatusFormulario("status_formulario_cadastro", "Preencha os campos para enviar.");
    return false;
  }

  if (senhaVar !== confirmacaoSenhaVar) {
    exibirErro("A confirmação de senha não corresponde.");
    atualizarStatusFormulario("status_formulario_cadastro", "As senhas informadas não correspondem.");
    return false;
  }

  sumirMensagem();
  cadastroEmAndamento = true;
  atualizarEstadoEnvioFormulario(
    "botao_cadastrar",
    "div_aguardar",
    "status_formulario_cadastro",
    true,
    textoBotaoPadrao,
    "Enviando dados de cadastro..."
  );

  // Requisição de cadastro do usuário
  fetch("/usuarios/cadastrar", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nomeServer: nomeVar,
      emailServer: emailVar,
      senhaServer: senhaVar,
    }),
  })
    .then(function (resposta) {
      return resposta.text().then(function (mensagemServidor) {
        return {
          ok: resposta.ok,
          mensagemServidor: mensagemServidor,
        };
      });
    })
    .then(function (retorno) {
      if (retorno.ok) {
        sumirMensagem();
        atualizarStatusFormulario("status_formulario_cadastro", "Cadastro realizado com sucesso! Redirecionando para login...");

        setTimeout(function () {
          window.location = "login.html";
        }, 2000);
        return;
      }

      exibirErro(obterMensagemCadastroSegura(retorno.mensagemServidor));
      atualizarStatusFormulario("status_formulario_cadastro", "Falha ao concluir cadastro.");
    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
      exibirErro("Erro de conexão. Não foi possível concluir o cadastro.");
      atualizarStatusFormulario("status_formulario_cadastro", "Erro de conexão ao enviar cadastro.");
    })
    .finally(function () {
      cadastroEmAndamento = false;
      atualizarEstadoEnvioFormulario(
        "botao_cadastrar",
        "div_aguardar",
        "status_formulario_cadastro",
        false,
        textoBotaoPadrao,
        null
      );
    });

  return false;
}

function calcularNivelForcaSenha(senha) {
  // Critério didático: combina tamanho (>= 6 e >= 8) e variedade (letra, número e símbolo).
  const senhaTexto = senha || "";
  const temLetra = /[a-zA-Z]/.test(senhaTexto);
  const temNumero = /\d/.test(senhaTexto);
  const temSimbolo = /[^a-zA-Z0-9]/.test(senhaTexto);
  const quantidadeTipos = [temLetra, temNumero, temSimbolo].filter(Boolean).length;

  if (senhaTexto.length >= 8 && quantidadeTipos >= 3) {
    return { texto: "Senha forte", classe: "senha-forte" };
  }

  if (senhaTexto.length >= 6 && quantidadeTipos >= 2) {
    return { texto: "Senha média", classe: "senha-media" };
  }

  return { texto: "Senha fraca", classe: "senha-fraca" };
}

function atualizarFeedbackSenhaCadastro() {
  const senhaInput = document.getElementById("senha_input");
  const confirmacaoSenhaInput = document.getElementById("confirmacao_senha_input");
  const forcaSenhaStatus = document.getElementById("forca_senha_status");
  const confirmacaoSenhaStatus = document.getElementById("confirmacao_senha_status");

  if (!senhaInput || !confirmacaoSenhaInput || !forcaSenhaStatus || !confirmacaoSenhaStatus) {
    return;
  }

  const nivelSenha = calcularNivelForcaSenha(senhaInput.value);
  forcaSenhaStatus.textContent = `Força da senha: ${nivelSenha.texto}`;
  forcaSenhaStatus.className = `senha-feedback ${nivelSenha.classe}`;

  if (confirmacaoSenhaInput.value === "") {
    confirmacaoSenhaStatus.textContent = "";
    confirmacaoSenhaStatus.className = "senha-feedback";
    return;
  }

  if (senhaInput.value === confirmacaoSenhaInput.value) {
    confirmacaoSenhaStatus.textContent = "As senhas coincidem.";
    confirmacaoSenhaStatus.className = "senha-feedback senha-ok";
    return;
  }

  confirmacaoSenhaStatus.textContent = "As senhas não coincidem.";
  confirmacaoSenhaStatus.className = "senha-feedback senha-fraca";
}

function inicializarFeedbackSenhaCadastro() {
  const senhaInput = document.getElementById("senha_input");
  const confirmacaoSenhaInput = document.getElementById("confirmacao_senha_input");

  if (!senhaInput || !confirmacaoSenhaInput) {
    return;
  }

  senhaInput.addEventListener("input", atualizarFeedbackSenhaCadastro);
  confirmacaoSenhaInput.addEventListener("input", atualizarFeedbackSenhaCadastro);
  atualizarFeedbackSenhaCadastro();
}

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

function atualizarStatusDiario(mensagem) {
  const statusDiario = document.getElementById("status_diario");

  if (statusDiario) {
    statusDiario.innerText = mensagem;
  }
}

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

// Requisição assíncrona para excluir uma reflexão específica do usuário autenticado.
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
    const botaoExcluir = criarBotaoExcluirReflexao(registro, item);

    botaoTitulo.addEventListener("click", function () {
      const estaAberto = item.classList.toggle("aberto");
      conteudoCompleto.style.display = estaAberto ? "block" : "none";
    });

    item.appendChild(botaoTitulo);
    item.appendChild(dataRegistro);
    item.appendChild(conteudoCompleto);
    item.appendChild(botaoExcluir);

    historicoLista.appendChild(item);
  });

  atualizarStatusDiario("Histórico atualizado com sucesso.");
}

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

function redirecionarParaLoginPorSessao(mensagem) {
  sessaoDiarioValidada = false;
  atualizarStatusDiario(mensagem || "Sessão expirada. Redirecionando para login...");
  ocultarConteudoDiario();

  setTimeout(function () {
    window.location = "./login.html";
  }, 1600);
}

// Requisição assíncrona para validar sessão antes de acessar tela protegida.
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

// Requisição assíncrona para carregar o histórico de diário do usuário logado.
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
        renderizarHistoricoDiario([]);
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

// Requisição assíncrona para publicar uma nova reflexão no diário.
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

      if (!tituloInput || !conteudoInput) {
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

// Requisição assíncrona para encerrar a sessão do usuário no servidor.
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

function inicializarAcaoSair() {
  const linksSair = document.querySelectorAll(".acao-sair");

  linksSair.forEach(function (linkSair) {
    linkSair.addEventListener("click", function (evento) {
      evento.preventDefault();
      encerrarSessaoUsuario();
    });
  });
}

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

// Carrega Chart.js apenas quando necessário
function carregarChartJsSeNecessario() {
  return new Promise(function (resolve) {
    const graficoTemas = document.getElementById("graficoTemas");

    if (!graficoTemas) {
      resolve(false);
      return;
    }

    if (window.Chart) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js";
    script.onload = function () {
      resolve(true);
    };
    script.onerror = function () {
      console.log("#ERRO: não foi possível carregar o Chart.js.");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

function paginaDashboardAtiva() {
  return Boolean(document.getElementById("status_dashboard"));
}

function atualizarStatusDashboard(mensagem) {
  const statusDashboard = document.getElementById("status_dashboard");

  if (statusDashboard) {
    statusDashboard.textContent = mensagem;
  }
}

function renderizarMetricasTextuaisDashboard(distribuicaoPorCorrente, exibir) {
  const listaMetricas = document.getElementById("metricas_textuais");

  if (!listaMetricas) {
    return;
  }

  listaMetricas.innerHTML = "";
  listaMetricas.style.display = exibir ? "flex" : "none";

  if (!exibir || !Array.isArray(distribuicaoPorCorrente)) {
    return;
  }

  distribuicaoPorCorrente.forEach(function (metrica) {
    const item = document.createElement("li");
    item.textContent = `${metrica.correnteFilosofica}: ${Number(metrica.totalRespostas)} resposta(s)`;
    listaMetricas.appendChild(item);
  });
}

function renderizarProgressoPerguntasTextualDashboard(progressoPorPergunta, exibir) {
  const listaProgresso = document.getElementById("progresso_perguntas_textual");

  if (!listaProgresso) {
    return;
  }

  listaProgresso.innerHTML = "";
  listaProgresso.style.display = exibir ? "flex" : "none";

  if (!exibir || !Array.isArray(progressoPorPergunta)) {
    return;
  }

  progressoPorPergunta.forEach(function (itemPergunta) {
    const item = document.createElement("li");
    item.textContent = `Pergunta ${Number(itemPergunta.ordemExibicao)} (${itemPergunta.enunciado}): ${Number(
      itemPergunta.totalRespostas
    )} resposta(s)`;
    listaProgresso.appendChild(item);
  });
}

function atualizarResumoDashboard(totalTexto, participantesTexto, concluintesTexto, correnteTexto, avisoAmostra, exibir) {
  const resumo = document.getElementById("resumo_metricas_dashboard");
  const total = document.getElementById("total_respostas_dashboard");
  const participantes = document.getElementById("total_participantes_dashboard");
  const concluintes = document.getElementById("total_concluintes_dashboard");
  const lider = document.getElementById("corrente_lider_dashboard");
  const aviso = document.getElementById("aviso_amostra_dashboard");

  if (!resumo || !total || !participantes || !concluintes || !lider || !aviso) {
    return;
  }

  total.textContent = totalTexto;
  participantes.textContent = participantesTexto;
  concluintes.textContent = concluintesTexto;
  lider.textContent = correnteTexto;
  aviso.textContent = avisoAmostra || "";
  resumo.style.display = exibir ? "block" : "none";
}

function obterAvisoAmostraDashboard(totalParticipantes) {
  if (!Number.isFinite(totalParticipantes) || totalParticipantes <= 0) {
    return "Sem participantes no momento. Não há base para identificar tendência.";
  }

  if (totalParticipantes === 1) {
    return "Amostra muito pequena: 1 participante não representa tendência.";
  }

  if (totalParticipantes < 5) {
    return "Amostra pequena: interprete com cautela, os dados podem variar bastante.";
  }

  return "Amostra em crescimento: use as métricas como referência educativa, não como verdade definitiva.";
}

function calcularCorrenteLiderDashboard(distribuicaoPorCorrente) {
  if (!Array.isArray(distribuicaoPorCorrente) || distribuicaoPorCorrente.length === 0) {
    return "Nenhuma corrente com respostas registradas.";
  }

  let maiorTotal = 0;
  const correntesLideres = [];

  distribuicaoPorCorrente.forEach(function (metrica) {
    const totalCorrente = Number(metrica.totalRespostas);
    const totalValido = Number.isFinite(totalCorrente) ? totalCorrente : 0;

    if (totalValido > maiorTotal) {
      maiorTotal = totalValido;
      correntesLideres.length = 0;
      correntesLideres.push(metrica.correnteFilosofica);
      return;
    }

    if (totalValido === maiorTotal && totalValido > 0) {
      correntesLideres.push(metrica.correnteFilosofica);
    }
  });

  if (maiorTotal === 0 || correntesLideres.length === 0) {
    return "Nenhuma corrente com respostas registradas.";
  }

  if (correntesLideres.length === 1) {
    return correntesLideres[0];
  }

  return `Empate entre: ${correntesLideres.join(", ")}.`;
}

// Inicializa o gráfico de distribuição por corrente com as métricas retornadas pela API.
function inicializarGraficoCorrentes(metricas) {
  const graficoTemas = document.getElementById("graficoTemas");

  if (!window.Chart || !graficoTemas) {
    return false;
  }

  try {
    if (graficoCorrentesDashboard) {
      graficoCorrentesDashboard.destroy();
    }

    graficoCorrentesDashboard = new Chart(graficoTemas, {
      type: "doughnut",
      data: {
        labels: metricas.map(function (metrica) {
          return metrica.correnteFilosofica;
        }),
        datasets: [
          {
            label: "Respostas registradas",
            data: metricas.map(function (metrica) {
              return Number(metrica.totalRespostas);
            }),
            backgroundColor: ["#d8b46a", "#9e8a58", "#6f6550", "#4f4a41", "#2f2f33"],
            borderColor: "#111114",
            borderWidth: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#e7e3d5",
            },
          },
        },
      },
    });

    return true;
  } catch (erroGrafico) {
    console.log("Falha ao criar gráfico de correntes da dashboard:", erroGrafico);
    return false;
  }
}

// Inicializa o gráfico de progresso por pergunta ativa.
function inicializarGraficoProgressoPerguntas(progressoPorPergunta) {
  const graficoProgresso = document.getElementById("graficoProgressoPerguntas");

  if (!window.Chart || !graficoProgresso) {
    return false;
  }

  try {
    if (graficoProgressoPerguntasDashboard) {
      graficoProgressoPerguntasDashboard.destroy();
    }

    graficoProgressoPerguntasDashboard = new Chart(graficoProgresso, {
      type: "bar",
      data: {
        labels: progressoPorPergunta.map(function (itemPergunta) {
          return `P${Number(itemPergunta.ordemExibicao)}`;
        }),
        datasets: [
          {
            label: "Respostas por pergunta",
            data: progressoPorPergunta.map(function (itemPergunta) {
              return Number(itemPergunta.totalRespostas);
            }),
            backgroundColor: "#d8b46a",
            borderColor: "#111114",
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: "#e7e3d5",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: "#e7e3d5",
              precision: 0,
            },
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "#e7e3d5",
            },
          },
        },
      },
    });

    return true;
  } catch (erroGrafico) {
    console.log("Falha ao criar gráfico de progresso da dashboard:", erroGrafico);
    return false;
  }
}

function tentarInicializarGraficoDashboard() {
  if (!paginaDashboardAtiva() || graficoDashboardInicializado) {
    return;
  }

  if (!Array.isArray(metricasDashboardCarregadas) || !Array.isArray(progressoPerguntasDashboardCarregado)) {
    return;
  }

  if (!chartCarregamentoDashboardConcluido) {
    atualizarStatusDashboard("Métricas carregadas com dados reais. Carregando gráfico...");
    return;
  }

  if (!chartDisponivelDashboard) {
    atualizarStatusDashboard("Gráfico indisponível no momento. Valores exibidos em texto.");
    return;
  }

  const graficoCorrentesCriado = inicializarGraficoCorrentes(metricasDashboardCarregadas);
  const graficoProgressoCriado = inicializarGraficoProgressoPerguntas(progressoPerguntasDashboardCarregado);

  if (graficoCorrentesCriado && graficoProgressoCriado) {
    graficoDashboardInicializado = true;
    atualizarStatusDashboard("Métricas calculadas com as respostas registradas nas perguntas ativas.");
  } else {
    chartDisponivelDashboard = false;
    atualizarStatusDashboard("Métricas carregadas, mas o gráfico está indisponível no momento.");
  }
}

// Requisição assíncrona para carregar a quantidade de respostas por corrente.
function carregarMetricasDashboard() {
  fetch("/dashboard/metricas", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        metricasDashboardCarregadas = null;
        progressoPerguntasDashboardCarregado = null;
        renderizarMetricasTextuaisDashboard([], false);
        renderizarProgressoPerguntasTextualDashboard([], false);
        atualizarResumoDashboard(
          "Não disponível sem sessão ativa.",
          "Não disponível sem sessão ativa.",
          "Não disponível sem sessão ativa.",
          "Não disponível sem sessão ativa.",
          "",
          true
        );
        atualizarStatusDashboard("Entre na sua conta para consultar as métricas.");
        return null;
      }

      if (resposta.status === 204) {
        return {
          totalRespostas: 0,
          totalParticipantes: 0,
          totalConcluintes: 0,
          distribuicaoPorCorrente: [],
          progressoPorPergunta: [],
        };
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as métricas.");
      }

      return resposta.json();
    })
    .then(function (metricas) {
      if (metricas === null) {
        return;
      }

      const distribuicaoPorCorrente = Array.isArray(metricas.distribuicaoPorCorrente)
        ? metricas.distribuicaoPorCorrente
        : [];
      const progressoPorPergunta = Array.isArray(metricas.progressoPorPergunta) ? metricas.progressoPorPergunta : [];
      const totalRespostas = Number(metricas.totalRespostas) || 0;
      const totalParticipantes = Number(metricas.totalParticipantes) || 0;
      const totalConcluintes = Number(metricas.totalConcluintes) || 0;
      const correnteLider = calcularCorrenteLiderDashboard(distribuicaoPorCorrente);
      const avisoAmostra = obterAvisoAmostraDashboard(totalParticipantes);

      metricasDashboardCarregadas = distribuicaoPorCorrente;
      progressoPerguntasDashboardCarregado = progressoPorPergunta;
      atualizarResumoDashboard(
        String(totalRespostas),
        String(totalParticipantes),
        String(totalConcluintes),
        correnteLider,
        avisoAmostra,
        true
      );
      renderizarMetricasTextuaisDashboard(distribuicaoPorCorrente, true);
      renderizarProgressoPerguntasTextualDashboard(progressoPorPergunta, true);

      if (progressoPorPergunta.length === 0) {
        atualizarStatusDashboard("Não há perguntas ativas no momento para exibir métricas.");
        return;
      }

      if (totalRespostas === 0) {
        atualizarStatusDashboard("Sem respostas registradas no momento. Os valores exibem o estado atual real.");
      }

      tentarInicializarGraficoDashboard();
    })
    .catch(function (erro) {
      console.log("Erro ao carregar métricas da dashboard:", erro);
      metricasDashboardCarregadas = null;
      progressoPerguntasDashboardCarregado = null;
      renderizarMetricasTextuaisDashboard([], false);
      renderizarProgressoPerguntasTextualDashboard([], false);
      atualizarResumoDashboard(
        "Indisponível no momento.",
        "Indisponível no momento.",
        "Indisponível no momento.",
        "Indisponível no momento.",
        "",
        true
      );
      atualizarStatusDashboard("Não foi possível consultar as métricas no momento.");
    });
}

// Inicia somente o fluxo da dashboard quando a página correspondente estiver ativa.
function inicializarPaginaDashboard() {
  if (!paginaDashboardAtiva()) {
    return;
  }

  carregarMetricasDashboard();

  carregarChartJsSeNecessario().then(function (podeInicializar) {
    chartDisponivelDashboard = podeInicializar;
    chartCarregamentoDashboardConcluido = true;
    tentarInicializarGraficoDashboard();
  });
}

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

document.addEventListener("DOMContentLoaded", function () {
  inicializarAcaoSair();
  inicializarFeedbackSenhaCadastro();
  inicializarPaginaDiario();
  inicializarPaginaDashboard();
  inicializarRevelacaoSuave();
});
