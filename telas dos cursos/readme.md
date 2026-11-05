# Curso de HTML | DevAcademy — Guia visual

Este arquivo documenta **todo o visual** das páginas do Curso de HTML: cores, tipografia, tamanhos, espaçamentos, efeitos e comportamento no celular. Use como consulta sempre que for mexer no CSS.

> Conversão usada nas tabelas: **1rem = 16px** (padrão do navegador).

---

## 1. Visão geral

| Item | Valor |
|---|---|
| Tema | Escuro (estilo "dark mode"), com tons de cinza e um azul de destaque |
| Fonte do site | **Poppins** (Google Fonts) |
| Fonte do código | **Courier New** (só na janelinha de código) |
| Ícones | **Font Awesome 6.4.0** (CDN) |
| Base de estilos | `home.css` (já existente) + 4 arquivos novos do curso |

---

## 2. Estrutura de arquivos

```text
Curso-HTML/
├── home.css              -> estilos da home (navbar, hero, cards, footer)
├── base-curso.css        -> peças comuns: botões, etiqueta, migalhas, caixa geral
├── pagina-curso.css      -> só da página de apresentação (curso-html.html)
├── pagina-modulos.css    -> só da lista de módulos (modulos.html)
├── pagina-modulo.css     -> só das 6 páginas de módulo (modulo-1.html ... modulo-6.html)
├── curso-html.html
├── modulos.html
├── modulo-1.html ... modulo-6.html
└── pdf/                  -> os 6 PDFs dos módulos
```

Ordem de carregamento do CSS em cada página: `home.css` → `base-curso.css` → CSS da própria página.

---

## 3. Paleta de cores

### 3.1 Fundos

| Cor | Código | Onde é usada |
|---|---|---|
| Fundo da página | `#0d1117` | `body`, campos de formulário |
| Fundo dos cards e painéis | `#161b22` | `.card`, `.leitor-menu`, `.leitor-pdf`, `.resumo-item`, `.curso-cta-caixa`, barra da janelinha de código |
| Fundo da navbar | `rgba(22, 27, 34, 0.8)` | `.navbar` (com desfoque de 10px) |
| Fundo da janelinha de código | `#010409` | `.mini-codigo` (preto mais escuro que a página) |

### 3.2 Textos

| Cor | Código | Onde é usada |
|---|---|---|
| Texto principal (branco suave) | `#e6edf3` | `body`, botão secundário, texto do código, hover do menu lateral |
| Texto secundário (cinza) | `#8b949e` | links da navbar, parágrafos, subtítulos, rodapé, migalhas, nível do módulo, descrições, menu lateral |
| Branco puro | `#ffffff` | texto "Dev" da logo, texto dos botões azuis |

### 3.3 Azul (cor de destaque)

| Cor | Código | Onde é usada |
|---|---|---|
| Azul de destaque | `#58a6ff` | "Academy" na logo, link ativo/hover da navbar, palavra "HTML" no título, "MÓDULO 1", "Ler módulo", etiquetas, número dos passos, ícones, módulo atual no menu, links das migalhas, borda ao passar o mouse nos cards |
| Azul dos botões | `#1f6feb` | `.btn-curso` (botão "Ver os módulos", "Baixar PDF", "Próximo módulo") |
| Azul do botão no hover | `#388bfd` | `.btn-curso:hover` |
| Azul translúcido 15% | `rgba(88, 166, 255, 0.15)` | fundo das etiquetas, dos quadradinhos de ícone, do círculo dos passos, do número dos módulos, do item "atual" do menu |
| Azul translúcido 35% | `rgba(88, 166, 255, 0.35)` | borda da caixa "Pronto para começar?" |

### 3.4 Bordas e linhas

Todas são brancas com transparência, para funcionar em cima do fundo escuro.

