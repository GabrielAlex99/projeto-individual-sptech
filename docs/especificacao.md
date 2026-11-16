# Especificação geral do Projeto Filosofia

## 1. Contexto

O Projeto Filosofia é uma aplicação web acadêmica para apoiar o autoconhecimento por meio de perguntas filosóficas, registro de reflexões pessoais e apresentação de informações agregadas em dashboard.

O sistema utiliza HTML, CSS e JavaScript Vanilla no front-end, Node.js com Express no back-end e MySQL como banco relacional. O projeto mantém autenticação por sessão no servidor e separação por camadas (rotas, controladores e modelos).

## 2. Objetivo

Permitir que uma pessoa:
1. crie uma conta e autentique sessão;
2. responda um questionário filosófico curto;
3. consulte seu resultado pessoal com regra explicável;
4. registre reflexões no diário privado;
5. acompanhe métricas agregadas em dashboard sem exposição de dados privados.

## 3. Usuários e acesso

1. **Visitante**: acessa páginas públicas (início, cadastro, login) e navegação pública.
2. **Usuário autenticado**: acessa descoberta, resultado, dashboard e diário com dados da própria sessão.

Toda operação privada deve identificar o usuário por `req.session.usuario.id`.

## 4. Escopo

### 4.1 Dentro do escopo

1. Página inicial com contexto do projeto e caminhos de navegação.
2. Cadastro, login e encerramento de sessão.
3. Diário privado do usuário autenticado.
4. Questionário filosófico com perguntas e alternativas vindas do banco.
5. Resultado pessoal calculado por soma de pesos por corrente filosófica.
6. Dashboard com métricas agregadas reais de respostas e participantes.

### 4.2 Fora do escopo atual

1. Conteúdo de diário público.
2. Compartilhamento automático de reflexões.
3. Painel administrativo avançado.
4. Recomendação por IA.

## 5. Funcionalidades

### 5.1 Cadastro, login e sessão

1. Cadastro com nome, email e senha.
2. Email único por usuário.
3. Senha armazenada em hash.
4. Login com criação de sessão.
5. Saída via fluxo já existente de encerramento de sessão.

### 5.2 Diário pessoal

1. Usuário autenticado pode criar, listar, abrir e excluir apenas as próprias reflexões.
2. O diário permanece privado e não participa das métricas públicas.

### 5.3 Descoberta (questionário dinâmico)

1. A descoberta deve trabalhar com **questionário curto de 5 perguntas ativas** nesta etapa de conteúdo inicial.
2. Regra de disponibilidade: `pergunta_filosofica.ativo = 1` significa pergunta disponível no questionário.
3. Para usuário autenticado, o servidor deve entregar a pergunta disponível com **menor `ordem_exibicao` ainda não respondida** por esse usuário.
4. Cada resposta continua única por usuário e pergunta (restrição existente em `resposta_filosofica`).
5. A interface deve exibir progresso (ex.: `Pergunta 2 de 5`), ação clara para continuar e estado de questionário concluído.
6. Ao reabrir a descoberta, o usuário deve continuar da próxima pergunta sem resposta.
7. A leitura da pergunta atual e alternativas pode permanecer pública; gravação de resposta exige sessão válida.
8. A interface envia apenas `idAlternativa`; usuário e pergunta são resolvidos no backend.

### 5.4 Resultado filosófico

1. O resultado final é calculado pela **soma dos pesos** das alternativas respondidas, agrupados por `corrente_filosofica`.
2. A corrente com maior soma é o resultado.
3. Em empate na maior soma, o resultado deve exibir **todas as correntes empatadas**, sem desempate artificial.
4. O resultado só é exibido como **concluído** quando o usuário responder todas as perguntas ativas.
5. Se houver perguntas ativas pendentes, a tela deve mostrar estado de **questionário incompleto**.
6. Se novas perguntas forem ativadas após uma conclusão anterior, o usuário volta ao estado de incompleto até responder as novas perguntas.

### 5.5 Dashboard

1. A dashboard deve usar dados reais e separar claramente:
   - quantidade de respostas registradas;
   - quantidade de usuários participantes.
2. A dashboard pode manter visual gráfico e fallback textual.
3. O texto da métrica deve explicar o que cada número representa.
4. A dashboard não pode exibir conteúdo privado do diário.

### 5.6 Navegação

1. As páginas autenticadas devem ter navegação consistente para: **Início, Descoberta, Diário, Resultado, Dashboard e Sair**.
2. A navegação deve indicar a página atual.
3. Cadastro e login devem manter caminhos claros entre si e retorno para a página inicial.

### 5.7 Página inicial e história pessoal

