# CLAUDE.md — NeuroMedit

Instruções para o Claude (e qualquer agente) que trabalhe neste repositório.

## Interface: ler o design system antes de mexer

Qualquer alteração de interface — CSS, HTML com estilos, componentes, páginas novas, estados, animações — começa por ler o design system oficial:

https://claude.ai/artifact/JHzwjfKnJ11kwCCJkcxvrQ

1. Lê `project/README.md` e `project/tokens.json` do artifact (ação `read`), e o `README.md` do componente que vais tocar em `project/components/<Nome>/`.
2. Usa **só os tokens dele**: nenhuma cor, fonte, raio, sombra ou duração nova fora dos tokens. No CSS, `var(--nome-do-token)`, nunca o valor literal — incluindo fallbacks de `var()`.
3. Usa os componentes existentes (Button, Chip, BottomNav, SessionOrb, LuzOrbButton, Planeta) antes de criar outro.
4. Se faltar um valor ou componente, **não o inventes no código**: propõe-o primeiro como adição ao design system e espera que entre lá.
5. O que o design system marca como "Decidido, ainda por implementar" é direção, não código atual.

Regras completas, temas e lista de componentes: [`DESIGN.md`](DESIGN.md).

## Outras notas

- Português do Brasil é a língua canónica do texto; as traduções vivem em `translations-*.js` via `data-i18n`.
- Mostrar o diff antes de qualquer commit.
