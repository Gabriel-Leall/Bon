# Implementation Tasks: Axis Desktop Redesign

## Purpose

Este plano transforma o [Design Brief](./DESIGN_BRIEF.md), a [Information Architecture](./INFORMATION_ARCHITECTURE.md) e os [Design Tokens](./DESIGN_TOKENS.css) em uma sequência implementável. A ordem protege a coerência: shared primeiro, páginas depois, buddy e monitoramento somente quando o ciclo principal estiver estável.

## Execution Rules

- Executar uma tarefa por vez e validar antes de avançar.
- Começar por Shared Foundation; nenhuma página recebe redesign isolado antes dessa base.
- Usar somente `light`, `dark`, `cream` e `system`; `entardecer` existe apenas como valor legado a migrar.
- Tratar `blue`, `purple` e `red` como accents independentes do tema; azul é o padrão.
- Testar componentes compartilhados nas nove combinações explícitas de tema e accent.
- Manter sucesso, alerta, erro e informação independentes do accent escolhido.
- Usar tokens semânticos via Tailwind sempre que houver utilitário equivalente.
- Reservar CSS para definição de tokens, APIs que exigem CSS, estados complexos e integrações de bibliotecas.
- Não adicionar gradientes decorativos, cream fixo em Notes ou cores arbitrárias por página.
- Preservar funcionamento local-first, navegação por teclado, foco visível e redução de movimento.
- Usar Bun para instalação, scripts, testes e verificações.
- Não iniciar servidor de desenvolvimento; a validação visual interativa será feita pelo usuário quando solicitada.
- Não criar commit ou push sem autorização explícita.

## Status Legend

- `[ ]` não iniciada
- `[~]` em andamento
- `[x]` concluída e validada
- `[>]` adiada por dependência explícita

## Milestone S — Shared Foundation

Este marco é obrigatório antes do redesign das páginas. Seu resultado deve parecer um único aplicativo desktop em todos os temas e janelas.

### [x] S1. Integrar os tokens no runtime

**Objetivo:** transformar `DESIGN_TOKENS.css` na fonte real de cores, tipografia, espaçamento, raios, elevação e movimento.

**Arquivos prováveis:**

- `src/theme-variables.css`
- `src/App.css`
- `src/quick-pane.css`
- `src/lib/motion-tokens.ts`
- `src/theme-variables.test.ts`

**Trabalho:**

- Migrar as escalas Alabaster, Woodsmoke, Dodger blue, Dull lavender e Scarlet.
- Separar tokens primitivos, semânticos e de componente.
- Expor aliases semânticos com `@theme inline` para Tailwind v4.
- Adicionar superfícies `surface`, `surface-elevated` e `surface-sunken`.
- Adicionar aliases para borda forte/sutil, overlay, estados e accents.
- Consolidar raios, elevação, controles, layout e movimento compartilhados.
- Eliminar autorreferências e duplicações conflitantes entre `theme-variables.css` e `App.css`.
- Manter os valores visuais do cream tão próximos quanto possível do tema atual.

**Aceitação:**

- Todos os tokens referenciados estão definidos.
- Componentes existentes continuam compilando antes de qualquer redesign.
- `bg-background`, `bg-surface`, `text-foreground`, `border-border`, `bg-primary` e estados equivalentes resolvem pelo tema ativo.
- Trocar o accent altera ações, seleção e foco, sem alterar estados semânticos.
- Não existe gradiente decorativo na fundação shared.

**Validação:**

- Teste estrutural das variáveis CSS.
- Prettier nos arquivos alterados.
- Typecheck e testes focados de tema.
- Build antes de avançar.

### [x] S2. Modelar tema e accent como preferências independentes

**Objetivo:** persistir e sincronizar o par `surface theme + accent` entre janela principal, Quick Pane e chrome nativo.

**Arquivos prováveis:**

- `src/lib/theme-context.ts`
- `src/lib/theme.ts`
- `src/components/ThemeProvider.tsx`
- `src/hooks/use-theme.ts`
- `src-tauri/src/types.rs`
- `src/services/preferences.ts`
- `src/lib/bindings.ts` por geração
- testes de tema e preferências

**Trabalho:**

