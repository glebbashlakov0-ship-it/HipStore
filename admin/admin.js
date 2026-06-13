(function () {
  "use strict";

  var PRODUCTS_DATA_PATH = "../data/products.normalized.json";
  var ORDER_STATUSES = ["payment_pending", "processing", "shipped", "completed", "cancelled"];
  var ADMIN_TABS = ["dashboard", "products", "orders", "customers", "settings"];
  var NAV_ACTIVE_CLASS = "nav-active rounded-lg px-4 py-2 text-sm font-medium transition-colors";
  var NAV_INACTIVE_CLASS = "nav-inactive rounded-lg px-4 py-2 text-sm font-medium transition-colors";

  var state = {
    currentTab: "dashboard",
    orders: [],
    filteredOrders: [],
    products: [],
    filteredProducts: [],
    customers: [],
    ordersSearch: "",
    ordersStatus: "all",
    productsSearch: "",
    productsBrand: "all",
    productsCategory: "all",
    productsSale: "all",
    productsStock: "all",
    productsSort: "newest",
    productsPage: 1,
    productsPageSize: 25,
    currentOrderId: "",
  };

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeCsv(value) {
    return '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
  }

  function normalizeSearch(value) {
    return String(value || "").trim().toLowerCase();
  }

  function formatCurrency(value, currency) {
    var amount = Number(value || 0);
    var code = currency || "GBP";
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: code,
        maximumFractionDigits: amount % 1 ? 2 : 0,
      }).format(amount);
    } catch (_error) {
      return code + " " + amount.toLocaleString("en-US");
    }
  }

  function formatDate(value) {
    if (!value) return "-";
    var date = new Date(value);
    if (!Number.isFinite(date.getTime())) return String(value);
    return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
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

  function backend() {
    if (!window.HipStoreBackend) throw new Error("Supabase client is not loaded.");
    return window.HipStoreBackend;
  }

  function showLogin(message) {
    $("login-screen").classList.remove("hidden");
    $("login-screen").classList.add("flex");
    $("admin-ui").classList.add("hidden");
    if (message) {
      $("login-error").textContent = message;
      $("login-error").classList.remove("hidden");
    }
  }

  function showAdmin() {
    $("login-screen").classList.add("hidden");
    $("login-screen").classList.remove("flex");
    $("admin-ui").classList.remove("hidden");
    loadAll();
  }

  function statusBadgeClass(status) {
    var classes = {
      payment_pending: "bg-amber-100 text-amber-700",
      processing: "bg-blue-100 text-blue-700",
      shipped: "bg-indigo-100 text-indigo-700",
      completed: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-gray-100 text-gray-600",
    };
    return classes[status] || classes.payment_pending;
  }

  function statusLabel(status) {
    var labels = {
      payment_pending: "Payment pending",
      processing: "Processing",
      shipped: "Shipped",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return labels[status] || "Payment pending";
  }

  function statusOptions(selected) {
    return ORDER_STATUSES.map(function (status) {
      return '<option value="' + status + '"' + (status === selected ? " selected" : "") + ">" + statusLabel(status) + "</option>";
    }).join("");
  }

  function normalizeOrder(order) {
    var item = Array.isArray(order.order_items) ? order.order_items[0] || {} : {};
    var status = String(order.status || "payment_pending").toLowerCase();
    if (ORDER_STATUSES.indexOf(status) === -1) status = "payment_pending";
    return {
      id: String(order.id || ""),
      orderId: String(order.order_number || order.orderId || order.id || ""),
      createdAt: String(order.created_at || order.createdAt || ""),
      status: status,
      paymentStatus: String(order.payment_status || "payment_not_configured"),
      paymentMethod: String(order.payment_method || "manual_payment"),
      productId: String(item.product_id || order.productId || ""),
      sku: String(item.sku || order.sku || ""),
      routeSlug: String(item.route_slug || order.routeSlug || ""),
      brand: String(item.brand || order.brand || ""),
      title: String(item.title || order.title || ""),
      size: String(item.selected_size || order.size || ""),
      quantity: Number(item.quantity || order.quantity || 1),
      unitPrice: Number(item.unit_price || order.unitPrice || 0),
      oldPrice: item.old_price != null ? Number(item.old_price) : null,
      subtotal: Number(order.subtotal || 0),
      shipping: Number(order.shipping || 0),
      total: Number(order.total || 0),
      currency: String(order.currency || "GBP"),
      image: String(item.image_url || order.image || ""),
      history: Array.isArray(order.order_status_history) ? order.order_status_history : [],
      customer: {
        email: String(order.email || ""),
        firstName: String(order.first_name || ""),
        lastName: String(order.last_name || ""),
        phone: String(order.phone || ""),
        address: String(order.shipping_address || ""),
        city: String(order.shipping_city || ""),
        postcode: String(order.shipping_postcode || ""),
        country: String(order.shipping_country || ""),
      },
    };
  }

  function customerName(order) {
    var customer = order.customer || {};
    return [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "-";
  }

  async function loadOrders() {
    var result = await backend().adminListOrders();
    state.orders = (result.orders || []).map(normalizeOrder);
    applyOrderFilters();
    renderDashboard();
  }

  function normalizeCustomer(customer) {
    return {
      email: String(customer.email || "-"),
      name: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "-",
      phone: String(customer.phone || "-"),
      ordersCount: Number(customer.orders_count || 0),
      totalSpent: Number(customer.total_spent || 0),
      currency: String(customer.currency || "GBP"),
    };
  }

  async function loadCustomers() {
    var result = await backend().adminListCustomers();
    state.customers = (result.customers || []).map(normalizeCustomer);
    renderCustomers();
  }

  async function updateOrderStatus(orderId, status) {
    if (ORDER_STATUSES.indexOf(status) === -1) return;
    await backend().adminUpdateOrderStatus(orderId, status);
    await loadOrders();
    await loadCustomers();
    renderCustomers();
  }

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function normalizeProductPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.products)) return payload.products;
    if (payload && Array.isArray(payload.items)) return payload.items;
    return [];
  }

  function normalizeSize(size) {
    if (typeof size === "string" || typeof size === "number") {
      return { label: String(size), available: true };
    }
    return {
      label: String(size && (size.label || size.size || size.name || size.value) || ""),
      available: !(size && (size.available === false || size.inStock === false || size.in_stock === false)),
    };
  }

  function priceValue(value) {
    if (value && typeof value === "object") return Number(value.amount || value.value || value.price || 0);
    return Number(value || 0);
  }

  function normalizeCategory(value) {
    if (Array.isArray(value)) return value.filter(Boolean).join(" / ");
    return String(value || "");
  }

  function firstImage(item) {
    var images = Array.isArray(item && item.images) ? item.images.filter(Boolean) : [];
    return String((item && (item.mainImage || item.main_image || item.image || item.imageUrl)) || images[0] || "../placeholder.svg");
  }

  function productId(item) {
    return String((item && (item.id || item.product_id || item.productId || item.sku)) || "").trim();
  }

  function sourceSlug(item) {
    return String((item && (item.sourceSlug || item.source_slug || item.slug)) || "").trim();
  }

  function routeSlug(item) {
    var direct = String((item && (item.routeSlug || item.route_slug)) || "").trim();
    if (direct) return direct;
    var source = sourceSlug(item);
    var id = productId(item);
    return source && id ? source + "-" + id : source;
  }

  function normalizeProduct(item, index) {
    var id = productId(item);
    var title = String((item && (item.title || item.full_name || item.name)) || "Product");
    var rawOldPrice = item && (item.oldPrice != null ? item.oldPrice : item.old_price != null ? item.old_price : item.was_price);
    var oldPrice = rawOldPrice != null ? priceValue(rawOldPrice) : null;
    var sizes = (Array.isArray(item && item.sizes) ? item.sizes : []).map(normalizeSize).filter(function (size) { return size.label; });
    var price = priceValue(item && item.price);
    var route = routeSlug(item) || (sourceSlug(item) || slugify(title)) + (id ? "-" + id : "");
    var category = normalizeCategory(item && (item.categoryPath || item.category_path || item.category || item.categories));
    var sale = Boolean(item && (item.isSale || item.is_sale || item.sale)) || Boolean(oldPrice && oldPrice > price);
    var inStock = item && item.inStock != null ? Boolean(item.inStock) : !(item && (item.in_stock === false || item.status === "out_of_stock"));
    return {
      id: id,
      sourceIndex: Number(index || 0),
      sortId: Number(String(id || "").replace(/[^0-9.]/g, "")) || Number(index || 0),
      sku: String((item && (item.sku || item.product_id || item.productId || item.id)) || ""),
      routeSlug: route,
      brand: String((item && item.brand) || ""),
      title: title,
      categoryPath: category,
      price: price,
      oldPrice: oldPrice,
      currency: String((item && item.currency) || "GBP"),
      isSale: sale,
      inStock: inStock,
      sizesCount: sizes.filter(function (size) { return size.available !== false; }).length,
      image: firstImage(item),
    };
  }

  function loadProducts() {
    var api = backend();
    if (api && typeof api.isConfigured === "function" && api.isConfigured() && typeof api.getCatalog === "function") {
      return api.getCatalog().catch(function (error) {
        console.warn("Catalog backend unavailable, using local catalog file:", error);
        return loadJson(PRODUCTS_DATA_PATH);
      }).then(function (payload) {
        return normalizeProductPayload(payload).map(normalizeProduct);
      });
    }
    return loadJson(PRODUCTS_DATA_PATH).then(function (payload) {
      return normalizeProductPayload(payload).map(normalizeProduct);
    });
  }

  function unique(items) {
    var seen = {};
    return items.filter(function (item) {
      var key = String(item || "");
      if (!key || seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function detectCurrency() {
    return (state.orders[0] && state.orders[0].currency) || (state.products[0] && state.products[0].currency) || "GBP";
  }

  function renderDashboard() {
    if (!$("stat-products")) return;
    var productCount = state.products.length;
    var orderCount = state.orders.length;
    var revenue = state.orders.reduce(function (sum, order) { return sum + Number(order.total || 0); }, 0);
    var pendingOrders = state.orders.filter(function (order) { return order.status === "payment_pending"; }).length;
    var saleProducts = state.products.filter(function (product) { return product.isSale; }).length;
    var outProducts = state.products.filter(function (product) { return !product.inStock; }).length;
    var brands = unique(state.products.map(function (product) { return product.brand; })).length;
    var categories = unique(state.products.map(function (product) { return product.categoryPath; })).length;

    $("stat-products").textContent = String(productCount);
    $("stat-orders").textContent = String(orderCount);
    $("stat-revenue").textContent = formatCurrency(revenue, detectCurrency());
    $("stat-new-orders").textContent = String(pendingOrders);
    $("stat-sale-products").textContent = String(saleProducts);
    $("stat-out-products").textContent = String(outProducts);
    $("stat-brands").textContent = String(brands);
    $("stat-categories").textContent = String(categories);
    renderDashboardOrders();
    renderDashboardCatalog({ productCount: productCount, saleProducts: saleProducts, outProducts: outProducts, brands: brands, categories: categories });
  }

  function sortOrdersNewest(a, b) {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }

  function renderDashboardOrders() {
    var target = $("dashboard-orders");
    var empty = $("dashboard-orders-empty");
    if (!target || !empty) return;
    var recent = state.orders.slice().sort(sortOrdersNewest).slice(0, 5);
    empty.classList.toggle("hidden", recent.length !== 0);
    target.innerHTML = recent.map(function (order) {
      return '<div class="flex items-start justify-between gap-3 px-4 py-3"><div class="min-w-0"><div class="truncate text-sm font-medium">' + escapeHtml(order.orderId) + '</div><div class="truncate text-xs text-gray-500">' + escapeHtml(customerName(order)) + ' - ' + escapeHtml(order.sku || "-") + '</div></div><div class="shrink-0 text-right"><div class="text-sm font-semibold">' + escapeHtml(formatCurrency(order.total, order.currency)) + '</div><span class="mt-1 inline-block rounded-full px-2 py-1 text-xs font-medium ' + statusBadgeClass(order.status) + '">' + statusLabel(order.status) + '</span></div></div>';
    }).join("");
  }

  function renderDashboardCatalog(metrics) {
    var target = $("dashboard-catalog");
    if (!target) return;
    var rows = [
      ["Products Loaded", metrics.productCount],
      ["Sale Products", metrics.saleProducts],
      ["Out Of Stock", metrics.outProducts],
      ["Unique Brands", metrics.brands],
      ["Unique Categories", metrics.categories],
      ["Backend Orders", state.orders.length],
    ];
    target.innerHTML = rows.map(function (row) {
      return '<div class="rounded-lg border border-gray-100 p-3"><div class="text-xs font-medium uppercase tracking-wide text-gray-500">' + escapeHtml(row[0]) + '</div><div class="mt-1 text-lg font-semibold">' + escapeHtml(String(row[1])) + '</div></div>';
    }).join("");
  }

  function applyOrderFilters() {
    var query = normalizeSearch(state.ordersSearch);
    state.filteredOrders = state.orders.filter(function (order) {
      if (state.ordersStatus !== "all" && order.status !== state.ordersStatus) return false;
      if (!query) return true;
      return [order.orderId, order.customer.email, order.customer.phone, order.sku, order.title, order.routeSlug].join(" ").toLowerCase().indexOf(query) !== -1;
    }).sort(sortOrdersNewest);
    renderOrders();
  }

  function renderOrders() {
    var body = $("orders-body");
    var empty = $("orders-empty");
    if (!body || !empty) return;
    $("orders-count-label").textContent = state.filteredOrders.length + " of " + state.orders.length + " orders";
    empty.classList.toggle("hidden", state.filteredOrders.length !== 0);
    body.innerHTML = state.filteredOrders.map(function (order) {
      var customer = order.customer || {};
      return [
        '<tr class="border-b border-gray-100 align-top hover:bg-gray-50">',
        '<td class="px-4 py-3 font-medium text-gray-900">' + escapeHtml(order.orderId || "-") + '</td>',
        '<td class="px-4 py-3 text-xs text-gray-500">' + escapeHtml(formatDate(order.createdAt)) + '</td>',
        '<td class="px-4 py-3"><select data-order-status="' + escapeHtml(order.id) + '" class="rounded-full px-2.5 py-1.5 text-xs font-medium border-0 ' + statusBadgeClass(order.status) + '">' + statusOptions(order.status) + '</select></td>',
        '<td class="px-4 py-3 font-medium">' + escapeHtml(customerName(order)) + '</td>',
        '<td class="px-4 py-3">' + escapeHtml(customer.email || "-") + '</td>',
        '<td class="px-4 py-3">' + escapeHtml(customer.phone || "-") + '</td>',
        '<td class="px-4 py-3"><div class="max-w-[280px] clamp-2 font-medium">' + escapeHtml(order.title || "-") + '</div><div class="text-xs text-gray-500">Payment: ' + escapeHtml(order.paymentStatus.replace(/_/g, " ")) + '</div></td>',
        '<td class="px-4 py-3">' + escapeHtml(order.brand || "-") + '</td>',
        '<td class="px-4 py-3 font-mono text-xs">' + escapeHtml(order.sku || "-") + '</td>',
        '<td class="px-4 py-3"><div class="max-w-[260px] truncate font-mono text-xs" title="' + escapeHtml(order.routeSlug) + '">' + escapeHtml(order.routeSlug || "-") + '</div></td>',
        '<td class="px-4 py-3">' + escapeHtml(order.size || "-") + '</td>',
        '<td class="px-4 py-3">' + escapeHtml(String(order.quantity || 1)) + '</td>',
        '<td class="px-4 py-3 font-semibold">' + escapeHtml(formatCurrency(order.total, order.currency)) + '</td>',
        '<td class="px-4 py-3">' + escapeHtml(order.currency || "") + '</td>',
        '<td class="px-4 py-3"><button type="button" data-view-order="' + escapeHtml(order.id) + '" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">Details</button></td>',
        '</tr>',
      ].join("");
    }).join("");
  }

  function sortProducts(a, b) {
    if (state.productsSort === "price-asc") return a.price - b.price || a.title.localeCompare(b.title);
    if (state.productsSort === "price-desc") return b.price - a.price || a.title.localeCompare(b.title);
    if (state.productsSort === "brand-asc") return a.brand.localeCompare(b.brand) || a.title.localeCompare(b.title);
    if (state.productsSort === "title-asc") return a.title.localeCompare(b.title) || a.brand.localeCompare(b.brand);
    return b.sortId - a.sortId || b.sourceIndex - a.sourceIndex;
  }

  function applyProductFilters(resetPage) {
    var query = normalizeSearch(state.productsSearch);
    if (resetPage) state.productsPage = 1;
    state.filteredProducts = state.products.filter(function (product) {
      if (state.productsBrand !== "all" && product.brand !== state.productsBrand) return false;
      if (state.productsCategory !== "all" && product.categoryPath !== state.productsCategory) return false;
      if (state.productsSale === "sale" && !product.isSale) return false;
      if (state.productsSale === "regular" && product.isSale) return false;
      if (state.productsStock === "in" && !product.inStock) return false;
      if (state.productsStock === "out" && product.inStock) return false;
      if (!query) return true;
      return [product.title, product.brand, product.sku, product.routeSlug].join(" ").toLowerCase().indexOf(query) !== -1;
    });
    state.filteredProducts.sort(sortProducts);
    renderProducts();
  }

  function renderProducts() {
    var body = $("products-body");
    var empty = $("products-empty");
    if (!body || !empty) return;
    var total = state.filteredProducts.length;
    var maxPage = Math.max(1, Math.ceil(total / state.productsPageSize));
    state.productsPage = Math.min(Math.max(1, state.productsPage), maxPage);
    var start = total ? (state.productsPage - 1) * state.productsPageSize : 0;
    var end = Math.min(start + state.productsPageSize, total);
    var pageItems = state.filteredProducts.slice(start, end);
    $("products-count-label").textContent = total + " of " + state.products.length + " products";
    $("products-range-label").textContent = total ? "Showing " + (start + 1) + "-" + end + " of " + total : "No products";
    $("products-page-label").textContent = "Page " + state.productsPage + " of " + maxPage;
    $("products-page-prev").disabled = state.productsPage <= 1;
    $("products-page-next").disabled = state.productsPage >= maxPage;
    empty.classList.toggle("hidden", total !== 0);
    body.innerHTML = pageItems.map(function (product) {
      var openHref = "../product/index.html?slug=" + encodeURIComponent(product.routeSlug);
      var oldPrice = product.oldPrice && product.oldPrice > product.price ? formatCurrency(product.oldPrice, product.currency) : "-";
      return [
        '<tr class="border-b border-gray-100 align-top hover:bg-gray-50">',
        '<td class="px-4 py-3"><img src="' + escapeHtml(product.image) + '" alt="' + escapeHtml(product.title) + '" class="h-12 w-12 rounded-lg border border-gray-100 bg-white object-contain p-1" loading="lazy" /></td>',
        '<td class="px-4 py-3"><div class="max-w-[280px] clamp-2 font-medium">' + escapeHtml(product.title) + '</div><div class="text-xs text-gray-500">' + escapeHtml(product.brand || "-") + '</div></td>',
        '<td class="px-4 py-3 font-mono text-xs">' + escapeHtml(product.sku || "-") + '</td>',
        '<td class="px-4 py-3"><div class="max-w-[280px] truncate font-mono text-xs" title="' + escapeHtml(product.routeSlug) + '">' + escapeHtml(product.routeSlug || "-") + '</div></td>',
        '<td class="px-4 py-3"><div class="max-w-[240px] text-xs text-gray-600">' + escapeHtml(product.categoryPath || "-") + '</div></td>',
        '<td class="px-4 py-3 font-semibold">' + escapeHtml(formatCurrency(product.price, product.currency)) + '</td>',
        '<td class="px-4 py-3 text-xs text-gray-500">' + escapeHtml(oldPrice) + '</td>',
        '<td class="px-4 py-3">' + (product.isSale ? '<span class="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Sale</span>' : '<span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">No</span>') + '</td>',
        '<td class="px-4 py-3">' + (product.inStock ? '<span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">In stock</span>' : '<span class="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">Out</span>') + '</td>',
        '<td class="px-4 py-3">' + escapeHtml(String(product.sizesCount || 0)) + '</td>',
        '<td class="px-4 py-3"><a href="' + openHref + '" target="_blank" rel="noopener noreferrer" class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">Open Product</a></td>',
        '</tr>',
      ].join("");
    }).join("");
  }

  function populateProductFilters() {
    var brands = unique(state.products.map(function (product) { return product.brand; })).sort();
    var categories = unique(state.products.map(function (product) { return product.categoryPath; })).sort();
    $("products-brand-filter").innerHTML = '<option value="all">All brands</option>' + brands.map(function (brand) {
      return '<option value="' + escapeHtml(brand) + '">' + escapeHtml(brand) + '</option>';
    }).join("");
    $("products-category-filter").innerHTML = '<option value="all">All categories</option>' + categories.map(function (category) {
      return '<option value="' + escapeHtml(category) + '">' + escapeHtml(category) + '</option>';
    }).join("");
  }

  function renderCustomers() {
    var body = $("customers-body");
    var empty = $("customers-empty");
    if (!body || !empty) return;
    $("customers-count-label").textContent = state.customers.length + " customers from backend orders";
    empty.classList.toggle("hidden", state.customers.length !== 0);
    body.innerHTML = state.customers.map(function (customer) {
      return '<tr class="border-b border-gray-100 hover:bg-gray-50"><td class="px-4 py-3">' + escapeHtml(customer.email || "-") + '</td><td class="px-4 py-3 font-medium">' + escapeHtml(customer.name || "-") + '</td><td class="px-4 py-3">' + escapeHtml(customer.phone || "-") + '</td><td class="px-4 py-3">' + escapeHtml(String(customer.ordersCount || 0)) + '</td><td class="px-4 py-3 font-semibold">' + escapeHtml(formatCurrency(customer.totalSpent, customer.currency)) + '</td></tr>';
    }).join("");
  }

  function switchTab(tabName) {
    if (ADMIN_TABS.indexOf(tabName) === -1) return;
    state.currentTab = tabName;
    ADMIN_TABS.forEach(function (name) {
      $(name + "-section").classList.toggle("hidden", name !== tabName);
      $(name + "-tab").className = name === tabName ? NAV_ACTIVE_CLASS : NAV_INACTIVE_CLASS;
    });
  }

  function findOrder(id) {
    return state.orders.find(function (order) { return order.id === id; });
  }

  function detailRow(label, value) {
    return '<div class="rounded-lg border border-gray-100 p-3"><dt class="text-xs font-medium uppercase tracking-wide text-gray-500">' + escapeHtml(label) + '</dt><dd class="mt-1 break-words text-sm text-gray-900">' + escapeHtml(value || "-") + '</dd></div>';
  }

  function openOrderDetail(orderId) {
    var order = findOrder(orderId);
    if (!order) return;
    state.currentOrderId = orderId;
    var customer = order.customer || {};
    $("modal-order-id").textContent = order.orderId;
    $("modal-status-select").value = order.status;
    $("order-detail-body").innerHTML =
      '<div class="space-y-5">' +
      '<div><h3 class="mb-3 text-sm font-semibold">Customer</h3><dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">' +
      detailRow("Name", customerName(order)) + detailRow("Email", customer.email) + detailRow("Phone", customer.phone) + detailRow("Address", [customer.address, customer.city, customer.postcode, customer.country].filter(Boolean).join(", ")) +
      '</dl></div>' +
      '<div><h3 class="mb-3 text-sm font-semibold">Product</h3>' + (order.image ? '<img src="' + escapeHtml(order.image) + '" alt="' + escapeHtml(order.title || "Product") + '" class="mb-3 h-20 w-20 rounded-lg border border-gray-100 object-contain p-1" />' : "") + '<dl class="grid grid-cols-1 gap-3 sm:grid-cols-2">' +
      detailRow("Title", order.title) + detailRow("Brand", order.brand) + detailRow("SKU", order.sku) + detailRow("Route", order.routeSlug) + detailRow("Size", order.size) + detailRow("Quantity", String(order.quantity || 1)) + detailRow("Unit Price", formatCurrency(order.unitPrice, order.currency)) + detailRow("Subtotal", formatCurrency(order.subtotal, order.currency)) + detailRow("Shipping", formatCurrency(order.shipping, order.currency)) + detailRow("Total", formatCurrency(order.total, order.currency)) + detailRow("Payment", order.paymentStatus.replace(/_/g, " ")) + detailRow("Created", formatDate(order.createdAt)) +
      '</dl></div></div>';
    $("order-modal").classList.remove("hidden");
    $("order-modal").classList.add("flex");
  }

  function closeOrderDetail() {
    $("order-modal").classList.add("hidden");
    $("order-modal").classList.remove("flex");
    state.currentOrderId = "";
  }

  function downloadFile(filename, content, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  function exportOrdersJson() {
    downloadFile("shop-orders.json", JSON.stringify(state.filteredOrders, null, 2), "application/json");
  }

  function exportOrdersCsv() {
    var headers = ["orderId", "createdAt", "status", "paymentStatus", "customerName", "email", "phone", "title", "brand", "sku", "routeSlug", "size", "quantity", "total", "currency"];
    var rows = state.filteredOrders.map(function (order) {
      var customer = order.customer || {};
      return [order.orderId, order.createdAt, order.status, order.paymentStatus, customerName(order), customer.email, customer.phone, order.title, order.brand, order.sku, order.routeSlug, order.size, order.quantity, order.total, order.currency].map(escapeCsv).join(",");
    });
    downloadFile("shop-orders.csv", headers.map(escapeCsv).join(",") + "\n" + rows.join("\n"), "text/csv");
  }

  async function loadAll() {
    try {
      await loadOrders();
    } catch (error) {
      state.orders = [];
      state.filteredOrders = [];
      $("orders-count-label").textContent = "Backend orders unavailable";
      $("orders-empty").textContent = error.message || "Unable to load backend orders.";
      $("orders-empty").classList.remove("hidden");
      renderDashboard();
    }
    try {
      await loadCustomers();
    } catch (_error) {
      state.customers = [];
      renderCustomers();
    }
    loadProducts()
      .then(function (products) {
        state.products = products;
        $("products-error").classList.add("hidden");
        populateProductFilters();
        applyProductFilters(true);
        renderDashboard();
      })
      .catch(function (error) {
        state.products = [];
        state.filteredProducts = [];
        $("products-error").textContent = error.message || "Could not load products.";
        $("products-error").classList.remove("hidden");
        renderProducts();
        renderDashboard();
      });
  }

  function bindEvents() {
    $("login-btn").addEventListener("click", async function () {
      $("login-error").classList.add("hidden");
      $("login-btn").disabled = true;
      $("login-btn").textContent = "Signing in...";
      try {
        await backend().adminLogin($("admin-email").value, $("admin-pass").value);
        showAdmin();
      } catch (error) {
        $("login-error").textContent = error.message || "Admin sign-in failed.";
        $("login-error").classList.remove("hidden");
      } finally {
        $("login-btn").disabled = false;
        $("login-btn").textContent = "Sign in";
      }
    });

    ["admin-email", "admin-pass"].forEach(function (id) {
      $(id).addEventListener("keydown", function (event) {
        if (event.key === "Enter") $("login-btn").click();
      });
    });

    $("logout-btn").addEventListener("click", async function () {
      await backend().adminLogout();
      showLogin();
    });
    $("refresh-btn").addEventListener("click", loadAll);

    ADMIN_TABS.forEach(function (tabName) {
      $(tabName + "-tab").addEventListener("click", function () { switchTab(tabName); });
    });

    $("orders-search").addEventListener("input", function (event) {
      state.ordersSearch = event.target.value.trim();
      applyOrderFilters();
    });
    $("orders-status-filter").addEventListener("change", function (event) {
      state.ordersStatus = event.target.value;
      applyOrderFilters();
    });
    $("orders-body").addEventListener("change", async function (event) {
      var select = event.target.closest("[data-order-status]");
      if (!select) return;
      select.disabled = true;
      try {
        await updateOrderStatus(select.getAttribute("data-order-status"), select.value);
      } catch (error) {
        alert(error.message || "Unable to update status.");
        await loadOrders();
      }
    });
    $("orders-body").addEventListener("click", function (event) {
      var button = event.target.closest("[data-view-order]");
      if (button) openOrderDetail(button.getAttribute("data-view-order"));
    });

    $("export-orders-json").addEventListener("click", exportOrdersJson);
    $("export-orders-csv").addEventListener("click", exportOrdersCsv);

    $("products-search").addEventListener("input", function (event) { state.productsSearch = event.target.value.trim(); applyProductFilters(true); });
    $("products-brand-filter").addEventListener("change", function (event) { state.productsBrand = event.target.value; applyProductFilters(true); });
    $("products-category-filter").addEventListener("change", function (event) { state.productsCategory = event.target.value; applyProductFilters(true); });
    $("products-sale-filter").addEventListener("change", function (event) { state.productsSale = event.target.value; applyProductFilters(true); });
    $("products-stock-filter").addEventListener("change", function (event) { state.productsStock = event.target.value; applyProductFilters(true); });
    $("products-sort").addEventListener("change", function (event) { state.productsSort = event.target.value; applyProductFilters(true); });
    $("products-page-size").addEventListener("change", function (event) { state.productsPageSize = Number(event.target.value || 25); applyProductFilters(true); });
    $("products-page-prev").addEventListener("click", function () { state.productsPage -= 1; renderProducts(); });
    $("products-page-next").addEventListener("click", function () { state.productsPage += 1; renderProducts(); });

    $("close-order-modal").addEventListener("click", closeOrderDetail);
    $("order-modal").addEventListener("click", function (event) {
      if (event.target === $("order-modal")) closeOrderDetail();
    });
    $("save-modal-status").addEventListener("click", async function () {
      if (!state.currentOrderId) return;
      await updateOrderStatus(state.currentOrderId, $("modal-status-select").value);
      closeOrderDetail();
    });
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeOrderDetail();
    });
  }

  async function init() {
    bindEvents();
    switchTab("dashboard");
    if (!window.HipStoreBackend || !window.HipStoreBackend.isConfigured()) {
      showLogin("Supabase is not configured. Add site-config.js values before admin access.");
      return;
    }
    try {
      await backend().checkAdmin();
      showAdmin();
    } catch (_error) {
      showLogin();
    }
  }

  init();
})();
