/*
  Arquivo: public/js/script.js
  Responsabilidade: utilitários globais reutilizados em várias páginas.
  Este arquivo NÃO contém regra de negócio específica (auth/diário/dashboard ficam em arquivos próprios).
  Organização:
  1) exibição de erro padrão;
  2) sessão/autenticação para navegação e CTAs globais;
  3) ação global de logout;
  4) efeito visual de revelação.
*/

// Exibe uma mensagem de erro visual no card padrão da página.
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

// Oculta o card de erro padrão da página.
function sumirMensagem() {
  const cardErro = document.getElementById("cardErro");
  if (cardErro) {
    cardErro.style.display = "none";
  }
}

const PAGINAS_INTERNAS_PROTEGIDAS = ["descoberta.html", "diario.html", "resultado.html", "dashboard.html"];

// Limpa dados de sessão mantidos no navegador para evitar estado autenticado residual.
function limparSessaoNavegador() {
  sessionStorage.clear();
}

// Normaliza o caminho final do href para facilitar comparação entre links.
function obterNomeArquivoDoLink(link) {
  if (!link || !link.getAttribute("href")) {
    return "";
  }

  try {
    const url = new URL(link.getAttribute("href"), window.location.href);
    const partes = url.pathname.split("/");
    return (partes[partes.length - 1] || "").toLowerCase();
  } catch (erro) {
    return "";
  }
}

// Identifica o link "Entrar/Login" no menu.
function linkEhEntrar(link) {
  if (!link || link.classList.contains("acao-sair")) {
    return false;
  }

  const nomeArquivo = obterNomeArquivoDoLink(link);
  return nomeArquivo === "login.html";
}

// Identifica links internos que devem depender de sessão.
function linkEhInternoProtegido(link) {
  const nomeArquivo = obterNomeArquivoDoLink(link);
  return PAGINAS_INTERNAS_PROTEGIDAS.includes(nomeArquivo);
}

// Mostra ou oculta um item de navegação.
function atualizarVisibilidadeLink(link, mostrar) {
  if (!link) {
    return;
  }

  link.style.display = mostrar ? "" : "none";
}

// Ajusta links internos para visitantes: mantém menu visível, mas direciona para login.
function atualizarComportamentoLinksInternos(sessaoAtiva) {
  const todosLinksMenu = document.querySelectorAll(".barra-navegacao nav a, .menu-lateral nav a");

  todosLinksMenu.forEach(function (link) {
    if (!linkEhInternoProtegido(link)) {
      return;
    }

    const hrefOriginal = link.dataset.hrefOriginalInterno || link.getAttribute("href") || "";
    if (!link.dataset.hrefOriginalInterno) {
      link.dataset.hrefOriginalInterno = hrefOriginal;
    }

    if (sessaoAtiva) {
      link.setAttribute("href", link.dataset.hrefOriginalInterno);
      return;
    }

    link.setAttribute("href", "login.html");
  });
}

// Remove indicadores já inseridos para evitar duplicação no menu.
function removerIndicadoresUsuario() {
  const indicadores = document.querySelectorAll(".indicador-usuario-nav");
  indicadores.forEach(function (indicador) {
    indicador.remove();
  });
}

// Insere indicador visual discreto com nome do usuário autenticado.
function inserirIndicadorUsuario(nomeUsuario) {
  const nome = (nomeUsuario || "").trim();
  if (!nome) {
    return;
  }

  const menus = document.querySelectorAll(".barra-navegacao nav, .menu-lateral nav");

  menus.forEach(function (menu) {
    const indicador = document.createElement("span");
    indicador.className = "indicador-usuario-nav";
    indicador.textContent = `Olá, ${nome}`;
    menu.appendChild(indicador);
  });
}

// Atualiza menu superior/lateral conforme estado de autenticação validado no servidor.
function atualizarNavegacaoPorSessao(sessaoAtiva, nomeUsuario) {
  const todosLinksMenu = document.querySelectorAll(".barra-navegacao nav a, .menu-lateral nav a");

  todosLinksMenu.forEach(function (link) {
    if (link.classList.contains("acao-sair")) {
      atualizarVisibilidadeLink(link, sessaoAtiva);
      return;
    }

    if (linkEhEntrar(link)) {
      atualizarVisibilidadeLink(link, !sessaoAtiva);
      return;
    }
  });

  atualizarComportamentoLinksInternos(sessaoAtiva);
  removerIndicadoresUsuario();

  if (sessaoAtiva) {
    inserirIndicadorUsuario(nomeUsuario);
  }
}