- Restringir temas novos a `light`, `dark`, `cream` e `system`.
- Migrar preferência legada `entardecer` para `dark` sem quebrar instalações existentes.
- Definir `Accent = blue | purple | red` com fallback `blue`.
- Persistir accent em `AppPreferences` e armazenamento local necessário para bootstrap rápido.
- Aplicar `data-axis-accent` no elemento raiz.
- Sincronizar mudanças entre janelas por evento Tauri.
- Gerar novamente os bindings após alteração Rust.
- Preservar a resolução de `system` apenas entre light e dark.

**Aceitação:**

- Tema e accent sobrevivem à reinicialização.
- Quick Pane recebe ambos sem flash de estilo incompatível.
- Preferência antiga `entardecer` abre como dark e é salva no novo formato na próxima persistência segura.
- Valores inválidos caem em `system` para tema e `blue` para accent.
- Chrome nativo usa aparência clara para light/cream e escura para dark.

**Validação:**

- Testes TypeScript de normalização e aplicação no DOM.
- Testes Rust de defaults, validação e migração.
- `bun run rust:bindings` e verificação do diff gerado.
- Typecheck, testes focados e build.

### [x] S3. Normalizar os componentes básicos compartilhados

**Objetivo:** fazer controles comuns expressarem a nova linguagem antes que páginas os componham.

**Arquivos prováveis:**

- `src/components/ui/button.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/input-group.tsx`
- `src/components/ui/select.tsx`
- `src/components/ui/native-select.tsx`
- `src/components/ui/checkbox.tsx`
- `src/components/ui/radio-group.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/badge.tsx`
- `src/components/ui/tooltip.tsx`
- componentes shared novos quando necessários

**Trabalho:**

- Padronizar alturas, paddings, raios, bordas e tipografia.
- Implementar estados default, hover, active, focus-visible, disabled e invalid.
- Usar accent para ação/seleção e tokens fixos para estados semânticos.
- Criar controle segmentado reutilizável a partir da referência shared.
- Reduzir sombras de controles; profundidade principal vem de superfície e borda.
- Garantir alvos de interação e descrições acessíveis.

**Aceitação:**

- Nenhum controle shared depende de hex/OKLCH direto no componente.
- Focus ring permanece visível em todas as nove combinações.
- Accent vermelho não torna erros indistinguíveis: ícone, texto e token destructive continuam presentes.
- Disabled não depende apenas de opacidade baixa.
- Controles segmentados funcionam por teclado e anunciam seleção.

**Validação:**

- Testes de interação dos controles alterados.
- Auditoria de hardcodes nas pastas shared/UI.
- Typecheck, lint e testes focados.

### [~] S4. Reestruturar o App Shell e a navegação principal

**Objetivo:** substituir a activity bar exclusivamente por ícones por uma navegação desktop coerente com a IA.

**Arquivos prováveis:**

- `src/components/layout/MainWindow.tsx`
- `src/components/layout/LeftSideBar.tsx`
- `src/components/layout/MainWindowContent.tsx`
- `src/components/layout/PageWrapper.tsx`
- `src/store/ui-store.ts`
- testes de layout e store

**Trabalho:**

- Implementar sidebar com ícone e rótulo.
- Adotar a ordem: Hoje, Tarefas, Notas, Calendário, Hábitos, Foco e Análise.
- Manter modo compacto com tooltip quando a janela exigir.
- Colocar Captura rápida e Configurações na área utilitária inferior.
- Introduzir IDs lógicos novos com migração segura dos estados atuais.
- Remover Kanban, GitHub e Slack da navegação e do dispatcher principal.
- Manter GitHub somente como futura fonte de tarefa.
- Remover a exceção estrutural que muda a largura da activity bar apenas em Notes.
- Preparar uma região global para o controle de foco ativo.

**Aceitação:**

- Todas as sete páginas são alcançáveis por mouse e teclado.
- Estado ativo tem ícone, rótulo e indicação que não depende apenas de cor.
- Cold start concluído aponta para Hoje; retorno pela bandeja preserva contexto.
- Compactação não corta rótulos silenciosamente nem desloca o conteúdo.
- O shell usa os mesmos tokens nos três temas e três accents.

**Validação:**

