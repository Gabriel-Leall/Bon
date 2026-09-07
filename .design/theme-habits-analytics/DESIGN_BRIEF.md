# Design Brief: Temas, Hábitos e Análise do Axis

Este brief herda a visão, o público, o ciclo e os limites definidos no [brief de produto do Axis](../axis-product/DESIGN_BRIEF.md). Seu escopo específico é o sistema visual e a experiência de Hábitos e Análise; mudanças estruturais das demais superfícies pertencem às camadas de produto correspondentes.

## Problem

O profissional que usa o Axis para retomar o foco e controlar a rotina encontra uma interface visualmente inconsistente. As cores não preservam a mesma semântica entre temas, superfícies podem assumir a aparência de outro tema e gradientes decorativos competem com o conteúdo. Em Hábitos, a organização atual distribui ações, progresso e detalhes em muitos blocos com peso semelhante, deixando espaço vazio e tornando o próximo passo menos evidente. Em Análise, a sucessão de cartões e métricas comunica volume de dados, mas não ajuda o usuário a entender rapidamente o que mudou, por que isso importa e qual comportamento merece atenção.

## Solution

Criar um sistema visual desktop calmo, preciso e premium, sustentado por tokens semânticos completos para três temas: `light`, `dark` e `cream`. Toda superfície deve herdar o tema ativo; cores de estado e de identidade devem aparecer apenas onde carregam significado; gradientes decorativos deixam de ser parte da linguagem padrão. Um neumorfismo contido organiza a profundidade: painéis parecem elevados, campos e estados ativos parecem rebaixados, sem sacrificar bordas, contraste ou foco visível.

Hábitos passa a priorizar a execução do dia: progresso, fila e ação principal formam uma única sequência operacional, enquanto contexto, recuperação e histórico aparecem progressivamente. Análise passa de uma coleção de cartões para uma leitura orientada: primeiro o julgamento explicável do período, depois os sinais que justificam essa avaliação e, por fim, os detalhes exploráveis. A estrutura deve reservar o habitat principal do buddy futuro sem depender dele na primeira entrega. O resultado deve parecer uma ferramenta desktop coesa, e não um dashboard web genérico.

## Experience Principles

1. **Próxima ação sobre quantidade de informação** -- a primeira leitura sempre revela o que fazer agora; detalhes e histórico permanecem disponíveis sem disputar a hierarquia principal.
2. **Semântica sobre decoração** -- cor, contraste, profundidade e movimento existem para explicar estado, prioridade ou relação; nenhum gradiente ou cor arbitrária é usado apenas para preencher uma superfície.
3. **Coerência sobre uniformidade** -- `light`, `dark` e `cream` preservam os mesmos papéis, contrastes e comportamentos, mas cada tema mantém temperatura e personalidade próprias.

## Aesthetic Direction

- **Philosophy**: minimalismo editorial premium para desktop, com superfícies sólidas, neumorfismo contido, divisórias precisas, tipografia como principal ferramenta de hierarquia e densidade controlada.
- **Tone**: calma, focada, confiável e deliberada; nunca fria a ponto de parecer clínica nem exuberante a ponto de competir com o trabalho.
- **Reference points**: a precisão e a densidade disciplinada de ferramentas desktop premium; a hierarquia editorial já declarada em `PRODUCT.md`; referências existentes como Linear, Vercel e Sean Brydon devem ser traduzidas em princípios, não copiadas visualmente.
- **Anti-references**: dashboards SaaS formados por uma grade repetitiva de cartões; “AI slop”; gradientes roxos, cianos ou multicoloridos sem função; glassmorphism; neumorfismo sem contraste ou com sombras exageradas; grandes áreas vazias sem intenção; cores de usuário ocupando o fundo inteiro de cartões.

### Direção dos temas

- **Light**: neutro frio e luminoso, com fundo suavemente quebrado, superfícies sólidas claras, texto em tinta quase preta e um único acento frio controlado. O contraste vem de luminância, borda e tipografia, não de brilho ou sombra.
- **Dark**: grafite profundo e neutro, com degraus de superfície distinguíveis e texto levemente suavizado. Evitar preto absoluto dominante, lavagem azul/ciano e halos coloridos nas bordas da janela.
- **Cream**: tema quente preservado como alternativa intencional. Deve receber a mesma cobertura de tokens dos outros temas, sem servir como valor padrão ou escapar para superfícies de `light` e `dark`.
- **Cores de hábito**: permanecem como marcadores de identidade em ícones, filetes, pontos, células e pequenos indicadores. Não colorem o fundo inteiro de uma linha ou cartão e nunca reduzem contraste de texto.
- **Gradientes**: removidos das superfícies de Hábitos, Análise e Notas. Um gradiente só pode existir futuramente quando representar dado contínuo e usar tokens semânticos documentados; não pode ser aleatório ou decorativo.