| Cor | Código | Onde é usada |
|---|---|---|
| Borda suave | `rgba(255, 255, 255, 0.08)` | cards, painéis, menu lateral, moldura do PDF, itens da lista de módulos |
| Borda média | `rgba(255, 255, 255, 0.1)` | linha embaixo da navbar, janelinha de código |
| Borda do nível | `rgba(255, 255, 255, 0.12)` | pílula "Iniciante", "Intermediário"... |
| Borda de botão | `rgba(255, 255, 255, 0.2)` | botão secundário "Como funciona", "Abrir em nova aba" |
| Hover claro | `rgba(255, 255, 255, 0.05)` | fundo do botão secundário e dos links do menu ao passar o mouse; linha do rodapé |

### 3.5 Cor de status

| Cor | Código | Onde é usada |
|---|---|---|
| Verde | `#3fb950` | mensagem de status do formulário de perfil (`home.css`) |

### 3.6 Cores do código (janelinha da página inicial)

| Cor | Código | O que pinta |
|---|---|---|
| Vermelho | `#ff7b72` | tags (`<h1>`, `</p>`) — classe `.c-tag` |
| Azul médio | `#79c0ff` | atributos (`class`, `href`) — `.c-atributo` |
| Azul claro | `#a5d6ff` | valores entre aspas — `.c-valor` |
| Branco suave | `#e6edf3` | texto normal — `.c-texto` |
| Cinza | `#8b949e` | comentários — `.c-comentario` |

Bolinhas da barra (estilo janela de editor):

| Bolinha | Código |
|---|---|
| Vermelha | `#ff5f56` |
| Amarela | `#ffbd2e` |
| Verde | `#27c93f` |

### 3.7 Todos os códigos das cores (copie e cole)

Este bloco reúne **todas as cores do site** como variáveis CSS. Cole no topo do `home.css` e, se quiser, troque os valores `#...` nas regras por `var(--nome)`.

```css
:root {
    --cor-fundo-pagina: #0d1117;  /* Fundo da página (body) */
    --cor-fundo-card: #161b22;    /* Cards, painéis, menu lateral, moldura do PDF */
    --cor-fundo-codigo: #010409;  /* Fundo da janelinha de código */
    --cor-texto: #e6edf3;         /* Texto principal */
    --cor-texto-suave: #8b949e;   /* Texto secundário (cinza) */
    --cor-branco: #ffffff;        /* Logo e texto dos botões azuis */
    --cor-destaque: #58a6ff;      /* Azul de destaque (links, etiquetas, ícones) */
    --cor-botao: #1f6feb;         /* Fundo do botão azul */
    --cor-botao-hover: #388bfd;   /* Botão azul ao passar o mouse */
    --cor-sucesso: #3fb950;       /* Verde de status */
    --cod-tag: #ff7b72;           /* Código: tags */
    --cod-atributo: #79c0ff;      /* Código: atributos */
    --cod-valor: #a5d6ff;         /* Código: valores entre aspas */
    --bolinha-vermelha: #ff5f56;  /* Bolinha vermelha da janelinha */
    --bolinha-amarela: #ffbd2e;   /* Bolinha amarela da janelinha */
    --bolinha-verde: #27c93f;     /* Bolinha verde da janelinha */

    /* Cores com transparência (rgba) */
    --azul-15: rgba(88, 166, 255, 0.15);        /* Fundo de etiquetas, ícones e item atual do menu */
    --azul-35: rgba(88, 166, 255, 0.35);        /* Borda da caixa final */
    --navbar-fundo: rgba(22, 27, 34, 0.8);      /* Fundo da navbar */
    --borda-suave: rgba(255, 255, 255, 0.08);   /* Borda de cards e painéis */
    --borda-media: rgba(255, 255, 255, 0.1);    /* Borda da navbar e da janelinha de código */
    --borda-nivel: rgba(255, 255, 255, 0.12);   /* Borda da pílula de nível */
    --borda-botao: rgba(255, 255, 255, 0.2);    /* Borda de botões secundários e campos */
    --hover-claro: rgba(255, 255, 255, 0.05);   /* Fundo ao passar o mouse */
}
```

Tabela com HEX e RGB de cada cor sólida:

