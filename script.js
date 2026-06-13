const body = document.body;
const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

body.classList.remove("no-js");

function showToast(message) {
  const toast = qs("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.hidden = true;
  }, 2800);
}

function visible(selector) {
  const element = qs(selector);
  return Boolean(element && !element.hidden);
}

function syncBodyLock() {
  body.classList.toggle(
    "is-locked",
    visible("[data-drawer]") || visible("[data-account-panel]") || visible("[data-bag-panel]") || visible("[data-cookie-modal]")
  );
}

function openLayer(selector) {
  const element = qs(selector);
  if (!element) return;
  element.hidden = false;
  syncBodyLock();
}

function closeLayer(selector) {
  const element = qs(selector);
  if (!element) return;
  element.hidden = true;
  syncBodyLock();
}

function closeUtilityPanels() {
  closeLayer("[data-account-panel]");
  closeLayer("[data-bag-panel]");
}

qsa("[data-menu-open]").forEach((button) => {
  button.addEventListener("click", () => openLayer("[data-drawer]"));
});

qsa("[data-menu-close]").forEach((button) => {
  button.addEventListener("click", () => closeLayer("[data-drawer]"));
});

qsa("[data-account-open]").forEach((button) => {
  button.addEventListener("click", () => {
    closeLayer("[data-drawer]");
    closeLayer("[data-bag-panel]");
    openLayer("[data-account-panel]");
  });
});

qsa("[data-bag-open]").forEach((button) => {
  button.addEventListener("click", () => {
    closeLayer("[data-account-panel]");
    openLayer("[data-bag-panel]");
  });
});

qsa("[data-panel-close]").forEach((button) => {
  button.addEventListener("click", closeUtilityPanels);
});

qsa("[data-search-open]").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = qs("[data-search-panel]");
    if (!panel) return;
    panel.hidden = false;
    renderRecentSearches();
    renderSearchResults();
    qs("input", panel)?.focus();
  });
});

qsa("[data-search-close]").forEach((button) => {
  button.addEventListener("click", () => {
    closeLayer("[data-search-panel]");
  });
});

