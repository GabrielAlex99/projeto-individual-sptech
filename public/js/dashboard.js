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
let distribuicaoCorrentesPorPerguntaDashboardCarregada = null;
let graficoCorrentesDashboard = null;
let graficoProgressoPerguntasDashboard = null;
const CORES_CORRENTES_DASHBOARD = {
  Estoicismo: "#d8b46a",
  Existencialismo: "#9e8a58",
  Utilitarismo: "#6f6550",
  Racionalismo: "#4f4a41",
};
const ORDEM_CORRENTES_DASHBOARD = ["Estoicismo", "Existencialismo", "Utilitarismo", "Racionalismo"];

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

// Formata quantidade com singular/plural correto para "resposta/respostas".
function formatarQuantidadeRespostas(totalRespostas) {
  const total = Number(totalRespostas) || 0;
  return total === 1 ? "1 resposta" : `${total} respostas`;
}

// Ordena as perguntas ativas por ordem de exibição para manter sequência P1 -> P5.
function ordenarProgressoPerguntas(progressoPorPergunta) {
  if (!Array.isArray(progressoPorPergunta)) {
    return [];
  }

  return progressoPorPergunta.slice().sort(function (a, b) {
    const ordemA = Number(a && a.ordemExibicao) || 0;
    const ordemB = Number(b && b.ordemExibicao) || 0;
    return ordemA - ordemB;
  });
}

