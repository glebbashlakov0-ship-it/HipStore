(function () {
  var BASE_PATH = "../";
  var SUPABASE_URL = "https://njsnxxiybniocteqbndp.supabase.co";
  var SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qc254eGl5Ym5pb2N0ZXFibmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTM5MzYsImV4cCI6MjA4ODkyOTkzNn0.xZhqA4ASoaHZ36mi3ZYXBTgG4Cvq89sVzXptJCs5mU4";

  function requestSupabase(path) {
    return fetch(SUPABASE_URL + path, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
      },
      cache: "no-store",
    }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function loadJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Failed to load " + path);
      return response.json();
    });
  }

  function loadFallbackLots() {
    return loadJson(BASE_PATH + "data/all-shop-lots.json")
      .then(function (items) {
        return Array.isArray(items) ? items : [];
      })
      .catch(function () {
        return [];
      });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function getLanguage() {
    try {
      return localStorage.getItem("language") || getCookie("language") || "en";
    } catch (_error) {
      return getCookie("language") || "en";
    }
  }

  function getPrimaryImage(images) {
    if (!images || !images.length) return BASE_PATH + "placeholder.svg";
    var primary = images.find(function (image) { return image.is_primary; }) || images[0];
    return primary.image_url || primary.image || BASE_PATH + "placeholder.svg";
  }

  function formatCurrency(value) {
    return "€" + Number(value || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function normalizeLotTranslation(item, language) {
    var translation = (item.lot_translations || []).find(function (entry) {
      return entry.language === language;
    }) || (item.lot_translations || []).find(function (entry) { return entry.language === "en"; });

    if (!translation) return item;

    return {
      id: item.id,
      slug: item.slug,
      title: translation.title || item.title,
      description: translation.description || item.description,
      current_bid: item.current_bid,
      starting_bid: item.starting_bid,
      minimum_increment: item.minimum_increment,
      estimated_value_min: item.estimated_value_min,
      estimated_value_max: item.estimated_value_max,
      lot_images: item.lot_images || [],
      categories: item.categories,
      lot_translations: item.lot_translations || [],
      raw: item,
    };
  }

  function normalizeFallbackLot(item) {
    var categoryName = item.category || "Auction";
    var currentBid = Number(item.currentBid || item.current_bid || 0);
    var startingBid = Number(item.startingBid || item.starting_bid || currentBid || 0);
    var image = item.image || item.image_url || BASE_PATH + "placeholder.svg";
    return {
      id: item.id,
      slug: item.slug,
      title: item.title || "Auction Lot",
      description: item.description || item.title || "",
      current_bid: currentBid,
      starting_bid: startingBid,
      minimum_increment: Number(item.minimum_increment || Math.max(25, Math.round(Math.max(currentBid, startingBid) * 0.05))),
      estimated_value_min: Number(item.estimated_value_min || Math.round(currentBid * 1.1) || startingBid),
      estimated_value_max: Number(item.estimated_value_max || Math.round(currentBid * 1.35) || startingBid),
      lot_images: item.lot_images || [{ image_url: image, is_primary: true }],
      categories: item.categories || { name: categoryName, slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      lot_translations: item.lot_translations || [],
      raw: item,
    };
  }

  function loadLotBundle(slug, language) {
    return loadFallbackLots().then(function (items) {
      var fallbackItem = items.find(function (entry) {
        return entry && entry.slug === slug;
      });
      if (fallbackItem) {
        return normalizeLotTranslation(normalizeFallbackLot(fallbackItem), language);
      }

      return requestSupabase("/rest/v1/lots?select=id,slug,title,description,current_bid,starting_bid,minimum_increment,estimated_value_min,estimated_value_max,lot_images(*),categories(name,slug),lot_translations(*)&slug=eq." + encodeURIComponent(slug) + "&limit=1")
        .then(function (results) {
          var rawLot = (results || [])[0];
          return rawLot ? normalizeLotTranslation(rawLot, language) : null;
        })
        .catch(function () {
          return null;
        });
    });
  }

  var COUNTRIES = [
    "Afghanistan","Aland Islands","Albania","Algeria","American Samoa","Andorra","Angola","Anguilla","Antigua and Barbuda","Argentina",
    "Armenia","Aruba","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin",
    "Bermuda","Bhutan","Bolivia","Bonaire, Sint Eustatius and Saba","Bosnia and Herzegovina","Botswana","Brazil","British Indian Ocean Territory",
    "Brunei Darussalam","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Cayman Islands","Central African Republic",
    "Chad","Chile","China","Christmas Island","Cocos (Keeling) Islands","Colombia","Comoros","Congo","Congo, Democratic Republic of the","Cook Islands",
    "Costa Rica","Cote d'Ivoire","Croatia","Cuba","Curacao","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
    "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Falkland Islands","Faroe Islands","Federated States of Micronesia","Fiji",
    "Finland","France","French Guiana","French Polynesia","Gabon","Gambia","Georgia","Germany","Ghana","Gibraltar","Greece","Greenland","Grenada",
    "Guadeloupe","Guam","Guatemala","Guernsey","Guinea","Guinea-Bissau","Guyana","Haiti","Holy See (Vatican City State)","Honduras","Hong Kong",
    "Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Isle of Man","Israel","Italy","Jamaica","Japan","Jersey","Jordan","Kazakhstan",
    "Kenya","Kiribati","Kosovo","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg",
    "Macao","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Martinique","Mauritania","Mauritius","Mayotte","Mexico",
    "Moldova","Monaco","Mongolia","Montenegro","Montserrat","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands","New Caledonia",
    "New Zealand","Nicaragua","Niger","Nigeria","Niue","Norfolk Island","North Korea","North Macedonia","Northern Mariana Islands","Norway","Oman",
    "Pakistan","Palau","Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Puerto Rico","Qatar","Reunion",
    "Romania","Russia","Rwanda","Saint Barthelemy","Saint Helena","Saint Kitts and Nevis","Saint Lucia","Saint Martin (French Part)",
    "Saint Pierre and Miquelon","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia",
    "Seychelles","Sierra Leone","Singapore","Sint Maarten","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan",
    "Spain","Sri Lanka","Sudan","Suriname","Svalbard and Jan Mayen","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
    "Thailand","Timor-Leste","Togo","Tokelau","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Turks and Caicos Islands","Tuvalu",
    "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Venezuela","Vietnam",
    "Virgin Islands, British","Virgin Islands, U.S.","Wallis and Futuna","Western Sahara","Yemen","Zambia","Zimbabwe"
  ];

  var PHONE_CODE_BY_COUNTRY = {
    "Afghanistan": "+93",
    "Aland Islands": "+358",
    "Albania": "+355",
    "Algeria": "+213",
    "American Samoa": "+1",
    "Andorra": "+376",
    "Angola": "+244",
    "Anguilla": "+1",
    "Antigua and Barbuda": "+1",
    "Argentina": "+54",
    "Armenia": "+374",
    "Aruba": "+297",
    "Australia": "+61",
    "Austria": "+43",
    "Azerbaijan": "+994",
    "Bahamas": "+1",
    "Bahrain": "+973",
    "Bangladesh": "+880",
    "Barbados": "+1",
    "Belarus": "+375",
    "Belgium": "+32",
    "Belize": "+501",
    "Benin": "+229",
    "Bermuda": "+1",
    "Bhutan": "+975",
    "Bolivia": "+591",
    "Bonaire, Sint Eustatius and Saba": "+599",
    "Bosnia and Herzegovina": "+387",
    "Botswana": "+267",
    "Brazil": "+55",
    "British Indian Ocean Territory": "+246",
    "Brunei Darussalam": "+673",
    "Bulgaria": "+359",
    "Burkina Faso": "+226",
    "Burundi": "+257",
    "Cambodia": "+855",
    "Cameroon": "+237",
    "Canada": "+1",
    "Cape Verde": "+238",
    "Cayman Islands": "+1",
    "Central African Republic": "+236",
    "Chad": "+235",
    "Chile": "+56",
    "China": "+86",
    "Christmas Island": "+61",
    "Cocos (Keeling) Islands": "+61",
    "Colombia": "+57",
    "Comoros": "+269",
    "Congo": "+242",
    "Congo, Democratic Republic of the": "+243",
    "Cook Islands": "+682",
    "Costa Rica": "+506",
    "Cote d'Ivoire": "+225",
    "Croatia": "+385",
    "Cuba": "+53",
    "Curacao": "+599",
    "Cyprus": "+357",
    "Czech Republic": "+420",
    "Denmark": "+45",
    "Djibouti": "+253",
    "Dominica": "+1",
    "Dominican Republic": "+1",
    "Ecuador": "+593",
    "Egypt": "+20",
    "El Salvador": "+503",
    "Equatorial Guinea": "+240",
    "Eritrea": "+291",
    "Estonia": "+372",
    "Ethiopia": "+251",
    "Falkland Islands": "+500",
    "Faroe Islands": "+298",
    "Federated States of Micronesia": "+691",
    "Fiji": "+679",
    "Finland": "+358",
    "France": "+33",
    "French Guiana": "+594",
    "French Polynesia": "+689",
    "Gabon": "+241",
    "Gambia": "+220",
    "Georgia": "+995",
    "Germany": "+49",
    "Ghana": "+233",
    "Gibraltar": "+350",
    "Greece": "+30",
    "Greenland": "+299",
    "Grenada": "+1",
    "Guadeloupe": "+590",
    "Guam": "+1",
    "Guatemala": "+502",
    "Guernsey": "+44",
    "Guinea": "+224",
    "Guinea-Bissau": "+245",
    "Guyana": "+592",
    "Haiti": "+509",
    "Holy See (Vatican City State)": "+379",
    "Honduras": "+504",
    "Hong Kong": "+852",
    "Hungary": "+36",
    "Iceland": "+354",
    "India": "+91",
    "Indonesia": "+62",
    "Iran": "+98",
    "Iraq": "+964",
    "Ireland": "+353",
    "Isle of Man": "+44",
    "Israel": "+972",
    "Italy": "+39",
    "Jamaica": "+1",
    "Japan": "+81",
    "Jersey": "+44",
    "Jordan": "+962",
    "Kazakhstan": "+7",
    "Kenya": "+254",
    "Kiribati": "+686",
    "Kosovo": "+383",
    "Kuwait": "+965",
    "Kyrgyzstan": "+996",
    "Laos": "+856",
    "Latvia": "+371",
    "Lebanon": "+961",
    "Lesotho": "+266",
    "Liberia": "+231",
    "Libya": "+218",
    "Liechtenstein": "+423",
    "Lithuania": "+370",
    "Luxembourg": "+352",
    "Macao": "+853",
    "Madagascar": "+261",
    "Malawi": "+265",
    "Malaysia": "+60",
    "Maldives": "+960",
    "Mali": "+223",
    "Malta": "+356",
    "Marshall Islands": "+692",
    "Martinique": "+596",
    "Mauritania": "+222",
    "Mauritius": "+230",
    "Mayotte": "+262",
    "Mexico": "+52",
    "Moldova": "+373",
    "Monaco": "+377",
    "Mongolia": "+976",
    "Montenegro": "+382",
    "Montserrat": "+1",
    "Morocco": "+212",
    "Mozambique": "+258",
    "Myanmar": "+95",
    "Namibia": "+264",
    "Nauru": "+674",
    "Nepal": "+977",
    "Netherlands": "+31",
    "New Caledonia": "+687",
    "New Zealand": "+64",
    "Nicaragua": "+505",
    "Niger": "+227",
    "Nigeria": "+234",
    "Niue": "+683",
    "Norfolk Island": "+672",
    "North Korea": "+850",
    "North Macedonia": "+389",
    "Northern Mariana Islands": "+1",
    "Norway": "+47",
    "Oman": "+968",
    "Pakistan": "+92",
    "Palau": "+680",
    "Palestine": "+970",
    "Panama": "+507",
    "Papua New Guinea": "+675",
    "Paraguay": "+595",
    "Peru": "+51",
    "Philippines": "+63",
    "Poland": "+48",
    "Portugal": "+351",
    "Puerto Rico": "+1",
    "Qatar": "+974",
    "Reunion": "+262",
    "Romania": "+40",
    "Russia": "+7",
    "Rwanda": "+250",
    "Saint Barthelemy": "+590",
    "Saint Helena": "+290",
    "Saint Kitts and Nevis": "+1",
    "Saint Lucia": "+1",
    "Saint Martin (French Part)": "+590",
    "Saint Pierre and Miquelon": "+508",
    "Saint Vincent and the Grenadines": "+1",
    "Samoa": "+685",
    "San Marino": "+378",
    "Sao Tome and Principe": "+239",
    "Saudi Arabia": "+966",
    "Senegal": "+221",
    "Serbia": "+381",
    "Seychelles": "+248",
    "Sierra Leone": "+232",
    "Singapore": "+65",
    "Sint Maarten": "+1",
    "Slovakia": "+421",
    "Slovenia": "+386",
    "Solomon Islands": "+677",
    "Somalia": "+252",
    "South Africa": "+27",
    "South Korea": "+82",
    "South Sudan": "+211",
    "Spain": "+34",
    "Sri Lanka": "+94",
    "Sudan": "+249",
    "Suriname": "+597",
    "Svalbard and Jan Mayen": "+47",
    "Swaziland": "+268",
    "Sweden": "+46",
    "Switzerland": "+41",
    "Syria": "+963",
    "Taiwan": "+886",
    "Tajikistan": "+992",
    "Tanzania": "+255",
    "Thailand": "+66",
    "Timor-Leste": "+670",
    "Togo": "+228",
    "Tokelau": "+690",
    "Tonga": "+676",
    "Trinidad and Tobago": "+1",
    "Tunisia": "+216",
    "Turkey": "+90",
    "Turkmenistan": "+993",
    "Turks and Caicos Islands": "+1",
    "Tuvalu": "+688",
    "Uganda": "+256",
    "Ukraine": "+380",
    "United Arab Emirates": "+971",
    "United Kingdom": "+44",
    "United States": "+1",
    "Uruguay": "+598",
    "Uzbekistan": "+998",
    "Vanuatu": "+678",
    "Venezuela": "+58",
    "Vietnam": "+84",
    "Virgin Islands, British": "+1",
    "Virgin Islands, U.S.": "+1",
    "Wallis and Futuna": "+681",
    "Western Sahara": "+212",
    "Yemen": "+967",
    "Zambia": "+260",
    "Zimbabwe": "+263"
  };

  var COUNTRY_ISO_BY_NAME = {
    "Afghanistan": "AF",
    "Aland Islands": "AX",
    "Albania": "AL",
    "Algeria": "DZ",
    "American Samoa": "AS",
    "Andorra": "AD",
    "Angola": "AO",
    "Anguilla": "AI",
    "Antigua and Barbuda": "AG",
    "Argentina": "AR",
    "Armenia": "AM",
    "Aruba": "AW",
    "Australia": "AU",
    "Austria": "AT",
    "Azerbaijan": "AZ",
    "Bahamas": "BS",
    "Bahrain": "BH",
    "Bangladesh": "BD",
    "Barbados": "BB",
    "Belarus": "BY",
    "Belgium": "BE",
    "Belize": "BZ",
    "Benin": "BJ",
    "Bermuda": "BM",
    "Bhutan": "BT",
    "Bolivia": "BO",
    "Bonaire, Sint Eustatius and Saba": "BQ",
    "Bosnia and Herzegovina": "BA",
    "Botswana": "BW",
    "Brazil": "BR",
    "British Indian Ocean Territory": "IO",
    "Brunei Darussalam": "BN",
    "Bulgaria": "BG",
    "Burkina Faso": "BF",
    "Burundi": "BI",
    "Cambodia": "KH",
    "Cameroon": "CM",
    "Canada": "CA",
    "Cape Verde": "CV",
    "Cayman Islands": "KY",
    "Central African Republic": "CF",
    "Chad": "TD",
    "Chile": "CL",
    "China": "CN",
    "Christmas Island": "CX",
    "Cocos (Keeling) Islands": "CC",
    "Colombia": "CO",
    "Comoros": "KM",
    "Congo": "CG",
    "Congo, Democratic Republic of the": "CD",
    "Cook Islands": "CK",
    "Costa Rica": "CR",
    "Cote d'Ivoire": "CI",
    "Croatia": "HR",
    "Cuba": "CU",
    "Curacao": "CW",
    "Cyprus": "CY",
    "Czech Republic": "CZ",
    "Denmark": "DK",
    "Djibouti": "DJ",
    "Dominica": "DM",
    "Dominican Republic": "DO",
    "Ecuador": "EC",
    "Egypt": "EG",
    "El Salvador": "SV",
    "Equatorial Guinea": "GQ",
    "Eritrea": "ER",
    "Estonia": "EE",
    "Ethiopia": "ET",
    "Falkland Islands": "FK",
    "Faroe Islands": "FO",
    "Federated States of Micronesia": "FM",
    "Fiji": "FJ",
    "Finland": "FI",
    "France": "FR",
    "French Guiana": "GF",
    "French Polynesia": "PF",
    "Gabon": "GA",
    "Gambia": "GM",
    "Georgia": "GE",
    "Germany": "DE",
    "Ghana": "GH",
    "Gibraltar": "GI",
    "Greece": "GR",
    "Greenland": "GL",
    "Grenada": "GD",
    "Guadeloupe": "GP",
    "Guam": "GU",
    "Guatemala": "GT",
    "Guernsey": "GG",
    "Guinea": "GN",
    "Guinea-Bissau": "GW",
    "Guyana": "GY",
    "Haiti": "HT",
    "Holy See (Vatican City State)": "VA",
    "Honduras": "HN",
    "Hong Kong": "HK",
    "Hungary": "HU",
    "Iceland": "IS",
    "India": "IN",
    "Indonesia": "ID",
    "Iran": "IR",
    "Iraq": "IQ",
    "Ireland": "IE",
    "Isle of Man": "IM",
    "Israel": "IL",
    "Italy": "IT",
    "Jamaica": "JM",
    "Japan": "JP",
    "Jersey": "JE",
    "Jordan": "JO",
    "Kazakhstan": "KZ",
    "Kenya": "KE",
    "Kiribati": "KI",
    "Kosovo": "XK",
    "Kuwait": "KW",
    "Kyrgyzstan": "KG",
    "Laos": "LA",
    "Latvia": "LV",
    "Lebanon": "LB",
    "Lesotho": "LS",
    "Liberia": "LR",
    "Libya": "LY",
    "Liechtenstein": "LI",
    "Lithuania": "LT",
    "Luxembourg": "LU",
    "Macao": "MO",
    "Madagascar": "MG",
    "Malawi": "MW",
    "Malaysia": "MY",
    "Maldives": "MV",
    "Mali": "ML",
    "Malta": "MT",
    "Marshall Islands": "MH",
    "Martinique": "MQ",
    "Mauritania": "MR",
    "Mauritius": "MU",
    "Mayotte": "YT",
    "Mexico": "MX",
    "Moldova": "MD",
    "Monaco": "MC",
    "Mongolia": "MN",
    "Montenegro": "ME",
    "Montserrat": "MS",
    "Morocco": "MA",
    "Mozambique": "MZ",
    "Myanmar": "MM",
    "Namibia": "NA",
    "Nauru": "NR",
    "Nepal": "NP",
    "Netherlands": "NL",
    "New Caledonia": "NC",
    "New Zealand": "NZ",
    "Nicaragua": "NI",
    "Niger": "NE",
    "Nigeria": "NG",
    "Niue": "NU",
    "Norfolk Island": "NF",
    "North Korea": "KP",
    "North Macedonia": "MK",
    "Northern Mariana Islands": "MP",
    "Norway": "NO",
    "Oman": "OM",
    "Pakistan": "PK",
    "Palau": "PW",
    "Palestine": "PS",
    "Panama": "PA",
    "Papua New Guinea": "PG",
    "Paraguay": "PY",
    "Peru": "PE",
    "Philippines": "PH",
    "Poland": "PL",
    "Portugal": "PT",
    "Puerto Rico": "PR",
    "Qatar": "QA",
    "Reunion": "RE",
    "Romania": "RO",
    "Russia": "RU",
    "Rwanda": "RW",
    "Saint Barthelemy": "BL",
    "Saint Helena": "SH",
    "Saint Kitts and Nevis": "KN",
    "Saint Lucia": "LC",
    "Saint Martin (French Part)": "MF",
    "Saint Pierre and Miquelon": "PM",
    "Saint Vincent and the Grenadines": "VC",
    "Samoa": "WS",
    "San Marino": "SM",
    "Sao Tome and Principe": "ST",
    "Saudi Arabia": "SA",
    "Senegal": "SN",
    "Serbia": "RS",
    "Seychelles": "SC",
    "Sierra Leone": "SL",
    "Singapore": "SG",
    "Sint Maarten": "SX",
    "Slovakia": "SK",
    "Slovenia": "SI",
    "Solomon Islands": "SB",
    "Somalia": "SO",
    "South Africa": "ZA",
    "South Korea": "KR",
    "South Sudan": "SS",
    "Spain": "ES",
    "Sri Lanka": "LK",
    "Sudan": "SD",
    "Suriname": "SR",
    "Svalbard and Jan Mayen": "SJ",
    "Swaziland": "SZ",
    "Sweden": "SE",
    "Switzerland": "CH",
    "Syria": "SY",
    "Taiwan": "TW",
    "Tajikistan": "TJ",
    "Tanzania": "TZ",
    "Thailand": "TH",
    "Timor-Leste": "TL",
    "Togo": "TG",
    "Tokelau": "TK",
    "Tonga": "TO",
    "Trinidad and Tobago": "TT",
    "Tunisia": "TN",
    "Turkey": "TR",
    "Turkmenistan": "TM",
    "Turks and Caicos Islands": "TC",
    "Tuvalu": "TV",
    "Uganda": "UG",
    "Ukraine": "UA",
    "United Arab Emirates": "AE",
    "United Kingdom": "GB",
    "United States": "US",
    "Uruguay": "UY",
    "Uzbekistan": "UZ",
    "Vanuatu": "VU",
    "Venezuela": "VE",
    "Vietnam": "VN",
    "Virgin Islands, British": "VG",
    "Virgin Islands, U.S.": "VI",
    "Wallis and Futuna": "WF",
    "Western Sahara": "EH",
    "Yemen": "YE",
    "Zambia": "ZM",
    "Zimbabwe": "ZW"
  };

  var PHONE_FLAG_BASE_URL = "https://purecatamphetamine.github.io/country-flag-icons/3x2/";

  function normalizeCountryKey(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/&/g, "and")
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9]+/gi, " ")
      .trim()
      .toLowerCase();
  }

  var PHONE_COUNTRIES = COUNTRIES.map(function (country) {
    var code = PHONE_CODE_BY_COUNTRY[country] || "+00";
    return {
      value: code + "|" + country,
      code: code + "|" + country,
      country: country,
      dialCode: code,
      iso: COUNTRY_ISO_BY_NAME[country] || "",
      label: country + " " + code
    };
  });

  var PHONE_COUNTRY_MATCHES = PHONE_COUNTRIES
    .slice()
    .sort(function (left, right) { return right.dialCode.length - left.dialCode.length; });

  function renderSelectOptions(list, selected, placeholder) {
    var options = [];
    if (placeholder) {
      options.push('<option value="">' + escapeHtml(placeholder) + '</option>');
    }
    list.forEach(function (item) {
      var value = typeof item === "string" ? item : (item.value || item.code);
      var label = typeof item === "string" ? item : item.label;
      options.push('<option value="' + escapeHtml(value) + '"' + (value === selected ? " selected" : "") + '>' + escapeHtml(label) + '</option>');
    });
    return options.join("");
  }

  function getPhoneCountryParts(value) {
    var raw = String(value || "").trim();
    if (!raw) return { value: "", dialCode: "", country: "", iso: "" };
    var dividerIndex = raw.indexOf("|");
    var dialCode = dividerIndex === -1 ? raw : raw.slice(0, dividerIndex);
    var country = dividerIndex === -1 ? "" : raw.slice(dividerIndex + 1);
    return {
      value: raw,
      dialCode: dialCode,
      country: country,
      iso: COUNTRY_ISO_BY_NAME[country] || ""
    };
  }

  function getPhoneFlagUrl(iso) {
    return iso ? PHONE_FLAG_BASE_URL + String(iso).toUpperCase() + ".svg" : "";
  }

  function findPhoneCountryValueByName(countryName) {
    var normalized = normalizeCountryKey(countryName);
    if (!normalized) return "";
    var match = PHONE_COUNTRIES.find(function (entry) {
      return normalizeCountryKey(entry.country) === normalized;
    });
    return match ? match.value : "";
  }

  function findPhoneCountryValueByIso(countryCode) {
    var normalized = String(countryCode || "").trim().toUpperCase();
    if (!normalized) return "";
    var match = PHONE_COUNTRIES.find(function (entry) {
      return String(entry.iso || "").toUpperCase() === normalized;
    });
    return match ? match.value : "";
  }

  function normalizeIpCountry(data) {
    if (!data || data.success === false) return null;
    var countryCode = data.country_code || data.countryCode || data.country || "";
    var countryName = data.country_name || data.countryName || "";
    if (countryCode && String(countryCode).trim().length > 2) {
      countryName = countryName || countryCode;
      countryCode = "";
    }
    return countryCode || countryName ? {
      countryCode: String(countryCode || "").trim().toUpperCase(),
      countryName: String(countryName || "").trim()
    } : null;
  }

  function fetchIpCountry() {
    if (typeof fetch !== "function") return Promise.resolve(null);

    function request(url) {
      return fetch(url, { cache: "no-store" }).then(function (response) {
        if (!response.ok) throw new Error("IP country lookup failed");
        return response.json();
      }).then(normalizeIpCountry);
    }

    return request("https://ipwho.is/").then(function (location) {
      if (location) return location;
      return request("https://ipapi.co/json/").catch(function () {
        return null;
      });
    }).catch(function () {
      return request("https://ipapi.co/json/").catch(function () {
        return null;
      });
    });
  }

  function splitStoredPhoneValue(rawPhone, countryHint) {
    var value = String(rawPhone || "").trim();
    if (!value) return { phoneCountryValue: "", localNumber: "" };
    var compact = value.replace(/[^\d+]/g, "");
    if (compact.charAt(0) !== "+") {
      return { phoneCountryValue: "", localNumber: value };
    }

    var hintedCountryValue = findPhoneCountryValueByName(countryHint);
    if (hintedCountryValue) {
      var hintedCountryParts = getPhoneCountryParts(hintedCountryValue);
      if (hintedCountryParts.dialCode && compact.indexOf(hintedCountryParts.dialCode) === 0) {
        return {
          phoneCountryValue: hintedCountryValue,
          localNumber: value.replace(new RegExp("^\\s*" + hintedCountryParts.dialCode.replace("+", "\\+") + "\\s*"), "").trim()
        };
      }
    }

    for (var i = 0; i < PHONE_COUNTRY_MATCHES.length; i += 1) {
      var match = PHONE_COUNTRY_MATCHES[i];
      if (compact.indexOf(match.dialCode) === 0) {
        var localNumber = value.replace(new RegExp("^\\s*" + match.dialCode.replace("+", "\\+") + "\\s*"), "").trim();
        return {
          phoneCountryValue: match.value,
          localNumber: localNumber
        };
      }
    }

    return { phoneCountryValue: "", localNumber: value };
  }

  function pickStrings(translations, language) {
    var lang = translations[language] || translations.en || {};
    var fallback = translations.en || {};

    function pick(path, fallbackText) {
      var cursor = lang;
      for (var i = 0; i < path.length; i += 1) cursor = cursor && cursor[path[i]];
      if (cursor != null) return cursor;
      cursor = fallback;
      for (var j = 0; j < path.length; j += 1) cursor = cursor && cursor[path[j]];
      return cursor != null ? cursor : fallbackText;
    }

    return {
      bidding: {
        title: pick(["bidding", "title"], "Place Your Bid"),
        subtitle: pick(["bidding", "subtitle"], "Complete your bid in just a few steps"),
        backToLot: pick(["bidding", "backToLot"], "Back to Lot"),
        thankYou: pick(["bidding", "thankYou"], "Awaiting payment verification"),
        successEyebrow: pick(["bidding", "successEyebrow"], "Bid submitted"),
        successTitle: pick(["bidding", "successTitle"], "Your bid is under review"),
        successMessage: pick(["bidding", "successMessage"], "We received your confirmation. Our team will verify the transfer and update your bid as soon as the payment is checked."),
        successStatusLabel: pick(["bidding", "successStatusLabel"], "Status"),
        successMethodLabel: pick(["bidding", "successMethodLabel"], "Payment method"),
        successAmountLabel: pick(["bidding", "successAmountLabel"], "Bid amount"),
        successReferenceLabel: pick(["bidding", "successReferenceLabel"], "Reference"),
        successOpenBids: pick(["bidding", "successOpenBids"], "Open my bids"),
        successPending: pick(["bidding", "successPending"], "Pending verification"),
        step1: pick(["bidding", "step1"], "Select Amount"),
        step2: pick(["bidding", "step2"], "Details"),
        step3: pick(["bidding", "step3"], "Payment"),
        bidSummary: pick(["bidding", "bidSummary"], "Bid Summary"),
        itemDetails: pick(["bidding", "itemDetails"], "Item Details"),
        currentBid: pick(["bidding", "currentBid"], "Current Bid"),
        yourBid: pick(["bidding", "yourBid"], "Your Bid"),
        authorizationHold: "Payment Method",
        dueNow: "Amount Due",
        authHoldDescription: "IBAN is a bank transfer to an account. Revolut is a transfer through the Revolut digital bank. No card payment is used on this step.",
        selectBidAmount: pick(["bidding", "selectBidAmount"], "Select Your Bid Amount"),
        minimumBid: pick(["bidding", "minimumBid"], "Minimum Bid"),
        selectPreset: pick(["bidding", "selectPreset"], "Select a preset amount or enter a custom bid"),
        customAmount: pick(["bidding", "customAmount"], "Custom Amount"),
        enterCustomBid: pick(["bidding", "enterCustomBid"], "Enter custom bid"),
        confirmBid: pick(["bidding", "confirmBid"], "Confirm Bid"),
        bidderInformation: pick(["bidding", "bidderInformation"], "Bidder Information"),
        contactInformation: pick(["bidding", "contactInformation"], "Contact Information"),
        shippingAddress: pick(["bidding", "shippingAddress"], "Shipping Address"),
        phoneNumber: pick(["bidding", "phoneNumber"], "Phone Number"),
        streetAddress: pick(["bidding", "streetAddress"], "Street Address"),
        postalCode: pick(["bidding", "postalCode"], "Postal Code"),
        edit: pick(["bidding", "edit"], "Edit"),
        saveDetails: pick(["bidding", "saveDetails"], "Save Details"),
        firstName: pick(["bidding", "firstName"], "First Name"),
        lastName: pick(["bidding", "lastName"], "Last Name"),
        phone: pick(["bidding", "phone"], "Phone"),
        email: pick(["bidding", "email"], "Email"),
        emailPlaceholder: pick(["bidding", "emailPlaceholder"], "your@email.com"),
        addressLine1: pick(["bidding", "addressLine1"], "Street Address"),
        city: pick(["bidding", "city"], "City"),
        country: pick(["bidding", "country"], "Country"),
        continueToPayment: pick(["bidding", "continueToPayment"], "Continue to Payment"),
        selectPaymentMethod: "Choose Payment Method",
        creditOrDebitCard: "Transfer Instructions",
        visaMastercard: "Choose whether you want to pay by IBAN bank transfer or through Revolut",
        fastAndSecure: "No card payment",
        completePayment: pick(["bidding", "completePayment"], "I Paid"),
        securePaymentDescription: "Select IBAN for a classic bank transfer to an account, or Revolut for payment through the Revolut digital bank. We will email the details for the selected method after confirmation.",
        agreeToTerms: pick(["bidding", "agreeToTerms"], "I confirm that I have sent the transfer for this invoice and I agree to"),
        termsOfSale: pick(["bidding", "termsOfSale"], "Terms of Sale"),
      },
      validation: {
        required: pick(["validation", "required"], "Required"),
        invalidEmail: pick(["validation", "invalidEmail"], "Invalid email"),
        lotInfoMissing: pick(["validation", "lotInfoMissing"], "Lot information is missing. Reload the page."),
      },
      common: {
        back: pick(["common", "back"], "Back"),
      },
    };
  }

  function injectStyles() {
    if (document.getElementById("bidding-page-styles")) return;
    var style = document.createElement("style");
    style.id = "bidding-page-styles";
    style.textContent =
      ".bidding-page{background:#fff;}" +
      ".bidding-main-col,.bidding-side-col{min-width:0;}" +
      ".bidding-desktop-layout{display:flex;flex-direction:column;gap:1rem;}" +
      ".bidding-main-col{width:100%;}" +
      ".bidding-side-col{width:100%;}" +
      "[data-bid-step]{display:block;}" +
      ".bidding-primary-btn{display:inline-flex;align-items:center;justify-content:center;gap:.65rem;width:100%;min-height:3rem;padding:.85rem 1.35rem;border-radius:999px;background:#111827;color:#f8f5ef;border:1px solid #111827;font-size:.95rem;font-weight:600;letter-spacing:.01em;transition:transform .18s ease,box-shadow .18s ease,background .18s ease,border-color .18s ease;box-shadow:0 14px 30px rgba(17,24,39,.14);}" +
      ".bidding-primary-btn:hover{background:#1f2937;border-color:#1f2937;transform:translateY(-1px);box-shadow:0 18px 36px rgba(17,24,39,.18);}" +
      ".bidding-secondary-btn{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;min-height:2.5rem;padding:.65rem 1rem;border-radius:999px;border:1px solid rgba(17,24,39,.14);background:#fff;color:#111827;font-size:.82rem;font-weight:600;transition:background .18s ease,border-color .18s ease,color .18s ease;}" +
      ".bidding-secondary-btn:hover{background:#f6f1e8;border-color:rgba(17,24,39,.24);}" +
      ".bidding-success{padding:0;width:100%;}" +
      ".bidding-success-panel{max-width:760px;margin:0 auto;border:1px solid rgba(15,23,42,.08);border-radius:24px;background:#fff;box-shadow:0 20px 45px rgba(15,23,42,.06);padding:1.1rem;}" +
      ".bidding-success-head{display:flex;flex-direction:column;gap:1rem;align-items:flex-start;}" +
      ".bidding-success-mark{display:inline-flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:999px;background:#ecfdf3;color:#166534;border:1px solid #bbf7d0;}" +
      ".bidding-success-eyebrow{font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;color:#64748b;font-weight:600;}" +
      ".bidding-success-title{margin-top:.35rem;font-family:ui-serif,Georgia,Cambria,\"Times New Roman\",Times,serif;font-size:1.85rem;line-height:1.08;color:#0f172a;}" +
      ".bidding-success-copy{margin-top:.75rem;max-width:42rem;font-size:.95rem;line-height:1.65;color:#475569;}" +
      ".bidding-success-meta{display:grid;grid-template-columns:1fr;gap:.75rem;margin-top:1.25rem;}" +
      ".bidding-success-item{padding:.95rem 1rem;border:1px solid rgba(15,23,42,.08);border-radius:16px;background:#fafafa;}" +
      ".bidding-success-item-label{display:block;font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:#64748b;margin-bottom:.35rem;}" +
      ".bidding-success-item-value{font-size:.96rem;font-weight:600;color:#0f172a;word-break:break-word;}" +
      ".bidding-success-actions{display:flex;flex-direction:column;gap:.75rem;margin-top:1.25rem;}" +
      "@media (min-width:640px){.bidding-success-panel{padding:1.4rem;}.bidding-success-head{flex-direction:row;gap:1rem;}.bidding-success-title{font-size:2.15rem;}.bidding-success-meta{grid-template-columns:repeat(2,minmax(0,1fr));}.bidding-success-actions{flex-direction:row;}}"+
      ".bidding-error{color:#dc2626;font-size:12px;margin-top:6px;}" +
      ".bidding-field.invalid{border-color:#dc2626;}" +
      ".PhoneInput:has(.PhoneInputInput.invalid){border-color:#dc2626;}" +
      ".bidding-country-wrap:has(.bidding-country-native.invalid) button{border-color:#dc2626;}" +
      ".bidding-muted-input{background:#f3f4f6;}" +
      ".PhoneInput{align-items:center;display:flex;}" +
      ".PhoneInputCountry{position:relative;border-right:1px solid hsl(var(--border));align-items:center;margin-right:.5rem;padding-right:.75rem;display:flex;min-width:4.75rem;gap:.35rem;}" +
      ".PhoneInputCountryIcon{width:1.5rem;height:1rem;flex:0 0 auto;}" +
      ".PhoneInputCountryIcon--border{background-color:#0000001a;box-shadow:0 0 0 1px #00000080,inset 0 0 0 1px #00000080;}" +
      ".PhoneInputCountryIconImg{width:100%;height:100%;display:block;object-fit:cover;}" +
      ".PhoneInputCountryCode{font-size:.875rem;line-height:1.25rem;white-space:nowrap;color:inherit;}" +
      ".PhoneInputCountrySelect{z-index:2;opacity:0;cursor:pointer;border:0;width:100%;height:100%;position:absolute;top:0;left:0;}" +
      ".PhoneInputCountrySelectArrow{pointer-events:none;margin-left:auto;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid #6b7280;}" +
      ".PhoneInputInput{flex:1;min-width:0;border:0;background:transparent;padding:0;outline:none;font-size:.875rem;line-height:1.25rem;}" +
      ".PhoneInputCountrySelect:focus+.PhoneInputCountryIcon{outline:2px solid hsl(var(--ring));outline-offset:2px;}" +
      ".bidding-country-wrap{position:relative;}" +
      ".bidding-country-native{position:absolute;inset:0;opacity:0;cursor:pointer;}" +
      ".bidding-choice.active{border-color:hsl(var(--foreground));}" +
      "@media (min-width:1024px){.bidding-desktop-layout{display:grid;grid-template-columns:minmax(0,1fr) 430px;align-items:start;gap:.35rem;}.bidding-main-col{grid-column:1;grid-row:1;width:auto;min-width:0;order:0 !important;align-self:start;}.bidding-side-col{grid-column:2;grid-row:1;width:auto;position:static;top:auto;order:0 !important;align-self:start;}}";
    document.head.appendChild(style);
  }

  function renderContactCard(strings) {
    return `
      <div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
        <div data-slot="card-content" class="p-4 space-y-3">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium">${escapeHtml(strings.bidding.contactInformation)}</h3>
            <button data-slot="button" data-bid-edit-section="contact" class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground rounded-md has-[>svg]:px-2.5 h-8 px-3 gap-1.5" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>
              Edit
            </button>
          </div>
          <div data-contact-view class="space-y-2 text-sm">
            <div class="flex justify-between gap-3"><span class="text-muted-foreground">Name:</span><span class="font-medium" data-summary-field="name">-</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted-foreground">Email:</span><span class="font-medium break-all" data-summary-field="email">-</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted-foreground">${escapeHtml(strings.bidding.phoneNumber)}:</span><span class="font-medium" data-summary-field="phone">-</span></div>
          </div>
          <div data-contact-form class="space-y-3" style="display:none">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="firstName">${escapeHtml(strings.bidding.firstName)} *</label>
                <input id="firstName" data-required data-field="firstName" class="bidding-field border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 text-sm" value="">
                <div class="bidding-error hidden"></div>
              </div>
              <div>
                <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="lastName">${escapeHtml(strings.bidding.lastName)} *</label>
                <input id="lastName" data-required data-field="lastName" class="bidding-field border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 text-sm" value="">
                <div class="bidding-error hidden"></div>
              </div>
            </div>
            <div>
              <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="email">${escapeHtml(strings.bidding.email)} *</label>
              <input id="email" data-required data-email data-field="email" class="bidding-field border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 text-sm" placeholder="${escapeHtml(strings.bidding.emailPlaceholder)}" type="email" value="">
              <div class="bidding-error hidden"></div>
            </div>
            <div>
              <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="phone">${escapeHtml(strings.bidding.phoneNumber)} *</label>
              <div class="flex h-9 w-full rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring PhoneInput">
                <div class="PhoneInputCountry">
                  <select aria-label="Phone number country" data-field="phoneCountry" class="PhoneInputCountrySelect">${renderSelectOptions(PHONE_COUNTRIES, "+49|Germany")}</select>
                  <div aria-hidden="true" class="PhoneInputCountryIcon PhoneInputCountryIcon--border">
                    <img data-phone-flag class="PhoneInputCountryIconImg" alt="Germany" src="${escapeHtml(getPhoneFlagUrl("DE"))}">
                  </div>
                  <span data-phone-code class="PhoneInputCountryCode">+49</span>
                  <div class="PhoneInputCountrySelectArrow"></div>
                </div>
                <input id="phone" autocomplete="tel" data-required data-field="phone" class="bidding-field PhoneInputInput" type="tel" value="">
              </div>
              <div class="bidding-error hidden"></div>
            </div>
            <button data-slot="button" data-bid-save-section="contact" class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full" type="button">Save</button>
          </div>
        </div>
      </div>`;
  }

  function renderShippingCard(strings) {
    return `
      <div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
        <div data-slot="card-content" class="p-4 space-y-3">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium">${escapeHtml(strings.bidding.shippingAddress)}</h3>
            <button data-slot="button" data-bid-edit-section="shipping" class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground rounded-md has-[>svg]:px-2.5 h-8 px-3 gap-1.5" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>
              Edit
            </button>
          </div>
          <div data-shipping-view class="space-y-2 text-sm">
            <div class="flex justify-between gap-3"><span class="text-muted-foreground">${escapeHtml(strings.bidding.streetAddress)}:</span><span class="font-medium text-right" data-summary-field="address">-</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted-foreground">${escapeHtml(strings.bidding.city)}:</span><span class="font-medium text-right" data-summary-field="city">-</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted-foreground">${escapeHtml(strings.bidding.postalCode)}:</span><span class="font-medium text-right" data-summary-field="postalCode">-</span></div>
            <div class="flex justify-between gap-3"><span class="text-muted-foreground">${escapeHtml(strings.bidding.country)}:</span><span class="font-medium text-right" data-summary-field="country">-</span></div>
          </div>
          <div data-shipping-form class="space-y-3" style="display:none">
            <div>
              <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="streetAddress">${escapeHtml(strings.bidding.streetAddress)} *</label>
              <input id="streetAddress" data-required data-field="address" class="bidding-field border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 text-sm" value="">
              <div class="bidding-error hidden"></div>
            </div>
            <div>
              <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="addressLine2">Address Line 2 (Optional)</label>
              <input id="addressLine2" data-field="addressLine2" class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 text-sm" value="">
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="city">${escapeHtml(strings.bidding.city)} *</label>
                <input id="city" data-required data-field="city" class="bidding-field border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 text-sm" value="">
                <div class="bidding-error hidden"></div>
              </div>
              <div>
                <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="postalCode">${escapeHtml(strings.bidding.postalCode)} *</label>
                <input id="postalCode" data-required data-field="postalCode" class="bidding-field border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-9 text-sm" value="">
                <div class="bidding-error hidden"></div>
              </div>
            </div>
            <div>
              <label data-slot="label" class="flex items-center gap-2 font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 text-xs" for="country">${escapeHtml(strings.bidding.country)} *</label>
              <div class="bidding-country-wrap">
                <button data-slot="popover-trigger" class="inline-flex items-center gap-2 whitespace-nowrap rounded-md transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive border shadow-xs hover:bg-accent hover:text-accent-foreground px-4 py-2 has-[>svg]:px-3 w-full justify-between h-9 text-sm font-normal bg-transparent" role="combobox" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="bidding-country-select">
                  <span data-country-label>Select country...</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2 h-4 w-4 shrink-0 opacity-50"><path d="m7 15 5 5 5-5"></path><path d="m7 9 5-5 5 5"></path></svg>
                </button>
                <select id="country" data-required data-field="country" class="bidding-country-native" aria-label="Country">${renderSelectOptions(COUNTRIES, "", "Select country...")}</select>
              </div>
              <div class="bidding-error hidden"></div>
            </div>
            <button data-slot="button" data-bid-save-section="shipping" class="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-primary text-primary-foreground hover:bg-primary/90 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 w-full" type="button">Save</button>
          </div>
        </div>
      </div>`;
  }

  function renderBidDetailsStep(strings) {
    return `
      <div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm" data-bid-step="2" style="display:none">
        <div data-slot="card-content" class="p-4 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-serif text-lg md:text-xl">${escapeHtml(strings.bidding.bidderInformation)}</h2>
            <button type="button" data-bid-back data-slot="button" class="inline-flex items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 rounded-md gap-1.5 px-3 text-xs md:text-sm">${escapeHtml(strings.common.back)}</button>
          </div>
          <form class="space-y-4" data-bid-details-form>
            ${renderContactCard(strings)}
            ${renderShippingCard(strings)}
            <button type="button" data-bid-next data-slot="button" class="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 w-full h-10 md:h-12 text-sm md:text-base">${escapeHtml(strings.bidding.continueToPayment)}</button>
          </form>
        </div>
      </div>`;
  }

  function renderNotFound(main, text) {
    main.innerHTML =
      '<section class="py-20"><div class="bidding-shell"><div class="mx-auto max-w-2xl text-center"><p class="text-sm text-red-600">' + escapeHtml(text) + '</p></div></div></section>';
  }

  function renderPage(main, lot, strings) {
    injectStyles();
    var minimumBid = Math.max(Number(lot.current_bid || 0) + Number(lot.minimum_increment || 0), Number(lot.starting_bid || 0));
    var choices = [minimumBid, minimumBid + 50, minimumBid + 100, minimumBid + 250, minimumBid + 350, minimumBid + 550];
    var image = getPrimaryImage(lot.lot_images || []);
    var holdAmount = minimumBid;
    var invoiceNumber = "PFI-" + String(Date.now()).slice(-8);

    document.title = strings.bidding.title + " | Sotheby's";

    main.innerHTML =
      '<div class="bidding-page">' +
      '<div class="border-b border-border/30"><div class="container mx-auto px-4 py-2"><a class="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors" href="../lot/index.html?slug=' + encodeURIComponent(lot.slug || "") + '"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="m15 18-6-6 6-6"></path></svg>' + escapeHtml(strings.bidding.backToLot) + '</a></div></div>' +
      '<section class="container mx-auto px-4 py-4 md:py-6"><div class="max-w-5xl mx-auto">' +
      '<div class="text-center mb-4 md:mb-6"><h1 class="font-serif text-xl md:text-2xl mb-1">' + escapeHtml(strings.bidding.title) + '</h1><p class="text-xs md:text-sm text-muted-foreground">' + escapeHtml(strings.bidding.subtitle) + '</p></div>' +
      '<div class="flex items-center justify-center gap-2 md:gap-4 mb-6 md:mb-8">' +
      '<div class="flex items-center gap-1.5 md:gap-2"><div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium bg-foreground text-background" data-bid-step-pill="1">1</div><span class="text-xs md:text-sm font-medium hidden sm:inline">' + escapeHtml(strings.bidding.step1) + '</span></div>' +
      '<div class="w-8 md:w-12 h-px bg-border"></div>' +
      '<div class="flex items-center gap-1.5 md:gap-2"><div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium bg-muted text-muted-foreground" data-bid-step-pill="2">2</div><span class="text-xs md:text-sm font-medium hidden sm:inline">' + escapeHtml(strings.bidding.step2) + '</span></div>' +
      '<div class="w-8 md:w-12 h-px bg-border"></div>' +
      '<div class="flex items-center gap-1.5 md:gap-2"><div class="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium bg-muted text-muted-foreground" data-bid-step-pill="3">3</div><span class="text-xs md:text-sm font-medium hidden sm:inline">' + escapeHtml(strings.bidding.step3) + '</span></div>' +
      '</div>' +
      '<div class="bidding-desktop-layout">' +
      '<div class="bidding-side-col"><div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"><div data-slot="card-content" class="p-4"><h3 class="font-serif text-base md:text-lg mb-3">' + escapeHtml(strings.bidding.bidSummary) + '</h3><div class="space-y-3"><div><p class="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-2">' + escapeHtml(strings.bidding.itemDetails) + '</p><div class="flex gap-2.5"><img alt="' + escapeHtml(lot.title) + '" class="w-16 h-16 md:w-20 md:h-20 object-cover rounded-sm flex-shrink-0" src="' + escapeHtml(image) + '"><div class="min-w-0"><p class="font-medium text-xs md:text-sm line-clamp-2 leading-snug">' + escapeHtml(lot.title) + '</p><p class="text-[10px] md:text-xs text-muted-foreground mt-1">' + escapeHtml(strings.bidding.currentBid) + ': ' + formatCurrency(lot.current_bid || 0) + '</p></div></div></div><div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 h-px w-full"></div><div class="space-y-1.5"><div class="flex justify-between text-xs md:text-sm"><span class="text-muted-foreground">' + escapeHtml(strings.bidding.yourBid) + '</span><span class="font-medium" data-summary-your-bid>—</span></div><div class="flex justify-between text-xs md:text-sm"><span class="text-muted-foreground">' + escapeHtml(strings.bidding.authorizationHold) + '</span><span class="font-medium" data-summary-hold>IBAN bank transfer</span></div><div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 h-px w-full"></div><div class="flex justify-between"><span class="font-medium text-sm md:text-base">' + escapeHtml(strings.bidding.dueNow) + '</span><span class="font-semibold text-base md:text-lg" data-summary-due>' + formatCurrency(holdAmount) + '</span></div><p class="text-[10px] text-muted-foreground leading-relaxed">' + escapeHtml(strings.bidding.authHoldDescription) + '</p></div></div></div></div></div>' +
      '<div class="bidding-main-col"><div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm" data-bid-step="1"><div data-slot="card-content" class="p-4 md:p-6"><h2 class="font-serif text-lg md:text-xl mb-4">' + escapeHtml(strings.bidding.selectBidAmount) + '</h2><div class="space-y-4"><div class="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg"><div><p class="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-0.5">' + escapeHtml(strings.bidding.currentBid) + '</p><p class="text-base md:text-lg font-semibold">' + formatCurrency(lot.current_bid || 0) + '</p></div><div><p class="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider mb-0.5">' + escapeHtml(strings.bidding.minimumBid) + '</p><p class="text-base md:text-lg font-semibold">' + formatCurrency(minimumBid) + '</p></div></div><div><p class="text-xs md:text-sm text-muted-foreground mb-3">' + escapeHtml(strings.bidding.selectPreset) + '</p><div class="grid grid-cols-2 md:grid-cols-3 gap-2">' +
      choices.map(function (amount, index) {
        return '<button type="button" class="bidding-choice p-3 rounded-lg border-2 transition-all text-left border-border hover:border-foreground/50' + (index === 0 ? ' active' : '') + '" data-bid-choice="' + amount + '"><p class="text-sm md:text-base font-semibold">' + formatCurrency(amount) + '</p><p class="text-[10px] md:text-xs text-muted-foreground">+' + formatCurrency(amount - minimumBid) + '</p></button>';
      }).join("") +
      '</div></div><div data-orientation="horizontal" role="none" data-slot="separator" class="bg-border shrink-0 h-px w-full"></div><div><label class="text-sm md:text-base mb-2 block" for="bid-custom">' + escapeHtml(strings.bidding.customAmount) + '</label><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-lg font-medium">€</span><input id="bid-custom" data-bid-custom class="border-input bg-background ring-offset-background file:text-foreground placeholder:text-muted-foreground focus-visible:ring-ring flex w-full rounded-md border px-3 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-7 h-10 md:h-12 text-base md:text-lg" type="number" min="' + minimumBid + '" step="50" placeholder="' + escapeHtml(strings.bidding.enterCustomBid) + '"/><div class="bidding-error hidden" data-bid-custom-error></div></div></div><button type="button" data-bid-next data-slot="button" class="bidding-primary-btn">' + escapeHtml(strings.bidding.confirmBid) + '</button></div></div></div>' +
      renderBidDetailsStep(strings) +
      '<div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm" data-bid-step="3" style="display:none"><div data-slot="card-content" class="p-4 md:p-6"><div class="flex items-center justify-between mb-4"><h2 class="font-serif text-lg md:text-xl">' + escapeHtml(strings.bidding.selectPaymentMethod) + '</h2><button type="button" data-bid-back data-slot="button" class="bidding-secondary-btn">' + escapeHtml(strings.common.back) + '</button></div><div class="space-y-4"><div class="rounded-xl border border-border bg-muted/30 p-4 md:p-5"><div class="flex items-start justify-between gap-3"><div><p class="text-base md:text-lg font-semibold" data-payment-method-title>' + escapeHtml(strings.bidding.creditOrDebitCard) + '</p><p class="text-sm text-muted-foreground mt-1" data-payment-method-subtitle>' + escapeHtml(strings.bidding.visaMastercard) + '</p></div><div class="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary" data-payment-method-badge>' + escapeHtml(strings.bidding.fastAndSecure) + '</div></div><div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"><div class="rounded-lg bg-background p-3 border border-border"><p class="text-xs uppercase tracking-wide text-muted-foreground mb-1">Reference number</p><p class="font-semibold" data-invoice-number>' + escapeHtml(invoiceNumber) + '</p></div><div class="rounded-lg bg-background p-3 border border-border"><p class="text-xs uppercase tracking-wide text-muted-foreground mb-1">Amount due</p><p class="font-semibold" data-summary-step3-amount>' + formatCurrency(holdAmount) + '</p></div></div><p class="mt-4 text-sm text-muted-foreground leading-relaxed" data-payment-method-description>' + escapeHtml(strings.bidding.securePaymentDescription) + '</p></div><div class="rounded-xl border border-gray-200 bg-gray-50 p-5" data-payment-info-card><div class="flex items-start gap-4 mb-4"><div style="min-width:40px;height:40px;background:#111827;border-radius:12px;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#fff" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3 4 7v10h16V7l-8-4Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 17V11h6v6"/></svg></div><div><p class="font-semibold text-gray-900 text-base" data-payment-info-title>Selected payment route</p><p class="text-sm text-gray-500 mt-0.5" data-payment-info-subtitle>Instructions are sent to your email after bid confirmation</p></div></div><div class="rounded-lg bg-white border border-gray-200 p-4 text-sm text-gray-700 leading-relaxed" data-payment-info-text>IBAN is a bank transfer to an account. We will send the beneficiary name, IBAN, SWIFT/BIC and payment reference to your email address within 2 hours of confirming your bid.</div><div class="mt-3 grid grid-cols-2 gap-2"><div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#6b7280;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:#9ca3af"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Sent within 2 hours</div><div style="display:flex;align-items:center;gap:8px;font-size:12px;color:#6b7280;background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:10px"><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" style="flex-shrink:0;color:#9ca3af"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M5 6h14M7 14h10M9 18h6"/></svg>No card checkout</div></div></div><label class="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm cursor-pointer"><input type="checkbox" data-bid-invoice-confirm class="mt-0.5 h-4 w-4 rounded border-gray-300" style="flex-shrink:0"><span class="text-gray-700 leading-relaxed" data-payment-confirm-copy>I confirm my bid and understand that payment instructions for the selected method will be sent to my email address.</span></label><div class="bidding-error hidden" data-bid-invoice-error></div><button type="button" data-bid-submit data-slot="button" class="bidding-primary-btn">Confirm Bid</button></div></div></div>' +
      '<div data-slot="card" class="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm hidden" data-bid-success><div class="bidding-success"><div class="bidding-success-panel"><div class="bidding-success-head"><div class="bidding-success-mark"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5"><path d="M20 6 9 17l-5-5"></path></svg></div><div class="min-w-0 flex-1"><p class="bidding-success-eyebrow">' + escapeHtml(strings.bidding.successEyebrow) + '</p><h2 class="bidding-success-title">' + escapeHtml(strings.bidding.successTitle) + '</h2><p class="bidding-success-copy">' + escapeHtml(strings.bidding.successMessage) + '</p></div></div><div class="bidding-success-meta"><div class="bidding-success-item"><span class="bidding-success-item-label">' + escapeHtml(strings.bidding.successStatusLabel) + '</span><p class="bidding-success-item-value" data-success-status>' + escapeHtml(strings.bidding.successPending) + '</p></div><div class="bidding-success-item"><span class="bidding-success-item-label">' + escapeHtml(strings.bidding.successMethodLabel) + '</span><p class="bidding-success-item-value" data-success-method>IBAN transfer</p></div><div class="bidding-success-item"><span class="bidding-success-item-label">' + escapeHtml(strings.bidding.successAmountLabel) + '</span><p class="bidding-success-item-value" data-success-amount>' + formatCurrency(holdAmount) + '</p></div><div class="bidding-success-item"><span class="bidding-success-item-label">' + escapeHtml(strings.bidding.successReferenceLabel) + '</span><p class="bidding-success-item-value" data-success-reference>' + escapeHtml(invoiceNumber) + '</p></div></div><div class="bidding-success-actions"><a href="../lot/index.html?slug=' + encodeURIComponent(lot.slug || "") + '" class="bidding-primary-btn sm:w-auto">' + escapeHtml(strings.bidding.backToLot) + '</a><a href="../account.html?view=bids" class="bidding-secondary-btn sm:w-auto">' + escapeHtml(strings.bidding.successOpenBids) + '</a></div></div></div></div>' +
      '</div></div></section></div>';

    wirePage(lot, minimumBid, strings);
  }

  function wirePage(lot, minimumBid, strings) {
    var currentStep = 1;
    var selectedBid = minimumBid;
    var holdAmount = minimumBid;
    var invoiceCommitmentAmount = minimumBid;
    var invoiceNumberNode = document.querySelector("[data-invoice-number]");
    var invoiceReferencePreviewNode = document.querySelector("[data-invoice-reference-preview]");
    var choiceNodes = Array.from(document.querySelectorAll("[data-bid-choice]"));
    var stepNodes = Array.from(document.querySelectorAll("[data-bid-step]"));
    var pillNodes = Array.from(document.querySelectorAll("[data-bid-step-pill]"));
    var summaryBidNode = document.querySelector("[data-summary-your-bid]");
    var summaryHoldNode = document.querySelector("[data-summary-hold]");
    var summaryDueNode = document.querySelector("[data-summary-due]");
    var customInput = document.querySelector("[data-bid-custom]");
    var customError = document.querySelector("[data-bid-custom-error]");
    var nextButtons = Array.from(document.querySelectorAll("[data-bid-next]"));
    var backButtons = Array.from(document.querySelectorAll("[data-bid-back]"));
    var submitButton = document.querySelector("[data-bid-submit]");
    var successCard = document.querySelector("[data-bid-success]");
    var successStatusNode = document.querySelector("[data-success-status]");
    var successMethodNode = document.querySelector("[data-success-method]");
    var successAmountNode = document.querySelector("[data-success-amount]");
    var successReferenceNode = document.querySelector("[data-success-reference]");
    var invoiceAmountNode = document.querySelector("[data-summary-step3-amount]");
    var paymentMethodTitleNode = document.querySelector("[data-payment-method-title]");
    var paymentMethodSubtitleNode = document.querySelector("[data-payment-method-subtitle]");
    var paymentMethodDescriptionNode = document.querySelector("[data-payment-method-description]");
    var paymentMethodBadgeNode = document.querySelector("[data-payment-method-badge]");
    var invoiceConfirm = document.querySelector("[data-bid-invoice-confirm]");
    var invoiceError = document.querySelector("[data-bid-invoice-error]");
    var editButtons = Array.from(document.querySelectorAll("[data-bid-edit-section]"));
    var summaryFieldNodes = Array.from(document.querySelectorAll("[data-summary-field]"));
    var selectedPaymentMethod = 'iban';
    var isSubmitting = false;

    var legacyPaymentSummaryCard = paymentMethodTitleNode && paymentMethodTitleNode.closest(".rounded-xl");
    if (legacyPaymentSummaryCard) {
      legacyPaymentSummaryCard.remove();
      paymentMethodTitleNode = null;
      paymentMethodSubtitleNode = null;
      paymentMethodDescriptionNode = null;
      paymentMethodBadgeNode = null;
      invoiceAmountNode = null;
    }

    function getFieldValue(name) {
      var field = document.querySelector('[data-field="' + name + '"]');
      return field ? String(field.value || "").trim() : "";
    }

    function formatDisplayValue(value) {
      return value || "-";
    }

    function getDisplayName() {
      return [getFieldValue("firstName"), getFieldValue("lastName")].filter(Boolean).join(" ");
    }

    function getDisplayPhone() {
      var parts = getPhoneCountryParts(getFieldValue("phoneCountry"));
      var phone = getFieldValue("phone");
      if (!parts.dialCode && !phone) return "";
      var compactPhone = phone.replace(/[^\d+]/g, "");
      if (parts.dialCode && compactPhone.indexOf(parts.dialCode) === 0) return phone;
      return [parts.dialCode, phone].filter(Boolean).join(" ").trim();
    }

    function updateDetailsSummary() {
      summaryFieldNodes.forEach(function (node) {
        var key = node.getAttribute("data-summary-field");
        if (key === "name") node.textContent = formatDisplayValue(getDisplayName());
        if (key === "email") node.textContent = formatDisplayValue(getFieldValue("email"));
        if (key === "phone") node.textContent = formatDisplayValue(getDisplayPhone());
        if (key === "address") {
          node.textContent = formatDisplayValue([getFieldValue("address"), getFieldValue("addressLine2")].filter(Boolean).join(", "));
        }
        if (key === "city") node.textContent = formatDisplayValue(getFieldValue("city"));
        if (key === "postalCode") node.textContent = formatDisplayValue(getFieldValue("postalCode"));
        if (key === "country") node.textContent = formatDisplayValue(getFieldValue("country"));
      });
    }

    function syncCountryLabel() {
      var countryField = document.querySelector('[data-field="country"]');
      var countryLabel = document.querySelector('[data-country-label]');
      if (!countryLabel) return;
      var value = countryField ? String(countryField.value || "").trim() : "";
      countryLabel.textContent = value || "Select country...";
    }

    function syncPhoneCountryDisplay() {
      var phoneCountryField = document.querySelector('[data-field="phoneCountry"]');
      var phoneCodeNode = document.querySelector("[data-phone-code]");
      var phoneFlagNode = document.querySelector("[data-phone-flag]");
      if (!phoneCountryField) return;
      var parts = getPhoneCountryParts(phoneCountryField.value);
      var flagUrl = getPhoneFlagUrl(parts.iso);
      if (phoneCodeNode) phoneCodeNode.textContent = parts.dialCode || "+00";
      if (phoneFlagNode) {
        phoneFlagNode.alt = parts.country || "Country flag";
        if (flagUrl) {
          phoneFlagNode.src = flagUrl;
          phoneFlagNode.style.display = "block";
        } else {
          phoneFlagNode.removeAttribute("src");
          phoneFlagNode.style.display = "none";
        }
      }
      phoneCountryField.title = parts.country || "";
    }

    function applyIpPhoneCountryFallback() {
      var phoneCountryField = document.querySelector('[data-field="phoneCountry"]');
      if (!phoneCountryField || phoneCountryField.dataset.ipLookupStarted === "true") return;
      phoneCountryField.dataset.ipLookupStarted = "true";

      fetchIpCountry().then(function (location) {
        if (!location || !phoneCountryField.isConnected) return;
        if (phoneCountryField.dataset.userChanged === "true" || phoneCountryField.dataset.profileSet === "true") return;

        var phoneField = document.querySelector('[data-field="phone"]');
        if (phoneField && String(phoneField.value || "").trim()) return;

        var phoneCountryValue = findPhoneCountryValueByIso(location.countryCode) || findPhoneCountryValueByName(location.countryName);
        if (!phoneCountryValue || phoneCountryField.value === phoneCountryValue) return;

        phoneCountryField.value = phoneCountryValue;
        syncPhoneCountryDisplay();
        updateDetailsSummary();
      }).catch(function () {});
    }


    function updateSummary() {
      if (summaryBidNode) summaryBidNode.textContent = formatCurrency(selectedBid);
      if (summaryHoldNode) summaryHoldNode.textContent = getPaymentMethodLabel();
      if (summaryDueNode) summaryDueNode.textContent = formatCurrency(selectedBid);
      if (invoiceAmountNode) invoiceAmountNode.textContent = formatCurrency(selectedBid);
      if (invoiceReferencePreviewNode) {
        invoiceReferencePreviewNode.textContent = (document.querySelector('[data-invoice-field="reference"]') || {}).value || (invoiceNumberNode ? invoiceNumberNode.textContent : "");
      }
      invoiceCommitmentAmount = selectedBid;
      updateDetailsSummary();
    }

    function setSubmittingState(nextValue) {
      isSubmitting = Boolean(nextValue);
      if (!submitButton) return;
      submitButton.disabled = isSubmitting;
      submitButton.style.opacity = isSubmitting ? "0.7" : "";
      submitButton.style.cursor = isSubmitting ? "wait" : "";
    }

    function getPaymentMethodLabel() {
      return selectedPaymentMethod === "revolut" ? "Revolut" : "IBAN bank transfer";
    }

    function updatePaymentMethodPresentation() {
      var isIban = selectedPaymentMethod === "iban";
      if (paymentMethodTitleNode) {
        paymentMethodTitleNode.textContent = isIban ? "IBAN Bank Transfer" : "Revolut Digital Bank";
      }
      if (paymentMethodSubtitleNode) {
        paymentMethodSubtitleNode.textContent = isIban
          ? "Bank transfer to an account using IBAN, SWIFT/BIC and beneficiary details"
          : "Transfer through the Revolut digital bank using the details we email to you";
      }
      if (paymentMethodDescriptionNode) {
        paymentMethodDescriptionNode.textContent = isIban
          ? "IBAN is a standard bank transfer to an account. After confirmation, we will email the beneficiary name, IBAN, SWIFT/BIC and payment reference."
          : "Revolut is a digital bank. After confirmation, we will email the Revolut payment details and reference for your transfer.";
      }
      if (paymentMethodBadgeNode) {
        paymentMethodBadgeNode.textContent = "No card payment";
      }
    }

    function updateSuccessState() {
      if (successStatusNode) successStatusNode.textContent = strings.bidding.successPending;
      if (successMethodNode) successMethodNode.textContent = getPaymentMethodLabel();
      if (successAmountNode) successAmountNode.textContent = formatCurrency(selectedBid);
      if (successReferenceNode) successReferenceNode.textContent = (invoiceNumberNode && invoiceNumberNode.textContent) || "";
    }

    function isMissingBidColumn(error, columnName) {
      if (!error) return false;
      var message = String(error.message || error.details || error.hint || "");
      return message.indexOf("Could not find the '" + columnName + "' column of 'bids'") !== -1 ||
        message.indexOf("column bids." + columnName + " does not exist") !== -1;
    }

    async function insertBidRecord(bidPayload) {
      if (!window._supabase) throw new Error("Bidding service is unavailable.");

      var result = await window._supabase
        .from("bids")
        .insert(bidPayload);

      if (result.error && isMissingBidColumn(result.error, "payment_method")) {
        var fallbackPayload = Object.assign({}, bidPayload);
        delete fallbackPayload.payment_method;
        result = await window._supabase
          .from("bids")
          .insert(fallbackPayload);
      }

      if (result.error) {
        throw new Error(result.error.message || "Failed to save your bid.");
      }
    }

    async function syncBidderProfile(session) {
      if (!window._supabase || !session || !session.user) return;
      var profileData = {
        id: session.user.id,
        email: getFieldValue("email") || session.user.email || '',
        first_name: getFieldValue("firstName"),
        last_name: getFieldValue("lastName"),
        phone: getDisplayPhone() || getFieldValue("phone"),
        country: getFieldValue("country"),
        city: getFieldValue("city"),
        address: [getFieldValue("address"), getFieldValue("addressLine2")].filter(Boolean).join(", "),
        state: getFieldValue("state"),
        postal_code: getFieldValue("postalCode"),
      };

      var profileRes = await window._supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
      if (profileRes && profileRes.error) {
        throw new Error(profileRes.error.message || "Failed to save profile.");
      }
    }

    async function submitGuestBidRecord(bidId) {
      if (!window._supabase || !window._supabase.functions || typeof window._supabase.functions.invoke !== "function") {
        throw new Error("Bidding service is unavailable.");
      }

      var response = await window._supabase.functions.invoke("submit-guest-bid", {
        body: {
          bid_id: bidId,
          lot_id: lot.id,
          amount: selectedBid,
          payment_method: selectedPaymentMethod,
          contact: {
            email: getFieldValue("email"),
            first_name: getFieldValue("firstName"),
            last_name: getFieldValue("lastName"),
            phone: getDisplayPhone() || getFieldValue("phone"),
          },
          shipping: {
            country: getFieldValue("country"),
            city: getFieldValue("city"),
            address: [getFieldValue("address"), getFieldValue("addressLine2")].filter(Boolean).join(", "),
            state: getFieldValue("state"),
            postal_code: getFieldValue("postalCode"),
          },
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to submit your bid.");
      }
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
      return response.data || {};
    }

    function getRecoveredAuthUser() {
      if (window.AuctioAuth && typeof window.AuctioAuth.getCurrentUser === "function") {
        var currentUser = window.AuctioAuth.getCurrentUser();
        if (currentUser && currentUser.id) return currentUser;
      }
      if (window.__AUCTIO_AUTH_USER && window.__AUCTIO_AUTH_USER.id) {
        return window.__AUCTIO_AUTH_USER;
      }
      return null;
    }

    async function resolveBidSession() {
      if (!window._supabase || !window._supabase.auth) return null;

      var sessionRes = await window._supabase.auth.getSession();
      var session = sessionRes && sessionRes.data ? sessionRes.data.session : null;
      if (session && session.user) return session;

      try {
        var refreshRes = await window._supabase.auth.refreshSession();
        session = refreshRes && refreshRes.data ? refreshRes.data.session : null;
        if (session && session.user) return session;
      } catch (_refreshError) {}

      var recoveredUser = getRecoveredAuthUser();
      if (recoveredUser) {
        return { user: recoveredUser, isRecoveredFallback: true };
      }

      return null;
    }

    async function submitBid() {
      if (isSubmitting) return;
      if (invoiceError) invoiceError.classList.add("hidden");
      setSubmittingState(true);

      try {
        if (!window.SupabaseAPI || !window._supabase || !lot || !lot.id) {
          throw new Error("Bidding service is unavailable.");
        }

        var nowIso = new Date().toISOString();
        var bidId = 'bid-' + lot.id + '-' + Date.now() + '-' + (selectedPaymentMethod === 'revolut' ? 'revolut' : 'iban');
        var session = await resolveBidSession();
        var sessionUser = session && session.user && !session.isRecoveredFallback ? session.user : null;

        if (sessionUser) {
          await insertBidRecord({
            id: bidId,
            user_id: sessionUser.id,
            lot_id: lot.id,
            amount: selectedBid,
            status: "active",
            is_simulated: false,
            payment_method: selectedPaymentMethod,
            created_at: nowIso,
          });

          try {
            await syncBidderProfile(session);
          } catch (_profileError) {}

          await window.SupabaseAPI.addStoredBid({
            id: bidId,
            lotId: lot.id,
            lotSlug: lot.slug || '',
            lotTitle: lot.title || 'Lot',
            lotImage: (lot.lot_images && lot.lot_images[0] && (lot.lot_images[0].image_url || lot.lot_images[0].image)) || '',
            userId: sessionUser.id,
            bidAmount: selectedBid,
            currentBid: selectedBid,
            status: 'active',
            paymentMethod: selectedPaymentMethod,
            invoiceMode: selectedPaymentMethod === 'revolut' ? 'revolut' : 'bank_transfer',
            invoiceAmount: invoiceCommitmentAmount,
            invoiceNumber: (invoiceNumberNode && invoiceNumberNode.textContent) || '',
            invoiceRecipient: (document.querySelector('[data-invoice-field="recipient"]') || {}).value || '',
            invoiceReference: (document.querySelector('[data-invoice-field="reference"]') || {}).value || '',
            invoiceAuthorizedAt: nowIso,
            transferStatus: 'pending_verification',
            placedAt: nowIso,
          });
        } else {
          await submitGuestBidRecord(bidId);
        }

        updateSuccessState();

        stepNodes.forEach(function (node) {
          node.classList.add("hidden");
          node.style.display = "none";
        });
        if (successCard) {
          successCard.classList.remove("hidden");
          successCard.style.display = "block";
          successCard.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } catch (error) {
        if (invoiceError) {
          invoiceError.textContent = error && error.message ? error.message : "Failed to submit your bid. Please try again.";
          invoiceError.classList.remove("hidden");
        }
      } finally {
        setSubmittingState(false);
      }
    }

    function validateStep3() {
      var valid = true;
      document.querySelectorAll("[data-invoice-required]").forEach(function (field) {
        var wrapper = field.parentElement;
        var error = wrapper && wrapper.querySelector(".bidding-error");
        var value = String(field.value || "").trim();
        field.classList.remove("invalid");
        if (error) error.classList.add("hidden");
        if (!value) {
          valid = false;
          field.classList.add("invalid");
          if (error) {
            error.textContent = strings.validation.required;
            error.classList.remove("hidden");
          }
        }
      });

      if (invoiceError) invoiceError.classList.add("hidden");
      if (!invoiceConfirm || !invoiceConfirm.checked) {
        valid = false;
        if (invoiceError) {
          invoiceError.textContent = "Confirmation is required before the bid can be submitted.";
          invoiceError.classList.remove("hidden");
        }
      }

      return valid;
    }

    function renderStep() {
      stepNodes.forEach(function (node) {
        var step = Number(node.getAttribute("data-bid-step"));
        if (step === currentStep) {
          node.classList.remove("hidden");
          node.removeAttribute("hidden");
          node.style.display = "block";
          node.style.visibility = "visible";
          node.style.opacity = "1";
          if (step === 3) {
            node.style.background = "#ffffff";
            node.style.border = "1px solid rgba(0,0,0,0.12)";
            node.style.borderRadius = "16px";
          }
        } else {
          node.classList.add("hidden");
          node.style.display = "none";
          node.style.visibility = "hidden";
          node.style.opacity = "0";
        }
      });
      pillNodes.forEach(function (node) {
        var step = Number(node.getAttribute("data-bid-step-pill"));
        var isDone = step < currentStep;
        var isActive = step === currentStep;
        node.classList.toggle("bg-foreground", isDone || isActive);
        node.classList.toggle("text-background", isDone || isActive);
        node.classList.toggle("bg-muted", !(isDone || isActive));
        node.classList.toggle("text-muted-foreground", !(isDone || isActive));
        if (isDone) {
          node.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3 md:h-4 md:w-4"><path d="M20 6 9 17l-5-5"></path></svg>';
        } else {
          node.textContent = String(step);
        }
      });
      if (currentStep === 3) {
        var activeStep = document.querySelector('[data-bid-step="3"]');
        if (activeStep) {
          var content = activeStep.querySelector("[data-slot='card-content']");
          if (content) {
            content.style.display = "block";
            content.style.visibility = "visible";
            content.style.opacity = "1";
            content.style.minHeight = "640px";
            content.style.background = "#ffffff";
          }
          activeStep.scrollIntoView({ behavior: "auto", block: "start" });
        }
      }
    }

    function validateStep1() {
      var value = Number(customInput && customInput.value ? customInput.value : selectedBid);
      if (!Number.isFinite(value) || value < minimumBid) {
        customError.textContent = strings.bidding.minimumBid + ": " + formatCurrency(minimumBid);
        customError.classList.remove("hidden");
        if (customInput) customInput.classList.add("invalid");
        return false;
      }
      selectedBid = value;
      customError.classList.add("hidden");
      if (customInput) customInput.classList.remove("invalid");
      updateSummary();
      return true;
    }

    function getFieldErrorNode(field) {
      var wrapper = field && field.parentElement;
      var error = null;
      while (wrapper && !error) {
        error = wrapper.querySelector(".bidding-error");
        wrapper = wrapper.parentElement;
      }
      return error;
    }

    function clearFieldError(field) {
      if (!field) return;
      field.classList.remove("invalid");
      var error = getFieldErrorNode(field);
      if (error) error.classList.add("hidden");
    }

    function setFieldError(field, message) {
      if (!field) return;
      field.classList.add("invalid");
      var error = getFieldErrorNode(field);
      if (error) {
        error.textContent = message;
        error.classList.remove("hidden");
      }
    }

    function validateDetailsField(field) {
      if (!field) return true;
      var value = String(field.value || "").trim();
      clearFieldError(field);

      if (field.hasAttribute("data-required") && !value) {
        setFieldError(field, strings.validation.required);
        return false;
      }

      if (value && field.hasAttribute("data-email") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldError(field, strings.validation.invalidEmail);
        return false;
      }

      return true;
    }

    function validateSectionFields(section) {
      var valid = true;
      var firstInvalid = null;
      (SECTION_REQUIRED_FIELDS[section] || []).forEach(function (fieldName) {
        var field = document.querySelector('[data-field="' + fieldName + '"]');
        if (!validateDetailsField(field)) {
          valid = false;
          if (!firstInvalid) firstInvalid = field;
        }
      });
      if (!valid) {
        openSection(section);
        setSectionEditButtonState(section, true);
        if (firstInvalid) firstInvalid.focus({ preventScroll: true });
      }
      return valid;
    }

    function validateStep2() {
      var valid = true;
      document.querySelectorAll("[data-required]").forEach(function (field) {
        if (!validateDetailsField(field)) valid = false;
      });
      if (!valid) {
        var contactFields = ['firstName', 'lastName', 'email', 'phone'];
        var shippingFields = ['address', 'city', 'postalCode', 'country'];
        var hasContactError = contactFields.some(function(f) { var el = document.querySelector('[data-field="' + f + '"]'); return el && el.classList.contains('invalid'); });
        var hasShippingError = shippingFields.some(function(f) { var el = document.querySelector('[data-field="' + f + '"]'); return el && el.classList.contains('invalid'); });
        var PEN2 = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>';
        if (hasContactError) { openSection('contact'); var b = document.querySelector('[data-bid-edit-section="contact"]'); if (b) b.innerHTML = PEN2 + 'Cancel'; }
        if (hasShippingError) { openSection('shipping'); var b2 = document.querySelector('[data-bid-edit-section="shipping"]'); if (b2) b2.innerHTML = PEN2 + 'Cancel'; }
      }
      return valid;
    }

    choiceNodes.forEach(function (node) {
      node.addEventListener("click", function () {
        choiceNodes.forEach(function (choice) { choice.classList.remove("active"); });
        node.classList.add("active");
        selectedBid = Number(node.getAttribute("data-bid-choice")) || minimumBid;
        if (customInput) customInput.value = selectedBid;
        updateSummary();
      });
    });

    if (customInput) {
      customInput.value = minimumBid;
      customInput.addEventListener("input", function () {
        choiceNodes.forEach(function (choice) { choice.classList.remove("active"); });
        selectedBid = Number(customInput.value) || 0;
        updateSummary();
      });
    }

    var PEN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path></svg>';
    var SECTION_REQUIRED_FIELDS = {
      contact: ['firstName', 'lastName', 'email', 'phone'],
      shipping: ['address', 'city', 'postalCode', 'country']
    };

    function openSection(section) {
      var form = section === 'contact' ? document.querySelector('[data-contact-form]') : document.querySelector('[data-shipping-form]');
      var view = section === 'contact' ? document.querySelector('[data-contact-view]') : document.querySelector('[data-shipping-view]');
      if (form) form.style.display = 'block';
      if (view) view.style.display = 'none';
    }

    function closeSection(section) {
      var form = section === 'contact' ? document.querySelector('[data-contact-form]') : document.querySelector('[data-shipping-form]');
      var view = section === 'contact' ? document.querySelector('[data-contact-view]') : document.querySelector('[data-shipping-view]');
      if (form) form.style.display = 'none';
      if (view) view.style.display = '';
    }

    function setSectionEditButtonState(section, isOpen) {
      var button = document.querySelector('[data-bid-edit-section="' + section + '"]');
      if (!button) return;
      button.innerHTML = PEN_SVG + (isOpen ? 'Cancel' : 'Edit');
    }

    function isSectionComplete(section) {
      return (SECTION_REQUIRED_FIELDS[section] || []).every(function (fieldName) {
        var field = document.querySelector('[data-field="' + fieldName + '"]');
        return field && String(field.value || '').trim();
      });
    }

    function syncSectionState(section) {
      if (isSectionComplete(section)) {
        closeSection(section);
        setSectionEditButtonState(section, false);
      } else {
        openSection(section);
        setSectionEditButtonState(section, true);
      }
    }

    function syncEditableSections() {
      syncSectionState('contact');
      syncSectionState('shipping');
    }

    editButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        var section = button.getAttribute("data-bid-edit-section");
        var form = section === 'contact' ? document.querySelector('[data-contact-form]') : document.querySelector('[data-shipping-form]');
        if (!form) return;
        var isOpen = form.style.display !== 'none';
        if (isOpen) {
          closeSection(section);
          setSectionEditButtonState(section, false);
        } else {
          openSection(section);
          setSectionEditButtonState(section, true);
        }
      });
    });

    document.querySelectorAll('[data-bid-save-section]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var section = btn.getAttribute('data-bid-save-section');
        if (!validateSectionFields(section)) return;
        updateDetailsSummary();
        syncSectionState(section);
      });
    });

    document.querySelectorAll("[data-field]").forEach(function (field) {
      field.addEventListener("input", function () {
        updateDetailsSummary();
        if (field.classList.contains("invalid")) validateDetailsField(field);
      });
      field.addEventListener("change", function () {
        updateDetailsSummary();
        if (field.classList.contains("invalid")) validateDetailsField(field);
      });
    });

    document.querySelector('[data-field="country"]')?.addEventListener("change", syncCountryLabel);
    document.querySelector('[data-field="phoneCountry"]')?.addEventListener("change", function (event) {
      if (event.currentTarget) event.currentTarget.dataset.userChanged = "true";
      syncPhoneCountryDisplay();
      updateDetailsSummary();
    });

    document.querySelectorAll('[data-invoice-field="reference"]').forEach(function (field) {
      field.addEventListener("input", updateSummary);
    });

    nextButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        if (currentStep === 1 && !validateStep1()) return;
        if (currentStep === 2 && !validateStep2()) return;
        currentStep += 1;
        renderStep();
      });
    });

    backButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        currentStep = Math.max(1, currentStep - 1);
        renderStep();
      });
    });

    // Pre-fill step 2 form with profile data for logged-in users
    if (window.SupabaseAPI) {
      window.SupabaseAPI.getProfile().then(function (profile) {
        if (!profile) return;
        var phoneParts = splitStoredPhoneValue(profile.phone || "", profile.country || "");
        var fields = {
          firstName: profile.first_name || "",
          lastName: profile.last_name || "",
          email: profile.email || "",
          phone: phoneParts.localNumber || profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          state: profile.state || "",
          postalCode: profile.postal_code || "",
          country: profile.country || "",
        };
        Object.keys(fields).forEach(function (key) {
          if (!fields[key]) return;
          var el = document.querySelector('[data-field="' + key + '"]');
          if (el) el.value = fields[key];
        });
        var phoneCountryField = document.querySelector('[data-field="phoneCountry"]');
        if (phoneCountryField) {
          var phoneCountryValue = phoneParts.phoneCountryValue || findPhoneCountryValueByName(profile.country || "");
          if (phoneCountryValue) {
            phoneCountryField.value = phoneCountryValue;
            phoneCountryField.dataset.profileSet = "true";
          }
        }
        var emailField = document.querySelector('[data-field="email"]');
        if (emailField) {
          var lockEmail = Boolean(fields.email);
          emailField.disabled = lockEmail;
          emailField.classList.toggle("bidding-muted-input", lockEmail);
        }
        syncCountryLabel();
        syncPhoneCountryDisplay();
        updateDetailsSummary();
        syncEditableSections();
      }).catch(function () {}).then(function () {
        applyIpPhoneCountryFallback();
      });
    } else {
      applyIpPhoneCountryFallback();
    }

    updateSummary();
    updatePaymentMethodPresentation();
    updateSuccessState();
    syncCountryLabel();
    syncPhoneCountryDisplay();
    syncEditableSections();
    renderStep();

    // ── Payment method selector on step 3 ───────────────────────────────
    try { (function setupPaymentMethodSelector() {
      var infoCard = document.querySelector('[data-payment-info-card]');
      if (!infoCard) return;

      var ibanText = 'IBAN is a bank transfer to an account. We will send the beneficiary name, IBAN, SWIFT/BIC and payment reference to your email address within 2 hours of confirming your bid.';
      var revText  = 'Revolut is a digital bank. We will send your Revolut payment details and payment reference to your email address within 2 hours of confirming your bid.';

      var tabsDiv = document.createElement('div');
      tabsDiv.style.cssText = 'display:flex;gap:8px;margin-bottom:16px';
      tabsDiv.innerHTML =
        '<button type="button" class="pay-method-btn" data-pay-method="iban" style="flex:1;padding:11px 8px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;border:2px solid #111827;background:#111827;color:#fff;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s">' +
        '<svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 6h10"/><path stroke-linecap="round" stroke-linejoin="round" d="M7 14h10"/><path stroke-linecap="round" stroke-linejoin="round" d="M9 18h6"/></svg>' +
        'IBAN transfer</button>' +
        '<button type="button" class="pay-method-btn" data-pay-method="revolut" style="flex:1;padding:11px 8px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;border:2px solid #e5e7eb;background:#f9fafb;color:#374151;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .15s">' +
        '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M16.65 0H7.35C3.29 0 0 3.29 0 7.35v9.3C0 20.71 3.29 24 7.35 24h9.3C20.71 24 24 20.71 24 16.65V7.35C24 3.29 20.71 0 16.65 0zM17.6 14.1l-2.95-4.2h1.1c1.05 0 1.6-.55 1.6-1.4s-.55-1.4-1.6-1.4h-3v7h-2.4V5h5.4c2.35 0 3.85 1.4 3.85 3.5 0 1.6-.85 2.75-2.3 3.25l3.1 4.35H17.6z"/></svg>' +
        'Revolut</button>';

      infoCard.parentNode.insertBefore(tabsDiv, infoCard);

      tabsDiv.querySelectorAll('.pay-method-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectedPaymentMethod = btn.dataset.payMethod;
          var isIban = selectedPaymentMethod === 'iban';
          tabsDiv.querySelectorAll('.pay-method-btn').forEach(function (b) {
            var active = b.dataset.payMethod === selectedPaymentMethod;
            b.style.background  = active ? '#111827' : '#f9fafb';
            b.style.color       = active ? '#fff'    : '#374151';
            b.style.borderColor = active ? '#111827' : '#e5e7eb';
          });
          var infoText = infoCard.querySelector('[data-payment-info-text]');
          if (infoText) infoText.textContent = isIban ? ibanText : revText;
          updatePaymentMethodPresentation();
          updateSummary();
          updateSuccessState();
        });
      });

      updatePaymentMethodPresentation();
    })(); } catch (e) { console.warn('Payment method selector error:', e); }

    if (submitButton) {
      submitButton.addEventListener("click", function () {
        if (!validateStep3()) return;
        submitBid();
      });
    }
  }

  function init() {
    var main = document.querySelector("main");
    var slug = getQueryParam("slug");
    var language = getLanguage();

    if (!main || !slug) {
      renderNotFound(main, "Lot information is missing. Reload the page.");
      return;
    }

    Promise.all([
      loadJson(BASE_PATH + "data/site-translations.json"),
      loadLotBundle(slug, language),
    ])
      .then(function (results) {
        var translations = results[0];
        var lot = results[1];
        var strings = pickStrings(translations, language);
        if (!lot) {
          renderNotFound(main, strings.validation.lotInfoMissing);
          return;
        }
        renderPage(main, lot, strings);
      })
      .catch(function () {
        renderNotFound(main, "Failed to load bidding page.");
      });
  }

  init();
})();
