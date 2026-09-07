# Information Architecture: Axis Desktop

## Structural Goal

Axis organiza um único ciclo pessoal de execução:

```text
capturar → organizar no tempo → escolher o próximo passo → focar → encerrar o dia → refletir
```

A arquitetura mantém `Hoje` como superfície principal, oferece acesso direto aos recursos que também funcionam de forma independente e usa painéis contextuais para detalhes. O produto não cria hierarquias profundas, projetos ou páginas isoladas para integrações.

## Priority of User Tasks

Em ordem de frequência e importância:

1. Entender o que merece atenção agora.
2. Começar ou retomar uma sessão de Foco.
3. Consultar compromissos e o restante do dia.
4. Capturar uma tarefa, nota ou evento sem perder o contexto.
5. Concluir tarefas e registrar hábitos previstos.
6. Organizar itens futuros e configurar lembretes.
7. Encerrar o dia e antecipar amanhã.
8. Analisar padrões e escolher um ajuste para o próximo período.
9. Configurar comportamentos permanentes e integrações opcionais.

`Hoje` deve concentrar aproximadamente 80% do uso cotidiano. Tarefas, Notas, Calendário, Hábitos e Foco permanecem destinos diretos porque também precisam atender usos independentes da rotina diária.

## Site Map

Axis é um aplicativo Tauri com navegação por estado, não um site com rotas de navegador. Cada entrada abaixo inclui um destino lógico estável para substituir ou orientar os IDs atuais de `AppPage`.

- Onboarding `flow:onboarding`
- Aplicativo principal `window:main`
  - Hoje `page:today`
    - Agora
    - Seu dia
    - Hábitos de hoje
    - Captura rápida
    - Encerramento diário
  - Tarefas `page:tasks`
    - Hoje `filter:today`
    - Próximas `filter:upcoming`
    - Sem data `filter:undated`
    - Concluídas `filter:completed`
    - Detalhes da tarefa `sheet:task-detail`
    - Seleção de issue do GitHub `sheet:github-issue-source`
  - Notas `page:notes`
    - Todas `filter:all`
    - Com lembrete `filter:reminder`
    - Arquivadas `filter:archived`
    - Edição rápida `sheet:note-detail`
  - Calendário `page:calendar`
    - Semana `view:week`
    - Mês `view:month`
    - Criação temporal `sheet:calendar-create`
    - Detalhes do item `sheet:calendar-item`
  - Hábitos `page:habits`
    - Ativos `filter:active`
    - Pausados `filter:paused`
    - Criação e edição `sheet:habit-detail`
  - Foco `page:focus`
    - Sessão atual
    - Modo e controles
    - Configuração rápida
    - Preferências avançadas `preferences:focus`
  - Análise `page:analysis`
    - Diagnóstico do buddy
    - Sustentadores do ritmo
    - Obstáculos
    - Próximo ajuste
    - Indicadores
    - Explicação do indicador `sheet:analysis-detail`
  - Configurações `overlay:preferences`
    - Geral `preferences:general`
    - Aparência `preferences:appearance`
    - Notificações `preferences:notifications`
    - Calendário e integrações `preferences:integrations`
    - Foco `preferences:focus`
    - Privacidade e dados `preferences:privacy`
  - Superfícies globais
    - Controle de foco ativo `overlay:focus-controller`
    - Paleta de comandos `overlay:command-palette`
    - Encerramento diário `overlay:daily-closure`
    - Toasts e confirmações `overlay:feedback`
- Captura rápida `window:quick-capture`
- Notificação do sistema `entry:native-notification`

### Current-to-Target Page Mapping

