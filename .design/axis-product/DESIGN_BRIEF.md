# Design Brief: Axis Product

## Problem

Pessoas que trabalham ou estudam no computador precisam lembrar compromissos, executar tarefas, manter hábitos e lidar com interrupções, mas suas ferramentas fragmentam essas necessidades ou exigem manutenção excessiva. Quando o contexto muda, o usuário perde tempo reconstruindo o dia, esquece o que importa e confunde atividade com progresso.

## Solution

Axis oferece um ciclo pessoal de execução no desktop: capturar o que apareceu, organizar somente o que possui relação temporal, escolher a próxima ação, proteger uma sessão de foco, encerrar o dia antecipando amanhã e refletir sobre padrões. Notas, tarefas, eventos, hábitos, foco e análise são partes desse ciclo, não produtos independentes.

A experiência permanece local-first e funciona sem conta. Google Calendar amplia o calendário sem substituir o núcleo local. Um buddy futuro transforma a análise em acompanhamento emocional e gamificação explicável, sem depender de IA externa ou vigilância escondida.

## Experience Principles

1. **Execução sobre manutenção** -- registrar, escolher e concluir precisa exigir menos esforço do que administrar o sistema.
2. **Julgamento explicável sobre métricas vazias** -- o produto pode cobrar e gamificar, mas sempre mostra quais comportamentos sustentam sua avaliação.
3. **Inteligência com consentimento sobre conveniência invisível** -- automações e contexto reduzem esforço sem retirar propriedade, privacidade ou controle do usuário.

## Aesthetic Direction

- **Philosophy**: minimalismo editorial premium para uma ferramenta desktop pessoal, equilibrado pela presença afetiva de um pet-companheiro.
- **Tone**: calmo, direto, confiável e controlado; o buddy é exigente, justo e expressivo, sem infantilizar toda a interface.
- **Reference points**: precisão e densidade disciplinada de ferramentas desktop premium; clareza editorial; o papel relacional de mascotes como Duo, sem copiar sua aparência ou mecânicas.
- **Anti-references**: dashboards SaaS genéricos, sistemas de gestão empresarial, produtividade punitiva, bases de conhecimento complexas, gamificação opaca, vigilância escondida e interfaces formadas por widgets desconectados.

## Existing Patterns

- **Typography**: Inter é a fonte global atual; hierarquia usa tamanho, peso, ritmo e largura antes de cor.
- **Colors**: tokens OKLCH em `src/theme-variables.css` são mapeados ao Tailwind v4 por `@theme inline`; serão consolidados para `light`, `dark` e `cream`.
- **Spacing**: a escala Tailwind e a densidade compacta de desktop permanecem como base, reduzindo cartões repetitivos e áreas vazias.
- **Components**: shadcn/Radix, Lucide, Tauri multi-window, stores existentes e comandos tipados são o vocabulário inicial.
- **Persistence**: SQLite, filesystem e preferências locais sustentam o núcleo offline; integrações externas são opcionais.
- **Existing surfaces**: Dashboard/widgets, Tasks, Notes, Calendar, Habits, Pomodoro/Focus, Analytics, Quick Pane e encerramento diário serão reorganizados ao redor do ciclo canônico.

## Component Inventory