- Testes de navegação e store.
- Teste de ordem e `aria-current`.
- Typecheck, lint e build.
- Capturas fornecidas pelo usuário em largura compacta, intermediária e ampla.

**Estado em 2026-09-06:** implementação e gates automatizados concluídos. O S4
permanece em andamento até a validação visual no Tauri real com as três
capturas previstas acima.

### [ ] S5. Criar o painel modal deslizante compartilhado

**Objetivo:** oferecer um único padrão de detalhe e interação para tarefas, notas, eventos, hábitos e Análise.

**Arquivos prováveis:**

- `src/components/ui/sheet.tsx` ou componente Radix equivalente
- `src/components/shared/ContextSheet.tsx`
- tokens de layout/movimento
- testes do componente

**Trabalho:**

- Implementar header, título, descrição, região rolável e footer opcional.
- Suportar largura padrão e ampla por conteúdo.
- Preservar a página ao fundo sem glassmorphism decorativo.
- Implementar overlay, entrada, saída e redução de movimento.
- Manter trap de foco, Escape, fechamento explícito e retorno ao gatilho.
- Permitir estados loading, erro, conteúdo vazio e ação destrutiva.

**Aceitação:**

- O painel não cria uma rota ou página paralela.
- Foco de teclado não escapa enquanto estiver aberto.
- Fechar restaura foco e posição de rolagem.
- Conteúdo longo rola sem mover o shell.
- Movimento reduzido elimina deslocamento não essencial.

**Validação:**

- Testes de teclado, foco e fechamento.
- Teste das larguras e estados.
- Typecheck, lint e testes focados.

### [ ] S6. Redesenhar Configurações e Aparência

**Objetivo:** aplicar a referência de duas regiões e tornar tema/accent compreensíveis visualmente.

**Arquivos prováveis:**

- `src/components/preferences/PreferencesDialog.tsx`
- `src/components/preferences/panes/AppearancePane.tsx`
- `src/components/preferences/panes/GeneralPane.tsx`
- `src/components/preferences/shared/SettingsComponents.tsx`
- `locales/*.json`
- testes de preferências

**Trabalho:**

- Manter navegação secundária vertical.
- Organizar as categorias aprovadas: Geral, Aparência, Notificações, Calendário e integrações, Foco, Privacidade e dados.
- Mover seleção de tema para Aparência e eliminar controles duplicados em Geral.
- Substituir o select de tema por cartões de prévia light, dark, cream e system.
- Adicionar swatches acessíveis para blue, purple e red.
- Mostrar estados selecionados por borda, ícone e rótulo.
- Incluir redução de movimento na área apropriada.
- Aplicar alterações imediatamente e persistir sem botão Salvar obrigatório.

**Aceitação:**

- Theme preview representa superfície, texto, borda e accent.
- Seleção funciona por teclado e leitor de tela.
- Accent pode ser alterado sem alterar o tema.
- Não há opção Entardecer.
- A tela não usa blur, imagem de fundo ou transparência de baixo contraste.

**Validação:**

- Testes de troca e persistência.
- Verificação das traduções em todos os locales.
- Typecheck, lint e testes focados.
- Capturas das nove combinações na área Aparência.

### [ ] S7. Unificar Quick Pane e overlays globais

**Objetivo:** impedir que janelas auxiliares pareçam outro produto ou mantenham tokens antigos.

**Arquivos prováveis:**

- `src/quick-pane.css`
- `src/components/quick-pane/QuickPaneApp.tsx`
- `src/components/command-palette/*`
- `src/components/ui/sonner.tsx`
- `src/components/wrap-up/*`
- testes relacionados

**Trabalho:**

- Consumir tema e accent compartilhados na inicialização e ao receber eventos.
- Remover gradientes, glass e cores fixas incompatíveis.
- Aplicar componentes e estados normalizados.
- Preservar captura rápida por teclado, tamanho dinâmico e retorno ao contexto.
- Alinhar palette, toast, dialogs e encerramento diário às mesmas superfícies.
- Garantir que a evolução visual futura para o buddy não elimine o fluxo rápido.

**Aceitação:**

- Troca de tema/accent aparece na próxima abertura e em janelas já montadas.
- Quick Pane não força cream no dark.
- Todos os overlays têm foco visível e contraste suficiente.
- Captura e atalhos continuam funcionais.