| Estado atual | Destino proposto | Decisão                                                     |
| ------------ | ---------------- | ----------------------------------------------------------- |
| `grid`       | `today`          | Substituir a grade livre por uma página diária curada.      |
| `tasks`      | `tasks`          | Manter, simplificando conteúdo e filtros.                   |
| `notes`      | `notes`          | Manter, substituindo o vault por post-its rápidos.          |
| `calendar`   | `calendar`       | Promover à navegação principal.                             |
| `habits`     | `habits`         | Manter para gestão de recorrências.                         |
| `pomodoro`   | `focus`          | Renomear a capacidade; Pomodoro vira um modo interno.       |
| `analytics`  | `analysis`       | Renomear e reorganizar ao redor de diagnóstico explicável.  |
| `kanban`     | —                | Remover da nova arquitetura.                                |
| `github`     | —                | Remover como página; manter como fonte opcional de tarefas. |
| `slack`      | —                | Remover da nova arquitetura.                                |

## Navigation Model

### Primary Navigation

A barra lateral principal contém, nesta ordem:

1. Hoje
2. Tarefas
3. Notas
4. Calendário
5. Hábitos
6. Foco
7. Análise

O máximo inicial é sete destinos. Todos permanecem em um único nível, usam rótulo e ícone acessíveis e preservam a posição entre páginas. Em largura compacta, a barra pode mostrar apenas ícones com tooltip, sem alterar a ordem.

### Secondary Navigation

- Tarefas, Notas e Hábitos usam filtros locais, não subpáginas.
- Calendário usa um seletor entre Semana e Mês; a última preferência é preservada.
- Análise usa seletor de período e seções expansíveis.
- Configurações usa abas verticais internas.
- Detalhes, criação e explicações abrem em painel modal deslizante, mantendo a página de origem visível.

O painel deslizante é uma camada contextual, não um segundo nível persistente de navegação. Ao fechar, foco e posição de rolagem retornam ao elemento de origem.

### Utility Navigation

No rodapé da barra lateral:

- Captura rápida, incluindo indicação do atalho global.
- Configurações.

Conexões de conta não formam uma navegação própria. Estado e identidade de Google ou GitHub aparecem em Configurações → Calendário e integrações.

### Desktop Window Behavior

- A inicialização normal abre `Hoje`.
- Reabrir o aplicativo pela bandeja durante a mesma sessão restaura página, painel e contexto anteriores.
- Uma sessão de foco ativa tem prioridade de restauração e mantém um controle compacto disponível em todas as páginas.
- O atalho global abre a janela de captura sem navegar ou ativar desnecessariamente a janela principal.
- Clicar em notificação abre a página relacionada e o painel contextual do item.
- Não existe uma experiência mobile equivalente nesta fase.

## Content Hierarchy

### Hoje

Uma página vertical contínua, sem abas e sem grade livre de widgets.

1. **Agora** — próximo compromisso, próxima ação sugerida e início imediato de Foco.
2. **Seu dia** — eventos, tarefas e lembretes em sequência temporal.
3. **Hábitos de hoje** — registro rápido apenas do que está previsto.
4. **Captura rápida** — entrada breve para tarefa, nota ou evento.
5. **Encerrar o dia** — balanço do essencial e antecipação de amanhã.

Áreas secundárias podem ser recolhidas ou reordenadas dentro de limites definidos pelo produto, mas `Agora` e `Seu dia` mantêm prioridade fixa.

### Tarefas

1. **Criar e buscar** — captura direta antes de gerenciamento.
2. **Filtros** — Hoje, Próximas, Sem data e Concluídas.
3. **Lista de execução** — título, estado e informação temporal essencial.
4. **Painel de detalhes** — data, horário, lembrete, nota curta, origem e ação Iniciar foco.
5. **Fonte GitHub** — seleção intencional de uma issue para criar tarefa vinculada.

A tarefa não ganha página própria, projeto, Kanban, dependências, estimativa ou múltiplos estados.

### Notas

1. **Captura imediata** — campo breve no topo.
2. **Fixadas** — post-its que precisam permanecer visíveis.
3. **Mural ordenado** — notas restantes por atualização recente, sem posicionamento manual obrigatório.
4. **Busca e filtros** — Todas, Com lembrete e Arquivadas.
5. **Edição rápida** — texto, marcador visual, fixação, lembrete e vínculo temporal opcional.