| Nome | HEX | RGB | Uso |
|---|---|---|---|
| `--cor-fundo-pagina` | `#0d1117` | `rgb(13, 17, 23)` | Fundo da página (body) |
| `--cor-fundo-card` | `#161b22` | `rgb(22, 27, 34)` | Cards, painéis, menu lateral, moldura do PDF |
| `--cor-fundo-codigo` | `#010409` | `rgb(1, 4, 9)` | Fundo da janelinha de código |
| `--cor-texto` | `#e6edf3` | `rgb(230, 237, 243)` | Texto principal |
| `--cor-texto-suave` | `#8b949e` | `rgb(139, 148, 158)` | Texto secundário (cinza) |
| `--cor-branco` | `#ffffff` | `rgb(255, 255, 255)` | Logo e texto dos botões azuis |
| `--cor-destaque` | `#58a6ff` | `rgb(88, 166, 255)` | Azul de destaque (links, etiquetas, ícones) |
| `--cor-botao` | `#1f6feb` | `rgb(31, 111, 235)` | Fundo do botão azul |
| `--cor-botao-hover` | `#388bfd` | `rgb(56, 139, 253)` | Botão azul ao passar o mouse |
| `--cor-sucesso` | `#3fb950` | `rgb(63, 185, 80)` | Verde de status |
| `--cod-tag` | `#ff7b72` | `rgb(255, 123, 114)` | Código: tags |
| `--cod-atributo` | `#79c0ff` | `rgb(121, 192, 255)` | Código: atributos |
| `--cod-valor` | `#a5d6ff` | `rgb(165, 214, 255)` | Código: valores entre aspas |
| `--bolinha-vermelha` | `#ff5f56` | `rgb(255, 95, 86)` | Bolinha vermelha da janelinha |
| `--bolinha-amarela` | `#ffbd2e` | `rgb(255, 189, 46)` | Bolinha amarela da janelinha |
| `--bolinha-verde` | `#27c93f` | `rgb(39, 201, 63)` | Bolinha verde da janelinha |

Exemplo de uso:

```css
.card {
    background: var(--cor-fundo-card);
    border: 1px solid var(--borda-suave);
}
```

---

## 4. Tipografia

**Família:** `'Poppins', sans-serif`, aplicada em **todos** os elementos por `* { font-family: ... }`.
**Pesos importados do Google Fonts:** 300, 400, 600 e 700.
**Peso 500:** os links da navbar pedem 500, que não foi importado. O navegador usa o peso mais próximo.

### 4.1 Tamanhos por elemento

