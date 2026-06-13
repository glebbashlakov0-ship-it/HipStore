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
                  renderExpressPayments() +
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

  function renderCheckoutField(field, id, label, required, autocomplete) {
    return '' +
      '<div class="hipCheckoutField">' +
        '<label for="' + id + '">' + (required ? '<span>*</span>' : '') + escapeHtml(label) + '</label>' +
        '<div class="hipCheckoutInputWrap">' +
          '<input id="' + id + '" name="' + escapeHtml(field) + '" autocomplete="' + escapeHtml(autocomplete || "off") + '" data-testid="validatedInput" data-customer-field="' + escapeHtml(field) + '" value="">' +
        '</div>' +
      '</div>';
  }

  function renderCheckoutPhoneField() {
    return '' +
      '<div class="hipCheckoutField hipCheckoutPhoneField">' +
        '<label for="phone-id"><span>*</span>Contact Number</label>' +
        '<p>8 - 14 characters and should only contain numbers or a + symbol</p>' +
        '<div class="hipCheckoutInputWrap hipPhoneInput">' +
          '<span class="hipPhoneFlag" aria-hidden="true"></span>' +
          '<input id="phone-id" name="phone" type="tel" autocomplete="tel" data-testid="validatedInput" data-customer-field="phone" value="+44">' +
        '</div>' +
      '</div>';
  }

  function renderCheckoutCountryField() {
    return '' +
      '<div class="hipCheckoutField hipCheckoutCountryField">' +
        '<label for="country-id">Country</label>' +
        '<button class="hipCheckoutSelect" aria-label="Open Drop" type="button">' +
          '<input id="country-id" autocomplete="off" data-testid="countrySelect" tabindex="-1" type="text" readonly data-customer-field="country" value="United Kingdom">' +
          '<svg aria-label="FormDown" viewBox="0 0 24 24" aria-hidden="true"><polyline fill="none" stroke="#000" stroke-width="2" points="18 9 12 15 6 9"></polyline></svg>' +
        '</button>' +
      '</div>';
  }

  function renderCheckoutRadio(value, label, checked) {
    return '' +
      '<label class="hipCheckoutRadio">' +
        '<input type="radio" name="deliveryOption" value="' + escapeHtml(value) + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="hipRadioBox" aria-hidden="true"></span>' +
        '<span>' + escapeHtml(label) + '</span>' +
      '</label>';
  }

  function renderCheckoutForm(main, items, products, sourceMode) {
    var subtotal = getSubtotal(items);
    var total = getTotal(items);
    var discountSavings = getCheckoutDiscountSavings(items);
    var currency = items[0] && items[0].currency || "GBP";
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
              renderCheckoutCard("Delivery Options", "", '' +
                '<div class="hipCheckoutDeliveryOptions">' +
                  renderCheckoutRadio("home", "Home Delivery", true) +
                  renderCheckoutRadio("clickAndCollect", "Click & Collect", false) +
                '</div>', "") +
              '<form data-checkout-form>' +
                '<input type="hidden" data-customer-field="email" value="guest@thehipstore.local">' +
                renderCheckoutCard("Contact Details", "", '' +
                  '<p data-form-error class="checkoutNotice hidden"></p>' +
                  '<div class="hipCheckoutFields">' +
                    renderCheckoutField("firstName", "firstName-id", "First Name", true, "given-name") +
                    renderCheckoutField("lastName", "lastName-id", "Last Name", true, "family-name") +
                    renderCheckoutPhoneField() +
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
                    renderCheckoutCountryField() +
                    renderCheckoutField("address", "address1-id", "Address line 1", true, "address-line1") +
                    renderCheckoutField("address2", "address2-id", "Address line 2 (optional)", false, "address-line2") +
                    renderCheckoutField("city", "town-id", "Town/City", true, "address-level2") +
                    renderCheckoutField("county", "county-id", "County (optional)", false, "address-level1") +
                    renderCheckoutField("postcode", "postcode-id", "Postcode", true, "postal-code") +
                    '<div class="hipCheckoutAddressFinder"><button data-testid="addressFinderBtn" type="button">Find a Different Address</button></div>' +
                  '</div>', "") +
                '<div class="hipCheckoutSubmitRow"><button type="submit" class="hipCheckoutSubmit" data-place-order>Save and Continue</button></div>' +
              '</form>' +
            '</section>' +
          '</div>' +
        '</div></div>' +
      '</div>';
    window.scrollTo(0, 0);

    main.querySelector("[data-back-to-basket]")?.addEventListener("click", function (event) {
      event.preventDefault();
      var nextItems = sourceMode === "single" ? items : getCartItems(products);
      renderCartPage(main, nextItems, products, sourceMode);
    });

    main.querySelector("[data-checkout-form]")?.addEventListener("submit", function (event) {
      event.preventDefault();
      submitOrder(main, items, products, sourceMode);
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
    var required = ["email", "firstName", "lastName", "phone", "address", "city", "postcode", "country"];
    return required.every(function (key) { return customer[key]; }) && /.+@.+\..+/.test(customer.email || "");
  }

  function normalizeOrder(response, customer, items) {
    var order = response && response.order ? response.order : {};
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
      paymentMessage: response.message || "Order received. Payment is not configured yet.",
      paymentStatus: response.payment_status || order.payment_status || "payment_not_configured",
      paymentMethod: response.payment_method || order.payment_method || "manual_payment",
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

  function submitOrder(main, items, products, sourceMode) {
    var customer = collectCustomer(main);
    var errorNode = main.querySelector("[data-form-error]");
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
        city: customer.city,
        postcode: customer.postcode,
        country: customer.country,
      },
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
      renderConfirmation(main, normalizeOrder(response, customer, items));
    }).catch(function (error) {
      if (errorNode) {
        errorNode.textContent = error.message || "Unable to create the order.";
        errorNode.classList.remove("hidden");
      }
      if (button) {
        button.disabled = false;
        button.textContent = "Save and Continue";
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
            (order.isDevFallback ? '<p class="checkoutNotice">Development fallback only. Configure Supabase before accepting production orders.</p>' : '') +
            '<div class="confirmationList">' + order.items.map(function (item) { return renderConfirmationRow(item, order.currency); }).join("") + '</div>' +
            '<div class="totals-wrapper">' +
              '<div class="subtotalGrand">Subtotal<strong>' + formatCurrency(order.subtotal, order.currency) + '</strong></div>' +
              '<div class="totalGrand">Shipping<strong>' + formatCurrency(order.shipping, order.currency) + '</strong></div>' +
              '<div class="totalGrand">Total<strong>' + formatCurrency(order.total, order.currency) + '</strong></div>' +
            '</div>' +
            '<div class="confirmationActions"><a class="checkoutPageSecondary" href="' + BASE_PATH + 'shop.html">Continue shopping</a><a class="checkoutPageCta" href="' + BASE_PATH + 'account.html?tab=orders">View account orders</a></div>' +
          '</div>' +
        '</div></div>' +
      '</div>';
    window.scrollTo(0, 0);
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
