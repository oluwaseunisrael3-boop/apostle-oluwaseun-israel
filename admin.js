/* Administrator dashboard. Plain JavaScript, no build step. */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var root = document.getElementById('root');
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var CATS = ['Faith', 'Purpose', 'Destiny', 'Spiritual Growth', 'Deliverance', 'Wisdom', 'Leadership', 'Life Transformation'];

  if (!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY || !window.supabase) {
    root.innerHTML = '<div class="login"><div class="box p stack" style="max-width:460px"><h2>Database not connected</h2><p>Open <b>config.js</b> on GitHub and paste your Supabase Project URL and anon public key. Then reload this page.</p><a class="btn ghost" href="index.html">Back to website</a></div></div>';
    return;
  }
  var sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY);

  /* ---------- helpers ---------- */
  function toCSV(rows) { if (!rows.length) return ''; var cols = Object.keys(rows[0]); var q = function (v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }; return [cols.join(',')].concat(rows.map(function (r) { return cols.map(function (c) { return q(r[c]); }).join(','); })).join('\n'); }
  function downloadCSV(name, rows) { var b = new Blob(['\ufeff' + toCSV(rows)], { type: 'text/csv;charset=utf-8' }), a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = name; a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000); }
  function compress(file, max) {
    if (!/^image\//.test(file.type) || file.type === 'image/svg+xml' || !window.createImageBitmap) return Promise.resolve(file);
    return createImageBitmap(file).then(function (bmp) {
      var s = Math.min(1, max / Math.max(bmp.width, bmp.height)), c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
      c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(function (b) { res(b || file); }, 'image/webp', 0.85); });
    }).catch(function () { return file; });
  }
  function uploadFile(file, folder, max) {
    return compress(file, max || 1800).then(function (body) {
      var webp = body !== file, ext = webp ? 'webp' : ((file.name.split('.').pop() || 'bin').toLowerCase());
      var path = folder + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
      return sb.storage.from('media').upload(path, body, { contentType: webp ? 'image/webp' : file.type, upsert: false }).then(function (r) {
        if (r.error) throw r.error; return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
      });
    });
  }
  function removeStored(url) { var m = String(url || '').match(/\/object\/public\/media\/(.+)$/); return m ? sb.storage.from('media').remove([decodeURIComponent(m[1])]) : Promise.resolve(); }
  function toLocal(iso) { if (!iso) return ''; var d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); }
  function msg(el, text, bad) { el.innerHTML = text ? '<p class="' + (bad ? 'err' : 'muted') + '" role="' + (bad ? 'alert' : 'status') + '">' + esc(text) + '</p>' : ''; }

  /* ---------- auth + shell ---------- */
  var NAV = [['dashboard', 'Overview'], ['live', 'Live control'], ['audio', 'Audio messages'], ['photos', 'Pictures'], ['invitations', 'Invitations'], ['broadcasts', 'Video broadcasts'], ['video', 'Video messages'], ['books', 'Books'], ['resources', 'Resources'], ['engagements', 'Speaking archive'], ['enquiries', 'Enquiries'], ['subscribers', 'Subscribers'], ['biography', 'Biography and pages'], ['settings', 'Settings']];

  function showLogin(note) {
    root.innerHTML = '<div class="login"><form id="lf"><h2>Administrator sign-in</h2><div class="stack"><div><label for="em">Email</label><input id="em" type="email" autocomplete="username" required></div><div><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div><div id="lm">' + (note ? '<p class="err">' + esc(note) + '</p>' : '') + '</div><button class="btn" style="width:100%" id="lb">Sign in</button><a class="muted" href="index.html">Back to website</a></div></form></div>';
    $('#lf').addEventListener('submit', function (e) {
      e.preventDefault(); $('#lb').disabled = true; $('#lb').textContent = 'Signing in';
      sb.auth.signInWithPassword({ email: $('#em').value, password: $('#pw').value }).then(function (r) {
        if (r.error) { $('#lb').disabled = false; $('#lb').textContent = 'Sign in'; msg($('#lm'), 'Sign-in failed. Check your email and password.', true); } else start();
      });
    });
  }
  function start() {
    sb.auth.getSession().then(function (r) {
      if (!r.data.session) return showLogin();
      return sb.from('admin_profiles').select('id').eq('id', r.data.session.user.id).maybeSingle().then(function (p) {
        if (!p.data) { sb.auth.signOut(); return showLogin('This account is not authorised to manage the website.'); }
        shell();
      });
    });
  }
  function shell() {
    root.innerHTML = '<div class="shell"><header class="topbar"><b>Dashboard</b><button class="btn ghost" style="color:#fff;border-color:#fff" id="mb" aria-expanded="false">Menu</button></header>' +
      '<nav class="nav" id="nav" aria-label="Administrator">' + NAV.map(function (n) { return '<a href="#/' + n[0] + '" data-r="' + n[0] + '">' + n[1] + '</a>'; }).join('') + '<hr><a href="index.html">View website</a><a href="#" id="so">Sign out</a></nav><main id="view"></main></div>';
    $('#mb').addEventListener('click', function () { var o = $('#nav').classList.toggle('open'); this.setAttribute('aria-expanded', o); });
    $('#so').addEventListener('click', function (e) { e.preventDefault(); sb.auth.signOut().then(function () { location.hash = ''; showLogin(); }); });
    window.addEventListener('hashchange', route); route();
  }
  function route() {
    var parts = (location.hash.replace(/^#\/?/, '') || 'dashboard').split('?'), r = parts[0], qs = new URLSearchParams(parts[1] || '');
    $$('#nav a[data-r]').forEach(function (a) { a.classList.toggle('on', a.getAttribute('data-r') === r); });
    $('#nav').classList.remove('open'); window.scrollTo(0, 0);
    var v = VIEWS[r] || VIEWS.dashboard; $('#view').innerHTML = '<p class="muted">Loading</p>'; v($('#view'), qs);
  }

  /* ---------- generic CRUD ---------- */
  function fieldHtml(f, val) {
    var id = 'f-' + f.key, v = val == null ? '' : val, t = f.type || 'text', inner;
    if (t === 'textarea') inner = '<textarea id="' + id + '" data-key="' + f.key + '">' + esc(v) + '</textarea>';
    else if (t === 'select') inner = '<select id="' + id + '" data-key="' + f.key + '">' + f.options.map(function (o) { return '<option value="' + esc(o) + '"' + (o === v ? ' selected' : '') + '>' + esc(o || 'None') + '</option>'; }).join('') + '</select>';
    else if (t === 'bool') inner = '<label style="display:flex;gap:10px;align-items:center;min-height:44px;font-weight:400"><input type="checkbox" style="width:20px;height:20px" id="' + id + '" data-key="' + f.key + '" data-type="bool"' + (val ? ' checked' : '') + '> Yes</label>';
    else if (t === 'datetime') inner = '<input type="datetime-local" id="' + id + '" data-key="' + f.key + '" data-type="datetime" value="' + esc(toLocal(val)) + '">';
    else if (t === 'number') inner = '<input type="number" id="' + id + '" data-key="' + f.key + '" data-type="number" value="' + esc(v) + '">';
    else if (t === 'date') inner = '<input type="date" id="' + id + '" data-key="' + f.key + '" value="' + esc(v) + '">';
    else if (t === 'image' || t === 'audio' || t === 'file') {
      var acc = t === 'image' ? 'image/*' : t === 'audio' ? 'audio/*' : 'application/pdf,*/*';
      inner = '<div class="up stack" style="margin-top:0"><div class="prev">' + (t === 'image' && v ? '<img src="' + esc(v) + '" alt="">' : '') + '</div><div class="row"><label class="btn ghost" style="margin:0">' + (t === 'image' ? 'Upload picture' : t === 'audio' ? 'Upload audio (max 50 MB)' : 'Upload file') + '<input type="file" hidden accept="' + acc + '" data-up="' + (f.folder || t) + '" data-kind="' + t + '"></label><button type="button" class="btn ghost" data-clear>Remove</button></div><input type="text" id="' + id + '" data-key="' + f.key + '" placeholder="Or paste a link" value="' + esc(v) + '"><div class="up-msg"></div></div>';
    } else inner = '<input type="text" id="' + id + '" data-key="' + f.key + '" value="' + esc(v) + '"' + (f.required ? ' required' : '') + '>';
    return '<div><label for="' + id + '">' + esc(f.label) + (f.required ? ' *' : '') + '</label>' + inner + (f.help ? '<p class="muted">' + esc(f.help) + '</p>' : '') + '</div>';
  }
  function collect(form) {
    var o = {};
    $$('[data-key]', form).forEach(function (el) {
      var k = el.getAttribute('data-key'), t = el.getAttribute('data-type'), v = el.value;
      if (t === 'bool') o[k] = el.checked; else if (t === 'datetime') o[k] = v ? new Date(v).toISOString() : null; else if (t === 'number') o[k] = v === '' ? null : Number(v); else o[k] = v === '' ? null : v;
    });
    return o;
  }
  document.addEventListener('change', function (e) {
    var inp = e.target; if (!inp.matches || !inp.matches('input[type=file][data-up]')) return;
    var f = inp.files[0]; if (!f) return; var box = inp.closest('.up'), text = $('input[type=text]', box), m = $('.up-msg', box);
    msg(m, 'Uploading, please wait');
    uploadFile(f, inp.getAttribute('data-up'), 1800).then(function (url) {
      text.value = url; if (inp.getAttribute('data-kind') === 'image') $('.prev', box).innerHTML = '<img src="' + esc(url) + '" alt="">'; msg(m, 'Uploaded. Remember to press Save.');
    }).catch(function (er) { msg(m, er.message || 'Upload failed', true); }); inp.value = '';
  });
  document.addEventListener('click', function (e) {
    var c = e.target.closest && e.target.closest('[data-clear]'); if (!c) return;
    var box = c.closest('.up'); $('input[type=text]', box).value = ''; $('.prev', box).innerHTML = '';
  });

  function crud(cfg) {
    return function (view, qs) {
      var rows = [];
      function load() { return sb.from(cfg.table).select('*').order(cfg.order.col, { ascending: !!cfg.order.asc }).then(function (r) { rows = r.data || []; drawList(r.error ? r.error.message : ''); }); }
      function drawList(err) {
        view.innerHTML = '<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">' + esc(cfg.title) + '</h2><button class="btn" id="add">Add new</button></div>' + (cfg.intro ? '<p class="muted" style="max-width:640px">' + esc(cfg.intro) + '</p>' : '') + (err ? '<p class="err">' + esc(err) + '</p>' : '') +
          '<div id="note"></div><ul class="list box">' + (rows.length ? rows.map(function (r, i) { return '<li class="row" style="justify-content:space-between"><div style="min-width:0"><b>' + esc(r[cfg.listKey] || '(untitled)') + '</b><div class="muted">' + esc(r[cfg.subKey] || '') + '</div></div><div class="row"><button class="btn ghost" data-e="' + i + '">Edit</button><button class="btn danger" data-d="' + i + '">Delete</button></div></li>'; }).join('') : '<li class="muted">Nothing here yet. Choose Add new.</li>') + '</ul>';
        $('#add').addEventListener('click', function () { form(null); });
        $$('[data-e]', view).forEach(function (b) { b.addEventListener('click', function () { form(rows[+b.getAttribute('data-e')]); }); });
        $$('[data-d]', view).forEach(function (b) { b.addEventListener('click', function () {
          var r = rows[+b.getAttribute('data-d')]; if (!confirm('Delete "' + (r[cfg.listKey] || 'this item') + '"? This cannot be undone.')) return;
          sb.from(cfg.table).delete().eq('id', r.id).then(function (x) {
            if (x.error) return msg($('#note'), x.error.message, true);
            Promise.all(cfg.fields.filter(function (f) { return f.type === 'image' || f.type === 'audio'; }).map(function (f) { return removeStored(r[f.key]); })).then(load);
          });
        }); });
      }
      function form(row) {
        var d = Object.assign({}, cfg.defaults || {}, row || {});
        view.innerHTML = '<form id="cf" class="stack" style="max-width:680px"><h2>' + (row ? 'Edit' : 'Add') + ': ' + esc(cfg.title) + '</h2>' + cfg.fields.map(function (f) { return fieldHtml(f, d[f.key]); }).join('') + '<div id="fm"></div><div class="row"><button class="btn" id="sv">Save</button><button type="button" class="btn ghost" id="cn">Cancel</button></div></form>';
        $('#cn').addEventListener('click', load);
        $('#cf').addEventListener('submit', function (e) {
          e.preventDefault(); $('#sv').disabled = true; var p = collect($('#cf'));
          var q = row ? sb.from(cfg.table).update(p).eq('id', row.id) : sb.from(cfg.table).insert(p);
          q.then(function (r) { if (r.error) { $('#sv').disabled = false; msg($('#fm'), r.error.message, true); } else load().then(function () { msg($('#note'), 'Saved.'); }); });
        });
      }
      load().then(function () { if (qs && qs.get('new') === '1') form(null); });
    };
  }

  var STATUS3 = ['published', 'coming_soon', 'hidden'];
  var VIEWS = {};
  VIEWS.audio = crud({ table: 'audio_messages', title: 'Audio messages', listKey: 'title', subKey: 'category', order: { col: 'published_on' }, defaults: { is_published: true, published_on: new Date().toISOString().slice(0, 10) },
    intro: 'Add audio for visitors to listen to whenever you are not live. Uploads are limited to 50 MB per file on the free Supabase plan. For longer recordings, host the audio elsewhere and paste its direct link.',
    fields: [{ key: 'title', label: 'Title', required: true }, { key: 'audio_url', label: 'Audio file', type: 'audio', required: true }, { key: 'description', label: 'Short description', type: 'textarea' }, { key: 'category', label: 'Category', type: 'select', options: [''].concat(CATS) }, { key: 'cover_url', label: 'Cover picture (optional)', type: 'image', folder: 'covers' }, { key: 'duration', label: 'Duration (optional)' }, { key: 'published_on', label: 'Date published', type: 'date' }, { key: 'is_featured', label: 'Feature on the home page', type: 'bool' }, { key: 'is_published', label: 'Visible on website', type: 'bool' }] });
  VIEWS.video = crud({ table: 'video_messages', title: 'Video messages', listKey: 'title', subKey: 'category', order: { col: 'published_on' }, defaults: { is_published: true },
    fields: [{ key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Short description', type: 'textarea' }, { key: 'youtube_url', label: 'YouTube link', required: true }, { key: 'category', label: 'Category', type: 'select', options: [''].concat(CATS) }, { key: 'cover_url', label: 'Cover picture (optional; the YouTube thumbnail is used if empty)', type: 'image', folder: 'covers' }, { key: 'duration', label: 'Duration' }, { key: 'published_on', label: 'Date published', type: 'date' }, { key: 'is_featured', label: 'Feature on the home page', type: 'bool' }, { key: 'is_published', label: 'Visible on website', type: 'bool' }] });
  VIEWS.broadcasts = crud({ table: 'broadcasts', title: 'Video broadcasts', listKey: 'title', subKey: 'status', order: { col: 'scheduled_at' }, defaults: { status: 'scheduled', is_published: true },
    intro: 'The LIVE badge appears on the website only when a broadcast status is set to live here. Set it to ended when you finish. Use recording for past broadcasts you want visitors to replay.',
    fields: [{ key: 'title', label: 'Broadcast title', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'youtube_url', label: 'YouTube live or video link', required: true }, { key: 'scheduled_at', label: 'Scheduled date and time', type: 'datetime' }, { key: 'status', label: 'Status', type: 'select', options: ['scheduled', 'live', 'ended', 'recording'] }, { key: 'is_published', label: 'Visible on website', type: 'bool' }] });
  VIEWS.books = crud({ table: 'books', title: 'Books', listKey: 'title', subKey: 'status', order: { col: 'sort_order', asc: true }, defaults: { status: 'published', author: 'Apostle Oluwaseun Israel', sort_order: 100 },
    intro: 'Selar remains the source of truth for price. The price shown here is for display only. Use coming_soon to hide the Buy button.',
    fields: [{ key: 'title', label: 'Title', required: true }, { key: 'author', label: 'Author' }, { key: 'cover_url', label: 'Cover', type: 'image', folder: 'covers' }, { key: 'short_description', label: 'Short description', type: 'textarea' }, { key: 'full_description', label: 'Full description', type: 'textarea' }, { key: 'format', label: 'Format (Ebook, Paperback, Hardcover)' }, { key: 'price_display', label: 'Price to display (optional)' }, { key: 'selar_url', label: 'Selar checkout link (https://)' }, { key: 'category', label: 'Product category' }, { key: 'status', label: 'Status', type: 'select', options: STATUS3 }, { key: 'is_featured', label: 'Feature on the home page (the first one is the lead book)', type: 'bool' }, { key: 'sort_order', label: 'Display order (smaller first)', type: 'number' }] });
  VIEWS.resources = crud({ table: 'resources', title: 'Additional resources', listKey: 'title', subKey: 'resource_type', order: { col: 'sort_order', asc: true }, defaults: { status: 'published', sort_order: 100 },
    fields: [{ key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'resource_type', label: 'Type (publication, study material, audio, digital)' }, { key: 'image_url', label: 'Picture', type: 'image', folder: 'resources' }, { key: 'link_url', label: 'Link (https://)' }, { key: 'status', label: 'Status', type: 'select', options: STATUS3 }, { key: 'sort_order', label: 'Display order', type: 'number' }] });
  VIEWS.engagements = crud({ table: 'speaking_engagements', title: 'Speaking archive', listKey: 'title', subKey: 'host', order: { col: 'event_date' }, defaults: { is_published: true },
    fields: [{ key: 'title', label: 'Programme title', required: true }, { key: 'host', label: 'Host church or organisation' }, { key: 'location', label: 'Location' }, { key: 'event_date', label: 'Date', type: 'date' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'is_published', label: 'Visible on website', type: 'bool' }] });

  /* ---------- dashboard ---------- */
  function count(t, f) { var q = sb.from(t).select('id', { count: 'exact', head: true }); if (f) q = f(q); return q.then(function (r) { return r.count || 0; }); }
  VIEWS.dashboard = function (view) {
    view.innerHTML = '<h2>Overview</h2><div class="quick"><a href="#/audio?new=1" style="background:#D4AF37;color:#1B2A4A">Add audio message</a><a href="#/photos" style="background:#1B2A4A;color:#fff">Add or change pictures</a><a href="#/live" style="border:2px solid #1B2A4A;color:#1B2A4A">Live control</a></div><div class="cards" id="cards" style="margin:20px 0"></div><div id="recent"></div>';
    Promise.all([count('invitations'), count('invitations', function (q) { return q.eq('status', 'pending'); }), count('invitations', function (q) { return q.eq('status', 'accepted'); }), count('invitations', function (q) { return q.eq('status', 'completed'); }), count('audio_messages'), count('video_messages'), count('books'), count('enquiries', function (q) { return q.eq('status', 'new'); }), count('subscribers')]).then(function (n) {
      var c = [['Total invitations', n[0], 'invitations'], ['Pending invitations', n[1], 'invitations'], ['Accepted', n[2], 'invitations'], ['Completed engagements', n[3], 'invitations'], ['Messages', n[4] + n[5], 'audio'], ['Books', n[6], 'books'], ['New enquiries', n[7], 'enquiries'], ['Subscribers', n[8], 'subscribers']];
      $('#cards').innerHTML = c.map(function (x) { return '<a class="stat" href="#/' + x[2] + '"><b>' + x[1] + '</b>' + x[0] + '</a>'; }).join('');
    });
    Promise.all([sb.from('invitations').select('id,reference,programme_title,organisation,status').order('created_at', { ascending: false }).limit(5), sb.from('enquiries').select('id,subject,full_name,created_at').order('created_at', { ascending: false }).limit(5)]).then(function (r) {
      var li = function (a, f) { return a && a.length ? a.map(f).join('') : '<li class="muted">None yet.</li>'; };
      $('#recent').innerHTML = '<div class="row" style="align-items:flex-start;gap:20px"><section style="flex:1 1 300px"><h3>Recent invitations</h3><ul class="list box">' + li(r[0].data, function (x) { return '<li><a href="#/invitations"><b>' + esc(x.programme_title) + '</b></a><div class="muted">' + esc(x.organisation + ', ' + x.reference + ', ' + x.status) + '</div></li>'; }) + '</ul></section><section style="flex:1 1 300px"><h3>Recent enquiries</h3><ul class="list box">' + li(r[1].data, function (x) { return '<li><a href="#/enquiries"><b>' + esc(x.subject) + '</b></a><div class="muted">' + esc(x.full_name) + '</div></li>'; }) + '</ul></section></div>';
    });
  };

  /* ---------- live control ---------- */
  VIEWS.live = function (view) {
    sb.from('site_settings').select('value').eq('key', 'radio_live').maybeSingle().then(function (r) {
      var on = r.data && r.data.value === 'true';
      view.innerHTML = '<div class="stack" style="max-width:560px"><h2>Live control</h2><section class="box p stack"><b>TSC Radio</b><p class="muted">Switch this on when you start ministering on TSC Radio, and off when you finish. The website never shows ON AIR by itself.</p><button class="big" id="tg" style="background:' + (on ? '#D8322B' : '#1B2A4A') + '" aria-pressed="' + on + '">' + (on ? 'I AM LIVE. TAP TO END' : 'TAP TO GO LIVE ON TSC RADIO') + '</button><div id="lm"></div></section>' +
        '<section class="box p stack"><b>When you are not live</b><p class="muted">Add an audio message so visitors always have something to listen to. The latest three appear under TSC Radio on the home page.</p><a class="btn gold" href="#/audio?new=1">Add an audio message</a></section>' +
        '<section class="box p stack"><b>YouTube video broadcast</b><p class="muted">To broadcast on video, add the YouTube link and set its status to live.</p><a class="btn ghost" href="#/broadcasts">Open video broadcasts</a></section></div>';
      $('#tg').addEventListener('click', function () {
        var next = !on; sb.from('site_settings').upsert({ key: 'radio_live', value: next ? 'true' : 'false' }).then(function (x) { if (x.error) return msg($('#lm'), x.error.message, true); VIEWS.live(view); });
      });
    });
  };

  /* ---------- pictures ---------- */
  function portrait(key, title, help, host) {
    sb.from('site_settings').select('value').eq('key', key).maybeSingle().then(function (r) {
      var url = (r.data && r.data.value) || '';
      host.innerHTML = '<div class="row" style="align-items:flex-start;gap:16px"><img src="' + esc(url || 'apostle-israel.webp') + '" alt="" style="width:120px;height:150px;object-fit:cover;background:#000;border-radius:4px"><div class="stack" style="flex:1 1 220px;margin-top:0"><b>' + esc(title) + '</b><p class="muted" style="margin:0">' + esc(help) + '</p><div class="row"><label class="btn" style="margin:0">Change picture<input type="file" hidden accept="image/*"></label>' + (url ? '<button class="btn ghost" data-reset>Use original</button>' : '') + '</div><div class="pm"></div></div></div>';
      var pm = $('.pm', host);
      $('input[type=file]', host).addEventListener('change', function () {
        var f = this.files[0]; if (!f) return; msg(pm, 'Uploading, please wait');
        uploadFile(f, 'portraits', 1600).then(function (u) { return sb.from('site_settings').upsert({ key: key, value: u }).then(function (x) { if (x.error) throw x.error; return removeStored(url); }); }).then(function () { portrait(key, title, help, host); }).catch(function (er) { msg(pm, er.message || 'Upload failed', true); });
      });
      var rs = $('[data-reset]', host);
      if (rs) rs.addEventListener('click', function () { if (!confirm('Go back to the original picture?')) return; sb.from('site_settings').upsert({ key: key, value: '' }).then(function () { return removeStored(url); }).then(function () { portrait(key, title, help, host); }); });
    });
  }
  VIEWS.photos = function (view) {
    var rows = [], cat = 'gallery';
    view.innerHTML = '<div class="stack" style="max-width:980px"><h2>Pictures</h2><p class="muted">Large photos are resized automatically so the website stays fast. Changes appear on the website straight away.</p><h3>Main portraits</h3><div class="box p" id="p1"></div><div class="box p" id="p2"></div><h3>Gallery pictures</h3><div class="box p stack"><div><label for="pc">Add pictures as</label><select id="pc"><option value="gallery">Gallery</option><option value="publicity">Publicity (downloadable by event organisers)</option><option value="interview">Interview</option></select></div><label class="btn" style="margin:0;width:fit-content" id="addlbl">Add pictures<input type="file" id="addf" accept="image/*" multiple hidden></label><p class="muted" style="margin:0">You can select many pictures at once from your phone or computer.</p></div><div id="pm"></div><div id="grid"></div></div>';
    portrait('hero_image', 'Home page portrait', 'The large picture at the top of the home page. A photo with a plain dark background works best.', $('#p1'));
    portrait('about_image', 'About section portrait', 'Used in the About sections. If you do not set one, the home page portrait is used.', $('#p2'));
    $('#pc').addEventListener('change', function () { cat = this.value; });
    function load() { return sb.from('gallery_images').select('id,image_url,caption,category,sort_order').order('sort_order').order('created_at', { ascending: false }).then(function (r) { rows = r.data || []; draw(); if (r.error) msg($('#pm'), r.error.message, true); }); }
    function draw() {
      $('#grid').innerHTML = rows.length ? '<div class="pgrid">' + rows.map(function (p, i) { return '<div class="box" style="overflow:hidden"><img src="' + esc(p.image_url) + '" alt="" loading="lazy"><div class="stack" style="padding:12px"><input type="text" placeholder="Caption (optional)" aria-label="Caption" value="' + esc(p.caption || '') + '" data-cap="' + i + '"><select aria-label="Category" data-cat="' + i + '"><option value="gallery"' + (p.category === 'gallery' ? ' selected' : '') + '>Gallery</option><option value="publicity"' + (p.category === 'publicity' ? ' selected' : '') + '>Publicity</option><option value="interview"' + (p.category === 'interview' ? ' selected' : '') + '>Interview</option></select><div class="row"><button class="btn ghost" data-mv="' + i + '|-1"' + (i === 0 ? ' disabled' : '') + '>Earlier</button><button class="btn ghost" data-mv="' + i + '|1"' + (i === rows.length - 1 ? ' disabled' : '') + '>Later</button><label class="btn ghost" style="margin:0">Replace<input type="file" hidden accept="image/*" data-rep="' + i + '"></label><button class="btn danger" data-del="' + i + '">Delete</button></div></div></div>'; }).join('') + '</div>' : '<p class="muted">No pictures yet. Choose Add pictures.</p>';
      $$('[data-cap]').forEach(function (el) { el.addEventListener('change', function () { var p = rows[+el.getAttribute('data-cap')]; sb.from('gallery_images').update({ caption: el.value || null }).eq('id', p.id).then(function (x) { if (x.error) msg($('#pm'), x.error.message, true); else p.caption = el.value; }); }); });
      $$('[data-cat]').forEach(function (el) { el.addEventListener('change', function () { var p = rows[+el.getAttribute('data-cat')]; sb.from('gallery_images').update({ category: el.value }).eq('id', p.id).then(function (x) { if (x.error) msg($('#pm'), x.error.message, true); else p.category = el.value; }); }); });
      $$('[data-mv]').forEach(function (el) { el.addEventListener('click', function () { var a = el.getAttribute('data-mv').split('|'), i = +a[0], j = i + +a[1]; var t = rows[i]; rows[i] = rows[j]; rows[j] = t; draw(); Promise.all(rows.map(function (r, k) { return sb.from('gallery_images').update({ sort_order: k * 10 }).eq('id', r.id); })); }); });
      $$('[data-rep]').forEach(function (el) { el.addEventListener('change', function () { var p = rows[+el.getAttribute('data-rep')], f = el.files[0]; if (!f) return; msg($('#pm'), 'Uploading, please wait'); uploadFile(f, 'gallery').then(function (u) { return sb.from('gallery_images').update({ image_url: u }).eq('id', p.id).then(function (x) { if (x.error) throw x.error; return removeStored(p.image_url); }); }).then(function () { msg($('#pm'), 'Picture replaced.'); load(); }).catch(function (er) { msg($('#pm'), er.message || 'Upload failed', true); }); }); });
      $$('[data-del]').forEach(function (el) { el.addEventListener('click', function () { var p = rows[+el.getAttribute('data-del')]; if (!confirm('Delete this picture permanently?')) return; sb.from('gallery_images').delete().eq('id', p.id).then(function (x) { if (x.error) return msg($('#pm'), x.error.message, true); return removeStored(p.image_url).then(function () { msg($('#pm'), 'Picture deleted.'); load(); }); }); }); });
    }
    $('#addf').addEventListener('change', function () {
      var files = Array.prototype.slice.call(this.files); this.value = ''; if (!files.length) return;
      var first = (rows[0] ? rows[0].sort_order : 100) - files.length - 1, ok = 0, i = 0; $('#addlbl').style.opacity = .5;
      (function next() {
        if (i >= files.length) { $('#addlbl').style.opacity = 1; msg($('#pm'), ok + ' picture' + (ok === 1 ? '' : 's') + ' added. New pictures appear first.'); return load(); }
        msg($('#pm'), 'Uploading ' + (i + 1) + ' of ' + files.length);
        uploadFile(files[i], 'gallery').then(function (u) { return sb.from('gallery_images').insert({ image_url: u, category: cat, sort_order: first + i, is_published: true }); }).then(function (x) { if (x.error) throw x.error; ok++; }).catch(function (er) { msg($('#pm'), er.message || 'One upload failed', true); }).then(function () { i++; next(); });
      })();
    });
    load();
  };

  /* ---------- invitations ---------- */
  var STATUSES = ['pending', 'under_review', 'accepted', 'declined', 'completed'], lab = function (s) { return s.replace('_', ' ').replace(/^./, function (c) { return c.toUpperCase(); }); };
  VIEWS.invitations = function (view) {
    var all = [];
    sb.from('invitations').select('*').order('created_at', { ascending: false }).then(function (r) { all = r.data || []; list(); if (r.error) msg($('#im'), r.error.message, true); });
    function list() {
      var countries = []; all.forEach(function (x) { if (countries.indexOf(x.country) < 0) countries.push(x.country); }); countries.sort();
      view.innerHTML = '<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">Speaking invitations (<span id="n"></span>)</h2><button class="btn ghost" id="ex">Export CSV</button></div><div class="row" style="margin-bottom:14px"><input type="search" id="fq" placeholder="Search" aria-label="Search invitations" style="flex:1 1 180px"><select id="fs" aria-label="Status" style="flex:1 1 150px"><option value="">All statuses</option>' + STATUSES.map(function (s) { return '<option value="' + s + '">' + lab(s) + '</option>'; }).join('') + '</select><select id="fc" aria-label="Country" style="flex:1 1 150px"><option value="">All countries</option>' + countries.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select><input type="date" id="ff" aria-label="Event date from" style="flex:1 1 140px"><input type="date" id="ft" aria-label="Event date to" style="flex:1 1 140px"></div><div id="im"></div><ul class="list box" id="il"></ul>';
      var cur = [];
      function draw() {
        var q = $('#fq').value.toLowerCase(), s = $('#fs').value, c = $('#fc').value, f = $('#ff').value, t = $('#ft').value;
        cur = all.filter(function (x) { return (!s || x.status === s) && (!c || x.country === c) && (!f || x.proposed_date >= f) && (!t || x.proposed_date <= t) && (!q || [x.reference, x.full_name, x.organisation, x.programme_title, x.email, x.city].join(' ').toLowerCase().indexOf(q) > -1); });
        $('#n').textContent = cur.length;
        $('#il').innerHTML = cur.length ? cur.map(function (x, i) { return '<li><button style="all:unset;cursor:pointer;display:block;width:100%" data-o="' + i + '"><div class="row" style="justify-content:space-between"><b>' + esc(x.programme_title) + '</b><span class="tag">' + lab(x.status) + '</span></div><div class="muted">' + esc(x.organisation + ', ' + x.city + ', ' + x.country) + '</div><div class="muted">' + esc(x.reference) + ', proposed ' + esc(x.proposed_date) + '</div></button></li>'; }).join('') : '<li class="muted">No invitations match.</li>';
        $$('[data-o]').forEach(function (b) { b.addEventListener('click', function () { detail(cur[+b.getAttribute('data-o')]); }); });
      }
      ['fq', 'fs', 'fc', 'ff', 'ft'].forEach(function (id) { $('#' + id).addEventListener('input', draw); });
      $('#ex').addEventListener('click', function () { downloadCSV('invitations.csv', cur.map(function (x) { var o = Object.assign({}, x); delete o.ip_hash; delete o.id; return o; })); });
      draw();
    }
    function detail(x) {
      var kv = [['Reference', x.reference], ['Received', new Date(x.created_at).toLocaleString()], ['Name', x.full_name], ['Church or organisation', x.organisation], ['Email', x.email], ['Phone / WhatsApp', x.phone], ['Country', x.country], ['City', x.city], ['Programme', x.programme_title], ['Theme', x.programme_theme], ['Type', x.engagement_type], ['Scope', x.scope], ['Mode', x.attendance_mode], ['Proposed date', x.proposed_date], ['Alternative date', x.alternative_date], ['Venue', x.venue], ['Audience size', x.audience_size], ['Duration', x.duration], ['Details', x.details]];
      view.innerHTML = '<div class="stack" style="max-width:680px"><button class="btn ghost" id="bk" style="width:fit-content">Back to list</button><h2>' + esc(x.reference) + '</h2><dl class="kv box">' + kv.filter(function (k) { return k[1]; }).map(function (k) { return '<div><dt>' + k[0] + '</dt><dd>' + esc(k[1]) + '</dd></div>'; }).join('') + '</dl><div class="row"><a class="btn ghost" href="mailto:' + esc(x.email) + '?subject=' + encodeURIComponent('Re: ' + x.programme_title + ' (' + x.reference + ')') + '">Reply by email</a><a class="btn ghost" target="_blank" rel="noopener" href="https://wa.me/' + esc(String(x.phone).replace(/\D/g, '')) + '">WhatsApp</a></div><div><label for="st">Status</label><select id="st">' + STATUSES.map(function (s) { return '<option value="' + s + '"' + (s === x.status ? ' selected' : '') + '>' + lab(s) + '</option>'; }).join('') + '</select></div><div><label for="nt">Private notes (never shown to the public)</label><textarea id="nt">' + esc(x.admin_notes || '') + '</textarea></div><div id="dm"></div><button class="btn" id="sv">Save changes</button></div>';
      $('#bk').addEventListener('click', function () { sb.from('invitations').select('*').order('created_at', { ascending: false }).then(function (r) { all = r.data || []; list(); }); });
      $('#sv').addEventListener('click', function () { sb.from('invitations').update({ status: $('#st').value, admin_notes: $('#nt').value }).eq('id', x.id).then(function (r) { if (r.error) msg($('#dm'), r.error.message, true); else { x.status = $('#st').value; x.admin_notes = $('#nt').value; msg($('#dm'), 'Saved.'); } }); });
    }
  };

  /* ---------- enquiries and subscribers ---------- */
  VIEWS.enquiries = function (view) {
    function load() {
      sb.from('enquiries').select('*').order('created_at', { ascending: false }).then(function (r) {
        var rows = r.data || [];
        view.innerHTML = '<h2>Contact enquiries</h2>' + (r.error ? '<p class="err">' + esc(r.error.message) + '</p>' : '') + '<div class="stack">' + (rows.length ? rows.map(function (x, i) { return '<div class="box p"><div class="row" style="justify-content:space-between"><b>' + esc(x.subject) + '</b><span class="tag">' + esc(x.status) + '</span></div><div class="muted">' + esc(x.full_name + ', ' + x.email + (x.phone ? ', ' + x.phone : '') + ', ' + new Date(x.created_at).toLocaleString()) + '</div><p style="white-space:pre-line">' + esc(x.message) + '</p><div class="row"><a class="btn ghost" href="mailto:' + esc(x.email) + '?subject=' + encodeURIComponent('Re: ' + x.subject) + '">Reply</a><button class="btn ghost" data-s="' + i + '|handled">Mark handled</button><button class="btn ghost" data-s="' + i + '|archived">Archive</button><button class="btn danger" data-x="' + i + '">Delete</button></div></div>'; }).join('') : '<p class="muted">No enquiries yet.</p>') + '</div>';
        $$('[data-s]').forEach(function (b) { b.addEventListener('click', function () { var a = b.getAttribute('data-s').split('|'); sb.from('enquiries').update({ status: a[1] }).eq('id', rows[+a[0]].id).then(load); }); });
        $$('[data-x]').forEach(function (b) { b.addEventListener('click', function () { if (confirm('Delete this enquiry?')) sb.from('enquiries').delete().eq('id', rows[+b.getAttribute('data-x')].id).then(load); }); });
      });
    } load();
  };
  VIEWS.subscribers = function (view) {
    function load() {
      sb.from('subscribers').select('*').order('created_at', { ascending: false }).then(function (r) {
        var rows = r.data || [];
        view.innerHTML = '<div class="row" style="justify-content:space-between;margin-bottom:12px"><h2 style="margin:0">Newsletter subscribers (' + rows.length + ')</h2><button class="btn ghost" id="ex">Export CSV</button></div>' + (r.error ? '<p class="err">' + esc(r.error.message) + '</p>' : '') + '<ul class="list box">' + (rows.length ? rows.map(function (x, i) { return '<li class="row" style="justify-content:space-between"><span style="word-break:break-all">' + esc(x.email) + '</span><button class="btn ghost" data-x="' + i + '">Remove</button></li>'; }).join('') : '<li class="muted">No subscribers yet.</li>') + '</ul>';
        $('#ex').addEventListener('click', function () { if (confirm('This file contains personal email addresses. Keep it private and use it only for the newsletter. Continue?')) downloadCSV('subscribers.csv', rows.map(function (x) { return { email: x.email, subscribed: x.created_at }; })); });
        $$('[data-x]').forEach(function (b) { b.addEventListener('click', function () { if (confirm('Remove this subscriber?')) sb.from('subscribers').delete().eq('id', rows[+b.getAttribute('data-x')].id).then(load); }); });
      });
    } load();
  };

  /* ---------- biography and settings ---------- */
  VIEWS.biography = function (view) {
    sb.from('bio_content').select('*').order('section').then(function (r) {
      var rows = r.data || [];
      view.innerHTML = '<div class="stack" style="max-width:700px"><h2>Biography and page text</h2><p class="muted">Sections marked [Placeholder] still need your approved text. The privacy and terms pages are edited here too.</p>' + rows.map(function (x, i) { return '<div class="box p stack"><span class="muted">' + esc(x.section) + '</span><input type="text" aria-label="Heading" data-h="' + i + '" value="' + esc(x.heading) + '"><textarea aria-label="Text" style="min-height:150px" data-b="' + i + '">' + esc(x.body) + '</textarea></div>'; }).join('') + '<div id="bm"></div><button class="btn" id="sv">Save all</button></div>';
      $('#sv').addEventListener('click', function () {
        var out = rows.map(function (x, i) { return { section: x.section, heading: $('[data-h="' + i + '"]').value, body: $('[data-b="' + i + '"]').value }; });
        sb.from('bio_content').upsert(out).then(function (x) { msg($('#bm'), x.error ? x.error.message : 'Saved.', !!x.error); });
      });
    });
  };
  var SETTINGS = [['contact_email', 'Official email address'], ['whatsapp', 'WhatsApp number, digits only with country code (for example 2348147560000)'], ['radio_page_url', 'TSC Radio page link (opens when visitors tap the Listen live button)'], ['radio_embed_url', 'TSC Radio player address to embed (leave empty to use the radio page link)'], ['radio_stream_url', 'Direct radio stream address (optional; if set, a simple audio player is used instead of the embedded page)'], ['footer_text', 'Footer description', 'area'], ['seo_description', 'Default search description', 'area'], ['bio_pdf_url', 'Approved biography PDF', 'pdf'], ['speaker_profile_pdf_url', 'Speaker profile PDF for event organisers', 'pdf']];
  VIEWS.settings = function (view) {
    sb.from('site_settings').select('*').then(function (r) {
      var v = {}; (r.data || []).forEach(function (x) { v[x.key] = x.value; });
      view.innerHTML = '<form id="sf" class="stack" style="max-width:680px"><h2>Website settings</h2>' + SETTINGS.map(function (s) {
        var f = { key: s[0], label: s[1], type: s[2] === 'area' ? 'textarea' : s[2] === 'pdf' ? 'file' : 'text', folder: 'documents' }; return fieldHtml(f, v[s[0]]);
      }).join('') + '<div id="sm"></div><button class="btn">Save settings</button></form>';
      $('#sf').addEventListener('submit', function (e) {
        e.preventDefault(); var o = collect($('#sf'));
        sb.from('site_settings').upsert(SETTINGS.map(function (s) { return { key: s[0], value: o[s[0]] || '' }; })).then(function (x) { msg($('#sm'), x.error ? x.error.message : 'Saved. Public pages show the new values on next load.', !!x.error); });
      });
    });
  };

  start();
})();
