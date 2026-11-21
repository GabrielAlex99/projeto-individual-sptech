/*
  Arquivo: public/js/auth.js
  Responsabilidade: fluxo de autenticação (login e cadastro) no front-end.
  Organização deste arquivo:
  1) Helpers visuais de formulário;
  2) Fluxo de login;
  3) Fluxo de cadastro;
  4) Feedback didático de força de senha.
*/

// Flags para bloquear múltiplos envios simultâneos.
let loginEmAndamento = false;
let cadastroEmAndamento = false;

/*
  Bloco: atualização de status visual do formulário
  Entrada: id do elemento e mensagem
  Saída: altera o texto na tela, sem retorno
*/
function atualizarStatusFormulario(idStatus, mensagem) {
  const status = document.getElementById(idStatus);

  if (!status) {
    return;
  }

  status.textContent = mensagem || "";
}

/*
  Bloco: estado visual durante envio de formulário
  O que faz:
  - desabilita/habilita botão;
  - alterna loading;
  - atualiza status textual opcional.
*/
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

/*
  Bloco: sanitização de mensagens de erro
  Objetivo: evitar mostrar termos técnicos de banco/servidor para o usuário final.
*/
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

/*
  Bloco: LOGIN
  Passo a passo:
  1) valida campos de entrada;
  2) envia requisição POST /usuarios/autenticar;
  3) em sucesso, guarda dados básicos no sessionStorage;
  4) redireciona para diario.html.
*/
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

  if (!emailVar || !senhaVar) {
    window.exibirErro("Preencha email e senha para continuar.");
    atualizarStatusFormulario("status_formulario_login", "Preencha os campos para enviar.");
    return false;
  }

  window.sumirMensagem();
  loginEmAndamento = true;
  atualizarEstadoEnvioFormulario(
    "botao_entrar",
    "div_aguardar",
    "status_formulario_login",
    true,
    textoBotaoPadrao,
    "Enviando dados de login..."
  );

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
        return resposta.json().then(function (usuario) {
          sessionStorage.EMAIL_USUARIO = usuario.email;
          sessionStorage.NOME_USUARIO = usuario.nome;
          atualizarStatusFormulario("status_formulario_login", "Login realizado. Redirecionando...");

          setTimeout(function () {
            window.location = "./diario.html";
          }, 1000);
        });
      }

      if (resposta.status === 401 || resposta.status === 403) {
        window.exibirErro("Email ou senha incorretos.");
        atualizarStatusFormulario("status_formulario_login", "Falha de autenticação.");
        return null;
      }

      window.exibirErro("Não foi possível concluir o login no momento.");
      atualizarStatusFormulario("status_formulario_login", "Falha ao realizar login.");
      return null;
    })
    .catch(function (erro) {
      console.log("Erro ao autenticar:", erro);
      window.exibirErro("Erro de conexão. Verifique sua internet e tente novamente.");
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

/*
  Bloco: CADASTRO
  Passo a passo:
  1) valida campos e confirmação de senha;
  2) envia POST /usuarios/cadastrar;
  3) mostra status de sucesso ou erro;
  4) redireciona para login em caso de sucesso.
*/
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

  if (!nomeVar || !emailVar || !senhaVar || !confirmacaoSenhaVar) {
    window.exibirErro("Preencha todos os campos para continuar.");
    atualizarStatusFormulario("status_formulario_cadastro", "Preencha os campos para enviar.");
    return false;
  }

  if (senhaVar !== confirmacaoSenhaVar) {
    window.exibirErro("A confirmação de senha não corresponde.");
    atualizarStatusFormulario("status_formulario_cadastro", "As senhas informadas não correspondem.");
    return false;
  }

  window.sumirMensagem();
  cadastroEmAndamento = true;
  atualizarEstadoEnvioFormulario(
    "botao_cadastrar",
    "div_aguardar",
    "status_formulario_cadastro",
    true,
    textoBotaoPadrao,
    "Enviando dados de cadastro..."
  );

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
        window.sumirMensagem();
        atualizarStatusFormulario("status_formulario_cadastro", "Cadastro realizado com sucesso! Redirecionando para login...");

        setTimeout(function () {
          window.location = "login.html";
        }, 1200);
        return;
      }

      window.exibirErro(obterMensagemCadastroSegura(retorno.mensagemServidor));
      atualizarStatusFormulario("status_formulario_cadastro", "Falha ao concluir cadastro.");
    })
    .catch(function (erro) {
      console.log("Erro ao cadastrar:", erro);
      window.exibirErro("Erro de conexão. Não foi possível concluir o cadastro.");
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

/*
  Bloco: cálculo de força da senha
  Regra didática:
  - tamanho + diversidade de caracteres (letra, número, símbolo).
*/
function calcularNivelForcaSenha(senha) {
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

/*
  Bloco: feedback visual da senha
  O que mostra:
  - força da senha;
  - se senha e confirmação estão iguais.
*/
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

  if (!confirmacaoSenhaInput.value) {
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

// Inicializa os eventos "input" para atualizar feedback em tempo real.
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

// Expõe funções no escopo global para uso no onclick dos HTMLs.
window.entrar = entrar;
window.cadastrar = cadastrar;

// Inicialização específica desta camada de autenticação.
document.addEventListener("DOMContentLoaded", function () {
  inicializarFeedbackSenhaCadastro();
});
