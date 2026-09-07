# Axis Product Definition

## Product in One Sentence

Axis é um sistema pessoal de execução para desktop que transforma demandas dispersas e interrupções em uma próxima ação clara, protege o contexto de foco e ajuda o usuário a lembrar, executar e refletir sobre a própria rotina.

## Why Axis Exists

Pessoas que trabalham ou estudam no computador distribuem compromissos, tarefas, lembretes e hábitos entre ferramentas que exigem manutenção constante. Quando o dia muda ou uma interrupção aparece, elas precisam reconstruir o contexto antes de decidir o que fazer. O resultado é esquecimento, planejamento irreal, troca excessiva de contexto e sensação de estar ocupado sem controle.

Axis existe para reduzir essa distância entre intenção e execução. Ele não tenta administrar uma empresa, construir uma base de conhecimento ou maximizar o número de tarefas concluídas. Ele mantém o essencial visível, torna a próxima ação evidente e ajuda o usuário a retomar o ritmo depois de uma interrupção ou de um dia ruim.

## Primary User

O usuário principal é uma pessoa que passa parte importante do dia trabalhando ou estudando no computador e precisa de estrutura pessoal para:

- lembrar compromissos e pequenas informações;
- escolher o que merece atenção agora;
- executar sem abandonar o contexto a cada interrupção;
- manter comportamentos recorrentes;
- perceber padrões e ajustar a rotina.

Profissionais independentes, pessoas em trabalho remoto, estudantes e desenvolvedores são exemplos naturais, mas nenhuma profissão define o produto. Equipes, gestores e organizações não são o público principal.

## Job to Be Done

Quando minha atenção estiver dividida entre tarefas, compromissos e interrupções, quero registrar o que apareceu sem perder o contexto, entender o que vem agora e executar o essencial, para terminar o dia com controle e começar o próximo sabendo o que me espera.

## Product Promise

Axis oferece uma estrutura local-first, rápida e coerente para capturar, organizar no tempo, executar e refletir. O produto deve diminuir a manutenção do próprio sistema de produtividade, não criar outra obrigação para o usuário administrar.

## Core Loop

```text
capturar → organizar no tempo → escolher a próxima ação → focar → encerrar o dia → refletir
```

1. **Capturar** uma nota, tarefa ou evento sem abandonar o trabalho atual.
2. **Organizar no tempo** apenas o que possui data, horário ou lembrete.
3. **Escolher a próxima ação** a partir de compromissos, intenção diária e capacidade disponível.
4. **Focar** em uma intenção ou tarefa, registrando interrupções sem trocar de contexto.
5. **Encerrar o dia** reconhecendo o que avançou e antecipando os compromissos de amanhã.
6. **Refletir** sobre consistência, carga, foco e recuperação com apoio do buddy.

## Definition of User Success

Axis considera que o usuário teve sucesso quando ele:

- entende rapidamente o que precisa fazer;
- protege ao menos um período relevante de foco;
- executa o que definiu como essencial;
- não perde compromissos importantes;
- mantém ou recupera comportamentos recorrentes;
- encerra o dia sabendo o que vem amanhã.

Volume bruto não define sucesso. Uma tarefa essencial pode importar mais que vinte tarefas pequenas. Descanso planejado não é fracasso. A avaliação considera a relação entre intenção, contexto e execução.

## Product Model

### Today

`Hoje` é a superfície principal do Axis. Ela apresenta, em hierarquia controlada:

1. próximo compromisso;
2. próxima ação recomendada;
3. tarefas de hoje;
4. hábitos previstos;
5. notas com lembrete;
6. entrada para o modo Foco;
7. uma reação discreta do buddy, quando relevante.

O usuário pode ocultar ou reorganizar áreas secundárias, mas o produto preserva a sequência operacional. `Hoje` não é uma grade totalmente livre de widgets.

### Notes

Uma nota é um post-it rápido: texto breve, marcador visual, fixação e lembrete opcional. Ela pode permanecer sem data ou aparecer no Calendário quando possuir lembrete.

