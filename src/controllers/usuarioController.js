const usuarioModel = require("../models/usuarioModel");
const crypto = require("crypto");
const { promisify } = require("util");

const scryptAsync = promisify(crypto.scrypt);
const tamanhoHash = 64;

function emailValido(email) {
    return typeof email === "string" && email.includes("@") && email.includes(".");
}

function senhaValida(senha) {
    return typeof senha === "string" && senha.length >= 6;
}

function ehHashScrypt(valorSenha) {
    return typeof valorSenha === "string" && valorSenha.startsWith("scrypt$");
}

// Gera hash seguro da senha para armazenamento em banco.
async function gerarHashSenha(senhaEmTexto) {
    const salt = crypto.randomBytes(16).toString("hex");
    const n = 16384;
    const r = 8;
    const p = 1;
    const hashBuffer = await scryptAsync(senhaEmTexto, salt, tamanhoHash, { N: n, r: r, p: p });
    return `scrypt$${n}$${r}$${p}$${salt}$${hashBuffer.toString("hex")}`;
}

// Compara a senha recebida com hash scrypt salvo no banco.
async function validarSenhaScrypt(senhaEmTexto, senhaSalva) {
    const partesHash = senhaSalva.split("$");

    if (partesHash.length !== 6) {
        return false;
    }

    const n = Number(partesHash[1]);
    const r = Number(partesHash[2]);
    const p = Number(partesHash[3]);
    const salt = partesHash[4];
    const hashOriginalHex = partesHash[5];

    if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p)) {
        return false;
    }

    const hashOriginalBuffer = Buffer.from(hashOriginalHex, "hex");
    const hashCalculadoBuffer = await scryptAsync(senhaEmTexto, salt, hashOriginalBuffer.length, { N: n, r: r, p: p });

    if (hashOriginalBuffer.length !== hashCalculadoBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(hashOriginalBuffer, hashCalculadoBuffer);
}

// Valida senha de conta nova (hash) e também de conta legada (texto puro).
async function validarSenhaComMigracao(senhaEmTexto, senhaSalva) {
    if (ehHashScrypt(senhaSalva)) {
        return validarSenhaScrypt(senhaEmTexto, senhaSalva);
    }

    return senhaEmTexto === senhaSalva;
}

// Fluxo assíncrono de login com comparação segura de senha.
async function autenticar(req, res) {
    const email = req.body.emailServer ? req.body.emailServer.trim().toLowerCase() : "";
    const senha = req.body.senhaServer ? req.body.senhaServer : "";

    if (!email) {
        return res.status(400).send("Informe o email.");
    }

    if (!senha) {
        return res.status(400).send("Informe a senha.");
    }

    try {
        const resultadoBusca = await usuarioModel.buscarPorEmail(email);

        if (resultadoBusca.length !== 1) {
            return res.status(403).send("Email e/ou senha inválido(s)");
        }

        const usuario = resultadoBusca[0];
        const senhaValidaNoLogin = await validarSenhaComMigracao(senha, usuario.senha);

        if (!senhaValidaNoLogin) {
            return res.status(403).send("Email e/ou senha inválido(s)");
        }

        if (!ehHashScrypt(usuario.senha)) {
            try {
                const novoHash = await gerarHashSenha(senha);
                await usuarioModel.atualizarSenhaHash(usuario.id, novoHash);
            } catch (erroMigracao) {
                console.log("Falha ao migrar senha legada para hash.", erroMigracao.sqlMessage || erroMigracao.message);
            }
        }

        req.session.usuario = {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        };

        return res.json({
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome
        });
    } catch (erro) {
        console.log("Houve um erro ao realizar o login:", erro.sqlMessage || erro.message);
        return res.status(500).send("Não foi possível realizar o login no momento.");
    }
}

// Fluxo assíncrono de cadastro com armazenamento seguro da senha.
async function cadastrar(req, res) {
    const nome = req.body.nomeServer ? req.body.nomeServer.trim() : "";
    const email = req.body.emailServer ? req.body.emailServer.trim().toLowerCase() : "";
    const senha = req.body.senhaServer ? req.body.senhaServer : "";

    if (!nome) {
        return res.status(400).send("Informe o nome.");
    }

    if (!email || !emailValido(email)) {
        return res.status(400).send("Informe um email válido.");
    }

    if (!senhaValida(senha)) {
        return res.status(400).send("A senha deve ter pelo menos 6 caracteres.");
    }

    try {
        const usuarioExistente = await usuarioModel.buscarPorEmail(email);

        if (usuarioExistente.length > 0) {
            return res.status(409).send("Este email já está cadastrado.");
        }

        const senhaHash = await gerarHashSenha(senha);
        const resultado = await usuarioModel.cadastrar(nome, email, senhaHash);
        return res.json(resultado);
    } catch (erro) {
        console.log("Houve um erro ao realizar o cadastro:", erro.sqlMessage || erro.message);
        return res.status(500).send("Não foi possível realizar o cadastro no momento.");
    }
}

function verificarSessao(req, res) {
    if (!req.session || !req.session.usuario || !req.session.usuario.id) {
        return res.status(401).send("Sessão inválida ou expirada.");
    }

    return res.status(200).json({
        id: req.session.usuario.id,
        nome: req.session.usuario.nome,
        email: req.session.usuario.email
    });
}

function encerrarSessao(req, res) {
    if (!req.session) {
        return res.status(200).send("Sessão encerrada.");
    }

    req.session.destroy(function (erro) {
        if (erro) {
            console.log("Erro ao encerrar sessão:", erro.message);
            return res.status(500).send("Não foi possível encerrar a sessão no momento.");
        }

        res.clearCookie("connect.sid");
        return res.status(200).send("Sessão encerrada com sucesso.");
    });
}

module.exports = {
    autenticar,
    cadastrar,
    verificarSessao,
    encerrarSessao
};