| Elemento | Classe / tag | Tamanho | Peso | Altura da linha |
|---|---|---|---|---|
| Texto da logo | `.logo-text` | 1.5rem (24px) | 700 | — |
| Links da navbar | `.nav-links a` | 1rem (16px) | 500 | — |
| Título do topo | `.hero-content h1` | 3rem (48px) | padrão do h1 (negrito) | 1.2 |
| Parágrafo do topo | `.hero-content p` | 1.1rem (17,6px) | 400 | 1.6 |
| Título de seção | `.section-title` | 2rem (32px) | padrão do h2 (negrito) | — |
| Subtítulo de seção | `.section-subtitle` | 1rem (16px) | 400 | — |
| Texto de card | `.card p` | 0.95rem (15,2px) | 400 | 1.5 |
| Título de card | `.card h3` | 1.17rem (~18,7px, padrão do h3) | negrito | — |
| Parágrafo "O que é HTML?" | `.curso-explicacao-texto p` | 1.05rem (16,8px) | 400 | 1.7 |
| Título da caixa final | `.curso-cta-caixa h2` | 1.5rem (24px, padrão do h2) | negrito | — |
| Título dos módulos (lista) | `.modulos-topo h1` | 2.3rem (36,8px) | negrito | — |
| Texto do topo (lista) | `.modulos-topo p` | 1rem (16px) | 400 | 1.6 |
| "MÓDULO 1" | `.modulo-numero` | 0.8rem (12,8px) | 700 | — |
| Nível do módulo | `.modulo-nivel` | 0.75rem (12px) | 400 | — |
| "Ler módulo" | `.modulo-acao` | 1rem (16px) | 600 | — |
| Título do módulo (PDF) | `.leitor-cabecalho h1` | 2rem (32px) | negrito | — |
| Descrição do módulo | `.leitor-cabecalho p` | 1rem (16px) | 400 | 1.6 |
| Título do menu lateral | `.leitor-menu h2` | 1rem (16px) | negrito | — |
| Links do menu lateral | `.leitor-menu a` | 0.9rem (14,4px) | 400 (600 no "atual") | — |
| Aviso embaixo do PDF | `.leitor-pdf-aviso` | 0.88rem (14,1px) | 400 | — |
| Botão azul | `.btn-curso` | 1rem (16px) | 600 | — |
| Botão secundário | `.btn-secondary` | 1rem (16px) | 600 | — |
| Etiqueta | `.etiqueta` | 0.8rem (12,8px) | 600 | — |
| Migalhas | `.migalhas` | 0.9rem (14,4px) | 400 | — |
| Item do resumo (título) | `.resumo-item h3` | 1rem (16px) | negrito | — |
| Item do resumo (texto) | `.resumo-item p` | 0.85rem (13,6px) | 400 | — |
| Número dos passos e módulos | `.passo-numero`, `.resumo-numero` | 1rem (16px) | 700 | — |
| Código da janelinha | `.mini-codigo-corpo` | 0.95rem (15,2px), Courier New | 400 | 1.9 |
| Nome do arquivo na janelinha | `.mini-codigo-nome` | 0.8rem (12,8px) | 400 | — |
| Rodapé | `.footer` | 0.9rem (14,4px) | 400 | — |

### 4.2 Detalhes de texto

| Detalhe | Valor | Onde |
|---|---|---|
| Letras maiúsculas | `text-transform: uppercase` | `.modulo-numero` |
| Espaço entre letras | `letter-spacing: 0.08em` | `.modulo-numero` |
| Quebra de linha preservada | `white-space: pre-wrap` | `.mini-codigo-corpo` |

---

## 5. Ícones (Font Awesome 6.4.0)

| Ícone | Classe | Onde aparece |
|---|---|---|
| Seta para a direita | `fa-solid fa-arrow-right` | "Ver os módulos", "Ler módulo", "Próximo módulo" |
| Seta para a esquerda | `fa-solid fa-arrow-left` | "Módulo anterior", "Todos os módulos" |
| HTML5 | `fa-brands fa-html5` | card "HTML: a estrutura" e card do curso na home |
| CSS3 | `fa-brands fa-css3-alt` | card "CSS: o visual" |
| JavaScript | `fa-brands fa-js` | card "JavaScript: o comportamento" |
| Download | `fa-solid fa-download` | "Baixar PDF" |
| Abrir em nova aba | `fa-solid fa-up-right-from-square` | "Abrir em nova aba" |
| Bandeira quadriculada | `fa-solid fa-flag-checkered` | "Concluir curso" (módulo 6) |

Tamanho dos ícones dentro dos quadradinhos de explicação: **1.3rem (20,8px)**.

---

## 6. Tamanhos e espaçamentos

### 6.1 Navbar

| Propriedade | Valor |
|---|---|
| Posição | `fixed` (fica por cima da página, grudada no topo) |
| Padding | `1.2rem 8%` (celular: `1rem 5%`) |
| Desfoque do fundo | `blur(10px)` |
| Linha de baixo | 1px `rgba(255,255,255,0.1)` |
| Logo | largura 40px, espaço de 10px até o texto |
| Espaço entre links | 20px (tablet: 12px / celular: 8px) |
| z-index | 1000 (fica acima de tudo) |

### 6.2 Topo da página do curso (hero)

| Propriedade | Valor |
|---|---|
| Padding | `160px 8% 80px` (tablet: padding-top 120px) |
| Altura mínima | `90vh` |
| Largura do texto | máx. 600px |
| Janelinha de código | largura 100%, máx. 460px |
| Espaço entre botões | 15px |

