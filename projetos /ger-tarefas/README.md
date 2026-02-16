# Gerenciador de Tarefas

Aplicação front-end para gestão de tarefas, com persistência no `localStorage`.

## Visão geral

O projeto permite criar tarefas com prioridade e prazo, acompanhar status e filtrar por busca/estado.

## Funcionalidades

- Cadastro de tarefa com:
  - descrição
  - prioridade (`alta`, `média`, `baixa`)
  - prazo opcional
- Marcação de tarefa como concluída/pendente.
- Filtro por status:
  - todas
  - pendentes
  - concluídas
- Busca por texto da tarefa.
- Exclusão individual de tarefa.
- Limpeza em lote das tarefas concluídas.
- Contadores de total, pendentes e concluídas.
- Persistência de dados no navegador.

## Estrutura

- `index.html`: layout da aplicação (formulário, filtros, lista e estatísticas).
- `style.css`: estilo responsivo com cards e componentes de interação.
- `script.js`: estado da aplicação, regras de filtro e persistência local.

## Como executar

1. Abra `index.html` no navegador.
2. Cadastre tarefas e altere os filtros para testar o fluxo completo.

## Armazenamento local

- `gerTarefas.tasks.v2`: array com as tarefas e seus metadados.

## Melhorias futuras

- Edição de tarefa.
- Ordenação manual por drag-and-drop.
- Lembretes com notificação.
