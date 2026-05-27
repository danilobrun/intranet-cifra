---
name: Cifra Intranet
description: Sistema operacional interno para acesso a portais e informacoes da Cifra Engenharia.
colors:
  primary-action-blue: "#0d6efd"
  secondary-institutional-gray: "#6c757d"
  operational-dark: "#212529"
  surface-white: "#ffffff"
  surface-soft: "#f8f9fa"
  border-muted: "#dee2e6"
  border-control: "#ced4da"
  border-card: "#d9d9d9"
  disabled-surface: "#e9ecef"
  divider-gray: "#d1d1d1"
  utility-muted-line: "#999999"
  danger-action-red: "#dc3545"
  info-alert-cyan: "#0dcaf0"
typography:
  headline:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  xs: "5px"
  sm: "0.375rem"
  md: "0.5rem"
  lg: "0.85rem"
  xl: "18px"
  xxl: "20px"
spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary-action-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  button-dark:
    backgroundColor: "{colors.operational-dark}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  button-secondary:
    backgroundColor: "{colors.secondary-institutional-gray}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.sm}"
    padding: "0.375rem 0.75rem"
  input-default:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.operational-dark}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  portal-card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.operational-dark}"
    rounded: "{rounded.md}"
    padding: "1rem"
  chatbot-card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.operational-dark}"
    rounded: "{rounded.xxl}"
    padding: "1.5rem"
---

# Design System: Cifra Intranet

## 1. Overview

**Creative North Star: "Painel de Confianca Operacional"**

A Intranet Cifra deve parecer uma mesa de trabalho organizada para uso interno: direta, familiar e confiavel. O desenho atual parte do Bootstrap 5 e de styled-components pontuais, entao a evolucao visual deve lapidar a interface sem trocar a linguagem de uma vez.

O sistema visual precisa manter a sensacao de produto operacional. A prioridade e ajudar colaboradores a entrar, encontrar portais, ler tabelas e acessar links sem ruido. A identidade aparece no uso consistente do logo, na estrutura previsivel de navegacao, nos tons institucionais discretos e no acabamento mais cuidadoso dos componentes.

Este sistema rejeita o "visual generico de Bootstrap sem identidade propria" citado em PRODUCT.md. Tambem rejeita telas poluidas, excesso de cards decorativos, mudancas visuais bruscas, modismos de dashboard e uma aparencia antiga ou improvisada.

**Key Characteristics:**
- Base Bootstrap preservada, com padroes mais consistentes de cor, espacamento e estados.
- Superficies brancas e cinzas claros para leitura de tabelas, formularios e portais.
- Acentos usados para acao, estado e selecao, nunca como decoracao solta.
- Navegacao simples: topo publico, sidebar operacional e tabelas como centro do fluxo.
- Melhorias visuais discretas, sempre mantendo familiaridade para usuarios existentes.

## 2. Colors

A paleta atual e restrita: azul Bootstrap para a acao primaria, cinzas institucionais para navegacao e texto auxiliar, branco para superficies e cinzas claros para bordas e camadas.

### Primary
- **Azul de Acao Bootstrap** (`primary-action-blue`): usado por botoes primarios, foco de campos e acoes principais. Deve continuar raro e funcional.

### Secondary
- **Cinza Institucional** (`secondary-institutional-gray`): usado nas barras publicas com `bg-secondary bg-gradient`, em badges e em acoes secundarias.
- **Escuro Operacional** (`operational-dark`): usado na sidebar, em botoes escuros e nas mensagens do usuario no chatbot.

### Tertiary
- **Vermelho de Acao Perigosa** (`danger-action-red`): usado apenas para exclusao e confirmacoes destrutivas.
- **Ciano de Alerta Informativo** (`info-alert-cyan`): usado por alertas informativos do Bootstrap.

