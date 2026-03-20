(function () {
  var REMOTE_SUPABASE_URL = "https://pwihhhbomwxzznekueok.supabase.co";
  var REMOTE_SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aWhoaGJvbXd4enpuZWt1ZW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0NTgzNjMsImV4cCI6MjA4MTAzNDM2M30.S1aJOnJIdZY8WGVUUAbvMStxR4C5o2-3AkO6GgmkKYY";

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
        Authorization: "Bearer " + REMOTE_SUPABASE_KEY,
      },
    }).then(function (response) {
      if (!response.ok) throw new Error("Remote request failed: " + response.status);
      return response.json();
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function formatCurrency(value) {
    return "EUR " + Number(value || 0).toLocaleString("en-US");
  }

  function getLotHref(item) {
    return "lot/index.html?slug=" + encodeURIComponent(item.slug || "");
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
      return (
        days +
        "d " +
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0")
      );
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
    return (
      '<a class="block h-full" href="' + getLotHref(item) + '"><div data-slot="card" class="text-card-foreground gap-6 rounded-xl border shadow-sm group overflow-hidden border-border/30 hover:border-border transition-all duration-300 bg-background cursor-pointer h-full flex flex-col p-0">' +
      '<div class="relative aspect-square overflow-hidden bg-muted/20 rounded-t-lg">' +
      '<img src="' +
      escapeHtml(item.image) +
      '" alt="' +
      escapeHtml(item.title) +
      '" class="w-full h-full object-cover pointer-events-none select-none" draggable="false"/>' +
      '<div class="absolute top-1 right-1 bg-background/95 backdrop-blur-sm rounded-full px-1 py-0.5 flex items-center gap-0.5"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock h-2 w-2 sm:h-2.5 sm:w-2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><span class="text-[8px] sm:text-[9px] font-medium" data-end-time="' +
      escapeHtml(item.endTime) +
      '">' +
      getCountdown(item.endTime) +
      "</span></div></div>" +
      '<div data-slot="card-content" class="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 flex-1 flex flex-col">' +
      '<span data-slot="badge" class="inline-flex items-center justify-center rounded-md border font-medium whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden text-secondary-foreground [a&]:hover:bg-secondary/90 text-[8px] sm:text-[9px] uppercase tracking-wider bg-muted/50 border-border/50 px-1 py-0.5 w-fit">' +
      escapeHtml(item.category || "General") +
      "</span>" +
      '<h3 class="font-serif text-[10px] sm:text-xs leading-tight line-clamp-2 h-[28px] sm:h-[32px]">' +
      escapeHtml(item.title) +
      '</h3><div class="flex items-center gap-0.5 sm:gap-1 py-0.5 sm:py-1 px-1 sm:px-1.5 bg-muted/30 rounded text-[9px] sm:text-[10px] font-medium"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg><div class="flex items-center gap-0.5 sm:gap-1 tabular-nums"><span class="font-semibold" data-end-time="' +
      escapeHtml(item.endTime) +
      '">' +
      getCountdown(item.endTime) +
      '</span></div></div><div><p class="text-[8px] sm:text-[9px] text-muted-foreground uppercase tracking-wider">Current Bid</p><p class="text-xs sm:text-sm font-semibold tabular-nums">' +
      formatCurrency(item.currentBid) +
      '</p></div><button data-slot="button" class="inline-flex items-center justify-center whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*=\'size-\'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border shadow-xs dark:bg-input/30 dark:border-input dark:hover:bg-input/50 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full hover:bg-foreground hover:text-background transition-colors bg-transparent text-[9px] sm:text-[10px] h-6 sm:h-7 mt-auto">View Auction</button></div></div></a>'
    );
  }

  function getStatus(item) {
    var s = String(item.status || "").toLowerCase();
    if (s === "ended" || s === "closed" || s === "sold") return "closed";
    var diff = new Date(item.endTime).getTime() - Date.now();
    if (!Number.isFinite(diff) || diff <= 0) return "closed";
    if (diff <= 48 * 60 * 60 * 1000) return "ending-soon";
    return "active";
  }

  function getTopLevelCategory(item) {
    var rawCategory = String(item.category || "").toLowerCase();
    var haystack = (String(item.title || "") + " " + rawCategory).toLowerCase();

    if (
      rawCategory === "watches" ||
      rawCategory === "rolex" ||
      rawCategory === "patek philippe" ||
      rawCategory === "cartier" ||
      rawCategory === "audemars piguet" ||
      rawCategory === "vacheron constantin" ||
      haystack.includes("watch")
    ) {
      return "watches";
    }

    if (
      rawCategory === "handbag" ||
      rawCategory === "hermès" ||
      rawCategory === "chanel" ||
      rawCategory === "louis vuitton" ||
      rawCategory === "goyard" ||
      rawCategory === "apparel" ||
      rawCategory === "precious accessory" ||
      rawCategory === "sneaker" ||
      haystack.includes("bag") ||
      haystack.includes("birkin") ||
      haystack.includes("kelly") ||
      haystack.includes("handbag") ||
      haystack.includes("wallet") ||
      haystack.includes("sneaker")
    ) {
      return "bags-fashion";
    }

    if (
      rawCategory === "earring" ||
      rawCategory === "ring" ||
      rawCategory === "bracelet" ||
      rawCategory === "necklace" ||
      rawCategory === "brooch" ||
      rawCategory === "jewelry" ||
      haystack.includes("earring") ||
      haystack.includes("earclip") ||
      haystack.includes("ring") ||
      haystack.includes("bracelet") ||
      haystack.includes("necklace") ||
      haystack.includes("brooch") ||
      haystack.includes("diamond") ||
      haystack.includes("sapphire")
    ) {
      return "jewelry";
    }

    if (
      rawCategory === "spirits" ||
      rawCategory === "weller" ||
      rawCategory === "van winkle" ||
      rawCategory === "old fitzgerald" ||
      rawCategory === "george t. stagg" ||
      rawCategory === "four roses" ||
      rawCategory === "elijah craig" ||
      rawCategory === "elmer t." ||
      rawCategory === "sazerac" ||
      haystack.includes("whisky") ||
      haystack.includes("whiskey") ||
      haystack.includes("bourbon") ||
      haystack.includes("scotch")
    ) {
      return "spirits";
    }

    if (
      rawCategory === "books & manuscripts" ||
      rawCategory === "pen" ||
      haystack.includes("manuscript") ||
      haystack.includes("book") ||
      haystack.includes("edition") ||
      haystack.includes("harry potter") ||
      haystack.includes("bond")
    ) {
      return "collectibles-more";
    }

    if (
      rawCategory === "collectible" ||
      rawCategory === "vintage poster" ||
      rawCategory === "photographs" ||
      rawCategory === "decor" ||
      haystack.includes("poster") ||
      haystack.includes("collectible") ||
      haystack.includes("record") ||
      haystack.includes("t-shirt") ||
      haystack.includes("movie") ||
      haystack.includes("photograph")
    ) {
      return "collectibles-more";
    }

    if (
      rawCategory === "painting" ||
      rawCategory === "work on paper" ||
      rawCategory === "sculpture" ||
      haystack.includes("painting") ||
      haystack.includes("canvas") ||
      haystack.includes("oil on") ||
      haystack.includes("watercolor") ||
      haystack.includes("sculpture")
    ) {
      return "fine-art";
    }

    if (haystack.includes("abstract") || haystack.includes("contemporary")) {
      return "contemporary-art";
    }

    if (rawCategory === "decor" || haystack.includes("chair") || haystack.includes("furniture") || haystack.includes("lamp")) {
      return "furniture-decor";
    }

    return "collectibles-more";
  }

  function updateCountdowns(scope) {
    scope.querySelectorAll("[data-end-time]").forEach(function (node) {
      node.textContent = getCountdown(node.getAttribute("data-end-time"));
    });
  }

  function sortItemsByEndTime(items) {
    return (Array.isArray(items) ? items.slice() : []).sort(function (a, b) {
      var aTime = new Date(a && (a.endTime || a.end_time) || "").getTime();
      var bTime = new Date(b && (b.endTime || b.end_time) || "").getTime();
      if (!Number.isFinite(aTime) && !Number.isFinite(bTime)) return 0;
      if (!Number.isFinite(aTime)) return 1;
      if (!Number.isFinite(bTime)) return -1;
      return aTime - bTime;
    });
  }

  function filterWatchItems(items) {
    return (Array.isArray(items) ? items : []).filter(function (item) {
      return getTopLevelCategory(item) === "watches";
    });
  }

  function renderFeatured(items, fallbackItems) {
    var main = document.querySelector("main.flex-1");
    if (!main) return;
    var featuredItems = takeUnique(filterWatchItems(filterActiveItems(items)), 8);
    var fallbackFeaturedItems = takeUnique(
      featuredItems.concat(sortItemsByEndTime(filterWatchItems(filterActiveItems(fallbackItems)))),
      8
    );

    var howItWorksHeading = Array.from(main.querySelectorAll("h2")).find(function (node) {
      return node.textContent.trim() === "How It Works";
    });
    var howItWorksSection = howItWorksHeading && howItWorksHeading.closest("section");
    if (!howItWorksSection) return;

    var existingHeading = Array.from(main.querySelectorAll("h2")).find(function (node) {
      return node.textContent.trim() === "Featured Auctions";
    });
    var existingSection = existingHeading && existingHeading.closest("section");

    if (!existingSection) {
      howItWorksSection.insertAdjacentHTML(
        "beforebegin",
        '<section class="py-8 sm:py-12 lg:py-16 bg-background" data-featured-auctions-section="true">' +
          '<div class="container mx-auto px-4 sm:px-6 lg:px-8">' +
            '<div class="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">' +
              '<div class="w-full sm:w-auto">' +
                '<h2 class="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif mb-1 sm:mb-2 text-balance">Featured Auctions</h2>' +
                '<p class="text-xs sm:text-sm md:text-base text-muted-foreground">Curated Selection of Exceptional Pieces</p>' +
              "</div>" +
              '<a class="text-xs sm:text-sm font-medium hover:underline underline-offset-4 flex items-center gap-1 transition-all whitespace-nowrap" href="auctions.html">View All<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right h-3 w-3 sm:h-4 sm:w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg></a>' +
            '</div>' +
            '<div class="flex gap-3 sm:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory" style="scrollbar-width:none;-ms-overflow-style:none"></div>' +
          "</div>" +
        "</section>"
      );
      existingSection = howItWorksSection.previousElementSibling;
    }

    existingSection.className = "py-8 sm:py-12 lg:py-16 bg-background";

    var row =
      existingSection &&
      existingSection.querySelector('.flex.gap-3.sm\\:gap-4.overflow-x-auto.pb-4.scrollbar-hide.snap-x.snap-mandatory');
    if (!row) return;

    if (!fallbackFeaturedItems.length) {
      existingSection.style.display = "none";
      return;
    }

    existingSection.style.display = "";

    row.innerHTML = fallbackFeaturedItems
      .map(function (item) {
        return '<div class="flex-shrink-0 w-[240px] md:w-[260px] snap-start">' + renderCard(item) + "</div>";
      })
      .join("");

    updateCountdowns(row);
  }

  function takeUnique(items, limit) {
    var seen = new Set();
    return items.filter(function (item) {
      if (!item || !item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).slice(0, limit);
  }

  function filterActiveItems(items) {
    return (Array.isArray(items) ? items : []).filter(function (item) {
      return getStatus(item) !== "closed";
    });
  }

  function pickLandingSectionItems(items, headingText) {
    var normalizedHeading = headingText.toLowerCase();
    var allItems = Array.isArray(items) ? items : [];
    var remoteSources = arguments[2] || {};

    function pickByMatcher(matcher, limit) {
      var activeMatches = takeUnique(filterActiveItems(allItems).filter(matcher), limit);
      if (activeMatches.length) return activeMatches;
      return takeUnique(allItems.filter(matcher), limit);
    }

    if (normalizedHeading === "watches") {
      if (Array.isArray(remoteSources.watches) && remoteSources.watches.length) return remoteSources.watches.slice(0, 10);
      return pickByMatcher(function (item) {
          var haystack = (item.title + " " + item.category).toLowerCase();
          return haystack.includes("watch") || item.category === "Watches";
        }, 10);
    }

    if (normalizedHeading === "handbag") {
      if (Array.isArray(remoteSources.handbag) && remoteSources.handbag.length) return remoteSources.handbag.slice(0, 10);
      return pickByMatcher(function (item) {
          var haystack = (item.title + " " + item.category).toLowerCase();
          return (
            haystack.includes("bag") ||
            haystack.includes("birkin") ||
            haystack.includes("kelly") ||
            haystack.includes("flap") ||
            haystack.includes("handbag") ||
            item.category === "Handbag" ||
            item.category === "Hermès" ||
            item.category === "Chanel" ||
            item.category === "Louis Vuitton"
          );
        }, 10);
    }

    if (normalizedHeading === "earring") {
      if (Array.isArray(remoteSources.earring) && remoteSources.earring.length) return remoteSources.earring.slice(0, 10);
      return pickByMatcher(function (item) {
          var haystack = (item.title + " " + item.category).toLowerCase();
          return haystack.includes("earring") || haystack.includes("earclip") || item.category === "Earring";
        }, 10);
    }

    if (normalizedHeading === "books & manuscripts") {
      if (Array.isArray(remoteSources.books) && remoteSources.books.length) return remoteSources.books.slice(0, 10);
      return pickByMatcher(function (item) {
          return item.category === "Books & Manuscripts";
        }, 10);
    }

    if (normalizedHeading === "collectible") {
      if (Array.isArray(remoteSources.collectible) && remoteSources.collectible.length) return remoteSources.collectible.slice(0, 10);
      return pickByMatcher(function (item) {
          return item.category === "Collectible";
        }, 10);
    }

    return [];
  }

  function renderLandingCategorySections(items, remoteSources) {
    var headings = Array.from(document.querySelectorAll("h2"));

    headings.forEach(function (heading) {
      var headingText = heading.textContent.trim();
      var sectionItems = pickLandingSectionItems(items, headingText, remoteSources);
      if (!sectionItems.length) return;

      var section = heading.closest("section");
      var subtitle = section && section.querySelector("p");
      var row =
        section &&
        section.querySelector('.flex.gap-3.sm\\:gap-4.overflow-x-auto.pb-4.scrollbar-hide.snap-x.snap-mandatory');

      if (!section || !row || !subtitle) return;
      if (subtitle.textContent.trim() !== "Explore our curated collections") return;

      row.innerHTML = sectionItems
        .map(function (item) {
          return '<div class="flex-shrink-0 w-[240px] md:w-[260px] snap-start">' + renderCard(item) + "</div>";
        })
        .join("");
    });
  }

  function fetchRemoteClosedLotIds() {
    // Fetch IDs of lots that exist in Supabase but are closed/sold or expired
    // Used to exclude those from the local JSON catalog
    return requestRemoteSupabase(
      "/rest/v1/lots?select=id,status,end_time&limit=1000"
    ).then(function (lots) {
      if (!Array.isArray(lots)) return new Set();
      var now = Date.now();
      var closedIds = new Set();
      lots.forEach(function (lot) {
        var s = String(lot.status || "").toLowerCase();
        var expired = lot.end_time && new Date(lot.end_time).getTime() <= now;
        if (s === "closed" || s === "sold" || expired) {
          closedIds.add(lot.id);
        }
      });
      return closedIds;
    }).catch(function () { return new Set(); });
  }

  function fetchRemoteActiveWhiskeyItems() {
    var whiskeyCategoryIds = [
      "bb1502a0-4c07-4cd8-9a18-9ae024ffe94c",
      "20890301-f0f1-404f-b303-d3d25c301610",
      "1b8ef0ea-838d-4737-a7b2-7faccf369504",
      "81c6a96d-0a01-486e-b8f2-1d9b845a7010",
      "46552fce-692b-4dcd-a95d-8de0bedefff2",
      "002b85af-f997-46b7-9d4c-477fd6d0e131",
      "51583006-74f2-41b4-b951-76c4c034dea9",
      "4adfb3a1-4948-4abc-b967-da7a33b4dfa8",
      "381105e0-5b02-43f8-8bcc-b62faf3b51f6",
    ];
    var now = new Date().toISOString();

    return requestRemoteSupabase(
      "/rest/v1/lots?select=id,slug,title,current_bid,end_time,category_id" +
        "&category_id=in.(" +
        whiskeyCategoryIds.join(",") +
        ")" +
        "&end_time=gt." +
        encodeURIComponent(now) +
        "&status=not.in.(closed,sold)" +
        "&order=end_time.asc&limit=12"
    ).then(function (lots) {
      if (!Array.isArray(lots) || !lots.length) return [];

      var lotIds = lots.map(function (item) {
        return item.id;
      });

      return Promise.all([
        requestRemoteSupabase(
          "/rest/v1/lot_images?select=lot_id,image_url,is_primary,order_position" +
            "&lot_id=in.(" +
            lotIds.join(",") +
            ")" +
            "&order=lot_id.asc&order=is_primary.desc&order=order_position.asc"
        ),
        requestRemoteSupabase(
          "/rest/v1/categories?select=id,name&or=(id.in.(" + whiskeyCategoryIds.join(",") + "))"
        ),
      ]).then(function (results) {
        var images = results[0];
        var categories = results[1];
        var imageMap = new Map();
        var categoryMap = new Map();

        categories.forEach(function (category) {
          categoryMap.set(category.id, category.name);
        });

        images.forEach(function (image) {
          if (!imageMap.has(image.lot_id)) {
            imageMap.set(image.lot_id, image.image_url);
          }
        });

        return lots.map(function (lot) {
          return {
            id: lot.id,
            slug: lot.slug,
            title: lot.title,
            image: imageMap.get(lot.id) || "logo1.svg",
            currentBid: lot.current_bid,
            endTime: lot.end_time,
            category: categoryMap.get(lot.category_id) || "Spirits",
          };
        });
      });
    });
  }

  function fetchRemoteActiveCategoryItems(categoryIds, matcher, limit) {
    var now = new Date().toISOString();

    return requestRemoteSupabase(
      "/rest/v1/lots?select=id,slug,title,current_bid,end_time,status,category_id" +
        "&category_id=in.(" +
        categoryIds.join(",") +
        ")" +
        "&end_time=gt." +
        encodeURIComponent(now) +
        "&status=not.in.(closed,sold)" +
        "&order=end_time.asc&limit=60"
    ).then(function (lots) {
      var filteredLots = (Array.isArray(lots) ? lots : []).filter(function (lot) {
        return typeof matcher === "function" ? matcher(lot) : true;
      }).slice(0, limit || 10);

      if (!filteredLots.length) return [];

      var lotIds = filteredLots.map(function (item) {
        return item.id;
      });

      return Promise.all([
        requestRemoteSupabase(
          "/rest/v1/lot_images?select=lot_id,image_url,is_primary,order_position" +
            "&lot_id=in.(" +
            lotIds.join(",") +
            ")" +
            "&order=lot_id.asc&order=is_primary.desc&order=order_position.asc"
        ),
        requestRemoteSupabase("/rest/v1/categories?select=id,name&id=in.(" + categoryIds.join(",") + ")"),
      ]).then(function (results) {
        var images = results[0];
        var categories = results[1];
        var imageMap = new Map();
        var categoryMap = new Map();

        categories.forEach(function (category) {
          categoryMap.set(category.id, category.name);
        });

        images.forEach(function (image) {
          if (!imageMap.has(image.lot_id)) {
            imageMap.set(image.lot_id, image.image_url);
          }
        });

        return filteredLots.map(function (lot) {
          return {
            id: lot.id,
            slug: lot.slug,
            title: lot.title,
            image: imageMap.get(lot.id) || "logo1.svg",
            currentBid: lot.current_bid,
            endTime: lot.end_time,
            category: categoryMap.get(lot.category_id) || "General",
          };
        });
      });
    });
  }

  function pickCollectionLandingItems(items, headingText, remoteSources) {
    var normalizedHeading = headingText.toLowerCase();
    var activeItems = filterActiveItems(items);
    var allItems = Array.isArray(items) ? items : [];
    var sources = remoteSources || {};

    function pickByMatcher(matcher, limit) {
      var activeMatches = takeUnique(activeItems.filter(matcher), limit);
      if (activeMatches.length) return activeMatches;
      return takeUnique(allItems.filter(matcher), limit);
    }

    if (normalizedHeading === "the great whiskey collection") {
      if (Array.isArray(sources.whiskey) && sources.whiskey.length) {
        return sources.whiskey.slice(0, 12);
      }
      return pickByMatcher(function (item) {
          return getTopLevelCategory(item) === "spirits";
        }, 12);
    }

    if (normalizedHeading === "the winter edit: icons of luxury") {
      return pickByMatcher(function (item) {
          var topLevel = getTopLevelCategory(item);
          return topLevel === "bags-fashion" || topLevel === "jewelry" || topLevel === "watches";
        }, 12);
    }

    return [];
  }

  function renderCollectionLandingSections(items, remoteSources) {
    var sections = Array.from(document.querySelectorAll("section"));

    sections.forEach(function (section) {
      var heading = section.querySelector("h2");
      var headingText = heading ? heading.textContent.trim() : "";
      var viewAllLink = section.querySelector('a[href$="collections/the-great-whiskey-collection.html"], a[href$="collections/the-winter-edit-icons-of-luxury.html"]');
      var sectionItems = pickCollectionLandingItems(items, headingText, remoteSources);

      if (!sectionItems.length && viewAllLink) {
        if (viewAllLink.getAttribute("href").indexOf("the-great-whiskey-collection") !== -1) {
          sectionItems = pickCollectionLandingItems(items, "The Great Whiskey Collection", remoteSources);
        } else if (viewAllLink.getAttribute("href").indexOf("the-winter-edit-icons-of-luxury") !== -1) {
          sectionItems = pickCollectionLandingItems(items, "The Winter Edit: Icons of Luxury", remoteSources);
        }
      }

      if (!sectionItems.length) return;

      var stack = section && section.querySelector(".space-y-8");
      if (!section || !stack) return;

      var existingRow = stack.querySelector("[data-home-collection-row]");
      if (!existingRow) {
        stack.insertAdjacentHTML(
          "beforeend",
          '<div data-home-collection-row="true">' +
            '<div class="overflow-x-auto pb-4 -mx-4 px-4">' +
              '<div class="flex gap-3 min-w-max"></div>' +
            "</div>" +
          "</div>"
        );
        existingRow = stack.querySelector("[data-home-collection-row]");
      }

      var row = existingRow && existingRow.querySelector(".flex.gap-3.min-w-max");
      if (!row) return;

      row.innerHTML = sectionItems
        .map(function (item) {
          return '<div class="w-[200px] sm:w-[220px] flex-shrink-0">' + renderCard(item) + "</div>";
        })
        .join("");

      updateCountdowns(row);
    });
  }

  function renderShopAll(items, meta, categoriesData) {
    var loadingText = Array.from(document.querySelectorAll("p")).find(function (node) {
      return node.textContent.trim() === "Loading auctions...";
    });
    if (!loadingText) return;

    var resultsSection = loadingText.closest("section");
    if (!resultsSection) return;

    var controlsSection = resultsSection.previousElementSibling;
    if (!controlsSection) return;

    var state = {
      category: "all",
      status: "active",
      sortBy: "featured",
      page: 1,
      perPage: 24,
    };

    function getFilteredItems() {
      var filtered = items.slice();

      filtered = filtered.filter(function (item) {
        var status = getStatus(item);
        if (state.status === "ending-soon") return status === "ending-soon";
        if (state.status === "closed") return status === "closed";
        return status !== "closed";
      });

      if (state.category !== "all") {
        filtered = filtered.filter(function (item) {
          return getTopLevelCategory(item) === state.category;
        });
      }

      if (state.sortBy !== "featured") {
        filtered.sort(function (a, b) {
          if (state.sortBy === "ending-soon") return new Date(a.endTime) - new Date(b.endTime);
          if (state.sortBy === "price-low") return a.currentBid - b.currentBid;
          if (state.sortBy === "price-high") return b.currentBid - a.currentBid;
          if (state.sortBy === "newly-listed") return new Date(b.endTime) - new Date(a.endTime);
          return 0;
        });
      }

      return filtered;
    }

    function renderControls(filteredItems, totalPages) {
      var categories = (categoriesData || [])
        .filter(function (category) {
          return category && category.slug && category.name;
        })
        .map(function (category) {
          return { slug: category.slug, name: category.name };
        });

      var visibleCount = state.category === "all" && state.status === "active" ? meta.total : filteredItems.length;

      controlsSection.innerHTML =
        '<div class="container mx-auto px-4 lg:px-8 py-6">' +
        '<div class="flex flex-col gap-4">' +
        '<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">' +
        '<p class="text-sm text-muted-foreground"><span id="shop-count">' +
        visibleCount +
        "</span> active auctions</p>" +
        '<div class="flex flex-wrap gap-3">' +
        '<label class="sr-only" for="shop-status">Status</label>' +
        '<select id="shop-status" class="border-input bg-background ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm w-[160px]">' +
        '<option value="active">Active</option>' +
        '<option value="ending-soon">Ending Soon</option>' +
        '<option value="closed">Closed</option>' +
        "</select>" +
        '<label class="sr-only" for="shop-category">Category</label>' +
        '<select id="shop-category" class="border-input bg-background ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm w-[180px]">' +
        '<option value="all">All Categories</option>' +
        categories
          .map(function (category) {
            return '<option value="' + escapeHtml(category.slug) + '">' + escapeHtml(category.name) + "</option>";
          })
          .join("") +
        "</select>" +
        '<label class="sr-only" for="shop-sort">Sort</label>' +
        '<select id="shop-sort" class="border-input bg-background ring-offset-background flex h-10 items-center justify-between rounded-md border px-3 py-2 text-sm w-[180px]">' +
        '<option value="featured">Featured</option>' +
        '<option value="ending-soon">Ending Soon</option>' +
        '<option value="newly-listed">Ending Latest</option>' +
        '<option value="price-low">Price: Low to High</option>' +
        '<option value="price-high">Price: High to Low</option>' +
        "</select>" +
        "</div></div>" +
        '<div class="flex items-center gap-2 flex-wrap text-sm text-muted-foreground">' +
        "<span>Page</span>" +
        '<span class="inline-flex items-center rounded-md border px-2.5 py-1">' +
        state.page +
        " / " +
        totalPages +
        "</span></div></div></div>";

      controlsSection.querySelector("#shop-status").value = state.status;
      controlsSection.querySelector("#shop-category").value = state.category;
      controlsSection.querySelector("#shop-sort").value = state.sortBy;

      controlsSection.querySelector("#shop-status").addEventListener("change", function (event) {
        state.status = event.target.value;
        state.page = 1;
        render();
      });

      controlsSection.querySelector("#shop-category").addEventListener("change", function (event) {
        state.category = event.target.value;
        state.page = 1;
        render();
      });

      controlsSection.querySelector("#shop-sort").addEventListener("change", function (event) {
        state.sortBy = event.target.value;
        state.page = 1;
        render();
      });
    }

    function renderResults(filteredItems, totalPages) {
      var startIndex = (state.page - 1) * state.perPage;
      var pageItems = filteredItems.slice(startIndex, startIndex + state.perPage);
      var endIndex = Math.min(startIndex + state.perPage, filteredItems.length);

      resultsSection.innerHTML =
        '<div class="container mx-auto px-4 lg:px-8">' +
        '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">' +
        pageItems.map(renderCard).join("") +
        "</div>" +
        '<div class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t">' +
        '<p class="text-sm text-muted-foreground">Showing ' +
        (filteredItems.length ? startIndex + 1 : 0) +
        "-" +
        endIndex +
        " of " +
        filteredItems.length +
        "</p>" +
        '<div class="flex items-center gap-2">' +
        '<button id="shop-prev" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-transparent h-9 px-3 disabled:opacity-40 disabled:pointer-events-none">Previous</button>' +
        '<span class="text-sm text-muted-foreground min-w-[100px] text-center">Page ' +
        state.page +
        " of " +
        totalPages +
        "</span>" +
        '<button id="shop-next" class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-transparent h-9 px-3 disabled:opacity-40 disabled:pointer-events-none">Next</button>' +
        "</div></div></div>";

      resultsSection.querySelector("#shop-prev").disabled = state.page <= 1;
      resultsSection.querySelector("#shop-next").disabled = state.page >= totalPages;

      resultsSection.querySelector("#shop-prev").addEventListener("click", function () {
        if (state.page > 1) {
          state.page -= 1;
          render();
        }
      });

      resultsSection.querySelector("#shop-next").addEventListener("click", function () {
        if (state.page < totalPages) {
          state.page += 1;
          render();
        }
      });

      updateCountdowns(resultsSection);
    }

    function render() {
      var filteredItems = getFilteredItems();
      var totalPages = Math.max(1, Math.ceil(filteredItems.length / state.perPage));
      if (state.page > totalPages) state.page = totalPages;
      renderControls(filteredItems, totalPages);
      renderResults(filteredItems, totalPages);
    }

    render();
  }

  Promise.all([
    loadJson("data/featured-lots.json"),
    loadJson("data/all-shop-lots.json"),
    loadJson("data/shop-all-meta.json"),
    loadJson("data/categories.json"),
  ])
    .then(async function (results) {
      var remoteSources = {
        whiskey: [],
        watches: [],
        handbag: [],
        earring: [],
        collectible: [],
        books: [],
      };
      try {
        var remoteResults = await Promise.allSettled([
          fetchRemoteActiveWhiskeyItems(),
          fetchRemoteActiveCategoryItems(["9a4cd4f7-6b24-4183-b263-a25bded0e362"], null, 10),
          fetchRemoteActiveCategoryItems(
            ["ea511401-37c0-4768-add7-7d4738adb260", "173a1db8-0a95-4114-9cb3-6862c28c2835", "d475b83f-4a59-4394-8819-a53b8f5141c8", "74a6e0fb-fd62-4835-8b08-eb61bdb09593", "bced8a59-788a-447a-89e6-4c8f66ec9de3"],
            null,
            10
          ),
          fetchRemoteActiveCategoryItems(
            ["52754627-1fbd-49e4-bc59-7abfb352c762", "575c9b4d-7f9c-42c0-b79d-e128f6ce3534"],
            function (lot) {
              var haystack = String(lot.title || "").toLowerCase();
              return haystack.includes("earring") || haystack.includes("earclip");
            },
            10
          ),
          fetchRemoteActiveCategoryItems(["3a8bf043-dc55-4e87-87e2-f7c368995ef2"], null, 10),
          fetchRemoteActiveCategoryItems(["e5d6928f-845c-464e-b77b-0ee67f552a20"], null, 10),
        ]);

        remoteSources.whiskey = remoteResults[0].status === "fulfilled" ? remoteResults[0].value : [];
        remoteSources.watches = remoteResults[1].status === "fulfilled" ? remoteResults[1].value : [];
        remoteSources.handbag = remoteResults[2].status === "fulfilled" ? remoteResults[2].value : [];
        remoteSources.earring = remoteResults[3].status === "fulfilled" ? remoteResults[3].value : [];
        remoteSources.collectible = remoteResults[4].status === "fulfilled" ? remoteResults[4].value : [];
        remoteSources.books = remoteResults[5].status === "fulfilled" ? remoteResults[5].value : [];
      } catch (error) {
        console.error("Remote landing fetch failed:", error);
      }

      renderFeatured(results[0], results[1]);
      renderLandingCategorySections(results[1], remoteSources);
      renderCollectionLandingSections(results[1], remoteSources);
      renderShopAll(results[1], results[2], results[3]);
      setInterval(function () {
        updateCountdowns(document);
      }, 1000);
    })
    .catch(function (error) {
      console.error("Catalog render failed:", error);
    });
})();
