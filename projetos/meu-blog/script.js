const STORAGE_POSTS_KEY = "meuBlog.posts.v2";
const STORAGE_VIEW_KEY = "meuBlog.viewMode";
const LEGACY_POSTS_KEY = "posts";

const elements = {
  year: document.getElementById("year"),
  searchInput: document.getElementById("searchInput"),
  resultCount: document.getElementById("resultCount"),
  viewToggle: document.getElementById("viewToggle"),
  viewModeLabel: document.getElementById("viewModeLabel"),
  newPostBtn: document.getElementById("newPostBtn"),
  postForm: document.getElementById("postForm"),
  cancelPostBtn: document.getElementById("cancelPostBtn"),
  postTitle: document.getElementById("postTitle"),
  postContent: document.getElementById("postContent"),
  postsContainer: document.getElementById("postsContainer"),
  emptyState: document.getElementById("emptyState"),
};

let posts = loadPosts();

init();

function init() {
  if (elements.year) {
    elements.year.textContent = String(new Date().getFullYear());
  }

  bindEvents();
  applySavedViewMode();
  renderPosts();
}

function bindEvents() {
  elements.searchInput.addEventListener("input", () => {
    renderPosts(elements.searchInput.value);
  });

  elements.newPostBtn.addEventListener("click", () => {
    toggleComposer();
  });

  elements.cancelPostBtn.addEventListener("click", () => {
    closeComposer(true);
  });

  elements.postForm.addEventListener("submit", (event) => {
    event.preventDefault();
    createPost();
  });

  elements.postsContainer.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("button[data-delete-id]");
    if (!deleteButton) {
      return;
    }

    const postId = deleteButton.dataset.deleteId;
    if (!postId) {
      return;
    }

    const confirmed = confirm("Deseja apagar este post?");
    if (!confirmed) {
      return;
    }

    deletePost(postId);
  });

  elements.viewToggle.addEventListener("change", () => {
    const mode = elements.viewToggle.checked ? "mobile" : "desktop";
    applyViewMode(mode);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeComposer(false);
    }
  });
}

function loadPosts() {
  const currentPosts = parseStoredPosts(localStorage.getItem(STORAGE_POSTS_KEY));
  if (currentPosts.length > 0) {
    return currentPosts;
  }

  const legacyPosts = parseLegacyPosts(localStorage.getItem(LEGACY_POSTS_KEY));
  if (legacyPosts.length > 0) {
    persistPosts(legacyPosts);
    return legacyPosts;
  }

  return [];
}

function parseStoredPosts(rawValue) {
  try {
    const parsed = JSON.parse(rawValue || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((post) => normalizePost(post))
      .filter((post) => post !== null);
  } catch {
    return [];
  }
}

function parseLegacyPosts(rawValue) {
  try {
    const parsed = JSON.parse(rawValue || "[]");
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((post, index) => {
        if (!post || typeof post.title !== "string" || typeof post.content !== "string") {
          return null;
        }

        return {
          id: generateId(),
          title: post.title.trim(),
          content: post.content.trim(),
          createdAt: new Date(Date.now() - (parsed.length - index) * 60000).toISOString(),
        };
      })
      .filter((post) => post !== null && post.title && post.content);
  } catch {
    return [];
  }
}

function normalizePost(post) {
  if (!post || typeof post !== "object") {
    return null;
  }

  const title = typeof post.title === "string" ? post.title.trim() : "";
  const content = typeof post.content === "string" ? post.content.trim() : "";
  if (!title || !content) {
    return null;
  }

  return {
    id: typeof post.id === "string" && post.id ? post.id : generateId(),
    title,
    content,
    createdAt: typeof post.createdAt === "string" ? post.createdAt : new Date().toISOString(),
  };
}

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function persistPosts(nextPosts) {
  localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(nextPosts));
}

