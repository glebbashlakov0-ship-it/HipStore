(function () {
  var BASE_PATH = "../";
  var CATALOG_DATA_PATH = BASE_PATH + "data/products.normalized.json";
  var SHOP_PAGE_PATH = BASE_PATH + "shop.html";
  var CHECKOUT_PAGE_PATH = BASE_PATH + "checkout/index.html";
  var CART_KEY = "hip_store_cart";
  var SEARCH_HISTORY_KEY = "hip_recent_searches";
  var LOGO_URL = "https://www.thehipstore.co.uk/skins/hipstoregb-mobile/public/img/logos/logo.png";
  var BAG_ICON_URL = "https://www.thehipstore.co.uk/skins/streetwear-mobile/public/img/icons/svg/icon-bag-outline.svg";
  var MENU_ICON_URL = "https://www.thehipstore.co.uk/skins/streetwear-mobile/public/img/icons/svg/icon-menu.svg";
  var ASSET_ORIGIN = "https://www.thehipstore.co.uk";
  var DEFAULT_ASSET_ORIGIN = "https://www.thehipstore.co.uk";
  var LONG_ARROW_ICON_URL = "https://www.thehipstore.co.uk/skins/hipstoregb-mobile/public/img/icons/svg/icon-arrow-long-right.svg";
  var TRENDING_SEARCHES = [
    "adidas Spezial",
    "C.P. Company",
    "Birkenstock",
    "adidas",
    "ASICS",
    "Patta",
    "Carhartt",
    "New Balance",
  ];
  var headerSearchProducts = [];
  var headerSearchState = { query: "" };
  var headerSearchTimer = null;
  var MOBILE_MENU_ITEMS = [
    {
      label: "Latest",
      children: [
        { label: "All Latest", href: "shop.html?sort=newest" },
        { label: "Latest Clothing", href: "shop.html?category=Clothing&sort=newest" },
        { label: "Latest Footwear", href: "shop.html?category=Footwear&sort=newest" },
        { label: "Latest Launches", href: "shop.html?search=Latest Launches" },
        { label: "Seasonal Selects", href: "shop.html?search=Seasonal Selects" },
        { label: "Last Sizes Available", href: "shop.html?search=Last Sizes Available" },
      ],
    },
    {
      label: "Mens",
      children: [
        { label: "All Mens", href: "shop.html?category=Mens" },
        { label: "New In", href: "shop.html?category=Mens&sort=newest" },
        {
          label: "Clothing",
          children: [
            { label: "Mens Jackets", href: "shop.html?search=Mens Jackets&category=Clothing" },
            { label: "Mens Hoodies", href: "shop.html?search=Mens Hoodies&category=Clothing" },
            { label: "Mens T-Shirts", href: "shop.html?search=Mens T-Shirts&category=Clothing" },
            { label: "Mens Jeans", href: "shop.html?search=Mens Jeans&category=Clothing" },
            { label: "Mens Trousers", href: "shop.html?search=Mens Trousers&category=Clothing" },
            { label: "Mens Sweatshirts", href: "shop.html?search=Mens Sweatshirts&category=Clothing" },
            { label: "Mens Shirts", href: "shop.html?search=Mens Shirts&category=Clothing" },
            { label: "Mens Shorts", href: "shop.html?search=Mens Shorts&category=Clothing" },
            { label: "All Mens Clothing", href: "shop.html?search=Mens&category=Clothing" },
          ],
        },
        {
          label: "Footwear",
          children: [
            { label: "Mens Trainers", href: "shop.html?search=Mens Trainers&category=Footwear" },
            { label: "Mens Boots", href: "shop.html?search=Mens Boots&category=Footwear" },
            { label: "Mens Shoes", href: "shop.html?search=Mens Shoes&category=Footwear" },
            { label: "Mens Sandals", href: "shop.html?search=Mens Sandals&category=Footwear" },
            { label: "All Mens Footwear", href: "shop.html?search=Mens&category=Footwear" },
          ],
        },
      ],
    },
    {
      label: "Womens",
      children: [
        { label: "All Womens", href: "shop.html?category=Womens" },
        { label: "New In", href: "shop.html?category=Womens&sort=newest" },
        { label: "Clothing", href: "shop.html?search=Womens Clothing&category=Clothing" },
        {
          label: "Footwear",
          children: [
            { label: "Trainers", href: "shop.html?search=Womens Trainers&category=Footwear" },
            { label: "Boots", href: "shop.html?search=Womens Boots&category=Footwear" },
            { label: "Shoes", href: "shop.html?search=Womens Shoes&category=Footwear" },
            { label: "Sandals", href: "shop.html?search=Womens Sandals&category=Footwear" },
            { label: "All Womens Footwear", href: "shop.html?search=Womens&category=Footwear" },
          ],
        },
      ],
    },
    {
      label: "Accessories",
      children: [
        {
          label: "All Accessories",
          children: [
            { label: "Shop All", href: "shop.html?category=Accessories" },
            { label: "Bags", href: "shop.html?search=Bags&category=Accessories" },
            { label: "Caps", href: "shop.html?search=Caps&category=Accessories" },
            { label: "Hats", href: "shop.html?search=Hats&category=Accessories" },
            { label: "Socks", href: "shop.html?search=Socks&category=Accessories" },
            { label: "Sunglasses", href: "shop.html?search=Sunglasses&category=Accessories" },
          ],
        },
        {
          label: "Living",
          children: [
            { label: "Shop All", href: "shop.html?search=Living&category=Accessories" },
            { label: "Fragrance & Skincare", href: "shop.html?search=Fragrance Skincare&category=Accessories" },
            { label: "Garment & Footwear Care", href: "shop.html?search=Garment Footwear Care&category=Accessories" },
            { label: "Homeware", href: "shop.html?search=Homeware&category=Accessories" },
          ],
        },
      ],
    },
    {
      label: "Brands",
      children: [
        {
          label: "All Brands",
          children: [
            { label: "Shop All", href: "collections.html" },
            { label: "Adidas", href: "shop.html?brand=adidas" },
            { label: "ASICS", href: "shop.html?brand=asics" },
            { label: "C.P. Company", href: "shop.html?brand=c-p-company" },
            { label: "Carhartt WIP", href: "shop.html?brand=carhartt-wip" },
            { label: "Comme Des Garcons HOMME", href: "shop.html?search=Comme Des Garcons HOMME" },
            { label: "Goldwin", href: "shop.html?search=Goldwin" },
            { label: "Martine Rose", href: "shop.html?search=Martine Rose" },
            { label: "Needles", href: "shop.html?search=Needles" },
            { label: "New Balance", href: "shop.html?brand=new-balance" },
            { label: "Paraboot", href: "shop.html?search=Paraboot" },
            { label: "Patta", href: "shop.html?search=Patta" },
            { label: "Power Goods", href: "shop.html?search=Power Goods" },
            { label: "Salomon", href: "shop.html?brand=salomon" },
            { label: "Stone Island", href: "shop.html?brand=stone-island" },
            { label: "Universal Works", href: "shop.html?brand=universal-works" },
            { label: "Visvim", href: "shop.html?search=Visvim" },
            { label: "YMC", href: "shop.html?search=YMC" },
          ],
        },
        {
          label: "Style",
          children: [
            { label: "Formal", href: "shop.html?search=Formal" },
            { label: "Elevated Casual", href: "shop.html?search=Elevated Casual" },
            { label: "Everyday", href: "shop.html?search=Everyday" },
            { label: "Vacation", href: "shop.html?search=Vacation" },
            { label: "Streetwear", href: "shop.html?search=Streetwear" },
            { label: "Classics", href: "shop.html?search=Classics" },
            { label: "Luxury", href: "shop.html?search=Luxury" },
            { label: "Outdoor", href: "shop.html?search=Outdoor" },
            { label: "Approach", href: "shop.html?search=Approach" },
          ],
        },
      ],
    },
    {
      label: "Collections",
      children: [
        {
          label: "adidas",
          children: [
            { label: "adidas SPEZIAL", href: "shop.html?search=adidas Spezial" },
            { label: "adidas Originals Gazelle", href: "shop.html?search=adidas Gazelle" },
            { label: "adidas Originals Handball Spezial", href: "shop.html?search=adidas Handball Spezial" },
            { label: "adidas Originals Japan", href: "shop.html?search=adidas Japan" },
            { label: "adidas Originals Samba", href: "shop.html?search=adidas Samba" },
            { label: "adidas Originals SL 72", href: "shop.html?search=adidas SL 72" },
            { label: "adidas Originals Stan Smith", href: "shop.html?search=adidas Stan Smith" },
            { label: "Adidas Originals x Brain Dead", href: "shop.html?search=adidas Brain Dead" },
            { label: "Adidas Originals x CLOT", href: "shop.html?search=adidas CLOT" },
            { label: "adidas Originals x Wales Bonner", href: "shop.html?search=adidas Wales Bonner" },
          ],
        },
        {
          label: "ASICS",
          children: [
            { label: "ASICS GEL-DS TRAINER 14", href: "shop.html?search=ASICS GEL-DS TRAINER 14" },
            { label: "ASICS GEL-KAYANO", href: "shop.html?search=ASICS GEL-KAYANO" },
            { label: "ASICS GT-2160", href: "shop.html?search=ASICS GT-2160" },
          ],
        },
        {
          label: "Birkenstock",
          children: [
            { label: "Birkenstock Boston", href: "shop.html?search=Birkenstock Boston" },
            { label: "Birkenstock Arizona", href: "shop.html?search=Birkenstock Arizona" },
          ],
        },
        {
          label: "Clarks Originals",
          children: [
            { label: "Clarks Originals Wallabee", href: "shop.html?search=Clarks Wallabee" },
            { label: "Clarks Originals Tor Hill", href: "shop.html?search=Clarks Tor Hill" },
          ],
        },
        {
          label: "New Balance",
          children: [
            { label: "New Balance Made In UK", href: "shop.html?search=New Balance Made In UK" },
            { label: "New Balance Made In USA", href: "shop.html?search=New Balance Made In USA" },
            { label: "New Balance 1500", href: "shop.html?search=New Balance 1500" },
            { label: "New Balance 1906", href: "shop.html?search=New Balance 1906" },
            { label: "New Balance 576", href: "shop.html?search=New Balance 576" },
            { label: "New Balance 740", href: "shop.html?search=New Balance 740" },
            { label: "New Balance 991", href: "shop.html?search=New Balance 991" },
          ],
        },
        {
          label: "Nike",
          children: [
            { label: "Nike ACG", href: "shop.html?search=Nike ACG" },
            { label: "Nike Air Force 1", href: "shop.html?search=Nike Air Force 1" },
            { label: "Nike Air Max TL 2.5", href: "shop.html?search=Nike Air Max TL 2.5" },
            { label: "Nike Air Rift", href: "shop.html?search=Nike Air Rift" },
            { label: "Nike Dunk", href: "shop.html?search=Nike Dunk" },
            { label: "Nike Killshot", href: "shop.html?search=Nike Killshot" },
            { label: "Nike Shox", href: "shop.html?search=Nike Shox" },
          ],
        },
        {
          label: "Paraboot",
          children: [
            { label: "Paraboot Michael", href: "shop.html?search=Paraboot Michael" },
            { label: "Paraboot Montana", href: "shop.html?search=Paraboot Montana" },
          ],
        },
        {
          label: "Puma",
          children: [
            { label: "PUMA Mostro", href: "shop.html?search=PUMA Mostro" },
            { label: "PUMA Speedcat", href: "shop.html?search=PUMA Speedcat" },
            { label: "Puma x Noah", href: "shop.html?search=Puma Noah" },
          ],
        },
        {
          label: "Salomon",
          children: [
            { label: "Salomon RX MOC", href: "shop.html?search=Salomon RX MOC" },
            { label: "Salomon Snowclog", href: "shop.html?search=Salomon Snowclog" },
            { label: "Salomon XT-4", href: "shop.html?search=Salomon XT-4" },
            { label: "Salomon XT-6", href: "shop.html?search=Salomon XT-6" },
            { label: "Salomon XT-WHISPER", href: "shop.html?search=Salomon XT-WHISPER" },
          ],
        },
        {
          label: "The North Face",
          children: [
            { label: "The North Face x UNDERCOVER", href: "shop.html?search=The North Face UNDERCOVER" },
          ],
        },
      ],
    },
    {
      label: "Sale",
      children: [
        { label: "Shop All", href: "shop.html?sale=1" },
        {
          label: "Mens",
          children: [
            { label: "Mens Footwear", href: "shop.html?search=Mens&category=Footwear&sale=1" },
            { label: "Mens Clothing", href: "shop.html?search=Mens&category=Clothing&sale=1" },
            { label: "Mens Accessories", href: "shop.html?search=Mens&category=Accessories&sale=1" },
          ],
        },
        {
          label: "Womens",
          children: [
            { label: "Womens Footwear", href: "shop.html?search=Womens&category=Footwear&sale=1" },
            { label: "Womens Clothing", href: "shop.html?search=Womens&category=Clothing&sale=1" },
            { label: "Womens Accessories", href: "shop.html?search=Womens&category=Accessories&sale=1" },
          ],
        },
        {
          label: "Brands",
          children: [
            { label: "adidas", href: "shop.html?brand=adidas&sale=1" },
            { label: "AURALEE", href: "shop.html?search=AURALEE&sale=1" },
            { label: "Carhartt WIP", href: "shop.html?brand=carhartt-wip&sale=1" },
            { label: "C.P Company", href: "shop.html?brand=c-p-company&sale=1" },
            { label: "Needles", href: "shop.html?search=Needles&sale=1" },
            { label: "New Balance", href: "shop.html?brand=new-balance&sale=1" },
            { label: "Paraboot", href: "shop.html?search=Paraboot&sale=1" },
            { label: "Patagonia", href: "shop.html?search=Patagonia&sale=1" },
            { label: "Stone Island", href: "shop.html?brand=stone-island&sale=1" },
            { label: "Universal Works", href: "shop.html?brand=universal-works&sale=1" },
          ],
        },
      ],
    },
  ];
  var MOBILE_SERVICE_ITEMS = [
    {
      label: "Customer Service",
      children: [
        { label: "FAQs", href: "faq.html" },
        { label: "Contact Us", href: "contact.html" },
        { label: "Delivery", href: "shipping.html" },
        { label: "Returns", href: "shipping.html" },
        { label: "Privacy", href: "privacy.html" },
        { label: "Terms", href: "terms.html" },
      ],
    },
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

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function stripHtml(value) {
    return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function getCategoryParts(value) {
    return String(value || "")
      .split("/")
      .map(function (part) { return part.trim(); })
      .filter(Boolean);
  }

  function normalizeSize(size) {
    if (typeof size === "string") return { label: size, value: size, sku: "", available: true };
    var label = (size && (size.label || size.size || size.name || size.value)) || "";
    return {
      label: String(label),
      value: String((size && (size.value || size.label || size.size || size.name)) || label),
      sku: String((size && (size.sku_variant || size.sku || size.id)) || ""),
      available: !(size && size.available === false),
    };
  }

  function normalizeProduct(item) {
    if (!item) return null;
    var categoryPath = item.categoryPath || item.category_path || item.category || "";
    var categoryParts = getCategoryParts(categoryPath);
    var id = item.id || item.product_id || item.productId || item.sku || item.routeSlug || item.slug || "";
    var sourceSlug = item.sourceSlug || item.source_slug || item.slug || slugify(item.title || id);
    var routeSlug = item.routeSlug || item.route_slug || (sourceSlug && id ? sourceSlug + "-" + id : sourceSlug);
    var images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    var image = item.mainImage || item.main_image || item.image || images[0] || BASE_PATH + "placeholder.svg";
    var oldPrice = item.oldPrice != null ? item.oldPrice : (item.old_price != null ? item.old_price : item.was_price);
    var price = Number(item.price || 0);
    var sizes = (Array.isArray(item.sizes) ? item.sizes : []).map(normalizeSize).filter(function (size) { return size.label; });

    return Object.assign({}, item, {
      id: String(id),
      sourceSlug: String(sourceSlug || ""),
      routeSlug: String(routeSlug || ""),
      title: item.title || item.full_name || "Product",
      brand: item.brand || "Product",
      sku: String(item.sku || item.product_id || item.productId || id || ""),
      productCode: String(item.productCode || item.product_code || item.styleCode || item.style_code || item.sku || id || ""),
      categoryPath: categoryPath || categoryParts.join(" / ") || "Products",
      categoryName: categoryParts[categoryParts.length - 1] || categoryPath || "Products",
      price: price,
      oldPrice: oldPrice != null ? Number(oldPrice) : null,
      currency: item.currency || "GBP",
      image: image,
      images: images.length ? images : [image],
      isSale: Boolean(item.isSale || item.is_sale || (oldPrice && Number(oldPrice) > price)),
      inStock: item.inStock != null ? Boolean(item.inStock) : !(item.in_stock === false || item.status === "out_of_stock"),
      sizes: sizes,
      description: stripHtml(item.description || item.shortDescription || item.short_description || ""),
      shortDescription: stripHtml(item.shortDescription || item.short_description || item.description || ""),
      details: stripHtml(item.details || ""),
      material: stripHtml(item.material || ""),
      colour: stripHtml(item.colour || item.color || ""),
      sourceUrl: item.sourceUrl || item.source_url || item.productUrl || item.product_url || "",
    });
  }

  function normalizeProducts(items) {
    return (Array.isArray(items) ? items : [])
      .map(normalizeProduct)
      .filter(function (item) { return item && item.routeSlug; });
  }

  function findProduct(products) {
    var requestedSlug = getQueryParam("slug");
    var requestedId = getQueryParam("id");
    var requestedSku = getQueryParam("sku");
    var byRoute = new Map();
    var byId = new Map();
    var bySku = new Map();
    var bySource = new Map();

    products.forEach(function (product) {
      if (product.routeSlug) byRoute.set(String(product.routeSlug), product);
      if (product.id) byId.set(String(product.id), product);
      if (product.sku) bySku.set(String(product.sku), product);
      if (product.sourceSlug) {
        var key = String(product.sourceSlug);
        if (!bySource.has(key)) bySource.set(key, []);
        bySource.get(key).push(product);
      }
    });

    if (requestedSlug && byRoute.has(requestedSlug)) return { product: byRoute.get(requestedSlug) };
    if (requestedId && byId.has(requestedId)) return { product: byId.get(requestedId) };
    if (requestedSku && bySku.has(requestedSku)) return { product: bySku.get(requestedSku) };
    if (requestedSlug && byId.has(requestedSlug)) return { product: byId.get(requestedSlug) };
    if (requestedSlug && bySku.has(requestedSlug)) return { product: bySku.get(requestedSlug) };

    if (requestedSlug && bySource.has(requestedSlug)) {
      var sourceMatches = bySource.get(requestedSlug);
      if (sourceMatches.length === 1) return { product: sourceMatches[0] };
      return { error: "This product link is ambiguous. Please open the item from the catalog." };
    }

    return { error: "Product information is missing or no longer available." };
  }

  function amplifyImage(url, size) {
    if (!url) return BASE_PATH + "placeholder.svg";
    var clean = String(url).replace(/^http:/, "https:");
    if (!/i8\.amplience\.net\/i\/jpl\//.test(clean)) return clean;
    var base = clean.split("?")[0];
    return base + "?qlt=92&w=" + size + "&h=" + size + "&bg=rgb%28232%2C230%2C231%29&v=1&fmt=auto";
  }

  function amplifyBackground(url) {
    if (!url) return "";
    var clean = String(url).replace(/^http:/, "https:");
    if (!/i8\.amplience\.net\/i\/jpl\//.test(clean)) return clean;
    return clean.split("?")[0] + "?qlt=92&fmt=auto";
  }

  function getAvailableSizes(product) {
    return (product.sizes || []).filter(function (size) { return size.available !== false; });
  }

  function findSize(product, value) {
    var clean = String(value || "").trim();
    if (!clean) return null;
    return (product.sizes || []).find(function (size) {
      return String(size.label) === clean || String(size.value) === clean || String(size.sku) === clean;
    }) || null;
  }

  function getInitialSize(product) {
    var requested = findSize(product, getQueryParam("size"));
    if (requested && requested.available !== false) return requested.label;
    var sizes = getAvailableSizes(product);
    if (!sizes.length) return "ONE SIZE";
    if (sizes.length === 1 && sizes[0].label.toUpperCase() === "ONE SIZE") return sizes[0].label;
    return "";
  }

  function readCart() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(raw) ? raw.filter(function (item) { return item && item.routeSlug; }) : [];
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
      // Keep local cache usable while offline.
    });
  }

  function writeCart(items, options) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items.slice(0, 30)));
    } catch (_error) {
      // The page still works if localStorage is blocked.
    }
    if (!options || !options.skipRemote) syncRemoteCart(items);
    window.dispatchEvent(new CustomEvent("hip:cart-updated", { detail: { items: Array.isArray(items) ? items : [] } }));
  }

  async function hydrateRemoteCart() {
    var backend = backendCart();
    if (!backend || typeof backend.getCart !== "function") return readCart();
    try {
      var result = await backend.getCart();
      if (result && Array.isArray(result.items)) writeCart(result.items, { skipRemote: true });
    } catch (_error) {
      // Local cart cache remains the fallback.
    }
    return readCart();
  }

  function cartIdentity(item) {
    return String(item.routeSlug || "") + "::" + String(item.size || "");
  }

  function getCartQuantity(items) {
    return items.reduce(function (sum, item) { return sum + Math.max(1, Number(item.quantity || 1)); }, 0);
  }

  function getCartTotal(items) {
    return items.reduce(function (sum, item) {
      return sum + Number(item.price || 0) * Math.max(1, Number(item.quantity || 1));
    }, 0);
  }

  function buildCartItem(product, size, quantity) {
    var sizeRecord = findSize(product, size);
    return {
      routeSlug: product.routeSlug,
      id: product.id,
      sku: product.sku,
      productCode: product.productCode,
      brand: product.brand,
      title: product.title,
      price: product.price,
      oldPrice: product.oldPrice,
      currency: product.currency,
      image: amplifyImage(product.image, 300),
      size: size || "ONE SIZE",
      sizeSku: sizeRecord ? sizeRecord.sku : "",
      quantity: Math.max(1, Number(quantity || 1)),
      sourceUrl: product.sourceUrl || "",
      inStock: product.inStock !== false,
      addedAt: new Date().toISOString(),
    };
  }

  function addCartItem(product, size, quantity) {
    var nextItem = buildCartItem(product, size, quantity);
    var items = readCart();
    var identity = cartIdentity(nextItem);
    var existing = items.find(function (item) { return cartIdentity(item) === identity; });
    if (existing) {
      existing.quantity = Math.min(99, Math.max(1, Number(existing.quantity || 1)) + Math.max(1, Number(quantity || 1)));
      existing.addedAt = new Date().toISOString();
      items = [existing].concat(items.filter(function (item) { return cartIdentity(item) !== identity; }));
    } else {
      items.unshift(nextItem);
    }
    writeCart(items);
    return items;
  }

  function getCheckoutHref(item) {
    var href = CHECKOUT_PAGE_PATH + "?slug=" + encodeURIComponent(item.routeSlug);
    if (item.size) href += "&size=" + encodeURIComponent(item.size);
    href += "&qty=" + encodeURIComponent(String(item.quantity || 1));
    return href;
  }

  function readRecentSearches() {
    try {
      var raw = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
      return Array.isArray(raw)
        ? raw.map(function (item) { return String(item || "").trim(); }).filter(Boolean).slice(0, 8)
        : [];
    } catch (_error) {
      return [];
    }
  }

  function writeRecentSearches(items) {
    try {
      window.localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify((Array.isArray(items) ? items : []).slice(0, 8)));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function pushRecentSearch(query) {
    var clean = String(query || "").trim();
    var next;
    if (!clean) return;
    next = [clean].concat(readRecentSearches().filter(function (item) {
      return item.toLowerCase() !== clean.toLowerCase();
    }));
    writeRecentSearches(next.slice(0, 8));
  }

  function getHeaderSearchResults() {
    var query = headerSearchState.query.trim().toLowerCase();
    if (!query) return [];
    return headerSearchProducts.filter(function (product) {
      return [product.title, product.brand, product.sku, product.routeSlug, product.categoryPath]
        .join(" ")
        .toLowerCase()
        .includes(query);
    }).slice(0, 12);
  }

  function renderHeaderRecentSearches() {
    var recentNode = document.getElementById("recentSearchesContent");
    var listNode = document.getElementById("recentSearchesList");
    var clearNode = document.getElementById("clearRecentSearches");
    var items = readRecentSearches();
    if (!recentNode || !listNode || !clearNode) return;
    listNode.innerHTML = items.map(function (item) {
      return '<li><a href="' + SHOP_PAGE_PATH + '?search=' + encodeURIComponent(item) + '" data-recent-search-link="' + escapeHtml(item) + '">' + escapeHtml(item) + '</a></li>';
    }).join("");
    recentNode.hidden = items.length === 0 || headerSearchState.query.trim().length > 0;
    clearNode.hidden = items.length === 0 || headerSearchState.query.trim().length > 0;
  }

  function renderHeaderTrendingSearches() {
    var trendingNode = document.getElementById("trendingSearches");
    if (!trendingNode) return;
    trendingNode.innerHTML = '<ul><li class="title">Trending Searches</li>' +
      TRENDING_SEARCHES.map(function (item) {
        return '<li><a href="' + SHOP_PAGE_PATH + '?search=' + encodeURIComponent(item) + '" data-trending-search-link="' + escapeHtml(item) + '">' + escapeHtml(item) + '</a></li>';
      }).join("") +
    '</ul>';
    trendingNode.hidden = headerSearchState.query.trim().length > 0;
  }

  function renderHeaderSearchCard(product) {
    return '' +
      '<a href="' + BASE_PATH + 'product/index.html?slug=' + encodeURIComponent(product.routeSlug) + '" class="liveSearchResult" data-search-result-link="' + escapeHtml(product.routeSlug) + '">' +
        '<img src="' + escapeHtml(amplifyImage(product.image, 180)) + '" alt="' + escapeHtml(product.title) + '">' +
        '<span class="liveSearchMeta"><span>' + escapeHtml(product.brand) + '</span><strong>' + escapeHtml(product.title) + '</strong><em>' + formatCurrency(product.price, product.currency) + '</em></span>' +
      '</a>';
  }

  function renderHeaderSearchResults() {
    var resultsNode = document.getElementById("liveSearchResultsContent");
    var results = getHeaderSearchResults();
    if (!resultsNode) return;
    if (!headerSearchState.query.trim()) {
      resultsNode.innerHTML = "";
    } else if (!results.length) {
      resultsNode.innerHTML = '<div class="liveSearchHeading">Products</div><p class="searchEmpty">No matching products were found.</p>';
    } else {
      resultsNode.innerHTML = '<div class="liveSearchHeading">Products</div><ul class="liveSearchList">' +
        results.map(function (product) {
          return '<li>' + renderHeaderSearchCard(product) + '</li>';
        }).join("") +
      '</ul>';
    }
    renderHeaderTrendingSearches();
    renderHeaderRecentSearches();
  }

  function headerSearchIconSvg() {
    return '<svg id="open" xmlns="http://www.w3.org/2000/svg" width="19.996" height="20" viewBox="0 0 19.996 20"><path d="M8.333 0a8.339 8.339 0 0 1 6.355 13.732l5.079 4.956a.759.759 0 0 1 .013 1.073l-.012.012a.794.794 0 0 1-1.11 0l-5.08-4.957A8.336 8.336 0 1 1 8.333 0zm0 1.668A6.67 6.67 0 1 0 15 8.338a6.669 6.669 0 0 0-6.667-6.67z"></path></svg>';
  }

  function headerCloseIconSvg() {
    return '<svg id="close" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M21.724 8.391a1.333 1.333 0 1 1 1.886 1.886L17.886 16l5.723 5.724a1.334 1.334 0 0 1 .141 1.72l-.141.165a1.333 1.333 0 0 1-1.886 0L16 17.886l-5.724 5.723a1.334 1.334 0 0 1-1.72.141l-.165-.141a1.333 1.333 0 0 1 0-1.886L14.114 16l-5.723-5.724a1.334 1.334 0 0 1-.141-1.72l.141-.165a1.333 1.333 0 0 1 1.886 0L16 14.114z" transform="translate(-8 -8)"></path></svg>';
  }

  function headerAccountIconSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="15.5" height="20.5" viewBox="0 0 15.5 20.5"><g><g fill="#fff"><path d="M18.125 20.125H2.875V14.49c0-2.559 1.622-4.875 4.058-5.826C5.94 7.697 5.375 6.374 5.375 5c0-2.826 2.3-5.125 5.125-5.125 2.826 0 5.125 2.3 5.125 5.125 0 1.373-.565 2.697-1.558 3.664 2.436.95 4.058 3.267 4.058 5.827v5.634zM4.008 19.082h12.985V14.49c0-2.37-1.62-4.442-3.944-5.055-.779.45-1.659.689-2.549.689-.89 0-1.77-.238-2.549-.69-2.324.614-3.943 2.686-3.943 5.056v4.59zM10.5.958C8.271.958 6.458 2.771 6.458 5c0 1.334.662 2.583 1.77 3.34.536.365 1.189.595 1.887.662.049.005.097.011.144.018.083.011.162.022.241.022.08 0 .158-.011.24-.022.048-.007.096-.013.145-.018.698-.067 1.35-.297 1.886-.663 1.109-.756 1.77-2.005 1.77-3.339 0-2.229-1.812-4.042-4.041-4.042z" transform="translate(.25 .25) translate(-3)"></path><path d="M10.5 0c-2.75 0-5 2.25-5 5 0 1.47.647 2.793 1.666 3.71C4.74 9.573 3 11.835 3 14.49V20h15v-5.51c0-2.656-1.74-4.918-4.166-5.78C14.854 7.794 15.5 6.47 15.5 5c0-2.75-2.25-5-5-5m0 9.167c-.136 0-.264-.028-.397-.04-.714-.07-1.381-.3-1.945-.684C7.058 7.692 6.333 6.429 6.333 5c0-2.298 1.87-4.167 4.167-4.167 2.297 0 4.167 1.87 4.167 4.167 0 1.43-.725 2.692-1.825 3.443-.564.385-1.231.614-1.945.684-.133.012-.261.04-.397.04m0 .833c.922 0 1.787-.257 2.53-.698 2.347.596 4.088 2.693 4.088 5.189v4.716H3.882V14.49c0-2.496 1.741-4.593 4.088-5.19.743.442 1.608.699 2.53.699m0-10.25c2.895 0 5.25 2.355 5.25 5.25 0 1.344-.529 2.642-1.462 3.619 2.385 1.01 3.962 3.323 3.962 5.872v5.759H2.75v-5.76c0-2.548 1.577-4.86 3.962-5.871C5.78 7.642 5.25 6.344 5.25 5c0-2.895 2.355-5.25 5.25-5.25zm0 9.167c.071 0 .145-.01.224-.021.05-.007.099-.013.15-.018.676-.066 1.308-.288 1.827-.642 1.074-.733 1.716-1.943 1.716-3.236 0-2.16-1.757-3.917-3.917-3.917S6.583 2.84 6.583 5c0 1.293.642 2.503 1.716 3.236.519.354 1.15.576 1.828.642l.15.018c.078.01.152.02.223.02zm0 1.333c-.895 0-1.78-.235-2.566-.68-2.243.615-3.802 2.624-3.802 4.92v4.467h12.736V14.49c0-2.297-1.559-4.306-3.802-4.921-.786.445-1.671.68-2.566.68z" transform="translate(.25 .25) translate(-3)"></path></g></g></svg>';
  }

  function headerBasketIconSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="BASKET" d="M19.655 6.565v12.211H2.344V6.565zm-8.642-5.341A3.457 3.457 0 0 1 14.6 4.616v.726H7.4v-.726a3.472 3.472 0 0 1 3.613-3.392zm4.934 4.118v-.726A4.732 4.732 0 0 0 11.013 0a4.747 4.747 0 0 0-4.961 4.616v.726H2.624A1.463 1.463 0 0 0 1 6.752v11.866A1.379 1.379 0 0 0 2.624 20h16.913C20.668 20 21 19.388 21 18.618V6.752a1.37 1.37 0 0 0-1.463-1.41z" transform="translate(-1)"></path></svg>';
  }

  function headerBackIconSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 200 200"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><path id="WISH" class="cls-1" d="M143.121,100.461l0.039,0.039-0.687.687a25.956,25.956,0,0,1-2.286,2.286L100,143.66,59.813,103.473a26.034,26.034,0,0,1-2.286-2.286L56.84,100.5l0.039-.039A25.985,25.985,0,0,1,96.488,66.827L100,70.34l3.513-3.513A25.985,25.985,0,0,1,143.121,100.461ZM123,66a17.935,17.935,0,0,0-13.366,5.974l-0.13-.131-9.5,9.5-9.5-9.5-0.131.131a17.984,17.984,0,0,0-28.2,22.2L61.84,94.5,100,132.66,138.16,94.5l-0.324-.324A17.987,17.987,0,0,0,123,66Z"></path></svg>';
  }

  function menuHref(href) {
    if (/^https?:\/\//i.test(String(href || ""))) return href;
    return BASE_PATH + String(href || "shop.html");
  }

  function updateCartCount() {
    var count = getCartQuantity(readCart());
    document.querySelectorAll("[data-basket-count]").forEach(function (node) {
      node.textContent = String(count);
      node.hidden = count === 0;
    });
  }

  function renderBasketItem(item) {
    return '' +
      '<article class="basketItem" data-cart-key="' + escapeHtml(cartIdentity(item)) + '">' +
        '<img src="' + escapeHtml(item.image) + '" alt="' + escapeHtml(item.title) + '">' +
        '<div>' +
          '<h3>' + escapeHtml(item.brand || "Product") + '</h3>' +
          '<p>' + escapeHtml(item.title) + '</p>' +
          '<p>Size: ' + escapeHtml(item.size || "ONE SIZE") + (item.sizeSku ? ' / ' + escapeHtml(item.sizeSku) : '') + '</p>' +
          '<strong>' + formatCurrency(item.price, item.currency) + '</strong>' +
          '<div class="basketControls">' +
            '<div class="basketQty" aria-label="Quantity">' +
              '<button type="button" data-cart-decrement aria-label="Decrease quantity">-</button>' +
              '<span>' + escapeHtml(String(item.quantity || 1)) + '</span>' +
              '<button type="button" data-cart-increment aria-label="Increase quantity">+</button>' +
            '</div>' +
            '<button type="button" class="basketRemove" data-cart-remove>Remove</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function renderBasket(main) {
    var items = readCart();
    var itemsNode = main.querySelector("[data-basket-items]");
    var emptyNode = main.querySelector("[data-basket-empty]");
    var totalNode = main.querySelector("[data-basket-total]");
    var checkoutButton = main.querySelector("[data-basket-checkout]");
    if (itemsNode) itemsNode.innerHTML = items.map(renderBasketItem).join("");
    if (emptyNode) emptyNode.hidden = items.length > 0;
    if (totalNode) totalNode.textContent = formatCurrency(getCartTotal(items), items[0] && items[0].currency || "GBP");
    if (checkoutButton) {
      checkoutButton.disabled = items.length === 0;
      checkoutButton.textContent = items.length ? "Checkout Securely" : "Basket is empty";
    }
    updateCartCount();
  }

  function openBasket(main) {
    renderBasket(main);
    var panel = main.querySelector("[data-basket-panel]");
    if (!panel) return;
    panel.hidden = false;
    document.body.classList.add("is-locked");
  }

  function closeBasket(main) {
    var panel = main.querySelector("[data-basket-panel]");
    if (!panel) return;
    panel.hidden = true;
    document.body.classList.remove("is-locked");
  }

  function showToast(main, message) {
    var toast = main.querySelector("[data-product-toast]");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(function () {
      toast.hidden = true;
    }, 2200);
  }

  function shopHref(params) {
    var search = new URLSearchParams();
    Object.keys(params || {}).forEach(function (key) {
      if (params[key]) search.set(key, params[key]);
    });
    var query = search.toString();
    return SHOP_PAGE_PATH + (query ? "?" + query : "");
  }

  function renderMenuFooter() {
    return '' +
      '<div id="navFooterContainer">' +
        '<a class="ga-ip" data-ip-position="header-help" href="' + BASE_PATH + 'faq.html">' +
          'Help' +
          '<img src="' + LONG_ARROW_ICON_URL + '" alt="">' +
        '</a>' +
      '</div>';
  }

  function renderMenuService() {
    return '' +
      '<div id="navServiceContainer">' +
        '<ul class="navServiceMenu">' +
          renderMenuItems(MOBILE_SERVICE_ITEMS, 0) +
        '</ul>' +
      '</div>';
  }

  function renderHeader() {
    var headerWrap = document.querySelector(".headerWrap");
    if (!headerWrap) return;
    headerWrap.innerHTML = '' +
      '<div id="uspAll">' +
        '<div class="maxWidth">' +
          '<section id="uspSlider" aria-label="Store promotions">' +
            '<button class="uspArrow" type="button" data-usp-prev aria-label="Previous promotion">&lsaquo;</button>' +
            '<ul class="uspSlider">' +
              '<li class="is-active"><a href="' + shopHref({ sale: "1" }) + '">SALE UP TO 60% OFF</a></li>' +
              '<li><a href="' + shopHref({ sort: "newest" }) + '">FREE STANDARD DELIVERY ON ALL UK ORDERS OVER &pound;100*</a></li>' +
            '</ul>' +
            '<button class="uspArrow" type="button" data-usp-next aria-label="Next promotion">&rsaquo;</button>' +
          '</section>' +
        '</div>' +
      '</div>' +
      '<header>' +
        '<div id="head" data-e2e="header-wrap" class="">' +
          '<a class="logo " href="' + BASE_PATH + 'index.html"><img class="headerLogo" src="' + LOGO_URL + '" title="The Hip Store" alt="The Hip Store"></a>' +
          '<div id="headLeft"></div>' +
          '<div id="headRight">' +
            '<a class="srch" href="#!" data-search-trigger data-search-toggle data-e2e="header-search-toggle" aria-label="Search">' +
              headerSearchIconSvg() + headerCloseIconSvg() +
            '</a>' +
            '<a class="bskt" href="' + CHECKOUT_PAGE_PATH + '" data-e2e="basket-go-to" title="">' +
              '<div id="cartSummaryOverlay" class="eq1"><img src="' + ASSET_ORIGIN + '/skins/default/public/img/icons/preload-white.gif" alt=""></div>' +
              headerBasketIconSvg() + '<span class="basketCount" data-e2e="basket-count" data-basket-count hidden></span>' +
            '</a>' +
            '<a class="closed" href="#!" data-menu-open data-e2e="header-burgerMenu-open" aria-label="Menu">' +
              '<img class="headerIcon menuIcon" src="' + MENU_ICON_URL + '" alt="Menu">' +
            '</a>' +
          '</div>' +
          '<section id="userMenuContainer"></section>' +
          '<div class="clr"></div>' +
        '</div>' +
        '<div id="search" data-top="0" data-zindex="8" hidden>' +
          '<form id="searchBar" action="' + SHOP_PAGE_PATH + '" data-search-form>' +
            '<span class="inpBg"><div class="srchInputContainer">' +
              '<label>' + headerSearchIconSvg() + '<input type="submit" title="Search" data-e2e="header-search-submit" id="srchButton"></label>' +
              '<input type="text" name="q" placeholder="Search" id="srchInput" data-e2e="header-search-input" data-live-search="1" data-listening="Listening ..." autocomplete="off">' +
              '<span id="clearInput" class="clearInput" data-search-clear aria-label="Clear search"></span>' +
              '<span id="speechInput" style="display: none;"></span>' +
            '</div><a class="srch" href="#!" data-search-close data-e2e="header-search-toggle" aria-label="Close search">' + headerCloseIconSvg() + '</a><span class="liveSearchLoader hidden"></span></span>' +
          '</form>' +
          '<div id="enhancedSearch"><ul><li id="liveSearchResultsContent"></li></ul><div id="trendingSearches"></div><div id="recentSearchesContent" hidden><h2>Recent Searches</h2><ul id="recentSearchesList"></ul></div><div id="clearRecentSearches" hidden>Clear Recent Searches</div></div>' +
        '</div>' +
        '<div id="miniCart"></div><div id="headBot"></div>' +
      '</header>' +
      '<div id="navBackground" data-menu-close hidden></div>' +
      '<div id="nav" data-e2e="header-nav-wrap" class="navSlideClosed" hidden>' +
        '<ul class="menu">' +
          '<div class="top-nav-header">' +
            '<img class="headerLogo" src="' + LOGO_URL + '" title="The Hip Store" alt="The Hip Store">' +
            '<a class="close-nav open" href="#!" data-menu-close style="display: inline-block;" aria-label="Close menu">' + headerCloseIconSvg() + '</a>' +
          '</div>' +
          renderMenuItems(MOBILE_MENU_ITEMS, 0) +
          renderMenuService() +
          renderMenuFooter() +
        '</ul>' +
        '<div id="navLoader"></div>' +
      '</div>';
    wireHeader();
  }

  function renderMenuItems(items, depth) {
    return (Array.isArray(items) ? items : []).map(function (item) {
      var hasChildren = Array.isArray(item.children) && item.children.length > 0;
      var href = item.href ? ' href="' + escapeHtml(menuHref(item.href)) + '"' : "";
      if (!hasChildren) {
        return '<li class="level' + depth + '"><a data-e2e="header-burgerMenu-link" class=""' + href + '>' + escapeHtml(item.label) + '</a></li>';
      }
      return '<li class="level' + depth + ' wChild"><a data-e2e="header-burgerMenu-link" class=" wChild"' + href + '>' + escapeHtml(item.label) + '</a><ul class="acitem" data-e2e="header-nav-submenu-wrap" style="left: -100%; display: none;">' + renderMenuItems(item.children, depth + 1) + '</ul></li>';
    }).join("");
  }

  function wireHeader() {
    var search = document.querySelector("#search");
    var menu = document.querySelector("#nav");
    var menuBackground = document.querySelector("#navBackground");
    var uspItems = Array.prototype.slice.call(document.querySelectorAll(".uspSlider li"));
    var uspIndex = Math.max(0, uspItems.findIndex(function (item) { return item.classList.contains("is-active"); }));

    function setSearch(open) {
      if (!search) return;
      search.hidden = !open;
      document.querySelectorAll("[data-search-trigger]").forEach(function (node) {
        node.classList.toggle("is-open", open);
      });
      if (open) {
        var input = search.querySelector("#srchInput");
        renderHeaderRecentSearches();
        renderHeaderSearchResults();
        if (input) input.focus();
      }
    }

    function collapseMenuBranch(node) {
      if (!node) return;
      node.classList.remove("is-open");
      node.querySelectorAll(".is-open").forEach(function (branch) {
        branch.classList.remove("is-open");
      });
      node.querySelectorAll(".acitem").forEach(function (submenu) {
        submenu.style.display = "none";
        submenu.style.left = "-100%";
      });
    }

    function resetMenuState() {
      if (!menu) return;
      menu.querySelectorAll(".is-open").forEach(function (branch) {
        branch.classList.remove("is-open");
      });
      menu.querySelectorAll(".acitem").forEach(function (submenu) {
        submenu.style.display = "none";
        submenu.style.left = "-100%";
      });
    }

    function setMenu(open) {
      if (!menu || !menuBackground) return;
      if (open) resetMenuState();
      menu.hidden = !open;
      menuBackground.hidden = !open;
      menu.classList.toggle("navSlideOpen", open);
      menu.classList.toggle("navSlideClosed", !open);
      document.body.classList.toggle("is-locked", open);
      if (!open) resetMenuState();
    }

    function setUsp(index) {
      if (!uspItems.length) return;
      uspIndex = (index + uspItems.length) % uspItems.length;
      uspItems.forEach(function (item, itemIndex) {
        item.classList.toggle("is-active", itemIndex === uspIndex);
      });
    }

    document.querySelectorAll("[data-search-toggle]").forEach(function (button) {
      button.addEventListener("click", function () { setSearch(!search || search.hidden); });
    });
    document.querySelectorAll("[data-search-close]").forEach(function (button) {
      button.addEventListener("click", function () { setSearch(false); });
    });
    document.querySelectorAll("[data-search-clear]").forEach(function (button) {
      button.addEventListener("click", function () {
        var input = document.querySelector("#srchInput");
        if (input) input.value = "";
        headerSearchState.query = "";
        renderHeaderSearchResults();
      });
    });
    document.querySelector("#srchInput")?.addEventListener("input", function (event) {
      window.clearTimeout(headerSearchTimer);
      headerSearchTimer = window.setTimeout(function () {
        headerSearchState.query = String(event.target && event.target.value || "");
        renderHeaderSearchResults();
      }, 120);
    });
    document.getElementById("clearRecentSearches")?.addEventListener("click", function () {
      writeRecentSearches([]);
      renderHeaderRecentSearches();
    });
    document.getElementById("enhancedSearch")?.addEventListener("click", function (event) {
      var recentLink = event.target.closest("[data-recent-search-link]");
      if (recentLink) pushRecentSearch(recentLink.getAttribute("data-recent-search-link"));
      var trendingLink = event.target.closest("[data-trending-search-link]");
      if (trendingLink) pushRecentSearch(trendingLink.getAttribute("data-trending-search-link"));
    });
    document.querySelectorAll("[data-menu-open]").forEach(function (button) {
      button.addEventListener("click", function () { setMenu(true); });
    });
    document.querySelectorAll("[data-menu-close]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        setMenu(false);
      });
    });
    menu?.addEventListener("click", function (event) {
      var branchTrigger = event.target.closest("li.wChild > a");
      if (branchTrigger && branchTrigger.nextElementSibling && branchTrigger.nextElementSibling.classList.contains("acitem")) {
        event.preventDefault();
        var branch = branchTrigger.parentElement;
        var submenu = branchTrigger.nextElementSibling;
        var shouldOpen = !branch.classList.contains("is-open");
        Array.prototype.forEach.call(branch.parentElement ? branch.parentElement.children : [], function (sibling) {
          if (sibling !== branch && sibling.classList) collapseMenuBranch(sibling);
        });
        collapseMenuBranch(branch);
        if (shouldOpen) {
          branch.classList.add("is-open");
          submenu.style.display = "block";
          submenu.style.left = "0";
        }
        return;
      }
      if (event.target.closest("#nav a[href]")) setMenu(false);
    });
    document.querySelectorAll("[data-usp-prev]").forEach(function (button) {
      button.addEventListener("click", function () { setUsp(uspIndex - 1); });
    });
    document.querySelectorAll("[data-usp-next]").forEach(function (button) {
      button.addEventListener("click", function () { setUsp(uspIndex + 1); });
    });
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("#srchInput");
        var term = input ? input.value.trim() : "";
        if (term) pushRecentSearch(term);
        window.location.href = shopHref(term ? { search: term } : {});
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      setSearch(false);
      setMenu(false);
    });
    updateCartCount();
  }

  function renderFooter() {
    var footer = document.querySelector("#pdpFooter");
    if (!footer) return;
    footer.id = "hipFooter";
    var footerLinks = [
      [BASE_PATH + "faq.html", "FAQs"],
      [BASE_PATH + "faq.html", "Size Guide"],
      [BASE_PATH + "contact.html", "Contact Us"],
      [BASE_PATH + "terms.html", "Terms & Conditions"],
      [BASE_PATH + "shipping.html", "Delivery Info"],
      [BASE_PATH + "shipping.html", "Returning Items"],
      [BASE_PATH + "privacy.html", "Privacy Policy"],
      [BASE_PATH + "accessibility.html", "Accessibility"],
    ];
    footer.innerHTML = '' +
      '<div id="footerInfoLinks">' +
        '<div class="infoLinks"><div class="footer-content-wrap"><div class="footer-left"><ul>' +
          footerLinks.map(function (link) {
            return '<li><a href="' + escapeHtml(link[0]) + '" class="' + escapeHtml(link[2] || "ga-ip") + '">' + escapeHtml(link[1]) + '</a></li>';
          }).join("") +
        '</ul></div><div class="footer-right"></div></div></div>' +
      '</div>' +
      '<div id="footerCopyright"><span class="copyright" data-e2e="footer-copyright">Copyright &copy; 2026 .</span></div>';
  }

  function renderBreadcrumbs(product) {
    var parts = getCategoryParts(product.categoryPath);
    var crumbs = [{ label: "Home", href: BASE_PATH + "index.html" }];
    parts.forEach(function (part) {
      crumbs.push({ label: part, href: shopHref({ category: part }) });
    });
    crumbs.push({ label: product.title, href: "index.html?slug=" + encodeURIComponent(product.routeSlug), active: true });

    return '<div id="breads" class="defaultBreadcrumbs"><div class="maxWidth">' +
      crumbs.map(function (crumb, index) {
        return '<span class="' + (crumb.active ? "active" : "no") + '">' +
          '<a href="' + escapeHtml(crumb.href) + '"><span>' + escapeHtml(crumb.label) + '</span>' + (crumb.active ? "" : "<i></i>") + '</a>' +
          '<meta content="' + (index + 1) + '">' +
        '</span>';
      }).join("") +
      '</div></div>';
  }

  function renderPrice(product) {
    var oldPrice = product.oldPrice && product.oldPrice > product.price
      ? '<span class="was"><span data-oi-price="">' + formatCurrency(product.oldPrice, product.currency) + '</span></span>'
      : "";
    return '<div class="itemPrices">' +
      '<span class="pri"><span class="now" data-e2e="product-price" content="' + escapeHtml(formatCurrency(product.price, product.currency)) + '"><span data-oi-price="">' + formatCurrency(product.price, product.currency) + '</span></span></span>' +
      oldPrice +
      '</div>';
  }

  function renderGallery(product) {
    var images = product.images.slice(0, 8);
    var arrows = images.length > 1
      ? '<button type="button" class="galleryArrow galleryArrowPrev" data-gallery-prev aria-label="Previous image"></button>' +
        '<button type="button" class="galleryArrow galleryArrowNext" data-gallery-next aria-label="Next image"></button>'
      : "";
    return '<div id="itemGallery" class="hasImages"><div id="gallery">' +
      '<ul id="owl-pdp-gallery" class="owl-carousel owl-theme owl-loaded owl-drag" data-gallery-track>' +
        images.map(function (image, index) {
          var src = amplifyImage(image, 600);
          var src2 = amplifyImage(image, 900);
          var src3 = amplifyImage(image, 1200);
          return '<li class="double-tap-zoom ratio' + (index === 0 ? " is-active" : "") + '" data-index="' + (index + 1) + '" data-total="' + images.length + '">' +
            '<picture><source srcset="' + escapeHtml(src) + ' 1x, ' + escapeHtml(src2) + ' 2x, ' + escapeHtml(src3) + ' 3x" type="image/webp">' +
            '<img class="imgMed imageLazy" title="' + escapeHtml(product.title) + '" alt="' + escapeHtml(product.title) + '" src="' + escapeHtml(src) + '" loading="' + (index < 2 ? "eager" : "lazy") + '"></picture>' +
          '</li>';
        }).join("") +
      '</ul>' +
      arrows +
      '<div class="owl-dots" data-gallery-dots>' +
        images.map(function (_image, index) {
          return '<button type="button" class="' + (index === 0 ? "active" : "") + '" data-gallery-dot="' + index + '" aria-label="View image ' + (index + 1) + '"' + (index === 0 ? ' aria-current="true"' : "") + '></button>';
        }).join("") +
      '</div>' +
      '</div></div>';
  }

  function renderSizeOptions(product, selectedSize) {
    var sizes = product.sizes || [];
    if (!sizes.length) {
      return '<button data-e2e="pdp-productDetails-size" type="button" class="btn btn-default selected" data-product-size="ONE SIZE" data-price="' + escapeHtml(formatCurrency(product.price, product.currency)) + '" data-sku="' + escapeHtml(product.sku) + '" data-stock="1" title="Select Size ONE SIZE">ONE SIZE</button>';
    }
    return sizes.map(function (size) {
      var active = selectedSize && size.label === selectedSize;
      return '<button data-e2e="pdp-productDetails-size" type="button" class="btn btn-default' + (active ? " selected" : "") + (size.available ? "" : " disabled") + '" data-product-size="' + escapeHtml(size.label) + '" data-price="' + escapeHtml(formatCurrency(product.price, product.currency)) + '" data-sku="' + escapeHtml(size.sku) + '" data-stock="' + (size.available ? "1" : "0") + '" title="Select Size ' + escapeHtml(size.label) + '"' + (size.available ? "" : " disabled") + '>' +
        escapeHtml(size.label) +
        '<span class="fulfilment-notice-html hide"><div class="fulfilment-message"><div class="supplier-message"></div></div></span>' +
      '</button>';
    }).join("");
  }

  function renderDetails(product) {
    var detailsText = product.details || product.description || product.title;
    var description = product.description || product.shortDescription || product.title;
    var material = product.material ? '<h3>Care &amp; Material</h3>' + escapeHtml(product.material) : "";
    var colour = product.colour ? '<h3>Colour:</h3>' + escapeHtml(product.colour.charAt(0).toUpperCase() + product.colour.slice(1)) : "";
    var bannerImages = product.images.slice(2, 5);
    if (!bannerImages.length) bannerImages = product.images.slice(0, 3);

    return '<div id="detailsBackground">' +
      '<div id="banner-section">' +
        '<span id="banner-section-header"><div>Free Shipping</div><div>Free Returns</div></span>' +
        '<div id="banner-container">' +
          bannerImages.map(function (image) {
            return '<div style="background-image:url(\'' + escapeHtml(amplifyBackground(image)) + '\')"></div>';
          }).join("") +
        '</div>' +
      '</div>' +
      '<ul id="itemInfo" class="menu no-scroll">' +
        '<h1>Description<hr></h1>' +
        '<p data-readmore="false" id="editor-notes"><text>' + escapeHtml(description) + '</text><text id="more"></text><strong id="expand-toggle">Read more</strong></p>' +
        renderAccordion("Details &amp; Care", material + (material && colour ? "<br><br>" : "") + colour + '<span class="product-code">Product Code: ' + escapeHtml(product.productCode || product.sku || product.id) + '</span>', true) +
        renderAccordion("Reviews", '<div id="pr-reviewdisplay" data-e2e="power-reviews-wrapper"></div><p>No reviews yet.</p>', false, '<div class="review-tab-title"><div class="tab-title">Reviews</div><div id="pr-reviewsnippet" data-e2e="power-reviews-wrapper"></div></div>') +
        renderAccordion("Delivery", 'Standard Delivery<br>&pound;5.99 or FREE on orders over &pound;100.<br>Delivered within 3 working days.<br>Excludes Bank Holidays.<br><br>Express Delivery<br>&pound;6.99<br>Order by Midnight to get it delivered within 2 days.<br><br>Next Day Delivery<br>&pound;7.99<br>Order before 8pm to receive the following day.<br><br>International Standard from &pound;7.99.', false) +
        renderAccordion("Returns", 'UK Returns<br><br>You can return your items at any time via EVRi for FREE or via Royal Mail from &pound;2.<br><br>Please allow up to 14 days for your return to be processed once we receive it back in our warehouse. Once refunded, funds usually appear on the original payment method within 3-5 days.<br><br>International Returns:<br><br>Customers are responsible for return postage, and items remain your responsibility until received by us.', false) +
      '</ul>' +
      renderRelatedCategories(product) +
      '</div>';
  }

  function renderAccordion(title, html, open, customTitleHtml) {
    return '<li id="tab-info" class="' + (open ? "is-open" : "") + '" data-accordion>' +
      '<a href="#!" data-accordion-toggle>' + (customTitleHtml || title) + '<i class="fa fa-plus"></i><i class="fa fa-minus"></i></a>' +
      '<ul class="acitem"' + (open ? "" : ' style="display: none;"') + '><li>' + html + '</li></ul>' +
    '</li>';
  }

  function renderRelatedCategories(product) {
    var parts = getCategoryParts(product.categoryPath);
    var brandHref = shopHref({ brand: slugify(product.brand) });
    var rows = [
      '<li><a href="' + shopHref({ category: parts[0] || "Mens" }) + '" class="cta product add">' + escapeHtml((parts[0] || "mens").toLowerCase()) + '</a> <i class="fa fa-caret-right" aria-hidden="true"></i> <a class="brand-link" href="' + brandHref + '">' + escapeHtml(product.brand) + '</a></li>',
    ];
    if (parts.length > 1) {
      rows.push('<li>' + parts.map(function (part) {
        return '<a href="' + shopHref({ category: part }) + '" class="cta product add">' + escapeHtml(part.toLowerCase()) + '</a>';
      }).join(' <i class="fa fa-caret-right" aria-hidden="true"></i> ') + '</li>');
    }
    return '<div id="relatedItems"><div id="itemRelatedCats"><h3>Related Categories</h3><ul>' + rows.join("") + '</ul></div></div>';
  }

  function renderBasketPanel() {
    return '' +
      '<aside id="basketPanel" data-basket-panel hidden aria-label="Shopping basket">' +
        '<div class="basketScrim" data-basket-close></div>' +
        '<section class="basketSheet" role="dialog" aria-modal="true" aria-labelledby="basket-title">' +
          '<div class="basketHead"><h2 id="basket-title">Your Bag</h2><button type="button" data-basket-close aria-label="Close basket">&times;</button></div>' +
          '<div class="basketBody"><div class="basketEmpty" data-basket-empty><p>Your bag is empty.</p></div><div data-basket-items></div></div>' +
          '<div class="basketFoot"><div class="basketTotal"><span>Total</span><strong data-basket-total>&pound;0</strong></div><button type="button" class="btn btn-level1" data-basket-checkout>Checkout Securely</button></div>' +
        '</section>' +
      '</aside>';
  }

  function renderSizeGuidePanel() {
    return '' +
      '<div id="poplbgGuide" data-size-guide-panel hidden>' +
        '<div id="optGui" class="pop popBox" data-e2e="plp-productDetails-sizeGuideBox">' +
          '<h3 class="popTitle">Find the perfect size</h3>' +
          '<button type="button" class="popOpen btn btn-default" title="Close" data-size-guide-close aria-label="Close"></button>' +
          '<div id="sizeGuideData" class="popContent">' +
            '<p>Use the UK sizes shown on this product. The available buttons are loaded from the parsed catalog for this exact item.</p>' +
            '<table><tr><th>Footwear</th><td>UK sizes</td></tr><tr><th>Clothing</th><td>Brand label sizes</td></tr><tr><th>Accessories</th><td>ONE SIZE where supplied</td></tr></table>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderProduct(main, product) {
    var selectedSize = getInitialSize(product);
    var categoryParts = getCategoryParts(product.categoryPath);

    document.title = product.title + " | The Hip Store";
    main.innerHTML = '' +
      '<div id="item" class="productPage" data-fulfilment="default" data-sku="' + escapeHtml(product.sku || product.id) + '">' +
        '<div id="productPage"><div class="maxWidth"><div class="productRight"><div id="splitRightContainer"><div class="itemDetails">' +
          renderBreadcrumbs(product) +
          '<div class="pdpHero">' +
            '<div class="pdpHeroGallery">' +
              renderGallery(product) +
              '<div id="productShareWish"><button type="button" class="wishlistAdd"><span>Save for later</span></button><div id="itemWish">Saved to wishlist</div></div>' +
            '</div>' +
            '<div class="pdpHeroInfo">' +
              '<div id="itemOptions">' +
                '<div id="productItemTitles" class="onlyTablet" data-e2e="product-name">' +
                  '<a href="' + shopHref({ brand: slugify(product.brand) }) + '"><h1>' + escapeHtml(product.brand) + '</h1></a>' +
                  '<h2>' + escapeHtml(product.title) + '</h2>' +
                  renderPrice(product) +
                  '<div id="pr-reviewsnippet"></div>' +
                  '<button type="button" class="btn btn-default guide" title="View size guide" data-e2e="pdp-productDetails-sizeGuideBtn" data-size-guide-open>Size Guide</button>' +
                '</div>' +
                '<h3>Select UK Size</h3>' +
                '<div id="sizeOptions" class="sizeOptions"><div id="productSizeStock" class="options">' + renderSizeOptions(product, selectedSize) + '</div><div class="fulfilment-notice-wrapper hide"></div></div>' +
                '<p class="sizeError" data-size-error>Please select a size.</p>' +
              '</div>' +
              '<div class="itemConfigAdd">' +
                '<input id="quantity" data-e2e="product-quantity" type="hidden" value="1" maxlength="1" min="1" title="Enter quantity">' +
                '<button id="addToBasket" href="#" class="btn btn-level1" title="Add To Basket" data-e2e="pdp-productDetails-addToBasketBtn" data-add-to-basket' + (product.inStock ? "" : " disabled") + '>Add To Basket</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
          renderDetails(product) +
          '<div class="hiddenInputsWrap"><input type="hidden" name="mainImageURL" value="' + escapeHtml(amplifyImage(product.image, 592)) + '"><input type="hidden" name="productSku" value="' + escapeHtml(product.sku || product.id) + '"></div>' +
        '</div></div></div></div></div></div>' +
      '</div>' +
      renderSizeGuidePanel() +
      renderBasketPanel() +
      '<div class="pdpToast" data-product-toast hidden></div>';

    wireProductPage(main, product, selectedSize, categoryParts);
  }

  function wireProductPage(main, product, initialSize) {
    var state = { selectedSize: initialSize || "", galleryIndex: 0 };
    var sizeError = main.querySelector("[data-size-error]");
    var galleryTrack = main.querySelector("[data-gallery-track]");
    var gallerySlides = Array.prototype.slice.call(main.querySelectorAll("#owl-pdp-gallery .double-tap-zoom"));
    var galleryDots = Array.prototype.slice.call(main.querySelectorAll("[data-gallery-dot]"));
    var galleryPrev = main.querySelector("[data-gallery-prev]");
    var galleryNext = main.querySelector("[data-gallery-next]");
    var addButton = main.querySelector("[data-add-to-basket]");

    function setAddedState(active) {
      if (addButton) {
        addButton.classList.toggle("is-added", Boolean(active));
        addButton.textContent = active ? "Added to Basket" : "Add To Basket";
      }
    }

    function setSize(value) {
      state.selectedSize = String(value || "").trim();
      main.querySelectorAll("[data-product-size]").forEach(function (button) {
        var active = button.getAttribute("data-product-size") === state.selectedSize;
        button.classList.toggle("selected", active);
        button.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (sizeError) sizeError.classList.remove("is-visible");
      setAddedState(false);
    }

    function requireSize() {
      var needsSize = getAvailableSizes(product).length > 0;
      if (needsSize && !state.selectedSize) {
        if (sizeError) sizeError.classList.add("is-visible");
        return false;
      }
      return true;
    }

    function currentCartItem(quantity) {
      return buildCartItem(product, state.selectedSize || "ONE SIZE", quantity || 1);
    }

    function setGallery(index) {
      if (!galleryTrack || !gallerySlides.length) return;
      state.galleryIndex = Math.max(0, Math.min(gallerySlides.length - 1, Number(index || 0)));
      galleryTrack.style.transform = "translate3d(" + (-state.galleryIndex * 100) + "%, 0, 0)";
      gallerySlides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === state.galleryIndex);
      });
      galleryDots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === state.galleryIndex);
        if (dotIndex === state.galleryIndex) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
      });
    }

    function moveGallery(step) {
      if (!gallerySlides.length) return;
      setGallery((state.galleryIndex + step + gallerySlides.length) % gallerySlides.length);
    }

    main.querySelectorAll("[data-product-size]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (button.disabled) return;
        setSize(button.getAttribute("data-product-size"));
      });
    });

    galleryDots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setGallery(Number(dot.getAttribute("data-gallery-dot") || 0));
      });
    });

    if (galleryPrev) {
      galleryPrev.addEventListener("click", function () {
        moveGallery(-1);
      });
    }

    if (galleryNext) {
      galleryNext.addEventListener("click", function () {
        moveGallery(1);
      });
    }

    main.querySelector("#owl-pdp-gallery")?.addEventListener("click", function () {
      moveGallery(1);
    });

    addButton?.addEventListener("click", function () {
      if (!requireSize()) return;
      addCartItem(product, state.selectedSize || "ONE SIZE", 1);
      renderBasket(main);
      setAddedState(true);
    });

    main.querySelectorAll("[data-basket-close]").forEach(function (button) {
      button.addEventListener("click", function () { closeBasket(main); });
    });

    main.querySelector("[data-basket-checkout]")?.addEventListener("click", function () {
      var items = readCart();
      if (!items.length) return;
      window.location.href = getCheckoutHref(items[0]);
    });

    main.addEventListener("click", function (event) {
      var increment = event.target.closest("[data-cart-increment]");
      var decrement = event.target.closest("[data-cart-decrement]");
      var remove = event.target.closest("[data-cart-remove]");
      var accordionToggle = event.target.closest("[data-accordion-toggle]");
      if (accordionToggle) {
        event.preventDefault();
        var row = accordionToggle.closest("[data-accordion]");
        var content = row && row.querySelector(".acitem");
        if (row && content) {
          var nextOpen = !row.classList.contains("is-open");
          row.classList.toggle("is-open", nextOpen);
          content.style.display = nextOpen ? "" : "none";
        }
        return;
      }
      if (!increment && !decrement && !remove) return;
      var cartRow = event.target.closest("[data-cart-key]");
      if (!cartRow) return;
      var key = cartRow.getAttribute("data-cart-key");
      var items = readCart();
      if (remove) {
        writeCart(items.filter(function (item) { return cartIdentity(item) !== key; }));
        renderBasket(main);
        return;
      }
      items.forEach(function (item) {
        if (cartIdentity(item) !== key) return;
        item.quantity = Math.max(1, Math.min(99, Number(item.quantity || 1) + (increment ? 1 : -1)));
      });
      writeCart(items);
      renderBasket(main);
    });

    main.querySelector("[data-size-guide-open]")?.addEventListener("click", function () {
      var panel = main.querySelector("[data-size-guide-panel]");
      if (!panel) return;
      panel.hidden = false;
      document.body.classList.add("is-locked");
    });

    main.querySelectorAll("[data-size-guide-close]").forEach(function (button) {
      button.addEventListener("click", function () {
        var panel = main.querySelector("[data-size-guide-panel]");
        if (panel) panel.hidden = true;
        document.body.classList.remove("is-locked");
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      closeBasket(main);
      var sizeGuide = main.querySelector("[data-size-guide-panel]");
      if (sizeGuide) sizeGuide.hidden = true;
      var nav = document.querySelector("#nav");
      var navBg = document.querySelector("#navBackground");
      if (nav) nav.hidden = true;
      if (navBg) navBg.hidden = true;
      document.body.classList.remove("is-locked");
    });

    setSize(state.selectedSize);
    setGallery(0);
    renderBasket(main);
  }

  function renderError(main, message) {
    document.title = "Product not found | The Hip Store";
    main.innerHTML = '' +
      '<section class="pdpError">' +
        '<h1>Product not found</h1>' +
        '<p>' + escapeHtml(message || "Please return to the catalog and open the product again.") + '</p>' +
        '<a class="btn btn-level1" href="' + SHOP_PAGE_PATH + '">Back to Shop All</a>' +
      '</section>';
  }

  var NEWSLETTER_PATTERNS = [
    /sign\s+up\s+to\s+our\s+newsletter/i,
    /join\s+our\s+mailing\s+list/i,
    /10%\s*off\s+your\s+first\s+order/i,
    /sign\s+up\s+for\s+the\s+latest\s+updates/i,
  ];

  function hasNewsletterCopy(node) {
    var text = String(node && (node.innerText || node.textContent) || "").replace(/\s+/g, " ").trim();
    return text && NEWSLETTER_PATTERNS.some(function (pattern) { return pattern.test(text); });
  }

  function removeNewsletterNode(node) {
    if (!node || !node.parentElement) return;
    var target = node.closest("#signup,.newsletterSignup,.newsletter-signup,.footerNewsletter,[data-newsletter-form],section,form") || node;
    if (target && target !== document.body && target !== document.documentElement) target.remove();
  }

  var newsletterCleanupObserver = null;
  var newsletterCleanupQueued = false;

  function removeNewsletterBlocks() {
    document.querySelectorAll("#signup,#newsletterSignupForm,[data-newsletter-form],.newsletterSignup,.newsletter-signup,.footerNewsletter,#footerNewsletter").forEach(removeNewsletterNode);
    document.querySelectorAll("section,form,footer div,main div,body > div").forEach(function (node) {
      if (hasNewsletterCopy(node)) removeNewsletterNode(node);
    });
  }

  function ensureNewsletterCleanup() {
    removeNewsletterBlocks();
    if (newsletterCleanupObserver || !document.body) return;
    newsletterCleanupObserver = new MutationObserver(function () {
      if (newsletterCleanupQueued) return;
      newsletterCleanupQueued = true;
      window.requestAnimationFrame(function () {
        newsletterCleanupQueued = false;
        removeNewsletterBlocks();
      });
    });
    newsletterCleanupObserver.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    var main = document.querySelector("main");
    if (!main) return;
    ensureNewsletterCleanup();
    renderHeader();
    renderFooter();
    removeNewsletterBlocks();
    loadCatalog()
      .then(async function (rawProducts) {
        var products = normalizeProducts(rawProducts);
        headerSearchProducts = products;
        var match = findProduct(products);
        if (!match.product) {
          renderError(main, match.error);
          return;
        }
        await hydrateRemoteCart();
        renderProduct(main, match.product);
      })
      .catch(function (error) {
        console.error("Product render failed:", error);
        renderError(main, "Product data could not be loaded. Please refresh the page.");
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
