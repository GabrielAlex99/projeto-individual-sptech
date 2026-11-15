# Plano de implementação — Registro de resposta na Descoberta

## 1) Necessidade tratada
Registrar no banco de dados a alternativa escolhida por um usuário autenticado na tela de descoberta, reaproveitando a pergunta ativa e as alternativas já carregadas pela funcionalidade atual.

## 2) Pré-requisitos (obrigatórios)
1. Deve existir **uma pergunta ativa** em `pergunta_filosofica`.
2. Devem existir **alternativas cadastradas** para a pergunta ativa em `alternativa_filosofica`.
3. O usuário deve estar autenticado com sessão válida no servidor.

> Observação: este plano **não** cria dados e **não** insere dados de apoio manualmente.

## 3) Análise da implementação atual (resumo)
- A tela de descoberta já busca pergunta ativa e alternativas em `GET /descoberta/pergunta-ativa`.
- A sessão autenticada já existe via `express-session` e é acessível por `req.session.usuario.id`.
- O middleware `src/middlewares/autenticacao.js` já valida sessão.
- A tabela `resposta_filosofica` já possui restrição `UNIQUE (fk_usuario, fk_pergunta)`, permitindo somente uma resposta por usuário por pergunta.
- Ainda não existe endpoint para gravar a resposta da descoberta.

## 4) Arquivos envolvidos
1. **Interface**
   - `public/js/descoberta.js` (enviar apenas `idAlternativa`, tratar retorno e mensagem pós-registro)
   - `public/descoberta.html` (remover link clicável para `resultado.html` nesta etapa)
2. **Rota**
   - `src/routes/descoberta.js` (nova rota de gravação)
3. **Controlador**
   - `src/controllers/descobertaController.js` (nova ação para validar e coordenar gravação)
4. **Modelo**
   - `src/models/descobertaModel.js` (consultas parametrizadas para validações e insert)
5. **Middleware existente (reuso)**
   - `src/middlewares/autenticacao.js` (aplicar apenas na nova rota de gravação)

## 5) Fluxo da funcionalidade (interface → rota → controlador → modelo)
1. Usuário clica em uma alternativa na descoberta.
2. A interface envia `POST /descoberta/responder` com body contendo **somente**:
   - `{ "idAlternativa": <numero_inteiro> }`
3. A rota de gravação aplica `autenticacao.validarSessao` **somente nesse endpoint**.
4. No controlador:
   - obtém `idUsuario` da sessão (`req.session.usuario.id`);
   - valida `idAlternativa`;
   - solicita ao model a pergunta ativa;
   - valida se a alternativa pertence à pergunta ativa;
   - verifica se já existe resposta do usuário para essa pergunta;
   - se não existir, solicita insert da resposta;
   - se ocorrer erro de duplicidade MySQL (`ER_DUP_ENTRY`), retorna `409` com a mesma mensagem de resposta já registrada, sem expor detalhes internos.
5. No model:
   - executa queries parametrizadas (`?`) para:
     - buscar pergunta ativa;
      - validar vínculo alternativa ↔ pergunta ativa;
      - verificar resposta existente do usuário;
      - inserir nova resposta.
6. O controlador retorna a mensagem adequada para cada cenário.
7. Após sucesso, a interface informa que a resposta foi registrada e que o resultado dinâmico será conectado em etapa futura, sem redirecionar para `resultado.html`.

## 6) Validações obrigatórias
1. **Sessão válida**:
   - usuário identificado exclusivamente por `req.session.usuario.id`.
2. **Entrada da interface**:
   - `idAlternativa` obrigatório, inteiro e maior que zero.
3. **Pergunta ativa existente**:
   - se não houver, não grava.
4. **Alternativa válida para pergunta ativa**:
   - rejeitar alternativa inexistente ou de outra pergunta.
5. **Resposta repetida**:
   - se já houver resposta do usuário para a pergunta, manter resposta original e não editar.
6. **Duplicidade também tratada no erro de gravação**:
   - além da verificação prévia, se o MySQL retornar `ER_DUP_ENTRY`, responder `409` com mensagem de já respondida.
7. **Persistência segura**:
   - consultas parametrizadas em todas as queries com entrada externa.