Não há árvore de pastas, editor/preview, split pane ou navegação de vault no núcleo.

### Calendário

1. **Controle temporal** — período atual, Hoje, anterior/próximo e seletor Semana/Mês.
2. **Semana** — visualização padrão para horários, duração e carga real.
3. **Mês** — visão de planejamento e acesso rápido a uma data.
4. **Itens unificados** — eventos locais/Google, tarefas datadas e notas com lembrete, sem perder seus tipos.
5. **Estado de sincronização** — discreto, acionável apenas em falha ou conflito.

Clicar em um espaço da Semana preenche data e horário. Clicar em um dia do Mês preenche a data. A criação começa como Evento, mas permite mudar o tipo para Tarefa ou Nota. A Agenda não é uma terceira visualização inicial porque `Hoje` já cumpre essa função.

### Hábitos

1. **Hábitos ativos** — recorrências que o usuário mantém.
2. **Criação e edição** — nome, frequência, dias, horário/lembrete e marcador.
3. **Pausados** — itens preservados fora da execução cotidiana.
4. **Histórico curto** — contexto suficiente para gerenciar a recorrência.
5. **Entrada para Análise** — tendências profundas e julgamento permanecem fora desta página.

O registro dos hábitos previstos ocorre em `Hoje`; a página Hábitos não duplica uma grande visão diária.

### Foco

1. **Sessão atual ou Iniciar rápido** — um clique inicia com o último modo utilizado.
2. **Contexto opcional** — herdado de tarefa, evento ou hábito quando disponível; editável sem interromper a sessão.
3. **Modo** — Pomodoro, cronômetro livre ou duração definida.
4. **Controles** — iniciar, pausar, concluir ou abandonar.
5. **Configuração rápida** — duração, intervalo, som e notificações da sessão.
6. **Preferências avançadas** — atalho para os padrões permanentes em Configurações.

Uma sessão iniciada sem contexto recebe o rótulo neutro `Sessão de foco`. Ao concluir, o Axis pode pedir contexto de forma opcional e não bloqueante. O histórico aprofundado fica em Análise.

### Análise

1. **Período** — semana, mês ou intervalo aplicável.
2. **Diagnóstico do buddy** — avaliação curta, exigente, justa e explicável.
3. **O que sustentou o ritmo** — sinais positivos relevantes.
4. **O que atrapalhou** — compromisso, interrupção, carga, inconsistência ou recuperação insuficiente.
5. **Próximo ajuste recomendado** — uma ação concreta e alcançável.
6. **Indicadores detalhados** — foco, hábitos, tarefas, calendário e recuperação.
7. **Contexto de distrações** — futuro, somente após o monitoramento opcional existir.

Selecionar diagnóstico, sinal ou indicador abre um painel deslizante para explicar a origem, comparar períodos e interagir com a recomendação. A página não se fragmenta em abas de métricas inicialmente.

### Configurações

1. **Geral** — idioma, inicialização, bandeja e comportamento do aplicativo.
2. **Aparência** — temas `light`, `dark` e `cream` e preferências de movimento.
3. **Notificações** — lembretes, encerramento diário e alertas de eventos.
4. **Calendário e integrações** — Google Calendar, GitHub e estados de conexão/sincronização.
5. **Foco** — padrões de Pomodoro, intervalos, som e automações.
6. **Privacidade e dados** — exportação, exclusão e futuro monitoramento de atividade.

Configurações permanentes ficam aqui; ajustes da sessão corrente permanecem na página Foco.

## User Flows

### Começar o dia

1. Usuário inicia o Axis.
2. O aplicativo abre em Hoje.
3. `Agora` mostra próximo compromisso e uma próxima ação explicável.
4. Usuário pode:
   - iniciar Foco com o contexto sugerido;
   - abrir o compromisso;
   - escolher outra tarefa;
   - continuar examinando Seu dia.