## Existing Patterns

Componentes, tokens e convenções existentes são o vocabulário inicial, mas o sistema atual precisa de consolidação.

- **Typography**: Inter é carregada globalmente e deve continuar como base nesta fase. A hierarquia deve usar tamanho, peso, largura de linha e espaçamento antes de recorrer a cor. As famílias divergentes do Quick Pane e variáveis antigas de Geist devem ser tratadas em uma auditoria tipográfica separada antes de qualquer troca de fonte.
- **Colors**: `src/theme-variables.css` usa OKLCH e mapeia variáveis CSS semânticas para utilitários Tailwind v4 por meio de `@theme inline`. O novo sistema deve manter essa arquitetura, completar a mesma matriz de tokens em todos os temas e eliminar valores visuais de identidade espalhados por páginas e CSS de widgets.
- **Spacing**: preservar a escala de espaçamento do Tailwind e o ritmo compacto de aplicativo desktop. Reduzir a repetição de grandes `padding`, cartões independentes e raios excessivos; alinhar páginas a uma grade e a uma largura de leitura consistentes.
- **Components**: reutilizar os primitivos shadcn/Radix, Lucide, controles segmentados, dialogs, menus, tooltips e componentes de gráfico existentes. Componentes de `src/components/ui` continuam sendo a base; mudanças de linguagem devem ocorrer por tokens, variantes e composição.
- **Theming**: `ThemeProvider` e as classes de tema continuam controlando as janelas. `theme-variables.css` permanece compartilhado entre a janela principal e o Quick Pane.
- **Content**: métricas, hábitos, estados, frequências e registros existentes são dados reais do usuário. O redesign não deve inventar métricas ou apresentar conteúdo fictício no produto final.

## Component Inventory

| Component                                   | Status | Notes                                                                                                               |
| ------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------- |
| Matriz de tokens semânticos                 | Modify | Completar superfícies, texto, bordas, controles, estados e gráficos para `light`, `dark` e `cream`.                 |
| Seletor e aplicação de tema                 | Modify | Remover `entardecer`, oferecer apenas os três temas aprovados e impedir herança visual cruzada entre janelas.       |
| Superfície base de página                   | New    | Composição sem gradiente para cabeçalho, conteúdo rolável e regiões de detalhe.                                     |
| Primitivos de painel e seção                | Modify | Substituir o cartão translúcido repetitivo por níveis de superfície e divisórias com funções claras.                |
| Superfície de Notas                         | Modify | Corrigir a herança de tema agora; a substituição pelo modelo de post-it pertence à camada do ciclo diário.          |
| Cabeçalho de Hábitos                        | Modify | Integrar título, data, progresso diário e criação sem duas faixas de cartões concorrentes.                          |
| Fila de execução diária                     | Modify | Tornar estado e ação principal imediatamente legíveis; usar a cor do hábito apenas como marcador.                   |
| Detalhe do hábito em foco                   | Modify | Assumir comportamento de painel contextual, com recuperação e gerenciamento progressivamente revelados.             |
| Navegação Hoje / Visão geral / Estatísticas | Modify | Manter o modelo de abas e acessibilidade, reduzindo aparência de controle web arredondado genérico.                 |
| Editor de hábito                            | Modify | Preservar nome, ícone, frequência, dias e cor; explicar visualmente que a cor é um marcador, não um tema de cartão. |
| Resumo do período em Análise                | New    | Sintetizar direção, mudança e principal sinal antes das métricas detalhadas.                                        |
| Seletor de período                          | Modify | Preservar comparação entre períodos com estados de seleção mais claros e compactos.                                 |
| Faixa de métricas                           | Modify | Reduzir redundância de cartões e manter comparação, unidade e base temporal legíveis.                               |
| Explicação da pontuação de foco             | Modify | Mostrar composição e contribuição dos sinais sem depender apenas do anel ou de cor.                                 |
| Habitat do buddy                            | New    | Reservar uma região de avaliação e reação sem exigir a arte ou o motor definitivo nesta fase.                       |
| Gráfico de atividade                        | Modify | Usar tokens de dados estáveis, legenda explícita e tooltip acessível.                                               |
| Mapa de consistência                        | Modify | Preservar a leitura temporal, com escala perceptualmente ordenada e alternativa textual.                            |

## Key Interactions

### Temas

- Ao trocar de tema, todas as janelas e superfícies atualizam a mesma semântica visual sem flashes, fundos residuais ou áreas pertencentes a outro tema.
- Estados de hover, foco, seleção, sucesso, alerta e erro conservam significado e contraste nos três temas.
- Preferência do sistema continua disponível como mecanismo de escolha, mas resolve sempre para um dos três temas suportados.
- Configurações mostra miniaturas fiéis de `light`, `dark`, `cream` e `system`; a escolha de accent aparece logo abaixo como swatches independentes da superfície.
- Painéis elevados, campos rebaixados e estados pressionados mantêm a mesma semântica de profundidade nos três temas.