// Atualiza CTAs da home para cenário visitante x usuário autenticado.
function atualizarCtasHome(sessaoAtiva) {
  const blocoAcoesHome = document.querySelector(".acoes-home");
  if (!blocoAcoesHome) {
    return;
  }

  const botaoPrincipal = blocoAcoesHome.querySelector(".botao-descoberta");
  const linkSecundario = blocoAcoesHome.querySelector(".link-secundario");

  if (!botaoPrincipal || !linkSecundario) {
    return;
  }

  if (sessaoAtiva) {
    botaoPrincipal.textContent = "Ir para Descoberta";
    botaoPrincipal.setAttribute("href", "descoberta.html");
    linkSecundario.textContent = "Acessar meu Diário";
    linkSecundario.setAttribute("href", "diario.html");
    return;
  }

  botaoPrincipal.textContent = "Criar cadastro";
  botaoPrincipal.setAttribute("href", "cadastro.html");
  linkSecundario.textContent = "Já tenho conta";
  linkSecundario.setAttribute("href", "login.html");
}

/*
  Requisição assíncrona para validar sessão no backend.
  Fonte de verdade: GET /usuarios/sessao.
*/
async function obterSessaoServidor() {
  try {
    const resposta = await fetch("/usuarios/sessao", {
      method: "GET",
      credentials: "same-origin",
    });

    if (resposta.status === 401) {
      limparSessaoNavegador();
      return null;
    }

    if (!resposta.ok) {
      throw new Error("Falha ao validar sessão no servidor.");
    }

    const usuario = await resposta.json();

    if (!usuario || !usuario.id) {
      limparSessaoNavegador();
      return null;
    }

    sessionStorage.EMAIL_USUARIO = usuario.email || "";
    sessionStorage.NOME_USUARIO = usuario.nome || "";

    return usuario;
  } catch (erro) {
    console.log("Erro ao validar sessão no carregamento da página:", erro);
    limparSessaoNavegador();
    return null;
  }
}

/*
  Requisição assíncrona para encerrar sessão e limpar dados locais do navegador.
*/
function encerrarSessaoUsuario() {
  fetch("/usuarios/sair", {
    method: "POST",
    credentials: "same-origin",
  })
    .catch(function (erro) {
      console.log("Erro ao encerrar sessão:", erro);
    })
    .finally(function () {
      limparSessaoNavegador();
      window.location = "./index.html";
    });
}

// Liga o clique dos links "Sair" para chamar logout no backend.
function inicializarAcaoSair() {
  const linksSair = document.querySelectorAll(".acao-sair");

  linksSair.forEach(function (linkSair) {
    linkSair.addEventListener("click", function (evento) {
      evento.preventDefault();
      encerrarSessaoUsuario();
    });
  });
}

// Inicializa interface dependente de autenticação sem piscar estados conflitantes.
async function inicializarInterfaceAutenticacao() {
  const usuarioSessao = await obterSessaoServidor();
  const sessaoAtiva = Boolean(usuarioSessao && usuarioSessao.id);
  const nomeUsuario = sessaoAtiva ? usuarioSessao.nome : "";

  atualizarNavegacaoPorSessao(sessaoAtiva, nomeUsuario);
  atualizarCtasHome(sessaoAtiva);
  document.body.classList.add("auth-ui-pronta");
}

// Aplica animação suave de entrada para elementos com classe ".reveal".
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

// Disponibiliza utilitários para outros arquivos JS da aplicação.
window.exibirErro = exibirErro;
window.sumirMensagem = sumirMensagem;
window.encerrarSessaoUsuario = encerrarSessaoUsuario;

document.addEventListener("DOMContentLoaded", function () {
  inicializarAcaoSair();
  inicializarInterfaceAutenticacao();
  inicializarRevelacaoSuave();
});
