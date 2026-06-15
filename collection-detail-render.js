(function () {
  function currentSlug() {
    var file = window.location.pathname.split("/").pop() || "";
    return file.replace(/\.html$/i, "");
  }

  function targetForSlug(slug) {
    var legacyTargets = {
      "fine-watches": "../shop.html?plp=accessories",
      "timepieces-of-distinction": "../shop.html?plp=accessories",
      "icons-of-swiss-watchmaking": "../shop.html?plp=accessories",
      "handbags-fashion": "../shop.html?plp=accessories-bags",
      "heritage-in-leather": "../shop.html?search=leather",
      "herm-s-birkin-collection": "../shop.html?plp=accessories-bags",
      "high-jewelry": "../shop.html?search=jewellery",
      "rare-collectible-spirits": "../shop.html?plp=living",
      "the-great-whiskey-collection": "../shop.html?plp=living",
      "parisian-icons": "../shop.html?search=paris",
      "the-winter-edit-icons-of-luxury": "../shop.html?search=winter",
      "valentine-s-curated-icons": "../shop.html?search=valentine",
    };
    if (legacyTargets[slug]) return legacyTargets[slug];
    if (slug === "last-chance" || slug === "sale") return "../shop.html?plp=sale";
    if (slug === "mens-footwear") return "../shop.html?plp=mens-footwear";
    if (slug === "womens-footwear") return "../shop.html?plp=womens-footwear";
    if (slug === "mens-clothing") return "../shop.html?plp=mens-clothing";
    if (slug === "womens-clothing") return "../shop.html?plp=womens-clothing";
    if (slug === "accessories") return "../shop.html?plp=accessories";
    if (["adidas", "asics", "carhartt-wip", "c-p-company", "new-balance", "nike", "salomon", "stone-island", "universal-works"].indexOf(slug) !== -1) {
      return "../shop.html?brand=" + encodeURIComponent(slug);
    }
    return "../shop.html?collection=" + encodeURIComponent(slug);
  }

  window.location.replace(targetForSlug(currentSlug()));
})();
