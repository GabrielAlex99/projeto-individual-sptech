/*
  Arquivo: public/js/resultado.js
  Responsabilidade: carregar e renderizar resultado final da descoberta.
  Organização:
  1) status/progresso;
  2) conteúdo dinâmico das correntes;
  3) renderização de blocos de resultado;
  4) consumo da API de resultado.
*/

// Atualiza mensagem de status principal da página.
function atualizarStatusResultado(mensagem) {
  const status = document.getElementById("status_resultado");

  if (status) {
    status.textContent = mensagem;
  }
}

// Atualiza texto de progresso do questionário na página de resultado.
function atualizarProgressoResultado(mensagem) {
  const progresso = document.getElementById("progresso_resultado");

  if (progresso) {
    progresso.textContent = mensagem || "";
  }
}

// Exibe etiqueta discreta acima do título principal da corrente.
function atualizarEtiquetaTopoResultado(texto) {
  const etiqueta = document.getElementById("etiqueta_topo_resultado");
  if (!etiqueta) {
    return;
  }

  const valor = (texto || "").trim();
  etiqueta.textContent = valor;
  etiqueta.style.display = valor ? "inline-flex" : "none";
}

const CONTEUDO_CORRENTES = {
  Estoicismo: {
    sintese:
      "Você tende a agir com autocontrole e foco no que está ao seu alcance. Em decisões difíceis, privilegia serenidade, disciplina e constância, mesmo diante de incertezas.",
    pensadores:
      "Sêneca — “Não são as coisas que nos perturbam, mas os juízos que fazemos sobre elas.” • Epicteto — “Há coisas que dependem de nós e coisas que não dependem de nós.”",
    pergunta:
      "Em qual situação recente você pode separar melhor o que está sob seu controle do que está fora dele?",
  },
  Existencialismo: {
    sintese:
      "Seu perfil valoriza liberdade, responsabilidade e autenticidade. Você tende a construir sentido a partir das escolhas concretas que faz no cotidiano.",
    pensadores:
      "Jean-Paul Sartre — “Estamos condenados a ser livres.” • Simone de Beauvoir — “Que nada nos limite.”",
    pergunta:
      "Qual decisão atual representa, de forma mais autêntica, quem você escolhe ser?",
  },
  Utilitarismo: {
    sintese:
      "Você costuma avaliar consequências e impacto coletivo antes de decidir. Seu olhar busca ampliar bem-estar e reduzir danos para o maior número de pessoas.",
    pensadores:
      "Jeremy Bentham — “A maior felicidade para o maior número.” • John Stuart Mill — “As ações são corretas na medida em que tendem a promover a felicidade.”",
    pergunta:
      "Que escolha prática você pode fazer hoje para gerar mais benefício coletivo no seu contexto?",
  },
  Racionalismo: {
    sintese:
      "Seu padrão de decisão prioriza coerência lógica, clareza de critérios e consistência de princípios. Você tende a organizar escolhas com base em argumentos bem fundamentados.",
    pensadores:
      "René Descartes — “Penso, logo existo.” • Baruch Spinoza — “A ordem e conexão das ideias é a mesma que a ordem e conexão das coisas.”",
    pergunta:
      "Quais princípios racionais você quer usar como base para a próxima decisão importante?",
  },
};

// Exibe ou oculta bloco de ações quando questionário está incompleto.
function exibirAcoesIncompleto(exibir) {
  const blocoAcoes = document.getElementById("resultado_incompleto_acoes");

  if (blocoAcoes) {
    blocoAcoes.style.display = exibir ? "block" : "none";
  }
}

// Retorna texto didático da corrente filosófica para exibição no glossário.
function obterDescricaoCorrente(correnteFilosofica) {
  const descricoes = {
    Estoicismo: "Valoriza autocontrole, serenidade e foco no que depende de você.",
    Existencialismo: "Destaca liberdade, responsabilidade e construção de sentido pelas escolhas.",
    Utilitarismo: "Prioriza decisões com maior benefício para o maior número de pessoas.",
    Racionalismo: "Enfatiza coerência lógica, princípios racionais e argumentação consistente.",
  };

  return descricoes[correnteFilosofica] || "Corrente filosófica presente no questionário atual.";
}

// Formata pontuação com singular/plural corretos.
function formatarPontuacao(valor) {
  const pontos = Number(valor) || 0;
  return pontos === 1 ? "1 ponto" : `${pontos} pontos`;
}

