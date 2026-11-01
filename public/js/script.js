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
          sessionStorage.ID_USUARIO = json.id;
          sessionStorage.AQUARIOS = JSON.stringify(json.aquarios);

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
  carregarChartJsSeNecessario().then(function (podeInicializar) {
    if (podeInicializar) {
      inicializarGraficos();
    }
  });
});
