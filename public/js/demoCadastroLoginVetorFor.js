/*
  Arquivo: public/js/demoCadastroLoginVetorFor.js
  Responsabilidade: demonstração didática de vetor e laço for.
  Observação: este arquivo é apenas exemplo de aula e não integra o fluxo real da aplicação.
*/

// Vetor inicial simulando registros de usuários.
const usuarios = [
  { nome: "Usuario A", email: "usuarioa@exemplo.com" },
  { nome: "Usuario B", email: "usuariob@exemplo.com" }
];

console.log("Vetor inicial:", usuarios);

// Cadastro (exemplo didático)
const nomeNovoCadastro = "Usuario C";
const emailNovoCadastro = "usuarioc@exemplo.com";

// Flag para verificar se o e-mail já existe.
let emailJaCadastrado = false;

// Percorre vetor para comparar e-mail informado com e-mails já existentes.
for (let i = 0; i < usuarios.length; i++) {
  if (usuarios[i].email === emailNovoCadastro) {
    emailJaCadastrado = true;
  }
}

if (emailJaCadastrado) {
  console.log("Cadastro: email já existe no vetor.");
} else {
  usuarios.push({ nome: nomeNovoCadastro, email: emailNovoCadastro });
  console.log("Cadastro: usuário adicionado no vetor.");
}

console.log("Vetor após cadastro:", usuarios);

// Login (exemplo didático)
const emailInformadoNoLogin = "usuarioc@exemplo.com";

// Flags de retorno do "login" didático.
let loginEncontrado = false;
let nomeDoLogin = "";

// Percorre vetor para localizar usuário pelo e-mail.
for (let i = 0; i < usuarios.length; i++) {
  if (usuarios[i].email === emailInformadoNoLogin) {
    loginEncontrado = true;
    nomeDoLogin = usuarios[i].nome;
  }
}

if (loginEncontrado) {
  console.log("Login: usuário encontrado no vetor ->", nomeDoLogin);
} else {
  console.log("Login: email não encontrado no vetor.");
}