### Capturar sem perder o contexto

1. Usuário aciona o atalho global em qualquer aplicativo.
2. A janela de captura aparece no monitor ativo.
3. Usuário escolhe ou expressa o tipo: tarefa, nota ou evento.
4. Salva o item.
5. A janela fecha e devolve foco ao aplicativo anterior.
6. Se escolher `salvar e abrir`, Axis abre a página e o painel do item.

### Criar algo pelo Calendário

1. Usuário clica em um horário da Semana ou dia do Mês.
2. O painel abre como Evento com data e horário disponíveis preenchidos.
3. Usuário pode manter Evento ou trocar o tipo para Tarefa/Nota.
4. Ao salvar:
   - Evento com Google conectado sincroniza automaticamente e mantém cache local.
   - Evento sem Google permanece local.
   - Tarefa ou Nota permanece no Axis e aparece como sobreposição temporal.
5. O calendário atualiza sem mudar de página.

### Sincronizar um evento Google

1. Usuário conecta Google em Configurações.
2. Axis apresenta os calendários sincronizados como uma linha temporal unificada.
3. Novos eventos criados no Axis sincronizam sem escolha de destino por evento.
4. Alterações externas atualizam o mesmo evento localmente.
5. Em falha, o evento local continua acessível e o estado de sincronização oferece nova tentativa.
6. Notificações duplicadas do Google não são criadas por padrão.

### Transformar uma issue em tarefa de foco

1. Usuário conecta GitHub em Configurações.
2. Em Tarefas, escolhe `Adicionar do GitHub`.
3. Axis mostra issues atribuídas ao usuário nos repositórios autorizados.
4. Usuário seleciona uma issue e confirma a criação.
5. Axis cria uma tarefa com título, repositório, número e link de origem.
6. Usuário inicia Foco pela tarefa.
7. Concluir a tarefa não fecha a issue automaticamente na primeira versão.

### Iniciar Foco rapidamente

1. Usuário abre Foco ou usa uma ação rápida.
2. Pressiona Iniciar.
3. Axis usa o último modo e inicia imediatamente.
4. Se houver contexto de origem, ele já está associado.
5. Sem contexto, a sessão continua como `Sessão de foco`.
6. Usuário pode adicionar ou trocar a intenção durante a sessão sem reiniciar o tempo.
7. Um controle compacto acompanha a sessão em outras páginas.

### Executar uma tarefa em Foco

1. Usuário abre uma tarefa em Hoje, Tarefas ou Calendário.
2. Seleciona Iniciar foco.
3. Axis abre Foco com a tarefa associada e inicia conforme a ação escolhida.
4. Interrupções podem ser capturadas sem abandonar a sessão.
5. Ao concluir, o avanço é registrado na tarefa e alimenta Análise.

### Registrar um hábito

1. Hoje mostra apenas hábitos previstos para a data.
2. Usuário registra completo, mínimo ou pausa quando aplicável.
3. O estado atualiza a consistência sem criar tarefa ou evento.
4. Para alterar recorrência, usuário abre o detalhe em Hábitos.

### Encerrar o dia

1. Usuário seleciona Encerrar dia em Hoje.
2. Axis resume compromissos, essencial concluído, foco e hábitos.
3. O sistema apresenta os compromissos de amanhã.
4. Usuário confirma ou ajusta o que precisa continuar.
5. Se não encerrar até o horário configurado, Axis pode enviar um lembrete nativo enquanto estiver ativo ou na bandeja.

### Entender uma avaliação

1. Usuário abre Análise e escolhe o período.
2. Buddy apresenta diagnóstico e próximo ajuste.
3. Usuário seleciona uma afirmação ou indicador.
4. Um painel deslizante mostra sinais, origem dos dados e comparação relevante.
5. Usuário fecha o painel ou aplica uma ação sugerida.
6. Foco retorna ao elemento que abriu o painel.