**Validação:**

- Testes da janela de captura e eventos de sincronização.
- Testes de tema das superfícies globais.
- Typecheck, lint e build.
- Capturas da janela principal e Quick Pane lado a lado.

### [ ] S8. Gate visual e técnico do Shared Foundation

**Objetivo:** impedir que inconsistências shared se espalhem pelas páginas.

**Checklist visual:**

- [ ] Light + blue/purple/red.
- [ ] Dark + blue/purple/red.
- [ ] Cream + blue/purple/red.
- [ ] Sidebar expandida e compacta.
- [ ] Controles default/hover/active/focus/disabled/invalid.
- [ ] Painel deslizante padrão e amplo.
- [ ] Configurações e seletor de aparência.
- [ ] Quick Pane, command palette, toast e dialog.
- [ ] Janela compacta, intermediária e ampla.
- [ ] Redução de movimento.

**Checklist técnico:**

- [ ] Sem `entardecer` exposto como tema.
- [ ] Sem tokens indefinidos ou aliases autorreferentes.
- [ ] Sem hardcodes de cor na camada shared, exceto controles nativos do sistema documentados.
- [ ] Sem gradientes decorativos.
- [ ] Testes focados aprovados.
- [ ] `bun run check:all` aprovado ou divergências de baseline documentadas.
- [ ] Validação visual confirmada pelo usuário.

## Milestone P — Core Product Pages

Só iniciar após S8. Cada página deve reutilizar shell, controles, painel e tokens; nenhuma cria um design system próprio.

### [~] P1. Construir Hoje como superfície principal

**Objetivo:** substituir a grade livre por uma página contínua e priorizada.

**Estrutura:** Agora → Seu dia → Hábitos de hoje → Captura rápida → Encerrar o dia.

**Aceitação principal:**

- Próximo compromisso, próxima ação e Iniciar foco aparecem antes de métricas secundárias.
- Eventos, tarefas e lembretes mantêm identidade própria na linha temporal.
- Áreas secundárias podem recolher sem alterar a hierarquia essencial.
- Nenhum widget usa gradiente ou dimensão aleatória.

**Rodada 1:** grade livre e seletor de widgets substituídos pela hierarquia fixa
`Agora → Seu dia → Hábitos de hoje → Captura rápida → Encerrar o dia`. Ações
existentes de foco, tarefas, eventos, hábitos, captura global e encerramento foram
reaproveitadas; refinamento visual e validação pelo usuário permanecem abertos.

**Rodada 1.1:** cabeçalho diário estabilizado no topo, estados vazios de agenda e
compromisso compactados e captura rápida passou a comunicar explicitamente a
abertura do compositor.

### [~] P2. Simplificar Tarefas

**Objetivo:** entregar execução simples com filtros Hoje, Próximas, Sem data e Concluídas.

**Aceitação principal:**

- Criação rápida exige somente título.
- Detalhes abrem no ContextSheet.
- Data, horário, lembrete e nota são opcionais.
- Iniciar foco herda a tarefa sem nova digitação.
- Kanban, projetos complexos e múltiplos status não aparecem.

**Rodada 1 em 2026-09-08:** criação reduzida a um título na própria página,
busca mantida visível e navegação local consolidada nos quatro filtros canônicos:
Hoje, Próximas, Sem data e Concluídas. O Kanban e o modal de criação detalhada
saíram da experiência principal; título, nota, prioridade, data, etapas e ação
Iniciar foco ficam no painel contextual. Horário, lembrete, origem GitHub e
vínculo persistente entram nas rodadas funcionais seguintes.

**Ajuste da Rodada 1 em 2026-09-08:** a captura rápida passou a exibir e
permitir escolher o destino temporal antes da criação: Hoje, Amanhã, Sem data
ou uma data específica. O padrão acompanha o filtro ativo e a tarefa recém-criada
abre na lista correspondente; o conjunto de captura foi compactado para manter
data e ação próximas ao título.

### [ ] P3. Transformar Notas em post-its rápidos

**Objetivo:** substituir vault/editor por captura, fixação, lembrete e arquivo.

**Aceitação principal:**

