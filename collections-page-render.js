(function () {
  var FALLBACK_COLLECTIONS = [
    {
      slug: "mens-footwear",
      title: "Mens Footwear",
      description: "Current sneakers, shoes, and seasonal footwear from The Hip Store catalog.",
      href: "shop.html?plp=mens-footwear",
    },
    {
      slug: "womens-footwear",
      title: "Womens Footwear",
      description: "Browse women's footwear with live prices, sizes, and availability.",
      href: "shop.html?plp=womens-footwear",
    },
    {
      slug: "mens-clothing",
      title: "Mens Clothing",
      description: "Shop men's clothing across jackets, tops, trousers, and everyday layers.",
      href: "shop.html?plp=mens-clothing",
    },
    {
      slug: "womens-clothing",
      title: "Womens Clothing",
      description: "Shop women's clothing from the current catalog, including sale styles.",
      href: "shop.html?plp=womens-clothing",
    },
    {
      slug: "accessories",
      title: "Accessories",
      description: "Finish the look with bags, caps, socks, and everyday accessories.",
      href: "shop.html?plp=accessories",
    },
    {
      slug: "sale",
      title: "Sale",
      description: "Browse reduced products with current product pricing and stock.",
      href: "shop.html?plp=sale",
    },
    {
      slug: "new-balance",
      title: "New Balance",
      description: "Shop New Balance footwear and apparel from the product catalog.",
      href: "shop.html?brand=new-balance",
    },
    {
      slug: "nike",
      title: "Nike",
      description: "Shop Nike footwear, clothing, and accessories.",
      href: "shop.html?brand=nike",
    },
    {
      slug: "adidas",
      title: "Adidas",
      description: "Shop Adidas products with current size and price information.",
      href: "shop.html?brand=adidas",
    },
  ];

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function normalizeHref(item) {
    var slug = item && (item.slug || item.id) ? String(item.slug || item.id) : "";
    var map = {
      "mens-footwear": "shop.html?plp=mens-footwear",
      "womens-footwear": "shop.html?plp=womens-footwear",
      "mens-clothing": "shop.html?plp=mens-clothing",
      "womens-clothing": "shop.html?plp=womens-clothing",
      accessories: "shop.html?plp=accessories",
      sale: "shop.html?plp=sale",
      adidas: "shop.html?brand=adidas",
      nike: "shop.html?brand=nike",
      "new-balance": "shop.html?brand=new-balance",
    };
    if (map[slug]) return map[slug];
    if (item && item.href) return item.href;
    return "shop.html";
  }

  function buildHeader() {
    return (
      '<header class="sticky top-0 z-[100] w-full border-b border-border/40 bg-background/95 backdrop-blur">' +
      '<div class="container mx-auto px-4 lg:px-8">' +
      '<div class="flex h-16 md:h-20 items-center justify-between gap-4">' +
      '<a class="flex items-center shrink-0" href="index.html" aria-label="The Hip Store home"><img alt="The Hip Store" width="160" height="33" class="block h-7 md:h-8 w-auto max-w-none" src="logo1.svg?v=20260608a"/></a>' +
      '<nav class="hidden xl:flex items-center space-x-8">' +
      '<a class="text-sm font-medium hover:underline underline-offset-4" href="shop.html">Shop All</a>' +
      '<a class="text-sm font-medium hover:underline underline-offset-4" href="collections.html">Collections</a>' +
      '<a class="text-sm font-medium hover:underline underline-offset-4" href="about.html">About</a>' +
      '<a class="text-sm font-medium hover:underline underline-offset-4" href="contact.html">Contact</a>' +
      "</nav>" +
      '<div class="hidden xl:flex items-center gap-2" data-auth-controls></div>' +
      "</div></div></header>"
    );
  }

  function buildFooter() {
    return (
      '<footer class="border-t border-border/40 bg-secondary/30">' +
      '<div class="container mx-auto px-4 lg:px-8 py-12">' +
      '<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">' +
      '<p class="text-sm text-muted-foreground">&copy; 2026 The Hip Store. All rights reserved</p>' +
      '<div class="flex flex-wrap gap-4"><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4" href="privacy.html">Privacy Policy</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4" href="terms.html">Terms of Service</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4" href="contact.html">Contact</a></div>' +
      "</div></div></footer>"
    );
  }

  function normalizeCollection(item, index) {
    return {
      title: item && item.title ? item.title : FALLBACK_COLLECTIONS[index % FALLBACK_COLLECTIONS.length].title,
      description: item && item.description ? item.description : "",
      href: normalizeHref(item),
      displayOrder: Number(item && item.display_order ? item.display_order : index + 1),
    };
  }

  function buildCard(item) {
    return (
      '<a href="' +
      escapeHtml(item.href) +
      '" class="group block rounded-lg border border-border/60 bg-background p-6 shadow-sm transition-all hover:border-foreground/40 hover:shadow-md">' +
      '<div class="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-foreground">' +
      escapeHtml(String(item.title || "P").slice(0, 1).toUpperCase()) +
      "</div>" +
      '<h2 class="mb-2 text-xl font-semibold group-hover:underline underline-offset-4">' +
      escapeHtml(item.title) +
      "</h2>" +
      '<p class="min-h-[3.75rem] text-sm leading-6 text-muted-foreground">' +
      escapeHtml(item.description) +
      "</p>" +
      '<span class="mt-6 inline-flex items-center text-sm font-medium">Shop All<span class="ml-2" aria-hidden="true">-&gt;</span></span>' +
      "</a>"
    );
  }

  function mountShell() {
    Array.from(document.body.children).forEach(function (node) {
      if (node.tagName !== "SCRIPT") node.remove();
    });

    var app = document.createElement("div");
    app.className = "flex min-h-screen flex-col bg-background text-foreground";
    app.innerHTML =
      buildHeader() +
      '<main class="flex-1">' +
      '<section class="border-b border-border/40 bg-secondary/20">' +
      '<div class="container mx-auto px-4 lg:px-8 py-14 md:py-20">' +
      '<h1 class="font-serif text-4xl md:text-5xl mb-4 text-balance">Product Collections</h1>' +
      '<p class="text-lg text-muted-foreground max-w-2xl text-pretty">Browse The Hip Store catalog by department, brand, and sale edits.</p>' +
      "</div></section>" +
      '<section class="py-10 md:py-14"><div class="container mx-auto px-4 lg:px-8">' +
      '<div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3" id="collections-grid"></div>' +
      "</div></section>" +
      "</main>" +
      buildFooter();

    document.body.insertBefore(app, document.body.firstChild);
    return app;
  }

  var app = mountShell();
  var grid = app.querySelector("#collections-grid");

  loadJson("data/collections.json")
    .then(function (items) {
      var source = Array.isArray(items) && items.length ? items : FALLBACK_COLLECTIONS;
      var cleanItems = source.map(normalizeCollection).sort(function (a, b) {
        if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
        return String(a.title || "").localeCompare(String(b.title || ""));
      });
      grid.innerHTML = cleanItems.map(buildCard).join("");
    })
    .catch(function () {
      grid.innerHTML = FALLBACK_COLLECTIONS.map(function (item, index) {
        return buildCard(normalizeCollection(item, index));
      }).join("");
    });
})();