// Renderiza lista fixa de significados gerais das correntes com destaque da corrente líder.
function renderizarSignificadosCorrentes(correnteLider) {
  const listaSignificados = document.getElementById("significados_correntes_resultado");

  if (!listaSignificados) {
    return;
  }

  const correntes = ["Estoicismo", "Existencialismo", "Utilitarismo", "Racionalismo"];
  listaSignificados.innerHTML = "";

  correntes.forEach(function (corrente) {
    const item = document.createElement("li");
    item.className = "item-significado-corrente";

    if (correnteLider && corrente === correnteLider) {
      item.classList.add("corrente-lider");
    }

    item.innerHTML = `<strong>${corrente}</strong><p>${obterDescricaoCorrente(corrente)}</p>`;
    listaSignificados.appendChild(item);
  });
}

// Renderiza barras de pontuação por corrente retornada pela API.
function renderizarRankingResultado(pontuacoesPorCorrente) {
  const ranking = document.getElementById("ranking_resultado");

  if (!ranking) {
    return;
  }

  ranking.innerHTML = "";

  if (!Array.isArray(pontuacoesPorCorrente)) {
    return;
  }

  const totalPontos = pontuacoesPorCorrente.reduce(function (acumulado, corrente) {
    return acumulado + (Number(corrente.pontuacaoTotal) || 0);
  }, 0);

  const correnteLider = pontuacoesPorCorrente.length > 0 ? pontuacoesPorCorrente[0].correnteFilosofica : "";

  pontuacoesPorCorrente.forEach(function (corrente) {
    const pontos = Number(corrente.pontuacaoTotal) || 0;
    const percentual = totalPontos > 0 ? Math.round((pontos / totalPontos) * 100) : 0;
    const item = document.createElement("article");
    item.className = "item-barra-resultado";

    if (corrente.correnteFilosofica === correnteLider) {
      item.classList.add("corrente-lider");
    }

    item.innerHTML = `
      <div class="item-barra-topo">
        <strong>${corrente.correnteFilosofica}</strong>
        <span>${percentual}% • ${formatarPontuacao(pontos)}</span>
      </div>
      <div class="barra-resultado-trilha">
        <div class="barra-resultado-preenchimento" style="width: ${percentual}%"></div>
      </div>
    `;

    ranking.appendChild(item);
  });
}

// Renderiza conteúdo de aprofundamento da corrente líder.
function renderizarPerfilDetalhado(correnteLider, houveEmpate) {
  const perfil = document.getElementById("perfil_resultado_detalhado");
  if (!perfil) {
    return;
  }

  const conteudo = CONTEUDO_CORRENTES[correnteLider] || {
    sintese: "Seu resultado indica uma corrente presente no questionário atual.",
    pensadores: "Conteúdo de pensadores indisponível no momento.",
    pergunta: "Qual reflexão você quer registrar hoje no seu Diário?",
  };

  perfil.innerHTML = `
    <p class="rotulo-perfil-corrente">Perfil da corrente</p>
    <p>${conteudo.sintese}</p>
    <p><strong>Pensadores e citações:</strong> ${conteudo.pensadores}</p>
    <p><strong>Pergunta para o Diário:</strong> ${conteudo.pergunta}</p>
    ${
      houveEmpate
        ? '<p class="nota-equilibrio-resultado">Houve equilíbrio entre correntes na maior pontuação. O perfil acima usa a primeira corrente líder apenas como referência de leitura.</p>'
        : ""
    }
  `;
}

// Renderiza estado concluído do resultado (único ou empate).
function exibirResultadoConcluido(resultado) {
  const titulo = document.getElementById("corrente_resultado");
  const conteudo = document.getElementById("resultado_conteudo");
  const descricao = document.getElementById("descricao_resultado");
  const empate = document.getElementById("correntes_empate_resultado");
  const blocoJornada = document.getElementById("acoes_resultado_jornada");
  const status = document.getElementById("status_resultado");

  if (!titulo || !conteudo || !descricao || !empate || !blocoJornada || !status) {
    atualizarStatusResultado("Não foi possível exibir seu resultado.");
    return;
  }

  exibirAcoesIncompleto(false);
  blocoJornada.style.display = "flex";
  status.style.display = "none";

  let correntePrincipal = resultado.correnteFilosofica;

  if (resultado.tipoResultado === "empate") {
    correntePrincipal = Array.isArray(resultado.correntesEmpatadas) ? resultado.correntesEmpatadas[0] : "";
    titulo.textContent = correntePrincipal || "Resultado com equilíbrio";
    descricao.textContent = "";
    descricao.style.display = "none";
    empate.textContent = `Correntes empatadas: ${resultado.correntesEmpatadas.join(", ")}.`;
    empate.style.display = "block";
    atualizarEtiquetaTopoResultado("SUAS CORRENTES EM EQUILÍBRIO");
  } else {
    titulo.textContent = resultado.correnteFilosofica;
    descricao.textContent = "";
    descricao.style.display = "none";
    empate.textContent = "";
    empate.style.display = "none";
    atualizarEtiquetaTopoResultado("SUA CORRENTE PREDOMINANTE");
  }

  renderizarPerfilDetalhado(correntePrincipal || resultado.correnteFilosofica, resultado.tipoResultado === "empate");
  atualizarProgressoResultado("");
  renderizarRankingResultado(resultado.pontuacoesPorCorrente);
  renderizarSignificadosCorrentes(correntePrincipal || resultado.correnteFilosofica);
  conteudo.style.display = "block";
  atualizarStatusResultado("");
}

