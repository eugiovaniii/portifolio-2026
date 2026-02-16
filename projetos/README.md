# Loja Virtual

Projeto front-end de catálogo com carrinho local, feito com HTML, CSS e JavaScript vanilla.

## Visão geral

A aplicação simula uma loja simples: o usuário busca produtos, filtra por categoria, ordena resultados e monta um carrinho com persistência em `localStorage`.

## Funcionalidades

- Busca por nome e descrição.
- Filtro por categoria.
- Ordenação por preço e nome.
- Carrinho com incremento, decremento e remoção de itens.
- Total de itens e valor total atualizado em tempo real.
- Persistência do carrinho entre recargas da página.
- Checkout simulado com confirmação de compra.

## Estrutura

- `index.html`: layout da loja, catálogo e painel de carrinho.
- `style.css`: estilos responsivos e componentes visuais.
- `script.js`: catálogo, filtros, regras do carrinho e persistência.

## Como executar

1. Abra `index.html` no navegador.
2. Adicione produtos no carrinho.
3. Recarregue a página para validar persistência dos dados.

## Armazenamento local

- `lojaVirtualCart`: objeto `{ productId: quantidade }` salvo no navegador.

## Melhorias futuras

- Cupons de desconto.
- Simulação de frete por CEP.
- Integração com API de produtos.
