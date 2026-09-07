---
version: 1
slug: 'src-components-layout-mainwindow-tsx'
primary_target: 'src/components/layout/MainWindow.tsx'
related_targets:
  [
    'src/components/layout/LeftSideBar.tsx',
    'src/components/layout/MainWindowContent.tsx',
  ]
---

# App Shell Surface Brief

## Scope

- **Mode:** Operate.
- **Audience:** pessoa trabalhando ou estudando no desktop e alternando entre execução, compromissos e captura.
- **Task:** alcançar qualquer parte do ciclo diário sem reconstruir contexto.
- **Primary action:** abrir Hoje ou iniciar Foco; Captura rápida permanece sempre disponível.
- **Constraints:** sete destinos, estado restaurável, modo compacto, teclado, temas e accents compartilhados; conteúdo interno das páginas permanece fora deste passo.

## Direction contract

**THESIS:** uma coluna de orientação estável substitui a grade de ícones; recusa navegação ambígua e páginas de integração.

**OWN-WORLD:** superfícies sólidas, divisórias precisas, ícones Lucide, rótulos diretos e accent somente na seleção.

**STORY:** o usuário reconhece onde está, muda de etapa e captura algo sem interromper o trabalho.

**FIRST VIEWPORT:** título nativo acima; sidebar de 15rem à esquerda, sete destinos no centro, captura e configurações no rodapé; conteúdo ocupa todo o restante. Em 1000px, a sidebar vira uma rail de 3.5rem com tooltips.

**FORM:** navegação vertical desktop, primeira estrutura do brief; seed `brief-pinned-s4` porque IA e referência fornecida já fixam a composição.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
