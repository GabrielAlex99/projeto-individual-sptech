/*
  Arquivo: public/js/dashboard.js
  Responsabilidade: carregar métricas reais e renderizar dashboard.
  Organização:
  1) estado da página;
  2) renderização textual;
  3) cálculo auxiliar (líder/avisos);
  4) gráficos;
  5) inicialização.
*/

// Estados de carregamento/renderização da dashboard.
let chartDisponivelDashboard = false;
let chartCarregamentoDashboardConcluido = false;
let graficoDashboardInicializado = false;
let metricasDashboardCarregadas = null;
let progressoPerguntasDashboardCarregado = null;
let graficoCorrentesDashboard = null;
let graficoProgressoPerguntasDashboard = null;

// Verifica se a página atual contém os elementos da dashboard.
function paginaDashboardAtiva() {
  return Boolean(document.getElementById("status_dashboard"));
}

// Atualiza mensagem principal de status da dashboard.
function atualizarStatusDashboard(mensagem) {
  const statusDashboard = document.getElementById("status_dashboard");

  if (statusDashboard) {
    statusDashboard.textContent = mensagem;
  }
}

/*
  Preenche o bloco-resumo com métricas principais.
  Esse resumo ajuda na leitura mesmo quando o gráfico estiver indisponível.
*/
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

// Renderiza lista textual da distribuição por corrente filosófica.
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

// Renderiza lista textual do progresso por pergunta ativa.
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

// Gera aviso didático de interpretação conforme tamanho da amostra.
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

// Define corrente líder, incluindo tratamento de empate.
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

/*
  Carrega Chart.js sob demanda.
  Vantagem: evita depender do gráfico para mostrar os dados textuais.
*/
function carregarChartJsSeNecessario() {
  return new Promise(function (resolve) {
    if (!document.getElementById("graficoTemas")) {
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

/*
  Monta gráfico de rosca com distribuição por corrente.
  Entrada: array de distribuição já retornado pela API.
*/
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

/*
  Monta gráfico de barras com progresso por pergunta ativa.
  Entrada: array com total de respostas por pergunta.
*/
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

/*
  Tenta criar os gráficos somente quando:
  - já temos dados da API;
  - Chart.js já carregou.
*/
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

/*
  Requisição assíncrona para buscar métricas agregadas da dashboard.
  Endpoint usado: GET /dashboard/metricas
*/
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

// Inicializa sequência de carregamento da dashboard (API + Chart.js em paralelo).
function inicializarPaginaDashboard() {
  if (!paginaDashboardAtiva()) {
    return;
  }

  carregarMetricasDashboard();

  // Carrega biblioteca de gráfico em paralelo, sem travar a consulta textual.
  carregarChartJsSeNecessario().then(function (podeInicializar) {
    chartDisponivelDashboard = podeInicializar;
    chartCarregamentoDashboardConcluido = true;
    tentarInicializarGraficoDashboard();
  });
}

// Ponto de entrada da página dashboard.
document.addEventListener("DOMContentLoaded", function () {
  inicializarPaginaDashboard();
});
