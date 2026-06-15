(function () {
  var BASE_PATH = "../";
  var CATALOG_DATA_PATH = BASE_PATH + "data/products.normalized.json";
  var CART_KEY = "hip_store_cart";
  var STANDARD_SHIPPING = 0;
  var HIP_ASSET_ORIGIN = "https://www.thehipstore.co.uk";
  var PROMO_DOWN_ICON = HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/icon-arrow-down.svg";
  var PROMO_UP_ICON = HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/icon-arrow-up.svg";
  var PAYMENT_ICONS_PRIMARY = [
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/Visa.png",
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/visa-electron.png",
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/mastercard.png",
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/maestro.png",
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/amex.png"
  ];
  var PAYMENT_ICONS_SECONDARY = [
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/paypal.png",
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/klarna.png",
    HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/payment-method-logos/clearpay.png"
  ];
  var PAYMENT_OPTIONS = [
    { value: "card", label: "Credit / Debit Card", icons: [PAYMENT_ICONS_PRIMARY[0], PAYMENT_ICONS_PRIMARY[2], PAYMENT_ICONS_PRIMARY[4]] },
    { value: "paypal", label: "PayPal", icons: [HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/logo-payment-pay-pal.svg"] },
    { value: "apple_pay", label: "Apple Pay", icons: [HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/apple-pay-mark.svg"] },
    { value: "klarna", label: "Klarna", icons: [HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/klarna-pink.svg"] },
    { value: "future_method", label: "Other payment method", note: "More payment methods coming later.", future: true }
  ];
  var COUNTRY_OPTIONS = [
    { name: "United Kingdom", iso: "gb", dial: "+44" },
    { name: "United States", iso: "us", dial: "+1" },
    { name: "Canada", iso: "ca", dial: "+1" },
    { name: "Ireland", iso: "ie", dial: "+353" },
    { name: "France", iso: "fr", dial: "+33" },
    { name: "Germany", iso: "de", dial: "+49" },
    { name: "Spain", iso: "es", dial: "+34" },
    { name: "Italy", iso: "it", dial: "+39" },
    { name: "Netherlands", iso: "nl", dial: "+31" },
    { name: "Belgium", iso: "be", dial: "+32" },
    { name: "Denmark", iso: "dk", dial: "+45" },
    { name: "Sweden", iso: "se", dial: "+46" },
    { name: "Norway", iso: "no", dial: "+47" },
    { name: "Finland", iso: "fi", dial: "+358" },
    { name: "Poland", iso: "pl", dial: "+48" },
    { name: "Portugal", iso: "pt", dial: "+351" },
    { name: "Switzerland", iso: "ch", dial: "+41" },
    { name: "Austria", iso: "at", dial: "+43" },
    { name: "Australia", iso: "au", dial: "+61" },
    { name: "New Zealand", iso: "nz", dial: "+64" },
    { name: "United Arab Emirates", iso: "ae", dial: "+971" },
    { name: "Turkey", iso: "tr", dial: "+90" },
    { name: "India", iso: "in", dial: "+91" },
    { name: "China", iso: "cn", dial: "+86" },
    { name: "Hong Kong", iso: "hk", dial: "+852" },
    { name: "Singapore", iso: "sg", dial: "+65" },
    { name: "Japan", iso: "jp", dial: "+81" },
    { name: "Korea, Republic of", iso: "kr", dial: "+82" },
    { name: "Mexico", iso: "mx", dial: "+52" },
    { name: "Brazil", iso: "br", dial: "+55" },
    { name: "Argentina", iso: "ar", dial: "+54" },
    { name: "South Africa", iso: "za", dial: "+27" },
    { name: "Russia", iso: "ru", dial: "+7" },
    { name: "Ukraine", iso: "ua", dial: "+380" },
    { name: "Estonia", iso: "ee", dial: "+372" },
    { name: "Latvia", iso: "lv", dial: "+371" },
    { name: "Lithuania", iso: "lt", dial: "+370" },
    { name: "Czech Republic", iso: "cz", dial: "+420" },
    { name: "Greece", iso: "gr", dial: "+30" },
    { name: "Romania", iso: "ro", dial: "+40" },
    { name: "Bulgaria", iso: "bg", dial: "+359" },
    { name: "Croatia", iso: "hr", dial: "+385" },
    { name: "Hungary", iso: "hu", dial: "+36" }
  ];

  function revealShell() {
    if (typeof window.HipStoreRevealShell === "function") {
      window.HipStoreRevealShell();
      return;
    }
    if (document.body) {
      document.body.classList.remove("hip-shell-pending");
      document.body.removeAttribute("aria-busy");
    }
  }

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function loadCatalog() {
    var backend = window.HipStoreBackend;
    if (backend && typeof backend.isConfigured === "function" && backend.isConfigured() && typeof backend.getCatalog === "function") {
      return backend.getCatalog().catch(function (error) {
        console.warn("Catalog backend unavailable, using local catalog file:", error);
        return loadJson(CATALOG_DATA_PATH);
      });
    }
    return loadJson(CATALOG_DATA_PATH);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function normalizeText(value) {
    return String(value || "").trim().toLowerCase();
  }

  function cleanInput(value) {
    return String(value == null ? "" : value).trim();
  }

  function hasLetter(value) {
    return /[A-Za-z]/.test(value) || /[^\W\d_]/u.test(value);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput(value));
  }

  function isValidName(value) {
    var text = cleanInput(value);
    return text.length >= 2 && hasLetter(text) && !/\d/.test(text);
  }

  function isValidPhone(value) {
    var text = cleanInput(value);
    var digits = text.replace(/\D/g, "");
    return /^[+\d\s().-]+$/.test(text) && digits.length >= 7 && digits.length <= 20;
  }

  function isValidAddressLine(value) {
    var text = cleanInput(value);
    return text.length >= 5 && hasLetter(text);
  }

  function isValidOptionalAddressLine(value) {
    var text = cleanInput(value);
    return !text || (text.length >= 2 && (hasLetter(text) || /\d/.test(text)));
  }

  function isValidTown(value) {
    var text = cleanInput(value);
    return text.length >= 2 && hasLetter(text);
  }

  function isValidPostcode(value) {
    var text = cleanInput(value);
    return text.length >= 3 && text.length <= 12 && /[A-Za-z0-9]/.test(text) && /^[A-Za-z0-9][A-Za-z0-9 -]*[A-Za-z0-9]$/.test(text);
  }

  function isValidCountry(value) {
    var text = cleanInput(value);
    return text.length >= 2 && hasLetter(text);
  }

  function defaultCountry() {
    return COUNTRY_OPTIONS[0];
  }

  function findCountryByIso(iso) {
    var normalized = normalizeText(iso);
    return COUNTRY_OPTIONS.find(function (country) {
      return country.iso === normalized;
    }) || null;
  }

  function countryByName(name) {
    var normalized = normalizeText(name);
    return COUNTRY_OPTIONS.find(function (country) {
      return normalizeText(country.name) === normalized;
    }) || defaultCountry();
  }

  function countryOptionsHtml(selectedName) {
    var selected = countryByName(selectedName).name;
    return COUNTRY_OPTIONS.map(function (country) {
      return '<option value="' + escapeHtml(country.name) + '"' + (country.name === selected ? ' selected' : '') + '>' + escapeHtml(country.name) + '</option>';
    }).join("");
  }

  function countryByIso(iso) {
    return findCountryByIso(iso) || defaultCountry();
  }

  function countryFlagEmoji(iso) {
    var code = String(iso || "").toUpperCase();
    if (!/^[A-Z]{2}$/.test(code)) return "";
    return String.fromCodePoint(code.charCodeAt(0) + 127397, code.charCodeAt(1) + 127397);
  }

  function phoneCountryOptionsHtml(selectedName) {
    var selected = countryByName(selectedName).iso;
    return COUNTRY_OPTIONS.map(function (country) {
      var label = countryFlagEmoji(country.iso) + " " + country.dial + " " + country.iso.toUpperCase();
      return '<option value="' + escapeHtml(country.iso) + '"' + (country.iso === selected ? ' selected' : '') + '>' + escapeHtml(label) + '</option>';
    }).join("");
  }

  function phonePrefixCandidate(value) {
    var raw = String(value || "").trim();
    if (!raw) return "";
    if (raw.indexOf("+") === 0) return raw.replace(/\D/g, "");
    if (raw.indexOf("00") === 0) return raw.slice(2).replace(/\D/g, "");
    return raw.replace(/\D/g, "");
  }

  function countryFromPhone(value) {
    var digits = phonePrefixCandidate(value);
    if (!digits) return null;
    var international = /^\s*(\+|00)/.test(String(value || ""));
    var sorted = COUNTRY_OPTIONS.slice().sort(function (a, b) {
      return b.dial.replace(/\D/g, "").length - a.dial.replace(/\D/g, "").length;
    });
    var countryByDial = sorted.find(function (country) {
      var dialDigits = country.dial.replace(/\D/g, "");
      if (!international && dialDigits.length < 2) return false;
      return digits.indexOf(dialDigits) === 0;
    });
    if (countryByDial) return countryByDial;
    if (international) return null;
    return countryFromNationalPhone(digits);
  }

  function countryFromNationalPhone(digits) {
    if (/^(79|89)/.test(digits)) return findCountryByIso("ru");
    if (/^1[2-9]/.test(digits)) return findCountryByIso("us");
    return null;
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function getRequestedQuantity() {
    var value = Number(getQueryParam("qty") || getQueryParam("quantity") || 1);
    if (!Number.isFinite(value) || value < 1) return 1;
    return Math.min(99, Math.floor(value));
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

  function formatCurrency(value, currency) {
    var amount = Number(value || 0);
    var code = currency || "GBP";
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: code,
        minimumFractionDigits: amount % 1 ? 2 : 0,
        maximumFractionDigits: amount % 1 ? 2 : 0,
      }).format(amount);
    } catch (_error) {
      return code + " " + amount.toLocaleString("en-US");
    }
  }

  function money(value) {
    return Math.round(Number(value || 0) * 100) / 100;
  }

  function normalizeSize(size) {
    if (typeof size === "string") return { label: size, sku: "", available: true };
    return {
      label: String((size && (size.label || size.size || size.name || size.value)) || ""),
      sku: String((size && (size.sku_variant || size.sku || size.id)) || ""),
      available: !(size && size.available === false),
    };
  }

  function normalizeProduct(item) {
    var id = String((item && (item.id || item.product_id || item.productId || item.sku)) || "").trim();
    var sku = String((item && (item.sku || item.product_id || item.productId || item.id)) || "").trim();
    var sourceSlug = String((item && (item.sourceSlug || item.source_slug || item.slug)) || "").trim() || slugify(item && (item.title || item.full_name || id || sku));
    var routeSlug = String((item && (item.routeSlug || item.route_slug)) || "").trim() || (sourceSlug && id ? sourceSlug + "-" + id : sourceSlug);
    var images = Array.isArray(item && item.images) ? item.images.filter(Boolean) : [];
    var image = (item && (item.mainImage || item.main_image || item.image)) || images[0] || BASE_PATH + "placeholder.svg";
    var oldPrice = item && (item.oldPrice != null ? item.oldPrice : (item.old_price != null ? item.old_price : item.was_price));
    return {
      id: id,
      sku: sku,
      routeSlug: routeSlug,
      sourceSlug: sourceSlug,
      brand: (item && item.brand) || "",
      title: (item && (item.title || item.full_name)) || "Product",
      price: Number((item && item.price) || 0),
      oldPrice: oldPrice != null ? Number(oldPrice) : null,
      currency: (item && item.currency) || "GBP",
      productCode: String((item && (item.productCode || item.product_code || item.styleCode || item.style_code || sku || id)) || ""),
      colour: String((item && (item.colour || item.color || item.colour_name || item.color_name)) || ""),
      image: image,
      images: images.length ? images : [image],
      inStock: item && item.inStock != null ? Boolean(item.inStock) : !(item && (item.in_stock === false || item.status === "out_of_stock")),
      sizes: (Array.isArray(item && item.sizes) ? item.sizes : []).map(normalizeSize).filter(function (size) { return size.label; }),
      sourceUrl: (item && (item.sourceUrl || item.source_url || item.product_url)) || "",
    };
  }

  function findProduct(products, slug, id, sku) {
    var cleanSlug = String(slug || "").trim();
    var cleanId = String(id || "").trim();
    var cleanSku = String(sku || "").trim();
    var normalized = (Array.isArray(products) ? products : []).map(normalizeProduct);

    if (cleanSlug) {
      var routeProduct = normalized.find(function (product) { return product.routeSlug === cleanSlug; });
      if (routeProduct) return routeProduct;
    }
    if (cleanId) {
      var idProduct = normalized.find(function (product) { return product.id === cleanId; });
      if (idProduct) return idProduct;
    }
    if (cleanSku) {
      var skuProduct = normalized.find(function (product) { return product.sku === cleanSku; });
      if (skuProduct) return skuProduct;
    }
    if (cleanSlug) {
      var sourceMatches = normalized.filter(function (product) { return product.sourceSlug === cleanSlug; });
      if (sourceMatches.length === 1) return sourceMatches[0];
    }
    return null;
  }

  function findSize(product, sizeLabel) {
    var clean = String(sizeLabel || "").trim();
    if (!clean) return null;
    return (product.sizes || []).find(function (size) {
      return size.label === clean || size.sku === clean;
    }) || null;
  }

  function buildCartItem(product, size, quantity) {
    var chosenSize = findSize(product, size);
    var label = chosenSize ? chosenSize.label : (size || ((product.sizes || []).length ? "" : "ONE SIZE"));
    return {
      routeSlug: product.routeSlug,
      id: product.id,
      sku: product.sku,
      productCode: product.productCode || product.sku || product.id,
      brand: product.brand || "Product",
      title: product.title || "Product",
      price: Number(product.price || 0),
      oldPrice: product.oldPrice != null ? Number(product.oldPrice) : null,
      currency: product.currency || "GBP",
      image: product.image || BASE_PATH + "placeholder.svg",
      colour: product.colour || "",
      size: label || "ONE SIZE",
      sizeSku: chosenSize ? chosenSize.sku : "",
      quantity: Math.max(1, Math.min(99, Math.floor(Number(quantity || 1)))),
      sourceUrl: product.sourceUrl || "",
      inStock: product.inStock !== false,
    };
  }

  function readCart() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch (_error) {
      return [];
    }
  }

  function backendCart() {
    return window.HipStoreBackend && window.HipStoreBackend.isConfigured && window.HipStoreBackend.isConfigured()
      ? window.HipStoreBackend
      : null;
  }

  function syncRemoteCart(items) {
    var backend = backendCart();
    if (!backend || typeof backend.saveCart !== "function") return;
    backend.saveCart(Array.isArray(items) ? items : []).catch(function () {
      // Keep the local cache usable if the network is temporarily unavailable.
    });
  }

  function writeCart(items, options) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify((Array.isArray(items) ? items : []).slice(0, 30)));
    } catch (_error) {
      // Ignore storage failures.
    }
    if (!options || !options.skipRemote) syncRemoteCart(items);
    window.dispatchEvent(new CustomEvent("hip:cart-updated", { detail: { items: Array.isArray(items) ? items : [] } }));
  }

  async function hydrateRemoteCart(products) {
    var backend = backendCart();
    if (!backend || typeof backend.getCart !== "function") return getCartItems(products);
    try {
      var result = await backend.getCart();
      if (result && Array.isArray(result.items)) {
        writeCart(result.items, { skipRemote: true });
      }
    } catch (_error) {
      // Local cart cache remains the fallback.
    }
    return getCartItems(products);
  }

  function cartIdentity(item) {
    return String(item.routeSlug || "") + "::" + String(item.size || "");
  }

  function hydrateStoredCartItem(item, products) {
    var product = findProduct(products, item && item.routeSlug, item && item.id, item && item.sku);
    if (!product) return null;
    var next = buildCartItem(product, item && item.size, item && item.quantity);
    next.quantity = Math.max(1, Math.min(99, Math.floor(Number(item && item.quantity || 1))));
    return next;
  }

  function getCartItems(products) {
    return readCart()
      .map(function (item) { return hydrateStoredCartItem(item, products); })
      .filter(Boolean);
  }

  function getCheckoutItems(products) {
    var slug = getQueryParam("slug");
    var id = getQueryParam("id");
    var sku = getQueryParam("sku");
    if (!slug && !id && !sku) {
      return { mode: "cart", items: getCartItems(products) };
    }

    var product = findProduct(products, slug, id, sku);
    if (!product) return { mode: "single", error: "We could not find this product. Please return to the catalog and open it again." };
    var requestedSize = getQueryParam("size");
    var chosenSize = findSize(product, requestedSize);
    return {
      mode: "single",
      items: [buildCartItem(product, chosenSize ? chosenSize.label : requestedSize, getRequestedQuantity())],
    };
  }

  function getSubtotal(items) {
    return money((Array.isArray(items) ? items : []).reduce(function (sum, item) {
      return sum + money(Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)));
    }, 0));
  }

  function getTotal(items) {
    return money(getSubtotal(items) + STANDARD_SHIPPING);
  }

  function getQuantity(items) {
    return (Array.isArray(items) ? items : []).reduce(function (sum, item) {
      return sum + Math.max(1, Number(item.quantity || 1));
    }, 0);
  }

  function getProductHref(item) {
    return BASE_PATH + "product/index.html?slug=" + encodeURIComponent(item.routeSlug);
  }

  function ensureCheckoutStyles() {
    return;
  }

  function renderPaymentIcons(icons) {
    return (Array.isArray(icons) ? icons : []).map(function (src) {
      return '<img src="' + src + '" alt="Payment method">';
    }).join("");
  }

  function getSwatchColor(value) {
    var clean = String(value || "").trim().toLowerCase();
    if (!clean) return "";
    var map = {
      black: "#111111",
      white: "#ffffff",
      grey: "#808080",
      gray: "#808080",
      navy: "#1f2a44",
      blue: "#2563eb",
      red: "#c62828",
      green: "#2e7d32",
      brown: "#7b4f2a",
      beige: "#d6c1a3",
      cream: "#ede6d6",
      pink: "#ec4899",
      orange: "#f97316",
      yellow: "#facc15",
      purple: "#7c3aed",
      silver: "#b8bcc2",
      gold: "#d4af37"
    };
    if (map[clean]) return map[clean];
    if (/^[a-z ]+$/.test(clean)) return clean;
    return "";
  }

  function renderItemColour(item) {
    var colour = String(item && item.colour || "").trim();
    var swatch = getSwatchColor(colour);
    if (!colour) return "";
    return '<span class="itemColor">' +
      (swatch ? '<span class="swatch" style="background-color:' + escapeHtml(swatch) + ';"></span>' : "") +
      escapeHtml(colour) +
    '</span>';
  }

  function renderPaymentMethodsBlock() {
    return '' +
      '<div class="payment-methods-icons-container">' +
        '<p>We accept the following payment methods.</p>' +
        '<div class="payment-methods-icons">' +
          '<div class="payment-methods-primary">' + renderPaymentIcons(PAYMENT_ICONS_PRIMARY) + '</div>' +
          '<div class="payment-methods-secondary">' + renderPaymentIcons(PAYMENT_ICONS_SECONDARY) + '</div>' +
        '</div>' +
      '</div>';
  }

  function renderExpressPayments() {
    var options = [
      { id: "applePayExpress-checkoutLink", label: "Apple Pay", icon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/apple-pay-mark.svg" },
      { id: "paypalExpress-checkoutLink", label: "PayPal Express", icon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/logo-payment-pay-pal.svg" },
      { id: "clearpayExpress-checkoutLink", label: "Clearpay Express", icon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/clearpay-blackonmint.svg" },
      { id: "payinthreeExpress-checkoutLink", label: "PayPal Pay Later", icon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/logo-payment-pay-pal.svg" },
      { id: "klarnaExpress-checkoutLink", label: "Klarna Express Checkout", displayLabel: "Express Checkout", icon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/klarna-pink.svg", labelIcon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/logo-klarna.svg" },
      { id: "afterpayExpress-checkoutLink", label: "Afterpay Express", icon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/afterpay.svg" },
      { id: "googlePay-checkoutLink", label: "Google Pay", icon: HIP_ASSET_ORIGIN + "/skins/default/public/img/cart/googlepay.svg" },
      { id: "amazonPay-checkoutLink", label: "Amazon Pay", icon: "" }
    ];
    return '' +
      '<script src="https://sdk.woosmap.com/localities/localities.2.0.js"></script>' +
      '<div class="externalPaymentHide externalPayment externalPaymentLinks fs" style="display: block;">' +
        '<div class="orExpressPayment">Or</div>' +
        '<div id="externalDeliverySelect" class="hideElement" style="display: none;"></div>' +
        options.map(function (option) {
          return '' +
            '<div id="' + option.id + '" class="btn externalPaymentLink externalPaymentHide">' +
              '<a href="#!" data-cart-proceed data-payment-option="' + escapeHtml(option.label) + '">' +
                '<div class="linkIcon"></div>' +
                '<div class="externalPaymentLabel">' + (option.labelIcon ? '<img src="' + option.labelIcon + '" alt="">' : "") + escapeHtml(option.displayLabel || option.label) + '</div>' +
                (option.icon ? '<img class="linkIcon" src="' + option.icon + '" alt="' + escapeHtml(option.label) + '">' : "") +
              '</a>' +
            '</div>';
        }).join("") +
      '</div>';
  }

  function paymentOptionByValue(value) {
    return PAYMENT_OPTIONS.find(function (option) { return option.value === value; }) || PAYMENT_OPTIONS[0];
  }

  function renderBasketRow(item) {
    var lineTotal = money(Number(item.price || 0) * Math.max(1, Number(item.quantity || 1)));
    var productCode = item.productCode || item.sku || item.id || "";
    var cartPosition = "[" + escapeHtml(String(item.id || item.routeSlug || "0")) + "]";
    var itemDomId = escapeHtml(String(item.id || item.sku || item.routeSlug || "item") + "." + String(item.sizeSku || item.size || "0"));
    return '' +
      '<li class="basketListItem " data-cart-key="' + escapeHtml(cartIdentity(item)) + '">' +
        '<div class="itemImage">' +
          '<a class="itemImageLink" href="' + getProductHref(item) + '">' +
            '<img title="' + escapeHtml(item.title) + '" alt="' + escapeHtml(item.title) + '" src="' + escapeHtml(item.image) + '">' +
          '</a>' +
          '<a href="#!" title="Remove Item" class="cartPageItemQuanZero" id="' + itemDomId + '" data-cartposition="' + cartPosition + '" data-cart-remove>Remove</a>' +
        '</div>' +
        '<div class="itemInfo">' +
          '<h4 class="itemName"><a href="' + getProductHref(item) + '">' + escapeHtml(item.title) + '</a></h4>' +
          '<div class="itemCostPerItem"><span data-oi-price="">' + formatCurrency(item.price, item.currency) + '</span></div>' +
          '<span class="itemSize">UK Size: <span>' + escapeHtml(item.size || "ONE SIZE") + '</span> | Code: <span>' + escapeHtml(productCode) + '</span></span>' +
          renderItemColour(item) +
        '</div>' +
        '<div class="itemQuan">' +
          '<a href="#!" class="cartPageItemQuanMore btn btn-default" id="' + itemDomId + '" title="Increase quantity" data-cartposition="' + cartPosition + '" data-cart-increment aria-label="Increase quantity"><i class="fa fa-plus"></i></a>' +
          '<input class="itemQuantity" data-e2e="cart-item-quantity" type="text" readonly="readonly" value="' + escapeHtml(String(item.quantity || 1)) + '" aria-label="Quantity">' +
          '<a href="#!" class="cartPageItemQuanLess btn btn-default" id="' + itemDomId + '" title="Decrease quantity" data-cartposition="' + cartPosition + '" data-cart-decrement aria-label="Decrease quantity"><i class="fa fa-minus"></i></a>' +
          '<a href="#!" class="cartPageItemQuanZero" id="' + itemDomId + '" title="Remove" data-cartposition="' + cartPosition + '" data-cart-remove>Remove</a>' +
        '</div>' +
        '<div class="itemCost">' +
          '<span data-oi-price="">' + formatCurrency(lineTotal, item.currency) + '</span>' +
        '</div>' +
      '</li>';
  }

  function renderEmpty(main, message) {
    main.onclick = null;
    document.title = "My Bag | The Hip Store";
    main.innerHTML = '' +
      '<div id="checkoutPage">' +
        '<div id="basketPageMobilev2" class="basketFullList">' +
          '<div id="basketPageContent"><div class="maxWidth">' +
            '<div id="basketTitle"><h1>My Bag (0)</h1></div>' +
            '<div class="emptyBasketState"><h2>Your bag is empty</h2><p>' + escapeHtml(message || "Add products from the catalog to start building your basket.") + '</p><a class="checkoutPageCta" href="' + BASE_PATH + 'shop.html">Back to Shop All</a></div>' +
          '</div><div id="relatedItems"></div></div>' +
        '</div>' +
      '</div>';
    window.scrollTo(0, 0);
    revealShell();
  }

  function renderCartPage(main, items, products, sourceMode) {
    var subtotal = getSubtotal(items);
    var total = getTotal(items);
    var currency = items[0] && items[0].currency || "GBP";
    var itemCount = getQuantity(items);
    main.onclick = null;
    document.title = "My Bag | The Hip Store";
    main.innerHTML = '' +
      '<div id="checkoutPage">' +
        '<div id="basketPageMobilev2" class="basketFullList">' +
          '<div id="basketPageContent"><div class="maxWidth">' +
            '<div class="checkoutLoadingOverlay"><img alt="Loading" src="' + HIP_ASSET_ORIGIN + '/skins/default/public/img/icons/preload-white.gif"><h3 class="message"></h3></div>' +
            '<div id="basketTitle"><h1>My Bag (' + escapeHtml(String(itemCount)) + ')</h1></div>' +
            '<div id="basketContent" class="">' +
              '<div class="fs">' +
                '<div class="basketHeaderActions">' +
                  '<div class="totalGrand header">Total<span>(Excluding Delivery)</span><span class="header-total" data-oi-price="" data-basket-header-total>' + formatCurrency(total, currency) + '</span></div>' +
                  '<a href="#!" class="btn btn-level1 large wArro checkoutSecurely" title="Checkout securely" data-cart-proceed' + (items.length ? "" : ' disabled="disabled"') + '>Checkout securely</a>' +
                '</div>' +
                '<div id="basketHead"><div><span class="headTitle">Order Details</span><span class="headQty">Quantity</span><span class="headPrice">Item Price</span><span class="headSub">Sub-total</span></div></div>' +
                '<div id="basketList" data-e2e="cart-basket-list"><div class="fs-mod formList"><div class="fs-mod-cnt"><div class="fs-grp"><div class="fs-row lst nlb"><ul><div class="fulfillmentGroup">' + items.map(renderBasketRow).join("") + '</div></ul></div></div></div></div></div>' +
                '<div id="basketActions">' +
                  '<div class="basketPromo" id="promo">' +
                    '<div class="discountsMenu center "><div class="discountsOption myOption inactive" data-discount-toggle><span>Add Discount / Promo Code<img class="promoDownIcon" src="' + PROMO_DOWN_ICON + '" alt=""><img class="promoUpIcon" src="' + PROMO_UP_ICON + '" alt=""></span></div></div>' +
                    '<div id="discountForm" class="hidden "><input type="text" name="discountCode" id="discountCodeCheckout" placeholder="Offer Code" title="Enter discount code" autocomplete="off"><button class="btn btn-level3 cta newsletter redeemButton" type="submit" name="signup" id="applyDiscountButtonCheckout" title="Submit code" value="Apply" data-discount-submit>Apply</button><p class="discountWarningBox center hidden"></p></div>' +
                  '</div>' +
                '</div>' +
                '<div id="basketTotals" class="totalSummary payment-icons-restyle">' +
                  '<div class="totals-wrapper">' +
                    '<div class="subtotalGrand" data-e2e="cart-basketTotals-subtotal">Subtotal&nbsp;<span class="excludeDeliveryChange"></span><strong data-oi-price="" data-basket-subtotal>' + formatCurrency(subtotal, currency) + '</strong></div>' +
                    '<div class="totalGrand" data-e2e="cart-basketTotals-total">Total:&nbsp;<strong data-oi-price="" data-basket-total>' + formatCurrency(total, currency) + '</strong></div>' +
                  '</div>' +
                  renderPaymentMethodsBlock() +
                  '<div class="basketContinue"><a href="#!" class="btn btn-level1 large wArro" title="Checkout securely" data-cart-proceed' + (items.length ? "" : ' disabled="disabled"') + '>Checkout securely</a></div>' +
                '</div>' +
                '<div class="giftCardsOption myOption inactive hidden" style="margin-bottom: 16px"><span>Add Gift Card<img class="cardDownIcon" src="' + PROMO_DOWN_ICON + '" alt=""><img class="cardUpIcon" src="' + PROMO_UP_ICON + '" alt=""></span></div>' +
                '<div id="giftCardsForm" class="hidden"><input type="number" name="discountCode" id="giftCardId" placeholder="Gift Card Number" title="Enter discount code" autocomplete="off"><p class="codeWarningBox center hidden"></p><div class="PINbox"><input type="text" class="input inputPin" name="discountPin" placeholder="4-Digit PIN" autocomplete="off"><img class="debitCardIcon" src="' + HIP_ASSET_ORIGIN + '/skins/default/public/img/giftcards/Icon-CVV.svg" alt=""><button class="redeemButton btn btn-level3" type="button" id="applyGiftCardButton" title="Submit code" value="Apply" data-giftcard-submit>Apply</button></div><p class="warningBox center hidden"></p></div>' +
                '<input type="hidden" id="paymentResponse" value="">' +
              '</div>' +
            '</div>' +
          '</div><div id="relatedItems"></div></div>' +
        '</div>' +
      '</div>';
    window.scrollTo(0, 0);
    revealShell();

    main.onclick = function onCartClick(event) {
      var proceed = event.target.closest("[data-cart-proceed]");
      if (proceed) {
        event.preventDefault();
        var latestItems = sourceMode === "single" ? items : getCartItems(products);
        if (!latestItems.length) return;
        renderCheckoutForm(main, latestItems, products, sourceMode);
        return;
      }

      var discountToggle = event.target.closest("[data-discount-toggle]");
      if (discountToggle) {
        event.preventDefault();
        var promoRoot = main.querySelector("#promo");
        var discountForm = main.querySelector("#discountForm");
        var open = discountForm && discountForm.classList.contains("hidden");
        if (promoRoot) promoRoot.classList.toggle("is-open", Boolean(open));
        if (discountForm) discountForm.classList.toggle("hidden", !open);
        return;
      }

      var discountSubmit = event.target.closest("[data-discount-submit]");
      if (discountSubmit) {
        event.preventDefault();
        var discountCode = main.querySelector("#discountCodeCheckout");
        var discountWarning = main.querySelector(".discountWarningBox");
        if (discountWarning) {
          discountWarning.textContent = String(discountCode && discountCode.value || "").trim()
            ? "Promo codes are not configured yet."
            : "Enter a promo code.";
          discountWarning.classList.remove("hidden");
        }
        return;
      }

      var giftToggle = event.target.closest(".giftCardsOption");
      if (giftToggle) {
        event.preventDefault();
        giftToggle.classList.toggle("is-open");
        var giftForm = main.querySelector("#giftCardsForm");
        if (giftForm) giftForm.classList.toggle("hidden");
        return;
      }

      var giftSubmit = event.target.closest("[data-giftcard-submit]");
      if (giftSubmit) {
        event.preventDefault();
        var giftWarning = main.querySelector(".warningBox");
        if (giftWarning) {
          giftWarning.textContent = "Gift cards are not configured yet.";
          giftWarning.classList.remove("hidden");
        }
        return;
      }

      var row = event.target.closest("[data-cart-key]");
      if (!row) return;
      var key = row.getAttribute("data-cart-key");
      var nextItems = sourceMode === "single"
        ? items.map(function (item) {
            return Object.assign({}, item);
          })
        : getCartItems(products);
      var remove = event.target.closest("[data-cart-remove]");
      var increment = event.target.closest("[data-cart-increment]");
      var decrement = event.target.closest("[data-cart-decrement]");
      if (!remove && !increment && !decrement) return;
      event.preventDefault();

      nextItems = nextItems.filter(function (item) { return item && item.routeSlug; });
      nextItems.forEach(function (item) {
        if (cartIdentity(item) !== key) return;
        if (increment) item.quantity = Math.min(99, Math.max(1, Number(item.quantity || 1) + 1));
        if (decrement) item.quantity = Math.max(1, Math.min(99, Number(item.quantity || 1) - 1));
      });
      if (remove) {
        nextItems = nextItems.filter(function (item) { return cartIdentity(item) !== key; });
      }
      if (sourceMode !== "single") writeCart(nextItems);
      if (!nextItems.length) {
        renderEmpty(main, "Your basket has been cleared.");
        return;
      }
      renderCartPage(main, nextItems, products, sourceMode);
    };
  }

  function formatCheckoutCurrency(value, currency) {
    var amount = Number(value || 0);
    var code = currency || "GBP";
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (_error) {
      return code + " " + amount.toFixed(2);
    }
  }

  function getCheckoutThumbnail(image) {
    var src = String(image || BASE_PATH + "placeholder.svg");
    if (src.indexOf("i8.amplience.net/i/jpl/") !== -1) {
      return src.split("?")[0] + "?qlt=92&w=80&h=80";
    }
    return src;
  }

  function getCheckoutDiscountSavings(items) {
    return money((Array.isArray(items) ? items : []).reduce(function (sum, item) {
      var quantity = Math.max(1, Number(item.quantity || 1));
      var oldPrice = item.oldPrice != null ? Number(item.oldPrice) : null;
      var price = Number(item.price || 0);
      return sum + (oldPrice && oldPrice > price ? money((oldPrice - price) * quantity) : 0);
    }, 0));
  }

  function renderCheckoutEditIcon() {
    return '' +
      '<a href="#!" class="hipCheckoutEdit" aria-label="Edit basket" data-back-to-basket>' +
        '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
          '<path d="M11.4 1.8 14.2 4.6 5.5 13.3 1.8 14.2 2.7 10.5 11.4 1.8Z"></path>' +
          '<path d="M10.1 3.1 12.9 5.9"></path>' +
        '</svg>' +
      '</a>';
  }

  function renderCheckoutCard(title, action, body, extraClass) {
    return '' +
      '<section class="hipCheckoutCard' + (extraClass ? ' ' + extraClass : '') + '">' +
        '<div class="hipCheckoutCardHeader">' +
          '<h3>' + escapeHtml(title) + '</h3>' +
          '<div class="hipCheckoutCardAction">' + (action || "") + '</div>' +
        '</div>' +
        '<div class="hipCheckoutCardBody">' + body + '</div>' +
      '</section>';
  }

  function renderCheckoutTotalRow(label, value, className, note) {
    return '' +
      '<div class="hipCheckoutTotalRow' + (className ? ' ' + className : '') + '">' +
        '<span>' + escapeHtml(label) + (note ? ' <em>' + escapeHtml(note) + '</em>' : '') + '</span>' +
        '<strong>' + escapeHtml(value) + '</strong>' +
      '</div>';
  }

  function renderCheckoutSummaryItem(item) {
    var quantity = Math.max(1, Number(item.quantity || 1));
    var linePrice = money(Number(item.price || 0) * quantity);
    var oldPrice = item.oldPrice != null ? Number(item.oldPrice) : null;
    var productCode = item.id || item.sku || item.productCode || "";
    return '' +
      '<div class="hipCheckoutSummaryItem">' +
        '<img width="80" height="80" src="' + escapeHtml(getCheckoutThumbnail(item.image)) + '" alt="' + escapeHtml(item.title) + '">' +
        '<div class="hipCheckoutSummaryCopy">' +
          '<span class="hipCheckoutSummaryTitle">' + escapeHtml(item.title || "Product") + '</span>' +
          '<span class="hipCheckoutSummaryPrices">' +
            (oldPrice && oldPrice > Number(item.price || 0) ? '<span class="hipCheckoutWasPrice">' + formatCheckoutCurrency(oldPrice * quantity, item.currency) + '</span>' : '') +
            '<span>' + formatCheckoutCurrency(linePrice, item.currency) + '</span>' +
          '</span>' +
          '<span class="hipCheckoutSummaryMeta">Size: ' + escapeHtml(item.size || "ONE SIZE") + ' |&nbsp;Code: ' + escapeHtml(productCode) + ' |&nbsp;Qty: ' + escapeHtml(String(quantity)) + '</span>' +
        '</div>' +
      '</div>';
  }

  function renderCheckoutField(field, id, label, required, autocomplete, value, type) {
    return '' +
      '<div class="hipCheckoutField">' +
        '<label for="' + id + '">' + (required ? '<span>*</span>' : '') + escapeHtml(label) + '</label>' +
        '<div class="hipCheckoutInputWrap">' +
          '<input id="' + id + '" name="' + escapeHtml(field) + '" type="' + escapeHtml(type || "text") + '" autocomplete="' + escapeHtml(autocomplete || "off") + '" data-testid="validatedInput" data-customer-field="' + escapeHtml(field) + '" value="' + escapeHtml(value || "") + '">' +
          '<span class="hipCheckoutValidationIcon" aria-label="Information"></span>' +
        '</div>' +
        '<p class="hipCheckoutFieldError" data-field-error="' + escapeHtml(field) + '" hidden></p>' +
      '</div>';
  }

  function renderCheckoutPhoneField(value, selectedCountry) {
    var country = countryFromPhone(value) || countryByName(selectedCountry || "United Kingdom");
    return '' +
      '<div class="hipCheckoutField hipCheckoutPhoneField">' +
        '<label for="phone-id"><span>*</span>Contact Number</label>' +
        '<p>We will use this for delivery updates.</p>' +
        '<div class="hipCheckoutInputWrap hipPhoneInput">' +
          '<select class="hipPhoneCountrySelect" aria-label="Phone country" data-phone-country>' + phoneCountryOptionsHtml(country.name) + '</select>' +
          '<input id="phone-id" name="phone" type="tel" autocomplete="tel" data-testid="validatedInput" data-customer-field="phone" value="' + escapeHtml(value || "") + '">' +
          '<span class="hipCheckoutValidationIcon" aria-label="Information"></span>' +
        '</div>' +
        '<p class="hipCheckoutFieldError" data-field-error="phone" hidden></p>' +
      '</div>';
  }

  function renderCheckoutCountryField(value) {
    var country = countryByName(value);
    return '' +
      '<div class="hipCheckoutField hipCheckoutCountryField">' +
        '<label for="country-id">Country</label>' +
        '<div class="hipCheckoutSelect">' +
          '<select id="country-id" name="country" autocomplete="country-name" data-testid="countrySelect" data-customer-field="country" data-country-select>' + countryOptionsHtml(country.name) + '</select>' +
          '<span class="hipCheckoutValidationIcon" aria-label="Information"></span>' +
          '<svg aria-label="FormDown" viewBox="0 0 24 24" aria-hidden="true"><polyline fill="none" stroke="#000" stroke-width="2" points="18 9 12 15 6 9"></polyline></svg>' +
        '</div>' +
        '<p class="hipCheckoutFieldError" data-field-error="country" hidden></p>' +
      '</div>';
  }

  function checkoutField(main, name) {
    return main && main.querySelector('[data-customer-field="' + name + '"]');
  }

  function checkoutFieldErrorMessage(name, value) {
    value = cleanInput(value);
    if (!value) {
      if (name === "email") return "Please enter your email address.";
      if (name === "firstName") return "Please enter your first name.";
      if (name === "lastName") return "Please enter your last name.";
      if (name === "phone") return "Please enter your contact number.";
      if (name === "address") return "Please enter address line 1.";
      if (name === "city") return "Please enter your town or city.";
      if (name === "postcode") return "Please enter your postcode.";
      if (name === "country") return "Please select your country.";
      return "Please complete this field.";
    }
    if (name === "email") return "Please enter a valid email address.";
    if (name === "firstName") return "First name must use letters and be at least 2 characters.";
    if (name === "lastName") return "Last name must use letters and be at least 2 characters.";
    if (name === "phone") return "Please enter a valid contact number.";
    if (name === "address") return "Address line 1 must include letters and be at least 5 characters.";
    if (name === "address2") return "Address line 2 must be at least 2 characters, or leave it empty.";
    if (name === "city") return "Town or city must use letters and be at least 2 characters.";
    if (name === "postcode") return "Please enter a valid postcode.";
    if (name === "country") return "Please select a valid country.";
    return "Please check this field.";
  }

  function setCheckoutFieldState(main, name, state, showError, message) {
    var field = checkoutField(main, name);
    var row = field && field.closest(".hipCheckoutField");
    var icon = row && row.querySelector(".hipCheckoutValidationIcon");
    var errorNode = row && row.querySelector('[data-field-error="' + name + '"]');
    if (icon) {
      icon.classList.toggle("is-valid", state === "valid");
      icon.classList.toggle("is-invalid", state === "invalid");
      icon.setAttribute("aria-label", state === "valid" ? "Valid" : state === "invalid" ? "Invalid" : "Information");
    }
    if (field) field.setAttribute("aria-invalid", state === "invalid" ? "true" : "false");
    if (errorNode) {
      if (state === "invalid") {
        errorNode.textContent = message || checkoutFieldErrorMessage(name, field && field.value);
        errorNode.hidden = false;
      } else {
        errorNode.textContent = "";
        errorNode.hidden = true;
      }
    }
    if (row) row.classList.toggle("has-error", Boolean(showError));
  }

  function validateCheckoutField(main, name, force) {
    var field = checkoutField(main, name);
    if (!field) return true;
    var value = cleanInput(field.value);
    var hasValue = value.length > 0;
    var optional = name === "address2";
    var valid = true;
    if (name === "email") valid = isValidEmail(value);
    else if (name === "firstName" || name === "lastName") valid = isValidName(value);
    else if (name === "phone") valid = isValidPhone(value);
    else if (name === "address") valid = isValidAddressLine(value);
    else if (name === "address2") valid = isValidOptionalAddressLine(value);
    else if (name === "city") valid = isValidTown(value);
    else if (name === "postcode") valid = isValidPostcode(value);
    else if (name === "country") valid = isValidCountry(value);

    if (optional && !hasValue) {
      setCheckoutFieldState(main, name, "info", false);
      return true;
    }
    if (!hasValue && !force) {
      setCheckoutFieldState(main, name, "info", false);
      return false;
    }
    setCheckoutFieldState(main, name, valid ? "valid" : "invalid", !valid && force, valid ? "" : checkoutFieldErrorMessage(name, value));
    return valid;
  }

  function validateCheckoutForm(main, force) {
    return ["email", "firstName", "lastName", "phone", "country", "address", "address2", "city", "postcode"].reduce(function (valid, name) {
      return validateCheckoutField(main, name, force) && valid;
    }, true);
  }

  function bindCheckoutValidation(main) {
    ["email", "firstName", "lastName", "phone", "country", "address", "address2", "city", "postcode"].forEach(function (name) {
      var field = checkoutField(main, name);
      if (!field) return;
      field.addEventListener("input", function () {
        validateCheckoutField(main, name, false);
      });
      field.addEventListener("change", function () {
        validateCheckoutField(main, name, false);
      });
      field.addEventListener("blur", function () {
        validateCheckoutField(main, name, true);
      });
    });
    validateCheckoutForm(main, false);
  }

  function bindCountryControls(main) {
    var countrySelect = main.querySelector("[data-country-select]");
    var phoneCountrySelect = main.querySelector("[data-phone-country]");
    var phoneInput = main.querySelector('[data-customer-field="phone"]');
    if (!countrySelect || !phoneInput) return;

    function syncCountry(country) {
      if (!country) return;
      countrySelect.value = country.name;
      if (phoneCountrySelect) phoneCountrySelect.value = country.iso;
      validateCheckoutField(main, "country", false);
      validateCheckoutField(main, "phone", false);
    }

    countrySelect.addEventListener("change", function () {
      syncCountry(countryByName(countrySelect.value || "United Kingdom"));
    });

    if (phoneCountrySelect) {
      phoneCountrySelect.addEventListener("change", function () {
        syncCountry(countryByIso(phoneCountrySelect.value));
      });
    }

    phoneInput.addEventListener("input", function () {
      var detected = countryFromPhone(phoneInput.value);
      if (detected) syncCountry(detected);
      validateCheckoutField(main, "phone", false);
    });

    syncCountry(countryFromPhone(phoneInput.value) || countryByName(countrySelect.value || "United Kingdom"));
    validateCheckoutField(main, "country", false);
  }

  function renderPaymentIcon(option) {
    option = option || {};
    if (option.future) {
      return '<span class="hipPaymentFutureIcon" aria-hidden="true"><span></span><span></span><span></span></span>';
    }
    var icons = Array.isArray(option.icons) ? option.icons.filter(Boolean) : [];
    return '<span class="' + (icons.length > 1 ? 'hipPaymentIconGroup' : 'hipPaymentLogo') + '" aria-hidden="true">' +
      icons.map(function (icon) {
        return '<img src="' + escapeHtml(icon) + '" alt="">';
      }).join("") +
    '</span>';
  }

  function renderSelectedPaymentSummary(paymentMethod) {
    var option = paymentOptionByValue(paymentMethod);
    return '' +
      '<div class="hipSelectedPayment">' +
        '<span class="hipPaymentOptionIcon">' + renderPaymentIcon(option) + '</span>' +
        '<span class="hipSelectedPaymentCopy">' +
          '<strong>' + escapeHtml(option.label) + '</strong>' +
          (option.note ? '<em>' + escapeHtml(option.note) + '</em>' : '') +
        '</span>' +
      '</div>';
  }

  function paymentProviderForMethod(method) {
    var option = paymentOptionByValue(method);
    var providers = {
      manual_payment: "manual",
      card: "card",
      paypal: "paypal",
      apple_pay: "apple_pay",
      klarna: "klarna",
      future_method: "future_method",
    };
    return providers[option.value] || option.value || "manual";
  }

  function buildPaymentDetails(paymentMethod, customer) {
    var option = paymentOptionByValue(paymentMethod);
    customer = customer || {};
    return {
      provider: paymentProviderForMethod(option.value),
      integrationStatus: "placeholder",
      providerStatus: "not_configured",
      reference: "",
      methodLabel: option.label,
      note: "Payment provider integration is not configured yet. Replace this object with provider-safe payment details.",
      billingName: [customer.firstName, customer.lastName].filter(Boolean).join(" "),
      billingPostcode: customer.postcode || "",
    };
  }

  function renderPaymentOption(option, checked) {
    return '' +
      '<label class="hipPaymentOption">' +
        '<input type="radio" name="paymentMethod" value="' + escapeHtml(option.value) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="hipRadioBox" aria-hidden="true"></span>' +
        '<span class="hipPaymentOptionIcon">' + renderPaymentIcon(option) + '</span>' +
        '<span class="hipPaymentOptionCopy">' +
          '<span class="hipPaymentOptionText">' + escapeHtml(option.label) + '</span>' +
          (option.note ? '<span class="hipPaymentOptionNote">' + escapeHtml(option.note) + '</span>' : '') +
        '</span>' +
      '</label>';
  }

  function renderCustomerSummary(customer) {
    customer = customer || {};
    var name = [customer.firstName, customer.lastName].filter(Boolean).join(" ");
    var address = [customer.address, customer.address2, customer.city, customer.postcode, customer.country].filter(Boolean).join(", ");
    return '' +
      '<div class="hipCustomerSummary">' +
        '<p><strong>' + escapeHtml(name || "Guest customer") + '</strong></p>' +
        '<p>' + escapeHtml(customer.email || "") + (customer.phone ? '<br>' + escapeHtml(customer.phone) : "") + '</p>' +
        '<p>' + escapeHtml(address || "") + '</p>' +
      '</div>';
  }

  function renderCheckoutForm(main, items, products, sourceMode, initialCustomer) {
    var subtotal = getSubtotal(items);
    var total = getTotal(items);
    var discountSavings = getCheckoutDiscountSavings(items);
    var currency = items[0] && items[0].currency || "GBP";
    var customer = initialCustomer || {};
    var selectedCountry = (countryFromPhone(customer.phone) || countryByName(customer.country || "United Kingdom")).name;
    main.onclick = null;
    document.title = "Checkout | The Hip Store";
    main.innerHTML = '' +
      '<div id="checkoutPage">' +
        '<div id="basketPageContent"><div class="maxWidth">' +
          '<div class="hipCheckoutGrid">' +
            '<aside class="hipCheckoutSummaryColumn">' +
              renderCheckoutCard("Summary (" + getQuantity(items) + ")", renderCheckoutEditIcon(), items.map(renderCheckoutSummaryItem).join(""), "") +
              renderCheckoutCard("Total Summary", "", '' +
                '<div class="hipCheckoutTotals">' +
                  renderCheckoutTotalRow("Subtotal", formatCheckoutCurrency(subtotal, currency), "", "") +
                  renderCheckoutTotalRow("Discount & Savings", (discountSavings ? "-" : "") + formatCheckoutCurrency(discountSavings, currency), "saving", "") +
                  renderCheckoutTotalRow("Total", formatCheckoutCurrency(total, currency), "grand", "(excluding delivery)") +
                  '<button aria-label="Checkout Securely" disabled type="button" class="hipCheckoutSecureDisabled"><span>Checkout Securely</span></button>' +
                '</div>', "") +
              '<p class="hipCheckoutPrivacy">We will use your information in accordance with our <a target="_blank" rel="noreferrer" href="../privacy.html">privacy notice</a>.</p>' +
            '</aside>' +
            '<section class="hipCheckoutMainColumn">' +
              '<form data-checkout-form novalidate>' +
                renderCheckoutCard("Contact Details", "", '' +
                  '<p data-form-error class="checkoutNotice hidden"></p>' +
                  '<div class="hipCheckoutFields">' +
                    renderCheckoutField("email", "email-id", "Email Address", true, "email", customer.email || "", "email") +
                    renderCheckoutField("firstName", "firstName-id", "First Name", true, "given-name", customer.firstName || "") +
                    renderCheckoutField("lastName", "lastName-id", "Last Name", true, "family-name", customer.lastName || "") +
                    renderCheckoutPhoneField(customer.phone || "", selectedCountry) +
                  '</div>' +
                  '<div class="hipCheckoutInfo">' +
                    '<svg aria-label="CircleInformation" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="#000" stroke-width="2" d="M12,22 C17.5228475,22 22,17.5228475 22,12 C22,6.4771525 17.5228475,2 12,2 C6.4771525,2 2,6.4771525 2,12 C2,17.5228475 6.4771525,22 12,22 Z M12,10 L12,18 M12,6 L12,8"></path></svg>' +
                    '<span>We will contact you with updates on your order</span>' +
                  '</div>' +
                  '<label class="hipCheckoutCheckbox">' +
                    '<input type="checkbox" checked>' +
                    '<span class="hipCheckBox" aria-hidden="true"></span>' +
                    '<span>We will share our latest launches, offers and new drops with you via SMS, unless you untick this box.</span>' +
                  '</label>', "") +
                '<div class="hipCheckoutSectionGap"></div>' +
                renderCheckoutCard("Delivery Address", "", '' +
                  '<div class="hipCheckoutAddressFields">' +
                    renderCheckoutCountryField(selectedCountry) +
                    renderCheckoutField("address", "address1-id", "Address line 1", true, "address-line1", customer.address || "") +
                    renderCheckoutField("address2", "address2-id", "Address line 2 (optional)", false, "address-line2", customer.address2 || "") +
                    renderCheckoutField("city", "town-id", "Town/City", true, "address-level2", customer.city || "") +
                    renderCheckoutField("postcode", "postcode-id", "Postcode", true, "postal-code", customer.postcode || "") +
                  '</div>', "") +
                '<div class="hipCheckoutSubmitRow"><button type="submit" class="hipCheckoutSubmit" data-place-order>Save and Continue</button></div>' +
              '</form>' +
            '</section>' +
          '</div>' +
        '</div></div>' +
      '</div>';
    window.scrollTo(0, 0);
    revealShell();
    bindCountryControls(main);
    bindCheckoutValidation(main);

    main.querySelector("[data-back-to-basket]")?.addEventListener("click", function (event) {
      event.preventDefault();
      var nextItems = sourceMode === "single" ? items : getCartItems(products);
      renderCartPage(main, nextItems, products, sourceMode);
    });

    main.querySelector("[data-checkout-form]")?.addEventListener("submit", function (event) {
      event.preventDefault();
      var customer = collectCustomer(main);
      var errorNode = main.querySelector("[data-form-error]");
      if (!validateCheckoutForm(main, true)) {
        if (errorNode) {
          errorNode.textContent = "Please check the fields marked in red.";
          errorNode.classList.remove("hidden");
        }
        return;
      }
      if (errorNode) errorNode.classList.add("hidden");
      renderPaymentMethodPage(main, items, products, sourceMode, customer);
    });
  }

  function renderPaymentMethodPage(main, items, products, sourceMode, customer) {
    var subtotal = getSubtotal(items);
    var total = getTotal(items);
    var discountSavings = getCheckoutDiscountSavings(items);
    var currency = items[0] && items[0].currency || "GBP";
    main.onclick = null;
    document.title = "Payment | The Hip Store";
    main.innerHTML = '' +
      '<div id="checkoutPage">' +
        '<div id="basketPageContent"><div class="maxWidth">' +
          '<div class="hipCheckoutGrid">' +
            '<aside class="hipCheckoutSummaryColumn">' +
              renderCheckoutCard("Summary (" + getQuantity(items) + ")", renderCheckoutEditIcon(), items.map(renderCheckoutSummaryItem).join(""), "") +
              renderCheckoutCard("Total Summary", "", '' +
                '<div class="hipCheckoutTotals">' +
                  renderCheckoutTotalRow("Subtotal", formatCheckoutCurrency(subtotal, currency), "", "") +
                  renderCheckoutTotalRow("Discount & Savings", (discountSavings ? "-" : "") + formatCheckoutCurrency(discountSavings, currency), "saving", "") +
                  renderCheckoutTotalRow("Total", formatCheckoutCurrency(total, currency), "grand", "(excluding delivery)") +
                '</div>', "") +
            '</aside>' +
            '<section class="hipCheckoutMainColumn">' +
              renderCheckoutCard("Delivery Details", '<a href="#!" class="hipCheckoutSmallAction" data-edit-details>Edit</a>', renderCustomerSummary(customer), "") +
              '<form data-payment-form>' +
                renderCheckoutCard("Payment Method", "", '' +
                  '<p data-payment-error class="checkoutNotice hidden"></p>' +
                  '<div class="hipPaymentOptions">' + PAYMENT_OPTIONS.map(function (option, index) { return renderPaymentOption(option, index === 0); }).join("") + '</div>', "") +
                '<div class="hipCheckoutSubmitRow"><button type="submit" class="hipCheckoutSubmit" data-place-order>Continue to Payment</button></div>' +
              '</form>' +
            '</section>' +
          '</div>' +
        '</div></div>' +
      '</div>';
    window.scrollTo(0, 0);
    revealShell();

    main.querySelector("[data-back-to-basket]")?.addEventListener("click", function (event) {
      event.preventDefault();
      var nextItems = sourceMode === "single" ? items : getCartItems(products);
      renderCartPage(main, nextItems, products, sourceMode);
    });

    main.querySelector("[data-edit-details]")?.addEventListener("click", function (event) {
      event.preventDefault();
      renderCheckoutForm(main, items, products, sourceMode, customer);
    });

    main.querySelector("[data-payment-form]")?.addEventListener("submit", function (event) {
      event.preventDefault();
      var checked = main.querySelector('input[name="paymentMethod"]:checked');
      var errorNode = main.querySelector("[data-payment-error]");
      if (!checked) {
        if (errorNode) {
          errorNode.textContent = "Please choose a payment method.";
          errorNode.classList.remove("hidden");
        }
        return;
      }
      if (errorNode) errorNode.classList.add("hidden");
      renderPaymentScreenPage(main, items, products, sourceMode, customer, checked.value);
    });
  }

  function renderPaymentScreenPage(main, items, products, sourceMode, customer, paymentMethod) {
    var subtotal = getSubtotal(items);
    var total = getTotal(items);
    var discountSavings = getCheckoutDiscountSavings(items);
    var currency = items[0] && items[0].currency || "GBP";
    main.onclick = null;
    document.title = "Payment | The Hip Store";
    main.innerHTML = '' +
      '<div id="checkoutPage">' +
        '<div id="basketPageContent"><div class="maxWidth">' +
          '<div class="hipCheckoutGrid">' +
            '<aside class="hipCheckoutSummaryColumn">' +
              renderCheckoutCard("Summary (" + getQuantity(items) + ")", renderCheckoutEditIcon(), items.map(renderCheckoutSummaryItem).join(""), "") +
              renderCheckoutCard("Total Summary", "", '' +
                '<div class="hipCheckoutTotals">' +
                  renderCheckoutTotalRow("Subtotal", formatCheckoutCurrency(subtotal, currency), "", "") +
                  renderCheckoutTotalRow("Discount & Savings", (discountSavings ? "-" : "") + formatCheckoutCurrency(discountSavings, currency), "saving", "") +
                  renderCheckoutTotalRow("Total", formatCheckoutCurrency(total, currency), "grand", "(excluding delivery)") +
                '</div>', "") +
            '</aside>' +
            '<section class="hipCheckoutMainColumn">' +
              renderCheckoutCard("Delivery Details", '<a href="#!" class="hipCheckoutSmallAction" data-edit-details>Edit</a>', renderCustomerSummary(customer), "") +
              renderCheckoutCard("Payment Method", '<a href="#!" class="hipCheckoutSmallAction" data-edit-payment>Change</a>', renderSelectedPaymentSummary(paymentMethod), "") +
              renderCheckoutCard("Payment", "", '' +
                '<div class="hipPaymentUnavailable">' +
                  '<div class="hipPaymentSkeletonCard" aria-hidden="true">' +
                    '<span class="hipSkeletonLine wide"></span>' +
                    '<span class="hipSkeletonLine"></span>' +
                    '<span class="hipSkeletonInput"></span>' +
                    '<span class="hipSkeletonLine short"></span>' +
                    '<div class="hipSkeletonSplit"><span class="hipSkeletonInput"></span><span class="hipSkeletonInput"></span></div>' +
                  '</div>' +
                  '<p class="checkoutNotice hipPaymentNotice">Payment screen is not ready yet.</p>' +
                  '<p class="hipPaymentDevNote">This is a placeholder for the future payment provider integration.</p>' +
                '</div>', "") +
              '<div class="hipCheckoutSubmitRow"><button type="button" class="hipCheckoutSubmit" disabled>Payment Not Ready</button></div>' +
            '</section>' +
          '</div>' +
        '</div></div>' +
      '</div>';
    window.scrollTo(0, 0);
    revealShell();

    main.querySelector("[data-back-to-basket]")?.addEventListener("click", function (event) {
      event.preventDefault();
      var nextItems = sourceMode === "single" ? items : getCartItems(products);
      renderCartPage(main, nextItems, products, sourceMode);
    });

    main.querySelector("[data-edit-details]")?.addEventListener("click", function (event) {
      event.preventDefault();
      renderCheckoutForm(main, items, products, sourceMode, customer);
    });

    main.querySelector("[data-edit-payment]")?.addEventListener("click", function (event) {
      event.preventDefault();
      renderPaymentMethodPage(main, items, products, sourceMode, customer);
    });
  }

  function collectCustomer(main) {
    var customer = {};
    main.querySelectorAll("[data-customer-field]").forEach(function (field) {
      customer[field.getAttribute("data-customer-field")] = String(field.value || "").trim();
    });
    return customer;
  }

  function validateCustomer(customer) {
    customer = customer || {};
    return isValidEmail(customer.email) &&
      isValidName(customer.firstName) &&
      isValidName(customer.lastName) &&
      isValidPhone(customer.phone) &&
      isValidCountry(customer.country) &&
      isValidAddressLine(customer.address) &&
      isValidOptionalAddressLine(customer.address2) &&
      isValidTown(customer.city) &&
      isValidPostcode(customer.postcode);
  }

  function normalizeOrder(response, customer, items, paymentMethod) {
    var order = response && response.order ? response.order : {};
    var selectedPayment = paymentOptionByValue(paymentMethod);
    var responseItems = Array.isArray(order.items) && order.items.length
      ? order.items
      : (order.item ? [order.item] : (Array.isArray(order.order_items) ? order.order_items : []));
    var normalizedItems = (responseItems.length ? responseItems : items).map(function (item, index) {
      var fallback = items[index] || items[0] || {};
      return {
        routeSlug: item.route_slug || item.routeSlug || fallback.routeSlug || "",
        sku: item.sku || fallback.sku || "",
        productCode: item.product_code || item.productCode || fallback.productCode || "",
        title: item.title || fallback.title || "Product",
        brand: item.brand || fallback.brand || "Product",
        size: item.selected_size || item.selectedSize || fallback.size || "ONE SIZE",
        quantity: Number(item.quantity || fallback.quantity || 1),
        unitPrice: Number(item.unit_price != null ? item.unit_price : fallback.price || 0),
        oldPrice: item.old_price != null ? Number(item.old_price) : (fallback.oldPrice != null ? Number(fallback.oldPrice) : null),
        image: item.image_url || item.image || fallback.image || BASE_PATH + "placeholder.svg",
      };
    });
    return {
      orderId: response.order_number || order.order_number || order.orderId || "",
      paymentMessage: "Order received.",
      paymentStatus: response.payment_status || order.payment_status || "payment_not_configured",
      paymentMethod: selectedPayment.label,
      paymentMethodValue: selectedPayment.value,
      paymentProvider: response.payment_provider || order.payment_provider || paymentProviderForMethod(selectedPayment.value),
      paymentReference: response.payment_reference || order.payment_reference || "",
      paymentDetails: response.payment_details || order.payment_details || buildPaymentDetails(selectedPayment.value, customer),
      status: response.status || order.status || "payment_pending",
      isDevFallback: Boolean(response.is_dev_fallback),
      customer: customer,
      items: normalizedItems,
      currency: order.currency || (normalizedItems[0] && items[0].currency) || "GBP",
      subtotal: Number(order.subtotal != null ? order.subtotal : getSubtotal(items)),
      shipping: Number(order.shipping != null ? order.shipping : STANDARD_SHIPPING),
      total: Number(order.total != null ? order.total : getTotal(items)),
    };
  }

  function submitOrder(main, items, products, sourceMode, customer, paymentMethod, paymentDetails) {
    customer = customer || collectCustomer(main);
    var errorNode = main.querySelector("[data-payment-error]") || main.querySelector("[data-form-error]");
    var button = main.querySelector("[data-place-order]");
    if (!validateCustomer(customer)) {
      if (errorNode) {
        errorNode.textContent = "Please complete all required fields.";
        errorNode.classList.remove("hidden");
      }
      return;
    }
    if (errorNode) errorNode.classList.add("hidden");

    if (!window.HipStoreBackend || typeof window.HipStoreBackend.createOrder !== "function") {
      if (errorNode) {
        errorNode.textContent = "Order backend is not loaded. Please refresh and try again.";
        errorNode.classList.remove("hidden");
      }
      return;
    }

    if (button) {
      button.disabled = true;
      button.textContent = "Saving...";
    }

    window.HipStoreBackend.createOrder({
      customer: {
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        address: customer.address,
        address2: customer.address2,
        city: customer.city,
        state: "",
        postcode: customer.postcode,
        country: customer.country,
      },
      paymentMethod: paymentMethod,
      paymentDetails: paymentDetails || buildPaymentDetails(paymentMethod, customer),
      items: items.map(function (item) {
        return {
          productId: item.id,
          sku: item.sku,
          routeSlug: item.routeSlug,
          selectedSize: item.size,
          quantity: Math.max(1, Number(item.quantity || 1)),
          title: item.title,
          brand: item.brand,
          price: Number(item.price || 0),
          oldPrice: item.oldPrice,
          currency: item.currency || "GBP",
          productCode: item.productCode,
          image: item.image,
          sourceUrl: item.sourceUrl,
          sizeSku: item.sizeSku,
        };
      }),
      shipping: STANDARD_SHIPPING,
    }).then(function (response) {
      if (sourceMode !== "single") {
        var ordered = new Set(items.map(cartIdentity));
        writeCart(readCart().filter(function (item) {
          return !ordered.has(cartIdentity(item));
        }));
      }
      renderConfirmation(main, normalizeOrder(response, customer, items, paymentMethod));
    }).catch(function (error) {
      if (errorNode) {
        errorNode.textContent = error.message || "Unable to create the order.";
        errorNode.classList.remove("hidden");
      }
      if (button) {
        button.disabled = false;
        button.textContent = "Place Order";
      }
    });
  }

  function renderConfirmationRow(item, currency) {
    return '' +
      '<div class="confirmationRow">' +
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
        '<div><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.brand || "Product") + ' / Size: ' + escapeHtml(item.size || "ONE SIZE") + ' / Qty: ' + escapeHtml(String(item.quantity || 1)) + '</p><p>' + formatCurrency(money(Number(item.unitPrice || 0) * Math.max(1, Number(item.quantity || 1))), currency) + '</p></div>' +
      '</div>';
  }

  function renderConfirmationTotalRow(label, value, className) {
    return '<div class="confirmationTotalRow' + (className ? ' ' + className : '') + '"><span>' + escapeHtml(label) + '</span><strong>' + escapeHtml(value) + '</strong></div>';
  }

  function renderConfirmation(main, order) {
    main.onclick = null;
    document.title = "Order received | " + (order.orderId || "The Hip Store");
    main.innerHTML = '' +
      '<div id="checkoutPage">' +
        '<div id="basketPageContent"><div class="maxWidth">' +
          '<h1 class="pageTitle">Order received</h1>' +
          '<div class="checkoutPanel">' +
            '<h2>Order number: ' + escapeHtml(order.orderId || "Pending") + '</h2>' +
            '<p class="privacyNotice">' + escapeHtml(order.paymentMessage || "Order received.") + '</p>' +
            '<p class="confirmationPaymentMethod">Payment method: <strong>' + escapeHtml(order.paymentMethod || "Selected at checkout") + '</strong></p>' +
            (order.isDevFallback ? '<p class="checkoutNotice">Development fallback only. Configure Supabase before accepting production orders.</p>' : '') +
            '<div class="confirmationList">' + order.items.map(function (item) { return renderConfirmationRow(item, order.currency); }).join("") + '</div>' +
            '<div class="confirmationTotals">' +
              renderConfirmationTotalRow("Subtotal", formatCurrency(order.subtotal, order.currency), "") +
              renderConfirmationTotalRow("Shipping", formatCurrency(order.shipping, order.currency), "") +
              renderConfirmationTotalRow("Total", formatCurrency(order.total, order.currency), "grand") +
            '</div>' +
            '<div class="confirmationActions"><a class="checkoutPageSecondary" href="' + BASE_PATH + 'shop.html">Continue shopping</a><a class="checkoutPageCta" href="' + BASE_PATH + 'contact.html">Contact Us</a></div>' +
          '</div>' +
        '</div></div>' +
      '</div>';
    window.scrollTo(0, 0);
    revealShell();
  }

  function init() {
    var main = document.querySelector("main");
    if (!main) return;
    ensureCheckoutStyles();

    loadCatalog().then(async function (products) {
      var result = getCheckoutItems(products);
      if (result.mode === "cart") {
        result.items = await hydrateRemoteCart(products);
      }
      if (result.error) {
        renderEmpty(main, result.error);
        return;
      }
      if (!result.items || !result.items.length) {
        renderEmpty(main, "Your basket is empty.");
        return;
      }
      renderCartPage(main, result.items, products, result.mode);
    }).catch(function () {
      renderEmpty(main, "The product catalog could not be loaded.");
    });
  }

  init();
})();
