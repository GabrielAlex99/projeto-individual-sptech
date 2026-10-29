# AGENTS.md

## Visão geral
O projeto é uma aplicação Web-Data-Viz interativa com o tema Filosofia. O objetivo é disponibilizar um formulário de cadastro para mapear a corrente filosófica dos usuários e exibir esses dados de forma agregada e quantificada em uma dashboard funcional através de gráficos dinâmicos.

## Tecnologias
- Front-end: HTML5, CSS3, JavaScript (Vanilla).
- Back-end: Node.js com o framework Express.
- Banco de Dados: MySQL (relacional).
- Integração Visual: API Web-Data-Viz e biblioteca de renderização de gráficos.

## Comandos de Interação
Para o agente OpenCode:
- **"indique..."**: Apenas procure o que foi pedido e devolva uma resposta em texto no prompt, sem fazer alterações nos arquivos da aplicação.
- **"crie..."**: Crie o arquivo ou bloco de código especificado com base na tarefa.
- **"modifique..."**: Faça alterações no que foi pedido, parando a operação para tirar dúvidas caso considere necessário para a assertividade do resultado.

## Arquitetura (Fluxo Web-Data-Viz)
Novos arquivos criados pelo agente devem seguir rigorosamente esta estrutura de 5 passos:
- **Passo 1 (`/public`)**: Arquivos HTML (ex: `cadastro.html`), CSS e JS necessários para que o front-end funcione. Tudo que o usuário vai ver e interagir.
- **Passo 2 (`/src/routes`)**: Rotas e caminhos por onde os dados serão enviados.
- **Passo 3 (`/src/controllers`)**: Validações e regras de negócio pelas quais o dado precisa passar antes de montar a query.
- **Passo 4 (`/src/models`)**: Criação de toda query (INSERT, SELECT, etc.) que será efetuada no banco de dados.
- **Passo 5 (`/src/database/config.js`)**: Configuração e credenciais de banco de dados para efetuar a query montada.

## Padrões de desenvolvimento
- Utilizar `const` por padrão e `let` apenas quando houver necessidade de reatribuição.
- Adotar o padrão `camelCase` para arquivos, variáveis e funções. Nomes de diretórios devem adotar `snake_case` se tiverem mais de uma palavra.
- Queries SQL de inserção devem sempre isolar as variáveis dos comandos para prevenir SQL Injection.

## Cuidados e restrições
- Este projeto tem fins acadêmicos (curso de Análise e Desenvolvimento de Sistemas). Não implemente padrões arquiteturais de nível sênior, complexidade desnecessária ou bibliotecas externas não solicitadas. 
- **Comentários de Código:** O agente deve incluir comentários curtos e explicativos acima de funções assíncronas (`async/await`, `fetch`) e lógicas de banco de dados, para facilitar a compreensão didática do código.
- **Tratamento de Erros:** Sempre inclua blocos `try/catch` ou tratamento `.catch()` em requisições e operações de banco de dados, retornando mensagens de erro claras via `console.log` para facilitar o debug.
- Os arquivos listados no `.gitignore` não devem ser modificados pelo agente.
- O agente nunca deve realizar alterações estruturais no banco de dados, como criar ou excluir tabelas de forma autônoma sem solicitação explícita.

## Regra geral: 
Antes de implementar uma alteração, siga as tecnologias, arquitetura, convenções e restrições descritas neste documento. A cada alteração realizada por você, gere um relatório simples no próprio prompt contendo: 
1) Qual necessidade foi tratada.
2) Quais arquivos foram alterados/adicionados.
3) O que exatamente foi feito no código.
4) O funcionamento esperado da funcionalidade.