### 6.3 Seções

| Seção | Padding |
|---|---|
| Seções com cards (`.features-section`) | `80px 8%` |
| "O que é HTML?" (`.curso-explicacao`) | `70px 8% 30px` |
| "Os 6 módulos" (`.resumo-modulos`) | `60px 8% 70px` |
| Chamada final (`.curso-cta`) | `0 8% 90px` |
| Páginas internas (`.pagina-conteudo`) | `120px 8% 70px`, largura máx. 1200px (celular: padding-top 105px) |
| Rodapé | `20px` |

### 6.4 Cards

| Propriedade | Valor |
|---|---|
| Padding | 30px |
| Colunas | `repeat(auto-fit, minmax(280px, 1fr))` (cada card tem no mínimo 280px) |
| Espaço entre cards | 25px |
| Efeito no hover | sobe 5px e a borda fica azul |

### 6.5 Botões e etiquetas

| Elemento | Padding | Raio da borda | Espaço ícone/texto |
|---|---|---|---|
| `.btn-curso` | 12px 24px | 6px | 8px |
| `.btn-secondary` | 12px 24px | 6px | — |
| `.etiqueta` | 5px 14px | 999px (pílula) | — |
| `.modulo-nivel` | 3px 10px | 999px (pílula) | — |

### 6.6 Lista de módulos e resumo

| Elemento | Tamanho |
|---|---|
| Descrição do topo (`.modulos-topo p`) | largura máx. 640px |
| Grade de módulos | mesmas colunas dos cards, espaço de 25px, margem de 40px acima |
| Resumo "Os 6 módulos" | 2 colunas, espaço de 16px, largura máx. 900px |
| `.resumo-item` | padding 18px 20px, raio 12px, espaço interno 16px |
| Quadradinho do número (`.resumo-numero`) | 40 x 40px, raio 10px |
| Círculo do passo (`.passo-numero`) | 44 x 44px, círculo (raio 50%) |
| Quadradinho do ícone (`.explicacao-icone`) | 48 x 48px, raio 12px |
| Texto "O que é HTML?" | largura máx. 760px |
| Caixa final | padding 50px 30px, raio 12px |

### 6.7 Janelinha de código

| Elemento | Tamanho |
|---|---|
| Janela (`.mini-codigo`) | raio 12px, borda 1px |
| Barra de cima (`.mini-codigo-barra`) | padding 12px 16px, espaço de 7px entre bolinhas |
| Bolinhas (`.bolinha`) | 12 x 12px, círculo |
| Corpo do código (`.mini-codigo-corpo`) | padding 22px |

### 6.8 Página de módulo (leitor de PDF)

| Elemento | Tamanho |
|---|---|
| Layout (`.leitor`) | 2 colunas: menu de **280px** + conteúdo; espaço de 30px |
| Menu lateral (`.leitor-menu`) | `position: sticky`, `top: 100px`, padding 20px, raio 12px |
| Itens do menu | padding 10px 12px, raio 8px, espaço de 6px entre itens |
| Botões de ação (`.leitor-acoes`) | espaço de 12px, margem de 20px em cima e embaixo |
| PDF (`iframe`) | largura 100%, altura **78vh** (celular: 65vh) |
| Moldura do PDF (`.leitor-pdf`) | raio 12px |
| Aviso embaixo do PDF | padding 14px 18px |
| Botões Anterior/Próximo | espaço de 12px, margem de 26px acima |

---

## 7. Bordas arredondadas (border-radius)

| Valor | Onde |
|---|---|
| 6px | botões (`.btn-curso`, `.btn-secondary`), campos de formulário |
| 8px | itens do menu lateral |
| 10px | quadradinho do número do módulo |
| 12px | cards, painéis, janelinha de código, caixa final, moldura do PDF, quadradinho de ícone |
| 999px | etiquetas e pílulas de nível |
| 50% | bolinhas e círculos dos passos |

---

## 8. Efeitos e animações

