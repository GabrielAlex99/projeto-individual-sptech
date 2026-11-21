/*
  Arquivo: public/js/resultado.js
  Responsabilidade: carregar e renderizar resultado final da descoberta.
  Organização:
  1) status/progresso;
  2) renderização de blocos de resultado;
  3) consumo da API de resultado.
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

// Exibe ou oculta bloco de ações quando questionário está incompleto.
function exibirAcoesIncompleto(exibir) {
  const blocoAcoes = document.getElementById("resultado_incompleto_acoes");

  if (blocoAcoes) {
    blocoAcoes.style.display = exibir ? "block" : "none";
  }
}

// Retorna texto didático da corrente filosófica para exibição na tela.
function obterDescricaoCorrente(correnteFilosofica) {
  const descricoes = {
    Estoicismo: "Valoriza autocontrole, serenidade e foco no que depende de você.",
    Existencialismo: "Destaca liberdade, responsabilidade e construção de sentido pelas escolhas.",
    Utilitarismo: "Prioriza decisões com maior benefício para o maior número de pessoas.",
    Racionalismo: "Enfatiza coerência lógica, princípios racionais e argumentação consistente.",
  };

  return descricoes[correnteFilosofica] || "Corrente filosófica presente no questionário atual.";
}

// Renderiza lista fixa de significados gerais das correntes.
function renderizarSignificadosCorrentes() {
  const listaSignificados = document.getElementById("significados_correntes_resultado");

  if (!listaSignificados) {
    return;
  }

  const correntes = ["Estoicismo", "Existencialismo", "Utilitarismo", "Racionalismo"];
  listaSignificados.innerHTML = "";

  correntes.forEach(function (corrente) {
    const item = document.createElement("li");
    item.textContent = `${corrente}: ${obterDescricaoCorrente(corrente)}`;
    listaSignificados.appendChild(item);
  });
}

// Renderiza ranking com pontuação por corrente retornada pela API.
function renderizarRankingResultado(pontuacoesPorCorrente) {
  const ranking = document.getElementById("ranking_resultado");

  if (!ranking) {
    return;
  }

  ranking.innerHTML = "";

  if (!Array.isArray(pontuacoesPorCorrente)) {
    return;
  }

  pontuacoesPorCorrente.forEach(function (corrente) {
    const item = document.createElement("li");
    item.textContent = `${corrente.correnteFilosofica}: ${Number(corrente.pontuacaoTotal)} ponto(s)`;
    ranking.appendChild(item);
  });
}

// Renderiza estado concluído do resultado (único ou empate).
function exibirResultadoConcluido(resultado) {
  const titulo = document.getElementById("corrente_resultado");
  const conteudo = document.getElementById("resultado_conteudo");
  const descricao = document.getElementById("descricao_resultado");
  const empate = document.getElementById("correntes_empate_resultado");
  const explicacaoMetodo = document.getElementById("explicacao_resultado_metodo");
  const explicacaoInterpretacao = document.getElementById("explicacao_resultado_interpretacao");

  if (!titulo || !conteudo || !descricao || !empate || !explicacaoMetodo || !explicacaoInterpretacao) {
    atualizarStatusResultado("Não foi possível exibir seu resultado.");
    return;
  }

  exibirAcoesIncompleto(false);

  if (resultado.tipoResultado === "empate") {
    titulo.textContent = "Resultado final com empate";
    descricao.textContent = `Empate com ${resultado.pontuacaoVencedora} ponto(s) na maior pontuação.`;
    empate.textContent = `Correntes empatadas: ${resultado.correntesEmpatadas.join(", ")}.`;
    empate.style.display = "block";
    explicacaoInterpretacao.textContent =
      "Interpretação: houve equilíbrio entre correntes na maior pontuação. Considere as correntes empatadas em conjunto.";
  } else {
    titulo.textContent = resultado.correnteFilosofica;
    descricao.textContent = `Resultado final concluído com ${resultado.pontuacaoVencedora} ponto(s).`;
    empate.textContent = "";
    empate.style.display = "none";
    explicacaoInterpretacao.textContent = `Interpretação: a corrente líder foi ${resultado.correnteFilosofica}, mas as demais pontuações ajudam a entender nuances do seu perfil de respostas.`;
  }

  explicacaoMetodo.textContent = `Cálculo: soma dos pesos por corrente nas perguntas ativas respondidas (${resultado.totalRespondidas} de ${resultado.totalPerguntasAtivas}).`;
  atualizarProgressoResultado(
    `Questionário concluído: ${resultado.totalRespondidas} de ${resultado.totalPerguntasAtivas} perguntas respondidas.`
  );
  renderizarRankingResultado(resultado.pontuacoesPorCorrente);
  conteudo.style.display = "block";
  atualizarStatusResultado("Resultado calculado de forma educativa com base nas suas respostas registradas.");
}

// Renderiza estado incompleto com orientação para continuar na descoberta.
function exibirResultadoIncompleto(resultado) {
  const titulo = document.getElementById("corrente_resultado");
  const conteudo = document.getElementById("resultado_conteudo");

  if (titulo) {
    titulo.textContent = "Questionário ainda incompleto";
  }

  if (conteudo) {
    conteudo.style.display = "none";
  }

  exibirAcoesIncompleto(true);
  atualizarProgressoResultado(
    `Respondidas: ${resultado.totalRespondidas} de ${resultado.totalPerguntasAtivas} perguntas.`
  );
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
        exibirAcoesIncompleto(false);
        atualizarProgressoResultado("");
        atualizarStatusResultado("Faça login para consultar seu resultado.");
        return null;
      }

      if (resposta.status === 204) {
        document.getElementById("corrente_resultado").textContent = "Resultado indisponível";
        exibirAcoesIncompleto(false);
        atualizarProgressoResultado("");
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
      exibirAcoesIncompleto(false);
      atualizarProgressoResultado("");
      atualizarStatusResultado("Não foi possível consultar seu resultado no momento.");
    });
}

// Ponto de entrada da tela de resultado.
document.addEventListener("DOMContentLoaded", function () {
  renderizarSignificadosCorrentes();
  carregarMeuResultado();
});