1. A página inicial pode apresentar narrativa em primeira pessoa com os fatos informados pelo autor, sem inventar eventos.
2. Texto autorizado nesta etapa:
   - a filosofia ganhou importância nos momentos mais difíceis;
   - ajudou a manter resiliência;
   - ajudou a não desistir dos sonhos.
3. Deve incluir explicação da tatuagem com os significados fornecidos:
   - ampulheta dentro da caveira: tempo de vida se esgotando;
   - “memento mori” acima e “memento vivere” abaixo;
   - mão com balança, coração e cérebro: equilíbrio entre razão e emoção;
   - releitura da criação de Adão com duas mãos, sendo a de Adão em esqueleto.
4. A foto real da tatuagem só pode ser exibida após o arquivo ser adicionado ao projeto.
5. Imagens de apoio devem ser locais (arquivos do projeto), sem dependência de URL remota.

## 6. Regras de negócio

RN01. Rotas privadas devem validar sessão no servidor.

RN02. O usuário autenticado é identificado exclusivamente por sessão.

RN03. Inserções e consultas com entrada externa devem usar parâmetros SQL.

RN04. O diário é privado e não integra métricas da dashboard.

RN05. Cada usuário responde no máximo uma vez cada pergunta (regra já garantida por restrição existente).

RN06. Descoberta deve buscar a pergunta ativa (`ativo = 1`) de menor ordem ainda não respondida pelo usuário.

RN07. Resultado final deve somar `peso` das alternativas por corrente filosófica.

RN08. Empate no maior valor de soma deve retornar todas as correntes empatadas.

RN09. Resultado concluído só existe quando todas as perguntas ativas estiverem respondidas pelo usuário.

RN10. Ativação de novas perguntas após conclusão anterior torna o questionário novamente incompleto para aquele usuário.

RN11. Dashboard deve separar “total de respostas” de “total de participantes”, com definição textual clara.

RN12. Navegação deve manter acesso consistente entre páginas e ação de sair pelo fluxo de sessão já existente.

RN13. Não executar SQL manualmente como parte do fluxo do agente sem solicitação explícita.

## 7. Dados tratados

1. Usuário: nome, email, hash da senha.
2. Reflexão: título, conteúdo, data e autor.
3. Pergunta filosófica: enunciado, categoria, ordem, ativo.
4. Alternativa filosófica: texto, corrente filosófica, peso e pergunta vinculada.
5. Resposta filosófica: usuário, pergunta, alternativa e data da resposta.

## 8. Interface e estados

1. Identidade visual escura/dourada deve ser preservada.
2. Estados mínimos do questionário:
   - carregando;
   - sem sessão;
   - sem pergunta disponível;
   - pergunta disponível com progresso;
   - resposta salva e pronta para avançar;
   - questionário concluído.
3. Estados mínimos do resultado:
   - sem sessão;
   - incompleto;
   - concluído;
   - falha de API.
4. Estados mínimos da dashboard:
   - sem sessão;
   - sem respostas;
   - com dados;
   - falha de API;
   - gráfico indisponível com fallback textual.
5. Conteúdo de usuário deve ser exibido como texto (sem interpretar HTML).

## 9. Padrões técnicos e limites

1. Manter HTML, CSS e JavaScript Vanilla no front-end.
2. Manter Node.js + Express + MySQL no back-end.
3. Preservar arquitetura por camadas já existente.
4. Evitar bibliotecas e abstrações desnecessárias para o nível acadêmico.
5. Não alterar estrutura do banco sem solicitação explícita.

## 10. Critérios gerais de aceitação

CA01. Usuário autenticado avança pergunta a pergunta até completar o questionário ativo.

CA02. Ao reabrir a descoberta, usuário continua da próxima pergunta pendente.

CA03. Resultado final só aparece como concluído após 100% das perguntas ativas respondidas.

CA04. Empates no resultado são exibidos como empate real, sem desempate inventado.

CA05. Dashboard diferencia claramente total de respostas e total de participantes com dados reais.

CA06. Navegação entre páginas é consistente e inclui ação de saída.

CA07. Página inicial pode exibir história pessoal e tatuagem sem inventar fatos e sem usar imagem remota para substituir foto real ausente.

## 11. Pendências

1. Receber arquivo real da foto da tatuagem para publicação na página inicial.
2. Definir o conjunto final das 5 perguntas e textos das alternativas antes da execução manual do script de dados.
3. Validar manualmente todos os estados com sessão autenticada em navegador.

## 12. Uso desta especificação

Esta especificação define regras estáveis do projeto. O plano de implementação deve detalhar etapas, arquivos e validações antes da codificação.
