(function () {
  var CATALOG_DATA_PATH = "data/products.normalized.json";
  var PRODUCT_PAGE_PATH = "product/index.html";
  var PLACEHOLDER_IMAGE = "placeholder.svg";
  var DEFAULT_PER_PAGE = 24;

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

  function titleFromSlug(value) {
    return String(value || "")
      .split("-")
      .filter(Boolean)
      .map(function (part) {
        if (/^(uk|usa|acg|xt|sl|gt)$/i.test(part)) return part.toUpperCase();
        return part.charAt(0).toUpperCase() + part.slice(1);
      })
      .join(" ");
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

  function formatCurrency(value, currency) {
    var amount = Number(value || 0);
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency || "GBP",
        minimumFractionDigits: amount % 1 ? 2 : 0,
        maximumFractionDigits: amount % 1 ? 2 : 0,
      }).format(amount);
    } catch (_error) {
      return (currency || "GBP") + " " + amount.toLocaleString("en-US");
    }
  }

  function getCategoryParts(value) {
    return String(value || "")
      .split("/")
      .map(function (part) { return part.trim(); })
      .filter(Boolean);
  }

  function normalizeSize(size) {
    if (typeof size === "string") return { label: size, value: size, available: true };
    return {
      label: (size && (size.label || size.size || size.name || size.value)) || "",
      value: (size && (size.value || size.label || size.size || size.name)) || "",
      available: !(size && size.available === false),
    };
  }

  function normalizeProduct(item, index) {
    if (!item) return null;
    var categoryPath = item.categoryPath || item.category_path || item.category || "";
    var categoryParts = getCategoryParts(categoryPath);
    var id = item.id || item.product_id || item.sku || item.routeSlug || item.slug || String(index + 1);
    var sourceSlug = item.sourceSlug || item.slug || slugify(item.title || id);
    var routeSlug = item.routeSlug || (sourceSlug && id ? sourceSlug + "-" + id : sourceSlug);
    var images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    var image = item.mainImage || item.main_image || item.image || images[0] || PLACEHOLDER_IMAGE;
    var oldPrice = item.oldPrice != null ? item.oldPrice : (item.old_price != null ? item.old_price : item.was_price);
    var sizes = (Array.isArray(item.sizes) ? item.sizes : []).map(normalizeSize).filter(function (size) { return size.label; });

    return Object.assign({}, item, {
      _index: index,
      id: id,
      sourceSlug: sourceSlug,
      routeSlug: routeSlug,
      title: item.title || item.full_name || "Untitled Product",
      brand: item.brand || "",
      sku: item.sku || item.product_id || "",
      productCode: item.productCode || item.product_code || "",
      categoryPath: categoryPath || categoryParts.join(" / ") || "Products",
      categoryName: categoryParts[categoryParts.length - 1] || categoryPath || "Products",
      price: Number(item.price || 0),
      oldPrice: oldPrice != null ? Number(oldPrice) : null,
      currency: item.currency || "GBP",
      image: image,
      images: images.length ? images : [image],
      inStock: item.inStock != null ? Boolean(item.inStock) : item.in_stock !== false && item.status !== "out_of_stock",
      sizes: sizes,
    });
  }

  function normalizeProducts(items) {
    return (Array.isArray(items) ? items : [])
      .map(normalizeProduct)
      .filter(function (item) { return item && item.routeSlug; });
  }

  function isRealSale(item) {
    return item && item.oldPrice != null && Number(item.oldPrice) > Number(item.price || 0);
  }

  function getProductHref(item) {
    return PRODUCT_PAGE_PATH + "?slug=" + encodeURIComponent(item.routeSlug || item.id || item.sku || "");
  }

  function getDepartmentTags(item) {
    var parts = getCategoryParts(item && item.categoryPath);
    var first = slugify(parts[0] || item && item.gender || "");
    var text = slugify((item && item.categoryPath) || "");
    var tags = [];
    if (first === "mens") tags.push("mens");
    if (first === "womens") tags.push("womens");
    if (/footwear|trainers|sneakers|shoes|boots|sandals|slippers/.test(text)) tags.push("footwear");
    if (/clothing|jackets|t-shirts|shirts|trousers|shorts|jeans|sweatshirts|hoodies|knitwear|gilets|polo/.test(text)) tags.push("clothing");
    if (/accessories|bags|caps|socks|care|wallets|hats|sunglasses|belts|jewellery|scarves|gloves/.test(text)) tags.push("accessories");
    if (/living|homeware|fragrance|publications|outdoor/.test(text)) tags.push("living");
    return tags;
  }

  function categoryStartsWith(item, expectedParts) {
    var parts = getCategoryParts(item.categoryPath).map(slugify);
    return expectedParts.every(function (part, index) {
      return parts[index] === slugify(part);
    });
  }

  function itemSearchText(item) {
    return [
      item.title,
      item.brand,
      item.sku,
      item.productCode,
      item.routeSlug,
      item.sourceSlug,
      item.categoryPath,
      item.categoryName,
      item.colour,
      item.description,
      item.shortDescription,
    ].join(" ").toLowerCase();
  }

  function queryMatches(item, query) {
    var clean = String(query || "").trim().toLowerCase();
    if (!clean) return true;
    var tokens = clean.split(/\s+/).filter(Boolean);
    var text = itemSearchText(item);
    return tokens.every(function (token) { return text.indexOf(token) !== -1; });
  }

  function link(label, href) {
    return { label: label, href: href };
  }

  function saleTopLinks() {
    return [
      link("Men's Sale", "shop.html?plp=mens-sale"),
      link("Women's Sale", "shop.html?plp=womens-sale"),
      link("Footwear Sale", "shop.html?plp=footwear-sale"),
      link("Clothing Sale", "shop.html?plp=clothing-sale"),
      link("Accessories Sale", "shop.html?plp=accessories-sale"),
      link("adidas Sale", "shop.html?brand=adidas&sale=1"),
      link("Nike Sale", "shop.html?brand=nike&sale=1"),
      link("New Balance Sale", "shop.html?brand=new-balance&sale=1"),
      link("Salomon Sale", "shop.html?brand=salomon&sale=1"),
    ];
  }

  var PRESETS = {
    "shop-all": {
      id: "shop-all",
      title: "Shop All",
      introText: "Browse footwear, clothing, accessories, brands, and sale edits from the current catalog.",
      topLinks: [
        link("Mens", "shop.html?plp=mens"),
        link("Womens", "shop.html?plp=womens"),
        link("Footwear", "shop.html?plp=footwear"),
        link("Clothing", "shop.html?plp=clothing"),
        link("Accessories", "shop.html?plp=accessories"),
        link("Sale", "shop.html?plp=sale"),
      ],
      productQuery: {},
    },
    latest: {
      id: "latest",
      title: "Latest",
      compactHeader: true,
      activeFilters: ["Only show latest items"],
      defaultSort: "latest",
      productQuery: {},
    },
    "latest-footwear": {
      id: "latest-footwear",
      title: "Latest Footwear",
      compactHeader: true,
      activeFilters: ["Only show latest items", "Footwear"],
      defaultSort: "latest",
      quickRefine: { type: "size", label: "Size" },
      productQuery: { tag: "footwear" },
    },
    "latest-clothing": {
      id: "latest-clothing",
      title: "Latest Clothing",
      compactHeader: true,
      activeFilters: ["Only show latest items", "Clothing"],
      defaultSort: "latest",
      productQuery: { tag: "clothing" },
    },
    mens: {
      id: "mens",
      title: "Mens",
      introText: "Shop men's footwear, clothing, accessories, new arrivals, and sale products.",
      topLinks: [
        link("New In", "shop.html?plp=mens-new-in"),
        link("Footwear", "shop.html?plp=mens-footwear"),
        link("Clothing", "shop.html?plp=mens-clothing"),
        link("Accessories", "shop.html?plp=mens-accessories"),
        link("Sale", "shop.html?plp=mens-sale"),
      ],
      productQuery: { categoryPath: ["Mens"] },
    },
    "mens-new-in": {
      id: "mens-new-in",
      title: "Men's New In",
      compactHeader: true,
      activeFilters: ["Only show latest items"],
      defaultSort: "latest",
      productQuery: { categoryPath: ["Mens"] },
    },
    "mens-footwear": {
      id: "mens-footwear",
      title: "Men's Footwear",
      introText: "Explore men's trainers, shoes, boots, sandals, and archive-inspired footwear.",
      topLinks: [
        link("Men's Trainers", "shop.html?plp=mens-footwear-trainers"),
        link("Shoes", "shop.html?plp=mens-footwear-shoes"),
        link("Boots", "shop.html?plp=mens-footwear-boots"),
        link("Sandals", "shop.html?plp=mens-footwear-sandals"),
        link("Nike Air Max", "shop.html?collection=nike-air-max"),
        link("Salomon XT-6", "shop.html?collection=salomon-xt-6"),
      ],
      quickRefine: { type: "size", label: "Size" },
      productQuery: { categoryPath: ["Mens", "Footwear"] },
    },
    "mens-footwear-trainers": {
      id: "mens-footwear-trainers",
      title: "Men's Trainers",
      introText: "Men's trainers from adidas, Nike, New Balance, ASICS, Salomon, and more.",
      topLinks: [
        link("Men's Shoes", "shop.html?plp=mens-footwear-shoes"),
        link("Men's Boots", "shop.html?plp=mens-footwear-boots"),
        link("Men's Sandals", "shop.html?plp=mens-footwear-sandals"),
        link("Nike Air Max", "shop.html?collection=nike-air-max"),
        link("adidas Spezial", "shop.html?collection=adidas-spezial"),
      ],
      quickRefine: { type: "size", label: "Size" },
      productQuery: { categoryPath: ["Mens", "Footwear", "Trainers"] },
    },
    "mens-footwear-shoes": {
      id: "mens-footwear-shoes",
      title: "Men's Shoes",
      quickRefine: { type: "size", label: "Size" },
      productQuery: { categoryPath: ["Mens", "Footwear", "Shoes"] },
    },
    "mens-footwear-boots": {
      id: "mens-footwear-boots",
      title: "Men's Boots",
      quickRefine: { type: "size", label: "Size" },
      productQuery: { categoryPath: ["Mens", "Footwear", "Boots"] },
    },
    "mens-footwear-sandals": {
      id: "mens-footwear-sandals",
      title: "Men's Sandals",
      quickRefine: { type: "size", label: "Size" },
      productQuery: { categoryPath: ["Mens", "Footwear", "Sandals"] },
    },
    "mens-clothing": {
      id: "mens-clothing",
      title: "Men's Clothing",
      introText: "Shop jackets, shirts, tees, trousers, hoodies, sweats, and seasonal layers.",
      topLinks: [
        link("Jackets", "shop.html?plp=mens-clothing-jackets"),
        link("T-Shirts", "shop.html?plp=mens-clothing-t-shirts"),
        link("Shirts", "shop.html?plp=mens-clothing-shirts"),
        link("Hoodies", "shop.html?plp=mens-clothing-hoodies"),
        link("Trousers", "shop.html?plp=mens-clothing-trousers"),
        link("Jeans", "shop.html?plp=mens-clothing-jeans"),
        link("Shorts", "shop.html?plp=mens-clothing-shorts"),
      ],
      productQuery: { categoryPath: ["Mens", "Clothing"] },
    },
    "mens-clothing-jackets": { id: "mens-clothing-jackets", title: "Men's Jackets", productQuery: { categoryPath: ["Mens", "Clothing", "Jackets"] } },
    "mens-clothing-hoodies": { id: "mens-clothing-hoodies", title: "Men's Hoodies", productQuery: { categoryPath: ["Mens", "Clothing", "Hoodies"] } },
    "mens-clothing-jeans": { id: "mens-clothing-jeans", title: "Men's Jeans", productQuery: { categoryPath: ["Mens", "Clothing", "Jeans"] } },
    "mens-clothing-shirts": { id: "mens-clothing-shirts", title: "Men's Shirts", productQuery: { categoryPath: ["Mens", "Clothing", "Shirts"] } },
    "mens-clothing-shorts": { id: "mens-clothing-shorts", title: "Men's Shorts", productQuery: { categoryPath: ["Mens", "Clothing", "Shorts"] } },
    "mens-clothing-sweatshirts": { id: "mens-clothing-sweatshirts", title: "Men's Sweatshirts", productQuery: { categoryPath: ["Mens", "Clothing", "Sweatshirts"] } },
    "mens-clothing-t-shirts": {
      id: "mens-clothing-t-shirts",
      title: "Men's T-Shirts",
      quickRefine: { type: "colour", label: "Pattern" },
      productQuery: { categoryPath: ["Mens", "Clothing", "T-Shirts"] },
    },
    "mens-clothing-trousers": { id: "mens-clothing-trousers", title: "Men's Trousers", productQuery: { categoryPath: ["Mens", "Clothing", "Trousers"] } },
    "mens-accessories": { id: "mens-accessories", title: "Men's Accessories", productQuery: { categoryPath: ["Mens", "Accessories"] } },
    womens: {
      id: "womens",
      title: "Womens",
      introText: "Shop women's footwear, clothing, accessories, new arrivals, and sale products.",
      topLinks: [
        link("New In", "shop.html?plp=womens-new-in"),
        link("Footwear", "shop.html?plp=womens-footwear"),
        link("Clothing", "shop.html?plp=womens-clothing"),
        link("Accessories", "shop.html?plp=womens-accessories"),
        link("Sale", "shop.html?plp=womens-sale"),
      ],
      productQuery: { categoryPath: ["Womens"] },
    },
    "womens-new-in": {
      id: "womens-new-in",
      title: "Women's New In",
      compactHeader: true,
      activeFilters: ["Only show latest items"],
      defaultSort: "latest",
      productQuery: { categoryPath: ["Womens"] },
    },
    "womens-footwear": {
      id: "womens-footwear",
      title: "Women's Footwear",
      introText: "Women's trainers, shoes, boots, sandals, and seasonal footwear.",
      topLinks: [
        link("Trainers", "shop.html?plp=womens-footwear-trainers"),
        link("Shoes", "shop.html?plp=womens-footwear-shoes"),
        link("Boots", "shop.html?plp=womens-footwear-boots"),
        link("Sandals", "shop.html?plp=womens-footwear-sandals"),
      ],
      quickRefine: { type: "size", label: "Size" },
      productQuery: { categoryPath: ["Womens", "Footwear"] },
    },
    "womens-footwear-trainers": { id: "womens-footwear-trainers", title: "Women's Trainers", quickRefine: { type: "size", label: "Size" }, productQuery: { categoryPath: ["Womens", "Footwear", "Trainers"] } },
    "womens-footwear-shoes": { id: "womens-footwear-shoes", title: "Women's Shoes", quickRefine: { type: "size", label: "Size" }, productQuery: { categoryPath: ["Womens", "Footwear", "Shoes"] } },
    "womens-footwear-boots": { id: "womens-footwear-boots", title: "Women's Boots", quickRefine: { type: "size", label: "Size" }, productQuery: { categoryPath: ["Womens", "Footwear", "Boots"] } },
    "womens-footwear-sandals": { id: "womens-footwear-sandals", title: "Women's Sandals", quickRefine: { type: "size", label: "Size" }, productQuery: { categoryPath: ["Womens", "Footwear", "Sandals"] } },
    "womens-clothing": { id: "womens-clothing", title: "Women's Clothing", productQuery: { categoryPath: ["Womens", "Clothing"] } },
    "womens-accessories": { id: "womens-accessories", title: "Women's Accessories", productQuery: { categoryPath: ["Womens", "Accessories"] } },
    footwear: {
      id: "footwear",
      title: "Footwear",
      introText: "Shop trainers, shoes, boots, sandals, and footwear care across mens and womens.",
      topLinks: [
        link("Men's Footwear", "shop.html?plp=mens-footwear"),
        link("Women's Footwear", "shop.html?plp=womens-footwear"),
        link("Trainers", "shop.html?plp=mens-footwear-trainers"),
        link("Sale Footwear", "shop.html?plp=footwear-sale"),
      ],
      quickRefine: { type: "size", label: "Size" },
      productQuery: { tag: "footwear" },
    },
    clothing: {
      id: "clothing",
      title: "Clothing",
      introText: "Shop current clothing across jackets, shirts, sweats, trousers, tees, and seasonal layers.",
      topLinks: [
        link("Men's Clothing", "shop.html?plp=mens-clothing"),
        link("Women's Clothing", "shop.html?plp=womens-clothing"),
        link("Jackets", "shop.html?plp=mens-clothing-jackets"),
        link("T-Shirts", "shop.html?plp=mens-clothing-t-shirts"),
        link("Sale Clothing", "shop.html?plp=clothing-sale"),
      ],
      productQuery: { tag: "clothing" },
    },
    accessories: {
      id: "accessories",
      title: "Accessories",
      introText: "Shop bags, caps, hats, socks, sunglasses, and daily accessories.",
      topLinks: [
        link("Bags", "shop.html?plp=accessories-bags"),
        link("Caps", "shop.html?plp=accessories-caps"),
        link("Hats", "shop.html?plp=accessories-hats"),
        link("Socks", "shop.html?plp=accessories-socks"),
        link("Living", "shop.html?plp=living"),
      ],
      productQuery: { tag: "accessories" },
    },
    "accessories-bags": { id: "accessories-bags", title: "Bags", productQuery: { tag: "accessories", categoryIncludes: ["bags"] } },
    "accessories-caps": { id: "accessories-caps", title: "Caps", productQuery: { tag: "accessories", categoryIncludes: ["caps"] } },
    "accessories-hats": { id: "accessories-hats", title: "Hats", productQuery: { tag: "accessories", categoryIncludes: ["hats"] } },
    "accessories-socks": { id: "accessories-socks", title: "Socks", productQuery: { tag: "accessories", categoryIncludes: ["socks"] } },
    "accessories-sunglasses": { id: "accessories-sunglasses", title: "Sunglasses", productQuery: { tag: "accessories", categoryIncludes: ["sunglasses"] } },
    living: {
      id: "living",
      title: "Living",
      introText: "Shop homeware, care, fragrance, publications, and lifestyle pieces.",
      topLinks: [
        link("Homeware", "shop.html?plp=living-homeware"),
        link("Garment & Footwear Care", "shop.html?plp=living-care"),
        link("Fragrance & Skincare", "shop.html?plp=living-fragrance"),
      ],
      productQuery: { tag: "living" },
    },
    "living-homeware": { id: "living-homeware", title: "Homeware", productQuery: { tag: "living", categoryIncludes: ["homeware"] } },
    "living-care": { id: "living-care", title: "Garment & Footwear Care", productQuery: { tag: "living", categoryIncludes: ["care"] } },
    "living-fragrance": { id: "living-fragrance", title: "Fragrance & Skincare", productQuery: { tag: "living", categoryIncludes: ["fragrance", "skincare"] } },
    sale: {
      id: "sale",
      title: "Sale",
      introText: "Browse reduced products calculated from current prices and old prices.",
      topLinks: saleTopLinks(),
      activeFilters: ["Sale"],
      productQuery: { sale: true },
    },
    "mens-sale": { id: "mens-sale", title: "Men's Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, categoryPath: ["Mens"] } },
    "mens-footwear-sale": { id: "mens-footwear-sale", title: "Men's Footwear Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], quickRefine: { type: "size", label: "Size" }, productQuery: { sale: true, categoryPath: ["Mens", "Footwear"] } },
    "mens-clothing-sale": { id: "mens-clothing-sale", title: "Men's Clothing Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, categoryPath: ["Mens", "Clothing"] } },
    "mens-accessories-sale": { id: "mens-accessories-sale", title: "Men's Accessories Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, categoryPath: ["Mens", "Accessories"] } },
    "womens-sale": { id: "womens-sale", title: "Women's Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, categoryPath: ["Womens"] } },
    "womens-footwear-sale": { id: "womens-footwear-sale", title: "Women's Footwear Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], quickRefine: { type: "size", label: "Size" }, productQuery: { sale: true, categoryPath: ["Womens", "Footwear"] } },
    "womens-clothing-sale": { id: "womens-clothing-sale", title: "Women's Clothing Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, categoryPath: ["Womens", "Clothing"] } },
    "womens-accessories-sale": { id: "womens-accessories-sale", title: "Women's Accessories Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, categoryPath: ["Womens", "Accessories"] } },
    "footwear-sale": { id: "footwear-sale", title: "Footwear Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], quickRefine: { type: "size", label: "Size" }, productQuery: { sale: true, tag: "footwear" } },
    "clothing-sale": { id: "clothing-sale", title: "Clothing Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, tag: "clothing" } },
    "accessories-sale": { id: "accessories-sale", title: "Accessories Sale", topLinks: saleTopLinks(), activeFilters: ["Sale"], productQuery: { sale: true, tag: "accessories" } },
  };

  function buildBrandMap(items) {
    var map = new Map();
    items.forEach(function (item) {
      var slug = slugify(item.brand);
      if (slug && !map.has(slug)) map.set(slug, item.brand);
    });
    return map;
  }

  function brandPreset(slug, items, params) {
    var brandMap = buildBrandMap(items);
    var display = brandMap.get(slug) || titleFromSlug(slug);
    var category = slugify(params.get("category") || "");
    var productQuery = { brand: slug };
    var activeFilters = ["Brand: " + display];
    if (params.get("sale") === "1") {
      productQuery.sale = true;
      activeFilters.push("Sale");
    }
    if (category) {
      productQuery.tag = category;
      activeFilters.push(titleFromSlug(category));
    }
    return {
      id: "brand-" + slug,
      title: display,
      introText: "Shop " + display + " footwear, clothing, accessories, and seasonal edits from the current catalog.",
      topLinks: [
        link(display + " Footwear", "shop.html?brand=" + encodeURIComponent(slug) + "&category=footwear"),
        link(display + " Clothing", "shop.html?brand=" + encodeURIComponent(slug) + "&category=clothing"),
        link(display + " Sale", "shop.html?brand=" + encodeURIComponent(slug) + "&sale=1"),
        link(display + " New In", "shop.html?brand=" + encodeURIComponent(slug) + "&sort=latest"),
        link(display + " Collections", "shop.html?collection=" + encodeURIComponent(slug)),
      ],
      quickRefine: { type: "size", label: "Size" },
      activeFilters: activeFilters,
      productQuery: productQuery,
    };
  }

  function searchPreset(query) {
    return {
      id: "search",
      title: "Search results",
      compactHeader: true,
      activeFilters: ['Search: "' + query + '"'],
      productQuery: { search: query },
    };
  }

  function collectionPreset(slug) {
    var title = titleFromSlug(slug);
    return {
      id: "collection-" + slug,
      title: title,
      compactHeader: true,
      activeFilters: ["Collection: " + title],
      quickRefine: /footwear|shoe|trainer|sneaker|boot|sandal|adidas|nike|salomon|asics|balance/i.test(title) ? { type: "size", label: "Size" } : null,
      productQuery: { search: title },
    };
  }

  function legacyCategoryPreset(params) {
    var category = slugify(params.get("category") || "");
    var search = slugify(params.get("search") || "");
    var newest = params.get("sort") === "newest" || params.get("sort") === "latest";
    if (params.get("sale") === "1") {
      if (category === "mens") return PRESETS["mens-sale"];
      if (category === "womens") return PRESETS["womens-sale"];
      if (category === "footwear") return PRESETS["footwear-sale"];
      if (category === "clothing") return PRESETS["clothing-sale"];
      if (category === "accessories") return PRESETS["accessories-sale"];
      return PRESETS.sale;
    }
    if (category === "mens" && search === "footwear") return PRESETS["mens-footwear"];
    if (category === "womens" && search === "footwear") return PRESETS["womens-footwear"];
    if (category === "mens" && search === "clothing") return PRESETS["mens-clothing"];
    if (category === "womens" && search === "clothing") return PRESETS["womens-clothing"];
    if (category === "mens" && newest) return PRESETS["mens-new-in"];
    if (category === "womens" && newest) return PRESETS["womens-new-in"];
    if (category === "mens") return PRESETS.mens;
    if (category === "womens") return PRESETS.womens;
    if (category === "footwear") return PRESETS.footwear;
    if (category === "clothing") return PRESETS.clothing;
    if (category === "accessories") return PRESETS.accessories;
    return null;
  }

  function resolvePreset(items) {
    var params = new URLSearchParams(window.location.search || "");
    var brandMap = buildBrandMap(items);
    var plp = slugify(params.get("plp") || "");
    var brand = slugify(params.get("brand") || "");
    var rawSearch = String(params.get("search") || params.get("q") || "").trim();
    var searchSlug = slugify(rawSearch);
    var collection = slugify(params.get("collection") || "");
    var legacy = legacyCategoryPreset(params);

    if (brand) return brandPreset(brand, items, params);
    if (rawSearch && brandMap.has(searchSlug)) return brandPreset(searchSlug, items, params);
    if (plp && PRESETS[plp]) return PRESETS[plp];
    if (collection) return collectionPreset(collection);
    if (legacy) return legacy;
    if (rawSearch) return searchPreset(rawSearch);
    if (params.get("sale") === "1") return PRESETS.sale;
    if (params.get("sort") === "newest" || params.get("sort") === "latest") return PRESETS.latest;
    return PRESETS["shop-all"];
  }

  function matchesProductQuery(item, query) {
    if (!query) return true;
    if (query.sale && !isRealSale(item)) return false;
    if (query.brand && slugify(item.brand) !== query.brand) return false;
    if (query.categoryPath && !categoryStartsWith(item, query.categoryPath)) return false;
    if (query.tag && getDepartmentTags(item).indexOf(slugify(query.tag)) === -1) return false;
    if (query.categoryIncludes && query.categoryIncludes.length) {
      var categoryText = slugify(item.categoryPath || "");
      var ok = query.categoryIncludes.some(function (term) {
        return categoryText.indexOf(slugify(term)) !== -1;
      });
      if (!ok) return false;
    }
    if (query.search && !queryMatches(item, query.search)) return false;
    return true;
  }

  function applyPresetQuery(items, preset) {
    return items.filter(function (item) {
      return matchesProductQuery(item, preset.productQuery || {});
    });
  }

  function readSetParam(params, key) {
    return new Set(String(params.get(key) || "")
      .split(",")
      .map(slugify)
      .filter(Boolean));
  }

  function setParamFromSet(params, key, values) {
    var list = Array.from(values || []).filter(Boolean);
    if (list.length) params.set(key, list.join(","));
    else params.delete(key);
  }

  function normalizeSort(value) {
    var slug = slugify(value);
    if (slug === "newest") return "latest";
    if (slug === "price-low") return "price-asc";
    if (slug === "price-high") return "price-desc";
    if (slug === "title") return "name-asc";
    if (["recommended", "latest", "price-asc", "price-desc", "name-asc", "name-desc", "brand"].indexOf(slug) !== -1) return slug;
    return "recommended";
  }

  function sortItems(items, sortBy) {
    var sorted = items.slice();
    sorted.sort(function (a, b) {
      if (sortBy === "price-asc") return Number(a.price || 0) - Number(b.price || 0) || a._index - b._index;
      if (sortBy === "price-desc") return Number(b.price || 0) - Number(a.price || 0) || a._index - b._index;
      if (sortBy === "name-asc") return String(a.title || "").localeCompare(String(b.title || "")) || a._index - b._index;
      if (sortBy === "name-desc") return String(b.title || "").localeCompare(String(a.title || "")) || a._index - b._index;
      if (sortBy === "brand") return String(a.brand || "").localeCompare(String(b.brand || "")) || String(a.title || "").localeCompare(String(b.title || ""));
      if (sortBy === "latest") return String(b.id || "").localeCompare(String(a.id || "")) || b._index - a._index;
      return a._index - b._index;
    });
    return sorted;
  }

  function valueCountOptions(items, getter, limit) {
    var map = new Map();
    items.forEach(function (item) {
      var values = getter(item);
      (Array.isArray(values) ? values : [values]).forEach(function (raw) {
        var label = String(raw || "").trim();
        var slug = slugify(label);
        if (!label || !slug || label.toLowerCase() === "n/a") return;
        var current = map.get(slug) || { slug: slug, label: label, count: 0 };
        current.count += 1;
        map.set(slug, current);
      });
    });
    return Array.from(map.values())
      .sort(function (a, b) {
        if (b.count !== a.count) return b.count - a.count;
        return String(a.label).localeCompare(String(b.label), undefined, { numeric: true });
      })
      .slice(0, limit || 40);
  }

  function buildOptions(baseItems) {
    return {
      sizes: valueCountOptions(baseItems, function (item) {
        return item.sizes.filter(function (size) { return size.available; }).map(function (size) { return size.label; });
      }, 36),
      brands: valueCountOptions(baseItems, function (item) { return item.brand; }, 42),
      colours: valueCountOptions(baseItems, function (item) { return item.colour; }, 28),
      categories: valueCountOptions(baseItems, function (item) { return item.categoryPath; }, 42),
    };
  }

  function applyRefine(items, state) {
    return items.filter(function (item) {
      if (state.filters.saleOnly && !isRealSale(item)) return false;
      if (state.filters.sizes.size) {
        var sizes = item.sizes.map(function (size) { return slugify(size.label); });
        if (!Array.from(state.filters.sizes).some(function (value) { return sizes.indexOf(value) !== -1; })) return false;
      }
      if (state.filters.brands.size && !state.filters.brands.has(slugify(item.brand))) return false;
      if (state.filters.colours.size && !state.filters.colours.has(slugify(item.colour))) return false;
      if (state.filters.categories.size && !state.filters.categories.has(slugify(item.categoryPath))) return false;
      return true;
    });
  }

  function renderBreadcrumbs(preset) {
    return '' +
      '<nav class="hip-plp-crumbs" aria-label="Breadcrumb">' +
        '<a href="index.html">Home</a>' +
        '<span aria-hidden="true">/</span>' +
        '<a href="shop.html">Shop</a>' +
        (preset.id !== "shop-all" ? '<span aria-hidden="true">/</span><span>' + escapeHtml(preset.title) + '</span>' : '') +
      '</nav>';
  }

  function renderHeader(preset) {
    var topLinks = Array.isArray(preset.topLinks) ? preset.topLinks : [];
    var intro = preset.introText || "";
    var compact = preset.compactHeader && !topLinks.length && !intro;
    return '' +
      '<section class="hip-plp-header ' + (compact ? 'is-compact' : '') + '">' +
        '<div class="hip-plp-container">' +
          renderBreadcrumbs(preset) +
          '<h1>' + escapeHtml(preset.title || "Shop All") + '</h1>' +
          (intro ? '<p class="hip-plp-intro">' + escapeHtml(intro) + '</p>' : '') +
          (topLinks.length ? '<div class="hip-plp-toplinks">' + topLinks.map(function (item) {
            return '<a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.label) + '</a>';
          }).join("") + '</div>' : '') +
        '</div>' +
      '</section>';
  }

  function renderActiveFilters(preset, state, optionLookup) {
    var chips = (preset.activeFilters || []).map(function (label) {
      return '<span class="hip-chip">' + escapeHtml(label) + '</span>';
    });
    function addSet(set, key, labelPrefix) {
      Array.from(set).forEach(function (value) {
        var label = optionLookup[key] && optionLookup[key].get(value) || titleFromSlug(value);
        chips.push('<button type="button" class="hip-chip is-removable" data-remove-filter="' + key + '" data-filter-value="' + escapeHtml(value) + '">' + escapeHtml(labelPrefix + label) + '<span aria-hidden="true">x</span></button>');
      });
    }
    addSet(state.filters.sizes, "sizes", "Size: ");
    addSet(state.filters.brands, "brands", "Brand: ");
    addSet(state.filters.colours, "colours", "Colour: ");
    addSet(state.filters.categories, "categories", "");
    if (state.filters.saleOnly) chips.push('<button type="button" class="hip-chip is-removable" data-remove-sale>Sale<span aria-hidden="true">x</span></button>');
    return chips.length ? '<div class="hip-active-filters">' + chips.join("") + '</div>' : "";
  }

  function renderQuickRefine(preset, options, state) {
    if (!preset.quickRefine) return "";
    var key = preset.quickRefine.type === "colour" ? "colours" : "sizes";
    var values = (options[key] || []).slice(0, key === "sizes" ? 18 : 12);
    if (!values.length) return "";
    return '' +
      '<section class="hip-quick-refine" aria-label="' + escapeHtml(preset.quickRefine.label) + '">' +
        '<div class="hip-plp-container">' +
          '<div class="hip-quick-row">' +
            '<span>' + escapeHtml(preset.quickRefine.label) + '</span>' +
            values.map(function (item) {
              var active = state.filters[key].has(item.slug);
              return '<button type="button" class="' + (active ? 'is-active' : '') + '" data-toggle-filter="' + key + '" data-filter-value="' + escapeHtml(item.slug) + '">' + escapeHtml(item.label) + '</button>';
            }).join("") +
          '</div>' +
        '</div>' +
      '</section>';
  }

  function renderCheckboxList(title, key, options, selected) {
    if (!options.length) return "";
    return '' +
      '<fieldset class="hip-refine-group">' +
        '<legend>' + escapeHtml(title) + '</legend>' +
        '<div class="hip-refine-list">' +
          options.map(function (item) {
            var checked = selected.has(item.slug) ? " checked" : "";
            return '' +
              '<label>' +
                '<input type="checkbox" data-refine-checkbox="' + key + '" value="' + escapeHtml(item.slug) + '"' + checked + ' />' +
                '<span>' + escapeHtml(item.label) + '</span>' +
                '<em>' + item.count + '</em>' +
              '</label>';
          }).join("") +
        '</div>' +
      '</fieldset>';
  }

  function renderDrawer(options, state) {
    return '' +
      '<div class="hip-refine-shell ' + (state.drawerOpen ? 'is-open' : '') + '" aria-hidden="' + (state.drawerOpen ? 'false' : 'true') + '">' +
        '<button type="button" class="hip-refine-backdrop" data-close-refine aria-label="Close filters"></button>' +
        '<aside class="hip-refine-panel" aria-label="Refine products">' +
          '<div class="hip-refine-head">' +
            '<h2>Refine</h2>' +
            '<button type="button" data-close-refine aria-label="Close filters">x</button>' +
          '</div>' +
          '<div class="hip-refine-body">' +
            '<fieldset class="hip-refine-group">' +
              '<legend>Sale</legend>' +
              '<label class="hip-sale-only"><input type="checkbox" data-sale-only' + (state.filters.saleOnly ? ' checked' : '') + ' /><span>Only show reduced items</span></label>' +
            '</fieldset>' +
            renderCheckboxList("Size", "sizes", options.sizes, state.filters.sizes) +
            renderCheckboxList("Brand", "brands", options.brands, state.filters.brands) +
            renderCheckboxList("Colour", "colours", options.colours, state.filters.colours) +
            renderCheckboxList("Category", "categories", options.categories, state.filters.categories) +
          '</div>' +
          '<div class="hip-refine-actions">' +
            '<button type="button" data-clear-refine>Clear all</button>' +
            '<button type="button" data-close-refine>Show products</button>' +
          '</div>' +
        '</aside>' +
      '</div>';
  }

  function renderToolbar(count, state) {
    return '' +
      '<section class="hip-toolbar">' +
        '<div class="hip-plp-container hip-toolbar-inner">' +
          '<button type="button" class="hip-refine-trigger" data-open-refine>Refine +</button>' +
          '<p class="hip-count"><span>' + count + '</span> items</p>' +
          '<label class="hip-sort-label"><span>Sort</span><select data-sort-select>' +
            '<option value="recommended"' + (state.sortBy === "recommended" ? " selected" : "") + '>Recommended</option>' +
            '<option value="latest"' + (state.sortBy === "latest" ? " selected" : "") + '>Newest</option>' +
            '<option value="price-asc"' + (state.sortBy === "price-asc" ? " selected" : "") + '>Price: low to high</option>' +
            '<option value="price-desc"' + (state.sortBy === "price-desc" ? " selected" : "") + '>Price: high to low</option>' +
            '<option value="name-asc"' + (state.sortBy === "name-asc" ? " selected" : "") + '>Name A-Z</option>' +
            '<option value="name-desc"' + (state.sortBy === "name-desc" ? " selected" : "") + '>Name Z-A</option>' +
          '</select></label>' +
        '</div>' +
      '</section>';
  }

  function renderProductCard(item) {
    var sale = isRealSale(item);
    return '' +
      '<a class="hip-product-card" data-product-card href="' + getProductHref(item) + '">' +
        '<article>' +
          '<div class="hip-product-image">' +
            '<img src="' + escapeHtml(item.image || PLACEHOLDER_IMAGE) + '" alt="' + escapeHtml(item.title) + '" loading="lazy" decoding="async" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER_IMAGE + '\';" />' +
            (sale ? '<span class="hip-sale-badge">Sale</span>' : '') +
          '</div>' +
          '<div class="hip-product-meta">' +
            '<p class="hip-product-brand">' + escapeHtml(item.brand || "Product") + '</p>' +
            '<h2>' + escapeHtml(item.title) + '</h2>' +
            '<p class="hip-product-path">' + escapeHtml(item.categoryPath || "") + '</p>' +
            '<p class="hip-product-price"><span>' + formatCurrency(item.price, item.currency) + '</span>' +
              (sale ? '<del>' + formatCurrency(item.oldPrice, item.currency) + '</del>' : '') +
            '</p>' +
          '</div>' +
        '</article>' +
      '</a>';
  }

  function renderGrid(items, state, totalPages) {
    if (!items.length) {
      return '' +
        '<section class="hip-results"><div class="hip-plp-container">' +
          '<div class="hip-empty">' +
            '<h2>No products found</h2>' +
            '<p>Try clearing refine options or browsing Shop All.</p>' +
            '<button type="button" data-clear-refine>Clear filters</button>' +
          '</div>' +
        '</div></section>';
    }
    var start = (state.page - 1) * state.perPage;
    var pageItems = items.slice(start, start + state.perPage);
    var end = Math.min(start + pageItems.length, items.length);
    return '' +
      '<section class="hip-results"><div class="hip-plp-container">' +
        '<div class="hip-grid">' + pageItems.map(renderProductCard).join("") + '</div>' +
        '<div class="hip-pagination">' +
          '<p>Showing ' + (start + 1) + '-' + end + ' of ' + items.length + '</p>' +
          '<div>' +
            '<button type="button" data-page-prev' + (state.page <= 1 ? ' disabled' : '') + '>Previous</button>' +
            '<span>Page ' + state.page + ' of ' + totalPages + '</span>' +
            '<button type="button" data-page-next' + (state.page >= totalPages ? ' disabled' : '') + '>Next</button>' +
          '</div>' +
        '</div>' +
      '</div></section>';
  }

  function buildOptionLookup(options) {
    var lookup = {};
    Object.keys(options).forEach(function (key) {
      lookup[key] = new Map();
      options[key].forEach(function (item) { lookup[key].set(item.slug, item.label); });
    });
    return lookup;
  }

  function ensureStyles() {
    if (document.getElementById("hip-plp-styles")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="hip-plp-styles">' +
      '.hip-plp-container{width:min(1440px,100%);margin:0 auto;padding:0 16px}.hip-plp-header{border-bottom:1px solid #e7e7e7;background:#fff}.hip-plp-header .hip-plp-container{padding-top:22px;padding-bottom:26px}.hip-plp-header.is-compact .hip-plp-container{padding-bottom:18px}.hip-plp-crumbs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;color:#777;font-size:12px}.hip-plp-crumbs a{color:#555;text-decoration:none}.hip-plp-crumbs a:hover{text-decoration:underline}.hip-plp-header h1{margin:0;color:#111;font-family:inherit;font-size:clamp(28px,4vw,52px);font-weight:800;letter-spacing:0;line-height:1.05}.hip-plp-intro{max-width:720px;margin:14px 0 0;color:#555;font-size:15px;line-height:1.65}.hip-plp-toplinks{display:flex;flex-wrap:wrap;gap:9px;margin-top:20px}.hip-plp-toplinks a{display:inline-flex;min-height:36px;align-items:center;border:1px solid #d7d7d7;background:#fff;padding:0 13px;color:#111;font-size:12px;font-weight:800;text-decoration:none;text-transform:uppercase}.hip-plp-toplinks a:hover{border-color:#111}.hip-toolbar{position:sticky;top:62px;z-index:30;border-bottom:1px solid #e7e7e7;background:rgba(255,255,255,.96);backdrop-filter:blur(8px)}.hip-toolbar-inner{display:grid;grid-template-columns:auto 1fr auto;gap:14px;align-items:center;min-height:58px}.hip-refine-trigger,.hip-sort-label select,.hip-pagination button,.hip-empty button,.hip-refine-actions button{border:1px solid #111;background:#fff;color:#111;min-height:38px;padding:0 14px;font-size:12px;font-weight:900;text-transform:uppercase;cursor:pointer}.hip-refine-trigger:hover,.hip-pagination button:hover:not(:disabled),.hip-empty button:hover,.hip-refine-actions button:hover{background:#111;color:#fff}.hip-count{margin:0;color:#555;font-size:13px;font-weight:700}.hip-count span{color:#111}.hip-sort-label{display:flex;align-items:center;gap:9px;color:#555;font-size:12px;font-weight:800;text-transform:uppercase}.hip-sort-label select{min-width:176px;text-transform:none;font-weight:700}.hip-active-filters{display:flex;flex-wrap:wrap;gap:8px;border-bottom:1px solid #efefef;background:#fafafa;padding:12px 16px}.hip-active-filters .hip-chip{display:inline-flex;min-height:28px;align-items:center;gap:8px;border:1px solid #d8d8d8;background:#fff;padding:0 10px;color:#111;font-size:12px;font-weight:700}.hip-chip.is-removable{cursor:pointer}.hip-chip.is-removable span{font-weight:900}.hip-quick-refine{border-bottom:1px solid #e7e7e7;background:#fff}.hip-quick-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:13px 0}.hip-quick-row>span{margin-right:4px;color:#555;font-size:12px;font-weight:900;text-transform:uppercase}.hip-quick-row button{min-height:32px;border:1px solid #d6d6d6;background:#fff;padding:0 11px;color:#111;font-size:12px;font-weight:800;cursor:pointer}.hip-quick-row button.is-active,.hip-quick-row button:hover{border-color:#111;background:#111;color:#fff}.hip-results{padding:18px 0 42px}.hip-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px 10px}.hip-product-card{display:block;min-width:0;color:inherit;text-decoration:none}.hip-product-card article{height:100%;background:#fff}.hip-product-image{position:relative;aspect-ratio:1/1;background:#f6f6f6;overflow:hidden}.hip-product-image img{display:block;width:100%;height:100%;object-fit:contain;padding:12px;transition:transform .22s ease}.hip-product-card:hover img{transform:scale(1.035)}.hip-sale-badge{position:absolute;left:8px;top:8px;background:#111;color:#fff;padding:4px 7px;font-size:10px;font-weight:900;text-transform:uppercase}.hip-product-meta{padding:10px 2px 0}.hip-product-brand{margin:0 0 4px;color:#111;font-size:11px;font-weight:900;text-transform:uppercase}.hip-product-meta h2{display:-webkit-box;min-height:38px;margin:0;color:#111;overflow:hidden;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:13px;font-weight:600;line-height:1.45}.hip-product-path{margin:5px 0 0;color:#777;font-size:11px;line-height:1.35;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hip-product-price{display:flex;flex-wrap:wrap;gap:7px;align-items:baseline;margin:7px 0 0;color:#111;font-size:14px;font-weight:900}.hip-product-price del{color:#777;font-size:12px;font-weight:600}.hip-pagination{display:flex;flex-direction:column;gap:14px;align-items:center;justify-content:space-between;margin-top:30px;border-top:1px solid #e7e7e7;padding-top:22px}.hip-pagination p{margin:0;color:#555;font-size:13px}.hip-pagination div{display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center}.hip-pagination span{min-width:104px;text-align:center;color:#555;font-size:13px}.hip-pagination button:disabled{cursor:not-allowed;opacity:.4}.hip-empty{display:flex;min-height:320px;flex-direction:column;align-items:center;justify-content:center;border:1px dashed #cfcfcf;padding:48px 18px;text-align:center}.hip-empty h2{margin:0;color:#111;font-size:22px}.hip-empty p{margin:10px 0 20px;color:#666;font-size:14px}.hip-refine-shell{position:fixed;inset:0;z-index:160;pointer-events:none}.hip-refine-shell.is-open{pointer-events:auto}.hip-refine-backdrop{position:absolute;inset:0;border:0;background:rgba(0,0,0,.45);opacity:0;transition:opacity .18s ease}.hip-refine-shell.is-open .hip-refine-backdrop{opacity:1}.hip-refine-panel{position:absolute;top:0;right:0;display:flex;width:min(420px,100%);height:100%;transform:translateX(100%);flex-direction:column;background:#fff;box-shadow:-20px 0 40px rgba(0,0,0,.16);transition:transform .2s ease}.hip-refine-shell.is-open .hip-refine-panel{transform:translateX(0)}.hip-refine-head{display:flex;min-height:60px;align-items:center;justify-content:space-between;border-bottom:1px solid #e7e7e7;padding:0 18px}.hip-refine-head h2{margin:0;color:#111;font-size:18px;font-weight:900}.hip-refine-head button{border:0;background:transparent;color:#111;font-size:22px;font-weight:900;cursor:pointer}.hip-refine-body{flex:1;overflow:auto;padding:8px 18px 18px}.hip-refine-group{margin:0;border:0;border-bottom:1px solid #ededed;padding:16px 0}.hip-refine-group legend{margin-bottom:10px;color:#111;font-size:13px;font-weight:900;text-transform:uppercase}.hip-refine-list{display:grid;gap:8px}.hip-refine-list label,.hip-sale-only{display:grid;grid-template-columns:auto 1fr auto;gap:9px;align-items:center;color:#222;font-size:13px;line-height:1.35}.hip-refine-list input,.hip-sale-only input{width:16px;height:16px;accent-color:#111}.hip-refine-list em{color:#777;font-size:11px;font-style:normal}.hip-refine-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;border-top:1px solid #e7e7e7;padding:14px 18px}.hip-refine-actions button:last-child{background:#111;color:#fff}@media(min-width:720px){.hip-plp-container{padding:0 28px}.hip-grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:24px 14px}.hip-pagination{flex-direction:row}.hip-active-filters{padding-left:28px;padding-right:28px}}@media(min-width:1100px){.hip-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:30px 18px}.hip-results{padding-top:24px}.hip-toolbar{top:62px}}@media(min-width:1380px){.hip-grid{grid-template-columns:repeat(5,minmax(0,1fr))}}@media(max-width:620px){.hip-toolbar-inner{grid-template-columns:1fr auto;gap:8px;min-height:auto;padding-top:10px;padding-bottom:10px}.hip-count{grid-column:1/-1;order:3}.hip-sort-label span{display:none}.hip-sort-label select{min-width:138px;max-width:44vw}.hip-refine-trigger{min-width:104px}.hip-plp-header .hip-plp-container{padding-top:16px;padding-bottom:18px}.hip-plp-toplinks a{min-height:34px;font-size:11px}.hip-product-meta h2{font-size:12px}.hip-product-path{display:none}}' +
      '</style>');
  }

  function updateUrl(state) {
    var params = new URLSearchParams(window.location.search || "");
    if (state.sortBy && state.sortBy !== state.defaultSort) params.set("sort", state.sortBy);
    else params.delete("sort");
    if (state.page > 1) params.set("page", String(state.page));
    else params.delete("page");
    setParamFromSet(params, "f_size", state.filters.sizes);
    setParamFromSet(params, "f_brand", state.filters.brands);
    setParamFromSet(params, "f_colour", state.filters.colours);
    setParamFromSet(params, "f_category", state.filters.categories);
    if (state.filters.saleOnly) params.set("f_sale", "1");
    else params.delete("f_sale");
    var query = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (query ? "?" + query : "") + (window.location.hash || ""));
  }

  function createState(preset) {
    var params = new URLSearchParams(window.location.search || "");
    var defaultSort = normalizeSort(preset.defaultSort || "recommended");
    var sortBy = normalizeSort(params.get("sort") || preset.defaultSort || "recommended");
    return {
      defaultSort: defaultSort,
      sortBy: sortBy,
      page: Math.max(1, Number(params.get("page") || 1) || 1),
      perPage: DEFAULT_PER_PAGE,
      drawerOpen: false,
      filters: {
        sizes: readSetParam(params, "f_size"),
        brands: readSetParam(params, "f_brand"),
        colours: readSetParam(params, "f_colour"),
        categories: readSetParam(params, "f_category"),
        saleOnly: params.get("f_sale") === "1",
      },
    };
  }

  function mountCatalogPage(products) {
    var main = document.querySelector("main");
    if (!main) return;
    ensureStyles();
    var items = normalizeProducts(products);
    var preset = resolvePreset(items);
    var state = createState(preset);
    document.title = (preset.title || "Shop All") + " | The Hip Store";
    main.innerHTML = '<div id="hip-plp-root"></div>';
    var root = document.getElementById("hip-plp-root");

    function currentBaseItems() {
      return applyPresetQuery(items, preset);
    }

    function render() {
      var baseItems = currentBaseItems();
      var options = buildOptions(baseItems);
      var optionLookup = buildOptionLookup(options);
      var refined = applyRefine(baseItems, state);
      var sorted = sortItems(refined, state.sortBy);
      var totalPages = Math.max(1, Math.ceil(sorted.length / state.perPage));
      if (state.page > totalPages) state.page = totalPages;
      if (state.page < 1) state.page = 1;
      updateUrl(state);
      root.innerHTML =
        renderHeader(preset) +
        renderToolbar(sorted.length, state) +
        renderActiveFilters(preset, state, optionLookup) +
        renderQuickRefine(preset, options, state) +
        renderGrid(sorted, state, totalPages) +
        renderDrawer(options, state);
      bind(root, totalPages);
    }

    function toggleSet(set, value, checked) {
      if (checked) set.add(value);
      else set.delete(value);
      state.page = 1;
    }

    function clearFilters() {
      state.filters.sizes.clear();
      state.filters.brands.clear();
      state.filters.colours.clear();
      state.filters.categories.clear();
      state.filters.saleOnly = false;
      state.page = 1;
    }

    function bind(scope, totalPages) {
      scope.querySelector("[data-open-refine]")?.addEventListener("click", function () {
        state.drawerOpen = true;
        render();
      });
      scope.querySelectorAll("[data-close-refine]").forEach(function (node) {
        node.addEventListener("click", function () {
          state.drawerOpen = false;
          render();
        });
      });
      scope.querySelector("[data-sort-select]")?.addEventListener("change", function (event) {
        state.sortBy = normalizeSort(event.target.value);
        state.page = 1;
        render();
      });
      scope.querySelectorAll("[data-toggle-filter]").forEach(function (node) {
        node.addEventListener("click", function () {
          var key = node.getAttribute("data-toggle-filter");
          var value = node.getAttribute("data-filter-value");
          var set = state.filters[key];
          if (!set) return;
          toggleSet(set, value, !set.has(value));
          render();
        });
      });
      scope.querySelectorAll("[data-refine-checkbox]").forEach(function (node) {
        node.addEventListener("change", function () {
          var key = node.getAttribute("data-refine-checkbox");
          var set = state.filters[key];
          if (!set) return;
          toggleSet(set, node.value, node.checked);
          render();
        });
      });
      scope.querySelector("[data-sale-only]")?.addEventListener("change", function (event) {
        state.filters.saleOnly = event.target.checked;
        state.page = 1;
        render();
      });
      scope.querySelectorAll("[data-clear-refine]").forEach(function (node) {
        node.addEventListener("click", function () {
          clearFilters();
          render();
        });
      });
      scope.querySelectorAll("[data-remove-filter]").forEach(function (node) {
        node.addEventListener("click", function () {
          var key = node.getAttribute("data-remove-filter");
          var value = node.getAttribute("data-filter-value");
          if (state.filters[key]) state.filters[key].delete(value);
          state.page = 1;
          render();
        });
      });
      scope.querySelector("[data-remove-sale]")?.addEventListener("click", function () {
        state.filters.saleOnly = false;
        state.page = 1;
        render();
      });
      scope.querySelector("[data-page-prev]")?.addEventListener("click", function () {
        if (state.page <= 1) return;
        state.page -= 1;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
      scope.querySelector("[data-page-next]")?.addEventListener("click", function () {
        if (state.page >= totalPages) return;
        state.page += 1;
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    render();
    revealShell();
  }

  window.HipCatalog = {
    mountCatalogPage: mountCatalogPage,
    normalizeProducts: normalizeProducts,
    resolvePreset: resolvePreset,
  };

  loadCatalog()
    .then(mountCatalogPage)
    .catch(function (error) {
      console.error("Catalog render failed:", error);
      var main = document.querySelector("main");
      if (main) {
        main.innerHTML = '<section class="hip-results"><div class="hip-plp-container"><div class="hip-empty"><h2>Products could not be loaded</h2><p>Please refresh the page.</p></div></div></section>';
      }
      revealShell();
    });
})();