function createPost() {
  const title = elements.postTitle.value.trim();
  const content = elements.postContent.value.trim();

  if (title.length < 3 || content.length < 5) {
    alert("Preencha título e conteúdo com pelo menos 3 e 5 caracteres.");
    return;
  }

  const newPost = {
    id: generateId(),
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  posts = [newPost, ...posts];
  persistPosts(posts);

  elements.postForm.reset();
  closeComposer(false);
  renderPosts(elements.searchInput.value);
}

function deletePost(postId) {
  posts = posts.filter((post) => post.id !== postId);
  persistPosts(posts);
  renderPosts(elements.searchInput.value);
}

function getFilteredPosts(term = "") {
  const normalizedTerm = term.trim().toLowerCase();
  if (!normalizedTerm) {
    return posts;
  }

  return posts.filter((post) => {
    return (
      post.title.toLowerCase().includes(normalizedTerm) ||
      post.content.toLowerCase().includes(normalizedTerm)
    );
  });
}

function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Data indisponível";
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderPosts(term = "") {
  const filteredPosts = getFilteredPosts(term);
  elements.postsContainer.innerHTML = "";

  filteredPosts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "post";

    const header = document.createElement("div");
    header.className = "post-head";

    const title = document.createElement("h3");
    title.textContent = post.title;

    const meta = document.createElement("p");
    meta.className = "post-meta";
    meta.textContent = `Publicado em ${formatDate(post.createdAt)}`;

    const content = document.createElement("p");
    content.className = "post-content";
    content.textContent = post.content;

    const actions = document.createElement("div");
    actions.className = "post-actions";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-btn";
    deleteButton.textContent = "Apagar";
    deleteButton.dataset.deleteId = post.id;

    header.appendChild(title);
    actions.appendChild(deleteButton);

    article.appendChild(header);
    article.appendChild(meta);
    article.appendChild(content);
    article.appendChild(actions);

    elements.postsContainer.appendChild(article);
  });

  renderEmptyState(filteredPosts.length, term);
  updateResultCount(filteredPosts.length, term);
}

function renderEmptyState(resultCount, term) {
  const hasPosts = posts.length > 0;
  const hasResults = resultCount > 0;
  const hasTerm = Boolean(term.trim());

  if (hasResults) {
    elements.emptyState.classList.add("hidden");
    return;
  }

  if (!hasPosts) {
    elements.emptyState.textContent = "Nenhum post ainda. Crie o primeiro.";
  } else if (hasTerm) {
    elements.emptyState.textContent = "Nenhum post encontrado para essa busca.";
  } else {
    elements.emptyState.textContent = "Nenhum resultado disponível.";
  }

  elements.emptyState.classList.remove("hidden");
}

function updateResultCount(resultCount, term) {
  const hasTerm = Boolean(term.trim());
  const label = resultCount === 1 ? "resultado" : "resultados";
  elements.resultCount.textContent = hasTerm
    ? `${resultCount} ${label} para "${term.trim()}"`
    : `${resultCount} ${label} no feed`;
}

function toggleComposer() {
  const isHidden = elements.postForm.classList.contains("hidden");
  if (isHidden) {
    openComposer();
  } else {
    closeComposer(false);
  }
}

function openComposer() {
  elements.postForm.classList.remove("hidden");
  elements.newPostBtn.textContent = "Fechar editor";
  elements.postTitle.focus();
}

function closeComposer(clearFields) {
  if (elements.postForm.classList.contains("hidden")) {
    return;
  }

  elements.postForm.classList.add("hidden");
  elements.newPostBtn.textContent = "Escrever post";
  if (clearFields) {
    elements.postForm.reset();
  }
}

function applySavedViewMode() {
  const savedMode = localStorage.getItem(STORAGE_VIEW_KEY);
  const initialMode = savedMode === "mobile" ? "mobile" : "desktop";
  applyViewMode(initialMode);
}

function applyViewMode(mode) {
  const isMobile = mode === "mobile";
  document.body.classList.toggle("mobile-mode", isMobile);
  elements.viewToggle.checked = isMobile;
  elements.viewModeLabel.textContent = isMobile ? "Mobile" : "Desktop";
  localStorage.setItem(STORAGE_VIEW_KEY, isMobile ? "mobile" : "desktop");
}
