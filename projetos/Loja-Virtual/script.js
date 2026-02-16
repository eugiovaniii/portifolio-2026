const products = [
  {
    id: "fone-orbit",
    name: "Fone Bluetooth Orbit",
    category: "Audio",
    price: 199.9,
    description: "Som estéreo com cancelamento de ruído para estudo e trabalho.",
    badge: "Mais vendido",
  },
  {
    id: "teclado-mec",
    name: "Teclado Mecânico Wave",
    category: "Periféricos",
    price: 329.0,
    description: "Layout ABNT2, switches táteis e iluminação ajustável.",
    badge: "Novo",
  },
  {
    id: "mouse-flow",
    name: "Mouse Flow Pro",
    category: "Periféricos",
    price: 149.5,
    description: "Sensor de alta precisão e design ergonômico para uso diário.",
    badge: "Oferta",
  },
  {
    id: "monitor-27",
    name: "Monitor 27'' Vision",
    category: "Monitores",
    price: 1199.0,
    description: "Tela IPS Full HD com ótima reprodução de cores.",
    badge: "Destaque",
  },
  {
    id: "webcam-clear",
    name: "Webcam Clear 1080p",
    category: "Acessórios",
    price: 259.0,
    description: "Imagem nítida para chamadas de vídeo e reuniões remotas.",
    badge: "Setup",
  },
  {
    id: "cadeira-grid",
    name: "Cadeira Grid Office",
    category: "Escritório",
    price: 899.9,
    description: "Ajuste de altura, apoio lombar e conforto para longas horas.",
    badge: "Conforto",
  },
];

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const storageKey = "lojaVirtualCart";
let cart = loadCart();

const elements = {
  productGrid: document.getElementById("productGrid"),
  productTemplate: document.getElementById("productCardTemplate"),
  categoryFilter: document.getElementById("categoryFilter"),
  sortFilter: document.getElementById("sortFilter"),
  searchInput: document.getElementById("searchInput"),
  catalogResult: document.getElementById("catalogResult"),
  cartList: document.getElementById("cartList"),
  cartTotal: document.getElementById("cartTotal"),
  cartCount: document.getElementById("cartCount"),
  clearCartBtn: document.getElementById("clearCartBtn"),
  checkoutBtn: document.getElementById("checkoutBtn"),
  year: document.getElementById("year"),
};

if (elements.year) {
  elements.year.textContent = String(new Date().getFullYear());
}

init();

function init() {
  fillCategoryFilter();
  renderProducts();
  renderCart();

  elements.categoryFilter.addEventListener("change", renderProducts);
  elements.sortFilter.addEventListener("change", renderProducts);
  elements.searchInput.addEventListener("input", renderProducts);

  elements.clearCartBtn.addEventListener("click", () => {
    cart = {};
    persistCart();
    renderCart();
  });

  elements.checkoutBtn.addEventListener("click", () => {
    const total = getCartTotal();
    if (total === 0) {
      return;
    }

    alert(`Compra simulada com sucesso. Total: ${currency.format(total)}`);
  });

  elements.cartList.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) {
      return;
    }

    const cartItem = actionButton.closest("li[data-id]");
    if (!cartItem) {
      return;
    }

    const productId = cartItem.dataset.id;
    const action = actionButton.dataset.action;

    if (action === "inc") {
      updateQuantity(productId, 1);
    }

    if (action === "dec") {
      updateQuantity(productId, -1);
    }

    if (action === "remove") {
      removeFromCart(productId);
    }
  });
}

function loadCart() {
  try {
    const savedCart = localStorage.getItem(storageKey);
    const parsedCart = savedCart ? JSON.parse(savedCart) : {};

    if (!parsedCart || typeof parsedCart !== "object" || Array.isArray(parsedCart)) {
      return {};
    }

    const sanitizedCart = {};
    Object.entries(parsedCart).forEach(([id, quantity]) => {
      if (typeof quantity !== "number" || !Number.isFinite(quantity)) {
        return;
      }

      if (quantity <= 0) {
        return;
      }

      sanitizedCart[id] = Math.floor(quantity);
    });

    return sanitizedCart;
  } catch {
    return {};
  }
}