### Neutral
- **Superficie Branca** (`surface-white`): base de formularios, cards, modais, bubbles do assistente e paineis de login.
- **Superficie Suave** (`surface-soft`): camada de fundo para listas internas, como o seletor de portais por role.
- **Borda Muted** (`border-muted`): divisores de listas, cards internos e containers com baixo peso visual.
- **Borda de Controle** (`border-control`): borda padrao de inputs e campos de busca.
- **Borda de Card** (`border-card`): borda dos cards elevados do chatbot.
- **Superficie Desabilitada** (`disabled-surface`): estado disabled de campos e controles.
- **Linha Divisoria** (`divider-gray`): separadores simples em conteudo de enderecos.
- **Linha Utilitaria** (`utility-muted-line`): separadores antigos em fluxos de autenticacao.

### Named Rules

**The Functional Accent Rule.** O azul primario deve indicar acao, foco ou selecao. Se um elemento nao e clicavel, atual ou importante para o fluxo, ele nao deve ganhar azul.

**The Neutral Trust Rule.** Superficies de operacao devem ficar em branco, cinza claro ou cinza institucional. Evite fundos saturados em telas de trabalho.

## 3. Typography

**Display Font:** sem familia display dedicada. Use a stack do sistema para todos os titulos.
**Body Font:** system-ui com fallback para "Segoe UI", Roboto, "Helvetica Neue", Arial e sans-serif.
**Label/Mono Font:** sem fonte mono dedicada.

**Character:** A tipografia atual e utilitaria e familiar. Ela deve continuar parecendo produto interno, com peso e escala suficientes para organizar telas, sem fontes decorativas ou titulos exagerados.

### Hierarchy
- **Headline** (500, `2.5rem`, `1.2`): usado em `h1` de paginas como Dashboard, Portais, Roles, Contratos e Enderecos. Deve abrir a tela com clareza, nao como hero de marketing.
- **Title** (600, `1.25rem`, `1.2`): usado em secoes compactas, cards, modais e componentes como chatbot.
- **Body** (400, `1rem`, `1.5`): usado para texto de formularios, tabelas, descricoes e mensagens. Prosa longa deve ficar em ate 65 a 75 caracteres por linha quando estiver fora de tabela.
- **Label** (600, `0.95rem`, `normal`): usado em labels importantes, autores de mensagens e contadores. Labels comuns de formulario podem manter o peso padrao do Bootstrap quando a tela estiver densa.

### Named Rules

**The Product Type Rule.** Nao use fonte display em labels, botoes, tabelas ou dados. O sistema deve parecer confiavel por consistencia, nao por tipografia ornamental.

## 4. Elevation

O sistema atual usa uma mistura de camadas planas e sombras moderadas. A maioria das telas depende de bordas, tabelas e superficie branca; os cards de portais usam a sombra do Bootstrap, enquanto o chatbot usa uma sombra mais ampla e suave para separar area de conversa e painel lateral.

### Shadow Vocabulary
- **Bootstrap Card Shadow** (`shadow`): usado nos cards de portais. Indica item clicavel na grade sem competir com o conteudo.
- **Chatbot Ambient Lift** (`box-shadow: 0 18px 42px rgba(17, 24, 39, 0.08)`): usado em `ChatCard` e `SupportCard`. Deve ficar reservado para superficies complexas ou de suporte.

### Named Rules

**The Flat First Rule.** Telas administrativas, formularios e tabelas ficam planas por padrao. Use sombra apenas para cards clicaveis, paineis complexos ou estados que realmente precisam de separacao.

## 5. Components

### Buttons
- **Shape:** cantos Bootstrap discretos (`0.375rem`).
- **Primary:** azul de acao com texto branco, padding padrao do Bootstrap (`0.375rem 0.75rem`).
- **Hover / Focus:** manter tratamento padrao do Bootstrap, com foco visivel. Em novos componentes, use transicoes curtas de 150 a 200 ms.
- **Secondary / Dark / Danger:** secondary para cancelar ou apoio, dark para acoes do chatbot e danger apenas para exclusao.