- Captura breve fica no topo.
- Fixadas precedem o mural ordenado automaticamente.
- A referência visual contribui somente com o reconhecimento de post-it.
- Nota usa superfície do tema ativo; não existe paper cream fixo no dark.
- Pastas, split view, Markdown preview e glassmorphism saem da experiência principal.

### [ ] P4. Construir Calendário unificado

**Objetivo:** oferecer Semana como padrão e Mês como visão geral.

**Aceitação principal:**

- Clicar em horário/dia abre criação temporal no ContextSheet.
- Evento é o tipo inicial; usuário pode trocar para Tarefa ou Nota.
- Eventos Google, eventos locais, tarefas datadas e notas com lembrete mantêm distinção.
- Agenda não vira uma terceira visualização inicial.
- Falha externa não bloqueia leitura ou criação local.

### [~] P5. Reestruturar Hábitos

**Objetivo:** separar check-in diário em Hoje do gerenciamento de recorrências.

**Aceitação principal:**

- Página mostra ativos, edição e pausados.
- Cores aparecem em ícones, pontos, regras ou células pequenas, não no card inteiro.
- Sequência e histórico curto são explicáveis.
- Métricas profundas direcionam para Análise.

**Rodada 1 em 2026-09-07:** hierarquia e superfícies iniciadas. O fundo
decorativo foi removido; cabeçalho, progresso, navegação local, fila, contexto
e cartões passaram a usar os tokens e a profundidade da fundação. A cor de cada
hábito foi reduzida a marcadores pequenos. A separação estrutural entre check-in
em Hoje e gerenciamento nesta página permanece para a próxima rodada.

**Rodada 2 em 2026-09-07:** o contexto do hábito em foco foi destilado para
identidade, frequência, sequência, histórico curto e ações essenciais. A
recuperação passou a usar controles compactos, enquanto a legenda e as
explicações dos estados foram movidas para uma ajuda sob demanda ao lado de
"Novo Hábito". O resumo redundante foi removido deste contexto.

### [~] P6. Reestruturar Foco

**Objetivo:** manter Foco como destino próprio e Pomodoro como técnica interna.

**Aceitação principal:**

- Iniciar rápido funciona sem intenção obrigatória.
- Contexto de tarefa, evento ou hábito é herdado automaticamente.
- Modos: Pomodoro, cronômetro livre e duração definida.
- Contexto pode ser alterado sem reiniciar a sessão.
- Controle compacto permanece disponível em todas as páginas.
- Histórico detalhado fica em Análise.

**Rodada 1 em 2026-09-07:** a página deixou de se apresentar como um timer
isolado e passou a organizar a sessão de Foco em três níveis: relógio e
controles como núcleo, contexto e configuração como suporte, e sessões de hoje
como informação terciária. Pomodoro agora é identificado como técnica dentro
de Foco. Gradientes, vidro, azul fixo e sombras fora da fundação foram removidos
em favor de superfícies semânticas e profundidade neumórfica. Cronômetro livre,
duração definida e a troca de contexto entre tarefa, evento e hábito permanecem
para as próximas rodadas funcionais.

**Ajuste da Rodada 1 em 2026-09-07:** o visor retangular e a barra linear foram
substituídos por um relógio circular rebaixado. O progresso agora percorre o
perímetro do mostrador, enquanto tempo e ciclos permanecem no centro; contexto,
configurações e histórico não mudaram. Segmentos internos orbitam lentamente
conforme o próprio relógio avança, pausam com o timer e permanecem estáticos sob
redução de movimento.

### [~] P7. Reestruturar Análise

**Objetivo:** trocar métricas soltas por diagnóstico explicável e acionável.

**Aceitação principal:**

- Buddy apresenta diagnóstico, sustentadores, obstáculos e um próximo ajuste.
- Todo julgamento abre origem e sinais no painel deslizante.
- Indicadores cobrem foco, hábitos, tarefas, calendário e recuperação.
- Gráficos usam tokens estáveis e não dependem apenas de cor.
- Não existem gradientes aleatórios ou fundos de card baseados em dados.

**Rodada 1:** a página agora começa por uma leitura textual do período, seguida
do sinal que sustentou o ritmo, do ponto que merece atenção e de um próximo
ajuste derivado dos dados existentes. A nota deixa de julgar períodos sem base;
indicadores e gráficos passam a funcionar como evidências secundárias em
superfícies sem gradientes. O buddy permanece como habitat textual nesta rodada.
O painel deslizante de explicação e os sinais de calendário e recuperação ficam
para as próximas rodadas.