function persistCart() {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}

function fillCategoryFilter() {
  const categories = [...new Set(products.map((product) => product.category))];
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    elements.categoryFilter.appendChild(option);
  });
}

function getFilteredProducts() {
  const query = elements.searchInput.value.trim().toLowerCase();
  const category = elements.categoryFilter.value;
  const sort = elements.sortFilter.value;

  const filtered = products.filter((product) => {
    const categoryOk = category === "all" || product.category === category;
    const textOk =
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query);

    return categoryOk && textOk;
  });

  if (sort === "priceAsc") {
    return filtered.sort((a, b) => a.price - b.price);
  }

  if (sort === "priceDesc") {
    return filtered.sort((a, b) => b.price - a.price);
  }

  if (sort === "nameAsc") {
    return filtered.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  }

  return filtered;
}

function renderProducts() {
  elements.productGrid.innerHTML = "";

  const filteredProducts = getFilteredProducts();
  elements.catalogResult.textContent = `${filteredProducts.length} produtos exibidos`;

  if (filteredProducts.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Nenhum produto encontrado para esse filtro.";
    elements.productGrid.appendChild(emptyMessage);
    return;
  }

  filteredProducts.forEach((product) => {
    const fragment = elements.productTemplate.content.cloneNode(true);

    const badge = fragment.querySelector(".product-badge");
    const name = fragment.querySelector(".product-name");
    const description = fragment.querySelector(".product-description");
    const price = fragment.querySelector(".product-price");
    const button = fragment.querySelector(".add-btn");

    badge.textContent = `${product.badge} - ${product.category}`;
    name.textContent = product.name;
    description.textContent = product.description;
    price.textContent = currency.format(product.price);

    button.addEventListener("click", () => {
      addToCart(product.id);
    });

    elements.productGrid.appendChild(fragment);
  });
}

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  persistCart();
  renderCart();
}

function updateQuantity(productId, change) {
  const current = cart[productId] || 0;
  const next = current + change;

  if (next <= 0) {
    delete cart[productId];
  } else {
    cart[productId] = next;
  }

  persistCart();
  renderCart();
}

function removeFromCart(productId) {
  delete cart[productId];
  persistCart();
  renderCart();
}

function getProductById(productId) {
  return products.find((product) => product.id === productId);
}

function getCartTotal() {
  return Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = getProductById(productId);
    if (!product) {
      return total;
    }

    return total + product.price * quantity;
  }, 0);
}

function renderCart() {
  elements.cartList.innerHTML = "";

  const entries = Object.entries(cart);
  if (entries.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "cart-empty";
    emptyItem.textContent = "Seu carrinho está vazio.";
    elements.cartList.appendChild(emptyItem);

    elements.cartCount.textContent = "0";
    elements.cartTotal.textContent = currency.format(0);
    elements.clearCartBtn.disabled = true;
    elements.checkoutBtn.disabled = true;
    return;
  }

  let count = 0;

  entries.forEach(([productId, quantity]) => {
    const product = getProductById(productId);
    if (!product) {
      return;
    }

    count += quantity;

    const item = document.createElement("li");
    item.className = "cart-item";
    item.dataset.id = productId;

    item.innerHTML = `
      <div>
        <p class="cart-item-name">${product.name}</p>
        <p class="cart-item-price">${currency.format(product.price)} cada</p>
      </div>
      <div class="qty-controls">
        <button type="button" data-action="dec" aria-label="Diminuir quantidade">-</button>
        <span class="qty">${quantity}</span>
        <button type="button" data-action="inc" aria-label="Aumentar quantidade">+</button>
        <button class="remove" type="button" data-action="remove" aria-label="Remover item">x</button>
      </div>
    `;

    elements.cartList.appendChild(item);
  });

  elements.cartCount.textContent = String(count);
  elements.cartTotal.textContent = currency.format(getCartTotal());
  elements.clearCartBtn.disabled = false;
  elements.checkoutBtn.disabled = false;
}