Notas não formam uma base de conhecimento. Árvore complexa de pastas, annotations, split panes, editor/preview e gestão de vault não fazem parte do núcleo. Markdown pode continuar como detalhe de armazenamento, migração ou exportação, sem definir a experiência.

### Tasks

Uma tarefa é uma ação simples com:

- título;
- estado aberto ou concluído;
- data e horário opcionais;
- lembrete opcional;
- observação breve opcional.

Tarefas datadas aparecem no Calendário; tarefas sem data permanecem na lista de execução. Projetos complexos, Kanban, dependências, estimativas, múltiplos níveis de subtarefas e fluxos extensos de status não fazem parte do núcleo.

GitHub pode atuar como fonte opcional de tarefas. O usuário conecta a conta, escolhe uma issue atribuída a ele e cria uma tarefa vinculada que pode iniciar uma sessão de Foco. O Axis não importa todas as issues nem altera o estado delas automaticamente na primeira versão da integração.

### Calendar and Events

Um evento é um compromisso com data, horário e duração. O Calendário é uma visão temporal unificada; ele não transforma todos os itens em eventos nem possui cópias independentes deles.

- Clicar em um dia inicia uma criação associada àquela data.
- O usuário pode criar um evento, uma tarefa datada ou uma nota com lembrete.
- Um evento pode originar uma tarefa ou nota relacionada sem conversão obrigatória.
- Notas e tarefas sem data não aparecem no Calendário.
- Hábitos não ocupam o Calendário automaticamente.

Com Google Calendar conectado, eventos criados no Axis são sincronizados automaticamente e mantêm cache local. Eventos criados ou alterados no Google aparecem no Axis. Tarefas e notas permanecem dados do Axis e são apenas sobrepostas à linha temporal. Falhas de integração nunca bloqueiam o calendário local.

### Habits

Um hábito é um comportamento recorrente, não uma tarefa repetida nem um evento. Ele aparece em `Hoje` quando previsto, aceita estados simples como completo, mínimo ou pausado e alimenta a análise de consistência. Pode possuir lembrete opcional sem preencher o Calendário.

### Focus

Foco é a etapa de execução, não um timer isolado. O usuário pode iniciar imediatamente com o último modo utilizado, sem preencher uma intenção obrigatória. Quando a sessão parte de uma tarefa, evento ou hábito, o Axis preenche esse contexto; quando parte diretamente de Foco ou de um atalho, a intenção permanece opcional. Pomodoro é uma técnica configurável dentro desse modo, não a identidade do produto.

### Analysis and Buddy

Análise interpreta a rotina e responde:

> Como meu comportamento está evoluindo e o que merece ajuste?

Ela considera compromisso, consistência, foco, carga do calendário, recuperação e, futuramente, distrações durante sessões. A avaliação pode julgar o comportamento e usar gamificação, mas precisa explicar sua composição e nunca confundir volume com qualidade.

O buddy é um pet-companheiro exigente e justo. Ele reage emocionalmente aos dados, celebra progresso, cobra padrões ruins, reconhece sobrecarga e acompanha recuperações. Seu habitat principal é Análise, com aparições pontuais em `Hoje` e no encerramento diário. A primeira versão usa regras locais e determinísticas; não depende de IA externa.

## Daily Closure and Reminders

Ao encerrar o dia, o Axis resume o que aconteceu e antecipa amanhã. Se o usuário não executar o encerramento até um horário configurado, um lembrete automático pode atuar como segurança enquanto o Axis estiver ativo ou na bandeja.

Compromissos podem gerar notificações nativas antecipadas. Eventos importados do Google não duplicam notificações do Google por padrão. Preferências de lembrete devem ser compreensíveis, reversíveis e respeitar as permissões do sistema operacional.

## Product Layers and Scope

### Layer 1 — Foundation

- definição do produto e linguagem canônica;
- sistema visual compartilhado;
- temas `light`, `dark` e `cream`;
- acessibilidade e comportamento desktop;
- contratos locais de dados e privacidade.

### Layer 2 — Daily Loop

- superfície `Hoje`;
- notas estilo post-it;
- tarefas simples;
- calendário unificado e Google Calendar;
- modo Foco contextual;
- encerramento do dia e lembretes.