### Hábitos

- Ao abrir a página, o foco de teclado e a hierarquia visual começam na situação do dia: progresso geral, hábitos pendentes e ação de conclusão.
- Marcar `Completo`, `Mínimo`, `Pausado`, `Recuperado` ou `Perdido` atualiza o item, o progresso e o resumo sem deslocamentos bruscos. Texto, ícone ou padrão acompanham a cor para comunicar o estado.
- Selecionar um hábito atualiza um painel contextual persistente no desktop; detalhes históricos não empurram a fila para fora da vista.
- Recuperar um dia exige contexto claro da data e oferece feedback imediato, mantendo a ação distinta de concluir hoje.
- Visão geral organiza todos os hábitos; Estatísticas aprofunda padrões. Essas áreas não repetem o resumo e a fila da aba Hoje.
- Criar ou editar preserva o rascunho em erro e devolve foco ao elemento que abriu o diálogo ao concluir ou cancelar.

### Análise

- Alterar o período atualiza primeiro o resumo interpretável e depois os gráficos, preservando a posição e indicando carregamento sem esconder os dados anteriores abruptamente.
- O topo responde três perguntas: “como foi o período?”, “o que mais mudou?” e “qual sinal merece atenção?”.
- Métricas detalhadas explicam unidade, comparação e ausência de baseline. Nenhum delta é tratado automaticamente como positivo apenas por aumentar.
- Hover oferece precisão adicional em gráficos; teclado e tecnologias assistivas recebem a mesma informação por foco e resumo textual.
- A avaliação geral pode julgar e gamificar, mas sempre expõe sua composição e considera compromisso, consistência, foco, carga e recuperação.
- A primeira entrega pode representar a reação do buddy como estado e mensagem textual; a identidade visual completa pertence à camada Companion.

## Responsive Behavior

O Axis é um aplicativo desktop Tauri; o brief não propõe uma experiência mobile. A interface deve permanecer funcional em janelas desktop reduzidas e expansivas.

- **Janela compacta**: uma coluna principal; painéis contextuais passam para uma região abaixo ou para um drawer acessível; ações primárias permanecem visíveis sem rolagem horizontal.
- **Janela intermediária**: conteúdo e contexto podem formar duas colunas assimétricas, com a coluna operacional mais larga.
- **Janela ampla**: a largura útil é limitada para evitar grandes áreas vazias e linhas longas; dados adicionais ocupam regiões justificadas, não esticam cartões para preencher a tela.
- Gráficos redimensionam sem cortar rótulos, tooltips ou legendas. Tabelas e mapas temporais podem rolar dentro da própria região quando necessário, com indicação visual do conteúdo excedente.

## Accessibility Requirements

- Atender WCAG 2.2 nível AA: contraste mínimo de 4.5:1 para texto normal, 3:1 para texto grande e componentes visuais essenciais.
- Preservar navegação completa por teclado, ordem de foco coerente, foco visível e retorno de foco em dialogs, menus e painéis temporários.
- Manter nomes, papéis e estados acessíveis em abas, controles segmentados, menus, tooltips, gráficos e células de consistência.
- Não depender exclusivamente de cor. Estados de hábito, deltas, séries e níveis temporais precisam de texto, ícone, padrão, posição ou rótulo adicional.
- Oferecer resumo textual equivalente para gráficos e pontuação de foco.
- Respeitar `prefers-reduced-motion`; transições devem ser curtas, funcionais e não bloquear interação.
- Manter alvos de interação compatíveis com uso preciso por mouse e confortáveis para touch/pen em dispositivos Windows.

## Out of Scope

- Implementar o redesign ou escolher valores finais de cada token nesta etapa; isso pertence às fases de arquitetura da informação, tokens e construção.
- Reformular estruturalmente Tarefas, Calendário, Foco, Onboarding, Configurações ou Quick Pane nesta entrega visual. Essas mudanças estão definidas no brief de produto e terão fases próprias.
- Trocar a família tipográfica antes de uma auditoria específica de tipografia e carregamento offline.
- Criar temas adicionais, manter `entardecer` como opção separada ou permitir temas arbitrários por usuário.
- Implementar o buddy definitivo, sua arte, animações ou personalidade completa antes da estabilização do modelo de avaliação.
- Implementar monitoramento nativo de contexto ou classificação de distrações nesta entrega.
- Adicionar contas obrigatórias, analytics remota, metas sociais ou conteúdo fictício.
