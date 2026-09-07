# Axis Visual System

## North Star

Axis deve parecer um instrumento desktop calmo e tátil: superfícies neutras se organizam por profundidade, enquanto cor aparece somente quando comunica ação, seleção ou estado. O resultado é mais próximo de uma ferramenta física precisa do que de um dashboard web decorativo.

## Appearance Model

- Surface themes: `light`, `dark` e `cream`.
- Preference mode: `system`, resolvido para `light` ou `dark` pelo sistema operacional.
- Independent accents: `blue`, `purple` e `red`.
- Status colors remain fixed and never inherit the selected accent.

Configurações apresenta cada tema como uma miniatura da interface e os accents como swatches circulares logo abaixo. A seleção deve aplicar e persistir imediatamente.

## Depth Vocabulary

Neumorfismo é usado de forma contida e sem gradientes:

- `shadow-neu-raised`: painéis, cards, widgets e diálogos elevados.
- `shadow-neu-raised-sm`: botões, choices, thumbs e controles compactos.
- `shadow-neu-pressed`: campos editáveis, trilhos rebaixados e o instante em que um controle é pressionado.

Cada tema define suas próprias sombras neutras. Nenhuma sombra usa a cor do accent. A iluminação vem verticalmente do topo: uma linha clara define a borda superior e sombras progressivas caem abaixo do elemento. Bordas semânticas permanecem presentes para preservar hierarquia e contraste em telas diferentes.

## Interaction Contract

- Default actions are raised; pressing them changes to the inset depth.
- Inputs and select triggers are inset before focus.
- Focus always uses the semantic ring and is not communicated by depth alone.
- Selected navigation stays visibly raised above the base plane and combines stronger depth, text weight and accent-aware color.
- Disabled controls use a muted surface, muted text and no raised shadow.
- Hover motion is limited to a subtle lift and respects reduced-motion settings.

## Surface Contract

- Pages use `background` as the base plane.
- Cards and widgets use `surface`; their header rail may use `surface-elevated`.
- Inputs and embedded wells use `surface-sunken`.
- Quick Pane and dialogs use a raised semantic surface, never transparent glass.
- Habit identity colors stay in small markers; they do not fill the card.

## Avoid

- Decorative or randomized gradients.
- Glassmorphism and backdrop blur as the primary depth mechanism.
- Colored cast shadows or accent-tinted widget backgrounds.
- Neumorphic surfaces without visible borders or sufficient text contrast.
- Applying Cream-specific paper colors inside Light or Dark.