### Layer 3 — Reflection

- hábitos recorrentes;
- análise transparente de comportamento;
- modelo de avaliação e gamificação;
- explicação dos sinais e recomendações.

### Layer 4 — Companion

- identidade visual e personalidade do buddy;
- reações em Análise;
- aparições contextuais em `Hoje` e no encerramento;
- possível evolução da interface do Quick Pane, preservando captura rápida.

### Layer 5 — Context Intelligence

- monitoramento opcional durante sessões de foco;
- observação nativa do aplicativo e título da janela, sem extensão;
- classificação local de contexto e distrações;
- análise semanal e mensal pelo buddy.

Cada camada depende da anterior. Companion e monitoramento não devem ser construídos antes de o ciclo diário, os dados e a avaliação estarem estáveis.

## Context Monitoring Contract

O monitoramento futuro é uma capacidade opcional e explícita do Axis. Ele funciona somente durante sessões de foco e usa aplicativo e título da janela por melhor esforço. Nenhuma instalação ou extensão separada é exigida.

- O usuário entende e ativa a função conscientemente.
- Um indicador visível informa quando ela está ativa.
- O processamento e a classificação são locais.
- Pesquisas, títulos e URLs completas não são persistidos pelo Axis.
- Apenas categorias, duração, estado AFK e trocas de contexto alimentam Análise.
- Navegação privada não é monitorada intencionalmente.
- No macOS, permissões de Acessibilidade podem ser necessárias.
- A função pode ser pausada, apagada ou desativada a qualquer momento.

ActivityWatch é referência técnica para a abordagem de watchers, mas não será uma instalação obrigatória, um servidor incorporado ou uma dependência de runtime do usuário.

## Non-Negotiable Constraints

- **Desktop-first**: Windows e macOS são as experiências principais; o produto não é um SaaS web adaptado.
- **Local-first**: tarefas, notas, hábitos, foco e calendário local funcionam offline e sem conta.
- **Optional integrations**: Google Calendar e qualquer serviço futuro complementam, mas não desbloqueiam o núcleo.
- **Private by default**: dados pessoais e avaliações permanecem no dispositivo; nenhuma telemetria remota é ativada por padrão.
- **User ownership**: dados podem ser exportados, apagados e desconectados.
- **Explainable judgment**: avaliações e reações do buddy mostram os sinais que as produziram.
- **Accessible**: WCAG AA, navegação por teclado, foco visível e redução de movimento são baseline.
- **Coherent design**: todas as superfícies e janelas usam a mesma linguagem, tokens e comportamento de tema.

## Aesthetic Direction

- Minimalismo editorial premium para desktop.
- Tom calmo, direto, confiável e controlado.
- Tipografia e hierarquia antes de decoração.
- Superfícies sólidas com neumorfismo contido: painéis elevados, campos rebaixados e estados pressionados usam sombras neutras próprias de cada tema, apoiadas por divisórias precisas.
- Profundidade nunca usa gradientes, vidro, halos coloridos ou baixo contraste; o accent continua reservado para foco, seleção, ação e estado.
- Três temas: `light`, `dark` e `cream`.
- Três accents selecionáveis: `blue`, `purple` e `red`, independentes do tema; azul é o padrão.
- Cores e movimento comunicam estado, identidade ou feedback; não preenchem espaço arbitrariamente.
- O buddy pode adicionar expressão e afeto sem infantilizar o restante do aplicativo.

O brief visual detalhado está em [`.design/theme-habits-analytics/DESIGN_BRIEF.md`](.design/theme-habits-analytics/DESIGN_BRIEF.md).

## Explicitly Out of Scope

- colaboração em equipe, organizações, permissões ou atribuição de trabalho;
- gestão de projetos complexa;
- base de conhecimento ou editor Markdown completo;
- substituição do Google Calendar como serviço de calendário;
- analytics remota ou venda de dados comportamentais;
- IA externa obrigatória para o buddy;
- monitoramento silencioso ou permanente fora do modo Foco;
- bloquear sites ou policiar o computador sem uma escolha explícita do usuário;
- experiência mobile equivalente ao aplicativo desktop nesta fase.
