(function () {
  var REMOTE_SUPABASE_URL = "https://pwihhhbomwxzznekueok.supabase.co";
  var REMOTE_SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWhoaGJvbXd4enpuZWt1ZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTgzNjMsImV4cCI6MjA4MTAzNDM2M30.S1aJOnJIdZY8WGVUUAbvMStxR4C5o2-3AkO6GgmkKYY";
  var _remoteLotCacheBySlug = new Map();

  var MEGA_MENU = [
    {
      title: "Watches",
      href: "category/watches.html",
      items: [
        { label: "Rolex", href: "category/watches.html" },
        { label: "Cartier", href: "category/watches.html" },
        { label: "Patek Philippe", href: "category/watches.html" },
        { label: "Audemars Piguet", href: "category/watches.html" },
      ],
    },
    {
      title: "Bags & Fashion",
      href: "category/handbag.html",
      items: [
        { label: "Hermes", href: "category/handbag.html" },
        { label: "Chanel", href: "category/handbag.html" },
        { label: "Louis Vuitton", href: "category/handbag.html" },
        { label: "Goyard", href: "category/handbag.html" },
      ],
    },
    {
      title: "Jewelry",
      href: "category/earring.html",
      items: [
        { label: "Earrings", href: "category/earring.html" },
        { label: "Rings", href: "auctions.html" },
        { label: "Bracelets", href: "auctions.html" },
        { label: "Necklaces", href: "auctions.html" },
      ],
    },
    {
      title: "Collectibles & More",
      href: "category/collectible.html",
      items: [
        { label: "Books & Manuscripts", href: "category/books-manuscripts.html" },
        { label: "Vintage Posters", href: "category/collectible.html" },
        { label: "Photographs", href: "category/collectible.html" },
        { label: "Pens", href: "category/books-manuscripts.html" },
      ],
    },
    {
      title: "Fine Art",
      href: "auctions.html",
      items: [
        { label: "Paintings", href: "auctions.html" },
        { label: "Work on Paper", href: "auctions.html" },
        { label: "Sculpture", href: "auctions.html" },
      ],
    },
    {
      title: "Spirits",
      href: "collections/the-great-whiskey-collection.html",
      items: [
        { label: "Van Winkle", href: "collections/the-great-whiskey-collection.html" },
        { label: "Weller", href: "collections/the-great-whiskey-collection.html" },
        { label: "Old Fitzgerald", href: "collections/the-great-whiskey-collection.html" },
        { label: "Four Roses", href: "collections/the-great-whiskey-collection.html" },
      ],
    },
    {
      title: "Furniture & Decor",
      href: "auctions.html",
      items: [
        { label: "Decor", href: "auctions.html" },
        { label: "Furniture", href: "auctions.html" },
        { label: "Lighting", href: "auctions.html" },
      ],
    },
    {
      title: "Science",
      href: "auctions.html",
      items: [
        { label: "Instruments", href: "auctions.html" },
        { label: "Curiosities", href: "auctions.html" },
        { label: "Discovery", href: "auctions.html" },
      ],
    },
  ];

  function getSlug() {
    var file = window.location.pathname.split("/").pop() || "";
    return file.replace(/\.html$/i, "");
  }

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function requestRemoteSupabase(path) {
    return fetch(REMOTE_SUPABASE_URL + path, {
      headers: {
        apikey: REMOTE_SUPABASE_KEY,
      },
    }).then(function (response) {
      if (!response.ok) throw new Error("Remote request failed: " + response.status);
      return response.json();
    });
  }

  function chunkArray(items, size) {
    var chunks = [];
    for (var index = 0; index < items.length; index += size) {
      chunks.push(items.slice(index, index + size));
    }
    return chunks;
  }

  function buildRemoteSlugMap(slugs) {
    var map = new Map();
    (Array.isArray(slugs) ? slugs : []).forEach(function (slug) {
      if (_remoteLotCacheBySlug.has(slug)) {
        map.set(slug, _remoteLotCacheBySlug.get(slug));
      }
    });
    return map;
  }

  function fetchRemoteLotsBySlugs(slugs) {
    var cleanSlugs = Array.from(
      new Set(
        (Array.isArray(slugs) ? slugs : [])
          .map(function (slug) {
            return String(slug || "").trim();
          })
          .filter(Boolean)
      )
    );

    if (!cleanSlugs.length) return Promise.resolve(new Map());

    var missingSlugs = cleanSlugs.filter(function (slug) {
      return !_remoteLotCacheBySlug.has(slug);
    });

    if (!missingSlugs.length) {
      return Promise.resolve(buildRemoteSlugMap(cleanSlugs));
    }

    return Promise.allSettled(
      chunkArray(missingSlugs, 20).map(function (batch) {
        var batchFilter = "(" +
          batch
            .map(function (slug) {
              return '"' + slug.replace(/"/g, "") + '"';
            })
            .join(",") +
          ")";

        return requestRemoteSupabase(
          "/rest/v1/lots?select=id,slug,title,current_bid,end_time,status&slug=in." + encodeURIComponent(batchFilter)
        );
      })
    ).then(function (results) {
      results.forEach(function (result) {
        if (result.status !== "fulfilled" || !Array.isArray(result.value)) return;
        result.value.forEach(function (lot) {
          var lotSlug = String((lot && lot.slug) || "").trim();
          if (!lotSlug) return;
          _remoteLotCacheBySlug.set(lotSlug, lot);
        });
      });

      missingSlugs.forEach(function (slug) {
        if (!_remoteLotCacheBySlug.has(slug)) {
          _remoteLotCacheBySlug.set(slug, null);
        }
      });

      return buildRemoteSlugMap(cleanSlugs);
    }).catch(function () {
      return buildRemoteSlugMap(cleanSlugs);
    });
  }

  function mergeRemoteDataIntoItem(item, remoteLot) {
    if (!item || !remoteLot) return item;

    return Object.assign({}, item, {
      title: remoteLot.title || item.title,
      currentBid: remoteLot.current_bid != null ? Number(remoteLot.current_bid) : Number(item.currentBid || item.current_bid || 0),
      endTime: remoteLot.end_time || item.endTime || item.end_time,
      status: remoteLot.status || item.status,
    });
  }

  function hydrateItemsWithRemoteData(items) {
    var sourceItems = Array.isArray(items) ? items.slice() : [];
    var slugs = sourceItems.map(function (item) {
      return item && item.slug;
    });

    return fetchRemoteLotsBySlugs(slugs).then(function (remoteLotsBySlug) {
      return sourceItems.map(function (item) {
        var itemSlug = String((item && item.slug) || "").trim();
        return mergeRemoteDataIntoItem(item, remoteLotsBySlug.get(itemSlug));
      });
    }).catch(function () {
      return sourceItems;
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

  function buildMegaMenu() {
    return (
      '<div class="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 fixed left-0 right-0 top-[80px] z-[100]">' +
      '<div class="container mx-auto px-4">' +
      '<div class="bg-background border border-border rounded-lg shadow-2xl p-6">' +
      '<div class="flex flex-wrap gap-x-8 gap-y-6">' +
      MEGA_MENU.map(function (group) {
        return (
          '<div class="min-w-[180px] max-w-[220px] space-y-3">' +
          '<a class="block text-sm font-semibold hover:underline underline-offset-4" href="../' +
          group.href +
          '">' +
          group.title +
          "</a>" +
          '<div class="space-y-2">' +
          group.items
            .map(function (item) {
              return (
                '<a class="block text-sm text-muted-foreground hover:text-foreground transition-colors" href="../' +
                item.href +
                '">' +
                item.label +
                "</a>"
              );
            })
            .join("") +
          "</div></div>"
        );
      }).join("") +
      "</div></div></div></div>"
    );
  }

  function buildHeaderActions() {
    return (
      '<div class="flex items-center space-x-2 xl:space-x-4">' +
      '<button data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9" type="button" aria-label="Search"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-5 w-5"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg></button>' +
      '<button data-slot="dropdown-menu-trigger" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 h-9 w-9" type="button" aria-haspopup="menu" aria-expanded="false" data-state="closed" aria-label="Switch language"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe h-4 w-4"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg><span class="sr-only">Switch language</span></button>' +
      '<div class="hidden xl:flex items-center gap-2"><button class="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground transition-all h-10" type="button">Login</button><button class="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-black px-4 py-2 text-sm font-medium text-white shadow-xs transition-all h-10 hover:opacity-90" type="button">Register</button></div>' +
      '<button data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 size-9 xl:hidden" type="button" aria-label="Menu"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu h-5 w-5"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg></button>' +
      "</div>"
    );
  }

  function buildHeader() {
    return (
      '<header class="sticky top-0 z-[100] w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">' +
      '<div class="container mx-auto px-4 lg:px-8">' +
      '<div class="flex h-16 md:h-20 items-center justify-between gap-4">' +
      '<a class="flex items-center shrink-0" href="../index.html" aria-label="Sotheby&#39;s home">' +
      '<img alt="Sotheby&#39;s" width="160" height="33" class="block h-7 md:h-8 w-auto max-w-none" src="../logo1.svg"/>' +
      "</a>" +
      '<nav class="hidden xl:flex items-center space-x-8">' +
      '<a class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="../auctions.html">Shop All</a>' +
      '<a class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="../collections/last-chance.html">Last Chance</a>' +
      '<div class="relative group"><button class="flex items-center gap-1 text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" type="button">Categories<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4"><path d="m6 9 6 6 6-6"></path></svg></button>' +
      buildMegaMenu() +
      "</div>" +
      '<a class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="../collections.html">Collections</a>' +
      '<a class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="../about.html">About</a>' +
      '<a class="text-sm font-medium hover:text-foreground hover:underline underline-offset-4 transition-all" href="../contact.html">Contact</a>' +
      "</nav>" +
      buildHeaderActions() +
      "</div></div></header>"
    );
  }

  function stripHtml(value) {
    return String(value || "").replace(/<[^>]*>/g, "");
  }

  function formatCurrency(value) {
    return "EUR " + Math.round(Number(value || 0)).toLocaleString("en-US");
  }

  function getCountdown(endTime) {
    var diff = new Date(endTime).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) return "Ended";
    var totalSeconds = Math.floor(diff / 1000);
    var days = Math.floor(totalSeconds / 86400);
    var hours = Math.floor((totalSeconds % 86400) / 3600);
    var minutes = Math.floor((totalSeconds % 3600) / 60);
    var seconds = totalSeconds % 60;

    if (days > 0) {
      return days + "d " + String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
    }

    return (
      String(hours).padStart(2, "0") +
      ":" +
      String(minutes).padStart(2, "0") +
      ":" +
      String(seconds).padStart(2, "0")
    );
  }

  function renderCard(item) {
    var href = "../lot/index.html?slug=" + encodeURIComponent(item.slug || "");
    return (
      '<a href="' + href + '" class="block h-full"><div class="border border-border/50 bg-background rounded-lg overflow-hidden h-full flex flex-col group hover:border-foreground/30 transition-colors">' +
      '<div class="relative aspect-square overflow-hidden bg-muted/20 rounded-t-lg">' +
      '<img src="' +
      escapeHtml(item.image) +
      '" alt="' +
      escapeHtml(item.title) +
      '" class="w-full h-full object-cover pointer-events-none select-none" draggable="false"/>' +
      '<div class="absolute top-1 right-1 bg-background/95 backdrop-blur-sm rounded-full px-1 py-0.5 flex items-center gap-0.5"><span class="text-[8px] sm:text-[9px] font-medium" data-end-time="' +
      escapeHtml(item.endTime) +
      '">' +
      getCountdown(item.endTime) +
      "</span></div></div>" +
      '<div class="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 flex-1 flex flex-col">' +
      '<span class="text-[8px] sm:text-[9px] uppercase tracking-wider bg-muted/50 border border-border/50 px-1 py-0.5 w-fit rounded">' +
      escapeHtml(item.category || "General") +
      "</span>" +
      '<h3 class="font-serif text-[10px] sm:text-xs leading-tight line-clamp-2 h-[28px] sm:h-[32px]">' +
      escapeHtml(item.title) +
      '</h3><div class="flex items-center gap-0.5 sm:gap-1 py-0.5 sm:py-1 px-1 sm:px-1.5 bg-muted/30 rounded text-[9px] sm:text-[10px] font-medium"><span class="font-semibold" data-end-time="' +
      escapeHtml(item.endTime) +
      '">' +
      getCountdown(item.endTime) +
      '</span></div><div><p class="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wider">Current Bid</p><p class="text-xs sm:text-sm font-semibold tabular-nums">' +
      formatCurrency(item.currentBid) +
      '</p></div><span class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-[9px] sm:text-[10px] font-medium transition-all border bg-transparent h-6 sm:h-7 mt-auto w-full hover:bg-foreground hover:text-background">View Auction</span></div></div></a>'
    );
  }

  function updateCountdowns(scope) {
    scope.querySelectorAll("[data-end-time]").forEach(function (node) {
      node.textContent = getCountdown(node.getAttribute("data-end-time"));
    });
  }

  function matchWinter(item) {
    var haystack = (item.title + " " + item.category).toLowerCase();
    return (
      haystack.includes("watch") ||
      haystack.includes("bag") ||
      haystack.includes("birkin") ||
      haystack.includes("kelly") ||
      haystack.includes("diamond") ||
      haystack.includes("jewelry") ||
      item.category === "Cartier" ||
      item.category === "Rolex" ||
      item.category === "Patek Philippe" ||
      item.category === "Hermès" ||
      item.category === "Chanel" ||
      item.category === "Louis Vuitton" ||
      item.category === "Earring" ||
      item.category === "Ring" ||
      item.category === "Bracelet" ||
      item.category === "Necklace"
    );
  }

  function matchFashion(item) {
    var haystack = (item.title + " " + item.category).toLowerCase();
    return (
      haystack.includes("bag") ||
      haystack.includes("birkin") ||
      haystack.includes("kelly") ||
      haystack.includes("fashion") ||
      haystack.includes("leather") ||
      item.category === "Handbag" ||
      item.category === "Hermès" ||
      item.category === "Chanel" ||
      item.category === "Louis Vuitton" ||
      item.category === "Goyard" ||
      item.category === "Apparel" ||
      item.category === "Sneaker"
    );
  }

  function matchWatches(item) {
    var haystack = (item.title + " " + item.category).toLowerCase();
    return (
      haystack.includes("watch") ||
      item.category === "Cartier" ||
      item.category === "Rolex" ||
      item.category === "Patek Philippe" ||
      item.category === "Audemars Piguet" ||
      item.category === "FP Journe"
    );
  }

  function matchJewelry(item) {
    var haystack = (item.title + " " + item.category).toLowerCase();
    return (
      haystack.includes("diamond") ||
      haystack.includes("jewelry") ||
      item.category === "Earring" ||
      item.category === "Ring" ||
      item.category === "Bracelet" ||
      item.category === "Necklace" ||
      item.category === "Brooch" ||
      item.category === "Jewelry"
    );
  }

  function matchWhiskey(item) {
    return (
      item.category === "Spirits" ||
      item.category === "Four Roses" ||
      item.category === "Old Fitzgerald" ||
      item.category === "George T. Stagg" ||
      item.category === "Elmer T." ||
      item.category === "Elijah Craig" ||
      item.category === "Sazerac"
    );
  }

  function getMatcher(slug) {
    if (slug === "the-winter-edit-icons-of-luxury" || slug === "valentine-s-curated-icons") return matchWinter;
    if (slug === "the-great-whiskey-collection" || slug === "rare-collectible-spirits") return matchWhiskey;
    if (slug === "handbags-fashion" || slug === "herm-s-birkin-collection" || slug === "parisian-icons" || slug === "heritage-in-leather") return matchFashion;
    if (slug === "fine-watches" || slug === "timepieces-of-distinction" || slug === "icons-of-swiss-watchmaking") return matchWatches;
    if (slug === "high-jewelry") return matchJewelry;
    return matchWinter;
  }

  function buildSections(items, slug) {
    if (slug === "the-winter-edit-icons-of-luxury") {
      return [
        {
          title: "Watches",
          lots: items.filter(function (item) {
            var haystack = (item.title + " " + item.category).toLowerCase();
            return haystack.includes("watch") || item.category === "Cartier" || item.category === "Rolex" || item.category === "Patek Philippe";
          }).slice(0, 8),
        },
        {
          title: "Handbags & Jewelry",
          lots: items.filter(function (item) {
            var haystack = (item.title + " " + item.category).toLowerCase();
            return !haystack.includes("watch");
          }).slice(0, 8),
        },
      ];
    }

    if (slug === "valentine-s-curated-icons") {
      return [
        {
          title: "Curated Icons",
          lots: items.slice(0, 10),
        },
      ];
    }

    if (slug === "handbags-fashion" || slug === "herm-s-birkin-collection" || slug === "parisian-icons" || slug === "heritage-in-leather") {
      return [
        {
          title: "Handbags & Fashion",
          lots: items.slice(0, 10),
        },
      ];
    }

    if (slug === "fine-watches" || slug === "timepieces-of-distinction" || slug === "icons-of-swiss-watchmaking") {
      return [
        {
          title: "Fine Watches",
          lots: items.slice(0, 10),
        },
      ];
    }

    if (slug === "high-jewelry") {
      return [
        {
          title: "High Jewelry",
          lots: items.slice(0, 10),
        },
      ];
    }

    return [
      {
        title: "Featured Bottles",
        lots: items.slice(0, 10),
      },
    ];
  }

  function renderPage(config, sections) {
    document.body.innerHTML =
      '<div class="min-h-screen bg-background text-foreground">' +
      buildHeader() +
      '<main><div class="min-h-screen bg-background">' +
      '<div class="relative w-full h-[50vh] md:h-[60vh]">' +
      '<img src="' +
      escapeHtml(config.cover_image) +
      '" alt="' +
      escapeHtml(config.title) +
      '" class="absolute inset-0 w-full h-full object-cover"/>' +
      '<div class="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent"></div>' +
      '<div class="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-12">' +
      '<h1 class="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">' +
      escapeHtml(stripHtml(config.cover_text || config.title)) +
      "</h1>" +
      '<p class="text-lg md:text-xl text-foreground max-w-3xl mb-6 text-balance">' +
      escapeHtml(stripHtml(config.description || "")) +
      "</p></div></div>" +
      '<div class="container mx-auto px-4 py-8 md:py-12">' +
      '<a href="../collections.html" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 mb-8"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="m12 19-7-7 7-7"></path><path d="M19 12H5"></path></svg>Back</a>' +
      sections
        .map(function (section) {
          return (
            '<div class="mb-16">' +
            '<h2 class="text-2xl md:text-3xl font-bold mb-8">' +
            escapeHtml(section.title) +
            "</h2>" +
            '<div class="flex gap-3 sm:gap-4 overflow-x-auto pb-4" style="scrollbar-width:none;-ms-overflow-style:none;">' +
            section.lots
              .map(function (item) {
                return '<div class="flex-shrink-0 w-[240px] md:w-[260px]">' + renderCard(item) + "</div>";
              })
              .join("") +
            "</div></div>"
          );
        })
        .join("") +
      "</div></div></main>" +
      '<footer class="border-t border-border/40 bg-secondary/30"><div class="container mx-auto px-4 lg:px-8 py-16"><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"><div><div class="mb-6"><img alt="Sotheby&#39;s" width="160" height="33" class="block h-8 w-auto max-w-none" src="../logo1.svg"/></div><p class="text-sm text-muted-foreground leading-relaxed">A distinguished auction house specializing in rare collectibles, fine art, and luxury items. Experience the pinnacle of curated auctions.</p></div><div><h3 class="font-medium mb-4">Quick Links</h3><ul class="space-y-3"><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../auctions.html">Current Auctions</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../auctions.html">Shop All</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../collections.html">Collections</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../sell.html">Sell With Us</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../about.html">About Us</a></li></ul></div><div><h3 class="font-medium mb-4">Support</h3><ul class="space-y-3"><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../how-to-bid.html">How to Bid</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../shipping.html">Shipping &amp; Delivery</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../faq.html">FAQ</a></li><li><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../contact.html">Contact Us</a></li></ul></div><div><h3 class="font-medium mb-4">Stay Updated</h3><p class="text-sm text-muted-foreground mb-4 leading-relaxed">Subscribe to receive updates on new auctions and exclusive offers.</p><form class="flex gap-2 mb-6"><input type="email" class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-sm h-10" placeholder="Enter your email" required="" value=""/><button class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border shadow-xs hover:bg-accent hover:text-accent-foreground px-4 py-2 shrink-0 bg-transparent h-10" type="submit">Subscribe</button></form></div></div><div class="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4"><p class="text-sm text-muted-foreground">© 2026 Sotheby&#39;s. All rights reserved</p><div class="flex flex-wrap justify-center gap-4 md:gap-6"><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../privacy.html">Privacy Policy</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../terms.html">Terms of Service</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../cookie-policy.html">Cookie Policy</a><a class="text-sm text-muted-foreground hover:text-foreground hover:underline underline-offset-4 transition-all" href="../accessibility.html">Accessibility</a></div></div></div></footer></div>';

    if (window.__AUCTIO_HEADER && typeof window.__AUCTIO_HEADER.enhanceHeader === "function") {
      window.__AUCTIO_HEADER.enhanceHeader("../");
    }

    updateCountdowns(document.body);
    setInterval(function () {
      updateCountdowns(document.body);
    }, 1000);
  }

  var slug = getSlug();

  Promise.all([loadJson("../data/collections.json"), loadJson("../data/all-shop-lots.json")])
    .then(function (results) {
      var collections = results[0];
      var items = results[1];
      var collection = collections.find(function (entry) {
        return entry.slug === slug;
      });
      if (!collection) return;

      var config = {
        title: collection.title,
        cover_image: "../" + (collection.local_cover_image || collection.cover_image),
        cover_text: collection.cover_text || "",
        description: collection.description || "",
      };
      var matcher = getMatcher(slug);
      var filtered = items.filter(matcher).slice(0, 20);
      return hydrateItemsWithRemoteData(filtered).then(function (hydratedItems) {
        renderPage(config, buildSections(hydratedItems, slug));
      });
    })
    .catch(function (error) {
      console.error("Collection detail render failed:", error);
    });
})();
