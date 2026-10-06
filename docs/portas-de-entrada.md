# Portas de entrada

O site tem duas portas, decididas no teste com utilizadores (out 2026). O `entry.js`, carregado no `<head>` de `index.html`, decide.

| Quem chega | Como chega | Vai para |
|---|---|---|
| Vem do TikTok | ligação da bio com `?from=tiktok` | `index.html`, o alívio: um toque em "Começar" e começa. Sem "Explorar antes" |
| Vem do Google | pesquisa, ou qualquer endereço sem `from` | `home.html`, antes de qualquer áudio |
| Escreveu o endereço, partilha | raiz sem `from` | `home.html` |
| Volta ao alívio de dentro do site | `index.html#airlock` (Home, Filosofia), "repetir sessão" do feedback, qualquer ligação de uma página do próprio site | `index.html`, sem redirecionar |

## A ligação da bio

```
https://<domínio-do-site>/?from=tiktok
```

Use sempre esta forma. O parâmetro é o sinal fiável; o `entry.js` também reconhece, como reserva, o referrer de `tiktok.com` e o navegador interno do app (`musical_ly`, `BytedanceWebview`, `TikTok` no user-agent), porque o TikTok às vezes corta o referrer.

A origem fica em `sessionStorage` (`neuromedit-origin`: `tiktok` ou `other`) e em `<html data-origin="tiktok">`. O CSS usa o atributo para esconder "Explorar antes".

## Regra do redirecionamento

Só vai para `home.html` quem chega "a frio" a `index.html`: sem `from=tiktok`, sem `#` e sem referrer do próprio site. A origem guardada não conta como "ligação interna": quem escreve a raiz no mesmo separador depois de visitar o site volta à Home.

## Como testar

1. `index.html` sem nada: vai para `home.html`.
2. `index.html?from=tiktok`: fica, `data-origin="tiktok"`, sem "Explorar antes".
3. `index.html#airlock` vindo da Home: fica.
4. `index.html` por uma ligação de `library.html`: fica.

Com a versão alternativa do design (Luz) ligada em Configurações, o alívio abre em `luz.html`; testar com ela desligada.

## Limites

- O redirecionamento é de JavaScript. Sem JavaScript, a raiz abre o alívio.
- Quem vem da pesquisa do Google passa a ser indexado em `home.html`.