| Component            | Status | Notes                                                                                                     |
| -------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| Hoje                 | New    | Superfície principal com próximo compromisso, próxima ação, tarefas, hábitos, lembretes e foco.           |
| Captura rápida       | Modify | Registra nota, tarefa ou evento sem interromper o contexto; futuramente pode assumir a presença do buddy. |
| Nota post-it         | Modify | Substitui a experiência de vault por texto rápido, fixação, marcador e lembrete opcional.                 |
| Lista de tarefas     | Modify | Reduz tarefas a ações abertas/concluídas com data, lembrete e observação opcionais.                       |
| Calendário unificado | Modify | Projeta eventos, tarefas datadas e notas com lembrete sem misturar suas identidades.                      |
| Google Calendar      | Modify | Evolui de autenticação de perfil para sincronização automática de eventos com cache local.                |
| Fonte GitHub         | Modify | Transforma uma issue escolhida em tarefa vinculada sem criar uma página GitHub ou alterar a issue.        |
| Hábitos              | Modify | Mantém comportamentos recorrentes separados de tarefas e eventos.                                         |
| Modo Foco            | Modify | Inicia sem intenção obrigatória, herda contexto quando disponível e oferece Pomodoro como técnica.        |
| Encerramento diário  | Modify | Resume o dia, apresenta amanhã e aciona lembrete de segurança quando necessário.                          |
| Análise              | Modify | Interpreta compromisso, consistência, foco, carga e recuperação com avaliação explicável.                 |
| Buddy                | New    | Pet-companheiro local, inicialmente concentrado em Análise e no encerramento diário.                      |
| Monitor de contexto  | New    | Futuro observador nativo e opcional durante Foco, com persistência apenas de agregados.                   |
| Sistema de temas     | Modify | Unifica `light`, `dark` e `cream` com accents `blue`, `purple` e `red` em todas as superfícies.           |

## Key Interactions

- O usuário captura uma nota, tarefa ou evento por atalho e retorna imediatamente ao contexto anterior.
- Abrir `Hoje` revela o próximo compromisso e a próxima ação antes dos detalhes secundários.
- Clicar em um dia do Calendário inicia uma criação já datada; o usuário escolhe o tipo de conteúdo, não o destino de sincronização.
- Com Google conectado, eventos sincronizam automaticamente e continuam disponíveis em cache local; tarefas e notas permanecem locais.
- Uma issue escolhida no GitHub pode originar uma tarefa vinculada, sem importação ou fechamento automático.
- Foco pode começar imediatamente, com contexto herdado ou intenção opcional. Interrupções podem ser capturadas sem encerrar a sessão.
- Ao encerrar o dia, o Axis reconhece o essencial concluído e apresenta os compromissos de amanhã.
- Análise explica o julgamento do período; o buddy expressa essa avaliação e sugere um ajuste possível.
- Futuramente, o monitor de contexto observa aplicativo e título da janela apenas durante Foco e entrega ao buddy somente categorias e totais locais.

## Responsive Behavior

Axis é desktop-first. Não há obrigação de oferecer uma experiência mobile equivalente nesta fase.

- Janelas compactas preservam próxima ação, compromisso e captura em uma coluna, levando contexto secundário para regiões recolhíveis.
- Janelas intermediárias usam duas regiões assimétricas quando isso mantém ação e contexto simultaneamente visíveis.
- Janelas amplas limitam largura de leitura e evitam esticar cartões apenas para ocupar espaço.
- Quick Pane, buddy futuro e notificações respeitam limites de janela, monitor ativo e áreas seguras do sistema operacional.

## Accessibility Requirements

- Atender WCAG 2.2 AA, incluindo 4.5:1 para texto normal e 3:1 para texto grande e componentes essenciais.
- Permitir navegação integral por teclado, foco visível, ordem previsível e retorno de foco após superfícies temporárias.
- Nunca depender apenas de cor para estado, prioridade, avaliação, série de dados ou emoção do buddy.
- Explicar métricas e reações em texto acessível; gráficos precisam de equivalentes textuais.
- Respeitar redução de movimento e evitar reações do buddy que bloqueiem ou pressionem interação.
- Solicitar permissões de notificações, calendário e Acessibilidade em contexto, explicando benefício e alternativa.

## Out of Scope

- colaboração, equipes, organizações e gestão de trabalho empresarial;
- projetos complexos, dependências, estimativas e Kanban como núcleo;
- base de conhecimento, vault e edição Markdown avançada;
- funcionamento obrigatório com conta, Google ou internet;
- IA externa obrigatória ou envio de conteúdo pessoal para gerar reações;
- monitoramento contínuo fora de Foco ou escondido do usuário;
- construção do buddy e do monitor antes da estabilização do ciclo diário e da análise;
- implementação de todas as camadas em uma única entrega.
