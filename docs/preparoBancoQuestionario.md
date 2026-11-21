# Preparo do banco para apresentação do questionário

## Objetivo
Documentar a ordem correta de preparação **sem executar SQL automaticamente**.

> Este documento **não confirma** que as 5 perguntas já estão no seu MySQL atual.  
> Ele apenas explica **como preparar**.

---

## 1) Criar estrutura das tabelas (schema)

Executar primeiro:

- `src/database/script-tabelas.sql`

Esse arquivo contém somente criação de tabelas do projeto.

---

## 2) Escolher o script de dados iniciais

Você deve escolher conforme o cenário de demonstração:

### Opção A — cenário mínimo (1 pergunta)
- `src/database/scriptDadosIniciaisDescoberta.sql`

### Opção B — cenário da banca (5 perguntas)
- `src/database/scriptDadosIniciaisQuestionario5Perguntas.sql`

Para apresentar o fluxo completo de progresso e resultado com 5 perguntas, use a **Opção B**.

---

## 3) Ordem recomendada (manual)

1. Executar `script-tabelas.sql`;
2. Executar o script de dados escolhido (A ou B);
3. Iniciar a aplicação e validar os estados na interface.

---

## 4) Observações importantes

- Não executar os scripts automaticamente pelo código da aplicação.
- Não alterar estrutura de banco sem solicitação explícita.
- Se quiser comprovar no Workbench quantas perguntas ativas existem, faça consulta manual no seu ambiente local.
