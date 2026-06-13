(function () {
  "use strict";

  function clean(value) {
    return String(value || "").trim();
  }

  function toName(slug) {
    return clean(slug)
      .replace(/\/+$/g, "")
      .split("/")
      .filter(Boolean)
      .pop()
      .replace(/-/g, " ");
  }

  function productSlugFromPath(pathname) {
    var match = pathname.match(/^\/product\/([^/]+)\/([^/]+)\/?/i);
    if (!match) return "";
    return match[1] + "-" + match[2];
  }

  function searchFromUrl(url) {
    var params = url.searchParams;
    return (
      params.get("q") ||
      params.get("search") ||
      params.get("query") ||
      params.get("facet-campaign") ||
      params.get("facet:new") ||
      params.get("facet-new") ||
      ""
    );
  }

  function mapLocalHref(rawHref) {
    var href = clean(rawHref);
    if (!href || href === "#" || href.indexOf("javascript:") === 0 || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) {
      return href;
    }

    var url;
    try {
      url = new URL(href, window.location.origin);
    } catch (_error) {
      return href;
    }

    var host = url.hostname.toLowerCase();
    var path = url.pathname.toLowerCase();
    var localPath = url.pathname.replace(/^\//, "") + url.search + url.hash;
    if (host === window.location.hostname && /^(index|shop|collections|about|contact|faq|shipping|buying-guide|login|register|account|privacy|terms|cookie-policy|accessibility)\.html/i.test(localPath)) {
      return localPath;
    }
    if (host === window.location.hostname && /^(product|checkout)\/index\.html/i.test(localPath)) {
      return localPath;
    }

    var isHip = !host || host === window.location.hostname || host.indexOf("thehipstore.co.uk") !== -1;
    var isApp = host.indexOf("itunes.apple.com") !== -1 || host.indexOf("play.google.com") !== -1 || host.indexOf("hip.onelink.me") !== -1;

    if (!isHip && !isApp) return "contact.html";
    if (isApp) return "shop.html";

    var productSlug = productSlugFromPath(path);
    if (productSlug) return "product/index.html?slug=" + encodeURIComponent(productSlug);

    if (path === "/" || path === "/index.html") return "index.html";
    if (path.indexOf("/cart") === 0 || path.indexOf("/checkout") === 0 || path.indexOf("/basket") === 0) return "checkout/index.html";
    if (path.indexOf("/login") === 0 || path.indexOf("/account/login") === 0) return "login.html";
    if (path.indexOf("/register") === 0) return "register.html";
    if (path.indexOf("/myaccount") === 0 || path.indexOf("/account") === 0 || path.indexOf("/track-my-order") === 0) return "account.html";

    if (path.indexOf("/customer-service/contact") === 0 || path.indexOf("/store") === 0) return "contact.html";
    if (path.indexOf("/customer-service/delivery") === 0 || path.indexOf("/customer-service/returns") === 0) return "shipping.html";
    if (path.indexOf("/customer-service/privacy") === 0) return "privacy.html";
    if (path.indexOf("/customer-service/terms") === 0) return "terms.html";
    if (path.indexOf("/customer-service/cookies") === 0) return "cookie-policy.html";
    if (path.indexOf("/pages/faqs") === 0 || path.indexOf("/faq") === 0) return "faq.html";
    if (path.indexOf("/customer-service") === 0 || path.indexOf("/page/") === 0) return "about.html";

    if (path.indexOf("/sale") === 0 || path.indexOf("/sale/") !== -1) return "shop.html?sale=1";
    if (path.indexOf("/brands") === 0) return "collections.html";
    if (path.indexOf("/brand/") === 0 || path.indexOf("/mens/brand/") === 0 || path.indexOf("/womens/brand/") === 0) {
      return "shop.html?brand=" + encodeURIComponent(toName(path));
    }
    if (path.indexOf("/products/search") === 0 || path.indexOf("/search") === 0 || path.indexOf("/campaign/") === 0) {
      return "shop.html?search=" + encodeURIComponent(searchFromUrl(url) || toName(path) || "latest");
    }
    if (path.indexOf("/latest") === 0 || path.indexOf("/new-in") === 0 || path.indexOf("/new") === 0) return "shop.html?sort=newest";
    if (path.indexOf("/mens") === 0 || path.indexOf("/men") === 0) {
      if (path.indexOf("/footwear") !== -1) return "shop.html?category=Footwear";
      if (path.indexOf("/clothing") !== -1) return "shop.html?category=Clothing";
      if (path.indexOf("/accessories") !== -1) return "shop.html?category=Accessories";
      return "shop.html?category=Mens";
    }
    if (path.indexOf("/womens") === 0 || path.indexOf("/women") === 0) {
      if (path.indexOf("/footwear") !== -1) return "shop.html?category=Footwear";
      if (path.indexOf("/clothing") !== -1) return "shop.html?category=Clothing";
      if (path.indexOf("/accessories") !== -1) return "shop.html?category=Accessories";
      return "shop.html?category=Womens";
    }
    if (path.indexOf("/accessories") === 0) return "shop.html?category=Accessories";
    if (path.indexOf("/footwear") === 0) return "shop.html?category=Footwear";
    if (path.indexOf("/clothing") === 0) return "shop.html?category=Clothing";
    if (path.indexOf("/living") === 0) return "shop.html?search=Living";

    return "shop.html";
  }

  function localizeLinks() {
    Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (anchor) {
      var mapped = mapLocalHref(anchor.getAttribute("href"));
      if (mapped) anchor.setAttribute("href", mapped);
      if (/^(shop|product|checkout|login|register|account|collections|about|contact|faq|shipping|privacy|terms|cookie-policy|accessibility|index)\.html|^checkout\//.test(mapped)) {
        anchor.removeAttribute("target");
        anchor.removeAttribute("rel");
      }
    });
  }

  function isLocalRoute(href) {
    return /^(index|shop|collections|about|contact|faq|shipping|buying-guide|login|register|account|privacy|terms|cookie-policy|accessibility)\.html/i.test(href) ||
      /^(product|checkout)\/index\.html/i.test(href);
  }

  function patchAnchorClicks() {
    document.addEventListener("click", function (event) {
      var anchor = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (!anchor) return;
      var mapped = mapLocalHref(anchor.getAttribute("href"));
      if (!mapped || !isLocalRoute(mapped)) return;
      event.preventDefault();
      event.stopPropagation();
      window.location.href = mapped;
    }, true);
  }

  function patchSearchForms() {
    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!form || !form.querySelector) return;
      var input = form.querySelector('input[type="search"], input[name="q"], input[name="search"], input[placeholder*="Search" i]');
      if (!input) return;
      event.preventDefault();
      var query = clean(input.value);
      window.location.href = query ? "shop.html?search=" + encodeURIComponent(query) : "shop.html";
    }, true);
  }

  function installLayoutCss() {
    if (document.getElementById("hip-local-original-style")) return;
    var style = document.createElement("style");
    style.id = "hip-local-original-style";
    style.textContent = [
      "html,body{margin:0!important;overflow-x:hidden!important;}",
      "img{max-width:100%;}",
      "@media (min-width:766px){html,body{width:100%!important;max-width:none!important;min-width:0!important;background:#f3f3f3!important;}#main{position:relative!important;left:auto!important;right:auto!important;width:100%!important;max-width:960px!important;margin-left:auto!important;margin-right:auto!important;transform:none!important;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.04);}}",
      ".product-spotlight__body .swiper-wrapper,.logo-list .swiper-wrapper{transform:none!important;}",
      ".product-spotlight__product{flex:0 0 calc((100% - 48px)/4)!important;width:auto!important;max-width:none!important;}",
      "@media (max-width:765px){html,body{width:100%!important;max-width:none!important;min-width:0!important;background:#fff!important;}#main{left:auto!important;right:auto!important;width:100%!important;max-width:none!important;margin-left:0!important;margin-right:0!important;transform:none!important;box-shadow:none;}.product-spotlight__product{flex-basis:212px!important;width:212px!important;}}"
    ].join("");
    document.head.appendChild(style);
  }

  function patchAssetUrls() {
    Array.prototype.forEach.call(document.querySelectorAll("link[href], script[src], img[src], img[data-src], source[srcset]"), function (node) {
      ["href", "src", "data-src", "srcset"].forEach(function (attr) {
        var value = node.getAttribute(attr);
        if (!value) return;
        if (value.indexOf("/skins/") === 0 || value.indexOf("/language/") === 0 || value.indexOf("/favicon") === 0) {
          node.setAttribute(attr, "https://m.thehipstore.co.uk" + value);
          return;
        }
        if (value.indexOf("//") === 0) {
          node.setAttribute(attr, "https:" + value);
        }
      });
    });
  }

  function runPatches() {
    installLayoutCss();
    patchAssetUrls();
    localizeLinks();
    document.documentElement.setAttribute("data-local-original", "true");
  }

  function init() {
    var scheduled = false;
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      window.setTimeout(function () {
        scheduled = false;
        runPatches();
      }, 50);
    }

    runPatches();
    patchSearchForms();
    patchAnchorClicks();
    [250, 1000, 3000, 7000].forEach(function (delay) {
      window.setTimeout(runPatches, delay);
    });

    if (window.MutationObserver) {
      new MutationObserver(schedule).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href", "src", "data-src", "srcset"]
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
