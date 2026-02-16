# Meu Blog

Projeto front-end de blog local, feito com HTML, CSS e JavaScript vanilla.

## Visão geral

O app permite criar, buscar e remover posts com persistência no `localStorage`.
Não existe backend: todo o estado fica no navegador.

## Funcionalidades

- Criação de posts com validação mínima de título e conteúdo.
- Feed renderizado dinamicamente com data/hora de publicação.
- Busca em tempo real por título e conteúdo.
- Exclusão individual de post com confirmação.
- Estado vazio para feed sem conteúdo ou busca sem resultados.
- Alternância entre visualização `Desktop` e `Mobile`, com preferência salva.
- Migração automática de dados legados salvos na chave antiga `posts`.

## Estrutura de arquivos

- `index.html`: estrutura semântica do app (controles, formulário e feed).
- `style.css`: estilo responsivo, componentes de card, switch e modo mobile.
- `script.js`: lógica de estado, renderização, persistência e eventos.

## Como executar

1. Abra `index.html` no navegador.
2. Clique em `Escrever post` para abrir o editor.
3. Publique, busque e remova posts no feed.

## Armazenamento local

- `meuBlog.posts.v2`: lista de posts atual.
- `meuBlog.viewMode`: preferência de visualização (`desktop` ou `mobile`).
- `posts`: chave antiga migrada automaticamente quando existir.

## Melhorias futuras

- Edição de post existente.
- Tags por post e filtro por tag.
- Paginação para feeds grandes.
