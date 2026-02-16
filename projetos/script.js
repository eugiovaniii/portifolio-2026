const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const destinationDailyRate = {
  ubatuba: 280,
  maragogi: 360,
  arraial: 330,
  noronha: 590,
  gramado: 320,
};

const extrasRules = {
  passagens: {
    label: "Passagens",
    calculate: ({ people }) => 850 * people,
  },
  hospedagem: {
    label: "Hospedagem",
    calculate: ({ people, days }) => Math.ceil(people / 2) * 210 * days,
  },
  aluguel: {
    label: "Aluguel de veículo",
    calculate: ({ days }) => 180 * days,
  },
  seguro: {
    label: "Seguro viagem",
    calculate: ({ people, days }) => 35 * people * days,
  },
  cityTour: {
    label: "City tour",
    calculate: ({ people }) => 120 * people,
  },
};

const elements = {
  year: document.getElementById("year"),
  heroSlider: document.getElementById("heroSlider"),
  slides: Array.from(document.querySelectorAll(".slide")),
  dotsContainer: document.getElementById("slideDots"),
  prevSlideBtn: document.getElementById("prevSlideBtn"),
  nextSlideBtn: document.getElementById("nextSlideBtn"),
  quoteForm: document.getElementById("quoteForm"),
  quoteTotal: document.getElementById("quoteTotal"),
  quoteBreakdown: document.getElementById("quoteBreakdown"),
  quoteHelper: document.querySelector(".quote-helper"),
  qtdDias: document.getElementById("qtdDias"),
  dataIda: document.getElementById("dataIda"),
  dataVolta: document.getElementById("dataVolta"),
};

const sliderState = {
  index: 0,
  intervalId: null,
};

init();

function init() {
  if (elements.year) {
    elements.year.textContent = String(new Date().getFullYear());
  }

  setupSlider();
  bindQuoteEvents();
}

function setupSlider() {
  if (elements.slides.length === 0) {
    return;
  }

  elements.slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Ir para slide ${index + 1}`);
    dot.addEventListener("click", () => {
      showSlide(index);
      restartSliderInterval();
    });
    elements.dotsContainer.appendChild(dot);
  });

  elements.prevSlideBtn.addEventListener("click", () => {
    showSlide(sliderState.index - 1);
    restartSliderInterval();
  });

  elements.nextSlideBtn.addEventListener("click", () => {
    showSlide(sliderState.index + 1);
    restartSliderInterval();
  });

  elements.heroSlider.addEventListener("mouseenter", stopSliderInterval);
  elements.heroSlider.addEventListener("mouseleave", startSliderInterval);
  elements.heroSlider.addEventListener("focusin", stopSliderInterval);
  elements.heroSlider.addEventListener("focusout", startSliderInterval);

  showSlide(0);
  startSliderInterval();
}

function showSlide(nextIndex) {
  const lastIndex = elements.slides.length - 1;
  if (nextIndex < 0) {
    sliderState.index = lastIndex;
  } else if (nextIndex > lastIndex) {
    sliderState.index = 0;
  } else {
    sliderState.index = nextIndex;
  }

  elements.slides.forEach((slide, index) => {
    slide.classList.toggle("is-active", index === sliderState.index);
  });

  const dots = elements.dotsContainer.querySelectorAll("button");
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === sliderState.index);
  });
}

function startSliderInterval() {
  stopSliderInterval();
  sliderState.intervalId = window.setInterval(() => {
    showSlide(sliderState.index + 1);
  }, 5000);
}

function stopSliderInterval() {
  if (!sliderState.intervalId) {
    return;
  }

  window.clearInterval(sliderState.intervalId);
  sliderState.intervalId = null;
}

function restartSliderInterval() {
  startSliderInterval();
}

function bindQuoteEvents() {
  elements.quoteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    calculateQuote();
  });

  elements.dataIda.addEventListener("change", syncDaysWithDates);
  elements.dataVolta.addEventListener("change", syncDaysWithDates);
}

function syncDaysWithDates() {
  const start = elements.dataIda.value;
  const end = elements.dataVolta.value;
  if (!start || !end) {
    return;
  }

  const startDate = new Date(`${start}T00:00:00`);
  const endDate = new Date(`${end}T00:00:00`);
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return;
  }

  const diff = Math.round((endDate - startDate) / 86400000);
  if (diff > 0) {
    elements.qtdDias.value = String(diff);
  }
}

function calculateQuote() {
  const formData = new FormData(elements.quoteForm);
  const name = String(formData.get("nome") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const destination = String(formData.get("destino"));
  const people = Number(formData.get("qtdPessoas"));
  const days = Number(formData.get("qtdDias"));
  const start = String(formData.get("dataIda") || "");
  const end = String(formData.get("dataVolta") || "");

  if (!name || !email) {
    alert("Preencha nome e e-mail para gerar a estimativa.");
    return;
  }

  if (!destinationDailyRate[destination]) {
    alert("Destino inválido.");
    return;
  }

  if (!Number.isFinite(people) || people < 1 || !Number.isFinite(days) || days < 1) {
    alert("Informe quantidade de pessoas e dias válidos.");
    return;
  }

  if (start && end && end <= start) {
    alert("A data de volta deve ser posterior à data de ida.");
    return;
  }

  const base = destinationDailyRate[destination] * people * days;
  const selectedServices = formData.getAll("servicos").map((value) => String(value));

  const breakdown = [
    {
      label: `Pacote base (${destinationLabel(destination)})`,
      value: base,
    },
  ];

  selectedServices.forEach((serviceKey) => {
    const rule = extrasRules[serviceKey];
    if (!rule) {
      return;
    }

    const value = rule.calculate({ people, days });
    breakdown.push({ label: rule.label, value });
  });

  const total = breakdown.reduce((sum, item) => sum + item.value, 0);
  renderQuote(total, breakdown, people, days, name);
}

function renderQuote(total, breakdown, people, days, name) {
  elements.quoteHelper.textContent = `${name}, estimativa para ${people} pessoa(s) por ${days} dia(s)`;
  elements.quoteTotal.textContent = currency.format(total);
  elements.quoteBreakdown.innerHTML = "";

  breakdown.forEach((item) => {
    const line = document.createElement("li");
    line.textContent = `${item.label}: ${currency.format(item.value)}`;
    elements.quoteBreakdown.appendChild(line);
  });
}

function destinationLabel(destination) {
  if (destination === "ubatuba") {
    return "Ubatuba";
  }
  if (destination === "maragogi") {
    return "Maragogi";
  }
  if (destination === "arraial") {
    return "Arraial do Cabo";
  }
  if (destination === "noronha") {
    return "Fernando de Noronha";
  }
  return "Gramado";
}
