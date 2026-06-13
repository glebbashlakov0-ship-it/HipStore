(function () {
  function currentSlug() {
    var file = window.location.pathname.split("/").pop() || "";
    return file.replace(/\.html$/i, "");
  }

  function targetForSlug(slug) {
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
