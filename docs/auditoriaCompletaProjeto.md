# Auditoria completa de conformidade — Projeto Filosofia

## 1) Referências utilizadas (obrigatórias)

1. `Pesquisa e Inovação - Projeto Individual 2026-2.pdf` (escopo acadêmico e limites).
2. Diretório `web-data-viz/` (arquitetura de referência da API).
3. `AGENTS.md` (convenções técnicas, restrições e padrão de desenvolvimento).

---

## 2) Escopo auditado

Foram auditados todos os diretórios da raiz do projeto:

- `public/`
- `src/`
- `docs/`
- `DOCUMENTOS_DE_APOIO/`
- `web-data-viz/` (somente como referência técnica)
- arquivos da raiz (`app.js`, `package.json`, `DiarioDePrompts.md`, PDF de orientação etc.)

Itens excluídos da análise de código da aplicação:

- `node_modules/` (dependências de terceiros)
- `.git/` e metadados internos

---

## 3) Diagnóstico de conformidade encontrado

### 3.1 Conformidades gerais identificadas

- Projeto mantém stack exigida: HTML/CSS/JS Vanilla + Node.js/Express + MySQL.
- Arquitetura em camadas está preservada no backend (`routes` → `controllers` → `models`).
- Fluxos principais do escopo (cadastro/login, descoberta, resultado, diário e dashboard) estão presentes.
- Uso de sessão para rotas protegidas está implementado.

### 3.2 Pontos de não conformidade/complexidade encontrados (antes da refatoração)

1. **Complexidade elevada no front-end**
   - `public/js/script.js` concentrava múltiplas responsabilidades (auth + diário + dashboard + utilitários), dificultando manutenção e explicação didática.

2. **Baixa legibilidade em parte da API**
   - Rotas com wrappers repetitivos e controllers legados com estilo inconsistente.

3. **Risco de SQL Injection em arquivos legados**
   - `src/models/empresaModel.js`, `src/models/aquarioModel.js` e `src/models/medidaModel.js` usavam interpolação direta em SQL.

4. **Erro funcional em query legada**
   - Insert inválido em `src/models/aquarioModel.js` (`INSERT INTO` com ordem/estrutura incorreta).

5. **Schema misturado com seed no mesmo arquivo**
   - `src/database/script-tabelas.sql` estava acumulando criação de tabelas e dados iniciais, gerando ruído e duplicidade com scripts de seed separados.

---

## 4) Refatorações aplicadas

## 4.1 Front-end (simplificação e organização)

- `public/js/script.js` foi reduzido para utilitários globais:
  - erro visual (`exibirErro`);
  - logout (`encerrarSessaoUsuario`);
  - efeito de revelação.
- Novos arquivos criados por responsabilidade:
  - `public/js/auth.js` (login/cadastro/feedback de senha);
  - `public/js/diario.js` (sessão + CRUD de reflexões no diário);
  - `public/js/dashboard.js` (métricas + gráficos + fallback textual).
- HTML atualizado para carregar somente scripts necessários por tela:
  - `public/login.html`
  - `public/cadastro.html`
  - `public/diario.html`
  - `public/dashboard.html`

## 4.2 Backend (clareza didática e segurança)

- Padronização de rotas com ligação direta para métodos dos controllers:
  - `src/routes/*.js` relevantes.
- `app.js` reorganizado com:
  - `const` por padrão;
  - validação explícita de `SESSION_SECRET`;
  - carga de middlewares e rotas mais clara.
- Controllers refatorados com `async/await` e `try/catch`:
  - `src/controllers/diarioController.js`
  - `src/controllers/dashboardController.js`
  - `src/controllers/empresaController.js`
  - `src/controllers/aquarioController.js`
  - `src/controllers/medidaController.js`
- Models legados com query parametrizada:
  - `src/models/empresaModel.js`
  - `src/models/aquarioModel.js`
  - `src/models/medidaModel.js`
- Configuração de banco simplificada e saneada:
  - `src/database/config.js`

## 4.3 Banco (separação de responsabilidade)

- `src/database/script-tabelas.sql` ficou dedicado somente ao schema.
- Seeds mantidos em arquivos próprios:
  - `src/database/scriptDadosIniciaisDescoberta.sql`
  - `src/database/scriptDadosIniciaisQuestionario5Perguntas.sql`

> Não houve execução automática de SQL e não houve alteração estrutural autônoma no banco em runtime.

---

## 5) Estado final por diretório

## 5.1 `public/`
- Estrutura de páginas preservada.
- Scripts organizados por contexto de uso.
- Código mais simples para explicar em banca (cada tela com seu arquivo JS principal).

## 5.2 `src/`
- Camadas mantidas.
- Rotas e controllers mais consistentes.
- Queries legadas sensíveis ajustadas para padrão parametrizado.

## 5.3 `docs/`
- Documentação de auditoria adicionada.
- Documentos de planejamento e especificação preservados.

## 5.4 `web-data-viz/`
- Mantido como referência técnica original.
- Não usado como runtime principal da aplicação.

---

## 6) Pendências/observações finais

1. Ainda existem arquivos legados da base web-data-viz (aquário/empresa/medida) que não fazem parte do fluxo principal atual do projeto de Filosofia.
2. Recomenda-se validação manual visual fim a fim (com sessão real) para comprovação final antes da apresentação.
3. Recomenda-se manter o `DiarioDePrompts.md` atualizado a cada nova alteração até a banca.

---

## 7) Conclusão da auditoria

Após a refatoração aplicada, o projeto ficou:

- mais aderente ao escopo acadêmico do PDF;
- mais alinhado ao padrão arquitetural de referência web-data-viz;
- mais didático para explicação de cada camada e de cada arquivo JS na apresentação.