### Cards / Containers
- **Corner Style:** cards comuns usam `0.5rem` quando customizados; chatbot usa cantos mais amplos (`20px`) por ser uma superficie conversacional.
- **Background:** branco para conteudo, cinza suave para listas internas.
- **Shadow Strategy:** cards de portais podem usar `shadow`; cards de suporte podem usar `0 18px 42px rgba(17, 24, 39, 0.08)`.
- **Border:** cinza claro (`#dee2e6` ou `#d9d9d9`) para separar sem pesar.
- **Internal Padding:** formularios e paineis usam `1rem` a `1.5rem`; listas internas usam `12px`.

### Inputs / Fields
- **Style:** fundo branco, texto escuro, borda cinza clara (`#ced4da`) e radius `0.375rem`.
- **Focus:** borda azul (`#0d6efd`) e halo leve em campos de codigo (`rgba(13, 110, 253, 0.15)`).
- **Error / Disabled:** disabled usa cinza claro (`#e9ecef`). Erros devem usar componentes Bootstrap de alerta ou invalid feedback, sem depender apenas de cor.

### Tables
- **Style:** Bootstrap `striped`, `hover` quando houver acao por linha, e `responsive` em telas estreitas.
- **Density:** tabelas podem ser densas. O conteudo operacional e prioridade, desde que cabecalhos, links e dados essenciais continuem legiveis.
- **Links:** links dentro de tabelas devem ser claramente clicaveis e manter contraste suficiente.

### Navigation
- **Public Header:** navbar secundaria com gradiente Bootstrap, logo da Cifra e links brancos.
- **Operational Shell:** sidebar escura (`#212529`) com largura fixa de `280px`, topbar clara e menu responsivo que vira overlay em telas menores que `991px`.
- **Active State:** manter o estado `active` do Bootstrap nos itens da sidebar. Nao inventar affordances de navegacao que quebrem o padrao conhecido.

### Auth Shell
- **Style:** fundo fotografico fixo com brilho reduzido, painel branco central, logo no topo e carrossel de imagens institucionais.
- **Role:** a tela de login e o momento mais institucional do produto. Ela pode carregar mais imagem, mas o formulario deve continuar simples e direto.

### Chatbot
- **Style:** cards brancos elevados, bordas `#d9d9d9`, radius `20px`, bolhas com radius `18px`.
- **Message States:** assistente em branco com texto escuro; usuario em escuro operacional com texto branco.
- **Behavior:** textarea com envio por Enter, botao dark e indicador de resposta com spinner pequeno.

## 6. Do's and Don'ts

### Do:
- **Do** preservar a familiaridade do visual atual em qualquer melhoria.
- **Do** usar o azul primario apenas para acoes, foco, selecao ou elementos interativos.
- **Do** manter tabelas responsivas e links dentro de tabelas com aparencia claramente clicavel.
- **Do** melhorar componentes Bootstrap com detalhes consistentes de borda, espacamento e estado, sem trocar todo o sistema visual de uma vez.
- **Do** usar bordas cinza claras (`#dee2e6`, `#ced4da`, `#d9d9d9`) para organizar superficies sem pesar a interface.
- **Do** manter contraste adequado e navegacao simples, conforme PRODUCT.md.

### Don't:
- **Don't** criar um "visual generico de Bootstrap sem identidade propria".
- **Don't** criar telas poluidas, excesso de cards decorativos ou modismos de dashboard.
- **Don't** fazer mudancas visuais bruscas que transformem completamente a identidade ja reconhecida pelos usuarios.
- **Don't** usar fontes display, gradientes chamativos, glassmorphism decorativo ou animacoes de enfeite em telas operacionais.
- **Don't** usar cor saturada em estados inativos ou em elementos que nao sejam acao, foco, selecao ou alerta.
- **Don't** depender apenas de cor para comunicar permissao, erro, sucesso ou selecao.
