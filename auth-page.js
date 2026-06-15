(function () {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getBasePath() {
    return window.__AUCTIO_HEADER && window.__AUCTIO_HEADER.getBasePath
      ? window.__AUCTIO_HEADER.getBasePath()
      : "";
  }

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

  var COUNTRY_OPTIONS = [
    ["United Kingdom (excluding Channel Islands)", "gb"],
    ["Afghanistan", "af"],
    ["Albania", "al"],
    ["Algeria", "dz"],
    ["American Samoa", "as"],
    ["Andorra", "ad"],
    ["Angola", "ao"],
    ["Anguilla", "ai"],
    ["Antarctica", "aq"],
    ["Antigua And Barbuda", "ag"],
    ["Argentina", "ar"],
    ["Armenia", "am"],
    ["Aruba", "aw"],
    ["Australia", "au"],
    ["Austria", "at"],
    ["Azerbaijan", "az"],
    ["Bahamas", "bs"],
    ["Bahrain", "bh"],
    ["Bangladesh", "bd"],
    ["Barbados", "bb"],
    ["Belgium", "be"],
    ["Belize", "bz"],
    ["Bermuda", "bm"],
    ["Brazil", "br"],
    ["Bulgaria", "bg"],
    ["Canada", "ca"],
    ["Chile", "cl"],
    ["China", "cn"],
    ["Colombia", "co"],
    ["Croatia", "hr"],
    ["Cyprus", "cy"],
    ["Czech Republic", "cz"],
    ["Denmark", "dk"],
    ["Egypt", "eg"],
    ["Estonia", "ee"],
    ["Finland", "fi"],
    ["France", "fr"],
    ["Georgia", "ge"],
    ["Germany", "de"],
    ["Gibraltar", "gi"],
    ["Greece", "gr"],
    ["Guernsey", "gg"],
    ["Hong Kong", "hk"],
    ["Hungary", "hu"],
    ["Iceland", "is"],
    ["India", "in"],
    ["Indonesia", "id"],
    ["Ireland", "ie"],
    ["Isle Of Man", "im"],
    ["Italy", "it"],
    ["Japan", "jp"],
    ["Jersey", "je"],
    ["Korea, Republic Of", "kr"],
    ["Kuwait", "kw"],
    ["Latvia", "lv"],
    ["Lithuania", "lt"],
    ["Luxembourg", "lu"],
    ["Malaysia", "my"],
    ["Malta", "mt"],
    ["Mexico", "mx"],
    ["Netherlands", "nl"],
    ["New Zealand", "nz"],
    ["Norway", "no"],
    ["Poland", "pl"],
    ["Portugal", "pt"],
    ["Romania", "ro"],
    ["Singapore", "sg"],
    ["Slovakia", "sk"],
    ["South Africa", "za"],
    ["Spain", "es"],
    ["Sweden", "se"],
    ["Switzerland", "ch"],
    ["Turkey", "tr"],
    ["United Arab Emirates", "ae"],
    ["United States", "us"],
    ["Vietnam", "vn"],
  ];

  function countryOptionsHtml(selectedCode) {
    return COUNTRY_OPTIONS.map(function (item) {
      var selected = item[1] === selectedCode ? ' selected="selected"' : "";
      return '<option value="' + escapeHtml(item[0] + "|" + item[1]) + '" data-postcode="1"' + selected + ' data-postcodelookupsupported="1">' + escapeHtml(item[0]) + '</option>';
    }).join("");
  }

  function renderShell(content) {
    var root = document.querySelector("[data-auth-root]");
    if (!root) return;
    root.innerHTML = '<section class="py-10 lg:py-16"><div class="container mx-auto px-4 lg:px-8">' + content + '</div></section>';
    revealShell();
  }

  function renderRaw(content) {
    var root = document.querySelector("[data-auth-root]");
    if (!root) return;
    root.innerHTML = content;
    revealShell();
  }

  function renderGuestOnlyPage(basePath) {
    document.title = "Guest Checkout | The Hip Store";
    ensureClassicAccountStyles();
    renderRaw(`
      <div id="accountPage" class="accountLogin">
        <div id="accountPageContent">
          <div class="maxWidth">
            <div id="accountTitle">
              <h1>Guest checkout</h1>
            </div>
            <div id="accountContent" style="display:block;max-width:720px">
              <div class="fs-mod">
                <div class="fs-mod-ttl">
                  <h3>Account features are currently unavailable</h3>
                </div>
                <div class="fs-mod-cnt">
                  <div class="fs-grp">
                    <div class="fs-row inf">
                      <p>You can still place an order as a guest. Add products to your bag, enter your delivery details, choose a payment method, and place the order without signing in.</p>
                    </div>
                  </div>
                  <div class="fs-grp">
                    <div class="fs-row but act hlb">
                      <label></label>
                      <span><a class="btn btn-level1 large" href="${basePath}shop.html">Continue shopping</a></span>
                    </div>
                    <div class="fs-row lnk hlb">
                      <label></label>
                      <span><a href="${basePath}checkout/index.html" class="forgotPasswordLink">Go to checkout</a></span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="legalRequirementMessage">
                <p class="privacyNotice">We will use checkout information in accordance with our <a href="${basePath}privacy.html" class="privacy-statement" target="_blank">Privacy Policy</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>`);
  }

  function ensureClassicAccountStyles() {
    if (document.getElementById("classic-account-style")) return;
    document.head.insertAdjacentHTML("beforeend", `<style id="classic-account-style">
      .maxWidth{width:100%;max-width:1180px;margin:0 auto;padding:0 14px}
      #accountPage,#accountPage *{box-sizing:border-box;font-family:"Open Sans",Arial,Helvetica,sans-serif;letter-spacing:0}
      #accountPage{background:#fff;color:#111}
      #accountPage a{color:inherit}
      #accountPage button,#accountPage input,#accountPage select{font:inherit}
      #accountPage #breads{border-bottom:1px solid #e7e8e9;background:#fff}
      #accountPage #breads .maxWidth{display:flex;flex-wrap:wrap;align-items:center;gap:5px;padding-top:10px;padding-bottom:10px}
      #accountPage #breads span{display:inline-flex;align-items:center;color:#646464;font-size:10px;font-weight:700;line-height:1.4;text-transform:none}
      #accountPage #breads span.active{color:#111}
      #accountPage #breads span.no i{display:inline-flex;align-items:center;justify-content:center;margin-left:5px;color:#999;font-style:normal}
      #accountPage #breads span.no i::before{content:"›";font-size:12px;line-height:1}
      #accountPageContent{padding:28px 0 44px}
      #accountTitle h1{margin:0 0 22px;font-size:32px;font-weight:900;line-height:1.05;text-transform:none}
      #accountContent{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:start}
      .fs{display:block;margin:0}
      .fs-mod{border:1px solid #e7e8e9;background:#fff}
      .fs-mod-ttl{padding:16px 18px;border-bottom:1px solid #e7e8e9}
      .fs-mod-ttl h2,.fs-mod-ttl h3{margin:0;font-size:20px;font-weight:800;line-height:1.2;text-transform:none}
      .fs-mod-cnt{padding:18px}
      .fs-grp + .fs-grp{margin-top:18px}
      .fs-row{display:grid;grid-template-columns:130px minmax(0,1fr);gap:14px;align-items:start;margin-bottom:14px}
      .fs-row:last-child{margin-bottom:0}
      .fs-row label{display:block;padding-top:11px;font-size:12px;font-weight:700;line-height:1.35;color:#111;text-transform:none}
      .fs-row.inp > span,.fs-row.sel > span,.fs-row.but > span,.fs-row.lnk > span,.fs-row.chk > span{display:block;position:relative}
      .fs-row.inp input,.fs-row.sel select{width:100%;height:42px;border:1px solid #cfcfcf;border-radius:0;padding:0 12px;background:#fff;color:#111;font-size:14px;outline:none}
      .fs-row.sel select{appearance:auto}
      .fs-row.inp input:focus,.fs-row.sel select:focus{border-color:#111}
      .fs-row.but label,.fs-row.lnk label{padding-top:0}
      .fs-row.inf{display:block}
      .fs-row.inf p{margin:0;color:#555;font-size:13px;line-height:1.75}
      .btn.btn-level1.large{display:inline-flex;align-items:center;justify-content:center;min-height:42px;width:auto;min-width:220px;border:1px solid #111;border-radius:0;background:#111;padding:0 20px;color:#fff;font-size:12px;font-weight:900;line-height:1;text-transform:none;cursor:pointer}
      .btn.btn-level1.large:hover{background:#222}
      .btn.btn-level1.large:disabled{cursor:not-allowed;opacity:.62}
      .btn.btn-level3{display:inline-flex;align-items:center;justify-content:center;min-height:38px;border:1px solid #111;border-radius:0;background:#fff;padding:0 16px;color:#111;font-size:12px;font-weight:900;cursor:pointer}
      .forgotPasswordLink,.privacy-statement{text-decoration:underline;text-underline-offset:3px}
      .fs-row.lnk span{padding-top:3px}
      .fs-row.lnk a{font-size:12px;font-weight:700;line-height:1.5}
      .legalRequirementMessage{margin-top:22px;border-top:1px solid #e7e8e9;padding-top:16px}
      .privacyNotice{margin:0;color:#666;font-size:12px;line-height:1.6;text-align:center}
      .accountCreate #accountContent{display:block}
      .accountCreate .fs-mod{margin-bottom:18px}
      .accountCreate .accountCreateButton{border:0}
      .accountCreate .accountCreateButton .fs-mod-cnt{padding:0}
      .accountCreate .accountCreateButton .legalRequirementMessage{margin-top:0}
      .accountCreate .fs-row.inp > span,.accountCreate .fs-row.sel > span,.accountAddressForm .fs-row.inp > span{padding-right:34px}
      .accountCreate .fs-row.inp input,.accountCreate .fs-row.sel select,.accountAddressForm .fs-row.inp input{padding-right:36px}
      .accountCreate .inputErr,.accountAddressForm .inputErr{display:none;grid-column:2;margin:8px 34px 0 0;color:#b00020;font-size:12px;font-weight:700;line-height:1.45}
      .accountCreate .inputErr i,.accountAddressForm .inputErr i{display:none}
      .accountCreate .fs-row.has-error .inputErr,.accountAddressForm .fs-row.has-error .inputErr{display:block}
      .accountCreate .passwordRules{display:flex;flex-direction:column;gap:2px}
      .accountCreate .passwordRules span{display:block}
      .accountCreate .tooltipIcon,.accountAddressForm .tooltipIcon{position:absolute;top:50%;right:0;display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;margin:0;border:0;border-radius:999px;background:#9b9b9b;color:#fff;font-size:13px;font-weight:900;line-height:1;transform:translateY(-50%);vertical-align:middle}
      .accountCreate .tooltipIcon::before,.accountAddressForm .tooltipIcon::before{content:"i"}
      .accountCreate .tooltipIcon.is-valid,.accountAddressForm .tooltipIcon.is-valid{background:#000;color:#fff}
      .accountCreate .tooltipIcon.is-valid::before,.accountAddressForm .tooltipIcon.is-valid::before{content:"";width:9px;height:5px;border-left:2px solid #fff;border-bottom:2px solid #fff;transform:rotate(-45deg) translate(1px,-1px)}
      .accountCreate .tooltipIcon.is-invalid,.accountAddressForm .tooltipIcon.is-invalid{background:#b00020;color:#fff}
      .accountCreate .tooltipIcon.is-invalid::before,.accountAddressForm .tooltipIcon.is-invalid::before{content:"×";font-size:18px;font-weight:900;line-height:20px}
      .accountCreate .chk input{position:absolute;opacity:0;pointer-events:none}
      .accountCreate .chk label[for]{display:flex;gap:10px;align-items:flex-start;padding-top:0;cursor:pointer}
      .accountCreate .chkbox{display:inline-flex;width:18px;height:18px;flex:0 0 18px;align-items:center;justify-content:center;border:1px solid #111;background:#fff;color:#111;font-size:11px;line-height:1}
      .accountCreate .chk input:not(:checked) + label .chkbox i{visibility:hidden}
      .accountCreate .chk input:checked + label .chkbox i::before{content:"";display:block;width:8px;height:4px;border-left:2px solid #111;border-bottom:2px solid #111;transform:rotate(-45deg)}
      .accountCreate .chk .label{display:block;color:#333;font-size:12px;font-weight:400;line-height:1.55}
      .accountCreate #shippingAddressHolder{max-height:0;overflow:hidden;transition:max-height .2s ease}
      .accountCreate #shippingAddressHolder.is-open{max-height:2200px!important}
      .accountCreate .formInputInactiveOverlay{display:none}
      .accountPasswordReset #accountContent{display:block;max-width:620px}
      .accountLogin [data-auth-error],.accountCreate [data-auth-error],.accountPasswordReset [data-auth-error]{margin:0 0 12px;color:#b00020;font-size:12px;font-weight:700;line-height:1.5}
      .accountLogin [data-auth-error].success,.accountCreate [data-auth-error].success,.accountPasswordReset [data-auth-error].success{color:#207245}
      .accountDashboard #accountPageContent{padding:24px 0 46px}
      .accountDashboard #accountContent{display:block}
      .accountDashboard #breads.searchCrumbs{display:none!important}
      .accountDashboard #breads.defaultBreadcrumbs{display:block}
      .accountDashboard #breads span{text-transform:none}
      .accountDashboard #breads span.no i::before{content:"›";font-size:12px;line-height:1}
      #accountLeft{float:left;width:255px;padding-right:22px}
      #accountRight.splitRight{overflow:hidden}
      .splitRightContainer{width:100%;min-height:420px}
      .splitLeftList{margin:0;padding:0;list-style:none;border:1px solid #dcdcdc;border-bottom:0;background:#fff}
      .splitLeftList li{margin:0;border-bottom:1px solid #dcdcdc}
      .splitLeftList .btn.btn-default{position:relative;display:flex;min-height:46px;align-items:center;justify-content:space-between;width:100%;border:0;background:#fff;padding:0 14px;color:#111;font-size:13px;font-weight:800;line-height:1.25;text-align:left;text-decoration:none;text-transform:none}
      .splitLeftList .btn.btn-default.active,.splitLeftList .btn.btn-default:hover{background:#111;color:#fff!important}
      .splitLeftList .btn.btn-default.active .accountNavLabel,.splitLeftList .btn.btn-default:hover .accountNavLabel,.splitLeftList .btn.btn-default.active i,.splitLeftList .btn.btn-default:hover i{color:#fff!important}
      .splitLeftList .accountNavLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .splitLeftList .btn.btn-default i{flex:0 0 auto;margin-left:10px;color:inherit;font-style:normal}
      .splitLeftList .fa-angle-right::before{content:"›";font-size:18px;line-height:1}
      .splitLeftList .fa-external-link::before{content:"↗";font-size:13px;line-height:1}
      .splitTitle h1{margin:0 0 18px;color:#111;font-size:32px;font-weight:900;line-height:1.1;text-transform:none}
      .dashboard-list{margin:0 0 18px;border:1px solid #dcdcdc;background:#fff}
      .dashboard-list ul{margin:0;padding:0;list-style:none}
      .dashboard-list-item{display:flex;min-height:96px;align-items:center;justify-content:space-between;gap:18px;padding:18px}
      .dashboard-list-item-left{min-width:0}
      .dashboard-list-item-left h3{margin:0 0 8px;color:#111;font-size:18px;font-weight:800;line-height:1.2;text-transform:none}
      .dashboard-list-item-left p{margin:0;color:#555;font-size:13px;font-weight:400;line-height:1.55}
      .dashboard-list-item-right{flex:0 0 auto}
      .dashboard-list-item-right .btn.btn-default{display:inline-flex;min-height:38px;align-items:center;justify-content:center;border:1px solid #111;background:#fff;padding:0 16px;color:#111;font-size:12px;font-weight:900;text-decoration:none;text-transform:none}
      .dashboard-list-item-right .btn.btn-default:hover{background:#111;color:#fff}
      .dashboard-list-item-right .fa{display:inline-flex;margin-right:7px;font-style:normal}
      .dashboard-list-item-right .fa-pencil::before{content:"✎";font-size:13px;line-height:1}
      [data-account-flash]{margin:0 0 16px;border:1px solid #f0c2c2;background:#fff7f7;padding:10px 12px;color:#b00020;font-size:13px;font-weight:800;line-height:1.45}
      [data-account-flash].success{border-color:#bfe3c4;background:#f6fff7;color:#207245}
      .accountOrdersList{display:grid;gap:12px}
      .accountAddressToolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:16px}
      .accountAddressToolbar p{margin:0;color:#555;font-size:13px;line-height:1.5}
      .accountAddressList{display:grid;gap:12px;margin:0 0 18px;padding:0;list-style:none}
      .accountAddressCard{border:1px solid #dcdcdc;background:#fff;padding:16px}
      .accountAddressCardHeader{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px}
      .accountAddressCard h3{margin:0;color:#111;font-size:16px;font-weight:900;line-height:1.25;text-transform:none}
      .accountAddressBadge{display:inline-flex;align-items:center;margin-left:8px;border:1px solid #111;padding:2px 7px;color:#111;font-size:10px;font-weight:900;line-height:1;text-transform:uppercase}
      .accountAddressCard address{margin:0;color:#333;font-size:13px;font-style:normal;line-height:1.55}
      .accountAddressCard .muted{color:#666}
      .accountAddressActions{display:flex;flex:0 0 auto;gap:8px}
      .accountAddressActions .btn.btn-default,.accountAddressToolbar .btn.btn-default,.accountAddressFormActions .btn.btn-default{display:inline-flex;min-height:36px;align-items:center;justify-content:center;border:1px solid #111;background:#fff;padding:0 13px;color:#111;font-size:12px;font-weight:900;text-decoration:none;text-transform:none}
      .accountAddressActions .btn.btn-default:hover,.accountAddressToolbar .btn.btn-default:hover,.accountAddressFormActions .btn.btn-default:hover{background:#111;color:#fff!important}
      .accountAddressActions .btn.btn-default.danger{border-color:#b00020;color:#b00020}
      .accountAddressActions .btn.btn-default.danger:hover{background:#b00020;color:#fff!important}
      .accountAddressEmpty{border:1px dashed #cfcfcf;background:#fafafa;padding:18px;color:#555;font-size:13px;line-height:1.55}
      .accountAddressForm.is-hidden{display:none}
      .accountAddressFormActions{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
      .accountDashboard .legalRequirementMessage{margin-top:22px;border-top:0;padding-top:0}
      .accountDashboard .privacyNotice{text-align:left}
      .clr{clear:both}
      @media(max-width:760px){
        #accountContent{grid-template-columns:1fr}
        .fs-row{grid-template-columns:1fr;gap:7px}
        .fs-row label{padding-top:0}
        .accountCreate .inputErr,.accountAddressForm .inputErr{grid-column:1;margin-right:0;margin-left:0}
        .accountCreate .fs-row.inp > span,.accountCreate .fs-row.sel > span,.accountAddressForm .fs-row.inp > span{padding-right:30px}
        .btn.btn-level1.large{width:100%;min-width:0}
        #accountLeft{float:none;width:100%;padding-right:0;margin-bottom:20px}
        #accountRight.splitRight{overflow:visible}
        .dashboard-list-item{align-items:flex-start;flex-direction:column}
        .dashboard-list-item-right .btn.btn-default{width:100%}
        .accountAddressToolbar,.accountAddressCardHeader{align-items:flex-start;flex-direction:column}
        .accountAddressActions,.accountAddressToolbar .btn.btn-default{width:100%}
        .accountAddressActions .btn.btn-default{flex:1}
      }
      @media(max-width:520px){
        #accountPage #breads{display:none}
        #accountPageContent{padding-top:18px;padding-bottom:32px}
        .maxWidth{padding:0 12px}
        #accountTitle h1{margin-bottom:18px;font-size:28px}
        .fs-mod-ttl{padding:14px 14px 12px}
        .fs-mod-cnt{padding:14px}
        .fs-mod-ttl h3{font-size:18px}
      }
    </style>`);
  }

  function renderGuestAccountPage(basePath) {
    return `
      <div id="accountPage" class="accountLogin">
        <div id="accountPageContent">
          <div class="maxWidth">
            <div id="accountTitle">
              <h1>Login</h1>
            </div>
            <div id="accountContent">
              <form class="fs" id="loginForm">
                <div class="fs-mod">
                  <div class="fs-mod-ttl">
                    <h3>Existing Customers</h3>
                  </div>
                  <div class="fs-mod-cnt">
                    <div class="fs-grp">
                      <div class="fs-row inp req">
                        <label>Email address</label>
                        <span><input class="" type="email" id="username" value="" data-e2e="login-loginForm-email"></span>
                      </div>
                      <div class="fs-row inp req">
                        <label>Password</label>
                        <span><input class="" type="password" id="password" data-e2e="login-loginForm-password"></span>
                      </div>
                    </div>
                    <div class="fs-grp">
                      <div class="fs-row but act hlb">
                        <label></label>
                        <span><p data-auth-error class="hidden" role="alert" aria-live="polite"></p><button type="submit" class="btn btn-level1 large" id="doLogin" data-e2e="login-loginForm-submitBtn">Sign In</button></span>
                      </div>
                      <div class="fs-row lnk hlb">
                        <label></label>
                        <span><a href="${basePath}forgot-password.html" class="forgotPasswordLink">Forgotten your password?</a></span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <form class="fs" id="createForm" action="/myaccount/register">
                <div class="fs-mod">
                  <div class="fs-mod-ttl">
                    <h3>New to Hip Store?</h3>
                  </div>
                  <div class="fs-mod-cnt">
                    <div class="fs-grp">
                      <div class="fs-row inf">
                        <p>
                          Get our latest product recommendations for you.<br>
                          Personalise your experience on mobile, tablet and desktop.<br>
                          Manage your orders and preferences.<br>
                          Access your saved items.<br>
                          Create and share gift lists.
                        </p>
                      </div>
                    </div>
                    <div class="fs-grp">
                      <div class="fs-row but act nlb">
                        <label></label>
                        <span><button type="submit" data-e2e="login-register-registerButton" class="btn btn-level1 large" id="">Register for an account</button></span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div class="legalRequirementMessage">
            <p class="privacyNotice">We will use your information in accordance with our <a href="privacy.html" class="privacy-statement" target="_blank">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>`;
  }

  function getAccountView() {
    var path = window.location.pathname.replace(/\/+/g, "/").toLowerCase();
    var tab = new URLSearchParams(window.location.search || "").get("tab");
    if (path.indexOf("/myaccount/info") !== -1 || tab === "settings") return "info";
    if (path.indexOf("/myaccount/addressbook") !== -1) return "addressbook";
    if (path.indexOf("/myaccount/orders") !== -1 || tab === "orders") return "orders";
    if (path.indexOf("/myaccount/promotional-preferences") !== -1) return "promotional-preferences";
    if (path.indexOf("/myaccount/password") !== -1) return "password";
    if (path.indexOf("/myaccount/logout") !== -1) return "logout";
    return "dashboard";
  }

  function accountPath(basePath, view) {
    var routes = {
      dashboard: "myaccount/dashboard/",
      info: "myaccount/info/",
      addressbook: "myaccount/addressbook/",
      orders: "myaccount/orders/",
      "promotional-preferences": "myaccount/promotional-preferences/",
      password: "myaccount/password/",
      logout: "myaccount/logout/",
    };
    return basePath + (routes[view] || routes.dashboard);
  }

  function accountTitle(view) {
    return {
      dashboard: "My Account",
      info: "Contact Details",
      addressbook: "My Addresses",
      orders: "My Orders",
      "promotional-preferences": "Promotional Preferences",
      password: "Change Password",
    }[view] || "My Account";
  }

  function profileField(profile, user, key, fallbackKey) {
    profile = profile || {};
    user = user || {};
    return profile[key] || user[fallbackKey || key] || "";
  }

  function fullNameFromProfile(user, profile) {
    var firstName = profileField(profile, user, "first_name", "firstName");
    var lastName = profileField(profile, user, "last_name", "lastName");
    return String((firstName + " " + lastName).trim() || (user && user.email) || "Customer");
  }

  function addressSummary(profile) {
    profile = profile || {};
    return [profile.address, profile.city, profile.state, profile.postal_code, countryLabel(profile.country)].filter(Boolean).join(", ") || "No saved address.";
  }

  function countryLabel(value) {
    return String(value || "").split("|")[0] || "";
  }

  function cleanInput(value) {
    return String(value == null ? "" : value).trim();
  }

  function hasLetter(value) {
    return /[A-Za-z]/.test(value) || /[^\W\d_]/u.test(value);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput(value));
  }

  function isValidName(value) {
    var text = cleanInput(value);
    return text.length >= 2 && hasLetter(text) && !/\d/.test(text);
  }

  function isValidPhone(value) {
    var text = cleanInput(value);
    var digits = text.replace(/\D/g, "");
    return /^[+\d\s().-]+$/.test(text) && digits.length >= 7 && digits.length <= 20;
  }

  function isValidAddressLine(value) {
    var text = cleanInput(value);
    return text.length >= 5 && hasLetter(text);
  }

  function isValidOptionalAddressLine(value) {
    var text = cleanInput(value);
    return !text || (text.length >= 2 && (hasLetter(text) || /\d/.test(text)));
  }

  function isValidTown(value) {
    var text = cleanInput(value);
    return text.length >= 2 && hasLetter(text);
  }

  function isValidPostcode(value) {
    var text = cleanInput(value);
    return text.length >= 3 && text.length <= 12 && /[A-Za-z0-9]/.test(text) && /^[A-Za-z0-9][A-Za-z0-9 -]*[A-Za-z0-9]$/.test(text);
  }

  function isValidCountry(value) {
    var text = cleanInput(countryLabel(value) || value);
    return text.length >= 2 && hasLetter(text);
  }

  function addressValue(address, key) {
    address = address || {};
    if (key === "address2") return address.address_2 || address.address2 || "";
    if (key === "postalCode") return address.postal_code || address.postalCode || "";
    if (key === "firstName") return address.first_name || address.firstName || "";
    if (key === "lastName") return address.last_name || address.lastName || "";
    if (key === "isDefault") return address.is_default === true || address.isDefault === true;
    return address[key] || "";
  }

  function hasAddressValue(address) {
    return ["address", "address2", "city", "state", "postalCode", "country"].some(function (key) {
      return String(addressValue(address, key) || "").trim();
    });
  }

  function normalizeAccountAddress(address, user, profile, index) {
    address = address || {};
    profile = profile || {};
    user = user || {};
    return {
      id: address.id || "",
      label: address.label || (index === 0 ? "Default Address" : "Delivery Address"),
      first_name: addressValue(address, "firstName") || profileField(profile, user, "first_name", "firstName"),
      last_name: addressValue(address, "lastName") || profileField(profile, user, "last_name", "lastName"),
      phone: address.phone || profileField(profile, user, "phone", "phone"),
      address: address.address || "",
      address_2: addressValue(address, "address2"),
      city: address.city || "",
      state: address.state || "",
      postal_code: addressValue(address, "postalCode"),
      country: address.country || "",
      is_default: addressValue(address, "isDefault") || index === 0,
      is_profile_fallback: address.is_profile_fallback === true,
    };
  }

  function accountAddresses(user, profile, addresses) {
    var rows = Array.isArray(addresses) ? addresses : [];
    var normalized = rows
      .map(function (address, index) { return normalizeAccountAddress(address, user, profile, index); })
      .filter(hasAddressValue);
    if (!normalized.length && hasAddressValue(profile || {})) {
      normalized.push(normalizeAccountAddress({
        id: "profile",
        label: "Default Address",
        first_name: profileField(profile, user, "first_name", "firstName"),
        last_name: profileField(profile, user, "last_name", "lastName"),
        phone: profileField(profile, user, "phone", "phone"),
        address: profile.address || "",
        city: profile.city || "",
        state: profile.state || "",
        postal_code: profile.postal_code || "",
        country: profile.country || "",
        is_default: true,
        is_profile_fallback: true,
      }, user, profile, 0));
    }
    return normalized;
  }

  function defaultAccountAddress(user, profile, addresses) {
    var rows = accountAddresses(user, profile, addresses);
    return rows.find(function (address) { return address.is_default; }) || rows[0] || null;
  }

  function addressSummaryFromAddress(address) {
    if (!address) return "No saved address.";
    return [address.address, address.address_2, address.city, address.state, address.postal_code, countryLabel(address.country)].filter(Boolean).join(", ") || "No saved address.";
  }

  function addressName(user, profile, address) {
    var firstName = addressValue(address, "firstName") || profileField(profile, user, "first_name", "firstName");
    var lastName = addressValue(address, "lastName") || profileField(profile, user, "last_name", "lastName");
    return String((firstName + " " + lastName).trim());
  }

  function addressJson(address) {
    return escapeHtml(JSON.stringify(address || {}));
  }

  function readMarketingPreferences(profile) {
    profile = profile || {};
    return {
      email: profile.marketing_email !== false,
      sms: profile.marketing_sms === true,
      personalized: profile.marketing_personalized !== false,
    };
  }

  function accountNavHtml(basePath, activeView) {
    function item(view, label, attrs) {
      var active = activeView === view ? " active" : "";
      var current = active ? ' aria-current="page"' : "";
      return '<li><a class="btn btn-default' + active + '" href="' + accountPath(basePath, view) + '"' + current + (attrs || "") + '><span class="accountNavLabel">' + escapeHtml(label) + '</span><i class="fa fa-angle-right"></i></a></li>';
    }
    return '' +
      '<ul class="splitLeftList">' +
      item("dashboard", "Dashboard") +
      item("info", "Contact Details") +
      item("addressbook", "My Addresses") +
      item("orders", "My Orders", ' data-e2e="dashboard-orders-tab"') +
      item("promotional-preferences", "Promotional Preferences") +
      item("password", "Change Password") +
      item("logout", "Sign Out", " data-account-signout") +
      '</ul>';
  }

  function inputRow(label, name, value, type, autocomplete, attrs) {
    return '<div class="fs-row inp"><label>' + escapeHtml(label) + '</label><span><input type="' + (type || "text") + '" name="' + escapeHtml(name) + '" value="' + escapeHtml(value || "") + '" autocomplete="' + escapeHtml(autocomplete || "") + '"' + (attrs || "") + '></span></div>';
  }

  function addressInputRow(label, name, value, type, autocomplete, errorText, required) {
    return '<div class="fs-row inp address-validate-row' + (required ? " req" : "") + '"><label>' + escapeHtml(label) + '</label><span><input type="' + (type || "text") + '" name="' + escapeHtml(name) + '" value="' + escapeHtml(value || "") + '" autocomplete="' + escapeHtml(autocomplete || "") + '"><span class="tooltipIcon" aria-label="Information"></span></span><div class="inputErr"><i></i><p>' + escapeHtml(errorText || "Please enter a valid value.") + '</p></div></div>';
  }

  function renderContactDetailsView(user, profile) {
    return '' +
      '<form class="fs" data-account-contact-form>' +
      '<div class="fs-mod"><div class="fs-mod-ttl"><h3>Contact Details</h3></div><div class="fs-mod-cnt">' +
      '<div class="fs-grp">' +
      inputRow("First name", "firstName", profileField(profile, user, "first_name", "firstName"), "text", "given-name") +
      inputRow("Surname", "lastName", profileField(profile, user, "last_name", "lastName"), "text", "family-name") +
      inputRow("Email address", "email", profileField(profile, user, "email", "email"), "email", "email", " readonly") +
      inputRow("Telephone", "phone", profileField(profile, user, "phone", "phone"), "tel", "tel") +
      '</div>' +
      '<div class="fs-grp"><div class="fs-row but act hlb"><label></label><span><button type="submit" class="btn btn-level1 large">Save contact details</button></span></div></div>' +
      '</div></div>' +
      '</form>';
  }

  function renderAddressCard(user, profile, address) {
    var name = addressName(user, profile, address);
    var label = address.label || (address.is_default ? "Default Address" : "Delivery Address");
    var lines = [address.address, address.address_2, address.city, address.state, address.postal_code, countryLabel(address.country)].filter(Boolean);
    return '' +
      '<li class="accountAddressCard" data-address-card data-address-id="' + escapeHtml(address.id || "") + '" data-address-json="' + addressJson(address) + '">' +
      '<div class="accountAddressCardHeader">' +
      '<div><h3>' + escapeHtml(label) + (address.is_default ? '<span class="accountAddressBadge">Default</span>' : "") + '</h3>' +
      (name ? '<p class="muted">' + escapeHtml(name) + '</p>' : "") + '</div>' +
      '<div class="accountAddressActions">' +
      '<button type="button" class="btn btn-default" data-address-edit>Edit</button>' +
      '<button type="button" class="btn btn-default danger" data-address-delete>Delete</button>' +
      '</div></div>' +
      '<address>' + (lines.length ? lines.map(escapeHtml).join("<br>") : "No address details saved.") + (address.phone ? '<br><span class="muted">' + escapeHtml(address.phone) + '</span>' : "") + '</address>' +
      '</li>';
  }

  function renderAddressBookView(user, profile, addresses) {
    var rows = accountAddresses(user, profile, addresses);
    var hasRows = rows.length > 0;
    return '' +
      '<div class="fs-mod"><div class="fs-mod-ttl"><h3>My Addresses</h3></div><div class="fs-mod-cnt">' +
      '<div class="accountAddressToolbar"><p>Save delivery addresses here so checkout can reuse your details.</p><button type="button" class="btn btn-default" data-address-add>Add New Address</button></div>' +
      (hasRows
        ? '<ul class="accountAddressList">' + rows.map(function (address) { return renderAddressCard(user, profile, address); }).join("") + '</ul>'
        : '<div class="accountAddressEmpty">You do not have any saved addresses yet.</div>') +
      '<form class="fs accountAddressForm' + (hasRows ? ' is-hidden' : '') + '" data-account-address-form>' +
      '<input type="hidden" name="addressId" value="">' +
      '<div class="fs-mod-ttl"><h3 data-address-form-title>' + (hasRows ? "Add New Address" : "Add Your Address") + '</h3></div><div class="fs-mod-cnt">' +
      '<div class="fs-grp">' +
      inputRow("Label", "label", "Delivery Address", "text", "section-address") +
      addressInputRow("First name", "firstName", profileField(profile, user, "first_name", "firstName"), "text", "given-name", "Please enter a valid first name.", true) +
      addressInputRow("Surname", "lastName", profileField(profile, user, "last_name", "lastName"), "text", "family-name", "Please enter a valid surname.", true) +
      addressInputRow("Telephone", "phone", profileField(profile, user, "phone", "phone"), "tel", "tel", "Please enter a valid telephone number.", true) +
      addressInputRow("Address line 1", "address", "", "text", "street-address", "Please enter a valid address line.", true) +
      addressInputRow("Address line 2", "address2", "", "text", "address-line2", "Please enter valid extra address details.", false) +
      addressInputRow("Town/City", "city", "", "text", "address-level2", "Please enter a valid town or city.", true) +
      addressInputRow("County/State", "state", "", "text", "address-level1", "Please enter a valid county or state.", false) +
      addressInputRow("Postcode", "postalCode", "", "text", "postal-code", "Please enter a valid postcode.", true) +
      addressInputRow("Country", "country", "", "text", "country-name", "Please enter a valid country.", true) +
      '<div class="fs-row chk hlb"><label></label><span><input type="checkbox" id="addressDefault" name="isDefault" checked="checked"><label for="addressDefault"><span class="chkbox"><i class="fa fa-check"></i></span><span class="label">Use as default delivery address.</span></label></span></div>' +
      '</div>' +
      '<div class="fs-grp"><div class="fs-row but act hlb"><label></label><span class="accountAddressFormActions"><button type="submit" class="btn btn-level1 large">Save address</button><button type="button" class="btn btn-default" data-address-cancel>Cancel</button></span></div></div>' +
      '</div></form>' +
      '</div></div>';
  }

  function renderOrdersView(basePath, orders) {
    return orders && orders.length
      ? '<div class="accountOrdersList">' + orders.map(function (order) { return orderCard(order, basePath); }).join("") + '</div>'
      : '<div class="dashboard-list"><ul><li class="dashboard-list-item"><div class="dashboard-list-item-left"><h3>No orders yet</h3><p>You currently have no orders on record.</p></div><div class="dashboard-list-item-right"><a class="btn btn-default" href="' + basePath + 'shop.html">Start Shopping</a></div></li></ul></div>';
  }

  function renderPromotionalPreferencesView(profile) {
    var prefs = readMarketingPreferences(profile);
    function checked(value) { return value ? ' checked="checked"' : ""; }
    return '' +
      '<form class="fs" data-account-prefs-form>' +
      '<div class="fs-mod"><div class="fs-mod-ttl"><h3>Promotional Preferences</h3></div><div class="fs-mod-cnt">' +
      '<div class="fs-grp">' +
      '<div class="fs-row chk hlb"><label></label><span><input type="checkbox" id="prefEmail" name="email"' + checked(prefs.email) + '><label for="prefEmail"><span class="chkbox"><i class="fa fa-check"></i></span><span class="label">Email me about new drops, launches and offers.</span></label></span></div>' +
      '<div class="fs-row chk hlb"><label></label><span><input type="checkbox" id="prefSms" name="sms"' + checked(prefs.sms) + '><label for="prefSms"><span class="chkbox"><i class="fa fa-check"></i></span><span class="label">Send me SMS updates about important offers.</span></label></span></div>' +
      '<div class="fs-row chk hlb"><label></label><span><input type="checkbox" id="prefPersonalized" name="personalized"' + checked(prefs.personalized) + '><label for="prefPersonalized"><span class="chkbox"><i class="fa fa-check"></i></span><span class="label">Use my browsing and order activity to personalise recommendations.</span></label></span></div>' +
      '</div>' +
      '<div class="fs-grp"><div class="fs-row but act hlb"><label></label><span><button type="submit" class="btn btn-level1 large">Save preferences</button></span></div></div>' +
      '</div></div>' +
      '</form>';
  }

  function renderPasswordView() {
    return '' +
      '<form class="fs" data-account-password-form>' +
      '<div class="fs-mod"><div class="fs-mod-ttl"><h3>Change Password</h3></div><div class="fs-mod-cnt">' +
      '<div class="fs-grp infoBasic"><div class="fs-row inf"><p>Password must be at least 8 characters.</p></div></div>' +
      '<div class="fs-grp">' +
      inputRow("New password", "newPassword", "", "password", "new-password") +
      inputRow("Confirm password", "confirmPassword", "", "password", "new-password") +
      '</div>' +
      '<div class="fs-grp"><div class="fs-row but act hlb"><label></label><span><button type="submit" class="btn btn-level1 large">Update password</button></span></div></div>' +
      '</div></div>' +
      '</form>';
  }

  function renderDashboardView(basePath, user, profile, orders, addresses) {
    var fullName = fullNameFromProfile(user, profile).toLowerCase();
    var email = profileField(profile, user, "email", "email") || "Not set";
    var phone = profileField(profile, user, "phone", "phone") || "Not set";
    var address = defaultAccountAddress(user, profile, addresses);
    return '' +
      '<div class="dashboard-list"><ul><li class="dashboard-list-item"><div class="dashboard-list-item-left"><h3>' + escapeHtml(fullName) + '</h3><p>' + escapeHtml(email) + '<br>' + escapeHtml(phone) + '</p></div><div class="dashboard-list-item-right"><a class="btn btn-default" href="' + accountPath(basePath, "info") + '"><i class="fa fa-pencil"></i>Edit</a></div></li></ul></div>' +
      '<div class="dashboard-list"><ul><li class="dashboard-list-item"><div class="dashboard-list-item-left"><h3>My Addresses</h3><p>' + escapeHtml(addressSummaryFromAddress(address)) + '</p></div><div class="dashboard-list-item-right"><a class="btn btn-default" href="' + accountPath(basePath, "addressbook") + '"><i class="fa fa-pencil"></i>Edit</a></div></li></ul></div>' +
      '<div class="dashboard-list"><ul><li class="dashboard-list-item"><div class="dashboard-list-item-left"><h3>My Orders</h3><p>' + (orders && orders.length ? "You have " + orders.length + " order" + (orders.length === 1 ? "" : "s") + " on record." : "You currently have no orders on record.") + '</p></div><div class="dashboard-list-item-right"><a class="btn btn-default" href="' + accountPath(basePath, "orders") + '">View</a></div></li></ul></div>';
  }

  function renderDashboardAccountPage(basePath, user, data, activeView, flash) {
    data = data || {};
    user = user || {};
    activeView = activeView || "dashboard";
    var profile = data.profile || {};
    var orders = data.orders || [];
    var addresses = data.addresses || [];
    var privacyHref = basePath + "privacy.html";
    var content = "";

    if (activeView === "info") content = renderContactDetailsView(user, profile);
    else if (activeView === "addressbook") content = renderAddressBookView(user, profile, addresses);
    else if (activeView === "orders") content = renderOrdersView(basePath, orders);
    else if (activeView === "promotional-preferences") content = renderPromotionalPreferencesView(profile);
    else if (activeView === "password") content = renderPasswordView();
    else content = renderDashboardView(basePath, user, profile, orders, addresses);

    return `
      <div id="accountPage" class="accountDashboard">
        <div id="breads" class="searchCrumbs" style="display: none;">
          <div class="maxWidth"></div>
        </div>
        <div id="breads" class="defaultBreadcrumbs">
          <div class="maxWidth">
            <span class="no">
              <a href="/">
                <span>Home</span>
                <i></i>
              </a>
              <meta content="1">
            </span>
            <span class="active">
              <a>
                <span>${escapeHtml(accountTitle(activeView))}</span>
              </a>
              <meta content="2">
            </span>
          </div>
        </div>
        <div id="accountPageContent">
          <div class="maxWidth">
            <div id="accountLeft">
              ${accountNavHtml(basePath, activeView)}
            </div>
            <div id="accountRight" class="splitRight">
              <div class="splitRightContainer">
                <div id="accountTitle" class="splitTitle">
                  <h1>${escapeHtml(accountTitle(activeView))}</h1>
                </div>
                <div id="accountContent">
                  ${flash ? '<p data-account-flash class="' + (/(saved|updated)/i.test(flash) ? "success" : "") + '">' + escapeHtml(flash) + '</p>' : ""}
                  ${content}
                </div>
                <div class="legalRequirementMessage">
                  <p class="privacyNotice">We will use your information in accordance with our <a href="${escapeHtml(privacyHref)}" class="privacy-statement" target="_blank">Privacy Policy</a>.</p>
                </div>
              </div>
            </div>
            <div class="clr"></div>
          </div>
        </div>
      </div>`;
  }

  function bindDashboardAccountPage(basePath, user, data, helpers) {
    var signOut = document.querySelector("[data-account-signout]");
    if (signOut) {
      signOut.addEventListener("click", async function (event) {
        event.preventDefault();
        await window.AuctioAuth.logout();
        window.location.href = basePath + "index.html";
      });
    }

    function profilePayloadFromCurrent(values) {
      var profile = (data && data.profile) || {};
      return {
        firstName: values.firstName != null ? values.firstName : profileField(profile, user, "first_name", "firstName"),
        lastName: values.lastName != null ? values.lastName : profileField(profile, user, "last_name", "lastName"),
        phone: values.phone != null ? values.phone : profileField(profile, user, "phone", "phone"),
        address: values.address != null ? values.address : profileField(profile, user, "address"),
        city: values.city != null ? values.city : profileField(profile, user, "city"),
        state: values.state != null ? values.state : profileField(profile, user, "state"),
        postalCode: values.postalCode != null ? values.postalCode : profileField(profile, user, "postal_code"),
        country: values.country != null ? values.country : profileField(profile, user, "country"),
        marketingEmail: values.marketingEmail != null ? values.marketingEmail : profile.marketing_email !== false,
        marketingSms: values.marketingSms != null ? values.marketingSms : profile.marketing_sms === true,
        marketingPersonalized: values.marketingPersonalized != null ? values.marketingPersonalized : profile.marketing_personalized !== false,
      };
    }

    var contactForm = document.querySelector("[data-account-contact-form]");
    if (contactForm) {
      contactForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var button = contactForm.querySelector("button[type=submit]");
        var formData = new FormData(contactForm);
        setButton(button, true, "Save contact details", "Saving...");
        try {
          await window.AuctioAuth.saveProfile(profilePayloadFromCurrent({
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: formData.get("phone"),
          }));
          await helpers.reload("Contact details saved.");
        } catch (error) {
          helpers.flash(error.message || "Unable to save contact details.");
        }
      });
    }

    var addressForm = document.querySelector("[data-account-address-form]");
    if (addressForm) {
      var addressRows = accountAddresses(user, (data && data.profile) || {}, (data && data.addresses) || []);
      var addressTitle = addressForm.querySelector("[data-address-form-title]");
      var hasRenderedAddresses = addressRows.length > 0;

      function setAddressField(name, value) {
        var field = addressForm.querySelector('[name="' + name + '"]');
        if (!field) return;
        if (field.type === "checkbox") field.checked = Boolean(value);
        else field.value = value == null ? "" : String(value);
      }

      function showAddressForm(address) {
        address = address || {};
        addressForm.classList.remove("is-hidden");
        if (addressTitle) addressTitle.textContent = address.id ? "Edit Address" : "Add New Address";
        setAddressField("addressId", address.id && address.id !== "profile" ? address.id : "");
        setAddressField("label", address.label || "Delivery Address");
        setAddressField("firstName", addressValue(address, "firstName") || profileField((data && data.profile) || {}, user, "first_name", "firstName"));
        setAddressField("lastName", addressValue(address, "lastName") || profileField((data && data.profile) || {}, user, "last_name", "lastName"));
        setAddressField("phone", address.phone || profileField((data && data.profile) || {}, user, "phone", "phone"));
        setAddressField("address", address.address || "");
        setAddressField("address2", addressValue(address, "address2"));
        setAddressField("city", address.city || "");
        setAddressField("state", address.state || "");
        setAddressField("postalCode", addressValue(address, "postalCode"));
        setAddressField("country", countryLabel(address.country));
        setAddressField("isDefault", address.id ? addressValue(address, "isDefault") : true);
        validateAddressForm(false);
        addressForm.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }

      function addressField(name) {
        return addressForm.querySelector('[name="' + name + '"]');
      }

      function setAddressFieldState(name, valid, force) {
        var field = addressField(name);
        var row = field && field.closest(".fs-row");
        var icon = row && row.querySelector(".tooltipIcon");
        var value = cleanInput(field && field.value);
        var optionalEmpty = (name === "address2" || name === "state") && !value;
        if (icon) {
          icon.classList.toggle("is-valid", !optionalEmpty && valid);
          icon.classList.toggle("is-invalid", !valid && (force || value.length > 0));
          icon.setAttribute("aria-label", !optionalEmpty && valid ? "Valid" : !valid && (force || value.length > 0) ? "Invalid" : "Information");
        }
        if (row) row.classList.toggle("has-error", !valid && (force || value.length > 0));
      }

      function validateAddressField(name, force) {
        var field = addressField(name);
        var value = cleanInput(field && field.value);
        var valid = true;
        if (name === "firstName" || name === "lastName") valid = isValidName(value);
        else if (name === "phone") valid = isValidPhone(value);
        else if (name === "address") valid = isValidAddressLine(value);
        else if (name === "address2" || name === "state") valid = isValidOptionalAddressLine(value);
        else if (name === "city") valid = isValidTown(value);
        else if (name === "postalCode") valid = isValidPostcode(value);
        else if (name === "country") valid = isValidCountry(value);
        if (!field) return true;
        setAddressFieldState(name, valid, force);
        return valid;
      }

      function validateAddressForm(force) {
        return ["firstName", "lastName", "phone", "address", "address2", "city", "state", "postalCode", "country"].reduce(function (valid, name) {
          return validateAddressField(name, force) && valid;
        }, true);
      }

      function hideAddressForm() {
        if (hasRenderedAddresses) addressForm.classList.add("is-hidden");
      }

      document.querySelectorAll("[data-address-add]").forEach(function (button) {
        button.addEventListener("click", function () {
          showAddressForm({});
        });
      });

      document.querySelectorAll("[data-address-edit]").forEach(function (button) {
        button.addEventListener("click", function () {
          var card = button.closest("[data-address-card]");
          var address = {};
          try {
            address = JSON.parse(card && card.getAttribute("data-address-json") || "{}");
          } catch (_error) {
            address = {};
          }
          showAddressForm(address);
        });
      });

      document.querySelectorAll("[data-address-delete]").forEach(function (button) {
        button.addEventListener("click", async function () {
          var card = button.closest("[data-address-card]");
          var addressId = card && card.getAttribute("data-address-id");
          if (!addressId) return;
          if (!window.confirm("Delete this address?")) return;
          setButton(button, true, "Delete", "Deleting...");
          try {
            if (window.AuctioAuth.deleteCustomerAddress) await window.AuctioAuth.deleteCustomerAddress(addressId);
            else await window.AuctioAuth.saveProfile(profilePayloadFromCurrent({ address: "", city: "", state: "", postalCode: "", country: "" }));
            await helpers.reload("Address deleted.");
          } catch (error) {
            helpers.flash(error.message || "Unable to delete address.");
          }
        });
      });

      var cancelAddress = addressForm.querySelector("[data-address-cancel]");
      if (cancelAddress) {
        cancelAddress.addEventListener("click", function () {
          hideAddressForm();
        });
      }

      ["firstName", "lastName", "phone", "address", "address2", "city", "state", "postalCode", "country"].forEach(function (name) {
        var field = addressField(name);
        if (!field) return;
        field.addEventListener("input", function () { validateAddressField(name, false); });
        field.addEventListener("change", function () { validateAddressField(name, false); });
        field.addEventListener("blur", function () { validateAddressField(name, true); });
      });
      validateAddressForm(false);

      addressForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var button = addressForm.querySelector("button[type=submit]");
        var formData = new FormData(addressForm);
        if (!validateAddressForm(true)) {
          helpers.flash("Please check the address fields marked in red.");
          return;
        }
        setButton(button, true, "Save address", "Saving...");
        try {
          var addressPayload = {
            id: formData.get("addressId"),
            label: formData.get("label"),
            firstName: formData.get("firstName"),
            lastName: formData.get("lastName"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            address2: formData.get("address2"),
            city: formData.get("city"),
            state: formData.get("state"),
            postalCode: formData.get("postalCode"),
            country: formData.get("country"),
            isDefault: Boolean(addressForm.querySelector("[name=isDefault]") && addressForm.querySelector("[name=isDefault]").checked),
          };
          if (window.AuctioAuth.saveCustomerAddress) await window.AuctioAuth.saveCustomerAddress(addressPayload);
          else {
            await window.AuctioAuth.saveProfile(profilePayloadFromCurrent({
              firstName: addressPayload.firstName,
              lastName: addressPayload.lastName,
              phone: addressPayload.phone,
              address: addressPayload.address,
              city: addressPayload.city,
              state: addressPayload.state,
              postalCode: addressPayload.postalCode,
              country: addressPayload.country,
            }));
          }
          await helpers.reload("Address saved.");
        } catch (error) {
          helpers.flash(error.message || "Unable to save address.");
        }
      });
    }

    var prefsForm = document.querySelector("[data-account-prefs-form]");
    if (prefsForm) {
      prefsForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var button = prefsForm.querySelector("button[type=submit]");
        setButton(button, true, "Save preferences", "Saving...");
        try {
          await window.AuctioAuth.saveProfile(profilePayloadFromCurrent({
            marketingEmail: Boolean(prefsForm.querySelector("[name=email]") && prefsForm.querySelector("[name=email]").checked),
            marketingSms: Boolean(prefsForm.querySelector("[name=sms]") && prefsForm.querySelector("[name=sms]").checked),
            marketingPersonalized: Boolean(prefsForm.querySelector("[name=personalized]") && prefsForm.querySelector("[name=personalized]").checked),
          }));
          await helpers.reload("Preferences saved.");
        } catch (error) {
          helpers.flash(error.message || "Unable to save preferences.");
        }
      });
    }

    var passwordForm = document.querySelector("[data-account-password-form]");
    if (passwordForm) {
      passwordForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        var button = passwordForm.querySelector("button[type=submit]");
        var formData = new FormData(passwordForm);
        var nextPassword = String(formData.get("newPassword") || "");
        var confirmPassword = String(formData.get("confirmPassword") || "");
        if (nextPassword.length < 8) {
          helpers.flash("Password must be at least 8 characters.");
          return;
        }
        if (nextPassword !== confirmPassword) {
          helpers.flash("Passwords do not match.");
          return;
        }
        setButton(button, true, "Update password", "Updating...");
        try {
          await window.AuctioAuth.updatePassword(nextPassword);
          helpers.flash("Password updated.");
        } catch (error) {
          helpers.flash(error.message || "Unable to update password.");
        }
      });
    }
  }

  function addressRows(prefix, autocompletePrefix, hidden) {
    var style = hidden ? ' style="display: none;"' : "";
    return `
      <div class="fs-grp infoAddress">
        <div class="fs-row inp req PCA_autocompletable"${style}>
          <label for="${prefix}Address1">Address Line 1</label>
          <span>
            <input class="address1" type="text" value="" id="${prefix}Address1" name="${prefix}Address1" autocomplete="${autocompletePrefix} address-line1" maxlength="30">
            <span class="tooltipIcon" data-info="Address is a required field."></span>
          </span>
          <div class="inputErr"><i></i><p>Please enter a valid address line.</p></div>
        </div>
        <div class="fs-row inp PCA_autocompletable"${style}>
          <label for="${prefix}Address2">Address Line 2</label>
          <span>
            <input class="address2" type="text" value="" id="${prefix}Address2" name="${prefix}Address2" autocomplete="${autocompletePrefix} address-line2" maxlength="30">
            <span class="tooltipIcon" data-info="Optionally provide extra address details."></span>
          </span>
          <div class="inputErr"><i></i><p>Please enter valid extra address details.</p></div>
        </div>
        <div class="fs-row inp req PCA_autocompletable"${style}>
          <label for="${prefix}Town">Town/City</label>
          <span>
            <input class="town" type="text" value="" id="${prefix}Town" name="${prefix}Town" autocomplete="${autocompletePrefix} address-level2" maxlength="30">
            <span class="tooltipIcon" data-info="Address is a required field."></span>
          </span>
          <div class="inputErr"><i></i><p>Please enter a valid town or city.</p></div>
        </div>
        <div class="fs-row county-row inp PCA_autocompletable"${style}>
          <label class="addressFormCountyLabel" for="${prefix}CountyInp">County</label>
          <span>
            <input class="county county-inp" type="text" value="" id="${prefix}CountyInp" name="${prefix}County" autocomplete="${autocompletePrefix} address-level1" maxlength="30">
            <span class="tooltipIcon" data-info="Optionally provide extra address details."></span>
          </span>
          <div class="inputErr"><i></i><p>Please enter a valid county.</p></div>
        </div>
      </div>`;
  }

  function renderForgotPasswordPage(basePath, mode, message, success) {
    var recovery = mode === "recovery";
    var complete = mode === "complete";
    var sent = mode === "sent";
    var title = recovery ? "Reset password" : "Forgotten your password?";
    var formTitle = recovery ? "Choose a new password" : "Password reset";
    var formHtml = "";

    if (complete) {
      formHtml =
        '<div class="fs-mod">' +
        '<div class="fs-mod-ttl"><h3>Password updated</h3></div>' +
        '<div class="fs-mod-cnt">' +
        '<div class="fs-grp"><div class="fs-row inf"><p>Your password has been updated. You can now open your account.</p></div></div>' +
        '<div class="fs-grp"><div class="fs-row but act hlb"><label></label><span><a class="btn btn-level1 large" href="' + basePath + 'account.html">Go to my account</a></span></div></div>' +
        '</div>' +
        '</div>';
    } else if (sent) {
      formHtml =
        '<div class="fs-mod">' +
        '<div class="fs-mod-ttl"><h3>Check your email</h3></div>' +
        '<div class="fs-mod-cnt">' +
        '<div class="fs-grp"><div class="fs-row inf"><p>If an account exists for this email, we have sent a secure password reset link.</p></div></div>' +
        '<div class="fs-grp"><div class="fs-row but act hlb"><label></label><span><a class="btn btn-level1 large" href="' + basePath + 'login.html">Back to sign in</a></span></div></div>' +
        '</div>' +
        '</div>';
    } else if (recovery) {
      formHtml =
        '<form class="fs" id="resetPasswordForm">' +
        '<div class="fs-mod">' +
        '<div class="fs-mod-ttl"><h3>' + formTitle + '</h3></div>' +
        '<div class="fs-mod-cnt">' +
        '<div class="fs-grp">' +
        '<div class="fs-row inp req"><label>New password</label><span><input type="password" id="newPassword" autocomplete="new-password" data-e2e="forgot-newPassword"></span></div>' +
        '<div class="fs-row inp req"><label>Confirm password</label><span><input type="password" id="confirmNewPassword" autocomplete="new-password" data-e2e="forgot-confirmPassword"></span></div>' +
        '</div>' +
        '<div class="fs-grp">' +
        '<div class="fs-row but act hlb"><label></label><span><p data-auth-error class="' + (message ? (success ? "success" : "") : "hidden") + '" role="alert" aria-live="polite">' + escapeHtml(message || "") + '</p><button type="submit" class="btn btn-level1 large" data-e2e="forgot-updatePassword">Update password</button></span></div>' +
        '<div class="fs-row lnk hlb"><label></label><span><a href="' + basePath + 'login.html" class="forgotPasswordLink">Back to sign in</a></span></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</form>';
    } else {
      formHtml =
        '<form class="fs" id="forgotPasswordForm">' +
        '<div class="fs-mod">' +
        '<div class="fs-mod-ttl"><h3>' + formTitle + '</h3></div>' +
        '<div class="fs-mod-cnt">' +
        '<div class="fs-grp"><div class="fs-row inf"><p>Enter the email address linked to your account and we will send you a secure password reset link.</p></div></div>' +
        '<div class="fs-grp"><div class="fs-row inp req"><label>Email address</label><span><input type="email" id="forgotEmail" autocomplete="email" data-e2e="forgot-email"></span></div></div>' +
        '<div class="fs-grp">' +
        '<div class="fs-row but act hlb"><label></label><span><p data-auth-error class="' + (message ? (success ? "success" : "") : "hidden") + '" role="alert" aria-live="polite">' + escapeHtml(message || "") + '</p><button type="submit" class="btn btn-level1 large" data-e2e="forgot-submit">Send reset link</button></span></div>' +
        '<div class="fs-row lnk hlb"><label></label><span><a href="' + basePath + 'login.html" class="forgotPasswordLink">Back to sign in</a></span></div>' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</form>';
    }

    return `
      <div id="accountPage" class="accountPasswordReset">
        <div id="accountPageContent">
          <div class="maxWidth">
            <div id="accountTitle"><h1>${title}</h1></div>
            <div id="accountContent">${formHtml}</div>
          </div>
        </div>
      </div>`;
  }

  function addressPredictBlock(prefix, addressId) {
    return `
      <div id="${prefix}AddressPredictHolder" class="fs-grp">
        <div class="formInputInactiveOverlay"></div>
        <div class="fs-row inp">
          <label>Address</label>
          <span>
            <input type="text" id="${addressId}" data-e2e="delivery-addressForm-addressPredictLook" class="addressPredictLook" name="${prefix}AddressPredict" value="" placeholder="Start typing your address or postcode" autocomplete="off" data-locale="gb">
            <span id="${addressId}-results" data-e2e="delivery-addressForm-addressPredictLookResults"></span>
          </span>
        </div>
      </div>
      <div id="${prefix}AddressPredictFindAnother" class="fs-grp" style="display: none">
        <div class="fs-row but hlb">
          <label>&nbsp;</label>
          <span><button id="${prefix}AddressPredictAnotherBtn" class="btn btn-level3" type="button">Find a different address</button></span>
        </div>
      </div>
      <div class="fs-grp enterManually" id="${prefix}EnterManually">
        <div class="fs-row but hlb">
          <label>&nbsp;</label>
          <span><button type="button" class="btn btn-level3" data-address-manual>Or enter address manually</button></span>
        </div>
      </div>`;
  }

  function renderRegisterAccountPage(basePath) {
    var countries = countryOptionsHtml("gb");
    return `
      <div id="accountPage" class="accountCreate">
        <div id="breads">
          <div class="maxWidth">
            <span class="no"><a href="${basePath}index.html">Home</a><i class="fa fa-caret-right"></i></span>
            <span class="no"><a href="${basePath}account.html">My Account</a><i class="fa fa-caret-right"></i></span>
            <span class="active"><span>Register</span></span>
          </div>
        </div>
        <div id="accountPageContent">
          <div class="maxWidth">
            <div id="accountTitle"><h1>Register</h1></div>
            <div id="accountContent">
              <form id="registerCustomerForm" class="fs" method="post">
                <div class="fs-mod">
                  <div class="fs-mod-ttl"><h2>Your Details</h2></div>
                  <div class="fs-mod-cnt">
                    <input type="hidden" name="saveDetails" value="on">
                    <div class="fs-grp">
                      <div class="fs-row inp req tooltip">
                        <label>First name</label>
                        <span><input class="required" type="text" id="firstName" name="firstName" value="" autocomplete="given-name" data-e2e="register-registerForm-firstName" maxlength=""><span class="tooltipIcon" data-info="Please provide your first name. This cannot contain numbers."></span></span>
                      </div>
                      <div class="fs-row inp req tooltip">
                        <label>Surname</label>
                        <span><input class="required" type="text" id="lastName" name="lastName" value="" autocomplete="family-name" data-e2e="register-registerForm-lastName" maxlength=""><span class="tooltipIcon" data-info="Please provide your surname. This cannot contain numbers."></span></span>
                      </div>
                      <div class="fs-row inp req tooltip">
                        <label>Email address</label>
                        <span><input class="required" type="email" id="username" name="email" value="" autocomplete="username" data-e2e="register-registerForm-email"><span class="tooltipIcon" data-info="Email must be entered in the correct format."></span></span>
                        <div class="inputErr"><i></i><p>The email address you entered is incorrect please enter a valid email</p></div>
                      </div>
                      <div class="fs-row inp req tooltip">
                        <label>Telephone</label>
                        <span><input class="required" type="tel" id="phone" name="phone" value="" autocomplete="tel" data-e2e="register-registerForm-phone" maxlength=""><span class="tooltipIcon" data-info="Please enter your phone number."></span></span>
                      </div>
                    </div>
                    <div class="fs-grp infoBasic">
                      <div class="fs-row inf"><p>Password must be 8 characters long and include at least one number. No special characters allowed.</p></div>
                      <div class="fs-row inp req tooltip">
                        <label>Password</label>
                        <span><input class="required" type="password" id="password" name="password" value="" autocomplete="new-password" data-linked="#confirmPassword" data-e2e="register-registerForm-password"><span class="tooltipIcon" data-info="Password must be 8 characters long and include at least one number. No special characters allowed."></span></span>
                        <div class="inputErr"><i></i><p class="passwordRules"><span>Password must be 8 characters long.</span><span>Include at least one number.</span><span>No special characters allowed.</span></p></div>
                      </div>
                      <div class="fs-row inp req tooltip">
                        <label>Confirm password</label>
                        <span><input class="required" type="password" id="confirmPassword" name="confirmPassword" value="" data-validate="matchValue" data-matches="#password" data-e2e="register-registerForm-confirmPassword"><span class="tooltipIcon" data-info="Passwords do not match."></span></span>
                        <div class="inputErr"><i></i><p>Passwords do not match.</p></div>
                      </div>
                      <div id="marketingOptInCheckboxDiv" class="fs-row chk hlb">
                        <label for="marketingOptIn"></label>
                        <span>
                          <input class="valid" type="checkbox" name="marketingOptIn" id="marketingOptIn">
                          <label for="marketingOptIn"><span id="marketingOptInSpan" class="chkbox"><i class="fa fa-check"></i></span><span class="label">We'd like to share our latest launches, offers and new drops with you. Please tick this box if you'd like to hear from us.</span></label>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="fs-mod gb register-billing">
                  <div class="fs-mod-ttl"><h2>Your Billing Address</h2></div>
                  <input type="hidden" name="addressPredictflag" id="addressPredictFlag" value="false">
                  <div class="fs-mod-cnt">
                    <div class="fs-grp">
                      <div class="fs-row sel PCA_autocompletable shippingCountry">
                        <label for="country">Country</label>
                        <span><select name="billingCountry" id="country" class="wider valid">${countries}</select><span class="tooltipIcon info" data-info="Allowed delivery countries"></span></span>
                      </div>
                    </div>
                    <div class="fs-grp" id="billingPostcodeHolder">
                      <div class="fs-row inp req" id="postcodeHolder" style="display: none;">
                        <label for="postcode">Postcode</label>
                        <span><input class="postcode inputAdvancer" type="text" id="postcode" name="billingPostcode" value="" autocomplete="billing postal-code" maxlength=""><span class="tooltipIcon" data-info="Postcode is a required field."></span></span>
                        <div class="inputErr"><i></i><p>Please enter a valid postcode.</p></div>
                      </div>
                    </div>
                    ${addressRows("billing", "billing", true)}
                    ${addressPredictBlock("billing", "addressPredictLook")}
                    <div class="fs-grp infoAddress">
                      <div id="checkboxDiv" class="fs-row chk hlb">
                        <label for="useBillingAddress" class="useBillingAddressLabel"></label>
                        <span>
                          <input class="valid" type="checkbox" name="useBillingAddress" id="useBillingAddress" checked="checked" value="on">
                          <label for="useBillingAddress"><span id="useBillingAddressSpan" class="chkbox" style="cursor: pointer;"><i class="fa fa-check"></i></span><span class="label">Use Billing Address for Delivery</span></label>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div id="shippingAddressHolder" class="fs-mod differentAddress register-delivery gb" style="max-height: 0px; display: block;">
                  <div class="fs-mod-ttl"><h2>Your Delivery Address</h2></div>
                  <div class="fs-mod-cnt">
                    <input type="hidden" name="deliveryAddressPredictFlag" id="deliveryAddressPredictFlag" value="false">
                    <div class="fs-grp infoAddress">
                      <div class="fs-row sel PCA_autocompletable shippingCountry">
                        <label>Country</label>
                        <span><select name="shippingCountry" id="shippingCountry" class="wider valid">${countries}</select></span>
                      </div>
                    </div>
                    <div class="fs-grp" id="shippingPostcodeHolder">
                      <div class="fs-row inp req" id="shippingPostcodeHolderRow" style="display: none;">
                        <label for="shippingPostcode">Postcode</label>
                        <span><input class="postcode inputAdvancer" type="text" id="shippingPostcode" name="shippingPostcode" value="" autocomplete="shipping postal-code" maxlength=""><span class="tooltipIcon" data-info="Postcode is a required field."></span></span>
                        <div class="inputErr"><i></i><p>Please enter a valid postcode.</p></div>
                      </div>
                    </div>
                    ${addressRows("shipping", "shipping", true)}
                    ${addressPredictBlock("shipping", "shippingAddressPredictLook")}
                  </div>
                </div>
                <div class="fs-mod accountCreateButton">
                  <div class="fs-mod-cnt">
                    <div class="fs-grp">
                      <div class="fs-row but act hlb">
                        <label></label>
                        <span><div class="legalRequirementMessage"><p class="privacyNotice">We will use your information in accordance with our <a href="${basePath}privacy.html" class="privacy-statement" target="_blank">Privacy Policy</a>.</p></div></span>
                      </div>
                      <div class="fs-row but act hlb">
                        <label></label>
                        <span><p data-auth-error class="hidden"></p><button type="submit" data-e2e="register-registerForm-registerButton" class="btn btn-level1 large">Register</button></span>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>`;
  }

  function bindGuestAccountForm(basePath) {
    var form = document.getElementById("loginForm");
    var registerForm = document.getElementById("createForm");
    var button = document.getElementById("doLogin");
    var errorNode = form && form.querySelector("[data-auth-error]");
    if (registerForm) {
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        window.location.href = window.AuctioAuth.buildAuthPageUrl("register", basePath);
      });
    }
    if (!form) return;

    function clearLoginError() {
      form.querySelectorAll(".has-error").forEach(function (node) {
        node.classList.remove("has-error");
      });
      if (errorNode) {
        errorNode.textContent = "";
        errorNode.className = "hidden";
      }
    }

    function showLoginError(message, fieldId) {
      if (fieldId) {
        var field = document.getElementById(fieldId);
        var row = field && field.closest(".fs-row");
        if (row) row.classList.add("has-error");
      }
      if (!errorNode) return;
      errorNode.textContent = message || "Unable to sign in.";
      errorNode.className = "";
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearLoginError();
      var email = document.getElementById("username");
      var password = document.getElementById("password");
      var emailValue = String((email && email.value) || "").trim();
      var passwordValue = String((password && password.value) || "");
      if (!emailValue || emailValue.indexOf("@") === -1) {
        showLoginError("Please enter a valid email address.", "username");
        if (email) email.focus();
        return;
      }
      if (!passwordValue) {
        showLoginError("Please enter your password.", "password");
        if (password) password.focus();
        return;
      }
      setButton(button, true, "Sign In", "Signing In...");
      try {
        await window.AuctioAuth.login(emailValue, passwordValue);
        await refreshUser();
        window.location.href = window.AuctioAuth.getPostAuthRedirect(basePath);
      } catch (error) {
        showLoginError(normalizeAuthError(error, "Unable to sign in."), "password");
        setButton(button, false, "Sign In", "Signing In...");
      }
    });
  }

  function authBox(title, subtitle, formHtml, asideHtml) {
    return (
      '<div class="min-h-[calc(100vh-160px)] grid gap-10 lg:grid-cols-2 lg:items-center">' +
      '<div class="mx-auto w-full max-w-md space-y-7">' +
      '<div class="space-y-2"><h1 class="text-4xl font-serif font-bold tracking-tight">' + escapeHtml(title) + '</h1>' +
      '<p class="text-muted-foreground">' + escapeHtml(subtitle) + '</p></div>' +
      formHtml +
      '</div>' +
      '<div class="hidden min-h-[460px] items-center rounded-lg border border-border/60 bg-secondary/30 p-10 lg:flex">' +
      '<div class="max-w-lg space-y-5">' + asideHtml + '</div>' +
      '</div>' +
      '</div>'
    );
  }

  function input(id, label, type, autocomplete, required) {
    return (
      '<label class="block space-y-2" for="' + id + '">' +
      '<span class="text-sm font-medium">' + label + '</span>' +
      '<input id="' + id + '" name="' + id + '" type="' + type + '" autocomplete="' + autocomplete + '" ' + (required ? "required" : "") + ' class="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-11 w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2" />' +
      '</label>'
    );
  }

  function setError(node, message, success) {
    if (!node) return;
    node.textContent = message || "";
    node.className = "rounded-md border px-3 py-2 text-sm " + (success ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700");
    node.classList.toggle("hidden", !message);
  }

  function setButton(button, loading, idleLabel, loadingLabel) {
    if (!button) return;
    button.disabled = !!loading;
    button.textContent = loading ? loadingLabel : idleLabel;
  }

  function normalizeAuthError(error, fallback) {
    var message = String((error && error.message) || fallback || "Unable to sign in.").trim();
    if (/invalid login credentials/i.test(message)) return "Password is incorrect.";
    if (/email not confirmed|confirm your email|confirmation/i.test(message)) return "Please confirm your email address, then sign in.";
    if (/failed to fetch|network/i.test(message)) return "Unable to reach the login service. Please try again.";
    return message;
  }

  async function refreshUser() {
    if (!window.AuctioAuth || !window.AuctioAuth.refreshCurrentUser) return null;
    try {
      return await window.AuctioAuth.refreshCurrentUser();
    } catch (_error) {
      return null;
    }
  }

  async function bindLoginPage(basePath) {
    var current = await refreshUser();
    if (current) {
      window.location.replace(window.AuctioAuth.getPostAuthRedirect(basePath));
      return;
    }
    document.title = "Login | The Hip Store";
    ensureClassicAccountStyles();
    renderRaw(renderGuestAccountPage(basePath));
    bindGuestAccountForm(basePath);
  }

  function getRecoveryMode() {
    var candidates = [
      String(window.location.search || "") + String(window.location.hash || ""),
      String(window.__AUCTIO_INITIAL_AUTH_URL || ""),
    ];
    for (var index = 0; index < candidates.length; index += 1) {
      var value = candidates[index];
      var queryPart = value.split("#")[0] || "";
      var hashPart = value.indexOf("#") >= 0 ? value.slice(value.indexOf("#") + 1) : "";
      var search = new URLSearchParams(queryPart.replace(/^\?/, ""));
      if (search.get("mode") === "recovery" || search.get("type") === "recovery") return "recovery";
      var hash = new URLSearchParams(hashPart.replace(/^#/, ""));
      if (hash.get("type") === "recovery" || hash.has("access_token") || hash.has("refresh_token")) return "recovery";
    }
    return "request";
  }

  async function waitForPasswordRecoverySession() {
    if (!window.HipStoreBackend || typeof window.HipStoreBackend.getClient !== "function") return;
    try {
      var client = await window.HipStoreBackend.getClient();
      await new Promise(function (resolve) {
        var done = false;
        var subscription = null;
        function finish() {
          if (done) return;
          done = true;
          if (subscription && typeof subscription.unsubscribe === "function") subscription.unsubscribe();
          resolve();
        }
        var listener = client.auth.onAuthStateChange(function (event, session) {
          if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session) finish();
        });
        subscription = listener && listener.data && listener.data.subscription;
        client.auth.getSession().then(function (result) {
          if (result && result.data && result.data.session) finish();
        }).catch(function () {});
        window.setTimeout(finish, 1200);
      });
    } catch (_error) {
      // The submit handler will show a concrete message if the recovery link is invalid.
    }
  }

  function setAuthMessage(errorNode, message, success) {
    if (!errorNode) return;
    errorNode.textContent = message || "";
    errorNode.className = message ? (success ? "success" : "") : "hidden";
  }

  function getPasswordResetRedirect(basePath) {
    if (window.AuctioAuth && typeof window.AuctioAuth.authRedirectUrl === "function") {
      var configuredTarget = new URL(window.AuctioAuth.authRedirectUrl("forgot-password.html"));
      configuredTarget.searchParams.set("mode", "recovery");
      return configuredTarget.toString();
    }
    var target = new URL(basePath + "forgot-password.html", window.location.href);
    target.searchParams.set("mode", "recovery");
    return target.toString();
  }

  async function bindForgotPasswordPage(basePath) {
    var mode = getRecoveryMode();
    document.title = mode === "recovery" ? "Reset Password | The Hip Store" : "Forgotten Password | The Hip Store";
    ensureClassicAccountStyles();
    renderRaw(renderForgotPasswordPage(basePath, mode));

    if (mode === "recovery") {
      await waitForPasswordRecoverySession();
      var resetForm = document.getElementById("resetPasswordForm");
      var resetButton = resetForm && resetForm.querySelector("button[type=submit]");
      var resetError = resetForm && resetForm.querySelector("[data-auth-error]");
      if (!resetForm) return;
      resetForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        setAuthMessage(resetError, "");
        var nextPassword = String((document.getElementById("newPassword") || {}).value || "");
        var confirmPassword = String((document.getElementById("confirmNewPassword") || {}).value || "");
        if (nextPassword.length < 8) {
          setAuthMessage(resetError, "Password must be at least 8 characters.");
          return;
        }
        if (nextPassword !== confirmPassword) {
          setAuthMessage(resetError, "Passwords do not match.");
          return;
        }
        setButton(resetButton, true, "Update password", "Updating...");
        try {
          await window.AuctioAuth.updatePassword(nextPassword);
          renderRaw(renderForgotPasswordPage(basePath, "complete"));
        } catch (error) {
          setAuthMessage(resetError, normalizeAuthError(error, "This reset link is invalid or expired. Please request a new link."));
          setButton(resetButton, false, "Update password", "Updating...");
        }
      });
      return;
    }

    function switchToRecoveryIfReady() {
      if (getRecoveryMode() === "recovery" && !document.getElementById("resetPasswordForm")) {
        bindForgotPasswordPage(basePath);
      }
    }
    window.addEventListener("hashchange", switchToRecoveryIfReady, { once: true });
    window.setTimeout(switchToRecoveryIfReady, 50);
    window.setTimeout(switchToRecoveryIfReady, 300);
    window.setTimeout(switchToRecoveryIfReady, 1000);

    var form = document.getElementById("forgotPasswordForm");
    var button = form && form.querySelector("button[type=submit]");
    var errorNode = form && form.querySelector("[data-auth-error]");
    if (!form) return;
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      setAuthMessage(errorNode, "");
      var email = document.getElementById("forgotEmail");
      var emailValue = String((email && email.value) || "").trim();
      if (!emailValue || emailValue.indexOf("@") === -1) {
        setAuthMessage(errorNode, "Please enter a valid email address.");
        if (email) email.focus();
        return;
      }
      setButton(button, true, "Send reset link", "Sending...");
      try {
        await window.AuctioAuth.requestPasswordReset(emailValue, getPasswordResetRedirect(basePath));
        renderRaw(renderForgotPasswordPage(basePath, "sent"));
      } catch (error) {
        setAuthMessage(errorNode, normalizeAuthError(error, "Unable to send a password reset link."));
        setButton(button, false, "Send reset link", "Sending...");
      }
    });
  }

  async function bindRegisterPage(basePath) {
    var current = await refreshUser();
    if (current) {
      window.location.replace(window.AuctioAuth.getPostAuthRedirect(basePath));
      return;
    }

    document.title = "Register | The Hip Store";
    ensureClassicAccountStyles();
    renderRaw(renderRegisterAccountPage(basePath));

    var form = document.getElementById("registerCustomerForm");
    var errorNode = document.querySelector("[data-auth-error]");
    var button = form && form.querySelector("button[type=submit]");
    if (!form) return;

    function fieldValue(fieldId) {
      var field = document.getElementById(fieldId);
      return String((field && field.value) || "").trim();
    }

    function fieldRow(fieldId) {
      var field = document.getElementById(fieldId);
      return field && field.closest(".fs-row");
    }

    function fieldIcon(fieldId) {
      var row = fieldRow(fieldId);
      return row && row.querySelector(".tooltipIcon");
    }

    function setFieldState(fieldId, state, showError) {
      var row = fieldRow(fieldId);
      var icon = fieldIcon(fieldId);
      if (icon) {
        icon.classList.toggle("is-valid", state === "valid");
        icon.classList.toggle("is-invalid", state === "invalid");
        icon.setAttribute("aria-label", state === "valid" ? "Valid" : state === "invalid" ? "Invalid" : "Information");
      }
      if (row) row.classList.toggle("has-error", Boolean(showError));
    }

    function isRowVisible(fieldId) {
      var row = fieldRow(fieldId);
      return !row || row.offsetParent !== null;
    }

    function validateRegisterField(fieldId, force) {
      if (!isRowVisible(fieldId)) {
        setFieldState(fieldId, "info", false);
        return true;
      }
      var value = fieldValue(fieldId);
      var hasValue = value.length > 0;
      var valid = true;
      if (fieldId === "firstName" || fieldId === "lastName") valid = isValidName(value);
      else if (fieldId === "username") valid = isValidEmail(value);
      else if (fieldId === "phone") valid = isValidPhone(value);
      else if (fieldId === "password") valid = /^(?=.*\d)[A-Za-z0-9]{8,}$/.test(value);
      else if (fieldId === "confirmPassword") valid = hasValue && value === fieldValue("password");
      else if (fieldId === "country") valid = isValidCountry(value);
      else if (fieldId === "postcode") valid = isValidPostcode(value);
      else if (fieldId === "billingAddress1") valid = isValidAddressLine(value);
      else if (fieldId === "billingAddress2" || fieldId === "billingCountyInp") valid = isValidOptionalAddressLine(value);
      else if (fieldId === "billingTown") valid = isValidTown(value);
      else valid = true;

      if (!hasValue && (fieldId === "billingAddress2" || fieldId === "billingCountyInp")) {
        setFieldState(fieldId, "info", false);
        return true;
      }
      if (!hasValue && !force) {
        setFieldState(fieldId, "info", false);
        return false;
      }
      setFieldState(fieldId, valid ? "valid" : "invalid", !valid && (force || fieldId === "password"));
      return valid;
    }

    function bindFieldValidation() {
      [
        "firstName",
        "lastName",
        "username",
        "phone",
        "password",
        "confirmPassword",
        "country",
        "postcode",
        "billingAddress1",
        "billingAddress2",
        "billingTown",
        "billingCountyInp",
      ].forEach(function (fieldId) {
        var field = document.getElementById(fieldId);
        if (!field) return;
        function refresh() {
          validateRegisterField(fieldId, false);
          if (fieldId === "password") validateRegisterField("confirmPassword", false);
        }
        field.addEventListener("input", refresh);
        field.addEventListener("change", refresh);
        field.addEventListener("blur", function () {
          validateRegisterField(fieldId, true);
          if (fieldId === "password") validateRegisterField("confirmPassword", false);
        });
      });
    }

    function clearFieldErrors() {
      form.querySelectorAll(".has-error").forEach(function (node) {
        node.classList.remove("has-error");
      });
      if (errorNode) {
        errorNode.textContent = "";
        errorNode.className = "hidden";
      }
    }

    function showRegisterError(message, fieldId, success) {
      if (fieldId) {
        var field = document.getElementById(fieldId);
        var row = field && field.closest(".fs-row");
        if (row) row.classList.add("has-error");
        setFieldState(fieldId, "invalid", true);
      }
      if (!errorNode) return;
      errorNode.textContent = message || "";
      errorNode.className = message ? (success ? "success" : "") : "hidden";
    }

    function showManualAddress(buttonNode) {
      var module = buttonNode && buttonNode.closest(".fs-mod");
      if (!module) return;
      module.querySelectorAll(".PCA_autocompletable").forEach(function (row) {
        row.style.display = "";
      });
      module.querySelectorAll("[id$='PostcodeHolderRow'],#postcodeHolder").forEach(function (row) {
        row.style.display = "";
      });
      var predict = module.querySelector("[id$='AddressPredictHolder']");
      var manual = buttonNode.closest(".enterManually");
      if (predict) predict.style.display = "none";
      if (manual) manual.style.display = "none";
    }

    form.querySelectorAll("[data-address-manual]").forEach(function (manualButton) {
      manualButton.addEventListener("click", function () {
        showManualAddress(manualButton);
        ["postcode", "billingAddress1", "billingAddress2", "billingTown", "billingCountyInp"].forEach(function (fieldId) {
          validateRegisterField(fieldId, false);
        });
      });
    });

    bindFieldValidation();

    var useBillingAddress = document.getElementById("useBillingAddress");
    var shippingHolder = document.getElementById("shippingAddressHolder");
    if (useBillingAddress && shippingHolder) {
      useBillingAddress.addEventListener("change", function () {
        shippingHolder.classList.toggle("is-open", !useBillingAddress.checked);
      });
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      clearFieldErrors();
      var data = new FormData(form);
      if (!validateRegisterField("firstName", true)) {
        showRegisterError("Please provide your first name. This cannot contain numbers.", "firstName");
        return;
      }
      if (!validateRegisterField("lastName", true)) {
        showRegisterError("Please provide your surname. This cannot contain numbers.", "lastName");
        return;
      }
      var email = String(data.get("email") || "").trim();
      var password = String(data.get("password") || "");
      if (!validateRegisterField("username", true)) {
        showRegisterError("The email address you entered is incorrect please enter a valid email", "username");
        return;
      }
      if (!validateRegisterField("phone", true)) {
        showRegisterError("Please enter a valid phone number.", "phone");
        return;
      }
      if (!validateRegisterField("password", true)) {
        showRegisterError("Password must be 8 characters long and include at least one number. No special characters allowed.", "password");
        return;
      }
      if (!validateRegisterField("confirmPassword", true)) {
        showRegisterError("Passwords do not match.", "confirmPassword");
        return;
      }
      showManualAddress(document.querySelector(".register-billing [data-address-manual]"));
      if (!validateRegisterField("country", true)) {
        showRegisterError("Please select a valid country.", "country");
        return;
      }
      if (!validateRegisterField("postcode", true)) {
        showRegisterError("Please enter a valid postcode.", "postcode");
        return;
      }
      if (!validateRegisterField("billingAddress1", true)) {
        showRegisterError("Please enter a valid address line.", "billingAddress1");
        return;
      }
      if (!validateRegisterField("billingAddress2", true)) {
        showRegisterError("Please enter valid extra address details.", "billingAddress2");
        return;
      }
      if (!validateRegisterField("billingTown", true)) {
        showRegisterError("Please enter a valid town or city.", "billingTown");
        return;
      }
      if (!validateRegisterField("billingCountyInp", true)) {
        showRegisterError("Please enter a valid county.", "billingCountyInp");
        return;
      }
      setButton(button, true, "Register", "Registering...");
      try {
        await window.AuctioAuth.register({
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: email,
          phone: data.get("phone"),
          password: password,
          country: data.get("billingCountry"),
          address: data.get("billingAddress1"),
          address2: data.get("billingAddress2"),
          city: data.get("billingTown"),
          state: data.get("billingCounty"),
          postalCode: data.get("billingPostcode"),
        });
        try {
          await window.AuctioAuth.saveProfile({
            firstName: data.get("firstName"),
            lastName: data.get("lastName"),
            phone: data.get("phone"),
            country: data.get("billingCountry"),
            address: data.get("billingAddress1"),
            city: data.get("billingTown"),
            state: data.get("billingCounty"),
            postalCode: data.get("billingPostcode"),
          });
          if (window.AuctioAuth.saveCustomerAddress) {
            await window.AuctioAuth.saveCustomerAddress({
              label: "Default Address",
              firstName: data.get("firstName"),
              lastName: data.get("lastName"),
              phone: data.get("phone"),
              country: data.get("billingCountry"),
              address: data.get("billingAddress1"),
              address2: data.get("billingAddress2"),
              city: data.get("billingTown"),
              state: data.get("billingCounty"),
              postalCode: data.get("billingPostcode"),
              isDefault: true,
            });
          }
        } catch (_profileError) {
          // Registration is the primary action; profile fields can be completed later.
        }
        window.location.href = window.AuctioAuth.getPostAuthRedirect(basePath);
      } catch (error) {
        showRegisterError(error.message || "Unable to create account.", "", Boolean(error.isConfirmEmail));
        setButton(button, false, "Register", "Registering...");
      }
    });
  }

  function formatCurrency(value, currency) {
    var amount = Number(value || 0);
    try {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: currency || "GBP",
        maximumFractionDigits: amount % 1 ? 2 : 0,
      }).format(amount);
    } catch (_error) {
      return (currency || "GBP") + " " + amount.toLocaleString("en-US");
    }
  }

  function formatDate(value) {
    if (!value) return "-";
    var date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "-";
    return date.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
  }

  function normalizeOrder(order) {
    var item = Array.isArray(order.order_items) ? order.order_items[0] : order.item || {};
    return {
      id: order.id || order.order_id || "",
      orderNumber: order.order_number || order.orderId || "",
      createdAt: order.created_at || order.createdAt || "",
      status: order.status || "payment_pending",
      paymentStatus: order.payment_status || "payment_not_configured",
      paymentMethod: order.payment_method || "manual_payment",
      currency: order.currency || "GBP",
      total: Number(order.total || 0),
      title: item.title || order.title || "Product",
      brand: item.brand || order.brand || "",
      sku: item.sku || order.sku || "",
      routeSlug: item.route_slug || order.routeSlug || "",
      size: item.selected_size || order.size || "",
      quantity: Number(item.quantity || order.quantity || 1),
      image: item.image_url || order.image || "",
    };
  }

  function statusBadge(status) {
    var color = status === "completed"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "cancelled"
        ? "bg-gray-100 text-gray-600 border-gray-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
    return '<span class="rounded-md border px-2 py-1 text-xs font-medium ' + color + '">' + escapeHtml(status.replace(/_/g, " ")) + '</span>';
  }

  function orderCard(order, basePath) {
    var href = order.routeSlug ? basePath + "product/index.html?slug=" + encodeURIComponent(order.routeSlug) : basePath + "shop.html";
    return (
      '<div class="rounded-lg border border-border/60 bg-background p-4">' +
      '<div class="flex gap-4">' +
      '<a href="' + href + '" class="h-20 w-20 shrink-0 rounded-md border border-border/50 bg-white">' +
      (order.image ? '<img class="h-full w-full object-contain p-2" src="' + escapeHtml(order.image) + '" alt="' + escapeHtml(order.title) + '" />' : '') +
      '</a>' +
      '<div class="min-w-0 flex-1 space-y-2">' +
      '<div class="flex flex-wrap items-center gap-2">' + statusBadge(order.status) + '<span class="text-xs text-muted-foreground">' + escapeHtml(formatDate(order.createdAt)) + '</span></div>' +
      '<div><p class="text-sm text-muted-foreground">Order ' + escapeHtml(order.orderNumber) + '</p><a class="font-semibold hover:underline line-clamp-1" href="' + href + '">' + escapeHtml(order.title) + '</a></div>' +
      '<p class="text-sm text-muted-foreground">' + escapeHtml(order.brand || "Product") + ' · SKU ' + escapeHtml(order.sku || "N/A") + ' · Size ' + escapeHtml(order.size || "N/A") + '</p>' +
      '<div class="flex flex-wrap gap-4 text-sm"><span>Quantity: ' + escapeHtml(String(order.quantity || 1)) + '</span><span class="font-semibold">Total: ' + formatCurrency(order.total, order.currency) + '</span><span>Payment: ' + escapeHtml(order.paymentStatus.replace(/_/g, " ")) + '</span></div>' +
      '</div></div></div>'
    );
  }

  async function loadAccountData() {
    var profile = null;
    var orders = [];
    var addresses = [];
    try {
      profile = await window.AuctioAuth.getProfile();
    } catch (error) {
      if (error.isBackendConfigError) throw error;
    }
    try {
      if (window.AuctioAuth.getCustomerAddresses) addresses = await window.AuctioAuth.getCustomerAddresses();
    } catch (error) {
      if (error.isBackendConfigError) throw error;
    }
    try {
      var result = await window.AuctioAuth.getCustomerOrders();
      orders = (result.orders || []).map(normalizeOrder);
    } catch (error) {
      if (error.isBackendConfigError) throw error;
    }
    return { profile: profile || {}, orders: orders, addresses: addresses || [] };
  }

  async function bindAccountPage(basePath) {
    var activeView = getAccountView();
    if (activeView === "logout") {
      await window.AuctioAuth.logout();
      window.location.replace(basePath + "index.html");
      return;
    }
    var user = await refreshUser();
    if (!user) {
      document.title = "My Account | The Hip Store";
      window.location.replace(window.AuctioAuth.buildAuthPageUrl("login", basePath));
      return;
    }

    document.title = accountTitle(activeView) + " | The Hip Store";
    ensureClassicAccountStyles();
    var dashboardData = { profile: {}, orders: [], addresses: [] };
    var flash = "";

    async function reloadAccountData(nextFlash) {
      flash = nextFlash || "";
      try {
        dashboardData = await loadAccountData();
      } catch (_error) {
        dashboardData = { profile: {}, orders: [], addresses: [] };
      }
      renderAccount();
    }

    function showFlash(message) {
      flash = message || "";
      renderAccount();
    }

    function renderAccount() {
      renderRaw(renderDashboardAccountPage(basePath, user, dashboardData, activeView, flash));
      bindDashboardAccountPage(basePath, user, dashboardData, {
        reload: reloadAccountData,
        flash: showFlash,
      });
    }

    try {
      dashboardData = await loadAccountData();
    } catch (_error) {
      dashboardData = { profile: {}, orders: [], addresses: [] };
    }
    renderAccount();
    return;

    var activeTab = new URLSearchParams(window.location.search).get("tab") || "overview";
    if (!/^(overview|orders|settings)$/.test(activeTab)) activeTab = "overview";
    var flash = "";

    function tabButton(tab, label) {
      var active = activeTab === tab;
      return '<button type="button" data-account-tab="' + tab + '" class="rounded-md px-4 py-2 text-sm font-medium transition-all ' + (active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground") + '">' + label + '</button>';
    }

    function profileValue(profile, key, fallback) {
      return escapeHtml(profile[key] || fallback || "");
    }

    async function render(data) {
      data = data || await loadAccountData();
      var profile = data.profile || {};
      var orders = data.orders || [];
      var fullName = [profile.first_name || user.firstName, profile.last_name || user.lastName].filter(Boolean).join(" ") || user.email;
      var initials = fullName.split(/\s+/).map(function (part) { return part.charAt(0).toUpperCase(); }).join("").slice(0, 2) || "C";
      var content = "";

      if (activeTab === "orders") {
        content = orders.length
          ? '<div class="space-y-3">' + orders.map(function (order) { return orderCard(order, basePath); }).join("") + '</div>'
          : '<div class="rounded-lg border border-border/60 p-10 text-center"><h2 class="font-serif text-2xl">No orders yet</h2><p class="mt-2 text-muted-foreground">Backend orders will appear here after checkout.</p><a class="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="' + basePath + 'shop.html">Start shopping</a></div>';
      } else if (activeTab === "settings") {
        content =
          '<div class="grid gap-6 lg:grid-cols-2">' +
          '<form data-profile-form class="space-y-4 rounded-lg border border-border/60 p-5">' +
          '<h2 class="font-serif text-2xl">Profile</h2>' +
          '<div class="grid gap-4 sm:grid-cols-2">' +
          '<label class="space-y-2"><span class="text-sm font-medium">First name</span><input name="firstName" value="' + profileValue(profile, "first_name", user.firstName) + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '<label class="space-y-2"><span class="text-sm font-medium">Last name</span><input name="lastName" value="' + profileValue(profile, "last_name", user.lastName) + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '</div>' +
          '<label class="space-y-2"><span class="text-sm font-medium">Phone</span><input name="phone" value="' + profileValue(profile, "phone", user.phone) + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '<label class="space-y-2"><span class="text-sm font-medium">Address</span><input name="address" value="' + profileValue(profile, "address", "") + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '<div class="grid gap-4 sm:grid-cols-2">' +
          '<label class="space-y-2"><span class="text-sm font-medium">City</span><input name="city" value="' + profileValue(profile, "city", "") + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '<label class="space-y-2"><span class="text-sm font-medium">State</span><input name="state" value="' + profileValue(profile, "state", "") + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '</div>' +
          '<div class="grid gap-4 sm:grid-cols-2">' +
          '<label class="space-y-2"><span class="text-sm font-medium">Postcode</span><input name="postalCode" value="' + profileValue(profile, "postal_code", "") + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '<label class="space-y-2"><span class="text-sm font-medium">Country</span><input name="country" value="' + profileValue(profile, "country", "") + '" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '</div>' +
          '<button class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">Save profile</button>' +
          '</form>' +
          '<form data-password-form class="space-y-4 rounded-lg border border-border/60 p-5">' +
          '<h2 class="font-serif text-2xl">Security</h2>' +
          '<label class="space-y-2"><span class="text-sm font-medium">New password</span><input name="newPassword" type="password" autocomplete="new-password" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '<label class="space-y-2"><span class="text-sm font-medium">Confirm password</span><input name="confirmPassword" type="password" autocomplete="new-password" class="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" /></label>' +
          '<button class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" type="submit">Update password</button>' +
          '<p class="text-xs text-muted-foreground">Password changes are sent to Supabase Auth.</p>' +
          '</form>' +
          '</div>';
      } else {
        content =
          '<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">' +
          '<div class="rounded-lg border border-border/60 p-5"><p class="text-sm text-muted-foreground">Orders</p><p class="mt-2 text-3xl font-semibold">' + orders.length + '</p></div>' +
          '<div class="rounded-lg border border-border/60 p-5"><p class="text-sm text-muted-foreground">Payment mode</p><p class="mt-2 text-base font-semibold">Manual</p></div>' +
          '<div class="rounded-lg border border-border/60 p-5"><p class="text-sm text-muted-foreground">Member since</p><p class="mt-2 text-base font-semibold">' + escapeHtml(formatDate(user.createdAt)) + '</p></div>' +
          '</div>' +
          '<div class="rounded-lg border border-border/60 p-5"><h2 class="font-serif text-2xl">Account information</h2><dl class="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt class="text-muted-foreground">Email</dt><dd class="font-medium">' + escapeHtml(user.email) + '</dd></div><div><dt class="text-muted-foreground">Phone</dt><dd class="font-medium">' + escapeHtml(profile.phone || user.phone || "Not set") + '</dd></div><div class="sm:col-span-2"><dt class="text-muted-foreground">Address</dt><dd class="font-medium">' + escapeHtml([profile.address, profile.city, profile.postal_code, profile.country].filter(Boolean).join(", ") || "Not set") + '</dd></div></dl></div>';
      }

      renderShell(
        '<div class="space-y-6">' +
        '<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">' +
        '<div class="flex items-center gap-4"><div class="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">' + escapeHtml(initials) + '</div><div><h1 class="font-serif text-3xl">My account</h1><p class="text-muted-foreground">' + escapeHtml(fullName) + '</p></div></div>' +
        '<button data-account-logout class="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted">Log out</button>' +
        '</div>' +
        '<nav class="flex flex-wrap gap-2">' + tabButton("overview", "Overview") + tabButton("orders", "Orders") + tabButton("settings", "Settings") + '</nav>' +
        (flash ? '<p class="rounded-md border px-3 py-2 text-sm ' + (flash.indexOf("saved") !== -1 || flash.indexOf("updated") !== -1 ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-700") + '">' + escapeHtml(flash) + '</p>' : "") +
        content +
        '</div>'
      );

      document.querySelectorAll("[data-account-tab]").forEach(function (button) {
        button.addEventListener("click", async function () {
          activeTab = button.getAttribute("data-account-tab") || "overview";
          var nextUrl = new URL(window.location.href);
          nextUrl.searchParams.set("tab", activeTab);
          window.history.replaceState({}, "", nextUrl.toString());
          flash = "";
          await render(data);
        });
      });

      var logout = document.querySelector("[data-account-logout]");
      if (logout) {
        logout.addEventListener("click", async function () {
          await window.AuctioAuth.logout();
          window.location.href = basePath + "index.html";
        });
      }

      var profileForm = document.querySelector("[data-profile-form]");
      if (profileForm) {
        profileForm.addEventListener("submit", async function (event) {
          event.preventDefault();
          var values = new FormData(profileForm);
          try {
            await window.AuctioAuth.saveProfile({
              firstName: values.get("firstName"),
              lastName: values.get("lastName"),
              phone: values.get("phone"),
              address: values.get("address"),
              city: values.get("city"),
              state: values.get("state"),
              postalCode: values.get("postalCode"),
              country: values.get("country"),
            });
            flash = "Profile saved.";
            await render(await loadAccountData());
          } catch (error) {
            flash = error.message || "Unable to save profile.";
            await render(data);
          }
        });
      }

      var passwordForm = document.querySelector("[data-password-form]");
      if (passwordForm) {
        passwordForm.addEventListener("submit", async function (event) {
          event.preventDefault();
          var values = new FormData(passwordForm);
          var nextPassword = String(values.get("newPassword") || "");
          if (nextPassword !== String(values.get("confirmPassword") || "")) {
            flash = "Passwords do not match.";
            await render(data);
            return;
          }
          try {
            await window.AuctioAuth.updatePassword(nextPassword);
            flash = "Password updated.";
            await render(data);
          } catch (error) {
            flash = error.message || "Unable to update password.";
            await render(data);
          }
        });
      }
    }

    try {
      await render(await loadAccountData());
    } catch (error) {
      renderShell(
        '<div class="mx-auto max-w-2xl rounded-lg border border-border/60 p-8 text-center">' +
        '<h1 class="font-serif text-3xl">Account backend is not configured</h1>' +
        '<p class="mt-3 text-muted-foreground">' + escapeHtml(error.message || "Supabase configuration is required for account data.") + '</p>' +
        '<a class="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium" href="' + basePath + 'index.html">Back home</a>' +
        '</div>'
      );
    }
  }

  async function init() {
    var page = document.body.getAttribute("data-auth-page");
    var basePath = getBasePath();
    if (page === "login" || page === "register" || page === "forgot-password" || page === "account") {
      renderGuestOnlyPage(basePath);
      return;
    }
    if (!window.AuctioAuth) return;
    if (page === "login") await bindLoginPage(basePath);
    if (page === "register") await bindRegisterPage(basePath);
    if (page === "forgot-password") await bindForgotPasswordPage(basePath);
    if (page === "account") await bindAccountPage(basePath);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
