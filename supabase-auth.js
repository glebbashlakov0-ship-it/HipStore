(function () {
  var SUPABASE_URL = 'https://njsnxxiybniocteqbndp.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qc254eGl5Ym5pb2N0ZXFibmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTM5MzYsImV4cCI6MjA4ODkyOTkzNn0.xZhqA4ASoaHZ36mi3ZYXBTgG4Cvq89sVzXptJCs5mU4';
  var PROJECT_REF = 'njsnxxiybniocteqbndp';
  var SB_SESSION_KEY = 'sb-' + PROJECT_REF + '-auth-token';
  var AUCTIO_USERS_KEY = 'auctio_users';
  var AUCTIO_SESSION_KEY = 'auctio_session';
  var AUCTIO_AUTH_OUTAGE_KEY = 'auctio_auth_outage_until';
  var LEGACY_AUTH_USERS_KEY = 'auctio-auth-users';
  var LEGACY_AUTH_SESSION_KEY = 'auctio-auth-session';

  if (!window.supabase) {
    console.error('[supabase-auth] Supabase SDK not loaded.');
    return;
  }

  var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  var currentUser = null;
  var bootstrapStarted = false;
  window._supabase = supabase;

  function readJSON(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (_error) {}
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (_error) {}
  }

  function getAuthOutageUntil() {
    try {
      var value = Number(window.localStorage.getItem(AUCTIO_AUTH_OUTAGE_KEY) || 0);
      return Number.isFinite(value) ? value : 0;
    } catch (_error) {
      return 0;
    }
  }

  function markAuthOutage() {
    try {
      window.localStorage.setItem(AUCTIO_AUTH_OUTAGE_KEY, String(Date.now() + (10 * 60 * 1000)));
    } catch (_error) {}
  }

  function clearAuthOutage() {
    removeStorage(AUCTIO_AUTH_OUTAGE_KEY);
  }

  function shouldUseLocalAuthFallback() {
    return getAuthOutageUntil() > Date.now();
  }

  function pruneAuthCache(activeUserId) {
    try {
      removeStorage(LEGACY_AUTH_USERS_KEY);
      removeStorage(LEGACY_AUTH_SESSION_KEY);

      var users = readJSON(AUCTIO_USERS_KEY, []);
      if (Array.isArray(users)) {
        var nextUsers = activeUserId
          ? users.filter(function (entry) { return entry && entry.id === activeUserId; })
          : [];
        writeJSON(AUCTIO_USERS_KEY, nextUsers);
      }
    } catch (_error) {}
  }

  function sanitizeUser(supaUser, profile) {
    if (!supaUser) return null;
    var meta = profile || supaUser.user_metadata || {};
    var firstName = meta.first_name || meta.firstName || '';
    var lastName = meta.last_name || meta.lastName || '';
    return {
      id: supaUser.id,
      firstName: firstName,
      lastName: lastName,
      fullName: (firstName + ' ' + lastName).trim() || supaUser.email || 'Collector',
      email: (profile && profile.email) || supaUser.email || '',
      phone: meta.phone || '',
      createdAt: supaUser.created_at || ''
    };
  }

  function isLocalOnlyUserId(userId) {
    return String(userId || '').indexOf('local-') === 0;
  }

  function purgeLocalFallbackUsers() {
    try {
      var users = readJSON(AUCTIO_USERS_KEY, []);
      if (Array.isArray(users)) {
        var nextUsers = users.filter(function (entry) {
          return entry && !isLocalOnlyUserId(entry.id);
        });
        writeJSON(AUCTIO_USERS_KEY, nextUsers);
      }

      var session = readJSON(AUCTIO_SESSION_KEY, null);
      if (session && isLocalOnlyUserId(session.userId)) {
        removeStorage(AUCTIO_SESSION_KEY);
      }
    } catch (_error) {}
  }

  function getLegacyCurrentUser() {
    var session = readJSON(AUCTIO_SESSION_KEY, null);
    if (!session || !session.userId) return null;
    if (isLocalOnlyUserId(session.userId)) return null;
    var users = readJSON(AUCTIO_USERS_KEY, []);
    if (!Array.isArray(users)) return null;
    for (var i = 0; i < users.length; i += 1) {
      if (users[i] && users[i].id === session.userId) {
        return sanitizeUser(users[i], users[i]);
      }
    }
    return null;
  }

  function writeLegacyUser(user) {
    if (!user) {
      pruneAuthCache(null);
      removeStorage(AUCTIO_SESSION_KEY);
      removeStorage(SB_SESSION_KEY);
      return;
    }

    pruneAuthCache(user.id);
    var users = readJSON(AUCTIO_USERS_KEY, []);
    if (!Array.isArray(users)) users = [];
    var existing = null;
    for (var i = 0; i < users.length; i += 1) {
      if (users[i] && users[i].id === user.id) {
        existing = users[i];
        break;
      }
    }
    var record = {
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: user.password || (existing && existing.password) || '__supabase__',
      createdAt: user.createdAt || ''
    };
    var nextUsers = users.filter(function (entry) { return entry && entry.id !== user.id; });
    nextUsers.push(record);
    writeJSON(AUCTIO_USERS_KEY, nextUsers);
    writeJSON(AUCTIO_SESSION_KEY, {
      userId: user.id,
      createdAt: new Date().toISOString()
    });
  }

  function setCurrentUser(supaUser, profile) {
    currentUser = sanitizeUser(supaUser, profile);
    writeLegacyUser(currentUser);
    return currentUser;
  }

  function findLegacyUserByEmail(email) {
    var normalizedEmail = String(email || '').trim().toLowerCase();
    var users = readJSON(AUCTIO_USERS_KEY, []);
    if (!Array.isArray(users)) return null;
    for (var i = 0; i < users.length; i += 1) {
      if (
        users[i] &&
        !isLocalOnlyUserId(users[i].id) &&
        String(users[i].email || '').trim().toLowerCase() === normalizedEmail
      ) {
        return users[i];
      }
    }
    return null;
  }

  function setLegacyCurrentUser(user) {
    if (!user) return null;
    currentUser = sanitizeUser(user, user);
    writeLegacyUser({
      id: user.id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      password: user.password || '',
      createdAt: user.createdAt || ''
    });
    dispatchAuth();
    return currentUser;
  }

  function clearCurrentUser() {
    currentUser = null;
    pruneAuthCache(null);
    removeStorage(AUCTIO_SESSION_KEY);
    removeStorage(SB_SESSION_KEY);
  }

  function dispatchAuth() {
    var user = currentUser || getLegacyCurrentUser();
    window.__AUCTIO_AUTH_USER = user;
    window.dispatchEvent(new CustomEvent('auctio-auth-change', { detail: { user: user } }));
    window.dispatchEvent(new CustomEvent('auctio:auth', { detail: { user: user } }));
  }

  async function refreshCurrentUserFromSession() {
    try {
      var sessionResult = await supabase.auth.getSession();
      var session = sessionResult.data && sessionResult.data.session;
      if (!session || !session.user) {
        clearCurrentUser();
        dispatchAuth();
        return null;
      }

      setCurrentUser(session.user);
      dispatchAuth();

      return currentUser;
    } catch (_error) {
      clearCurrentUser();
      dispatchAuth();
      return null;
    }
  }

  async function syncProfileRecord(userId, payload) {
    if (!userId || !supabase) return;
    try {
      await supabase.from('profiles').upsert({
        id: userId,
        email: String((payload && payload.email) || '').trim().toLowerCase(),
        first_name: String((payload && payload.first_name) || '').trim(),
        last_name: String((payload && payload.last_name) || '').trim(),
        phone: String((payload && payload.phone) || '').trim()
      }, { onConflict: 'id' });
    } catch (_error) {}
  }

  function normalizeError(error, fallbackMessage) {
    var message = String((error && error.message) || fallbackMessage || 'Authentication failed.');
    if (message === 'Invalid login credentials') {
      return new Error('Incorrect email or password.');
    }
    if (
      message.indexOf('User already registered') !== -1 ||
      message.indexOf('user already registered') !== -1 ||
      message.indexOf('already been registered') !== -1
    ) {
      return new Error('An account with this email already exists. Try signing in.');
    }
    if (message.indexOf('Gateway Timeout') !== -1 || message.indexOf('504') !== -1) {
      return new Error('Authentication service is temporarily unavailable. Please try again.');
    }
    if (message.indexOf('Failed to fetch') !== -1 || message.indexOf('network') !== -1 || message.indexOf('Load failed') !== -1) {
      return new Error('Network error while contacting authentication service.');
    }
    return new Error(message);
  }

  function createConfirmEmailError(email) {
    var error = new Error(
      'Your account was created for ' + String(email || '').trim().toLowerCase() + '. Please confirm your email or sign in again to start bidding.'
    );
    error.isConfirmEmail = true;
    return error;
  }

  function shouldRetryAuth(error) {
    var message = String((error && error.message) || '');
    return (
      message.indexOf('Gateway Timeout') !== -1 ||
      message.indexOf('504') !== -1 ||
      message.indexOf('Failed to fetch') !== -1 ||
      message.indexOf('Load failed') !== -1
    );
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  async function retryAuthCall(fn, fallbackMessage) {
    var lastError = null;
    for (var attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = normalizeError(error, fallbackMessage);
        if (shouldRetryAuth(lastError)) markAuthOutage();
        if (attempt === 0 && shouldRetryAuth(lastError)) {
          await wait(1200);
          continue;
        }
        throw lastError;
      }
    }
    throw lastError || new Error(fallbackMessage || 'Authentication failed.');
  }

  async function recoverRegistrationAfterTimeout(email, password) {
    try {
      var signInResult = await supabase.auth.signInWithPassword({
        email: String(email || '').trim().toLowerCase(),
        password: String(password || '')
      });
      if (signInResult.error || !signInResult.data || !signInResult.data.user) return null;
      setCurrentUser(signInResult.data.user);
      dispatchAuth();
      return window.AuctioAuth.getCurrentUser();
    } catch (_error) {
      return null;
    }
  }

  async function finalizeAuthenticatedUser(user, payload) {
    if (!user || !user.id) throw new Error('Registration failed. Please sign in again.');

    setCurrentUser(user, {
      first_name: String(payload.firstName || '').trim(),
      last_name: String(payload.lastName || '').trim(),
      phone: String(payload.phone || '').trim(),
      email: String(payload.email || '').trim().toLowerCase()
    });

    await syncProfileRecord(user.id, {
      email: String(payload.email || '').trim().toLowerCase(),
      first_name: String(payload.firstName || '').trim(),
      last_name: String(payload.lastName || '').trim(),
      phone: String(payload.phone || '').trim()
    });

    dispatchAuth();
    return window.AuctioAuth.getCurrentUser();
  }

  async function recoverLoginAfterTimeout() {
    try {
      await wait(900);
      var sessionResult = await supabase.auth.getSession();
      var session = sessionResult.data && sessionResult.data.session;
      if (!session || !session.user) return null;
      setCurrentUser(session.user);
      dispatchAuth();
      return window.AuctioAuth.getCurrentUser();
    } catch (_error) {
      return null;
    }
  }

  function overrideAuth() {
    window.AuctioAuth.getCurrentUser = function () {
      return currentUser || getLegacyCurrentUser();
    };

    window.AuctioAuth.refreshCurrentUser = function () {
      return refreshCurrentUserFromSession();
    };

    window.AuctioAuth.getStoredUsers = function () {
      var users = readJSON(AUCTIO_USERS_KEY, []);
      return Array.isArray(users) ? users : [];
    };

    window.AuctioAuth.register = async function (payload) {
      var email = String(payload.email || '').trim().toLowerCase();
      var password = String(payload.password || '');
      if (!email) throw new Error('Email is required.');
      if (password.length < 8) throw new Error('Password must be at least 8 characters.');
      if (shouldUseLocalAuthFallback()) {
        throw new Error('Supabase authentication is temporarily unavailable. Registration is disabled until the service recovers.');
      }

      var result;
      try {
        result = await retryAuthCall(async function () {
          var signUpResult = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
              data: {
                first_name: String(payload.firstName || '').trim(),
                last_name: String(payload.lastName || '').trim(),
                phone: String(payload.phone || '').trim()
              }
            }
          });
          if (signUpResult.error) throw signUpResult.error;
          clearAuthOutage();
          return signUpResult;
        }, 'Unable to create account.');
      } catch (error) {
        var normalized = normalizeError(error, 'Unable to create account.');
        if (
          String(normalized.message || '').indexOf('temporarily unavailable') !== -1 ||
          String(normalized.message || '').indexOf('Network error') !== -1
        ) {
          var recoveredUser = await recoverRegistrationAfterTimeout(email, password);
          if (recoveredUser) return recoveredUser;
          throw new Error('Supabase authentication is temporarily unavailable. Registration could not be completed.');
        }
        throw normalized;
      }

      if (!result.data || !result.data.user) throw new Error('Registration failed. Please try again.');

      var identities = result.data.user.identities;
      if (identities && identities.length === 0) {
        throw new Error('An account with this email already exists.');
      }

      var sessionUser = result.data.session && result.data.session.user ? result.data.session.user : null;
      if (!sessionUser) {
        try {
          var loginAfterSignUp = await supabase.auth.signInWithPassword({
            email: email,
            password: password
          });
          if (!loginAfterSignUp.error && loginAfterSignUp.data && loginAfterSignUp.data.user && loginAfterSignUp.data.session) {
            clearAuthOutage();
            sessionUser = loginAfterSignUp.data.user;
          } else {
            clearCurrentUser();
            dispatchAuth();
            throw createConfirmEmailError(email);
          }
        } catch (signInError) {
          var signInMessage = String((signInError && signInError.message) || '');
          clearCurrentUser();
          dispatchAuth();
          if (
            signInError && signInError.isConfirmEmail ||
            signInMessage.indexOf('Email not confirmed') !== -1 ||
            signInMessage.indexOf('confirm') !== -1
          ) {
            throw createConfirmEmailError(email);
          }
          throw normalizeError(signInError, 'Unable to complete registration.');
        }
      }

      return finalizeAuthenticatedUser(sessionUser, payload);
    };

    window.AuctioAuth.login = async function (email, password) {
      if (shouldUseLocalAuthFallback()) {
        throw new Error('Supabase authentication is temporarily unavailable. Please try signing in again later.');
      }

      var result;
      try {
        result = await retryAuthCall(async function () {
          var signInResult = await supabase.auth.signInWithPassword({
            email: String(email || '').trim().toLowerCase(),
            password: String(password || '')
          });
          if (signInResult.error) throw signInResult.error;
          clearAuthOutage();
          return signInResult;
        }, 'Unable to log in.');
      } catch (error) {
        var normalized = normalizeError(error, 'Unable to log in.');
        if (
          String(normalized.message || '').indexOf('temporarily unavailable') !== -1 ||
          String(normalized.message || '').indexOf('Network error') !== -1
        ) {
          var recoveredSessionUser = await recoverLoginAfterTimeout();
          if (recoveredSessionUser) return recoveredSessionUser;
          throw new Error('Supabase authentication is temporarily unavailable. Login could not be completed.');
        }
        throw normalized;
      }

      if (!result.data || !result.data.user) throw new Error('Unable to log in.');

      setCurrentUser(result.data.user);
      await syncProfileRecord(result.data.user.id, {
        email: result.data.user.email || '',
        first_name: (result.data.user.user_metadata && (result.data.user.user_metadata.first_name || result.data.user.user_metadata.firstName)) || '',
        last_name: (result.data.user.user_metadata && (result.data.user.user_metadata.last_name || result.data.user.user_metadata.lastName)) || '',
        phone: (result.data.user.user_metadata && result.data.user.user_metadata.phone) || ''
      });
      dispatchAuth();

      return window.AuctioAuth.getCurrentUser();
    };

    window.AuctioAuth.logout = async function () {
      clearCurrentUser();
      dispatchAuth();
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (error) {
        console.warn('[supabase-auth] local signOut failed', error);
      }
    };
  }

  function bootstrapAuth() {
    if (bootstrapStarted) return;
    bootstrapStarted = true;
    currentUser = getLegacyCurrentUser();
    purgeLocalFallbackUsers();
    overrideAuth();
    refreshCurrentUserFromSession();

    supabase.auth.onAuthStateChange(function (_event, session) {
      if (session && session.user) {
        setCurrentUser(session.user);
        dispatchAuth();
        return;
      }
      clearCurrentUser();
      dispatchAuth();
    });
  }

  if (window.AuctioAuth) {
    bootstrapAuth();
  } else {
    var interval = setInterval(function () {
      if (!window.AuctioAuth) return;
      clearInterval(interval);
      bootstrapAuth();
    }, 10);
  }
})();