const recentKey = "hip_recent_searches";
const searchCatalogPath = "data/products.normalized.json";
let searchCatalog = null;
let searchTimer = null;

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatCurrency(value, currency = "GBP") {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      minimumFractionDigits: amount % 1 ? 2 : 0,
      maximumFractionDigits: amount % 1 ? 2 : 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

function normalizeSearchProduct(item) {
  if (!item) return null;
  const id = item.id || item.product_id || item.productId || item.sku || item.slug || "";
  const sourceSlug = item.sourceSlug || item.source_slug || item.slug || slugify(item.title || id);
  const routeSlug = item.routeSlug || item.route_slug || (sourceSlug && id ? `${sourceSlug}-${id}` : sourceSlug);
  if (!routeSlug) return null;
  const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
  return {
    routeSlug,
    title: item.title || item.full_name || "Product",
    brand: item.brand || "Product",
    sku: String(item.sku || id || ""),
    categoryPath: item.categoryPath || item.category_path || item.category || "",
    price: Number(item.price || 0),
    currency: item.currency || "GBP",
    image: item.mainImage || item.main_image || item.image || images[0] || "placeholder.svg",
  };
}

async function loadSearchCatalog() {
  if (searchCatalog) return searchCatalog;
  const backend = window.HipStoreBackend;
  if (backend && typeof backend.isConfigured === "function" && backend.isConfigured() && typeof backend.getCatalog === "function") {
    try {
      const raw = await backend.getCatalog();
      searchCatalog = (Array.isArray(raw) ? raw : []).map(normalizeSearchProduct).filter(Boolean);
      return searchCatalog;
    } catch (error) {
      console.warn("Catalog backend unavailable, using local catalog file:", error);
    }
  }
  const response = await fetch(searchCatalogPath, { cache: "no-store" });
  if (!response.ok) throw new Error(`Failed to load ${searchCatalogPath}`);
  const raw = await response.json();
  searchCatalog = (Array.isArray(raw) ? raw : []).map(normalizeSearchProduct).filter(Boolean);
  return searchCatalog;
}

function readRecentSearches() {
  try {
    return JSON.parse(window.localStorage.getItem(recentKey)) || [];
  } catch {
    return [];
  }
}

function writeRecentSearches(searches) {
  try {
    window.localStorage.setItem(recentKey, JSON.stringify(searches.slice(0, 8)));
  } catch {
    // Private browsing can block storage; the search UI still works without it.
  }
}

function saveRecentSearch(term) {
  const cleanTerm = term.trim();
  if (!cleanTerm) return;
  const searches = readRecentSearches().filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
  writeRecentSearches([cleanTerm, ...searches]);
  renderRecentSearches();
}

function renderRecentSearches() {
  const wrapper = qs("[data-recent-searches]");
  const list = qs("[data-recent-list]");
  const clearButton = qs("[data-recent-clear]");
  const hasQuery = Boolean(qs("#site-search")?.value.trim());
  if (!wrapper || !list) return;

  const searches = readRecentSearches();
  wrapper.hidden = searches.length === 0 || hasQuery;
  if (clearButton) clearButton.hidden = searches.length === 0 || hasQuery;
  list.innerHTML = searches
    .map((term) => `<li><a href="shop.html?search=${encodeURIComponent(term)}" data-recent-search-link="${escapeHtml(term)}">${escapeHtml(term)}</a></li>`)
    .join("");
}

function buildSearchResult(product) {
  return (
    `<a class="search-result" href="product/index.html?slug=${encodeURIComponent(product.routeSlug)}">` +
      `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.title)}">` +
      `<span class="search-result__meta"><span>${escapeHtml(product.brand)}</span><strong>${escapeHtml(product.title)}</strong><em>${formatCurrency(product.price, product.currency)}</em></span>` +
    `</a>`
  );
}

async function renderSearchResults() {
  const results = qs("[data-search-results]");
  const input = qs("#site-search");
  const query = input?.value.trim().toLowerCase() || "";
  if (!results) return;
  if (!query) {
    results.innerHTML = "";
    renderRecentSearches();
    return;
  }
  results.innerHTML = '<div class="search-panel__section-title">Products</div><p class="search-panel__empty">Searching...</p>';
  try {
    const products = await loadSearchCatalog();
    const matches = products
      .filter((product) =>
        [product.title, product.brand, product.sku, product.routeSlug, product.categoryPath]
          .join(" ")
          .toLowerCase()
          .includes(query)
      )
      .slice(0, 12);
    if (!matches.length) {
      results.innerHTML = '<div class="search-panel__section-title">Products</div><p class="search-panel__empty">No matching products were found.</p>';
    } else {
      results.innerHTML = `<div class="search-panel__section-title">Products</div><ul class="search-panel__list">${matches.map((product) => `<li>${buildSearchResult(product)}</li>`).join("")}</ul>`;
    }
  } catch (error) {
    console.error("Search render failed:", error);
    results.innerHTML = '<div class="search-panel__section-title">Products</div><p class="search-panel__empty">Search is temporarily unavailable.</p>';
  }
  renderRecentSearches();
}

function handleSearch(input) {
  const term = input?.value.trim() || "";
  if (!term) {
    input?.focus();
    return;
  }
  saveRecentSearch(term);
  closeLayer("[data-search-panel]");
  window.location.href = `shop.html?search=${encodeURIComponent(term)}`;
}

qs("[data-search-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  handleSearch(qs("#site-search"));
});

qs("[data-search-clear]")?.addEventListener("click", () => {
  const input = qs("#site-search");
  if (input) input.value = "";
  renderSearchResults();
  input?.focus();
});

qs("[data-recent-clear]")?.addEventListener("click", () => {
  writeRecentSearches([]);
  renderRecentSearches();
});

qs("#site-search")?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  handleSearch(event.currentTarget);
});

qs("#site-search")?.addEventListener("input", (event) => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    renderSearchResults();
  }, 120);
});

qs("[data-search-panel]")?.addEventListener("click", (event) => {
  const recentLink = event.target.closest("[data-recent-search-link]");
  if (!recentLink) return;
  saveRecentSearch(recentLink.dataset.recentSearchLink || recentLink.textContent || "");
});

const uspMessages = qsa(".usp__message");
let activeUsp = 0;