// Normaliza nome de corrente para evitar divergência por maiúsculas, acentos e espaços.
function normalizarCorrenteDashboard(corrente) {
  const textoCorrente = String(corrente || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const mapaCorrentes = {
    estoicismo: "Estoicismo",
    existencialismo: "Existencialismo",
    utilitarismo: "Utilitarismo",
    racionalismo: "Racionalismo",
  };

  return mapaCorrentes[textoCorrente] || "";
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
  resumo.style.display = exibir ? "grid" : "none";
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
    item.textContent = `${metrica.correnteFilosofica}: ${formatarQuantidadeRespostas(metrica.totalRespostas)}`;
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

  const progressoOrdenado = ordenarProgressoPerguntas(progressoPorPergunta);

  progressoOrdenado.forEach(function (itemPergunta) {
    const item = document.createElement("li");
    const ordemPergunta = Number(itemPergunta.ordemExibicao);
    const identificadorPergunta = Number.isFinite(ordemPergunta) && ordemPergunta > 0 ? `P${ordemPergunta}` : "Pergunta";
    const enunciadoPergunta = itemPergunta.enunciado || "Enunciado indisponível";
    item.textContent = `${identificadorPergunta} — ${enunciadoPergunta}: ${formatarQuantidadeRespostas(
      itemPergunta.totalRespostas
    )}`;
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
  Monta datasets empilhados por corrente, respeitando ordem das perguntas ativas (P1 até P5).
  Correntes sem resposta em uma pergunta recebem valor zero para evitar desalinhamento visual.
*/
function montarDatasetsEmpilhadosPorCorrente(progressoPorPergunta, distribuicaoCorrentesPorPergunta) {
  const totaisPorPerguntaCorrente = {};

  if (Array.isArray(distribuicaoCorrentesPorPergunta)) {
    distribuicaoCorrentesPorPergunta.forEach(function (item) {
      const ordemPerguntaBruta =
        item && item.ordemExibicao !== undefined ? item.ordemExibicao : item && item.ordem_exibicao;
      const correnteBruta =
        item && item.correnteFilosofica !== undefined ? item.correnteFilosofica : item && item.corrente_filosofica;
      const totalRespostasBruto =
        item && item.totalRespostas !== undefined ? item.totalRespostas : item && item.total_respostas;
      const ordemPergunta = Number(ordemPerguntaBruta);
      const corrente = normalizarCorrenteDashboard(correnteBruta);
      const totalRespostas = Number(totalRespostasBruto) || 0;

      if (!Number.isFinite(ordemPergunta) || ordemPergunta <= 0 || !corrente) {
        return;
      }

      const chavePergunta = `P${ordemPergunta}`;
      if (!totaisPorPerguntaCorrente[chavePergunta]) {
        totaisPorPerguntaCorrente[chavePergunta] = {};
      }

      totaisPorPerguntaCorrente[chavePergunta][corrente] =
        (Number(totaisPorPerguntaCorrente[chavePergunta][corrente]) || 0) + totalRespostas;
    });
  }

  return ORDEM_CORRENTES_DASHBOARD.map(function (corrente) {
    return {
      label: corrente,
      data: progressoPorPergunta.map(function (itemPergunta) {
        const ordemPergunta = Number(itemPergunta.ordemExibicao);
        const chavePergunta = Number.isFinite(ordemPergunta) && ordemPergunta > 0 ? `P${ordemPergunta}` : "";
        return Number(totaisPorPerguntaCorrente[chavePergunta]?.[corrente]) || 0;
      }),
      backgroundColor: CORES_CORRENTES_DASHBOARD[corrente] || "#2f2f33",
      borderColor: "#111114",
      borderWidth: 1,
      maxBarThickness: 46,
      categoryPercentage: 0.68,
      barPercentage: 0.82,
    };
  });
}

/*
  Monta gráfico de barras empilhadas por pergunta ativa.
  Entrada: array com progresso por pergunta + distribuição por corrente em cada pergunta.
*/
function inicializarGraficoProgressoPerguntas(progressoPorPergunta, distribuicaoCorrentesPorPergunta) {
  const graficoProgresso = document.getElementById("graficoProgressoPerguntas");

  if (!window.Chart || !graficoProgresso) {
    return false;
  }

  const progressoOrdenado = ordenarProgressoPerguntas(progressoPorPergunta);

  try {
    if (graficoProgressoPerguntasDashboard) {
      graficoProgressoPerguntasDashboard.destroy();
    }

    graficoProgressoPerguntasDashboard = new Chart(graficoProgresso, {
      type: "bar",
      data: {
        labels: progressoOrdenado.map(function (itemPergunta) {
          return `P${Number(itemPergunta.ordemExibicao)}`;
        }),
        datasets: montarDatasetsEmpilhadosPorCorrente(progressoOrdenado, distribuicaoCorrentesPorPergunta),
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: {
              color: "#e7e3d5",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              color: "#e7e3d5",
              precision: 0,
              stepSize: 1,
            },
            grid: {
              color: "rgba(255, 255, 255, 0.08)",
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (contexto) {
                const corrente = contexto.dataset?.label || "Corrente";
                const quantidade = Number(contexto.raw) || 0;
                return `${corrente}: ${formatarQuantidadeRespostas(quantidade)}`;
              },
            },
          },
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
  const graficoProgressoCriado = inicializarGraficoProgressoPerguntas(
    progressoPerguntasDashboardCarregado,
    distribuicaoCorrentesPorPerguntaDashboardCarregada
  );

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
        distribuicaoCorrentesPorPerguntaDashboardCarregada = null;
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
          distribuicaoCorrentesPorPergunta: [],
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
      const distribuicaoCorrentesPorPergunta = Array.isArray(metricas.distribuicaoCorrentesPorPergunta)
        ? metricas.distribuicaoCorrentesPorPergunta
        : [];
      const totalRespostas = Number(metricas.totalRespostas) || 0;
      const totalParticipantes = Number(metricas.totalParticipantes) || 0;
      const totalConcluintes = Number(metricas.totalConcluintes) || 0;
      const correnteLider = calcularCorrenteLiderDashboard(distribuicaoPorCorrente);
      const avisoAmostra = obterAvisoAmostraDashboard(totalParticipantes);

      metricasDashboardCarregadas = distribuicaoPorCorrente;
      progressoPerguntasDashboardCarregado = progressoPorPergunta;
      distribuicaoCorrentesPorPerguntaDashboardCarregada = distribuicaoCorrentesPorPergunta;

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
      distribuicaoCorrentesPorPerguntaDashboardCarregada = null;
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
