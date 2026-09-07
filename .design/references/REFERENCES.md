# Axis Visual Reference Map

## How to Read This Folder

As imagens desta pasta são matéria-prima, não especificações para reprodução literal. O brief e a arquitetura do Axis continuam sendo a fonte de verdade. Cada referência contribui com uma ideia delimitada para evitar que páginas diferentes pareçam produtos diferentes.

Páginas sem uma referência própria serão desenhadas a partir dos mesmos tokens, componentes e princípios compartilhados. Não é necessário encontrar um exemplo pronto para cada tela.

## Shared Direction

### `shared/UI Mix UI Kit — Wireframe Kits on UI8.jpg`

**Usar:**

- composição modular e concisa;
- hierarquia quase monocromática;
- controles agrupados com estados facilmente reconhecíveis;
- proporções simples que podem originar componentes reutilizáveis.

**Não herdar:**

- conteúdo de e-commerce;
- sombras profundas e efeito neumórfico;
- excesso de cartões isolados sem relação operacional.

### `shared/sidebar/sidebar reference.jpg`

**Usar:**

- navegação vertical com ícone e rótulo;
- estado ativo claro e silencioso;
- separação forte entre navegação e conteúdo;
- densidade confortável para desktop.

**Não herdar:**

- páginas ou rótulos da referência;
- busca fixa sem uma função definida no Axis;
- contraste baixo nos itens inativos.

### `shared/Clean Design Layout.jpg`

**Usar:**

- controles segmentados;
- diferença inequívoca entre ativo e inativo;
- agrupamento compacto de ações relacionadas;
- formas consistentes entre seletores e botões.

**Não herdar:**

- aparência elevada de plástico;
- sombras pesadas;
- branco absoluto como única base do tema light.

## Sliding Panel

### `panel/panel reference.jpg`

**Usar:**

- foco em uma decisão por painel;
- hierarquia título, explicação e ação principal;
- sensação de etapa contextual sobre a interface principal;
- largura controlada e conteúdo centralizado.

**Não herdar:**

- glow ou gradiente roxo decorativo;
- integração apresentada como página de produto independente;
- botão flutuante sem função no fluxo do Axis.

O padrão será aplicado aos detalhes de tarefa, nota, evento, hábito e às explicações da Análise. Direção, largura e animação exatas serão definidas na exploração visual.

## Settings

### `settings/settings page.jpg`

**Usar:**

- estrutura desktop em duas regiões;
- abas verticais persistentes;
- agrupamento de configurações por assunto;
- rótulo, descrição e controle alinhados em uma leitura previsível.

**Não herdar:**

- imagem decorativa externa;
- transparência que prejudique contraste;
- ação de logout como requisito do núcleo local-first.

### `settings/apperance page settings.jpg`

**Usar:**

- cartões de prévia para `light`, `dark` e `cream`;
- seleção de tema reconhecível sem depender apenas da cor;
- Aparência como uma área focada, não misturada às outras preferências.

**Não herdar:**

- transparência da sidebar como configuração inicial;
- glassmorphism;
- necessidade de botão Salvar quando a mudança puder ter prévia imediata e reversível.

### `settings/changer accent settings.jpg`

**Usar:**

- apresentação visual de alternativas de aparência;
- redução de movimento como preferência acessível;
- hierarquia entre tema, acessibilidade e opções secundárias.

**Decisão confirmada:**

- o usuário escolhe entre accents `blue`, `purple` e `red`;
- o accent é independente do tema `light`, `dark` ou `cream`;
- azul é o padrão inicial;
- o accent altera ações, seleção e foco, mas não substitui cores semânticas de erro, alerta ou sucesso.

**Não herdar:**

- estrutura mobile e barra inferior;
- brilho e transparência intensos;
- controles que não existem no produto, como qualidade de foto.

## Habits

### `habits/style.jpg`

**Usar:**

- identidade visual pequena e própria para cada hábito;
- agrupamento por momento do dia quando for útil;
- faixa curta de dias para dar contexto à recorrência;
- registro rápido e escaneável.

**Não herdar:**

- navegação mobile;
- ilustração como grande fundo permanente;
- cartões inteiros pintados pela cor do hábito.

### `habits/streak.jpg`

**Usar:**

- sequência apresentada como conquista legível;
- contexto semanal;
- marcos de progresso;
- gamificação que mostra como o resultado foi construído.

**Não herdar:**

- marca, linguagem ou composição da Whoop;
- fogo como identidade obrigatória do Axis;
- ranking comparativo que não tenha base clara;
- punição visual por descanso planejado ou recuperação.

O buddy assumirá a expressão emocional da gamificação. Sequências e marcos continuam explicáveis e não substituem a avaliação do contexto do usuário.

## Notes

### `notes/Minimalist Glassmorphism Notes App UI _ Dark Productivity Dashboard.jpg`

Esta é uma referência **somente para reconhecer a nota como post-it**.

**Usar:**

- card curto com presença física de lembrete;
- silhueta ou detalhe de dobra que comunique post-it;
- leitura rápida de várias notas;
- distinção discreta entre notas fixadas e comuns.

**Não herdar:**

- paleta;
- glassmorphism, blur ou glow;
- sidebar e navegação;
- pastas, compartilhamento ou estrutura de vault;
- layout geral da tela;
- tags, tipografia ou quantidade de metadados;
- fundos coloridos aleatórios.

As notas do Axis usam tokens do tema ativo. O marcador visual é pequeno e semântico; ele não força uma nota cream dentro do tema dark nem transforma cada card em uma cor arbitrária.

## Pages Without Direct References

As páginas abaixo serão derivadas da arquitetura e dos componentes compartilhados:

- Hoje;
- Tarefas;
- Calendário;
- Foco;
- Análise.

Elas não precisam de referências adicionais para iniciar o sistema visual. Novas imagens podem ser acrescentadas depois para corrigir uma direção específica, desde que o arquivo seja acompanhado do elemento que deve ou não ser aproveitado.

## Non-Negotiable Filters

Independentemente da referência:

- todos os elementos respondem corretamente a `light`, `dark` e `cream`;
- gradientes decorativos aleatórios não entram no sistema;
- glassmorphism não define as superfícies principais;
- sombras não substituem bordas, contraste e hierarquia;
- cor comunica estado, identidade ou feedback;
- navegação por teclado, foco visível e redução de movimento permanecem obrigatórios;
- referências mobile são traduzidas para uma experiência desktop, não copiadas literalmente.