### Abrir uma notificação

1. Sistema operacional mostra um compromisso, hábito ou resumo relevante.
2. Usuário clica na notificação.
3. Axis abre ou restaura a janela principal.
4. A página correta aparece com o item em um painel contextual.
5. Uma ação imediata, como adiar, concluir ou iniciar Foco, fica disponível quando fizer sentido.

## Naming Conventions

| Conceito                     | Rótulo na interface | Regra                                                                           |
| ---------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| Superfície diária            | Hoje                | Substitui `Dashboard`; não usar `Grid` ou `Início` para a mesma área.           |
| Ação executável              | Tarefa              | Evitar `card`, `item` ou `issue` após a importação.                             |
| Lembrete breve               | Nota                | Representada como post-it; não usar `documento` ou `arquivo`.                   |
| Compromisso temporal         | Evento              | Possui data, horário e duração; não é sinônimo de tarefa.                       |
| Comportamento recorrente     | Hábito              | Não chamar de tarefa recorrente.                                                |
| Estado de execução           | Foco                | Nome da área e da sessão; não usar Pomodoro como nome geral.                    |
| Técnica de tempo             | Pomodoro            | Um modo dentro de Foco.                                                         |
| Interpretação comportamental | Análise             | Substitui `Analytics`; evita linguagem de dashboard empresarial.                |
| Companheiro                  | Buddy               | Nome funcional provisório até a identidade visual ser definida.                 |
| Captura global               | Captura rápida      | Substitui `Quick Pane` na interface; o termo técnico pode permanecer no código. |
| Fechamento diário            | Encerrar dia        | Ação explícita que prepara amanhã.                                              |
| Painel contextual            | Detalhes            | Evitar apresentar o termo técnico `sheet` ao usuário.                           |
| Integração GitHub            | Adicionar do GitHub | Expressa uma ação intencional, não sincronização total.                         |

## Component Reuse Map

| Componente estrutural   | Usado em                                            | Variações de comportamento                                                    |
| ----------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| `AppShell`              | Todas as páginas principais                         | Mantém barra lateral, título da janela e camadas globais.                     |
| `PrimaryNavigation`     | Todas as páginas principais                         | Ícones com rótulos; compacta para icon-only em largura reduzida.              |
| `PageHeader`            | Tarefas, Notas, Calendário, Hábitos, Foco e Análise | Título, ação principal e controles locais. Hoje usa cabeçalho diário próprio. |
| `ContextSheet`          | Tarefas, Notas, Calendário, Hábitos e Análise       | Conteúdo e largura variam; preserva retorno de foco e página de origem.       |
| `QuickCaptureComposer`  | Hoje e janela de captura                            | Na janela global prioriza teclado e fechamento imediato.                      |
| `TemporalItem`          | Hoje e Calendário                                   | Mantém identidade de evento, tarefa ou nota e expõe ações específicas.        |
| `TaskRow`               | Hoje, Tarefas e Calendário                          | Densidade e metadados mudam conforme o contexto.                              |
| `HabitCheckIn`          | Hoje e Hábitos                                      | Em Hoje registra; em Hábitos também abre gerenciamento.                       |
| `FocusLauncher`         | Hoje, Tarefas, Calendário, GitHub vinculado e Foco  | Herda contexto quando existe; nunca exige intenção.                           |
| `ActiveFocusController` | Todas as páginas durante uma sessão                 | Controle compacto e persistente, sem duplicar toda a página Foco.             |
| `PeriodSelector`        | Calendário e Análise                                | Calendário troca período/visão; Análise troca intervalo avaliado.             |
| `IntegrationStatus`     | Configurações e estados de falha contextuais        | Mostra sucesso discretamente; ganha destaque apenas quando exige ação.        |
| `EmptyState`            | Listas e integrações                                | Orienta a próxima ação sem decoração ou métricas artificiais.                 |