| Efeito | Valor | Onde |
|---|---|---|
| Card sobe ao passar o mouse | `transform: translateY(-5px)`, `transition: 0.3s` | `.card:hover` |
| Troca de cor da borda | `transition: border-color 0.3s` | cards e `.resumo-item` |
| Troca de cor de link | `transition: color 0.3s` | links da navbar |
| Troca de cor de botão | `transition: background 0.3s` | `.btn-curso`, `.btn-secondary` |
| Desfoque da navbar | `backdrop-filter: blur(10px)` | `.navbar` |
| Foco do teclado | `outline: 2px solid #58a6ff` | cards de curso, campos de formulário |
| Animação "flutuando" | `float 4s ease-in-out infinite` | `.floating-robo` (existe no `home.css`, não é usada nas páginas do curso) |

---

## 9. Responsividade (celular e tablet)

### Até 900px (tablet)

| O que muda | Como fica |
|---|---|
| Topo (`.hero-section`) | itens em coluna, texto centralizado, padding-top 120px |
| Janelinha de código | vai para baixo do texto, com 40px de margem acima |
| Resumo "Os 6 módulos" | de 2 colunas para 1 |
| Leitor de PDF | menu lateral vai para cima do conteúdo e deixa de "grudar" na tela |

### Até 520px (celular)

| O que muda | Como fica |
|---|---|
| Navbar | padding `1rem 5%`, logo 1.2rem, links 0.85rem com espaço de 8px |
| Páginas internas | padding-top 105px |
| Título do módulo (`.leitor-cabecalho h1`) | 1.6rem (25,6px) |
| PDF | altura 65vh |

---

## 10. Contraste e acessibilidade

Razões de contraste calculadas (WCAG: mínimo **4,5:1** para texto normal e **3:1** para texto grande).

| Combinação | Razão | Resultado |
|---|---|---|
| Texto principal `#e6edf3` sobre `#0d1117` | 16,0 : 1 | Passa |
| Texto cinza `#8b949e` sobre `#0d1117` | 6,2 : 1 | Passa |
| Texto cinza `#8b949e` sobre `#161b22` (cards) | 5,6 : 1 | Passa |
| Azul `#58a6ff` sobre `#0d1117` | 7,5 : 1 | Passa |
| Azul `#58a6ff` sobre `#161b22` | 6,9 : 1 | Passa |
| Branco sobre botão `#1f6feb` | 4,6 : 1 | Passa |
| Branco sobre botão no hover `#388bfd` | 3,3 : 1 | **Abaixo de 4,5:1** para texto normal |
| Verde `#3fb950` sobre `#0d1117` | 7,5 : 1 | Passa |
| Código: `#ff7b72`, `#79c0ff`, `#a5d6ff` sobre `#010409` | 8,1 a 13,4 : 1 | Passa |

**Ponto de atenção:** no hover, o botão azul fica mais claro e o texto branco perde contraste. Para corrigir, use um azul um pouco mais escuro no `.btn-curso:hover`, por exemplo `#1a5fd0`.

**Outras boas práticas já aplicadas:**
- Todas as imagens têm `alt`.
- O `<iframe>` do PDF tem `title`.
- Links de navegação e botões têm texto claro, sem "clique aqui".
- Foco do teclado: os cards de curso e os campos de formulário têm contorno azul; os demais links usam o contorno padrão do navegador.
- Idioma da página definido com `lang="pt-BR"`.
- Layout adaptado a celular com `meta viewport` e media queries.

---

## 11. Como mudar o visual com facilidade (opcional)

Hoje as cores estão escritas direto em cada regra. Para trocar a cor de destaque em todo o site de uma vez só, use as **variáveis CSS** do item **3.7**: cole o bloco `:root` no topo do `home.css` e, nas regras, troque o código da cor por `var(--nome)`.

Exemplo: se `--cor-destaque` passar de `#58a6ff` para outra cor, todo lugar que usa `var(--cor-destaque)` muda junto.

---

*Os valores deste guia foram conferidos nos arquivos CSS entregues. Se você mudar alguma cor ou tamanho, atualize a tabela correspondente.*