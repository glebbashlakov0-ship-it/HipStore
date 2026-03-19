(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════
  // CONFIG — заполни перед использованием
  // ═══════════════════════════════════════════════════════════════════════
  var CONFIG = {
    adminPassword: 'admin26_Bra',

    supabaseUrl: 'https://njsnxxiybniocteqbndp.supabase.co',
    supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qc254eGl5Ym5pb2N0ZXFibmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNTM5MzYsImV4cCI6MjA4ODkyOTkzNn0.xZhqA4ASoaHZ36mi3ZYXBTgG4Cvq89sVzXptJCs5mU4',
    supabaseServiceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qc254eGl5Ym5pb2N0ZXFibmRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM1MzkzNiwiZXhwIjoyMDg4OTI5OTM2fQ.7ffBVd5GLmjzjAVQqjDkd9d7p2ibQrgzxXuwAaaLUrI',

    emailjs: {
      publicKey: 'Yu3OgnwUL8964F1mD',
      serviceId: 'service_9kbka1i',
      templateInvoice: 'template_fc9xbs3',
      templateWinInvoice: 'template_fy9x6ps',
      templateWinOnly: 'template_fy9x6ps', // используем тот же, но без реквизитов
    },

    auctionHouse: {
      name: 'Auctio Holdings Ltd.',
      email: 'support@auctio.com',
    },
  };

  // ═══════════════════════════════════════════════════════════════════════
  // CONSTANTS
  // ═══════════════════════════════════════════════════════════════════════
  var ADMIN_SESSION_KEY  = 'auctio_admin_session';
  var ADMIN_STATUSES_KEY = 'auctio_admin_statuses';

  var STATUS_LABELS = {
    active:    'В работе',
    pending:   'Ожидает',
    won:       'Выиграл',
    paid:      'Оплатил',
    na:        'Н/Д',
    lost:      'Отказ',
    cancelled: 'Отменён',
  };

  var STATUS_CLASSES = {
    active:    'bg-blue-100 text-blue-700',
    pending:   'bg-yellow-100 text-yellow-700',
    won:       'bg-emerald-100 text-emerald-700',
    paid:      'bg-green-100 text-green-700',
    na:        'bg-gray-100 text-gray-500',
    lost:      'bg-red-100 text-red-600',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  // ═══════════════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════════════
  var state = {
    leads:          [],
    filteredLeads:  [],
    filterStatus:   'all',
    searchQuery:    '',
    currentLead:    null,
    currentAction:  null, // 'invoice' | 'win-invoice' | 'win-only'
    adminStatuses:  {},
    timers:         {},
  };

  var sb = null;

  // ═══════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════
  function isAuthenticated() {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  }

  function authenticate(password) {
    if (password === CONFIG.adminPassword) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    showLogin();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // ADMIN STATUSES  (localStorage — сохраняются между сессиями)
  // ═══════════════════════════════════════════════════════════════════════
  function loadAdminStatuses() {
    try {
      return JSON.parse(localStorage.getItem(ADMIN_STATUSES_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveAdminStatuses() {
    try {
      localStorage.setItem(ADMIN_STATUSES_KEY, JSON.stringify(state.adminStatuses));
    } catch (e) {}
  }

  function getLeadStatus(bidId, originalStatus) {
    return state.adminStatuses[bidId] || originalStatus || 'active';
  }

  function setLeadStatus(bidId, status) {
    state.adminStatuses[bidId] = status;
    saveAdminStatuses();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SUPABASE DATA
  // ═══════════════════════════════════════════════════════════════════════
  function initSupabase() {
    var key = CONFIG.supabaseServiceKey || CONFIG.supabaseAnonKey;
    sb = window.supabase.createClient(CONFIG.supabaseUrl, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
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

  async function loadAllBids() {
    var res = await sb
      .from('bids')
      .select('id, lot_id, user_id, amount, status, created_at, is_simulated, payment_method')
      .eq('is_simulated', false)
      .order('created_at', { ascending: false })
      .limit(500);
    if (res.error && isMissingBidColumn(res.error, 'payment_method')) {
      res = await sb
        .from('bids')
        .select('id, lot_id, user_id, amount, status, created_at, is_simulated')
        .eq('is_simulated', false)
        .order('created_at', { ascending: false })
        .limit(500);
    }
    if (res.error) throw new Error(res.error.message);
    return res.data || [];
  }

  async function loadProfiles(userIds) {
    if (!userIds.length) return {};
    var res = await sb
      .from('profiles')
      .select('id, email, first_name, last_name, phone, country, city')
      .in('id', userIds);
    if (res.error) return {};
    var map = {};
    (res.data || []).forEach(function (p) { map[p.id] = p; });
    return map;
  }

  async function loadLots(lotIds) {
    if (!lotIds.length) return {};
    var map = {};

    // Try primary Supabase first (lots may be mirrored there)
    var res = await sb
      .from('lots')
      .select('id, slug, title, current_bid, end_time, lot_images(image_url, is_primary)')
      .in('id', lotIds);
    if (!res.error && res.data) {
      res.data.forEach(function (l) { map[l.id] = l; });
    }

    // Fill missing from local JSON fallback
    var missing = lotIds.filter(function (id) { return !map[id]; });
    if (missing.length) {
      try {
        var fallback = await fetch('../data/all-shop-lots.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
        (fallback || []).forEach(function (item) {
          if (item && item.id && missing.indexOf(String(item.id)) !== -1) {
            map[String(item.id)] = {
              id: item.id,
              slug: item.slug || '',
              title: item.title || item.name || '',
              current_bid: item.currentBid || item.current_bid || 0,
              end_time: item.end_time || item.endTime || null,
              lot_images: item.lot_images || [{ image_url: item.image || '', is_primary: true }],
            };
          }
        });
      } catch (e) {}
    }

    return map;
  }

  async function loadLeads() {
    var bids = await loadAllBids();
    var userIds = uniqueArr(bids.map(function (b) { return b.user_id; }).filter(Boolean));
    var lotIds  = uniqueArr(bids.map(function (b) { return b.lot_id;  }).filter(Boolean));

    var results = await Promise.all([loadProfiles(userIds), loadLots(lotIds)]);
    var profiles = results[0];
    var lots     = results[1];

    return bids.map(function (bid) {
      var profile = profiles[bid.user_id] || {};
      var lot     = lots[bid.lot_id]     || {};
      return {
        id:         bid.id,
        lotId:      bid.lot_id,
        userId:     bid.user_id,
        lotTitle:   lot.title   || ('Лот #' + String(bid.lot_id || '').slice(0, 8)),
        lotSlug:    lot.slug    || '',
        lotImage:   getPrimaryImage(lot.lot_images),
        lotEndTime: lot.end_time || null,
        bidAmount:  bid.amount,
        status:     bid.status || 'active',
        firstName:  profile.first_name || '',
        lastName:   profile.last_name  || '',
        email:      profile.email      || '',
        phone:      profile.phone      || '',
        country:    profile.country    || '',
        city:       profile.city       || '',
        placedAt:      bid.created_at,
        paymentMethod: normalizePaymentMethod(bid.payment_method),
      };
    });
  }

  function getPrimaryImage(images) {
    if (!images || !images.length) return null;
    var primary = images.find(function (i) { return i.is_primary; }) || images[0];
    return (primary && primary.image_url) || null;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════
  function uniqueArr(arr) {
    return arr.filter(function (v, i, a) { return a.indexOf(v) === i; });
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function formatCurrency(amount) {
    return '€' + Number(amount || 0).toLocaleString('en-US');
  }

  function formatCountdown(endTimeIso) {
    if (!endTimeIso) return null;
    var diff = new Date(endTimeIso).getTime() - Date.now();
    if (diff <= 0) return 'Завершён';
    var d = Math.floor(diff / 86400000);
    var h = Math.floor((diff % 86400000) / 3600000);
    var m = Math.floor((diff % 3600000) / 60000);
    var s = Math.floor((diff % 60000) / 1000);
    if (d > 0) return d + 'д ' + h + 'ч ' + m + 'м';
    if (h > 0) return h + 'ч ' + m + 'м ' + s + 'с';
    return m + 'м ' + s + 'с';
  }

  function timerUrgencyClass(endTimeIso) {
    if (!endTimeIso) return 'text-gray-400';
    var diff = new Date(endTimeIso).getTime() - Date.now();
    if (diff <= 0)          return 'text-gray-400';
    if (diff < 3600000)     return 'text-red-500 font-medium';   // < 1h
    if (diff < 86400000)    return 'text-amber-500';              // < 1d
    return 'text-gray-500';
  }

  function getFullName(lead) {
    return [lead.firstName, lead.lastName].filter(Boolean).join(' ') || '—';
  }

  function getGeo(lead) {
    return [lead.city, lead.country].filter(Boolean).join(', ') || '—';
  }

  function getDueDate(days) {
    var d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function genInvoiceNumber() {
    return 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER — TABLE
  // ═══════════════════════════════════════════════════════════════════════
  function applyFilters() {
    var q = state.searchQuery.toLowerCase().trim();
    state.filteredLeads = state.leads.filter(function (lead) {
      var status = getLeadStatus(lead.id, lead.status);
      if (state.filterStatus !== 'all' && status !== state.filterStatus) return false;
      if (q) {
        var haystack = [lead.firstName, lead.lastName, lead.email, lead.phone, lead.country, lead.city, lead.lotTitle].join(' ').toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });
    renderTable();
    updateStats();
  }

  function renderTable() {
    var tbody = document.getElementById('leads-body');
    if (!tbody) return;

    // Clear timers
    Object.keys(state.timers).forEach(function (k) { clearInterval(state.timers[k]); });
    state.timers = {};

    if (!state.filteredLeads.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-14 text-gray-400 text-sm">Нет записей</td></tr>';
      return;
    }

    tbody.innerHTML = state.filteredLeads.map(function (lead) {
      var status      = getLeadStatus(lead.id, lead.status);
      var statusLabel = STATUS_LABELS[status] || status;
      var statusCls   = STATUS_CLASSES[status] || 'bg-gray-100 text-gray-600';
      var name        = getFullName(lead);
      var geo         = getGeo(lead);
      var timerText   = lead.lotEndTime ? formatCountdown(lead.lotEndTime) : '—';
      var timerCls    = timerUrgencyClass(lead.lotEndTime);

      var imgHtml = lead.lotImage
        ? '<img src="' + escapeHtml(lead.lotImage) + '" class="w-10 h-10 object-cover rounded-lg shrink-0" loading="lazy" />'
        : '<div class="w-10 h-10 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center"><svg class="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></div>';

      var statusOptions = Object.keys(STATUS_LABELS).map(function (k) {
        return '<option value="' + k + '"' + (status === k ? ' selected' : '') + '>' + STATUS_LABELS[k] + '</option>';
      }).join('');

      return [
        '<tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">',
        // Lot + timer
        '  <td class="px-4 py-3">',
        '    <div class="flex items-start gap-3">',
        '      ' + imgHtml,
        '      <div class="min-w-0 pt-0.5">',
        '        <div class="text-sm font-medium text-gray-900 leading-snug line-clamp-2 max-w-[200px]" title="' + escapeHtml(lead.lotTitle) + '">' + escapeHtml(lead.lotTitle) + '</div>',
        '        <div class="text-xs mt-1 ' + timerCls + ' font-mono" id="timer-' + lead.id + '">' + escapeHtml(timerText) + '</div>',
        '      </div>',
        '    </div>',
        '  </td>',
        // Client
        '  <td class="px-4 py-3">',
        '    <div class="text-sm font-medium text-gray-900">' + escapeHtml(name) + '</div>',
        '    <div class="text-xs text-gray-400 mt-0.5">' + escapeHtml(lead.email) + '</div>',
        '  </td>',
        // Phone
        '  <td class="px-4 py-3 text-sm text-gray-600">' + escapeHtml(lead.phone || '—') + '</td>',
        // Geo
        '  <td class="px-4 py-3 text-sm text-gray-600">' + escapeHtml(geo) + '</td>',
        // Amount + payment method
        '  <td class="px-4 py-3">',
        '    <div class="text-sm font-semibold text-gray-900">' + formatCurrency(lead.bidAmount) + '</div>',
        '    <div class="mt-0.5">',
        lead.paymentMethod === 'revolut'
          ? '<span class="inline-flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">💜 Revolut</span>'
          : '<span class="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full"><svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg> IBAN</span>',
        '    </div>',
        '  </td>',
        // Status
        '  <td class="px-4 py-3">',
        '    <select class="lead-status-select text-xs font-medium px-2.5 py-1.5 rounded-full cursor-pointer border-0 outline-none ' + statusCls + '" data-lead-id="' + lead.id + '">',
        statusOptions,
        '    </select>',
        '  </td>',
        // Actions
        '  <td class="px-4 py-3">',
        '    <div class="flex items-center gap-1.5 flex-nowrap">',
        // Btn 1: Invoice
        '      <button class="lead-action-btn action-invoice inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors whitespace-nowrap" data-lead-id="' + lead.id + '" title="Отправить инвойс">',
        '        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>',
        '        Инвойс',
        '      </button>',
        // Btn 2: Win + Invoice
        '      <button class="lead-action-btn action-win-invoice inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors whitespace-nowrap" data-lead-id="' + lead.id + '" title="Победа + инвойс">',
        '        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>',
        '        Победа+',
        '      </button>',
        // Btn 3: Win only
        '      <button class="lead-action-btn action-win-only inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors whitespace-nowrap" data-lead-id="' + lead.id + '" title="Только уведомление о победе">',
        '        <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>',
        '        Победа',
        '      </button>',
        '    </div>',
        '  </td>',
        '</tr>',
      ].join('\n');
    }).join('\n');

    // Start countdowns
    state.filteredLeads.forEach(function (lead) {
      if (!lead.lotEndTime) return;
      var el = document.getElementById('timer-' + lead.id);
      if (!el) return;
      state.timers[lead.id] = setInterval(function () {
        var text = formatCountdown(lead.lotEndTime);
        var cls  = timerUrgencyClass(lead.lotEndTime);
        if (!el) { clearInterval(state.timers[lead.id]); return; }
        el.textContent = text;
        el.className = 'text-xs mt-1 font-mono ' + cls;
        if (text === 'Завершён') clearInterval(state.timers[lead.id]);
      }, 1000);
    });

    // Status selects
    tbody.querySelectorAll('.lead-status-select').forEach(function (sel) {
      sel.addEventListener('change', function () {
        var id  = sel.dataset.leadId;
        var val = sel.value;
        setLeadStatus(id, val);
        var cls = STATUS_CLASSES[val] || 'bg-gray-100 text-gray-600';
        sel.className = 'lead-status-select text-xs font-medium px-2.5 py-1.5 rounded-full cursor-pointer border-0 outline-none ' + cls;
        updateStats();
      });
    });

    // Action buttons
    tbody.querySelectorAll('.lead-action-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var lead = state.leads.find(function (l) { return l.id === btn.dataset.leadId; });
        if (!lead) return;
        state.currentLead = lead;
        if (btn.classList.contains('action-invoice'))     openBankModal('invoice');
        else if (btn.classList.contains('action-win-invoice')) openBankModal('win-invoice');
        else if (btn.classList.contains('action-win-only'))    openWinModal();
      });
    });
  }

  function updateStats() {
    var total  = state.leads.length;
    var active = 0, won = 0, paid = 0;
    state.leads.forEach(function (l) {
      var s = getLeadStatus(l.id, l.status);
      if (s === 'active')  active++;
      if (s === 'won')     won++;
      if (s === 'paid')    paid++;
    });
    setText('stats-total',  total);
    setText('stats-active', active);
    setText('stats-won',    won);
    setText('stats-paid',   paid);
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MODALS
  // ═══════════════════════════════════════════════════════════════════════
  function openBankModal(action) {
    state.currentAction = action;
    var lead = state.currentLead;
    var paymentMethod = normalizePaymentMethod(lead.paymentMethod);

    setText('modal-bank-title', action === 'invoice' ? 'Отправить инвойс' : 'Победа + Инвойс');

    var clientEl = document.getElementById('modal-client-info');
    if (clientEl) clientEl.textContent = getFullName(lead) + ' <' + lead.email + '>';

    var lotEl = document.getElementById('modal-lot-title');
    if (lotEl) lotEl.textContent = lead.lotTitle;

    var amountEl = document.getElementById('bank-amount');
    if (amountEl) amountEl.value = lead.bidAmount || '';

    var refEl = document.getElementById('bank-reference');
    if (refEl) refEl.value = genInvoiceNumber();

    // Lock payment method to the option the client selected on the site.
    switchPaymentType(paymentMethod);
    setPaymentTypeReadOnly(paymentMethod);

    showEl('modal-bank');
  }

  function closeBankModal() {
    hideEl('modal-bank');
    state.currentLead   = null;
    state.currentAction = null;
  }

  function openWinModal() {
    state.currentAction = 'win-only';
    var lead = state.currentLead;
    setText('win-client-name', getFullName(lead) + ' (' + lead.email + ')');
    setText('win-lot-title',   lead.lotTitle);
    setText('win-bid-amount',  formatCurrency(lead.bidAmount));
    showEl('modal-win');
  }

  function closeWinModal() {
    hideEl('modal-win');
    state.currentLead   = null;
    state.currentAction = null;
  }

  function showEl(id) {
    var el = document.getElementById(id);
    if (el) { el.style.display = 'flex'; el.removeAttribute('hidden'); }
  }

  function hideEl(id) {
    var el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.setAttribute('hidden', ''); }
  }

  // Payment type switcher (Revolut ↔ IBAN)
  function switchPaymentType(type) {
    var revF = document.getElementById('revolut-fields');
    var ibaF = document.getElementById('iban-fields');
    var revB = document.querySelector('[data-payment-type="revolut"]');
    var ibaB = document.querySelector('[data-payment-type="iban"]');

    var isRev = normalizePaymentMethod(type) === 'revolut';
    revF.style.display = isRev ? 'block' : 'none';
    ibaF.style.display = isRev ? 'none'  : 'block';

    [revB, ibaB].forEach(function (b, idx) {
      var active = (idx === 0) ? isRev : !isRev;
      b.className = b.className.replace(/(tab-active|tab-inactive)/g, '');
      b.className += active ? ' tab-active' : ' tab-inactive';
    });
  }

  function setPaymentTypeReadOnly(type) {
    var paymentType = normalizePaymentMethod(type);
    var note = document.getElementById('payment-method-note');
    document.querySelectorAll('[data-payment-type]').forEach(function (btn) {
      var isActive = btn.dataset.paymentType === paymentType;
      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.style.cursor = 'not-allowed';
      btn.style.pointerEvents = 'none';
      btn.style.opacity = isActive ? '1' : '0.55';
    });
    if (note) {
      note.textContent = paymentType === 'revolut'
        ? 'Клиент выбрал Revolut. Этот способ оплаты зафиксирован.'
        : 'Клиент выбрал IBAN. Этот способ оплаты зафиксирован.';
    }
  }

  function getPaymentType() {
    var revF = document.getElementById('revolut-fields');
    return revF && revF.style.display !== 'none' ? 'revolut' : 'iban';
  }

  function collectPaymentDetails() {
    if (getPaymentType() === 'revolut') {
      return {
        type: 'Revolut',
        tag:  val('rev-tag'),
        name: val('rev-name'),
      };
    }
    return {
      type: 'Bank Transfer (IBAN)',
      name: val('iban-name'),
      iban: val('iban-number'),
      bic:  val('iban-bic'),
      bank: val('iban-bank'),
    };
  }

  function formatPaymentBlock(d, amount, ref) {
    if (d.type === 'Revolut') {
      return [
        'Payment via Revolut',
        'Revolut: ' + d.tag,
        'Recipient: ' + d.name,
        'Amount: ' + formatCurrency(amount),
        'Reference: ' + ref,
      ].join('\n');
    }
    return [
      'Bank Transfer (IBAN)',
      'Beneficiary: ' + d.name,
      'IBAN: ' + d.iban,
      'BIC/SWIFT: ' + d.bic,
      'Bank: ' + d.bank,
      'Amount: ' + formatCurrency(amount),
      'Reference: ' + ref,
    ].join('\n');
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? (el.value || '').trim() : '';
  }

  // ═══════════════════════════════════════════════════════════════════════
  // EMAIL (EmailJS)
  // ═══════════════════════════════════════════════════════════════════════
  function emailConfigured() {
    return CONFIG.emailjs.publicKey && CONFIG.emailjs.serviceId;
  }

  function sendEmail(templateId, params) {
    if (!emailConfigured()) {
      return Promise.reject(new Error('EmailJS не настроен. Заполни CONFIG.emailjs в admin.js'));
    }
    if (!templateId) {
      return Promise.reject(new Error('Template ID не задан в CONFIG.emailjs'));
    }
    return window.emailjs.send(CONFIG.emailjs.serviceId, templateId, params);
  }

  async function handleSendInvoice() {
    var lead = state.currentLead;
    if (!lead) return;

    var amount = val('bank-amount')    || String(lead.bidAmount || 0);
    var ref    = val('bank-reference') || genInvoiceNumber();
    var pd     = collectPaymentDetails();

    var templateId = state.currentAction === 'win-invoice'
      ? CONFIG.emailjs.templateWinInvoice
      : CONFIG.emailjs.templateInvoice;

    setBtnLoading('send-email-btn', 'send-email-btn-text', true, 'Отправка...');

    try {
      await sendEmail(templateId, {
        to_email:        lead.email,
        to_name:         getFullName(lead),
        lot_title:       lead.lotTitle,
        bid_amount:      formatCurrency(amount),
        invoice_number:  ref,
        payment_type:    pd.type,
        payment_details: formatPaymentBlock(pd, amount, ref),
        due_date:        getDueDate(14),
        from_name:       CONFIG.auctionHouse.name,
      });

      showToast('Письмо отправлено → ' + lead.email, 'success');

      if (state.currentAction === 'win-invoice') {
        setLeadStatus(lead.id, 'won');
      }
      closeBankModal();
      applyFilters();
    } catch (e) {
      showToast('Ошибка: ' + (e.message || e.text || 'unknown'), 'error');
    } finally {
      setBtnLoading('send-email-btn', 'send-email-btn-text', false, 'Отправить письмо');
    }
  }

  async function handleSendWinOnly() {
    var lead = state.currentLead;
    if (!lead) return;

    setBtnLoading('send-win-btn', 'send-win-btn-text', true, 'Отправка...');

    try {
      await sendEmail(CONFIG.emailjs.templateWinOnly, {
        to_email:        lead.email,
        to_name:         getFullName(lead),
        lot_title:       lead.lotTitle,
        bid_amount:      formatCurrency(lead.bidAmount),
        invoice_number:  '—',
        payment_type:    'Payment instructions will follow',
        payment_details: 'Our team will contact you shortly with payment details.',
        due_date:        getDueDate(14),
        from_name:       CONFIG.auctionHouse.name,
      });

      showToast('Уведомление отправлено → ' + lead.email, 'success');
      setLeadStatus(lead.id, 'won');
      closeWinModal();
      applyFilters();
    } catch (e) {
      showToast('Ошибка: ' + (e.message || e.text || 'unknown'), 'error');
    } finally {
      setBtnLoading('send-win-btn', 'send-win-btn-text', false, 'Отправить уведомление');
    }
  }

  function setBtnLoading(btnId, textId, loading, text) {
    var btn  = document.getElementById(btnId);
    var span = document.getElementById(textId);
    if (!btn) return;
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
    if (span) span.textContent = text;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // TOAST
  // ═══════════════════════════════════════════════════════════════════════
  function showToast(msg, type) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium shadow-xl z-[100] max-w-xs transition-all duration-300 '
      + (type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white');
    el.style.display  = 'block';
    el.style.opacity  = '1';
    el.style.transform = 'translateY(0)';
    clearTimeout(el._t);
    el._t = setTimeout(function () {
      el.style.opacity = '0';
      setTimeout(function () { el.style.display = 'none'; }, 300);
    }, 3500);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SCREENS
  // ═══════════════════════════════════════════════════════════════════════
  function showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-ui').style.display     = 'none';
  }

  function showAdmin() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-ui').style.display     = 'block';
  }

  async function loadAndRender() {
    var loading  = document.getElementById('leads-loading');
    var errorDiv = document.getElementById('leads-error');
    var errorTxt = document.getElementById('leads-error-text');
    var wrapper  = document.getElementById('leads-table-wrapper');

    if (loading)  loading.style.display  = 'flex';
    if (wrapper)  wrapper.style.display  = 'none';
    if (errorDiv) errorDiv.style.display = 'none';

    try {
      state.adminStatuses = loadAdminStatuses();
      state.leads         = await loadLeads();
      state.filteredLeads = state.leads.slice();
      applyFilters();
      if (loading) loading.style.display = 'none';
      if (wrapper) wrapper.style.display = 'block';
    } catch (e) {
      if (loading)  loading.style.display  = 'none';
      if (errorDiv) errorDiv.style.display = 'flex';
      if (errorTxt) errorTxt.textContent   = e.message || 'Ошибка загрузки';
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════════
  function init() {
    initSupabase();
    state.adminStatuses = loadAdminStatuses();

    // Init EmailJS
    if (CONFIG.emailjs.publicKey) {
      window.emailjs && window.emailjs.init({ publicKey: CONFIG.emailjs.publicKey });
    }

    // ── Login ──────────────────────────────────────────────────────────
    var loginPass  = document.getElementById('admin-pass');
    var loginBtn   = document.getElementById('login-btn');
    var loginError = document.getElementById('login-error');

    function tryLogin() {
      if (authenticate(loginPass.value)) {
        showAdmin();
        loadAndRender();
      } else {
        loginError.textContent = 'Неверный пароль';
        loginError.classList.remove('hidden');
        loginPass.value = '';
        loginPass.focus();
      }
    }

    if (loginBtn)  loginBtn.addEventListener('click', tryLogin);
    if (loginPass) loginPass.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });

    // ── Logout / Refresh ───────────────────────────────────────────────
    on('logout-btn',  'click', logout);
    on('refresh-btn', 'click', loadAndRender);

    // ── Search ─────────────────────────────────────────────────────────
    var searchEl = document.getElementById('search-input');
    if (searchEl) {
      searchEl.addEventListener('input', function () {
        state.searchQuery = searchEl.value;
        applyFilters();
      });
    }

    // ── Filter tabs ────────────────────────────────────────────────────
    document.querySelectorAll('[data-filter-status]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filterStatus = btn.dataset.filterStatus;
        document.querySelectorAll('[data-filter-status]').forEach(function (b) {
          b.className = b.className.replace('tab-active', 'tab-inactive');
        });
        btn.className = btn.className.replace('tab-inactive', 'tab-active');
        applyFilters();
      });
    });

    // ── Modal: bank ────────────────────────────────────────────────────
    on('close-bank-modal',   'click', closeBankModal);
    on('close-bank-modal-2', 'click', closeBankModal);
    on('send-email-btn',     'click', handleSendInvoice);

    // ── Modal: win ─────────────────────────────────────────────────────
    on('close-win-modal',   'click', closeWinModal);
    on('close-win-modal-2', 'click', closeWinModal);
    on('send-win-btn',      'click', handleSendWinOnly);

    // Close modals on backdrop click
    document.getElementById('modal-bank').addEventListener('click', function (e) {
      if (e.target === this) closeBankModal();
    });
    document.getElementById('modal-win').addEventListener('click', function (e) {
      if (e.target === this) closeWinModal();
    });

    // ── Auth check ─────────────────────────────────────────────────────
    if (isAuthenticated()) {
      showAdmin();
      loadAndRender();
    } else {
      showLogin();
    }
  }

  function on(id, event, handler) {
    var el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
