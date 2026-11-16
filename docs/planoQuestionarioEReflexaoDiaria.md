# Plano de implementação — Repetição de questionário por tentativa + Reflexão Diária opcional com IA

## 1) Necessidade tratada
Planejar, sem implementação, duas evoluções:
1. permitir que a mesma pessoa refaça o questionário filosófico sem apagar nem misturar tentativas anteriores;
2. oferecer reflexão diária opcional, com estado emocional informado pelo usuário e sugestão de pergunta via IA.

O plano mantém separação entre:
- **questionário de correntes filosóficas** (descoberta/resultado/dashboard);
- **reflexão diária** (diário + sugestão IA).

> Este documento não implementa código, não executa SQL e não altera arquivos de ambiente.

---

## 2) Revisão do estado atual (esquema e modelos existentes)

### 2.1 Esquema atual relevante
- `resposta_filosofica` possui `UNIQUE (fk_usuario, fk_pergunta)`.
- `diario` guarda apenas `titulo`, `conteudo`, `data_registro`, `fk_usuario`.
- Não há tabela/coluna de tentativa do questionário.
- Não há tabela/coluna específica para reflexão diária com IA.

### 2.2 Modelos/consultas atuais relevantes
- `descobertaModel` calcula progresso/resultado considerando respostas ativas do usuário no conjunto atual de perguntas.
- `dashboardModel` agrega dados globais das respostas ativas (totais, participantes, concluintes, progresso por pergunta e distribuição por corrente).
- `diarioModel` opera no diário privado tradicional (listar/publicar/deletar), sem fluxo IA.

### 2.3 Conclusão técnica
- Com a restrição atual (`fk_usuario, fk_pergunta` único), não é possível manter histórico de múltiplas tentativas sem mistura.
- Para cumprir “refazer questionário preservando histórico”, há dependência indispensável de alteração de esquema.

---

## 3) Proposta didática para tentativas de questionário (sem implementar agora)

### 3.1 Identificador de tentativa
- Introduzir uma entidade simples de tentativa (ex.: `tentativa_questionario`).
- Associar cada resposta a uma tentativa (ex.: `fk_tentativa`).
- Ajustar unicidade para contexto da tentativa (`usuario + pergunta + tentativa`).

### 3.2 Efeito esperado
- Cada tentativa vira um recorte fechado de respostas.
- Descoberta e resultado passam a operar sobre a **tentativa ativa**.
- Tentativas antigas permanecem consultáveis como histórico.

---

## 4) Reflexão diária opcional com IA (sem implementação agora)

### 4.1 Princípios
1. Recurso voluntário (opt-in explícito).
2. Finalidade de apoio à reflexão pessoal.
3. Sem diagnóstico, aconselhamento clínico ou substituição de apoio profissional.
4. Sugestão personalizada sem promessa de ineditismo absoluto.

### 4.2 Privacidade e envio
- Não enviar diário completo.
- Não enviar dados de outras pessoas.
- Enviar apenas dados mínimos do próprio usuário no momento.
- Exibir consentimento claro e opção de não usar IA.

### 4.3 Regras técnicas planejadas
- Chamada à IA somente via backend Node.js.
- Credencial via variável de ambiente.
- Limite de tamanho de entrada e saída.
- Controle de repetição de chamadas (cooldown/limite diário).
- Timeout, fallback e mensagem clara em indisponibilidade.

---

## 5) Decisões pendentes (não decidir automaticamente)

### DP01 — Recorte das métricas da dashboard
Definir se a dashboard deve:
1. considerar **todas as tentativas** (agregado histórico), ou
2. considerar somente a **tentativa mais recente por participante**.

Impacto:
- altera regra de agregação no model/controlador da dashboard;
- altera interpretação textual das métricas na interface.

### DP02 — Persistência da reflexão diária IA
Definir se pergunta e resposta da reflexão diária:
1. serão persistidas, ou
2. existirão apenas durante a sessão.

Se persistir, definir também:
- como recuperar a mesma reflexão durante o dia (chave por usuário + data);
- política de expiração/reuso no mesmo dia.

### DP03 — Provedor, limite de uso e consentimento
Definir:
1. qual provedor/modelo será usado;
2. qual limite de uso (por usuário/período);
3. qual texto de consentimento será exibido antes do envio à IA.

### DP04 — Preservação dos dados atuais na futura migração
Definir como as respostas existentes serão associadas a uma tentativa histórica (ex.: “Tentativa inicial”) sem perda de dados.

Impacto:
- etapa de migração obrigatória antes de liberar “nova tentativa” para usuários existentes.

---

## 6) Etapas pequenas de implementação (futuras)

### Etapa 1 — Contrato funcional (sem IA e sem esquema)
1. Definir UX de “Nova tentativa” e histórico de tentativas.
2. Definir UX da reflexão diária opcional com consentimento.
3. Definir payloads de API (sem codar).

### Etapa 2 — Migração e esquema de tentativa (dependência indispensável)
1. Criar estrutura de tentativa.
2. Associar respostas à tentativa.
3. Migrar respostas existentes para tentativa histórica.
4. Revisar índices e unicidade.

### Etapa 3 — Descoberta por tentativa
1. Buscar próxima pergunta pendente da tentativa ativa.
2. Registrar resposta por tentativa.
3. Exibir estado de tentativa atual no front.

### Etapa 4 — Resultado por tentativa
1. Calcular resultado na tentativa ativa.
2. Exibir histórico resumido de tentativas.
3. Preservar estados incompleto/concluído/empate por tentativa.

### Etapa 5 — Dashboard conforme decisão DP01
1. Implementar regra escolhida para agregação.
2. Ajustar definição textual de métricas na tela.

### Etapa 6 — Reflexão diária sem provedor definido
1. Coleta voluntária de sentimento + consentimento.
2. Fallback local quando IA não for usada.

### Etapa 7 — Integração IA após DP03
1. Endpoint protegido no backend.
2. Limites de chamada/tamanho e timeout.
3. Tratamento de indisponibilidade com mensagens claras.

---

## 7) Critérios de aceite (planejados)

### Tentativas de questionário
- Usuário inicia nova tentativa sem apagar histórico.
- Respostas/resultados não se misturam entre tentativas.
- Regra de resposta única vale por pergunta **dentro da tentativa**.

### Reflexão diária opcional
- Uso sem IA continua possível.
- Uso da IA exige consentimento.
- Não há envio de diário completo/terceiros.
- Fallback claro quando IA indisponível.

---

## 8) Riscos e mitigação
1. **Migração de dados legados**  
   Mitigação: migração com validação por contagem e plano de rollback.
2. **Complexidade extra de consultas**  
   Mitigação: consultas didáticas e índices mínimos necessários.
3. **Indisponibilidade/latência da IA**  
   Mitigação: timeout curto + fallback + limites.
4. **Privacidade**  
   Mitigação: minimização de payload + consentimento explícito.

---

## 9) Testes manuais necessários (quando implementar)

1. Concluir tentativa A, iniciar B e validar isolamento entre A/B.
2. Validar resultado por tentativa ativa e histórico.
3. Validar dashboard conforme regra definida em DP01.
4. Validar reflexão diária com e sem consentimento.
5. Simular indisponibilidade da IA e validar fallback/mensagens.

---

## 10) Separação por dependência

### Pode ser feito sem serviço de IA
- UX de consentimento, estados de tela e fallback local.
- Contratos de API/documentação.

### Exige escolha de provedor
- Chamada real à IA, limites de uso e texto final de consentimento.

### Exige alteração de esquema
- Repetição de questionário sem mistura de histórico.
- Persistência robusta da reflexão diária (se aprovada em DP02).