// Renderiza estado incompleto com orientação para continuar na descoberta.
function exibirResultadoIncompleto(resultado) {
  const titulo = document.getElementById("corrente_resultado");
  const conteudo = document.getElementById("resultado_conteudo");
  const botaoDescoberta = document.getElementById("botao_ir_descoberta_resultado");
  const status = document.getElementById("status_resultado");

  if (titulo) {
    titulo.textContent = "Questionário ainda incompleto";
  }

  if (conteudo) {
    conteudo.style.display = "none";
  }

  if (status) {
    status.style.display = "block";
  }

  atualizarEtiquetaTopoResultado("");

  if (botaoDescoberta) {
    botaoDescoberta.textContent = "Continuar na Descoberta";
  }

  exibirAcoesIncompleto(true);
  atualizarProgressoResultado("");
  renderizarSignificadosCorrentes("");
  atualizarStatusResultado(`Ainda faltam ${resultado.faltam} pergunta(s) para concluir o resultado final.`);
}

/*
  Requisição assíncrona para carregar o resultado pessoal da sessão atual.
  Endpoint: GET /descoberta/meu-resultado
*/
function carregarMeuResultado() {
  fetch("/descoberta/meu-resultado", {
    method: "GET",
    credentials: "same-origin",
  })
    .then(function (resposta) {
      if (resposta.status === 401) {
        document.getElementById("corrente_resultado").textContent = "Entre na sua conta";
        document.getElementById("status_resultado").style.display = "block";
        atualizarEtiquetaTopoResultado("");
        exibirAcoesIncompleto(true);
        const botaoDescoberta = document.getElementById("botao_ir_descoberta_resultado");
        if (botaoDescoberta) {
          botaoDescoberta.textContent = "Ir para Descoberta";
        }
        document.getElementById("resultado_conteudo").style.display = "none";
        atualizarProgressoResultado("");
        renderizarSignificadosCorrentes("");
        atualizarStatusResultado("Faça login para consultar seu resultado.");
        return null;
      }

      if (resposta.status === 204) {
        document.getElementById("corrente_resultado").textContent = "Resultado indisponível";
        document.getElementById("status_resultado").style.display = "block";
        atualizarEtiquetaTopoResultado("");
        exibirAcoesIncompleto(true);
        const botaoDescoberta = document.getElementById("botao_ir_descoberta_resultado");
        if (botaoDescoberta) {
          botaoDescoberta.textContent = "Ir para Descoberta";
        }
        document.getElementById("resultado_conteudo").style.display = "none";
        atualizarProgressoResultado("");
        renderizarSignificadosCorrentes("");
        atualizarStatusResultado("Ainda não há perguntas ativas ou pontuação suficiente para cálculo do resultado.");
        return null;
      }

      if (!resposta.ok) {
        throw new Error("Não foi possível carregar seu resultado.");
      }

      return resposta.json();
    })
    .then(function (resultado) {
      if (!resultado) {
        return;
      }

      if (resultado.statusQuestionario === "incompleto") {
        exibirResultadoIncompleto(resultado);
        return;
      }

      exibirResultadoConcluido(resultado);
    })
    .catch(function (erro) {
      console.log("Erro ao carregar resultado pessoal:", erro);
      document.getElementById("corrente_resultado").textContent = "Resultado indisponível";
      document.getElementById("status_resultado").style.display = "block";
      atualizarEtiquetaTopoResultado("");
      exibirAcoesIncompleto(true);
      const botaoDescoberta = document.getElementById("botao_ir_descoberta_resultado");
      if (botaoDescoberta) {
        botaoDescoberta.textContent = "Ir para Descoberta";
      }
      document.getElementById("resultado_conteudo").style.display = "none";
      atualizarProgressoResultado("");
      renderizarSignificadosCorrentes("");
      atualizarStatusResultado("Não foi possível consultar seu resultado no momento.");
    });
}

// Ponto de entrada da tela de resultado.
document.addEventListener("DOMContentLoaded", function () {
  renderizarSignificadosCorrentes("");
  carregarMeuResultado();
});
