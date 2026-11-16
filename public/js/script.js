// Utilitários de interface
function exibirErro(mensagem) {
  const cardErro = document.getElementById("cardErro");
  const mensagemErro = document.getElementById("mensagem_erro");

  if (!cardErro || !mensagemErro) {
    return;
  }

  cardErro.style.display = "block";
  mensagemErro.innerHTML = mensagem;
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

// Função de login (usada no login.html)
function entrar() {
  const emailInput = document.getElementById("email_input");
  const senhaInput = document.getElementById("senha_input");

  if (!emailInput || !senhaInput) {
    return false;
  }

  const emailVar = emailInput.value;
  const senhaVar = senhaInput.value;

  if (emailVar === "" || senhaVar === "") {
    exibirErro("Preencha email e senha para continuar.");
    return false;
  }

  // Requisição de autenticação do usuário
  fetch("/usuarios/autenticar", {
    method: "POST",
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
        resposta.json().then(function (json) {
          sessionStorage.EMAIL_USUARIO = json.email;
          sessionStorage.NOME_USUARIO = json.nome;

          setTimeout(function () {
            window.location = "./diario.html";
          }, 1000);
        });
      } else {
        console.log("Houve um erro ao tentar realizar o login!");
        resposta.text().then(function (texto) {
          console.error(texto);
        });
      }
    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
    });

  return false;
}

// Função de cadastro (usada no cadastro.html)
function cadastrar() {
  const nomeInput = document.getElementById("nome_input");
  const emailInput = document.getElementById("email_input");
  const senhaInput = document.getElementById("senha_input");
  const confirmacaoSenhaInput = document.getElementById("confirmacao_senha_input");

  if (!nomeInput || !emailInput || !senhaInput || !confirmacaoSenhaInput) {
    return false;
  }

  const nomeVar = nomeInput.value;
  const emailVar = emailInput.value;
  const senhaVar = senhaInput.value;
  const confirmacaoSenhaVar = confirmacaoSenhaInput.value;

  if (
    nomeVar === "" ||
    emailVar === "" ||
    senhaVar === "" ||
    confirmacaoSenhaVar === ""
  ) {
    exibirErro("Preencha todos os campos para continuar.");
    return false;
  }

  if (senhaVar !== confirmacaoSenhaVar) {
    exibirErro("A confirmação de senha não corresponde.");
    return false;
  }

  // Requisição de cadastro do usuário
  fetch("/usuarios/cadastrar", {
    method: "POST",
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
      if (resposta.ok) {
        exibirErro("Cadastro realizado com sucesso! Redirecionando para login...");

        setTimeout(function () {
          window.location = "login.html";
        }, 2000);
      } else {
        throw "Houve um erro ao tentar realizar o cadastro.";
      }
    })
    .catch(function (erro) {
      console.log(`#ERRO: ${erro}`);
      exibirErro("Não foi possível concluir o cadastro.");
    });

  return false;
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
  const linksSair = document.querySelectorAll('a[href="login.html"]');

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

function renderizarMetricasTextuaisDashboard(metricas, exibir) {
  const listaMetricas = document.getElementById("metricas_textuais");

  if (!listaMetricas) {
    return;
  }

  listaMetricas.innerHTML = "";
  listaMetricas.style.display = exibir ? "flex" : "none";

  if (!exibir || !Array.isArray(metricas)) {
    return;
  }

  metricas.forEach(function (metrica) {
    const item = document.createElement("li");
    item.textContent = `${metrica.correnteFilosofica}: ${Number(metrica.totalRespostas)} resposta(s)`;
    listaMetricas.appendChild(item);
  });
}

function atualizarResumoDashboard(totalTexto, correnteTexto, exibir) {
  const resumo = document.getElementById("resumo_metricas_dashboard");
  const total = document.getElementById("total_respostas_dashboard");
  const lider = document.getElementById("corrente_lider_dashboard");

  if (!resumo || !total || !lider) {
    return;
  }

  total.textContent = totalTexto;
  lider.textContent = correnteTexto;
  resumo.style.display = exibir ? "block" : "none";
}

function calcularResumoDashboard(metricas) {
  if (!Array.isArray(metricas) || metricas.length === 0) {
    return {
      totalRespostas: 0,
      correnteLider: "Nenhuma corrente com respostas registradas.",
    };
  }

  let totalRespostas = 0;
  let maiorTotal = 0;
  const correntesLideres = [];

  metricas.forEach(function (metrica) {
    const totalCorrente = Number(metrica.totalRespostas);
    const totalValido = Number.isFinite(totalCorrente) ? totalCorrente : 0;

    totalRespostas += totalValido;

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

  if (totalRespostas === 0 || maiorTotal === 0 || correntesLideres.length === 0) {
    return {
      totalRespostas: totalRespostas,
      correnteLider: "Nenhuma corrente com respostas registradas.",
    };
  }

  if (correntesLideres.length === 1) {
    return {
      totalRespostas: totalRespostas,
      correnteLider: correntesLideres[0],
    };
  }

  return {
    totalRespostas: totalRespostas,
    correnteLider: `Empate entre: ${correntesLideres.join(", ")}.`,
  };
}

// Inicializa o gráfico com as métricas retornadas pela API.
function inicializarGraficos(metricas) {
  const graficoTemas = document.getElementById("graficoTemas");

  if (!window.Chart || !graficoTemas) {
    return false;
  }

  try {
    new Chart(graficoTemas, {
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
    console.log("Falha ao criar gráfico da dashboard:", erroGrafico);
    return false;
  }
}

function tentarInicializarGraficoDashboard() {
  if (!paginaDashboardAtiva() || graficoDashboardInicializado) {
    return;
  }

  if (!Array.isArray(metricasDashboardCarregadas) || metricasDashboardCarregadas.length === 0) {
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

  const graficoCriado = inicializarGraficos(metricasDashboardCarregadas);

  if (graficoCriado) {
    graficoDashboardInicializado = true;
    atualizarStatusDashboard("Métricas calculadas com as respostas registradas para a pergunta ativa.");
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
        renderizarMetricasTextuaisDashboard([], false);
        atualizarResumoDashboard("Não disponível sem sessão ativa.", "Não disponível sem sessão ativa.", true);
        atualizarStatusDashboard("Entre na sua conta para consultar as métricas.");
        return null;
      }

      if (resposta.status === 204) {
        metricasDashboardCarregadas = [];
        renderizarMetricasTextuaisDashboard([], false);
        atualizarResumoDashboard("0", "Nenhuma corrente com respostas registradas.", true);
        atualizarStatusDashboard("Ainda não há respostas registradas para a pergunta ativa.");
        return [];
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar as métricas.");
      }

      return resposta.json();
    })
    .then(function (metricas) {
      if (metricas === null || metricas.length === 0) {
        return;
      }

      metricasDashboardCarregadas = metricas;
      const resumoMetricas = calcularResumoDashboard(metricas);
      atualizarResumoDashboard(String(resumoMetricas.totalRespostas), resumoMetricas.correnteLider, true);
      renderizarMetricasTextuaisDashboard(metricas, true);
      tentarInicializarGraficoDashboard();
    })
    .catch(function (erro) {
      console.log("Erro ao carregar métricas da dashboard:", erro);
      metricasDashboardCarregadas = null;
      renderizarMetricasTextuaisDashboard([], false);
      atualizarResumoDashboard("Indisponível no momento.", "Indisponível no momento.", true);
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

document.addEventListener("DOMContentLoaded", function () {
  inicializarAcaoSair();
  inicializarPaginaDiario();
  inicializarPaginaDashboard();
});
