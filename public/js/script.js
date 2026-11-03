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

    item.innerHTML = `
      <strong>${registro.titulo}</strong>
      <span>${formatarDataDiario(registro.data_registro)}</span>
    `;

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
    const graficoEvolucao = document.getElementById("graficoEvolucao");

    if (!graficoTemas && !graficoEvolucao) {
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

// Inicializa gráficos do dashboard com dados simulados
function inicializarGraficos() {
  const graficoTemas = document.getElementById("graficoTemas");
  const graficoEvolucao = document.getElementById("graficoEvolucao");

  if (!window.Chart) {
    return;
  }

  if (graficoTemas) {
    new Chart(graficoTemas, {
      type: "doughnut",
      data: {
        labels: ["Ética", "Existencialismo", "Estoicismo", "Metafísica", "Lógica"],
        datasets: [
          {
            label: "Temas explorados",
            data: [28, 22, 19, 17, 14],
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
  }

  if (graficoEvolucao) {
    new Chart(graficoEvolucao, {
      type: "line",
      data: {
        labels: ["Semana 1", "Semana 2", "Semana 3", "Semana 4", "Semana 5", "Semana 6"],
        datasets: [
          {
            label: "Índice de autoconhecimento",
            data: [42, 49, 53, 61, 68, 74],
            fill: true,
            tension: 0.3,
            borderColor: "#d8b46a",
            backgroundColor: "rgba(216, 180, 106, 0.16)",
            pointBackgroundColor: "#e7d7b0",
            pointBorderColor: "#d8b46a",
            pointRadius: 4,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            ticks: {
              color: "#d1c9b3",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
          },
          y: {
            ticks: {
              color: "#d1c9b3",
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
  }
}

document.addEventListener("DOMContentLoaded", function () {
  inicializarAcaoSair();
  inicializarPaginaDiario();

  carregarChartJsSeNecessario().then(function (podeInicializar) {
    if (podeInicializar) {
      inicializarGraficos();
    }
  });
});
