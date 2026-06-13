(function () {
  function currentSlug() {
    var file = window.location.pathname.split("/").pop() || "";
    return file.replace(/\.html$/i, "");
  }

  var MAP = {
    accessories: "plp=accessories",
    bags: "plp=accessories-bags",
    caps: "plp=accessories-caps",
    clothing: "plp=clothing",
    footwear: "plp=footwear",
    handbags: "plp=accessories-bags",
    hats: "plp=accessories-hats",
    living: "plp=living",
    mens: "plp=mens",
    "mens-clothing": "plp=mens-clothing",
    "mens-footwear": "plp=mens-footwear",
    sale: "plp=sale",
    socks: "plp=accessories-socks",
    sunglasses: "plp=accessories-sunglasses",
    womens: "plp=womens",
    "womens-clothing": "plp=womens-clothing",
    "womens-footwear": "plp=womens-footwear",
  };

  function targetForSlug(slug) {
    if (MAP[slug]) return "../shop.html?" + MAP[slug];
    return "../shop.html";
  }

  window.location.replace(targetForSlug(currentSlug()));
})();
