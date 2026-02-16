const STORAGE_KEY = "gerTarefas.tasks.v2";

const elements = {
  year: document.getElementById("year"),
  taskForm: document.getElementById("taskForm"),
  taskInput: document.getElementById("taskInput"),
  taskPriority: document.getElementById("taskPriority"),
  taskDueDate: document.getElementById("taskDueDate"),
  searchInput: document.getElementById("searchInput"),
  filterButtons: document.querySelectorAll("button[data-filter]"),
  clearCompletedBtn: document.getElementById("clearCompletedBtn"),
  taskList: document.getElementById("taskList"),
  emptyState: document.getElementById("emptyState"),
  totalCount: document.getElementById("totalCount"),
  pendingCount: document.getElementById("pendingCount"),
  completedCount: document.getElementById("completedCount"),
};

const state = {
  tasks: loadTasks(),
  filter: "all",
  term: "",
};

init();

function init() {
  if (elements.year) {
    elements.year.textContent = String(new Date().getFullYear());
  }

  bindEvents();
  render();
}

function bindEvents() {
  elements.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addTask();
  });

  elements.searchInput.addEventListener("input", () => {
    state.term = elements.searchInput.value;
    render();
  });

  elements.filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      updateFilterUI();
      render();
    });
  });

  elements.clearCompletedBtn.addEventListener("click", clearCompletedTasks);

  elements.taskList.addEventListener("change", (event) => {
    const checkbox = event.target.closest("input[data-toggle-id]");
    if (!checkbox) {
      return;
    }

    toggleTask(checkbox.dataset.toggleId);
  });

  elements.taskList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("button[data-delete-id]");
    if (!deleteButton) {
      return;
    }

    const confirmed = confirm("Deseja remover esta tarefa?");
    if (!confirmed) {
      return;
    }

    deleteTask(deleteButton.dataset.deleteId);
  });
}

function loadTasks() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(rawValue || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((task) => normalizeTask(task))
      .filter((task) => task !== null);
  } catch {
    return [];
  }
}

function normalizeTask(task) {
  if (!task || typeof task !== "object") {
    return null;
  }

  const title = typeof task.title === "string" ? task.title.trim() : "";
  if (!title) {
    return null;
  }

  const priority = ["alta", "media", "baixa"].includes(task.priority) ? task.priority : "media";
  const dueDate = typeof task.dueDate === "string" ? task.dueDate : "";

  return {
    id: typeof task.id === "string" && task.id ? task.id : generateId(),
    title,
    priority,
    dueDate,
    completed: Boolean(task.completed),
    createdAt: typeof task.createdAt === "string" ? task.createdAt : new Date().toISOString(),
  };
}

function persistTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function addTask() {
  const title = elements.taskInput.value.trim();
  const priority = elements.taskPriority.value;
  const dueDate = elements.taskDueDate.value;

  if (title.length < 3) {
    alert("Digite pelo menos 3 caracteres na tarefa.");
    return;
  }

  state.tasks.unshift({
    id: generateId(),
    title,
    priority,
    dueDate,
    completed: false,
    createdAt: new Date().toISOString(),
  });

  persistTasks();
  elements.taskForm.reset();
  elements.taskPriority.value = "media";
  elements.taskInput.focus();
  render();
}

function toggleTask(taskId) {
  state.tasks = state.tasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

    return { ...task, completed: !task.completed };
  });

  persistTasks();
  render();
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);
  persistTasks();
  render();
}

function clearCompletedTasks() {
  const hasCompleted = state.tasks.some((task) => task.completed);
  if (!hasCompleted) {
    return;
  }

  const confirmed = confirm("Deseja remover todas as tarefas concluídas?");
  if (!confirmed) {
    return;
  }

  state.tasks = state.tasks.filter((task) => !task.completed);
  persistTasks();
  render();
}

function getPriorityWeight(priority) {
  if (priority === "alta") {
    return 0;
  }

  if (priority === "media") {
    return 1;
  }

  return 2;
}

function getFilteredTasks() {
  const term = state.term.trim().toLowerCase();

  const byFilter = state.tasks.filter((task) => {
    if (state.filter === "pending") {
      return !task.completed;
    }

    if (state.filter === "completed") {
      return task.completed;
    }

    return true;
  });

  const byTerm = byFilter.filter((task) => {
    if (!term) {
      return true;
    }

    return task.title.toLowerCase().includes(term);
  });

  return byTerm.sort((a, b) => {
    if (a.completed !== b.completed) {
      return Number(a.completed) - Number(b.completed);
    }

    const priorityDiff = getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    if (a.dueDate && b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }

    if (a.dueDate) {
      return -1;
    }

    if (b.dueDate) {
      return 1;
    }

    return b.createdAt.localeCompare(a.createdAt);
  });
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Sem prazo";
  }

  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return "Sem prazo";
  }

  return date.toLocaleDateString("pt-BR");
}

function render() {
  const visibleTasks = getFilteredTasks();
  elements.taskList.innerHTML = "";

  visibleTasks.forEach((task) => {
    const item = document.createElement("li");
    item.className = `task-item${task.completed ? " is-done" : ""}`;
    item.dataset.taskId = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Marcar tarefa "${task.title}"`);
    checkbox.dataset.toggleId = task.id;

    const content = document.createElement("div");
    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("p");
    meta.className = "task-meta";

    const priority = document.createElement("span");
    priority.className = `priority-chip ${task.priority}`;
    priority.textContent = `Prioridade ${task.priority}`;

    const due = document.createElement("span");
    due.textContent = `Prazo: ${formatDate(task.dueDate)}`;

    meta.appendChild(priority);
    meta.appendChild(due);

    content.appendChild(title);
    content.appendChild(meta);

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Excluir";
    deleteButton.dataset.deleteId = task.id;

    item.appendChild(checkbox);
    item.appendChild(content);
    item.appendChild(deleteButton);

    elements.taskList.appendChild(item);
  });

  renderEmptyState(visibleTasks.length);
  renderStats();
}

function renderEmptyState(visibleCount) {
  if (visibleCount > 0) {
    elements.emptyState.classList.add("hidden");
    return;
  }

  if (state.tasks.length === 0) {
    elements.emptyState.textContent = "Nenhuma tarefa cadastrada.";
  } else if (state.term.trim()) {
    elements.emptyState.textContent = "Nenhuma tarefa encontrada para essa busca.";
  } else if (state.filter === "completed") {
    elements.emptyState.textContent = "Nenhuma tarefa concluída por enquanto.";
  } else if (state.filter === "pending") {
    elements.emptyState.textContent = "Nenhuma tarefa pendente.";
  } else {
    elements.emptyState.textContent = "Nenhuma tarefa disponível.";
  }

  elements.emptyState.classList.remove("hidden");
}

function renderStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => task.completed).length;
  const pending = total - completed;

  elements.totalCount.textContent = String(total);
  elements.pendingCount.textContent = String(pending);
  elements.completedCount.textContent = String(completed);
  elements.clearCompletedBtn.disabled = completed === 0;
}

function updateFilterUI() {
  elements.filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === state.filter;
    button.classList.toggle("is-active", isActive);
  });
}
