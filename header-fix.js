(() => {
  const LOGO_URL = "https://www.thehipstore.co.uk/skins/hipstoregb-mobile/public/img/logos/logo.png";
  const BAG_ICON_URL = "https://www.thehipstore.co.uk/skins/streetwear-mobile/public/img/icons/svg/icon-bag-outline.svg";
  const MENU_ICON_URL = "https://www.thehipstore.co.uk/skins/streetwear-mobile/public/img/icons/svg/icon-menu.svg";
  const ASSET_ORIGIN = "https://www.thehipstore.co.uk";
  const DEFAULT_ASSET_ORIGIN = "https://www.thehipstore.co.uk";
  const LONG_ARROW_ICON_URL = "https://www.thehipstore.co.uk/skins/hipstoregb-mobile/public/img/icons/svg/icon-arrow-long-right.svg";
  const SHOP_PAGE = "shop.html";
  const PRODUCT_PAGE = "product/index.html";
  const PLACEHOLDER_IMAGE = "placeholder.svg";
  const AUTH_EVENT = "auctio:auth-changed";
  const CATALOG_PATH = "data/products.normalized.json";
  const SEARCH_HISTORY_KEY = "hip_recent_searches";
  const CART_KEY = "hip_store_cart";
  const TRENDING_SEARCHES = [
    "adidas Spezial",
    "C.P. Company",
    "Birkenstock",
    "adidas",
    "ASICS",
    "Patta",
    "Carhartt",
    "New Balance",
  ];

  function revealShell() {
    if (!document.body) return;
    document.body.classList.remove("hip-shell-pending");
    document.body.removeAttribute("aria-busy");
  }

  function shellWaitsForRenderer() {
    return Boolean(document.body && document.body.getAttribute("data-hip-render"));
  }

  window.HipStoreRevealShell = revealShell;

  const SHOP_LINKS = [
    { label: "Shop All", href: SHOP_PAGE },
    { label: "Mens", href: SHOP_PAGE + "?plp=mens" },
    { label: "Womens", href: SHOP_PAGE + "?plp=womens" },
    { label: "Footwear", href: SHOP_PAGE + "?plp=footwear" },
    { label: "Clothing", href: SHOP_PAGE + "?plp=clothing" },
    { label: "Accessories", href: SHOP_PAGE + "?plp=accessories" },
    { label: "Sale", href: SHOP_PAGE + "?plp=sale" },
  ];
  const MOBILE_MENU_ITEMS = [
    {
      label: "Latest",
      children: [
        { label: "All Latest", href: "shop.html?plp=latest" },
        { label: "Mens New In", href: "shop.html?plp=mens-new-in" },
        { label: "Womens New In", href: "shop.html?plp=womens-new-in" },
        { label: "Latest Clothing", href: "shop.html?plp=latest-clothing" },
        { label: "Latest Footwear", href: "shop.html?plp=latest-footwear" },
        { label: "Last Sizes Available", href: "shop.html?collection=last-sizes-available" },
      ],
    },
    {
      label: "Mens",
      children: [
        { label: "All Mens", href: "shop.html?plp=mens" },
        { label: "New In", href: "shop.html?plp=mens-new-in" },
        {
          label: "Clothing",
          children: [
            { label: "Mens Jackets", href: "shop.html?plp=mens-clothing-jackets" },
            { label: "Mens Hoodies", href: "shop.html?plp=mens-clothing-hoodies" },
            { label: "Mens T-Shirts", href: "shop.html?plp=mens-clothing-t-shirts" },
            { label: "Mens Jeans", href: "shop.html?plp=mens-clothing-jeans" },
            { label: "Mens Trousers", href: "shop.html?plp=mens-clothing-trousers" },
            { label: "Mens Sweatshirts", href: "shop.html?plp=mens-clothing-sweatshirts" },
            { label: "Mens Shirts", href: "shop.html?plp=mens-clothing-shirts" },
            { label: "Mens Shorts", href: "shop.html?plp=mens-clothing-shorts" },
            { label: "All Mens Clothing", href: "shop.html?plp=mens-clothing" },
          ],
        },
        {
          label: "Footwear",
          children: [
            { label: "Mens Trainers", href: "shop.html?plp=mens-footwear-trainers" },
            { label: "Mens Boots", href: "shop.html?plp=mens-footwear-boots" },
            { label: "Mens Shoes", href: "shop.html?plp=mens-footwear-shoes" },
            { label: "Mens Sandals", href: "shop.html?plp=mens-footwear-sandals" },
            { label: "All Mens Footwear", href: "shop.html?plp=mens-footwear" },
          ],
        },
      ],
    },
    {
      label: "Womens",
      children: [
        { label: "All Womens", href: "shop.html?plp=womens" },
        { label: "New In", href: "shop.html?plp=womens-new-in" },
        { label: "Clothing", href: "shop.html?plp=womens-clothing" },
        {
          label: "Footwear",
          children: [
            { label: "Trainers", href: "shop.html?plp=womens-footwear-trainers" },
            { label: "Boots", href: "shop.html?plp=womens-footwear-boots" },
            { label: "Shoes", href: "shop.html?plp=womens-footwear-shoes" },
            { label: "Sandals", href: "shop.html?plp=womens-footwear-sandals" },
            { label: "All Womens Footwear", href: "shop.html?plp=womens-footwear" },
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
            { label: "Shop All", href: "shop.html?plp=accessories" },
            { label: "Bags", href: "shop.html?plp=accessories-bags" },
            { label: "Caps", href: "shop.html?plp=accessories-caps" },
            { label: "Hats", href: "shop.html?plp=accessories-hats" },
            { label: "Socks", href: "shop.html?plp=accessories-socks" },
            { label: "Sunglasses", href: "shop.html?plp=accessories-sunglasses" },
          ],
        },
        {
          label: "Living",
          children: [
            { label: "Shop All", href: "shop.html?plp=living" },
            { label: "Fragrance & Skincare", href: "shop.html?plp=living-fragrance" },
            { label: "Garment & Footwear Care", href: "shop.html?plp=living-care" },
            { label: "Homeware", href: "shop.html?plp=living-homeware" },
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
            { label: "Comme Des Garcons HOMME", href: "shop.html?brand=comme-des-garcons-homme" },
            { label: "Goldwin", href: "shop.html?brand=goldwin" },
            { label: "Martine Rose", href: "shop.html?brand=martine-rose" },
            { label: "Needles", href: "shop.html?brand=needles" },
            { label: "New Balance", href: "shop.html?brand=new-balance" },
            { label: "Paraboot", href: "shop.html?brand=paraboot" },
            { label: "Patta", href: "shop.html?brand=patta" },
            { label: "Power Goods", href: "shop.html?brand=power-goods" },
            { label: "Salomon", href: "shop.html?brand=salomon" },
            { label: "Stone Island", href: "shop.html?brand=stone-island" },
            { label: "Universal Works", href: "shop.html?brand=universal-works" },
            { label: "Visvim", href: "shop.html?brand=visvim" },
            { label: "YMC", href: "shop.html?brand=ymc" },
          ],
        },
        {
          label: "Style",
          children: [
            { label: "Formal", href: "shop.html?collection=formal" },
            { label: "Elevated Casual", href: "shop.html?collection=elevated-casual" },
            { label: "Everyday", href: "shop.html?collection=everyday" },
            { label: "Vacation", href: "shop.html?collection=vacation" },
            { label: "Streetwear", href: "shop.html?collection=streetwear" },
            { label: "Classics", href: "shop.html?collection=classics" },
            { label: "Luxury", href: "shop.html?collection=luxury" },
            { label: "Outdoor", href: "shop.html?collection=outdoor" },
            { label: "Approach", href: "shop.html?collection=approach" },
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
            { label: "adidas SPEZIAL", href: "shop.html?collection=adidas-spezial" },
            { label: "adidas Originals Gazelle", href: "shop.html?collection=adidas-gazelle" },
            { label: "adidas Originals Handball Spezial", href: "shop.html?collection=adidas-handball-spezial" },
            { label: "adidas Originals Japan", href: "shop.html?collection=adidas-japan" },
            { label: "adidas Originals Samba", href: "shop.html?collection=adidas-samba" },
            { label: "adidas Originals SL 72", href: "shop.html?collection=adidas-sl-72" },
            { label: "adidas Originals Stan Smith", href: "shop.html?collection=adidas-stan-smith" },
            { label: "Adidas Originals x Brain Dead", href: "shop.html?collection=adidas-brain-dead" },
            { label: "Adidas Originals x CLOT", href: "shop.html?collection=adidas-clot" },
            { label: "adidas Originals x Wales Bonner", href: "shop.html?collection=adidas-wales-bonner" },
          ],
        },
        {
          label: "ASICS",
          children: [
            { label: "ASICS GEL-DS TRAINER 14", href: "shop.html?collection=asics-gel-ds-trainer-14" },
            { label: "ASICS GEL-KAYANO", href: "shop.html?collection=asics-gel-kayano" },
            { label: "ASICS GT-2160", href: "shop.html?collection=asics-gt-2160" },
          ],
        },
        {
          label: "Birkenstock",
          children: [
            { label: "Birkenstock Boston", href: "shop.html?collection=birkenstock-boston" },
            { label: "Birkenstock Arizona", href: "shop.html?collection=birkenstock-arizona" },
          ],
        },
        {
          label: "Clarks Originals",
          children: [
            { label: "Clarks Originals Wallabee", href: "shop.html?collection=clarks-wallabee" },
            { label: "Clarks Originals Tor Hill", href: "shop.html?collection=clarks-tor-hill" },
          ],
        },
        {
          label: "New Balance",
          children: [
            { label: "New Balance Made In UK", href: "shop.html?collection=new-balance-made-in-uk" },
            { label: "New Balance Made In USA", href: "shop.html?collection=new-balance-made-in-usa" },
            { label: "New Balance 1500", href: "shop.html?collection=new-balance-1500" },
            { label: "New Balance 1906", href: "shop.html?collection=new-balance-1906" },
            { label: "New Balance 576", href: "shop.html?collection=new-balance-576" },
            { label: "New Balance 740", href: "shop.html?collection=new-balance-740" },
            { label: "New Balance 991", href: "shop.html?collection=new-balance-991" },
          ],
        },
        {
          label: "Nike",
          children: [
            { label: "Nike ACG", href: "shop.html?collection=nike-acg" },
            { label: "Nike Air Force 1", href: "shop.html?collection=nike-air-force-1" },
            { label: "Nike Air Max TL 2.5", href: "shop.html?collection=nike-air-max-tl-2-5" },
            { label: "Nike Air Rift", href: "shop.html?collection=nike-air-rift" },
            { label: "Nike Dunk", href: "shop.html?collection=nike-dunk" },
            { label: "Nike Killshot", href: "shop.html?collection=nike-killshot" },
            { label: "Nike Shox", href: "shop.html?collection=nike-shox" },
          ],
        },
        {
          label: "Paraboot",
          children: [
            { label: "Paraboot Michael", href: "shop.html?collection=paraboot-michael" },
            { label: "Paraboot Montana", href: "shop.html?collection=paraboot-montana" },
          ],
        },
        {
          label: "Puma",
          children: [
            { label: "PUMA Mostro", href: "shop.html?collection=puma-mostro" },
            { label: "PUMA Speedcat", href: "shop.html?collection=puma-speedcat" },
            { label: "Puma x Noah", href: "shop.html?collection=puma-noah" },
          ],
        },
        {
          label: "Salomon",
          children: [
            { label: "Salomon RX MOC", href: "shop.html?collection=salomon-rx-moc" },
            { label: "Salomon Snowclog", href: "shop.html?collection=salomon-snowclog" },
            { label: "Salomon XT-4", href: "shop.html?collection=salomon-xt-4" },
            { label: "Salomon XT-6", href: "shop.html?collection=salomon-xt-6" },
            { label: "Salomon XT-WHISPER", href: "shop.html?collection=salomon-xt-whisper" },
          ],
        },
        {
          label: "The North Face",
          children: [
            { label: "The North Face x UNDERCOVER", href: "shop.html?collection=the-north-face-undercover" },
          ],
        },
      ],
    },
    {
      label: "Sale",
      children: [
        { label: "Shop All", href: "shop.html?plp=sale" },
        {
          label: "Mens",
          children: [
            { label: "Mens Footwear", href: "shop.html?plp=mens-footwear-sale" },
            { label: "Mens Clothing", href: "shop.html?plp=mens-clothing-sale" },
            { label: "Mens Accessories", href: "shop.html?plp=mens-accessories-sale" },
          ],
        },
        {
          label: "Womens",
          children: [
            { label: "Womens Footwear", href: "shop.html?plp=womens-footwear-sale" },
            { label: "Womens Clothing", href: "shop.html?plp=womens-clothing-sale" },
            { label: "Womens Accessories", href: "shop.html?plp=womens-accessories-sale" },
          ],
        },
        {
          label: "Brands",
          children: [
            { label: "adidas", href: "shop.html?brand=adidas&sale=1" },
            { label: "AURALEE", href: "shop.html?brand=auralee&sale=1" },
            { label: "Carhartt WIP", href: "shop.html?brand=carhartt-wip&sale=1" },
            { label: "C.P Company", href: "shop.html?brand=c-p-company&sale=1" },
            { label: "Needles", href: "shop.html?brand=needles&sale=1" },
            { label: "New Balance", href: "shop.html?brand=new-balance&sale=1" },
            { label: "Paraboot", href: "shop.html?brand=paraboot&sale=1" },
            { label: "Patagonia", href: "shop.html?brand=patagonia&sale=1" },
            { label: "Stone Island", href: "shop.html?brand=stone-island&sale=1" },
            { label: "Universal Works", href: "shop.html?brand=universal-works&sale=1" },
          ],
        },
      ],
    },
  ];
  const MOBILE_SERVICE_ITEMS = [
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
  let searchState = { products: null, query: "", loading: false, results: [] };
  let searchTimer = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getBasePath() {
    const currentPath = window.location.pathname.replace(/\/+/g, "/");
    const parts = currentPath.split("/").filter(Boolean);
    if (!parts.length) return "";
    const lastPart = parts[parts.length - 1] || "";
    const folderDepth = /\.[a-z0-9]+$/i.test(lastPart) ? parts.length - 1 : parts.length;
    return folderDepth > 0 ? "../".repeat(folderDepth) : "";
  }

  function withBase(basePath, href) {
    if (/^https?:\/\//i.test(href)) return href;
    return basePath + href;
  }

  function sanitizeUser(user) {
    if (!user) return null;
    const firstName = user.firstName || user.first_name || "";
    const lastName = user.lastName || user.last_name || "";
    return {
      id: user.id,
      firstName,
      lastName,
      fullName: (firstName + " " + lastName).trim() || user.email || "Customer",
      email: user.email || "",
      phone: user.phone || "",
      createdAt: user.createdAt || user.created_at || "",
    };
  }

  function getCurrentUser() {
    if (window.__AUCTIO_AUTH_USER) return sanitizeUser(window.__AUCTIO_AUTH_USER);
    return null;
  }

  function dispatchAuthChange() {
    const user = getCurrentUser();
    window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { user } }));
    window.dispatchEvent(new CustomEvent("auctio:auth", { detail: { user } }));
  }

  function backend() {
    if (!window.HipStoreBackend) {
      throw new Error("Supabase client is not loaded.");
    }
    return window.HipStoreBackend;
  }

  async function refreshCurrentUser() {
    if (!window.HipStoreBackend) return getCurrentUser();
    const user = await window.HipStoreBackend.getCurrentUser();
    window.__AUCTIO_AUTH_USER = user || null;
    dispatchAuthChange();
    return getCurrentUser();
  }

  async function registerAuthUser(payload) {
    const user = await backend().register(payload);
    window.__AUCTIO_AUTH_USER = user || null;
    dispatchAuthChange();
    return sanitizeUser(user);
  }

  async function loginAuthUser(email, password) {
    const user = await backend().login(email, password);
    window.__AUCTIO_AUTH_USER = user || null;
    dispatchAuthChange();
    return sanitizeUser(user);
  }

  async function logoutAuthUser() {
    if (window.HipStoreBackend) await window.HipStoreBackend.logout();
    window.__AUCTIO_AUTH_USER = null;
    dispatchAuthChange();
  }

  function buildAuthPageUrl(pageName, basePath) {
    const redirectTo = window.location.pathname + (window.location.search || "") + (window.location.hash || "");
    return basePath + pageName + ".html?redirect=" + encodeURIComponent(redirectTo);
  }

  function getPostAuthRedirect(basePath) {
    const redirect = new URLSearchParams(window.location.search).get("redirect");
    if (!redirect || /^https?:\/\//i.test(redirect)) return basePath + "account.html";
    if (/(^|\/)(login|register|account)\.html(?:$|[?#])/.test(redirect)) return basePath + "account.html";
    return redirect;
  }

  function getUserInitials(user) {
    const parts = [user && user.firstName, user && user.lastName].filter(Boolean);
    if (parts.length) return parts.map((part) => String(part).charAt(0).toUpperCase()).join("").slice(0, 2);
    return String((user && user.email) || "A").charAt(0).toUpperCase();
  }

  function navLinksHtml(basePath, className) {
    return SHOP_LINKS.map((link) => '<a class="' + className + '" href="' + withBase(basePath, link.href) + '">' + link.label + '</a>').join("");
  }

  function logoMarkHtml() {
    return '<span aria-hidden="true" style="display:block;color:#111;line-height:.88;letter-spacing:0;text-transform:uppercase"><span style="display:block;font-size:10px;font-weight:800;letter-spacing:1.6px">The</span><span style="display:block;font-size:20px;font-weight:900;letter-spacing:.2px;white-space:nowrap">Hip Store</span></span>';
  }

  function buildAuthControls(basePath) {
    return "";
  }

  function renderAuthControls(basePath) {
    document.querySelectorAll("[data-auth-controls]").forEach((container) => {
      container.innerHTML = buildAuthControls(basePath);
    });
    syncMobileMenuFooterAuth(basePath);
  }

  function syncMobileMenuFooterAuth(basePath) {
    return;
  }

  function searchIconSvg() {
    return '<svg id="open" xmlns="http://www.w3.org/2000/svg" width="19.996" height="20" viewBox="0 0 19.996 20"><path d="M8.333 0a8.339 8.339 0 0 1 6.355 13.732l5.079 4.956a.759.759 0 0 1 .013 1.073l-.012.012a.794.794 0 0 1-1.11 0l-5.08-4.957A8.336 8.336 0 1 1 8.333 0zm0 1.668A6.67 6.67 0 1 0 15 8.338a6.669 6.669 0 0 0-6.667-6.67z"></path></svg>';
  }

  function closeIconSvg() {
    return '<svg id="close" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><path d="M21.724 8.391a1.333 1.333 0 1 1 1.886 1.886L17.886 16l5.723 5.724a1.334 1.334 0 0 1 .141 1.72l-.141.165a1.333 1.333 0 0 1-1.886 0L16 17.886l-5.724 5.723a1.334 1.334 0 0 1-1.72.141l-.165-.141a1.333 1.333 0 0 1 0-1.886L14.114 16l-5.723-5.724a1.334 1.334 0 0 1-.141-1.72l.141-.165a1.333 1.333 0 0 1 1.886 0L16 14.114z" transform="translate(-8 -8)"></path></svg>';
  }

  function accountIconSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="15.5" height="20.5" viewBox="0 0 15.5 20.5"><g><g fill="#fff"><path d="M18.125 20.125H2.875V14.49c0-2.559 1.622-4.875 4.058-5.826C5.94 7.697 5.375 6.374 5.375 5c0-2.826 2.3-5.125 5.125-5.125 2.826 0 5.125 2.3 5.125 5.125 0 1.373-.565 2.697-1.558 3.664 2.436.95 4.058 3.267 4.058 5.827v5.634zM4.008 19.082h12.985V14.49c0-2.37-1.62-4.442-3.944-5.055-.779.45-1.659.689-2.549.689-.89 0-1.77-.238-2.549-.69-2.324.614-3.943 2.686-3.943 5.056v4.59zM10.5.958C8.271.958 6.458 2.771 6.458 5c0 1.334.662 2.583 1.77 3.34.536.365 1.189.595 1.887.662.049.005.097.011.144.018.083.011.162.022.241.022.08 0 .158-.011.24-.022.048-.007.096-.013.145-.018.698-.067 1.35-.297 1.886-.663 1.109-.756 1.77-2.005 1.77-3.339 0-2.229-1.812-4.042-4.041-4.042z" transform="translate(.25 .25) translate(-3)"></path><path d="M10.5 0c-2.75 0-5 2.25-5 5 0 1.47.647 2.793 1.666 3.71C4.74 9.573 3 11.835 3 14.49V20h15v-5.51c0-2.656-1.74-4.918-4.166-5.78C14.854 7.794 15.5 6.47 15.5 5c0-2.75-2.25-5-5-5m0 9.167c-.136 0-.264-.028-.397-.04-.714-.07-1.381-.3-1.945-.684C7.058 7.692 6.333 6.429 6.333 5c0-2.298 1.87-4.167 4.167-4.167 2.297 0 4.167 1.87 4.167 4.167 0 1.43-.725 2.692-1.825 3.443-.564.385-1.231.614-1.945.684-.133.012-.261.04-.397.04m0 .833c.922 0 1.787-.257 2.53-.698 2.347.596 4.088 2.693 4.088 5.189v4.716H3.882V14.49c0-2.496 1.741-4.593 4.088-5.19.743.442 1.608.699 2.53.699m0-10.25c2.895 0 5.25 2.355 5.25 5.25 0 1.344-.529 2.642-1.462 3.619 2.385 1.01 3.962 3.323 3.962 5.872v5.759H2.75v-5.76c0-2.548 1.577-4.86 3.962-5.871C5.78 7.642 5.25 6.344 5.25 5c0-2.895 2.355-5.25 5.25-5.25zm0 9.167c.071 0 .145-.01.224-.021.05-.007.099-.013.15-.018.676-.066 1.308-.288 1.827-.642 1.074-.733 1.716-1.943 1.716-3.236 0-2.16-1.757-3.917-3.917-3.917S6.583 2.84 6.583 5c0 1.293.642 2.503 1.716 3.236.519.354 1.15.576 1.828.642l.15.018c.078.01.152.02.223.02zm0 1.333c-.895 0-1.78-.235-2.566-.68-2.243.615-3.802 2.624-3.802 4.92v4.467h12.736V14.49c0-2.297-1.559-4.306-3.802-4.921-.786.445-1.671.68-2.566.68z" transform="translate(.25 .25) translate(-3)"></path></g></g></svg>';
  }

  function basketIconSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path id="BASKET" d="M19.655 6.565v12.211H2.344V6.565zm-8.642-5.341A3.457 3.457 0 0 1 14.6 4.616v.726H7.4v-.726a3.472 3.472 0 0 1 3.613-3.392zm4.934 4.118v-.726A4.732 4.732 0 0 0 11.013 0a4.747 4.747 0 0 0-4.961 4.616v.726H2.624A1.463 1.463 0 0 0 1 6.752v11.866A1.379 1.379 0 0 0 2.624 20h16.913C20.668 20 21 19.388 21 18.618V6.752a1.37 1.37 0 0 0-1.463-1.41z" transform="translate(-1)"></path></svg>';
  }

  function backIconSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 200 200"><defs><style>.cls-1{fill-rule:evenodd;}</style></defs><path id="WISH" class="cls-1" d="M143.121,100.461l0.039,0.039-0.687.687a25.956,25.956,0,0,1-2.286,2.286L100,143.66,59.813,103.473a26.034,26.034,0,0,1-2.286-2.286L56.84,100.5l0.039-.039A25.985,25.985,0,0,1,96.488,66.827L100,70.34l3.513-3.513A25.985,25.985,0,0,1,143.121,100.461ZM123,66a17.935,17.935,0,0,0-13.366,5.974l-0.13-.131-9.5,9.5-9.5-9.5-0.131.131a17.984,17.984,0,0,0-28.2,22.2L61.84,94.5,100,132.66,138.16,94.5l-0.324-.324A17.987,17.987,0,0,0,123,66Z"></path></svg>';
  }

  function readCartCount() {
    try {
      const raw = JSON.parse(window.localStorage.getItem(CART_KEY) || "[]");
      return Array.isArray(raw) ? raw.reduce((sum, item) => sum + Math.max(1, Number(item && item.quantity || 1)), 0) : 0;
    } catch (_error) {
      return 0;
    }
  }

  function setBasketCount(count) {
    document.querySelectorAll("[data-basket-count]").forEach((node) => {
      node.textContent = String(count);
      node.hidden = count === 0;
      node.setAttribute("title", count === 1 ? "1 Item in your basket" : count + " Items in your basket");
    });
  }

  async function refreshRemoteCartCount() {
    if (!window.HipStoreBackend || !window.HipStoreBackend.isConfigured || !window.HipStoreBackend.isConfigured() || typeof window.HipStoreBackend.getCart !== "function") {
      setBasketCount(readCartCount());
      return;
    }
    try {
      const result = await window.HipStoreBackend.getCart();
      const items = Array.isArray(result && result.items) ? result.items : [];
      try {
        window.localStorage.setItem(CART_KEY, JSON.stringify(items.slice(0, 30)));
      } catch (_error) {
        // Ignore storage failures.
      }
      const count = items.reduce((sum, item) => sum + Math.max(1, Number(item && item.quantity || 1)), 0);
      setBasketCount(count);
    } catch (_error) {
      setBasketCount(readCartCount());
    }
  }

  function ensureHeaderStyles() {
    if (document.getElementById("hip-original-header-style")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="hip-original-header-style">' +
      '.hidden{display:none!important}.hip-original-header{position:sticky;top:0;z-index:100;background:#050505;color:#fff}.hip-original-header *{box-sizing:border-box;font-family:"Open Sans",Arial,Helvetica,sans-serif;letter-spacing:0}.hip-original-header a,.hip-original-header button,.hip-original-header span{color:inherit;text-decoration:none}.hip-original-header button{font:inherit}.hip-original-header #head{position:relative;display:flex;min-height:62px;align-items:center;justify-content:space-between;background:#050505;padding:0 13px 0 16px}.hip-original-header .logo{display:inline-flex;align-items:center}.hip-original-header .headerLogo{display:block;width:96px;height:auto;filter:invert(1)}.hip-original-header #headLeft{display:flex;align-items:center}.hip-original-header #headRight{display:flex;align-items:center;gap:7px;margin-left:auto}.hip-original-header #headRight>a,.hip-original-header #headRight>button{position:relative;display:inline-grid;width:34px;height:44px;place-items:center;border:0;background:transparent;padding:0;cursor:pointer}.hip-original-header #headRight svg{fill:currentColor}.hip-original-header .headerIcon,.hip-original-header #headRight svg{width:21px;height:21px;object-fit:contain}.hip-original-header .basketIcon,.hip-original-header .menuIcon{filter:invert(1)}.hip-original-header .srch #close{display:none}.hip-original-header .srch.is-open #open{display:none}.hip-original-header .srch.is-open #close{display:block}.hip-original-header .back,.hip-original-header .open{display:none!important}.hip-original-header .basketCount{position:absolute;top:5px;right:-2px;min-width:16px;height:16px;border-radius:999px;background:#fff;color:#000;font-size:10px;font-weight:800;line-height:16px;text-align:center}.hip-original-header #cartSummaryOverlay,.hip-original-header #userMenuContainer,.hip-original-header #miniCart,.hip-original-header #headBot{display:none}.hip-original-header #search{position:absolute;right:0;left:0;top:100%;z-index:101;background:#fff;color:#111;border-bottom:1px solid #e7e8e9;padding:10px 10px 0}.hip-original-header #searchBar,.hip-original-header .inpBg,.hip-original-header .srchInputContainer{display:flex;width:100%;align-items:center}.hip-original-header .inpBg{position:relative}.hip-original-header .srchInputContainer{min-height:42px;border:1px solid #d8d8d8;background:#fff;padding:0 8px}.hip-original-header #srchInput{min-width:0;flex:1;border:0;outline:0;padding:0 10px;font-size:15px}.hip-original-header #srchButton{position:absolute;width:1px;height:1px;opacity:0}.hip-original-header #clearInput{display:inline-grid;width:28px;height:28px;place-items:center;border:0;background:transparent;color:#111;cursor:pointer}.hip-original-header #clearInput:before{content:"x";font-size:18px;line-height:1}.hip-original-header #speechInput{display:none!important}.hip-original-header #search .srch{display:inline-grid;width:42px;place-items:center;border:0;background:transparent;color:#111}.hip-original-header #enhancedSearch{padding:14px 0 0}.hip-original-header #enhancedSearch>ul{margin:0;padding:0;list-style:none}.hip-original-header #liveSearchResultsContent,.hip-original-header #recentSearchesContent{display:block}.hip-original-header #recentSearchesContent h2,.hip-original-header .liveSearchHeading{margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #ececec;color:#111;font-size:12px;font-weight:800;line-height:1.4;text-transform:uppercase}.hip-original-header .liveSearchHeading{margin-top:0}.hip-original-header .liveSearchList,.hip-original-header #recentSearchesList{margin:0;padding:0;list-style:none}.hip-original-header .liveSearchList li,.hip-original-header #recentSearchesList li{border-bottom:1px solid #f0f0f0}.hip-original-header .liveSearchList li:last-child,.hip-original-header #recentSearchesList li:last-child{border-bottom:0}.hip-original-header .liveSearchResult{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;padding:10px 0}.hip-original-header .liveSearchResult img{display:block;width:58px;height:58px;border:1px solid #ececec;background:#f6f6f6;object-fit:contain;padding:3px}.hip-original-header .liveSearchMeta{min-width:0}.hip-original-header .liveSearchMeta strong{display:block;margin-bottom:2px;color:#111;font-size:12px;font-weight:700;line-height:1.45;text-transform:none}.hip-original-header .liveSearchMeta span{display:block;color:#666;font-size:10px;font-weight:700;line-height:1.45;text-transform:uppercase}.hip-original-header .liveSearchMeta em{display:block;margin-top:3px;color:#111;font-size:12px;font-style:normal;font-weight:700;line-height:1.45}.hip-original-header .searchEmpty{padding:4px 0 12px;color:#666;font-size:12px;line-height:1.5}.hip-original-header #recentSearchesList a{display:block;padding:10px 0;color:#111;font-size:12px;font-weight:700;line-height:1.45;text-decoration:none}.hip-original-header #clearRecentSearches{display:block;width:100%;border:0;border-top:1px solid #ececec;background:#fff;padding:12px 0 14px;color:#666;font-size:11px;font-weight:800;line-height:1.4;text-transform:uppercase;text-align:left;cursor:pointer}.hip-original-header #clearRecentSearches.hidden,.hip-original-header #recentSearchesContent.hidden{display:none!important}.hip-nav-scrim{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.52)}.hip-nav-panel{position:fixed;top:0;bottom:0;left:50%;z-index:141;width:min(420px,100vw);max-width:100%;transform:translateX(-50%);overflow-y:auto;background:#fff;color:#111}.hip-nav-head{display:flex;min-height:63px;align-items:center;justify-content:space-between;background:#050505;padding:0 14px}.hip-nav-head img{width:96px;filter:invert(1)}.hip-nav-head button{display:inline-grid;width:34px;height:34px;place-items:center;border:0;background:transparent;color:#fff;cursor:pointer}.hip-nav-head button svg{width:18px;height:18px;fill:currentColor}.hip-nav-panel ul{margin:0;padding:0;list-style:none}.hip-nav-panel li{border-bottom:1px solid #e7e8e9}.hip-nav-panel a,.hip-nav-panel summary{display:flex;min-height:50px;align-items:center;justify-content:space-between;padding:0 18px;font-size:14px;font-weight:800;text-transform:uppercase}.hip-nav-panel .menu ul{background:#fff}.hip-nav-panel .menu ul a,.hip-nav-panel .menu ul summary{min-height:40px;padding-left:34px;color:#333;font-size:13px;font-weight:600;text-transform:none}.hip-nav-panel .menu ul ul a,.hip-nav-panel .menu ul ul summary{padding-left:50px;font-size:12px}.hip-nav-panel summary{cursor:pointer;list-style:none}.hip-nav-panel summary::-webkit-details-marker{display:none}.hip-nav-panel summary:after{content:"+";font-size:22px;font-weight:400}.hip-nav-panel details[open]>summary:after{content:"-"}.hip-auth-links{display:grid;gap:8px;padding:16px 18px}.hip-auth-links a,.hip-auth-links button{min-height:42px;border:1px solid #111;background:#fff;color:#111;padding:0 12px;font-size:12px;font-weight:900;text-align:center;text-transform:uppercase;cursor:pointer}.hip-auth-links a:first-child{background:#111;color:#fff}@media(max-width:1180px){.hip-nav-panel{left:0;transform:none}}' +
      '</style>');
  }

  function ensureOriginalMenuStyles() {
    if (document.getElementById("hip-original-mobile-menu-style")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="hip-original-mobile-menu-style">' +
      '#navBackground{position:fixed;inset:0;z-index:140;background:rgba(0,0,0,.52)}#nav{position:fixed;top:0;bottom:0;left:50%;z-index:141;width:min(1180px,100vw);max-width:100%;transform:translateX(-50%);overflow-y:auto;background:#fff;color:#111;-webkit-overflow-scrolling:touch}#nav .menu{margin:0;padding:0;list-style:none;background:#fff}#nav .top-nav-header{display:flex;min-height:62px;align-items:center;justify-content:space-between;background:#050505;padding:0 14px}#nav .top-nav-header .headerLogo{width:96px;height:auto;filter:invert(1)}#nav .close-nav{display:inline-grid;width:34px;height:34px;place-items:center;color:#fff;text-decoration:none}#nav .close-nav svg{width:16px;height:16px;fill:currentColor}#nav li{list-style:none;border-bottom:1px solid #e7e8e9}#nav li a{display:flex;min-height:50px;align-items:center;justify-content:space-between;padding:0 18px;color:#111;font-size:14px;font-weight:800;line-height:1.25;text-transform:uppercase;text-decoration:none}#nav li.level1>a{min-height:40px;padding-left:34px;color:#333;font-size:13px;font-weight:600;text-transform:none}#nav li.level2>a{padding-left:50px;font-size:12px}#nav li.wChild>a::after{content:\"\";display:block;width:8px;height:8px;margin-left:12px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(-45deg);transition:transform .18s ease}#nav li.wChild.is-open>a::after{transform:rotate(45deg)}#nav .acitem{display:none;margin:0;padding:0;list-style:none;background:#fff}#nav li.is-open>.acitem{display:block!important;left:0!important}#navServiceContainer{display:grid;margin-top:12px;border-top:1px solid #e7e8e9;border-bottom:1px solid #e7e8e9;background:#fff}#navServiceContainer .navServiceMenu{margin:0;padding:0;list-style:none;background:#fff}#navServiceContainer li{border-bottom:1px solid #e7e8e9}#navServiceContainer li:last-child{border-bottom:0}#navServiceContainer li.level0>a{min-height:52px;padding:0 18px;font-size:13px;font-weight:800;text-transform:uppercase}#navServiceContainer li.wChild>a::after{content:\"→\";display:block;width:auto;height:auto;margin-left:12px;border:0;font-size:16px;line-height:1;transform:none}#navServiceContainer li.wChild.is-open>a::after{transform:rotate(90deg)}#navServiceContainer li.level1>a{min-height:40px;padding-left:34px;color:#333;font-size:13px;font-weight:600;text-transform:none}#navFooterContainer{display:grid;padding-top:0;background:#fff}#navFooterContainer a{display:flex;min-height:52px;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid #e7e8e9;color:#111;font-size:13px;font-weight:800;line-height:1.3;text-transform:uppercase;text-decoration:none}#navFooterContainer a:last-child{border-bottom:0}#navFooterContainer img{display:block;width:17px;height:17px;object-fit:contain}#navLoader{display:none}@media(max-width:1180px){#nav{left:0;transform:none;width:100%}}' +
      '</style>');
  }

  function ensureSearchPanelStyles() {
    if (document.getElementById("hip-original-search-panel-style")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="hip-original-search-panel-style">' +
      '.hip-original-header #trendingSearches{display:block;padding-bottom:8px}.hip-original-header #trendingSearches.hidden{display:none!important}.hip-original-header #trendingSearches ul{margin:0;padding:0;list-style:none}.hip-original-header #trendingSearches li{border-bottom:1px solid #f0f0f0}.hip-original-header #trendingSearches li:last-child{border-bottom:0}.hip-original-header #trendingSearches li.title{margin:0 0 10px;padding:0 0 10px;border-bottom:1px solid #ececec;color:#111;font-size:12px;font-weight:800;line-height:1.4;text-transform:uppercase}.hip-original-header #trendingSearches li.title+li{border-top:0}.hip-original-header #trendingSearches a{display:block;padding:10px 0;color:#111;font-size:12px;font-weight:700;line-height:1.45;text-decoration:none}' +
      '</style>');
  }

  function buildHeader(basePath) {
    return '' +
      '<header class="hip-original-header">' +
        '<div id="head" data-e2e="header-wrap" class="">' +
          '<a class="logo " href="' + basePath + 'index.html"><img class="headerLogo" src="' + LOGO_URL + '" title="The Hip Store" alt="The Hip Store"></a>' +
          '<div id="headLeft"></div>' +
          '<div id="headRight">' +
            '<a class="srch" href="#!" data-header-search-trigger data-e2e="header-search-toggle" aria-label="Search">' + searchIconSvg() + closeIconSvg() + '</a>' +
            '<a class="bskt" data-e2e="basket-go-to" href="' + basePath + 'checkout/index.html" title="">' +
              '<div id="cartSummaryOverlay" class="eq1"><img src="' + ASSET_ORIGIN + '/skins/default/public/img/icons/preload-white.gif" alt=""></div>' +
              basketIconSvg() +
              '<span class="basketCount" data-e2e="basket-count" data-basket-count hidden></span>' +
            '</a>' +
            '<a class="closed" href="#!" data-header-mobile-trigger data-e2e="header-burgerMenu-open" aria-label="Menu"><img class="headerIcon menuIcon" src="' + MENU_ICON_URL + '" alt="Menu"></a>' +
            '<a class="back" href="#!" aria-hidden="true">' + backIconSvg() + '</a>' +
            '<a class="open" href="#!" data-e2e="header-burgerMenu-close" data-display="inline-block" aria-hidden="true"><img class="headerIcon menuIcon" src="' + MENU_ICON_URL + '" alt="Menu"></a>' +
          '</div>' +
          '<section id="userMenuContainer"></section>' +
          '<div class="clr"></div>' +
        '</div>' +
        '<div id="search" data-top="0" data-zindex="8" hidden>' +
          '<form id="searchBar" action="' + basePath + SHOP_PAGE + '">' +
            '<span class="inpBg"><div class="srchInputContainer"><label>' + searchIconSvg() + '<input type="submit" title="Search" data-e2e="header-search-submit" id="srchButton"></label><input type="text" name="q" placeholder="Search" id="srchInput" data-e2e="header-search-input" data-live-search="1" data-listening="Listening ..." autocomplete="off"><span id="clearInput" class="clearInput" data-search-clear aria-label="Clear search"></span><span id="speechInput" style="display: none;"></span></div><a class="srch" href="#!" data-search-close data-e2e="header-search-toggle" aria-label="Close search">' + closeIconSvg() + '</a><span class="liveSearchLoader hidden"></span></span>' +
          '</form>' +
          '<div id="enhancedSearch"><ul><li id="liveSearchResultsContent"></li></ul><div id="trendingSearches"></div><div id="recentSearchesContent" class="hidden"><h2>Recent Searches</h2><ul id="recentSearchesList"></ul></div><div id="clearRecentSearches" class="hidden">Clear Recent Searches</div></div>' +
        '</div>' +
        '<div id="miniCart"></div><div id="headBot"></div>' +
      '</header>';
  }

  function replaceHeader(basePath) {
    ensureHeaderStyles();
    ensureOriginalMenuStyles();
    ensureSearchPanelStyles();
    const header = document.querySelector("header");
    if (header) header.outerHTML = buildHeader(basePath);
    else document.body.insertAdjacentHTML("afterbegin", buildHeader(basePath));
  }

  function renderMenuFooter(basePath) {
    return '' +
      '<div id="navFooterContainer">' +
        '<a class="ga-ip" data-ip-position="header-help" href="' + basePath + 'faq.html">' +
          'Help' +
          '<img src="' + LONG_ARROW_ICON_URL + '" alt="">' +
        '</a>' +
      '</div>';
  }

  function renderMenuService(basePath) {
    return '' +
      '<div id="navServiceContainer">' +
        '<ul class="navServiceMenu">' +
          renderMenuItems(basePath, MOBILE_SERVICE_ITEMS, 0) +
        '</ul>' +
      '</div>';
  }

  function ensureMobileMenu(basePath) {
    document.getElementById("navBackground")?.remove();
    document.getElementById("nav")?.remove();
    document.body.insertAdjacentHTML("beforeend", '' +
      '<div id="navBackground" hidden></div>' +
      '<div id="nav" data-e2e="header-nav-wrap" class="navSlideClosed" hidden aria-label="Mobile navigation">' +
        '<ul class="menu">' +
          '<div class="top-nav-header">' +
            '<img class="headerLogo" src="' + LOGO_URL + '" title="The Hip Store" alt="The Hip Store">' +
            '<a class="close-nav open" href="#!" data-mobile-menu-close style="display: inline-block;" aria-label="Close menu">' + closeIconSvg() + '</a>' +
          '</div>' +
          renderMenuItems(basePath, MOBILE_MENU_ITEMS, 0) +
          renderMenuService(basePath) +
          renderMenuFooter(basePath) +
        '</ul>' +
        '<div id="navLoader"></div>' +
      '</div>');
  }

  function renderMenuItems(basePath, items, depth) {
    return items.map((item) => {
      const hasChildren = Array.isArray(item.children) && item.children.length > 0;
      const href = item.href ? ' href="' + escapeHtml(withBase(basePath, item.href)) + '"' : "";
      if (!hasChildren) {
        return '<li class="level' + depth + '"><a data-e2e="header-burgerMenu-link" class=""' + href + '>' + escapeHtml(item.label) + '</a></li>';
      }
      return '<li class="level' + depth + ' wChild"><a data-e2e="header-burgerMenu-link" class=" wChild"' + href + '>' + escapeHtml(item.label) + '</a><ul class="acitem" data-e2e="header-nav-submenu-wrap" style="left: -100%; display: none;">' + renderMenuItems(basePath, item.children, depth + 1) + '</ul></li>';
    }).join("");
  }

  function ensureFooterStyles() {
    if (document.getElementById("hip-original-footer-style")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="hip-original-footer-style">' +
      '#hipFooter,#hipFooter *{box-sizing:border-box;font-family:"Open Sans",Arial,Helvetica,sans-serif;letter-spacing:0}#hipFooter{background:#111;color:#fff;border-top:1px solid #333}#hipFooter a{color:inherit;text-decoration:none}.infoLinks{background:#111;color:#fff;text-align:center}.desktop-url{display:block;border-bottom:1px solid #333}.desktop-url a{display:block;padding:14px 16px;font-size:12px;font-weight:900;line-height:1.35;text-transform:uppercase}.footer-content-wrap{display:block}.footer-left ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));margin:0;padding:0;list-style:none}.footer-left li{border-right:1px solid #333;border-bottom:1px solid #333}.footer-left li:nth-child(2n){border-right:0}.footer-left a{display:grid;min-height:42px;place-items:center;padding:8px;text-align:center;font-size:11px;font-weight:800;line-height:1.25;text-transform:uppercase}.footer-right{display:none}@media(max-width:520px){.footer-left ul{grid-template-columns:1fr}.footer-left li{border-right:0}}' +
      '</style>');
  }

  function footerLinkItem(href, label, className, dataName, target, extraAttrs) {
    return '<li><a href="' + escapeHtml(href) + '" class="' + escapeHtml(className || "ga-ip") + '"' +
      (dataName ? ' data-ip-position="footer" data-ip-name="' + escapeHtml(dataName) + '"' : '') +
      (target ? ' target="' + escapeHtml(target) + '"' : '') +
      (extraAttrs ? ' ' + extraAttrs : '') +
      '>' + escapeHtml(label) + '</a></li>';
  }

  function buildFooter(basePath) {
    var footerLinks = [
      [basePath + "faq.html", "FAQs", "ga-ip", "FAQ"],
      [basePath + "faq.html", "Size Guide", "ga-ip", "Size Guide"],
      [basePath + "contact.html", "Contact Us", "contactUsPopUp", "Contact Us"],
      [basePath + "terms.html", "Terms & Conditions", "ga-ip", "Terms & Conditions"],
      [basePath + "shipping.html", "Delivery Info", "ga-ip", "Delivery Info"],
      [basePath + "shipping.html", "Returning Items", "ga-ip", "Returning Items"],
      [basePath + "privacy.html", "Privacy Policy", "ga-ip", "Privacy Policy"],
      [basePath + "accessibility.html", "Accessibility", "ga-ip", "Accessibility"],
    ];

    return '' +
      '<footer id="hipFooter">' +
        '<div class="infoLinks"><div class="footer-content-wrap"><div class="footer-left"><ul>' +
          footerLinks.map(function (link) { return footerLinkItem(link[0], link[1], link[2], link[3], link[4], link[5]); }).join("") +
        '</ul></div><div class="footer-right"></div></div></div>' +
      '</footer>';
  }

  function replaceFooter(basePath) {
    ensureFooterStyles();
    const footer = document.querySelector("footer");
    if (footer) footer.outerHTML = buildFooter(basePath);
    else {
      const shell = document.querySelector(".min-h-screen") || document.body;
      shell.insertAdjacentHTML("beforeend", buildFooter(basePath));
    }
    document.querySelector(".openCookieSettings")?.addEventListener("click", (event) => {
      event.preventDefault();
      document.querySelector("[data-cookie-settings]")?.click();
    });
  }

  const NEWSLETTER_PATTERNS = [
    /sign\s+up\s+to\s+our\s+newsletter/i,
    /join\s+our\s+mailing\s+list/i,
    /10%\s*off\s+your\s+first\s+order/i,
    /sign\s+up\s+for\s+the\s+latest\s+updates/i,
  ];

  function hasNewsletterCopy(node) {
    const text = String(node && (node.innerText || node.textContent) || "").replace(/\s+/g, " ").trim();
    return text && NEWSLETTER_PATTERNS.some((pattern) => pattern.test(text));
  }

  function removeNewsletterNode(node) {
    if (!node || !node.parentElement) return;
    const target = node.closest("#signup,.newsletterSignup,.newsletter-signup,.footerNewsletter,[data-newsletter-form],section,form") || node;
    if (target && target !== document.body && target !== document.documentElement) target.remove();
  }

  function removeNewsletterBlocks() {
    document.querySelectorAll("#signup,#newsletterSignupForm,[data-newsletter-form],.newsletterSignup,.newsletter-signup,.footerNewsletter,#footerNewsletter").forEach(removeNewsletterNode);
    document.querySelectorAll("section,form,footer div,main div,body > div").forEach((node) => {
      if (hasNewsletterCopy(node)) removeNewsletterNode(node);
    });
  }

  let newsletterCleanupObserver = null;
  let newsletterCleanupQueued = false;

  function ensureNewsletterCleanup() {
    removeNewsletterBlocks();
    if (newsletterCleanupObserver || !document.body) return;
    newsletterCleanupObserver = new MutationObserver(() => {
      if (newsletterCleanupQueued) return;
      newsletterCleanupQueued = true;
      window.requestAnimationFrame(() => {
        newsletterCleanupQueued = false;
        removeNewsletterBlocks();
      });
    });
    newsletterCleanupObserver.observe(document.body, { childList: true, subtree: true });
  }

  function normalizeProduct(item) {
    if (!item) return null;
    const id = item.id || item.product_id || item.sku || item.routeSlug || item.slug || "";
    const sourceSlug = item.sourceSlug || item.slug || slugify(item.title || id);
    const routeSlug = item.routeSlug || (sourceSlug && id ? sourceSlug + "-" + id : sourceSlug);
    const images = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    const image = item.mainImage || item.main_image || item.image || images[0] || "placeholder.svg";
    return {
      id,
      routeSlug,
      title: item.title || item.full_name || "Untitled Product",
      brand: item.brand || "Product",
      sku: item.sku || item.product_id || "",
      categoryPath: item.categoryPath || item.category_path || item.category || "",
      price: Number(item.price || 0),
      currency: item.currency || "GBP",
      image,
    };
  }

  function slugify(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function formatCurrency(value, currency) {
    const amount = Number(value || 0);
    try {
      return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency || "GBP", maximumFractionDigits: amount % 1 ? 2 : 0 }).format(amount);
    } catch (_error) {
      return (currency || "GBP") + " " + amount.toLocaleString("en-US");
    }
  }

  async function loadSearchProducts(basePath) {
    if (searchState.products) return searchState.products;
    const backend = window.HipStoreBackend;
    if (backend && typeof backend.isConfigured === "function" && backend.isConfigured() && typeof backend.getCatalog === "function") {
      try {
        const products = await backend.getCatalog();
        searchState.products = (Array.isArray(products) ? products : []).map(normalizeProduct).filter((product) => product && product.routeSlug);
        return searchState.products;
      } catch (error) {
        console.warn("Catalog backend unavailable, using local catalog file:", error);
      }
    }
    async function fetchProducts(path) {
      const response = await fetch(basePath + path, { cache: "no-store" });
      if (!response.ok) throw new Error("Unable to load products");
      return response.json();
    }
    const products = await fetchProducts(CATALOG_PATH);
    searchState.products = (Array.isArray(products) ? products : []).map(normalizeProduct).filter((product) => product && product.routeSlug);
    return searchState.products;
  }

  function readRecentSearches() {
    try {
      const raw = JSON.parse(window.localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
      return Array.isArray(raw) ? raw.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 8) : [];
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
    const clean = String(query || "").trim();
    if (!clean) return;
    const next = [clean].concat(readRecentSearches().filter((item) => item.toLowerCase() !== clean.toLowerCase()));
    writeRecentSearches(next.slice(0, 8));
  }

  function renderRecentSearches(basePath) {
    const recentNode = document.getElementById("recentSearchesContent");
    const listNode = document.getElementById("recentSearchesList");
    const clearNode = document.getElementById("clearRecentSearches");
    if (!recentNode || !listNode || !clearNode) return;
    const items = readRecentSearches();
    listNode.innerHTML = items.map((item) => '<li><a href="' + basePath + SHOP_PAGE + '?search=' + encodeURIComponent(item) + '" data-recent-search-link="' + escapeHtml(item) + '">' + escapeHtml(item) + '</a></li>').join("");
    recentNode.classList.toggle("hidden", items.length === 0 || searchState.query.trim().length > 0);
    clearNode.classList.toggle("hidden", items.length === 0 || searchState.query.trim().length > 0);
  }

  function renderTrendingSearches(basePath) {
    const trendingNode = document.getElementById("trendingSearches");
    if (!trendingNode) return;
    trendingNode.innerHTML = '<ul><li class="title">Trending Searches</li>' + TRENDING_SEARCHES.map((item) => (
      '<li><a href="' + basePath + SHOP_PAGE + '?search=' + encodeURIComponent(item) + '" data-trending-search-link="' + escapeHtml(item) + '">' + escapeHtml(item) + '</a></li>'
    )).join("") + '</ul>';
    trendingNode.classList.toggle("hidden", searchState.query.trim().length > 0);
  }

  function buildSearchCard(product, basePath) {
    return '' +
      '<a href="' + basePath + PRODUCT_PAGE + '?slug=' + encodeURIComponent(product.routeSlug) + '" class="liveSearchResult" data-search-result-link="' + escapeHtml(product.routeSlug) + '">' +
        '<img src="' + escapeHtml(product.image || basePath + PLACEHOLDER_IMAGE) + '" alt="' + escapeHtml(product.title) + '" onerror="this.onerror=null;this.src=\'' + basePath + PLACEHOLDER_IMAGE + '\';" />' +
        '<span class="liveSearchMeta"><span>' + escapeHtml(product.brand) + '</span><strong>' + escapeHtml(product.title) + '</strong><em>' + formatCurrency(product.price, product.currency) + '</em></span>' +
      '</a>';
  }

  function ensureSearchDialog(basePath) {
    const existing = document.getElementById("header-search-dialog");
    if (existing) existing.remove();
    document.querySelector("#searchBar")?.setAttribute("action", basePath + SHOP_PAGE);
  }

  async function renderSearchResults(basePath) {
    const resultsNode = document.getElementById("liveSearchResultsContent");
    if (!resultsNode) return;
    const products = await loadSearchProducts(basePath);
    const query = searchState.query.trim().toLowerCase();
    let results = [];
    if (query) {
      results = products.filter((product) => [product.title, product.brand, product.sku, product.routeSlug, product.categoryPath].join(" ").toLowerCase().includes(query));
    }
    const visible = results.slice(0, 12);
    if (!query) {
      resultsNode.innerHTML = "";
    } else if (!visible.length) {
      resultsNode.innerHTML = '<div class="liveSearchHeading">Products</div><p class="searchEmpty">No matching products were found.</p>';
    } else {
      resultsNode.innerHTML = '<div class="liveSearchHeading">Products</div><ul class="liveSearchList">' + visible.map((product) => '<li>' + buildSearchCard(product, basePath) + '</li>').join("") + '</ul>';
    }
    renderTrendingSearches(basePath);
    renderRecentSearches(basePath);
  }

  function openSearch(basePath) {
    const panel = document.getElementById("search");
    const input = document.getElementById("srchInput");
    const trigger = document.querySelector("[data-header-search-trigger]");
    if (!panel) return;
    panel.hidden = false;
    if (trigger) trigger.classList.add("is-open");
    renderRecentSearches(basePath);
    renderSearchResults(basePath);
    setTimeout(() => input && input.focus(), 20);
  }

  function closeSearch(basePath) {
    const panel = document.getElementById("search");
    const trigger = document.querySelector("[data-header-search-trigger]");
    if (!panel) return;
    panel.hidden = true;
    if (trigger) trigger.classList.remove("is-open");
    renderRecentSearches(basePath);
  }

  function bindInteractions(basePath) {
    function collapseMobileBranch(node) {
      if (!node) return;
      node.classList.remove("is-open");
      node.querySelectorAll(".is-open").forEach((branch) => branch.classList.remove("is-open"));
      node.querySelectorAll(".acitem").forEach((submenu) => {
        submenu.style.display = "none";
        submenu.style.left = "-100%";
      });
    }

    function resetMobileMenu() {
      const nav = document.getElementById("nav");
      if (!nav) return;
      nav.querySelectorAll(".is-open").forEach((branch) => branch.classList.remove("is-open"));
      nav.querySelectorAll(".acitem").forEach((submenu) => {
        submenu.style.display = "none";
        submenu.style.left = "-100%";
      });
    }

    function openMobileMenu() {
      const nav = document.getElementById("nav");
      const background = document.getElementById("navBackground");
      if (!nav || !background) return;
      resetMobileMenu();
      nav.hidden = false;
      background.hidden = false;
      nav.classList.remove("navSlideClosed");
      nav.classList.add("navSlideOpen");
      document.body.style.overflow = "hidden";
      renderAuthControls(basePath);
    }

    function closeMobileMenu() {
      const nav = document.getElementById("nav");
      const background = document.getElementById("navBackground");
      if (nav) {
        nav.hidden = true;
        nav.classList.remove("navSlideOpen");
        nav.classList.add("navSlideClosed");
      }
      if (background) background.hidden = true;
      resetMobileMenu();
      document.body.style.removeProperty("overflow");
    }

    document.querySelector("[data-header-search-trigger]")?.addEventListener("click", (event) => {
      event.preventDefault();
      const panel = document.getElementById("search");
      if (panel && !panel.hidden) closeSearch(basePath);
      else openSearch(basePath);
    });
    document.querySelectorAll("[data-search-close]").forEach((node) => node.addEventListener("click", (event) => {
      event.preventDefault();
      closeSearch(basePath);
    }));
    document.querySelector("[data-search-clear]")?.addEventListener("click", () => {
      const input = document.getElementById("srchInput");
      if (input) input.value = "";
      searchState.query = "";
      renderSearchResults(basePath);
    });
    document.getElementById("clearRecentSearches")?.addEventListener("click", () => {
      writeRecentSearches([]);
      renderRecentSearches(basePath);
    });
    document.getElementById("srchInput")?.addEventListener("input", (event) => {
      window.clearTimeout(searchTimer);
      searchTimer = window.setTimeout(() => {
        searchState.query = String(event.target && event.target.value || "");
        renderSearchResults(basePath);
      }, 120);
    });
    document.querySelector("#searchBar")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("srchInput");
      const query = input ? input.value.trim() : "";
      if (query) pushRecentSearch(query);
      window.location.href = basePath + SHOP_PAGE + (query ? "?search=" + encodeURIComponent(query) : "");
    });
    document.getElementById("enhancedSearch")?.addEventListener("click", (event) => {
      const recentLink = event.target.closest("[data-recent-search-link]");
      if (recentLink) pushRecentSearch(recentLink.getAttribute("data-recent-search-link"));
      const trendingLink = event.target.closest("[data-trending-search-link]");
      if (trendingLink) pushRecentSearch(trendingLink.getAttribute("data-trending-search-link"));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeSearch(basePath);
      closeMobileMenu();
    });

    document.querySelector("[data-header-mobile-trigger]")?.addEventListener("click", (event) => {
      event.preventDefault();
      openMobileMenu();
    });
    document.querySelector("[data-mobile-menu-close]")?.addEventListener("click", (event) => {
      event.preventDefault();
      closeMobileMenu();
    });
    document.getElementById("navBackground")?.addEventListener("click", () => {
      closeMobileMenu();
    });
    document.getElementById("nav")?.addEventListener("click", (event) => {
      const branchTrigger = event.target.closest("li.wChild > a");
      if (branchTrigger && branchTrigger.nextElementSibling && branchTrigger.nextElementSibling.classList.contains("acitem")) {
        event.preventDefault();
        const branch = branchTrigger.parentElement;
        const submenu = branchTrigger.nextElementSibling;
        const shouldOpen = !branch.classList.contains("is-open");
        Array.from(branch.parentElement ? branch.parentElement.children : []).forEach((sibling) => {
          if (sibling !== branch && sibling.classList) collapseMobileBranch(sibling);
        });
        collapseMobileBranch(branch);
        if (shouldOpen) {
          branch.classList.add("is-open");
          submenu.style.display = "block";
          submenu.style.left = "0";
        }
        return;
      }
      const clickedLink = event.target.closest("#nav a[href]");
      if (clickedLink) closeMobileMenu();
    });

    document.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-auth-menu-trigger]");
      if (trigger) {
        const root = trigger.closest("[data-auth-menu-root]");
        const menu = root && root.querySelector("[data-auth-menu]");
        if (menu) {
          const shouldOpen = menu.classList.contains("hidden");
          menu.classList.toggle("hidden", !shouldOpen);
          trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
        }
        return;
      }
      const logout = event.target.closest("[data-auth-logout]");
      if (logout) {
        Promise.resolve(window.AuctioAuth.logout()).then(() => { window.location.href = basePath + "index.html"; });
        return;
      }
      document.querySelectorAll("[data-auth-menu]").forEach((menu) => {
        if (!menu.closest("[data-auth-menu-root]")?.contains(event.target)) menu.classList.add("hidden");
      });
    });
  }

  function init() {
    const basePath = getBasePath();
    ensureNewsletterCleanup();
    replaceHeader(basePath);
    replaceFooter(basePath);
    removeNewsletterBlocks();
    ensureMobileMenu(basePath);
    ensureSearchDialog(basePath);
    renderAuthControls(basePath);
    bindInteractions(basePath);
    setBasketCount(readCartCount());
    refreshRemoteCartCount();
    if (!shellWaitsForRenderer()) revealShell();
    window.addEventListener("hip:cart-updated", (event) => {
      const items = Array.isArray(event.detail && event.detail.items) ? event.detail.items : [];
      const count = items.reduce((sum, item) => sum + Math.max(1, Number(item && item.quantity || 1)), 0);
      setBasketCount(count);
    });
  }

  window.__AUCTIO_HEADER = { getBasePath };
  window.AuctioAuth = Object.assign(window.AuctioAuth || {}, {
    getCurrentUser,
    refreshCurrentUser,
    getStoredUsers: () => [],
    register: registerAuthUser,
    login: loginAuthUser,
    requestPasswordReset: (email, redirectTo) => backend().requestPasswordReset(email, redirectTo),
    authRedirectUrl: (path) => backend().authRedirectUrl ? backend().authRedirectUrl(path) : new URL(path || "", window.location.origin + "/").toString(),
    logout: logoutAuthUser,
    updatePassword: (newPassword) => backend().updatePassword(newPassword),
    getProfile: () => backend().getProfile(),
    saveProfile: (profile) => backend().saveProfile(profile),
    getCustomerAddresses: () => backend().getCustomerAddresses ? backend().getCustomerAddresses() : Promise.resolve([]),
    saveCustomerAddress: (address) => backend().saveCustomerAddress ? backend().saveCustomerAddress(address) : backend().saveProfile(address),
    deleteCustomerAddress: (addressId) => backend().deleteCustomerAddress ? backend().deleteCustomerAddress(addressId) : Promise.resolve(true),
    getCustomerOrders: () => backend().getCustomerOrders(),
    buildAuthPageUrl,
    getPostAuthRedirect,
  });

  window.addEventListener(AUTH_EVENT, () => renderAuthControls(getBasePath()));
  window.addEventListener("auctio:auth", () => renderAuthControls(getBasePath()));

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
