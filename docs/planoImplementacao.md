# Plano de implementação — Evolução para questionário de 5 perguntas, resultado por pesos, dashboard ampliada e navegação unificada

## 1) Necessidade tratada

Planejar a evolução do projeto para:
1. questionário dinâmico com 5 perguntas ativas;
2. resultado final por soma de pesos por corrente filosófica;
3. dashboard com métricas diferenciando respostas e participantes;
4. navegação consistente entre páginas;
5. página inicial com história pessoal autorizada e suporte a foto real da tatuagem.

> Este plano **não implementa código**, **não executa SQL** e **não altera estrutura do banco**.

---

## 2) Diagnóstico da implementação atual (base para evolução)

### 2.1 Descoberta e resultado hoje
- A descoberta usa a primeira pergunta ativa por menor ordem (`ativo = 1`, `ORDER BY ordem_exibicao ASC LIMIT 1`).
- A regra atual de resposta única por usuário/pergunta já está protegida por backend e pela restrição de unicidade no banco.
- Resultado pessoal atual é derivado apenas da alternativa da pergunta ativa.

### 2.2 Dashboard hoje
- Dashboard retorna contagem por corrente para a pergunta ativa atual.
- Já existe fallback textual quando o gráfico não está disponível.

### 2.3 Navegação e home hoje
- Navegação ainda não é totalmente consistente entre todas as páginas.
- Home atual apresenta objetivo acadêmico, mas ainda não inclui toda a narrativa pessoal solicitada e a seção da tatuagem com foto real.

### 2.4 Risco principal de compatibilidade
- Existem respostas históricas registradas para apenas uma pergunta ativa.
- Ao ativar mais perguntas, usuários anteriormente “concluídos” ficarão “incompletos” até responder novas perguntas ativas.

---

## 3) Regras propostas (para orientar implementação)

1. **Disponibilidade de pergunta**: `ativo = 1` significa “faz parte do questionário”.
2. **Próxima pergunta do usuário autenticado**: menor `ordem_exibicao` ativa ainda não respondida por ele.
3. **Resposta única**: manter uma resposta por usuário/pergunta (regra atual).
4. **Resultado final**: soma de `peso` das alternativas por `corrente_filosofica`.
5. **Empate**: exibir todas as correntes empatadas no maior valor de soma.
6. **Conclusão**: resultado final concluído apenas quando todas as perguntas ativas estiverem respondidas.
7. **Novas perguntas ativas após conclusão**: usuário volta para estado de questionário incompleto.
8. **Dashboard**:
   - métrica 1: total de respostas registradas;
   - métrica 2: total de usuários participantes (usuários com ao menos uma resposta no conjunto ativo);
   - métrica 3: distribuição por corrente (baseada nas respostas registradas).

---

## 4) Ordem sugerida de implementação (etapas dependentes)

## Etapa 1 — Consolidar regras na especificação (documentação)

### Arquivos previstos
- `docs/especificacao.md`

### Objetivo
Registrar formalmente as regras de questionário dinâmico, resultado por pesos, empate, conclusão, dashboard ampliada, navegação e home com história pessoal autorizada.

### Critérios de aceite
- Especificação atualizada com regras estáveis e sem contradição com restrições técnicas.

### Verificação manual
- Leitura de consistência entre seções de funcionalidade, regras de negócio e critérios de aceite.

---

## Etapa 2 — Dados iniciais de 5 perguntas ativas (arquivo SQL separado)

### Arquivos previstos
- `src/database/scriptDadosIniciaisQuestionario5Perguntas.sql` (novo)

### Objetivo
Preparar script com 5 perguntas ativas e alternativas vinculadas, com reexecução segura (sem duplicar dados).

### Regras e validações
1. Não alterar `script-tabelas.sql`.
2. Não executar SQL automaticamente.
3. Inserções idempotentes com validação por `WHERE NOT EXISTS` (ou estratégia equivalente por chaves naturais definidas no script).
4. Manter coerência entre:
   - `pergunta_filosofica` (enunciado, categoria, ordem_exibicao, ativo);
   - `alternativa_filosofica` (texto, corrente_filosofica, peso, fk_pergunta).

### Critérios de aceite
- Script pode ser executado manualmente mais de uma vez sem duplicar perguntas e alternativas planejadas.
- Script documenta, em comentários curtos, a forma de execução manual no MySQL Workbench.

### Verificação manual
1. Revisar o SQL sem executar.
2. Confirmar presença de 5 perguntas ativas planejadas no arquivo.

---

## Etapa 3 — Experiência do questionário dinâmico na Descoberta

