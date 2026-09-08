---
version: 1
slug: 'src-pages-calendarpage-tsx'
primary_target: 'src/pages/CalendarPage.tsx'
related_targets:
  [
    'src/lib/calendar-page-domain.ts',
    'src/store/calendar-store.ts',
    'locales/pt-BR.json',
    'locales/en.json',
  ]
---

# Calendar Surface Brief

## Scope

- **Mode:** Operate.
- **Audience:** pessoa organizando compromissos e ações datadas sem sair do ciclo diário do Axis.
- **Task:** entender a carga da semana, consultar o mês e criar algo já associado ao tempo escolhido.
- **Primary action:** clicar em um horário ou dia para iniciar uma criação temporal preenchida.
- **Constraints:** Semana padrão, Mês como visão geral, sem terceira visualização Agenda, funcionamento local independente de integrações e linguagem visual compartilhada entre light, dark e cream.

## Direction contract

**THESIS:** uma superfície temporal dominante reúne calendário e contexto do dia; recusa grade genérica isolada e uma segunda navegação lateral.

**OWN-WORLD:** neumorfismo contido do Axis, iluminação de cima para baixo, superfícies sólidas, divisórias precisas, controles elevados e accent reservado para seleção e ação.

**STORY:** o usuário entra vendo a semana real, percorre o tempo, seleciona um ponto e cria um evento ou tarefa sem corrigir a data depois.

**FIRST VIEWPORT:** cabeçalho editorial curto acima de um shell elevado; dentro dele, rail contextual estreita para o dia selecionado e calendário amplo com período, Hoje, anterior/próximo e Semana/Mês. A referência fornecida orienta proporção e hierarquia, não sua paleta nem uma sidebar duplicada.

**FORM:** instrumento de agenda desktop adaptado da referência fornecida; seed `user-reference-calendar-2026-09-08` porque o usuário fixou a composição e autorizou adaptação direta.

**FINISH:** esta rodada termina validada em código e pronta para capturas reais do Tauri nos três temas; Google Calendar e lembretes de Notas permanecem explicitamente fora desta etapa.
