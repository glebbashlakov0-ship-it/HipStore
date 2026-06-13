(function () {
  "use strict";

  var SDK_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.74.0/dist/umd/supabase.min.js";
  var CART_ID_KEY = "hip_store_cart_id";
  var ADMIN_SESSION_KEY = "hip_admin_session";
  var SDK_PROMISE = null;
  var CLIENT = null;
  var CLIENT_PROMISE = null;
  var CATALOG_PROMISE = null;
  window.__AUCTIO_INITIAL_AUTH_URL = window.__AUCTIO_INITIAL_AUTH_URL || ((window.location && window.location.search) || "") + ((window.location && window.location.hash) || "");
  var CONFIG = Object.assign(
    {
      supabaseUrl: "",
      supabaseAnonKey: "",
      functionsBaseUrl: "",
      siteUrl: "",
      enableDevOrderFallback: false,
    },
    window.HipStoreConfig || {}
  );

  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function countryLabel(value) {
    return clean(value).split("|")[0] || "";
  }

  function hasLetter(value) {
    return /[A-Za-z]/.test(value) || /[^\W\d_]/u.test(value);
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));
  }

  function isValidName(value) {
    var text = clean(value);
    return text.length >= 2 && hasLetter(text) && !/\d/.test(text);
  }

  function isValidPhone(value) {
    var text = clean(value);
    var digits = text.replace(/\D/g, "");
    return /^[+\d\s().-]+$/.test(text) && digits.length >= 7 && digits.length <= 20;
  }

  function isValidAddressLine(value) {
    var text = clean(value);
    return text.length >= 5 && hasLetter(text);
  }

  function isValidOptionalAddressLine(value) {
    var text = clean(value);
    return !text || (text.length >= 2 && (hasLetter(text) || /\d/.test(text)));
  }

  function isValidTown(value) {
    var text = clean(value);
    return text.length >= 2 && hasLetter(text);
  }

  function isValidPostcode(value) {
    var text = clean(value);
    return text.length >= 3 && text.length <= 12 && /[A-Za-z0-9]/.test(text) && /^[A-Za-z0-9][A-Za-z0-9 -]*[A-Za-z0-9]$/.test(text);
  }

  function isValidCountry(value) {
    var text = countryLabel(value) || clean(value);
    return text.length >= 2 && hasLetter(text);
  }

  function validateAddressPayload(payload) {
    if (!isValidName(payload.first_name)) throw backendError("Please enter a valid first name.", "validation_error");
    if (!isValidName(payload.last_name)) throw backendError("Please enter a valid surname.", "validation_error");
    if (!isValidPhone(payload.phone)) throw backendError("Please enter a valid phone number.", "validation_error");
    if (!isValidAddressLine(payload.address)) throw backendError("Please enter a valid address line.", "validation_error");
    if (!isValidOptionalAddressLine(payload.address_2)) throw backendError("Please enter valid extra address details.", "validation_error");
    if (!isValidTown(payload.city)) throw backendError("Please enter a valid town or city.", "validation_error");
    if (!isValidOptionalAddressLine(payload.state)) throw backendError("Please enter a valid county or state.", "validation_error");
    if (!isValidPostcode(payload.postal_code)) throw backendError("Please enter a valid postcode.", "validation_error");
    if (!isValidCountry(payload.country)) throw backendError("Please enter a valid country.", "validation_error");
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, function (value) {
      return (Number(value) ^ window.crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> Number(value) / 4).toString(16);
    });
  }

  function readStoredJson(key) {
    try {
      return JSON.parse(window.localStorage.getItem(key) || "null");
    } catch (_error) {
      return null;
    }
  }

  function writeStoredJson(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function removeStored(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function getCartId() {
    var cartId = clean(window.localStorage.getItem(CART_ID_KEY));
    if (!/^[0-9a-f-]{36}$/i.test(cartId)) {
      cartId = uuid();
      try {
        window.localStorage.setItem(CART_ID_KEY, cartId);
      } catch (_error) {
        // Ignore storage failures.
      }
    }
    return cartId;
  }

  function readAdminSession() {
    var session = readStoredJson(ADMIN_SESSION_KEY);
    if (!session || !session.token || !session.admin) return null;
    if (session.admin.expires_at && Date.parse(session.admin.expires_at) <= Date.now()) {
      removeStored(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  }

  function writeAdminSession(session) {
    writeStoredJson(ADMIN_SESSION_KEY, session);
    return session;
  }

  function isConfigured() {
    return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(clean(CONFIG.supabaseUrl)) && clean(CONFIG.supabaseAnonKey).length > 40;
  }

  function backendError(message, code) {
    var error = new Error(message);
    error.code = code || "backend_error";
    if (code === "backend_not_configured") error.isBackendConfigError = true;
    return error;
  }

  function sanitizeUser(user) {
    if (!user) return null;
    var meta = user.user_metadata || user.raw_user_meta_data || {};
    var firstName = clean(meta.first_name || meta.firstName || user.firstName || user.first_name);
    var lastName = clean(meta.last_name || meta.lastName || user.lastName || user.last_name);
    var email = clean(user.email);
    return {
      id: user.id,
      email: email,
      firstName: firstName,
      lastName: lastName,
      fullName: clean(firstName + " " + lastName) || email || "Customer",
      phone: clean(meta.phone || user.phone),
      createdAt: user.created_at || user.createdAt || "",
    };
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean(value));
  }

  function isMissingAddressTable(error) {
    var message = String((error && error.message) || "");
    return error && (error.code === "42P01" || /profile_addresses|does not exist/i.test(message));
  }

  function profilePayloadFromProfile(user, profile, address) {
    profile = profile || {};
    address = address || {};
    return {
      firstName: clean(profile.first_name || (user && user.firstName)),
      lastName: clean(profile.last_name || (user && user.lastName)),
      phone: clean(address.phone || profile.phone || (user && user.phone)),
      country: clean(address.country),
      address: clean(address.address),
      city: clean(address.city),
      state: clean(address.state),
      postalCode: clean(address.postal_code || address.postalCode),
      marketingEmail: profile.marketing_email !== false,
      marketingSms: profile.marketing_sms === true,
      marketingPersonalized: profile.marketing_personalized !== false,
    };
  }

  function normalizeAddressPayload(address, user, profile, existingCount) {
    address = address || {};
    profile = profile || {};
    var isDefault = address.isDefault != null || address.is_default != null
      ? Boolean(address.isDefault != null ? address.isDefault : address.is_default)
      : existingCount === 0;
    return {
      label: clean(address.label) || "Delivery Address",
      first_name: clean(address.firstName || address.first_name || profile.first_name || (user && user.firstName)),
      last_name: clean(address.lastName || address.last_name || profile.last_name || (user && user.lastName)),
      phone: clean(address.phone || profile.phone || (user && user.phone)),
      address: clean(address.address),
      address_2: clean(address.address2 || address.address_2),
      city: clean(address.city),
      state: clean(address.state),
      postal_code: clean(address.postalCode || address.postal_code),
      country: clean(address.country),
      is_default: isDefault,
    };
  }

  function setActiveUser(user) {
    var cleanUser = sanitizeUser(user);
    window.__AUCTIO_AUTH_USER = cleanUser;
    window.dispatchEvent(new CustomEvent("auctio:auth", { detail: { user: cleanUser } }));
    window.dispatchEvent(new CustomEvent("auctio:auth-changed", { detail: { user: cleanUser } }));
    return cleanUser;
  }

  function ensureConfigured() {
    if (!isConfigured()) {
      throw backendError("Supabase is not configured yet. Add the public Supabase URL and anon key in site-config.js.", "backend_not_configured");
    }
  }

  function loadSdk() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
    if (SDK_PROMISE) return SDK_PROMISE;
    SDK_PROMISE = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = SDK_URL;
      script.async = true;
      script.onload = function () { resolve(window.supabase); };
      script.onerror = function () { reject(backendError("Unable to load the Supabase browser client.", "supabase_sdk_unavailable")); };
      document.head.appendChild(script);
    });
    return SDK_PROMISE;
  }

  async function getClient() {
    ensureConfigured();
    if (CLIENT) return CLIENT;
    if (CLIENT_PROMISE) return CLIENT_PROMISE;
    CLIENT_PROMISE = (async function () {
      var sdk = await loadSdk();
      if (CLIENT) return CLIENT;
      CLIENT = sdk.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
        },
      });
      CLIENT.auth.onAuthStateChange(function (_event, session) {
        setActiveUser(session && session.user ? session.user : null);
      });
      return CLIENT;
    })();
    try {
      return await CLIENT_PROMISE;
    } catch (error) {
      CLIENT_PROMISE = null;
      throw error;
    }
  }

  function functionsBaseUrl() {
    return clean(CONFIG.functionsBaseUrl) || clean(CONFIG.supabaseUrl).replace(/\/+$/, "") + "/functions/v1";
  }

  function siteBaseUrl() {
    var configured = clean(CONFIG.siteUrl).replace(/\/+$/, "");
    if (/^https?:\/\//i.test(configured)) return configured;
    if (window.location && window.location.origin) return window.location.origin.replace(/\/+$/, "");
    return "";
  }

  function authRedirectUrl(path) {
    var base = siteBaseUrl();
    if (!base) return "";
    try {
      return new URL(String(path || "/").replace(/^\/+/, ""), base + "/").toString();
    } catch (_error) {
      return base + "/" + String(path || "").replace(/^\/+/, "");
    }
  }

  async function currentSession() {
    var client = await getClient();
    var result = await client.auth.getSession();
    if (result.error) throw result.error;
    return result.data.session || null;
  }

  async function getCurrentUser(options) {
    options = options || {};
    if (!isConfigured()) {
      window.__AUCTIO_AUTH_USER = null;
      return null;
    }
    var client = await getClient();
    var result = await client.auth.getUser();
    if (result.error) {
      setActiveUser(null);
      return null;
    }
    return setActiveUser(result.data.user || null);
  }

  async function register(payload) {
    var client = await getClient();
    var email = clean(payload && payload.email).toLowerCase();
    var password = String((payload && payload.password) || "");
    if (!isValidEmail(email)) throw backendError("Please enter a valid email address.", "validation_error");
    if (!isValidPhone(payload && payload.phone)) throw backendError("Please enter a valid phone number.", "validation_error");
    if (!isValidCountry(payload && payload.country)) throw backendError("Please enter a valid country.", "validation_error");
    if (!isValidAddressLine(payload && payload.address)) throw backendError("Please enter a valid address line.", "validation_error");
    if (!isValidOptionalAddressLine(payload && payload.address2)) throw backendError("Please enter valid extra address details.", "validation_error");
    if (!isValidTown(payload && payload.city)) throw backendError("Please enter a valid town or city.", "validation_error");
    if (!isValidOptionalAddressLine(payload && payload.state)) throw backendError("Please enter a valid county or state.", "validation_error");
    if (!isValidPostcode(payload && payload.postalCode)) throw backendError("Please enter a valid postcode.", "validation_error");
    if (password.length < 8) throw backendError("Password must be at least 8 characters.", "validation_error");
    var result = await client.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: authRedirectUrl("account.html"),
        data: {
          first_name: clean(payload && payload.firstName),
          last_name: clean(payload && payload.lastName),
          phone: clean(payload && payload.phone),
          country: clean(payload && payload.country),
          address: clean(payload && payload.address),
          address_2: clean(payload && payload.address2),
          city: clean(payload && payload.city),
          state: clean(payload && payload.state),
          postal_code: clean(payload && payload.postalCode),
        },
      },
    });
    if (result.error) throw result.error;
    if (!result.data.session && result.data.user) {
      var confirmError = backendError("Account created. Please confirm your email address, then sign in.", "email_confirmation_required");
      confirmError.isConfirmEmail = true;
      throw confirmError;
    }
    return setActiveUser(result.data.user || (result.data.session && result.data.session.user));
  }

  async function login(email, password) {
    var client = await getClient();
    var emailValue = clean(email).toLowerCase();
    var passwordValue = String(password || "");
    if (!emailValue || emailValue.indexOf("@") === -1) throw backendError("Please enter a valid email address.", "validation_error");
    if (!passwordValue) throw backendError("Please enter your password.", "validation_error");
    var result = await client.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue,
    });
    if (result.error) throw result.error;
    var user = result.data.user || (result.data.session && result.data.session.user);
    if (!user) throw backendError("Unable to sign in. Please try again.", "auth_error");
    return setActiveUser(user);
  }

  async function requestPasswordReset(email, redirectTo) {
    var client = await getClient();
    var emailValue = clean(email).toLowerCase();
    if (!emailValue || emailValue.indexOf("@") === -1) throw backendError("Please enter a valid email address.", "validation_error");
    var options = {};
    if (clean(redirectTo)) options.redirectTo = clean(redirectTo);
    var result = await client.auth.resetPasswordForEmail(emailValue, options);
    if (result.error) throw result.error;
    return true;
  }

  async function logout() {
    if (isConfigured()) {
      var client = await getClient();
      await client.auth.signOut();
    }
    return setActiveUser(null);
  }

  async function updatePassword(newPassword) {
    if (String(newPassword || "").length < 8) throw backendError("New password must be at least 8 characters.", "validation_error");
    var client = await getClient();
    var result = await client.auth.updateUser({ password: String(newPassword || "") });
    if (result.error) throw result.error;
    return true;
  }

  async function getProfile() {
    var client = await getClient();
    var user = await getCurrentUser();
    if (!user) throw backendError("Please sign in to view your profile.", "auth_required");
    var result = await client.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (result.error) throw result.error;
    return result.data || {
      id: user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      phone: user.phone,
    };
  }

  async function saveProfile(profile) {
    var client = await getClient();
    var user = await getCurrentUser();
    if (!user) throw backendError("Please sign in to update your profile.", "auth_required");
    var payload = {
      id: user.id,
      email: user.email,
      first_name: clean(profile && profile.firstName),
      last_name: clean(profile && profile.lastName),
      phone: clean(profile && profile.phone),
      country: clean(profile && profile.country),
      address: clean(profile && profile.address),
      city: clean(profile && profile.city),
      state: clean(profile && profile.state),
      postal_code: clean(profile && profile.postalCode),
      marketing_email: profile && profile.marketingEmail != null ? Boolean(profile.marketingEmail) : true,
      marketing_sms: profile && profile.marketingSms != null ? Boolean(profile.marketingSms) : false,
      marketing_personalized: profile && profile.marketingPersonalized != null ? Boolean(profile.marketingPersonalized) : true,
    };
    var result = await client.from("profiles").upsert(payload, { onConflict: "id" }).select("*").single();
    if (result.error) throw result.error;
    await client.auth.updateUser({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
        phone: payload.phone,
      },
    });
    await getCurrentUser();
    return result.data;
  }

  async function getCustomerAddresses() {
    var client = await getClient();
    var user = await getCurrentUser();
    if (!user) throw backendError("Please sign in to view your addresses.", "auth_required");
    var result = await client
      .from("profile_addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false });
    if (result.error) {
      if (isMissingAddressTable(result.error)) return [];
      throw result.error;
    }
    return result.data || [];
  }

  async function syncDefaultProfileAddress(address) {
    var user = await getCurrentUser();
    if (!user) throw backendError("Please sign in to update your profile.", "auth_required");
    var profile = {};
    try {
      profile = await getProfile();
    } catch (_error) {
      profile = {};
    }
    await saveProfile(profilePayloadFromProfile(user, profile, address || {}));
  }

  async function saveCustomerAddress(address) {
    var client = await getClient();
    var user = await getCurrentUser();
    if (!user) throw backendError("Please sign in to update your addresses.", "auth_required");
    var profile = {};
    try {
      profile = await getProfile();
    } catch (_error) {
      profile = {};
    }
    var current = [];
    try {
      current = await getCustomerAddresses();
    } catch (error) {
      if (!isMissingAddressTable(error)) throw error;
    }
    var payload = normalizeAddressPayload(address, user, profile, current.length);
    validateAddressPayload(payload);
    if (!payload.is_default && current.length <= 1) payload.is_default = true;
    if (payload.is_default) {
      var reset = await client.from("profile_addresses").update({ is_default: false }).eq("user_id", user.id);
      if (reset.error && !isMissingAddressTable(reset.error)) throw reset.error;
      if (reset.error && isMissingAddressTable(reset.error)) {
        await saveProfile(profilePayloadFromProfile(user, profile, payload));
        return Object.assign({ id: "profile", user_id: user.id }, payload);
      }
    }
    var result;
    if (isUuid(address && address.id)) {
      result = await client
        .from("profile_addresses")
        .update(payload)
        .eq("id", address.id)
        .eq("user_id", user.id)
        .select("*")
        .single();
    } else {
      result = await client
        .from("profile_addresses")
        .insert(Object.assign({ user_id: user.id }, payload))
        .select("*")
        .single();
    }
    if (result.error) {
      if (isMissingAddressTable(result.error)) {
        await saveProfile(profilePayloadFromProfile(user, profile, payload));
        return Object.assign({ id: "profile", user_id: user.id }, payload);
      }
      throw result.error;
    }
    if (result.data && result.data.is_default) await syncDefaultProfileAddress(result.data);
    return result.data;
  }

  async function clearProfileAddress() {
    var user = await getCurrentUser();
    if (!user) throw backendError("Please sign in to update your addresses.", "auth_required");
    var profile = {};
    try {
      profile = await getProfile();
    } catch (_error) {
      profile = {};
    }
    await saveProfile(profilePayloadFromProfile(user, profile, {
      phone: profile.phone,
      address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
    }));
  }

  async function deleteCustomerAddress(addressId) {
    var client = await getClient();
    var user = await getCurrentUser();
    if (!user) throw backendError("Please sign in to update your addresses.", "auth_required");
    if (!isUuid(addressId)) {
      await clearProfileAddress();
      return true;
    }
    var current = [];
    try {
      current = await getCustomerAddresses();
    } catch (error) {
      if (isMissingAddressTable(error)) {
        await clearProfileAddress();
        return true;
      }
      throw error;
    }
    var deleted = current.find(function (address) { return address.id === addressId; }) || null;
    var result = await client.from("profile_addresses").delete().eq("id", addressId).eq("user_id", user.id);
    if (result.error) {
      if (isMissingAddressTable(result.error)) {
        await clearProfileAddress();
        return true;
      }
      throw result.error;
    }
    if (deleted && deleted.is_default) {
      var remaining = await getCustomerAddresses();
      if (remaining.length) {
        var next = remaining[0];
        var update = await client
          .from("profile_addresses")
          .update({ is_default: true })
          .eq("id", next.id)
          .eq("user_id", user.id)
          .select("*")
          .single();
        if (update.error) throw update.error;
        await syncDefaultProfileAddress(update.data);
      } else {
        await clearProfileAddress();
      }
    }
    return true;
  }

  async function invokeFunction(name, options) {
    options = options || {};
    ensureConfigured();
    var session = options.skipUserSession ? null : await currentSession();
    var adminSession = options.adminAuth ? readAdminSession() : null;
    var headers = {
      "Content-Type": "application/json",
      apikey: CONFIG.supabaseAnonKey,
      Authorization: "Bearer " + (adminSession && adminSession.token ? adminSession.token : (session && session.access_token ? session.access_token : CONFIG.supabaseAnonKey)),
    };
    var url = functionsBaseUrl().replace(/\/+$/, "") + "/" + name;
    if (options.query) url += options.query.charAt(0) === "?" ? options.query : "?" + options.query;
    var response = await fetch(url, {
      method: options.method || "POST",
      headers: headers,
      body: options.body == null ? undefined : JSON.stringify(options.body),
    });
    var text = await response.text();
    var data = text ? JSON.parse(text) : null;
    if (!response.ok) {
      if (options.adminAuth && (response.status === 401 || response.status === 403)) removeStored(ADMIN_SESSION_KEY);
      throw backendError((data && data.error) || "Backend request failed.", (data && data.code) || "function_error");
    }
    return data;
  }

  function devOrderFallback(payload) {
    if (!CONFIG.enableDevOrderFallback) {
      throw backendError("Order backend is not configured. Add Supabase settings before accepting production orders.", "backend_not_configured");
    }
    var now = new Date();
    var suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
    var orderNumber = "DEV-" + now.toISOString().slice(0, 10).replace(/-/g, "") + "-" + suffix;
    var items = Array.isArray(payload && payload.items) && payload.items.length
      ? payload.items
      : (payload && payload.item ? [payload.item] : []);
    return {
      order_number: orderNumber,
      status: "payment_pending",
      payment_status: "payment_not_configured",
      payment_method: "manual_payment",
      is_dev_fallback: true,
      message: "Development fallback order only. Configure Supabase for production order storage.",
      order: Object.assign({}, payload, {
        order_number: orderNumber,
        items: items,
        item: items[0] || payload.item || null,
      }),
    };
  }

  async function createOrder(payload) {
    if (!isConfigured()) return devOrderFallback(payload);
    return invokeFunction("create-order", { method: "POST", body: payload });
  }

  async function getCatalog(options) {
    options = options || {};
    if (!isConfigured()) throw backendError("Catalog backend is not configured.", "backend_not_configured");
    if (CATALOG_PROMISE && !options.refresh) return CATALOG_PROMISE;
    CATALOG_PROMISE = invokeFunction("catalog", {
      method: "GET",
      skipUserSession: true,
    }).then(function (payload) {
      if (Array.isArray(payload)) return payload;
      if (payload && Array.isArray(payload.products)) return payload.products;
      return [];
    }).catch(function (error) {
      CATALOG_PROMISE = null;
      throw error;
    });
    return CATALOG_PROMISE;
  }

  async function getCart() {
    if (!isConfigured()) return { cart_id: getCartId(), items: [] };
    return invokeFunction("cart", { method: "GET", query: "cart_id=" + encodeURIComponent(getCartId()) });
  }

  async function saveCart(items) {
    if (!isConfigured()) return { cart_id: getCartId(), items: Array.isArray(items) ? items : [] };
    return invokeFunction("cart", {
      method: "POST",
      body: {
        cart_id: getCartId(),
        items: Array.isArray(items) ? items : [],
      },
    });
  }

  async function clearCart() {
    if (!isConfigured()) return { cart_id: getCartId(), items: [] };
    return invokeFunction("cart", {
      method: "DELETE",
      body: { cart_id: getCartId() },
    });
  }

  async function getCustomerOrders() {
    return invokeFunction("customer-orders", { method: "GET" });
  }

  async function checkAdmin() {
    return invokeFunction("admin-orders", { method: "GET", query: "mode=ping", adminAuth: true, skipUserSession: true });
  }

  async function adminLogin(username, password) {
    var session = await invokeFunction("admin-login", {
      method: "POST",
      skipUserSession: true,
      body: {
        username: clean(username),
        password: String(password || ""),
      },
    });
    writeAdminSession(session);
    return session.admin;
  }

  async function adminLogout() {
    var session = readAdminSession();
    if (session && session.token && isConfigured()) {
      try {
        await invokeFunction("admin-login", {
          method: "DELETE",
          adminAuth: true,
          skipUserSession: true,
          body: {},
        });
      } catch (_error) {
        // Local logout should still clear the browser session.
      }
    }
    removeStored(ADMIN_SESSION_KEY);
    return true;
  }

  async function adminListOrders() {
    return invokeFunction("admin-orders", { method: "GET", query: "mode=orders", adminAuth: true, skipUserSession: true });
  }

  async function adminListCustomers() {
    return invokeFunction("admin-orders", { method: "GET", query: "mode=customers", adminAuth: true, skipUserSession: true });
  }

  async function adminUpdateOrderStatus(orderId, status) {
    return invokeFunction("admin-orders", {
      method: "PATCH",
      adminAuth: true,
      skipUserSession: true,
      body: { order_id: orderId, status: status },
    });
  }

  window.HipStoreBackend = {
    config: CONFIG,
    isConfigured: isConfigured,
    getClient: getClient,
    getCurrentUser: getCurrentUser,
    login: login,
    register: register,
    requestPasswordReset: requestPasswordReset,
    authRedirectUrl: authRedirectUrl,
    logout: logout,
    updatePassword: updatePassword,
    getProfile: getProfile,
    saveProfile: saveProfile,
    getCustomerAddresses: getCustomerAddresses,
    saveCustomerAddress: saveCustomerAddress,
    deleteCustomerAddress: deleteCustomerAddress,
    getCatalog: getCatalog,
    createOrder: createOrder,
    getCart: getCart,
    saveCart: saveCart,
    clearCart: clearCart,
    getCustomerOrders: getCustomerOrders,
    checkAdmin: checkAdmin,
    adminLogin: adminLogin,
    adminLogout: adminLogout,
    adminListOrders: adminListOrders,
    adminListCustomers: adminListCustomers,
    adminUpdateOrderStatus: adminUpdateOrderStatus,
  };
})();
