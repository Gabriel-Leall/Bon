---
target: src/pages/CalendarPage.tsx
audit_health_score: 17
p0_count: 0
p1_count: 0
p2_count: 3
p3_count: 1
timestamp: 2026-09-08T14:00:00Z
slug: src-pages-calendarpage-tsx
---

# Auditoria técnica do Calendário

## Audit Health Score

| #         | Dimensão                     |      Nota | Achado principal                                                                   |
| --------- | ---------------------------- | --------: | ---------------------------------------------------------------------------------- |
| 1         | Acessibilidade               |         3 | O intervalo inválido apenas desabilitava Salvar, sem explicar a correção.          |
| 2         | Performance                  |         3 | Formatadores `Intl` eram reconstruídos em cada célula e renderização.              |
| 3         | Responsividade               |         3 | A linha do tempo exigia rolagem vertical e o rail lateral entrava cedo demais.     |
| 4         | Temas                        |         4 | A superfície usa apenas tokens semânticos compartilhados pelos três temas.         |
| 5         | Integridade de implementação |         4 | O detector retornou zero achados e a composição expressa o fluxo temporal do Axis. |
| **Total** |                              | **17/20** | **Bom — corrigir os atritos localizados antes do commit.**                         |

## Veredito de integridade

**Passou.** A página não é uma grade intercambiável: Semana é a visão padrão,
o dia selecionado oferece contexto, a criação nasce do horário escolhido e os
tipos Evento/Tarefa permanecem distinguíveis por ícone, texto e cor semântica.
O detector determinístico executado em `CalendarPage.tsx` retornou `[]`.

## Achados priorizados

### [P2] Escala horária exige rolagem desnecessária

- **Impacto:** os últimos horários ficam fora do quadro mesmo em uma janela alta,
  obrigando o usuário a procurar o fim do dia.
- **Correção aplicada:** a hora passou de 48 px para 38 px; as 16 faixas entre
  06:00 e 22:00 agora ocupam 608 px e permanecem legíveis.
- **Comando relacionado:** `/impeccable layout`.

### [P2] Mensagem ausente para intervalo inválido

- **Impacto:** Salvar ficava desabilitado sem informar por quê.
- **Correção aplicada:** o campo Fim agora recebe estado inválido, descrição
  acessível e mensagem direta de recuperação.
- **Comando relacionado:** `/impeccable harden`.

### [P2] Custo repetido de internacionalização

- **Impacto:** a grade criava dezenas de instâncias de `Intl.DateTimeFormat` a
  cada renderização.
- **Correção aplicada:** os formatadores de data e hora passaram a ser
  reutilizados por locale e conjunto de opções.
- **Comando relacionado:** `/impeccable optimize`.

### [P3] Rail contextual comprime a semana em largura intermediária

- **Impacto:** perto do breakpoint desktop a grade ganhava rolagem horizontal
  antes de a composição realmente comportar duas colunas.
- **Correção aplicada:** o rail só ocupa a coluna lateral a partir de `xl`; antes
  disso ele se organiza acima do calendário.
- **Comando relacionado:** `/impeccable adapt`.

## Pontos positivos

- Foco, seleção e ações usam accent; superfícies e sombras continuam neutras.
- Todos os controles novos têm rótulos, foco visível e estado pressionado.
- A criação temporal utiliza o `Sheet` compartilhado e preserva o contexto.
- Não há gradientes, vidro, halos coloridos ou uma terceira visão Agenda.

## Próximas ações

1. **[P2] `/impeccable polish`:** confirmar a composição corrigida nas capturas
   reais light, dark e cream após esta rodada.

Após as correções, execute novamente a auditoria somente quando houver uma nova
mudança material na superfície.