### Arquivos previstos
- `public/descoberta.html`
- `public/js/descoberta.js`
- `src/routes/descoberta.js`
- `src/controllers/descobertaController.js`
- `src/models/descobertaModel.js`

### Objetivo
Transformar a descoberta de “pergunta ativa única” para “próxima pergunta pendente do usuário”.

### Fluxo proposto
1. Carregar “próxima pergunta disponível” para o usuário autenticado.
2. Exibir progresso: `Pergunta X de 5` (ou `X de N` dinâmico pelas ativas).
3. Salvar resposta.
4. Exibir ação clara para continuar para próxima pergunta.
5. Quando não houver pendentes: exibir estado “questionário concluído” e link para resultado.
6. Reabrindo a página: continuar da próxima pendente.

### Validações de backend
1. Sessão válida para rotas privadas.
2. `idAlternativa` obrigatório e válido.
3. Alternativa pertence à pergunta que está sendo respondida.
4. Bloqueio de segunda resposta para a mesma pergunta (`409` + mensagem clara).

### Estados de interface
- carregando;
- sem sessão;
- sem perguntas ativas disponíveis;
- pergunta disponível com progresso;
- resposta salva;
- erro de API;
- questionário concluído.

### Critérios de aceite
- Usuário autenticado responde perguntas em ordem crescente de exibição.
- Não consegue responder duas vezes a mesma pergunta.
- Ao concluir todas as ativas, vê estado concluído sem nova pergunta pendente.

### Verificação manual
1. Entrar com conta de teste.
2. Responder uma pergunta e recarregar a página.
3. Confirmar avanço para a próxima.
4. Repetir até concluir e validar estado final.

---

## Etapa 4 — Cálculo do resultado final por pesos

### Arquivos previstos
- `public/resultado.html`
- `public/js/resultado.js`
- `src/routes/descoberta.js` (reuso de rota existente ou expansão de payload)
- `src/controllers/descobertaController.js`
- `src/models/descobertaModel.js`

### Objetivo
Exibir resultado final apenas quando o questionário estiver completo.

### Regra de cálculo proposta
1. Somar `peso` por `corrente_filosofica` considerando respostas do usuário nas perguntas ativas.
2. Identificar maior soma.
3. Se apenas uma corrente tiver a maior soma: resultado único.
4. Se duas ou mais tiverem a mesma maior soma: resultado em empate com lista de correntes empatadas.

### Estados de interface
- sem sessão;
- questionário incompleto (informar quantas perguntas faltam);
- resultado concluído com corrente única;
- resultado concluído com empate;
- falha de API.

### Compatibilidade com novas perguntas
- Se novas perguntas ativas forem adicionadas após conclusão antiga, a tela de resultado deve voltar a mostrar “incompleto” até novas respostas.

### Critérios de aceite
- Resultado não aparece como concluído antes de 100% das perguntas ativas.
- Empate é exibido sem desempate inventado.

### Verificação manual
1. Conta com respostas parciais: validar estado incompleto.
2. Conta com respostas completas: validar resultado.
3. Cenário de empate: validar lista de correntes empatadas.

---

## Etapa 5 — Dashboard para múltiplas perguntas

### Arquivos previstos
- `public/dashboard.html`
- `public/js/script.js`
- `src/routes/dashboard.js`
- `src/controllers/dashboardController.js`
- `src/models/dashboardModel.js`

### Objetivo
Ampliar métricas para o cenário de questionário com múltiplas perguntas ativas, mantendo simplicidade didática.

### Métricas propostas
1. **Total de respostas registradas** (linhas em `resposta_filosofica` dentro das perguntas ativas).
2. **Total de participantes** (usuários distintos com pelo menos uma resposta nas perguntas ativas).
3. **Distribuição por corrente filosófica** (contagem por corrente com base nas respostas registradas).

### Regras
- Usar apenas dados reais da API.
- Sem conteúdo privado de diário.
- Se gráfico falhar/indisponível, manter resumo textual e lista textual.

### Estados de interface
- sem sessão;
- sem dados;
- com dados;
- falha de API;
- gráfico indisponível com fallback textual.

### Critérios de aceite
- Dashboard deixa claro o significado de cada métrica.
- Total de respostas e total de participantes não são tratados como sinônimos.

### Verificação manual
1. Testar sem sessão (401).
2. Testar com sessão e base vazia (204 ou equivalente).
3. Testar com sessão e base populada.
4. Simular indisponibilidade de Chart.js e validar fallback textual.

---

## Etapa 6 — Navegação consistente entre páginas