function setUsp(index) {
  if (!uspMessages.length) return;
  activeUsp = (index + uspMessages.length) % uspMessages.length;
  uspMessages.forEach((message, messageIndex) => {
    message.classList.toggle("is-active", messageIndex === activeUsp);
  });
}

qs("[data-usp-prev]")?.addEventListener("click", () => setUsp(activeUsp - 1));
qs("[data-usp-next]")?.addEventListener("click", () => setUsp(activeUsp + 1));

if (uspMessages.length > 1) {
  window.setInterval(() => setUsp(activeUsp + 1), 5000);
}

function scrollCarousel(selector, direction) {
  const carousel = qs(selector);
  if (!carousel) return;
  const step = Math.max(carousel.clientWidth * 0.7, 220);
  carousel.scrollBy({ left: direction * step, behavior: "smooth" });
}

qsa("[data-scroll-left]").forEach((button) => {
  button.addEventListener("click", () => scrollCarousel(button.dataset.scrollLeft, -1));
});

qsa("[data-scroll-right]").forEach((button) => {
  button.addEventListener("click", () => scrollCarousel(button.dataset.scrollRight, 1));
});

qsa("[data-pagination]").forEach((pagination) => {
  const carousel = qs(pagination.dataset.pagination);
  const dots = qsa("span", pagination);
  if (!carousel || !dots.length) return;

  const updateDots = () => {
    const maxScroll = Math.max(carousel.scrollWidth - carousel.clientWidth, 1);
    const activeDot = Math.min(dots.length - 1, Math.round((carousel.scrollLeft / maxScroll) * (dots.length - 1)));
    dots.forEach((dot, index) => dot.classList.toggle("is-active", index === activeDot));
  };

  carousel.addEventListener("scroll", updateDots, { passive: true });
  window.addEventListener("resize", updateDots);
  updateDots();
});

qs("[data-account-form]")?.addEventListener("submit", (event) => {
  event.preventDefault();
  window.location.href = "login.html";
});

const cookieKey = "pars_storefront_cookie_choice";

function storeCookieChoice(choice) {
  try {
    window.localStorage.setItem(cookieKey, JSON.stringify(choice));
  } catch {
    // Consent still closes for the current session if storage is unavailable.
  }
  closeLayer("[data-cookie-modal]");
  closeLayer("[data-cookie-banner]");
}

function openCookieSettings() {
  closeLayer("[data-cookie-banner]");
  openLayer("[data-cookie-modal]");
}

qsa("[data-cookie-settings]").forEach((button) => {
  button.addEventListener("click", openCookieSettings);
});

qsa("[data-cookie-close]").forEach((button) => {
  button.addEventListener("click", () => {
    closeLayer("[data-cookie-modal]");
    if (!hasCookieChoice()) openLayer("[data-cookie-banner]");
  });
});

qsa("[data-cookie-accept]").forEach((button) => {
  button.addEventListener("click", () => {
    qsa("[data-cookie-option]").forEach((option) => {
      option.checked = true;
    });
    storeCookieChoice({ necessary: true, functional: true, performance: true, tracking: true });
  });
});

qsa("[data-cookie-reject]").forEach((button) => {
  button.addEventListener("click", () => {
    qsa("[data-cookie-option]").forEach((option) => {
      option.checked = false;
    });
    storeCookieChoice({ necessary: true, functional: false, performance: false, tracking: false });
  });
});

qs("[data-cookie-save]")?.addEventListener("click", () => {
  const choices = { necessary: true };
  qsa("[data-cookie-option]").forEach((option) => {
    choices[option.value] = option.checked;
  });
  storeCookieChoice(choices);
});

function hasCookieChoice() {
  try {
    return Boolean(window.localStorage.getItem(cookieKey));
  } catch {
    return false;
  }
}

if (!hasCookieChoice()) {
  window.setTimeout(() => openLayer("[data-cookie-banner]"), 500);
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  closeLayer("[data-drawer]");
  closeLayer("[data-search-panel]");
  closeLayer("[data-account-panel]");
  closeLayer("[data-bag-panel]");
  closeLayer("[data-cookie-modal]");
  if (!hasCookieChoice()) openLayer("[data-cookie-banner]");
});