## Content Growth Plan

### Conteúdo que cresce

- **Tarefas**: filtros temporais, busca e arquivo de concluídas evitam uma lista infinita. Paginação ou virtualização só entra quando o volume real exigir.
- **Notas**: busca, fixação, lembretes e arquivo substituem pastas e hierarquia manual.
- **Eventos**: navegação temporal limita o conjunto visível; cache e sincronização operam por janelas de data.
- **Hábitos**: ativos e pausados permanecem separados; histórico longo pertence à Análise.
- **Sessões de foco**: agregadas por período em Análise; a página Foco não vira um log infinito.
- **Análise**: períodos e painéis de detalhe acomodam novos sinais sem adicionar destinos à navegação principal.
- **Issues do GitHub**: busca, repositórios autorizados e itens atribuídos limitam a seleção; somente a issue escolhida vira tarefa local.

### Conteúdo estruturalmente fixo

- Ordem da navegação principal.
- Hierarquia operacional de Hoje.
- Categorias de Configurações.
- Tipos canônicos: tarefa, nota, evento, hábito e sessão de foco.

Novas integrações devem entrar como fontes ou destinos desses tipos, não como páginas de produto independentes.

## Logical Route Strategy

Axis não precisa introduzir React Router ou URLs de navegador para cumprir esta arquitetura. A navegação continua interna ao aplicativo, mas deve adotar destinos estáveis e tipados.

### Page identifiers

```text
today | tasks | notes | calendar | habits | focus | analysis
```

### Context payloads

Os destinos aceitam somente contexto compatível com a página, por exemplo:

```text
tasks    → selectedTaskId, filter
notes    → selectedNoteId, filter
calendar → selectedDate, selectedItemId, view
habits   → selectedHabitId, filter
focus    → taskId, eventId, habitId, sessionId
analysis → period, selectedInsightId
```

Na implementação, um modelo discriminado deve substituir payloads abertos como `Record<string, string>` para impedir combinações inválidas e tornar notificações, comandos e eventos Tauri consistentes.

### Entry behavior

- Cold start concluído: `today`.
- Onboarding incompleto: `flow:onboarding`.
- Retorno pela bandeja: último destino e contexto válidos.
- Notificação: destino explícito + ID do item.
- Captura global: janela separada; navegação principal somente em `salvar e abrir`.
- Configurações: overlay com aba ativa, não página principal.

Filtros e painéis não precisam alterar uma URL, mas seu estado deve ser representável para restauração e deep links nativos. Dados pessoais nunca são codificados em identificadores de navegação ou payloads de notificação.

## Structural Constraints

- Um nível de navegação principal.
- Abas persistentes apenas em Configurações; demais seletores são filtros ou modos locais.
- Detalhes não criam páginas completas sem necessidade comprovada.
- Hoje não retorna a uma grade livre de widgets.
- Kanban, GitHub e Slack não aparecem como destinos principais.
- Google Calendar sincroniza eventos; tarefas e notas permanecem entidades do Axis.
- GitHub fornece tarefas escolhidas; não importa ou modifica todas as issues silenciosamente.
- Iniciar Foco nunca depende de preencher um nome ou intenção.
- Integrações, notificações e monitoramento nunca bloqueiam o ciclo local.
- A futura presença do buddy pode assumir a expressão visual da captura rápida, mas não remove o atalho nem o fluxo de captura.

## Decisions Deferred to Visual Design

- Direção, largura e movimento exatos do painel deslizante.
- Densidade e composição visual das seções de Hoje.
- Aparência dos post-its e seus marcadores.
- Representação visual de eventos Google versus itens locais.
- Forma do controle global de Foco.
- Identidade, estados e habitat visual do buddy.
- Paletas finais dos temas `light`, `dark` e `cream`.

Essas decisões devem usar as referências visuais que serão fornecidas antes da etapa de tokens e implementação.