### Arquivos previstos
- `public/index.html`
- `public/descoberta.html`
- `public/diario.html`
- `public/resultado.html`
- `public/dashboard.html`
- `public/login.html`
- `public/cadastro.html`
- `public/css/global.css`
- `public/js/script.js` (apenas se necessário para ação de sair em páginas adicionais)

### Objetivo
Padronizar navegação com destaque de página ativa e ação de saída no fluxo existente.

### Regras
1. Páginas autenticadas: links para Início, Descoberta, Diário, Resultado, Dashboard e Sair.
2. Em login/cadastro: manter caminho entre as duas e retorno para Início.
3. Sair deve reutilizar endpoint e fluxo já existente.

### Critérios de aceite
- Usuário encontra as páginas principais sem navegação quebrada.
- Página ativa fica visualmente indicada.

### Verificação manual
1. Navegar por todos os links.
2. Validar destaque da página atual.
3. Validar saída e redirecionamento para login.

---

## Etapa 7 — Página inicial com história pessoal e seção da tatuagem

### Arquivos previstos
- `public/index.html`
- `public/css/global.css`
- `public/assets/img/` (diretório de imagens locais)

### Objetivo
Atualizar home com narrativa em primeira pessoa, conforme fatos fornecidos, e preparar seção visual da tatuagem sem inventar imagem real ausente.

### Conteúdo autorizado
- Filosofia nos momentos difíceis;
- resiliência;
- não desistir dos sonhos;
- explicação dos elementos da tatuagem conforme texto fornecido.

### Requisitos de arquivo para foto real da tatuagem (pendente)
1. Caminho sugerido: `public/assets/img/tatuagem-real.jpg`
2. Formatos aceitos: `.jpg`, `.jpeg` ou `.png`
3. Qualidade mínima recomendada: 1200 px no maior lado.
4. Nome estável (sem acentos/espaços) para facilitar referência no HTML.

### Imagens de apoio (locais)
Opções simples:
1. `public/assets/img/ampulheta-caveira-ilustracao.jpg`
2. `public/assets/img/balanca-coracao-cerebro-ilustracao.jpg`
3. `public/assets/img/maos-criacao-adao-releitura.jpg`

> As imagens de apoio devem ser locais e didáticas. Não usar URLs remotas como substituição da foto real.

### Critérios de aceite
- Texto da home respeita os fatos informados, sem criação de eventos não confirmados.
- Página funciona mesmo antes do envio da foto real (com estado “imagem pendente”).

### Verificação manual
1. Revisar conteúdo textual.
2. Validar carregamento das imagens locais.
3. Validar comportamento quando `tatuagem-real.jpg` ainda não estiver presente.

---

## 5) Ajustes planejados de API/consulta (sem implementação nesta etapa)

### Descoberta
- Evoluir consulta para obter próxima pergunta pendente do usuário.
- Informar progresso total e posição atual.

### Resultado
- Evoluir consulta para agregação por peso e indicação de:
  - incompleto/concluído;
  - corrente vencedora ou lista de empate.

### Dashboard
- Evoluir consulta para retornar:
  - total de respostas;
  - total de participantes;
  - distribuição por corrente.

---

## 6) Riscos e compatibilidade

1. **Respostas antigas de uma pergunta**: ao ativar 5 perguntas, usuários existentes terão progresso parcial.
2. **Mudança de status de concluído para incompleto**: esperado quando novas perguntas ativas forem adicionadas.
3. **Interpretação de métricas**: risco de confundir “respostas” com “participantes” se texto não ficar explícito.
4. **Navegação parcial durante migração**: links podem ficar inconsistentes se a etapa de navegação não for concluída por completo.
5. **Dependência de mídia local**: ausência da foto real da tatuagem deve ser tratada sem quebrar layout.

---

## 7) Checklist de verificação manual final (após implementação futura)

1. Cadastro/login/sair funcionando no mesmo domínio com cookie de sessão.
2. Descoberta avança pergunta a pergunta com progresso visível.
3. Reabertura da descoberta continua da pergunta pendente.
4. Resultado mostra incompleto antes de terminar e concluído ao final.
5. Empate no resultado aparece como empate real.
6. Dashboard mostra respostas, participantes e distribuição com dados reais.
7. Dashboard mantém texto real se gráfico falhar.
8. Navegação consistente em todas as páginas.
9. Home com narrativa pessoal e seção da tatuagem sem inventar fatos.

---

## 8) Limites desta etapa de planejamento

1. Sem execução de SQL.
2. Sem alteração de schema.
3. Sem alteração de código da aplicação.
4. Mudanças desta etapa restritas à documentação (`docs/especificacao.md`, `docs/planoImplementacao.md`, `DiarioDePrompts.md`).