## 7) Respostas planejadas da API
1. **Sucesso (resposta registrada)**  
   - Status: `201`  
   - Mensagem: `"Resposta registrada com sucesso."`

2. **Sessão ausente/expirada**  
   - Status: `401`  
   - Mensagem: `"Sessão inválida ou expirada. Faça login novamente."`

3. **Alternativa inválida / sem pergunta ativa / dados inválidos**  
   - Status: `400`  
   - Mensagens possíveis:
     - `"Dados da resposta inválidos."`
     - `"Nenhuma pergunta ativa disponível para resposta."`
     - `"Alternativa inválida para a pergunta ativa."`

4. **Resposta repetida (já respondida)**  
   - Status: `409`  
   - Mensagem: `"Você já respondeu a pergunta ativa. A resposta original foi mantida."`

5. **Erro interno**  
   - Status: `500`  
   - Mensagem: `"Não foi possível registrar a resposta no momento."`

> Regra complementar de tratamento: se o insert falhar com `ER_DUP_ENTRY`, retornar exatamente o mesmo cenário de resposta repetida (`409` + mesma mensagem), sem repassar `sqlMessage` ao cliente.

## 8) Impactos nas telas atuais
- **`descoberta.html` / `public/js/descoberta.js`**:
  - passa a registrar resposta ao clicar em alternativa;
  - exibe feedback de sucesso, erro, sessão ausente e resposta repetida;
  - remove navegação clicável para `resultado.html` enquanto o resultado dinâmico não existir;
  - após salvar com sucesso, mostra mensagem: resposta registrada e resultado será conectado em etapa futura.
- **Demais telas**:
  - sem alteração funcional nesta etapa (`resultado.html`, dashboard, diário, login/cadastro).

## 9) Etapas numeradas com validação simples
1. **Criar endpoint de gravação na rota de descoberta**
   - Validação simples: chamada sem sessão retorna `401`.

2. **Aplicar middleware de sessão apenas na nova rota**
   - Validação simples: `GET /descoberta/pergunta-ativa` continua público; `POST /descoberta/responder` exige sessão.

3. **Adicionar ação no controlador para salvar resposta**
   - Validação simples: body sem `idAlternativa` retorna `400`.

4. **Adicionar queries parametrizadas no model**
   - Validação simples: todas as chamadas ao banco usam placeholders `?` com array de parâmetros.

5. **Validar alternativa pertence à pergunta ativa**
   - Validação simples: enviar alternativa de outra pergunta retorna `400`.

6. **Validar resposta repetida sem edição**
   - Validação simples: segunda tentativa para mesma pergunta retorna `409` e não altera registro existente.

7. **Tratar duplicidade vinda do MySQL no insert**
   - Validação simples: em cenário de concorrência/falha de duplicidade (`ER_DUP_ENTRY`), retorno também é `409` com a mesma mensagem de já respondida.

8. **Registrar nova resposta quando válida**
   - Validação simples: primeira resposta válida retorna `201`.

9. **Remover avanço para resultado estático na descoberta**
   - Validação simples: não existe link/botão navegável para `resultado.html` nessa tela durante esta etapa.

10. **Exibir mensagens na interface conforme retorno**
   - Validação simples: status visual da descoberta muda corretamente para sucesso/erro/sessão/repetição e, no sucesso, informa que o resultado será conectado futuramente.

## 10) Regras e restrições atendidas
- Uso de sessão do servidor para identificar usuário autenticado.
- Não confiar em `idUsuario` ou `idPergunta` vindos da interface.
- Interface envia somente `idAlternativa`.
- Uma resposta por usuário/pergunta respeitando regra existente do banco.
- Sem edição de resposta nesta etapa.
- Duplicidade tratada em duas camadas: verificação prévia + fallback de erro `ER_DUP_ENTRY`.
- Sem alteração de esquema de banco e sem execução manual de SQL.
- Sem incluir cálculo de resultado, alteração da tela de resultado ou conexão da dashboard.

## 11) Dúvidas que impedem seguir as decisões
No momento, **não há dúvidas impeditivas** para implementação conforme as decisões fornecidas.