**Ajuste da Rodada 1 em 2026-09-08:** o mapa anual de consistência foi removido
de Análise por repetir uma leitura que já pertence a Hábitos. A atividade de
tarefas agora ocupa uma seção única e larga, com pilhas de blocos que comparam
criações e conclusões, resumo da taxa de conclusão e diferenciação por forma,
contorno e preenchimento — não apenas por cor.

**Segundo ajuste da Rodada 1 em 2026-09-08:** a composição deixou de empilhar
cards dentro de cards. Diagnóstico e sinais agora ficam diretamente no fluxo da
página, enquanto pontuação, próximo ajuste e indicadores assumem profundidades
independentes. As pilhas usam blocos retangulares mais largos; as sparklines sem
escala dos indicadores foram removidas. Comparações sem período anterior agora
aparecem como “Novo neste período” ou “Sem atividade”, em vez de “Sem base”.

### [ ] P8. Implementar encerramento diário e lembretes

**Objetivo:** fechar o ciclo do dia e antecipar amanhã.

**Aceitação principal:**

- Encerrar dia resume essencial, compromissos, foco e hábitos.
- Amanhã aparece antes da confirmação final.
- Horário configurável envia lembrete de segurança quando Axis está ativo ou na bandeja.
- Notificação abre o item correto no painel contextual.
- Eventos Google não recebem notificação duplicada por padrão.

## Milestone I — Optional Integrations

### [ ] I1. Completar sincronização Google Calendar

- Conectar em Configurações → Calendário e integrações.
- Sincronizar eventos automaticamente sem escolha de destino por evento.
- Manter cache local, estado de sincronização, retry e conflitos compreensíveis.
- Nunca enviar tarefas e notas ao Google como se fossem eventos.

### [ ] I2. Transformar issues GitHub escolhidas em tarefas

- Conectar repositórios autorizados em Configurações.
- Mostrar issues atribuídas ao usuário sob ação `Adicionar do GitHub`.
- Criar tarefa local com repositório, número, link e ID de origem.
- Permitir Iniciar foco diretamente.
- Não importar tudo nem fechar a issue automaticamente na primeira versão.

## Milestone F — Final Consolidation

### [ ] F1. Remover superfícies e contratos fora do novo produto

- Remover dispatcher e UI órfãos de Kanban, página GitHub e página Slack.
- Remover editor Markdown/vault remanescente quando migração e exportação estiverem protegidas.
- Remover CSS antigo de cream fixo, gradients, glass e tokens não utilizados.
- Migrar dados legados sem apagamento silencioso.
- Atualizar documentação de arquitetura, temas, navegação e preferências.

### [ ] F2. Executar validação completa da entrega

- Testes unitários e de interação por domínio.
- Typecheck, lint, ast-grep, Prettier, Rust fmt/clippy/test e build.
- Validação de teclado, foco, contraste e redução de movimento.
- Capturas de todas as páginas em light, dark e cream com accent padrão.
- Capturas shared das nove combinações tema/accent.
- Revisão visual separada com `DESIGN_REVIEW.md` somente após a implementação.

## Deferred Layers

As tarefas abaixo não entram antes de o ciclo diário e a Análise estarem estáveis.

### [>] D1. Buddy visual completo

- Identidade, estados, habitat e aparições contextuais.
- Regras locais determinísticas e explicações acessíveis.
- Possível evolução da expressão visual da Captura rápida, preservando o atalho.

### [>] D2. Context intelligence durante Foco

- Monitoramento nativo opcional somente durante sessão.
- Indicador visível, consentimento e permissões em contexto.
- Persistência apenas de categorias, duração, AFK e trocas de contexto.
- Sem armazenamento de pesquisa, título bruto ou URL completa.

## Immediate Next Task

Concluir **S4. Reestruturar o App Shell e a navegação principal** com capturas
do Tauri real em largura compacta, intermediária e ampla. Corrigir achados
visuais antes de marcar o passo como concluído; não iniciar S5 enquanto essa
validação estiver pendente.
