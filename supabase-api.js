(function () {
  'use strict';

  function getClient() {
    return window._supabase || null;
  }

  function getProfileStorageKey(userId) {
    return userId ? 'auctio_profile_' + userId : '';
  }

  function getWatchlistStorageKey(userId) {
    return userId ? 'auctio_watchlist_' + userId : '';
  }

  function getHistoryStorageKey(userId) {
    return userId ? 'auctio_history_' + userId : '';
  }

  function getBidsStorageKey(userId) {
    return userId ? 'auctio_bids_' + userId : '';
  }

  function readStoredProfile(userId) {
    if (!userId) return {};
    try {
      return JSON.parse(localStorage.getItem(getProfileStorageKey(userId))) || {};
    } catch (_error) {
      return {};
    }
  }

  function writeStoredProfile(userId, value) {
    if (!userId) return;
    try {
      localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(value || {}));
    } catch (_error) {}
  }

  function readStoredWatchlist(userId) {
    if (!userId) return [];
    try {
      var value = JSON.parse(localStorage.getItem(getWatchlistStorageKey(userId))) || [];
      return Array.isArray(value) ? value : [];
    } catch (_error) {
      return [];
    }
  }

  function writeStoredWatchlist(userId, items) {
    if (!userId) return;
    try {
      localStorage.setItem(getWatchlistStorageKey(userId), JSON.stringify(Array.isArray(items) ? items : []));
      window.dispatchEvent(new CustomEvent('auctio:watchlist'));
    } catch (_error) {}
  }

  function readStoredHistory(userId) {
    if (!userId) return [];
    try {
      var value = JSON.parse(localStorage.getItem(getHistoryStorageKey(userId))) || [];
      return Array.isArray(value) ? value : [];
    } catch (_error) {
      return [];
    }
  }

  function writeStoredHistory(userId, items) {
    if (!userId) return;
    try {
      localStorage.setItem(getHistoryStorageKey(userId), JSON.stringify(Array.isArray(items) ? items : []));
      window.dispatchEvent(new CustomEvent('auctio:history'));
    } catch (_error) {}
  }

  function readStoredBids(userId) {
    if (!userId) return [];
    try {
      var value = JSON.parse(localStorage.getItem(getBidsStorageKey(userId))) || [];
      return Array.isArray(value) ? value : [];
    } catch (_error) {
      return [];
    }
  }

  function writeStoredBids(userId, items) {
    if (!userId) return;
    try {
      localStorage.setItem(getBidsStorageKey(userId), JSON.stringify(Array.isArray(items) ? items : []));
      window.dispatchEvent(new CustomEvent('auctio:bids'));
    } catch (_error) {}
  }

  async function getUserId() {
    var sb = getClient();
    if (!sb) return null;
    var res = await sb.auth.getSession();
    return res.data && res.data.session ? res.data.session.user.id : null;
  }

  async function getUserEmail() {
    var sb = getClient();
    if (!sb) return '';
    var res = await sb.auth.getSession();
    return res.data && res.data.session && res.data.session.user ? String(res.data.session.user.email || '').toLowerCase() : '';
  }

  function withTimeout(promise, ms, fallbackValue) {
    return Promise.race([
      promise,
      new Promise(function (resolve) {
        setTimeout(function () { resolve(fallbackValue); }, ms);
      })
    ]);
  }

  function isMissingBidColumn(error, columnName) {
    if (!error) return false;
    var message = String(error.message || error.details || error.hint || '');
    return message.indexOf("Could not find the '" + columnName + "' column of 'bids'") !== -1 ||
      message.indexOf('column bids.' + columnName + ' does not exist') !== -1;
  }

  function normalizePaymentMethod(value) {
    return value === 'revolut' ? 'revolut' : 'iban';
  }

  // ─── Profile ────────────────────────────────────────────────────────────────

  async function getProfile() {
    var sb = getClient(); if (!sb) return null;
    var uid = await getUserId(); if (!uid) return null;
    var sessionRes = await sb.auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    var user = session && session.user;
    var stored = readStoredProfile(uid);
    var meta = (user && user.user_metadata) || {};
    var remoteProfile = null;
    try {
      var profileRes = await withTimeout(
        sb.from('profiles').select('id, email, first_name, last_name, phone, country, address, city, state, postal_code, created_at').eq('id', uid).maybeSingle(),
        2000,
        { data: null, error: new Error('timeout') }
      );
      if (!profileRes.error && profileRes.data) remoteProfile = profileRes.data;
    } catch (_error) {}
    return {
      id: uid,
      email: (remoteProfile && remoteProfile.email) || (user && user.email) || '',
      first_name: (remoteProfile && remoteProfile.first_name) || meta.first_name || meta.firstName || '',
      last_name: (remoteProfile && remoteProfile.last_name) || meta.last_name || meta.lastName || '',
      phone: (remoteProfile && remoteProfile.phone) || meta.phone || '',
      country: (remoteProfile && remoteProfile.country) || stored.country || '',
      address: (remoteProfile && remoteProfile.address) || stored.street || '',
      city: (remoteProfile && remoteProfile.city) || stored.city || '',
      state: (remoteProfile && remoteProfile.state) || stored.state || '',
      postal_code: (remoteProfile && remoteProfile.postal_code) || stored.zip || '',
      created_at: (remoteProfile && remoteProfile.created_at) || (user && user.created_at) || ''
    };
  }

  async function updateProfile(data) {
    var sb = getClient(); if (!sb) return null;
    var uid = await getUserId(); if (!uid) throw new Error('Not authenticated.');
    var sessionRes = await sb.auth.getSession();
    var session = sessionRes.data && sessionRes.data.session;
    if (!session || !session.user) throw new Error('Session expired. Please log in again.');

    // Also update auth user metadata for name/phone
    if (data.firstName !== undefined || data.lastName !== undefined || data.phone !== undefined) {
      var authRes = await sb.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
        }
      });
      if (authRes.error) throw new Error(authRes.error.message);
    }

    var stored = readStoredProfile(uid);
    var nextStored = {
      country: data.country !== undefined ? data.country : stored.country || '',
      street: data.address !== undefined ? data.address : stored.street || '',
      city: data.city !== undefined ? data.city : stored.city || '',
      state: data.state !== undefined ? data.state : stored.state || '',
      zip: data.postalCode !== undefined ? data.postalCode : stored.zip || ''
    };
    writeStoredProfile(uid, nextStored);

    try {
      await sb.from('profiles').upsert({
        id: uid,
        email: session.user.email || '',
        first_name: data.firstName !== undefined ? data.firstName : ((session.user.user_metadata && (session.user.user_metadata.first_name || session.user.user_metadata.firstName)) || ''),
        last_name: data.lastName !== undefined ? data.lastName : ((session.user.user_metadata && (session.user.user_metadata.last_name || session.user.user_metadata.lastName)) || ''),
        phone: data.phone !== undefined ? data.phone : ((session.user.user_metadata && session.user.user_metadata.phone) || ''),
        country: nextStored.country || '',
        address: nextStored.street || '',
        city: nextStored.city || '',
        state: nextStored.state || '',
        postal_code: nextStored.zip || ''
      }, { onConflict: 'id' });
    } catch (_error) {}

    // Refresh legacy localStorage
    if (sessionRes.data && sessionRes.data.session) {
      var profile = await getProfile();
      if (profile && window.AuctioAuth) {
        var users;
        try { users = JSON.parse(localStorage.getItem('auctio_users')) || []; } catch(e) { users = []; }
        var idx = users.findIndex(function(u) { return u.id === uid; });
        var record = {
          id: uid,
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          email: profile.email || sessionRes.data.session.user.email || '',
          phone: profile.phone || '',
          password: '__supabase__',
          createdAt: profile.created_at || '',
        };
        if (idx >= 0) users[idx] = record;
        else users.push(record);
        localStorage.setItem('auctio_users', JSON.stringify(users));
        window.dispatchEvent(new CustomEvent('auctio:auth'));
      }
    }
    return true;
  }

  // ─── Watchlist ───────────────────────────────────────────────────────────────

  async function getWatchlist() {
    var uid = await getUserId(); if (!uid) return [];
    var sb = getClient();
    if (sb) {
      try {
        var res = await withTimeout(
          sb.from('watchlist').select('*').eq('user_id', uid).order('added_at', { ascending: false }),
          2500,
          { data: null, error: new Error('timeout') }
        );
        if (!res.error && Array.isArray(res.data)) {
          var items = res.data.map(function (row) {
            return {
              id: row.id || ('watch-' + row.lot_id),
              lotId: row.lot_id,
              lotSlug: row.lot_slug || '',
              lotTitle: row.lot_title || 'Lot',
              lotImage: row.lot_image || '',
              currentBid: Number(row.current_bid || 0),
              addedAt: row.added_at || new Date().toISOString(),
            };
          });
          writeStoredWatchlist(uid, items);
          return items;
        }
      } catch (_e) {}
    }
    return readStoredWatchlist(uid)
      .slice()
      .sort(function (a, b) {
        return new Date(b.addedAt || 0).getTime() - new Date(a.addedAt || 0).getTime();
      });
  }

  async function isInWatchlist(lotId) {
    var uid = await getUserId(); if (!uid) return false;
    return readStoredWatchlist(uid).some(function (item) {
      return item && String(item.lotId) === String(lotId);
    });
  }

  async function addToWatchlist(lotData) {
    var uid = await getUserId(); if (!uid) throw new Error('Please log in to save lots.');
    var payload = typeof lotData === 'object' && lotData
      ? lotData
      : { lotId: lotData };
    var lotId = String(payload.lotId || '').trim();
    if (!lotId) throw new Error('This lot cannot be saved.');

    var items = readStoredWatchlist(uid);
    if (items.some(function (item) { return item && String(item.lotId) === lotId; })) {
      return true;
    }

    var newItem = {
      id: 'watch-' + lotId,
      lotId: lotId,
      lotSlug: payload.lotSlug || '',
      lotTitle: payload.lotTitle || 'Lot',
      lotImage: payload.lotImage || '',
      currentBid: Number(payload.currentBid || 0),
      addedAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    writeStoredWatchlist(uid, items);

    var sb = getClient();
    if (sb) {
      sb.from('watchlist').upsert({
        id: newItem.id,
        user_id: uid,
        lot_id: lotId,
        lot_slug: newItem.lotSlug,
        lot_title: newItem.lotTitle,
        lot_image: newItem.lotImage,
        current_bid: newItem.currentBid,
        added_at: newItem.addedAt,
      }, { onConflict: 'user_id,lot_id' }).then(function () {}).catch(function () {});
    }
    return true;
  }

  async function removeFromWatchlist(lotId) {
    var uid = await getUserId(); if (!uid) return;
    var items = readStoredWatchlist(uid).filter(function (item) {
      return !item || String(item.lotId) !== String(lotId);
    });
    writeStoredWatchlist(uid, items);

    var sb = getClient();
    if (sb) {
      sb.from('watchlist').delete().eq('user_id', uid).eq('lot_id', String(lotId))
        .then(function () {}).catch(function () {});
    }
  }

  async function toggleWatchlist(lotData) {
    var lotId = typeof lotData === 'object' && lotData ? lotData.lotId : lotData;
    var inList = await isInWatchlist(lotId);
    if (inList) { await removeFromWatchlist(lotId); return false; }
    else { await addToWatchlist(lotData); return true; }
  }

  // ─── Viewing History ─────────────────────────────────────────────────────────

  async function getViewingHistory() {
    var uid = await getUserId(); if (!uid) return [];
    var sb = getClient();
    if (sb) {
      try {
        var res = await withTimeout(
          sb.from('viewing_history').select('*').eq('user_id', uid).order('viewed_at', { ascending: false }).limit(50),
          2500,
          { data: null, error: new Error('timeout') }
        );
        if (!res.error && Array.isArray(res.data)) {
          var items = res.data.map(function (row) {
            return {
              id: row.id || ('history-' + row.lot_id),
              lotId: row.lot_id,
              lotSlug: row.lot_slug || '',
              lotTitle: row.lot_title || 'Lot',
              lotImage: row.lot_image || '',
              currentBid: Number(row.current_bid || 0),
              viewedAt: row.viewed_at || new Date().toISOString(),
            };
          });
          writeStoredHistory(uid, items);
          return items;
        }
      } catch (_e) {}
    }
    return readStoredHistory(uid)
      .slice()
      .sort(function (a, b) {
        return new Date(b.viewedAt || 0).getTime() - new Date(a.viewedAt || 0).getTime();
      })
      .slice(0, 50);
  }

  async function recordView(lotData) {
    var uid = await getUserId(); if (!uid) return;
    var payload = typeof lotData === 'object' && lotData ? lotData : { lotId: lotData };
    var lotId = String(payload.lotId || '').trim();
    if (!lotId) return;

    var items = readStoredHistory(uid).filter(function (item) {
      return item && String(item.lotId) !== lotId;
    });

    var newItem = {
      id: 'history-' + lotId,
      lotId: lotId,
      lotSlug: payload.lotSlug || '',
      lotTitle: payload.lotTitle || 'Lot',
      lotImage: payload.lotImage || '',
      currentBid: Number(payload.currentBid || 0),
      viewedAt: new Date().toISOString(),
    };
    items.unshift(newItem);
    writeStoredHistory(uid, items.slice(0, 50));

    var sb = getClient();
    if (sb) {
      sb.from('viewing_history').upsert({
        id: newItem.id,
        user_id: uid,
        lot_id: lotId,
        lot_slug: newItem.lotSlug,
        lot_title: newItem.lotTitle,
        lot_image: newItem.lotImage,
        current_bid: newItem.currentBid,
        viewed_at: newItem.viewedAt,
      }, { onConflict: 'user_id,lot_id' }).then(function () {}).catch(function () {});
    }
  }

  async function clearViewingHistory() {
    var uid = await getUserId(); if (!uid) return;
    writeStoredHistory(uid, []);
    var sb = getClient();
    if (sb) {
      sb.from('viewing_history').delete().eq('user_id', uid)
        .then(function () {}).catch(function () {});
    }
  }

  // ─── Bids ────────────────────────────────────────────────────────────────────

  async function addStoredBid(bidData) {
    var uid = await getUserId(); if (!uid) return false;
    var payload = bidData || {};
    if (!payload.lotId) return false;

    var items = readStoredBids(uid).filter(function (item) {
      return !(item && item.id === payload.id);
    });

    items.unshift({
      id: payload.id || ('bid-' + payload.lotId + '-' + Date.now()),
      lotId: payload.lotId,
      lotSlug: payload.lotSlug || '',
      lotTitle: payload.lotTitle || 'Lot',
      lotImage: payload.lotImage || '',
      bidAmount: Number(payload.bidAmount || 0),
      currentBid: Number(payload.currentBid || payload.bidAmount || 0),
      paymentMethod: payload.paymentMethod || '',
      invoiceMode: payload.invoiceMode || '',
      invoiceAmount: Number(payload.invoiceAmount || payload.currentBid || payload.bidAmount || 0),
      invoiceNumber: payload.invoiceNumber || '',
      invoiceRecipient: payload.invoiceRecipient || '',
      invoiceReference: payload.invoiceReference || '',
      invoiceAuthorizedAt: payload.invoiceAuthorizedAt || '',
      transferStatus: payload.transferStatus || '',
      status: payload.status || 'active',
      placedAt: payload.placedAt || new Date().toISOString(),
    });

    writeStoredBids(uid, items.slice(0, 100));
    return true;
  }

  async function ensureDemoWonBid() {
    var uid = await getUserId(); if (!uid) return;
    var email = await getUserEmail();
    if (email !== 'afanasijmiheev8@gmail.com') return;

    var items = readStoredBids(uid);
    var existing = items.some(function (item) {
      return item && (item.id === 'demo-won-gold-birkin' || item.status === 'won');
    });
    if (existing) return;

    items.unshift({
      id: 'demo-won-gold-birkin',
      lotId: 'd4ac3047-df34-43e0-ad10-f828c16443bb',
      lotSlug: 'gold-togo-birkin-30-gold-hardware-2025',
      lotTitle: 'Gold Togo Birkin 30 Gold Hardware, 2025',
      lotImage: 'catalog-images/shop-01-gold-togo-birkin-30-gold-hardware-2025.jpg',
      bidAmount: 2450,
      currentBid: 2450,
      invoiceAmount: 2450,
      invoiceNumber: 'INV-2026-1048',
      invoiceIssuedAt: '2026-03-12T15:00:00.000Z',
      invoiceDueAt: '2026-03-19T15:00:00.000Z',
      status: 'won',
      placedAt: '2026-03-12T14:30:00.000Z',
    });

    writeStoredBids(uid, items.slice(0, 100));
  }

  async function getBids() {
    var uid = await getUserId(); if (!uid) return [];
    await ensureDemoWonBid();
    var localBids = readStoredBids(uid)
      .slice()
      .sort(function (a, b) {
        return new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime();
      });
    if (localBids.length) return localBids;

    var sb = getClient(); if (!sb) return [];
    var res = await withTimeout(sb
      .from('bids')
      .select('id, lot_id, amount, status, created_at, payment_method, lots(id, slug, title, current_bid, lot_images(image_url, is_primary))')
      .eq('user_id', uid)
      .eq('is_simulated', false)
      .order('created_at', { ascending: false })
      .limit(100), 2500, { data: null, error: new Error('timeout') });
    if (res.error && isMissingBidColumn(res.error, 'payment_method')) {
      res = await withTimeout(sb
        .from('bids')
        .select('id, lot_id, amount, status, created_at, lots(id, slug, title, current_bid, lot_images(image_url, is_primary))')
        .eq('user_id', uid)
        .eq('is_simulated', false)
        .order('created_at', { ascending: false })
        .limit(100), 2500, { data: null, error: new Error('timeout') });
    }
    if (res.error) {
      // Fallback without join if FK not set up
      var fallback = await withTimeout(sb
        .from('bids')
        .select('id, lot_id, amount, status, created_at, payment_method')
        .eq('user_id', uid)
        .eq('is_simulated', false)
        .order('created_at', { ascending: false })
        .limit(100), 2000, { data: [], error: new Error('timeout') });
      if (fallback.error && isMissingBidColumn(fallback.error, 'payment_method')) {
        fallback = await withTimeout(sb
          .from('bids')
          .select('id, lot_id, amount, status, created_at')
          .eq('user_id', uid)
          .eq('is_simulated', false)
          .order('created_at', { ascending: false })
          .limit(100), 2000, { data: [], error: new Error('timeout') });
      }
      if (fallback.error) return [];
      var fallbackItems = (fallback.data || []).map(function(item) {
        return {
          id: item.id,
          lotId: item.lot_id,
          lotSlug: '',
          lotTitle: 'Lot #' + item.lot_id.slice(0, 8),
          lotImage: '',
          bidAmount: item.amount || 0,
          currentBid: item.amount || 0,
          paymentMethod: normalizePaymentMethod(item.payment_method),
          invoiceMode: '',
          invoiceAmount: item.amount || 0,
          invoiceNumber: '',
          invoiceRecipient: '',
          invoiceReference: '',
          invoiceAuthorizedAt: '',
          transferStatus: '',
          status: item.status || 'active',
          placedAt: item.created_at,
        };
      });
      writeStoredBids(uid, fallbackItems);
      return fallbackItems;
    }
    var mapped = (res.data || []).map(function(item) {
      var lot = item.lots || {};
      var imgs = lot.lot_images || [];
      var img = imgs.find(function(i) { return i.is_primary; }) || imgs[0] || {};
      return {
        id: item.id,
        lotId: item.lot_id,
        lotSlug: lot.slug || '',
        lotTitle: lot.title || 'Lot',
        lotImage: img.image_url || '',
        bidAmount: item.amount || 0,
        currentBid: lot.current_bid || item.amount || 0,
        paymentMethod: normalizePaymentMethod(item.payment_method),
        invoiceMode: '',
        invoiceAmount: item.amount || 0,
        invoiceNumber: '',
        invoiceRecipient: '',
        invoiceReference: '',
        invoiceAuthorizedAt: '',
        transferStatus: '',
        status: item.status || 'active',
        placedAt: item.created_at,
      };
    });
    writeStoredBids(uid, mapped);
    return mapped;
  }

  // ─── Notification Settings ───────────────────────────────────────────────────

  async function getNotificationSettings() {
    var sb = getClient(); if (!sb) return null;
    var uid = await getUserId(); if (!uid) return null;
    var notif = { bid_updates: true, auction_reminders: true, new_listings: false, newsletter: false };
    return notif;
  }

  async function updateNotificationSettings(settings) {
    return settings || null;
  }

  // ─── Counts (for overview) ───────────────────────────────────────────────────

  async function getCounts() {
    var sb = getClient(); if (!sb) return { bids: 0, watchlist: 0, history: 0 };
    var uid = await getUserId(); if (!uid) return { bids: 0, watchlist: 0, history: 0 };
    var watchlist = readStoredWatchlist(uid);
    var bids = readStoredBids(uid);
    var history = readStoredHistory(uid);
    if (bids.length) {
      return {
        bids: bids.length,
        watchlist: watchlist.length,
        history: history.length,
      };
    }

    var [bidsRes] = await Promise.all([
      sb.from('bids').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('is_simulated', false),
    ]);

    return {
      bids: bidsRes.count || 0,
      watchlist: watchlist.length,
      history: history.length,
    };
  }

  // ─── Change Password ─────────────────────────────────────────────────────────

  async function changePassword(currentPassword, newPassword) {
    var sb = getClient(); if (!sb) throw new Error('Not available.');
    var uid = await getUserId(); if (!uid) throw new Error('Not authenticated.');

    // Re-authenticate to verify current password
    var sessionRes = await sb.auth.getSession();
    if (!sessionRes.data || !sessionRes.data.session) throw new Error('Session expired. Please log in again.');
    var email = sessionRes.data.session.user.email;

    var verifyRes = await sb.auth.signInWithPassword({ email: email, password: currentPassword });
    if (verifyRes.error) throw new Error('Current password is incorrect.');

    var updateRes = await sb.auth.updateUser({ password: newPassword });
    if (updateRes.error) throw new Error(updateRes.error.message);
    return true;
  }

  // ─── Export ──────────────────────────────────────────────────────────────────

  window.SupabaseAPI = {
    getProfile,
    updateProfile,
    getWatchlist,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    getViewingHistory,
    recordView,
    clearViewingHistory,
    getBids,
    getCounts,
    getNotificationSettings,
    updateNotificationSettings,
    changePassword,
    addStoredBid,
  };
})();
