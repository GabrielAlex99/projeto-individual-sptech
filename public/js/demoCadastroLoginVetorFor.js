const usuarios = [
  { nome: "Usuario A", email: "usuarioa@exemplo.com" },
  { nome: "Usuario B", email: "usuariob@exemplo.com" }
];

console.log("Vetor inicial:", usuarios);

// Cadastro (exemplo didático)
const nomeNovoCadastro = "Usuario C";
const emailNovoCadastro = "usuarioc@exemplo.com";

let emailJaCadastrado = false;

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

let loginEncontrado = false;
let nomeDoLogin = "";

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
