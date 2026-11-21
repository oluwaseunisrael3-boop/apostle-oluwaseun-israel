/* Apostle Oluwaseun Israel: public website. Plain JavaScript, no build step. */
(function () {
  'use strict';
  var C = window.SITE_CONFIG || {};
  var sb = (C.SUPABASE_URL && C.SUPABASE_ANON_KEY && window.supabase) ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY) : null;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var img = function (u) { return !u ? '' : /^(https?:|data:)/.test(u) ? u : u.replace(/^\//, ''); };
  var fmtDate = function (d, t) { if (!d) return ''; try { return new Date(d).toLocaleString('en-GB', t ? { dateStyle: 'long', timeStyle: 'short' } : { dateStyle: 'long' }); } catch (e) { return ''; } };
  var ytId = function (u) { var m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|live\/|shorts\/)([\w-]{11})/); return m ? m[1] : null; };
  var validEmail = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); };
  var SITE = 'https://apostleoluwaseunisrael.com';
  var DEFAULT_RADIO = 'https://tabernacleofsolacechurch.github.io/radio.html';
  var PORTRAIT = 'apostle-israel.webp';

  var SET = { contact_email: 'oluwaseunisrael3@gmail.com', whatsapp: '2348147560000', footer_text: 'Preacher, teacher, author and conference speaker, committed to restoring lives and strengthening faith.' };

  var FALLBACK_BOOKS = [
    { title: 'The Door Is Not Locked', short_description: 'Discover the truth, break free from what is holding you back, and step into the life God has for you.', full_description: 'A practical guide for anyone who feels stuck, disappointed or close to giving up. Every chapter ends with a short set of actions to begin the same day.', format: 'Ebook', selar_url: 'https://selar.com/k417w02q4q', cover_url: 'cover-door.webp', status: 'published', is_featured: true },
    { title: 'Where Is the Church?', short_description: 'A Prophetic Alarm', selar_url: 'https://selar.com/260d87809d', cover_url: 'cover-church.webp', status: 'published', is_featured: true },
    { title: 'Kissed by Judas, Built by God', short_description: 'How to survive and heal after betrayal', selar_url: 'https://selar.com/6o37w6m9xl', cover_url: 'cover-judas.webp', status: 'published', is_featured: true },
    { title: 'Understanding the Prophetic', short_description: 'Activating your spiritual sight', selar_url: 'https://selar.com/78g1533174', cover_url: 'cover-prophetic.webp', status: 'published', is_featured: true },
    { title: 'Discharged and Acquitted', selar_url: 'https://selar.com/9hj741k757', cover_url: 'cover-discharged.webp', status: 'published' },
    { title: 'Secrets That Destroy', short_description: 'Unveiling hidden truth to overcome the chains of deception', selar_url: 'https://selar.com/766771824h', cover_url: 'cover-secrets.webp', status: 'published' },
    { title: 'Young and Burning', selar_url: 'https://selar.com/7h3169c879', cover_url: 'cover-young.webp', status: 'published' },
    { title: 'The Cost of the Cross', selar_url: 'https://selar.com/k715g511hd', cover_url: 'cover-cross.webp', status: 'published' },
    { title: 'The Power of Financial Wisdom', short_description: 'Revealing the secrets to Kingdom wealth', selar_url: 'https://selar.com/5103707y16', cover_url: 'cover-finance.webp', status: 'published' },
    { title: 'Breaking Free From Addiction', short_description: 'Overcome destructive habits, conquer your fears, and reclaim your life', selar_url: 'https://selar.com/6y7u1h1t04', cover_url: 'cover-addiction.webp', status: 'published' },
    { title: 'Clothed With Dominion', short_description: 'Understanding power and authority from the Kingdom of God', selar_url: 'https://selar.com/3b1133393x', cover_url: 'cover-clothed.webp', status: 'published' }
  ];
  var FALLBACK_BIO = {
    short_bio: ['Short biography', 'Apostle Oluwaseun Israel is a preacher, teacher, author and conference speaker committed to communicating transformational truths that restore lives, strengthen faith and awaken people to the fullness of their purpose in Christ. [Placeholder: replace with the approved short biography.]'],
    full_bio: ['Who is Apostle Oluwaseun Israel?', '[Placeholder: replace with the approved full biography.]'],
    journey: ['My ministry journey', '[Placeholder: to be supplied.]'], calling: ['My calling and assignment', '[Placeholder: to be supplied.]'],
    vision: ['My vision and passion', '[Placeholder: to be supplied.]'], preaching: ['My work as a preacher and teacher', '[Placeholder: to be supplied.]'],
    authoring: ['My work as an author', '[Placeholder: to be supplied.]'], speaking: ['My speaking and conference engagements', '[Placeholder: to be supplied.]'],
    speaking_areas: ['Speaking areas', 'Prophetic ministry, deliverance, discipleship, financial wisdom and apostolic authority.'],
    privacy: ['Privacy Policy', '[Placeholder: replace with your approved privacy policy.]'], terms: ['Terms of Use', '[Placeholder: replace with your approved terms of use.]']
  };

  function rows(table, f) {
    if (!sb) return Promise.resolve([]);
    var q = sb.from(table).select('*'); if (f) q = f(q);
    return q.then(function (r) { return r.error ? [] : (r.data || []); }, function () { return []; });
  }
  function shareLink(title, page) {
    var url = SITE + '/' + page;
    if (navigator.share) { navigator.share({ title: title, url: url }).catch(function () {}); return; }
    window.open('https://wa.me/?text=' + encodeURIComponent(title + ' ' + url), '_blank', 'noopener');
  }
  function setJsonLd(id, data) {
    var old = document.getElementById(id); if (old) old.remove();
    if (!data) return; var s = document.createElement('script'); s.type = 'application/ld+json'; s.id = id; s.textContent = JSON.stringify(data); document.head.appendChild(s);
  }

  /* ---------- Layout ---------- */
  var NAV = [['index.html', 'Home', 'home'], ['about.html', 'About', 'about'], ['invite.html', 'Invite Me', 'invite'], ['watch-live.html', 'Watch Live', 'watch'], ['messages.html', 'Messages', 'messages'], ['books.html', 'Books &amp; Resources', 'books'], ['media.html', 'Media', 'media'], ['contact.html', 'Contact', 'contact']];
  var page = document.body.getAttribute('data-page');
  var LIVE = null;

  function renderChrome() {
    var links = NAV.map(function (n) { return '<a class="link" href="' + n[0] + '"' + (n[2] === page ? ' aria-current="page" style="border-color:var(--gold)"' : '') + '>' + n[1] + '</a>'; }).join('');
    var mlinks = NAV.map(function (n) { return '<a class="m-link" href="' + n[0] + '">' + n[1] + '</a>'; }).join('');
    $('#site-header').innerHTML = '<a class="skip" href="#main">Skip to content</a><header class="site-header" id="hdr"><div class="wrap bar">' +
      '<a class="wordmark" href="index.html" aria-label="Apostle Oluwaseun Israel, home">Apostle Oluwaseun Israel</a>' +
      '<nav class="nav" aria-label="Primary">' + links + '</nav>' +
      '<div class="bar-actions"><a class="watch-link" href="watch-live.html"><span class="dot"></span><span id="watch-text">Watch live</span></a>' +
      '<a class="btn btn-gold btn-sm" href="invite.html">Invite Apostle Israel</a>' +
      '<button class="burger" id="burger" aria-label="Open menu" aria-expanded="false" aria-controls="menu"><span></span></button></div></div></header>' +
      '<div class="menu" id="menu">' + mlinks + '<div class="m-cta"><a class="btn btn-gold" href="invite.html">Invite Apostle Israel</a><a class="btn btn-line" href="watch-live.html">Watch live</a></div></div>';
    $('#burger').addEventListener('click', function () {
      var o = !$('#menu').classList.contains('open'); $('#menu').classList.toggle('open', o);
      this.setAttribute('aria-expanded', o); this.setAttribute('aria-label', o ? 'Close menu' : 'Open menu'); document.body.style.overflow = o ? 'hidden' : '';
    });
    renderFooter();
    if (!sb) { var n = document.createElement('div'); n.className = 'notice'; n.id = 'setup-notice'; n.textContent = 'Setup mode: the database is not connected yet, so forms and uploaded content are switched off.'; document.body.insertBefore(n, document.body.firstChild); }
  }
  function renderFooter() {
    var f = $('#site-footer');
    f.innerHTML = '<footer class="site-footer"><div class="wrap"><div class="foot-grid">' +
      '<div class="foot-brand"><span class="wordmark">Apostle Oluwaseun Israel</span><p>' + esc(SET.footer_text) + '</p></div>' +
      '<div class="foot-col"><h3>Explore</h3><ul><li><a href="about.html">About</a></li><li><a href="watch-live.html">Watch Live</a></li><li><a href="messages.html">Messages</a></li><li><a href="books.html">Books &amp; Resources</a></li><li><a href="media.html">Media</a></li></ul></div>' +
      '<div class="foot-col"><h3>Invitations and links</h3><ul><li><a href="invite.html">Invite Apostle Israel</a></li><li><a href="https://tabernacleofsolacechurch.github.io/" target="_blank" rel="noopener">Tabernacle of Solace Church</a></li></ul></div>' +
      '<div class="foot-col"><h3>Contact</h3><ul><li><a href="mailto:' + esc(SET.contact_email) + '">' + esc(SET.contact_email) + '</a></li><li><a href="https://wa.me/' + esc(SET.whatsapp) + '" target="_blank" rel="noopener">WhatsApp</a></li></ul></div>' +
      '</div><div class="sep"><span>&copy; ' + new Date().getFullYear() + ' Apostle Oluwaseun Israel. All rights reserved.</span><nav aria-label="Legal"><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Use</a></nav></div></div></footer>' +
      '<a class="wa-float" href="https://wa.me/' + esc(SET.whatsapp) + '?text=' + encodeURIComponent('Hello, I am contacting the office of Apostle Oluwaseun Israel.') + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
      '<svg width="26" height="26" viewBox="0 0 32 32" fill="#fff" aria-hidden="true"><path d="M16 3C9 3 3.4 8.6 3.4 15.5c0 2.4.7 4.7 1.9 6.600L3.200 29l7.100-2.100c1.800 1 3.800 1.500 5.700 1.500 7 0 12.600-5.600 12.600-12.500C28.600 8.600 23 3 16 3zm0 22.800c-1.800 0-3.600-.5-5.100-1.400l-.4-.2-4.200 1.200 1.200-4.100-.3-.4a10 10 0 01-1.600-5.400C5.600 9.900 10.300 5.400 16 5.400s10.400 4.500 10.400 10.100S21.700 25.800 16 25.800zm5.700-7.500c-.3-.2-1.800-.9-2.100-1s-.5-.2-.7.200-.8 1-1 1.200-.4.200-.7 0a8.300 8.300 0 01-4.100-3.600c-.3-.6.300-.5.900-1.700.1-.2 0-.4 0-.5l-1-2.300c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.100-.8.400s-1 1-1 2.500 1.100 2.900 1.200 3.100c.2.200 2.100 3.300 5.200 4.500 1.900.8 2.700.9 3.700.7.600-.1 1.800-.7 2.100-1.500.3-.7.300-1.300.2-1.500s-.3-.2-.6-.4z"/></svg><span>WhatsApp</span></a>';
  }
  function applyLive() {
    $('#hdr').classList.toggle('is-live', !!LIVE);
    var t = $('#watch-text'); if (t) t.textContent = LIVE ? 'Live now' : 'Watch live';
  }

  /* ---------- Shared pieces ---------- */
  function playIcon(c) { return '<svg width="24" height="24" viewBox="0 0 24 24" fill="' + (c || '#1B2A4A') + '"><path d="M6 4l14 8-14 8z"/></svg>'; }
  function messageCard(m, kind) {
    var vid = kind === 'video' ? ytId(m.youtube_url) : null;
    var thumb = m.cover_url ? img(m.cover_url) : (vid ? 'https://img.youtube.com/vi/' + vid + '/hqdefault.jpg' : '');
    var media = '<div class="thumbwrap"' + (vid ? ' data-vid="' + vid + '" data-title="' + esc(m.title) + '"' : '') + '>' + (thumb ? '<img src="' + esc(thumb) + '" alt="" loading="lazy">' : '') +
      (vid ? '<button class="play" aria-label="Watch ' + esc(m.title) + '" data-play style="position:relative">' + playIcon() + '</button>' : (!thumb ? '<svg width="40" height="40" viewBox="0 0 24 24" fill="#D4AF37" aria-hidden="true"><path d="M3 10v4h4l5 4V6L7 10H3zm13.5 2a4.5 4.5 0 00-2.5-4v8a4.5 4.5 0 002.5-4z"/></svg>' : '')) + '</div>';
    return '<article class="mcard">' + media + '<h3>' + esc(m.title) + '</h3>' + (m.category ? '<span class="cat">' + esc(m.category) + '</span>' : '') +
      (m.description ? '<p style="margin-top:6px">' + esc(m.description) + '</p>' : '') +
      '<p class="meta">' + esc([fmtDate(m.published_on), m.duration].filter(Boolean).join(', ')) + '</p>' +
      (kind === 'audio' && m.audio_url ? '<audio controls preload="none" src="' + esc(m.audio_url) + '" aria-label="Audio: ' + esc(m.title) + '"></audio>' : '') +
      '<div class="row-actions"><button class="link-btn" data-share="' + esc(m.title) + '" data-page="messages.html">Share</button></div></article>';
  }
  document.addEventListener('click', function (e) {
    var p = e.target.closest('[data-play]');
    if (p) { var w = p.closest('.thumbwrap'); w.innerHTML = '<iframe title="' + esc(w.getAttribute('data-title')) + '" src="https://www.youtube-nocookie.com/embed/' + w.getAttribute('data-vid') + '?autoplay=1&rel=0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>'; return; }
    var s = e.target.closest('[data-share]'); if (s) { shareLink(s.getAttribute('data-share'), s.getAttribute('data-page') || ''); return; }
    var g = e.target.closest('[data-zoom]'); if (g) { openLightbox(g.getAttribute('data-zoom'), g.getAttribute('data-cap')); }
  });
  function openLightbox(src, cap) {
    var d = document.createElement('div'); d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Photograph viewer');
    d.style.cssText = 'position:fixed;inset:0;z-index:90;background:rgba(10,16,30,.94);display:grid;place-items:center;padding:16px';
    d.innerHTML = '<figure style="max-width:94vw"><img src="' + esc(src) + '" alt="' + esc(cap) + '" style="max-width:94vw;max-height:80vh;object-fit:contain;margin:auto">' + (cap ? '<figcaption style="color:#fff;text-align:center;margin-top:12px">' + esc(cap) + '</figcaption>' : '') + '</figure><button style="position:absolute;top:14px;right:14px;color:#fff;border:1px solid #fff;padding:10px 18px;background:transparent;cursor:pointer">Close</button>';
    var close = function () { d.remove(); document.removeEventListener('keydown', k); };
    var k = function (ev) { if (ev.key === 'Escape') close(); };
    d.addEventListener('click', close); document.addEventListener('keydown', k); document.body.appendChild(d); $('button', d).focus();
  }
  function galleryHtml(list) {
    return '<div class="gal">' + list.map(function (p) { return '<button data-zoom="' + esc(img(p.image_url)) + '" data-cap="' + esc(p.caption || p.alt_text || '') + '" aria-label="Enlarge: ' + esc(p.caption || p.alt_text || 'photograph') + '"><img src="' + esc(img(p.image_url)) + '" alt="' + esc(p.alt_text || p.caption || 'Apostle Oluwaseun Israel') + '" loading="lazy"></button>'; }).join('') + '</div>';
  }
  function bookBuy(b, cls) { return (b.status === 'published' && b.selar_url) ? '<a class="btn ' + (cls || 'btn-gold') + '" href="' + esc(b.selar_url) + '" target="_blank" rel="noopener">Buy now</a>' : '<span class="soon" style="display:inline-block;padding:10px 16px;border:1px dashed var(--navy);color:var(--navy);font-weight:600;font-size:.85rem">Coming soon</span>'; }

  function pickBroadcasts(list) {
    var live = list.filter(function (b) { return b.status === 'live'; })[0] || null, now = Date.now();
    var next = list.filter(function (b) { return b.status === 'scheduled' && b.scheduled_at && new Date(b.scheduled_at).getTime() >= now - 3600000; }).sort(function (a, b) { return new Date(a.scheduled_at) - new Date(b.scheduled_at); })[0] || null;
    var rec = list.filter(function (b) { return b.status === 'recording' || b.status === 'ended'; }).sort(function (a, b) { return new Date(b.scheduled_at || 0) - new Date(a.scheduled_at || 0); });
    return { live: live, next: next, rec: rec };
  }
  function ytPlayer(b, auto) {
    var id = ytId(b.youtube_url);
    return id ? '<div class="watch-frame"><iframe title="' + esc(b.title) + '" loading="lazy" src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0' + (auto ? '&autoplay=1' : '') + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>' : '<div class="live-frame"><p class="state">This broadcast link is not valid.</p></div>';
  }

  /* TSC Radio: ON AIR only when the administrator has switched it on */
  function radioSection(latestAudio) {
    var pageUrl = SET.radio_page_url || DEFAULT_RADIO, embed = SET.radio_embed_url || pageUrl, stream = SET.radio_stream_url, on = SET.radio_live === 'true';
    var player = stream ? '<div class="radio-stream"><p style="font-family:var(--display);font-size:1.4rem">TSC Radio</p><audio controls preload="none" src="' + esc(stream) + '" aria-label="TSC Radio live stream"></audio></div>'
      : '<iframe title="TSC Radio player" src="' + esc(embed) + '" loading="lazy" allow="autoplay; encrypted-media"></iframe>';
    var more = (!on && latestAudio.length) ? '<div class="radio-more"><h3>Not on air right now? Listen to his latest messages</h3><p class="lede" style="margin-bottom:24px">New audio messages are added regularly.</p><div class="cards">' + latestAudio.map(function (m) { return messageCard(m, 'audio'); }).join('') + '</div></div>' : '';
    return '<section class="section on-navy' + (on ? ' is-live' : '') + '" id="radio" aria-labelledby="radio-h"><div class="wrap"><h2 id="radio-h">TSC Radio</h2>' +
      '<p class="lede" style="margin:14px 0 28px">Listen to Tabernacle of Solace Church\'s radio, live broadcasts and recorded messages, right here.</p>' +
      (on ? '<p style="margin-bottom:16px"><span class="onair"><span class="dot"></span>ON AIR NOW</span></p>' : '') +
      '<div class="radio-frame">' + player + '</div>' +
      '<div style="margin-top:20px"><a class="btn-live" href="' + esc(pageUrl) + '" target="_blank" rel="noopener">' + (on ? '<span class="live-pill">LIVE</span>' : '') + '<span>Listen to Apostle Oluwaseun Israel live on TSC Radio</span></a></div>' + more + '</div></section>';
  }

  var TS_TOKEN = '';
  function mountTurnstile(sel) {
    if (!C.TURNSTILE_SITE_KEY) return; var el = $(sel); if (!el) return;
    var go = function () { window.turnstile.render(el, { sitekey: C.TURNSTILE_SITE_KEY, callback: function (t) { TS_TOKEN = t; }, 'expired-callback': function () { TS_TOKEN = ''; } }); };
    if (window.turnstile) { go(); return; }
    var s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true; s.onload = go; document.head.appendChild(s);
  }
  function submitForm(payload) {
    if (!C.SUPABASE_URL) return Promise.resolve({ error: 'The website is not connected to its database yet.' });
    payload.turnstileToken = TS_TOKEN;
    return fetch(C.SUPABASE_URL + '/functions/v1/submit-form', { method: 'POST', headers: { 'Content-Type': 'application/json', apikey: C.SUPABASE_ANON_KEY }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); }).catch(function () { return { error: 'Network error. Check your connection and try again.' }; });
  }
  function newsletterSection() {
    return '<section class="section on-deep" aria-labelledby="news-h"><div class="wrap news"><div><h2 id="news-h">Stay informed</h2><p class="lede" style="margin-top:16px">Receive news of new books, teachings, speaking engagements and live broadcasts.</p></div>' +
      '<form id="news-form" novalidate><label for="nl-email">Email address</label><div class="row"><input id="nl-email" type="email" inputmode="email" autocomplete="email" placeholder="name@example.com"><button class="btn btn-gold" type="submit">Subscribe</button></div><div id="ts-news"></div><p class="msg" role="status" id="news-msg"></p></form></div></section>';
  }
  function bindNewsletter() {
    var f = $('#news-form'); if (!f) return; mountTurnstile('#ts-news');
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var v = $('#nl-email').value.trim(), m = $('#news-msg');
      if (!validEmail(v)) { m.textContent = 'Enter a valid email address, such as name@example.com.'; return; }
      m.textContent = 'Subscribing';
      submitForm({ type: 'subscribe', email: v, website: '' }).then(function (r) { m.textContent = r.ok ? 'You are subscribed. Thank you.' : (r.error || 'Could not subscribe. Try again.'); if (r.ok) $('#nl-email').value = ''; });
    });
  }

  /* ---------- Pages ---------- */
  var PAGES = {};

  PAGES.home = function () {
    if (SET.hero_image) { $('#hero-img').src = SET.hero_image; }
    if (SET.about_image || SET.hero_image) { $('#about-img').src = SET.about_image || SET.hero_image; }
    return Promise.all([
      rows('books', function (q) { return q.order('sort_order'); }), rows('audio_messages', function (q) { return q.order('published_on', { ascending: false }).limit(12); }),
      rows('video_messages', function (q) { return q.eq('is_featured', true).order('published_on', { ascending: false }).limit(4); }),
      rows('broadcasts', function (q) { return q.order('scheduled_at', { ascending: false }).limit(20); }), rows('gallery_images', function (q) { return q.eq('category', 'gallery').order('sort_order').limit(5); })
    ]).then(function (r) {
      var books = r[0].length ? r[0].filter(function (b) { return b.status !== 'hidden'; }) : FALLBACK_BOOKS, audio = r[1], video = r[2], bc = pickBroadcasts(r[3]), photos = r[4];
      var feat = books.filter(function (b) { return b.is_featured; }), lead = feat[0], shelf = feat.slice(1, 4), others = books.filter(function (b) { return feat.slice(0, 4).indexOf(b) < 0; });
      var featAudio = audio.filter(function (m) { return m.is_featured; }).slice(0, 4);
      var msgs = video.map(function (m) { return messageCard(m, 'video'); }).concat(featAudio.map(function (m) { return messageCard(m, 'audio'); })).slice(0, 4);
      var h = radioSection(audio.slice(0, 3));
      h += '<section class="section on-ivory" aria-labelledby="msg-h"><div class="wrap"><div class="msg-head"><h2 id="msg-h">Featured messages</h2><a class="btn btn-navy btn-sm" href="messages.html">Browse all messages</a></div>' +
        (msgs.length ? '<div class="cards">' + msgs.join('') + '</div>' : '<p class="empty">New messages are being added. Please check back soon.</p>') + '</div></section>';
      if (lead) {
        h += '<section class="section" aria-labelledby="books-h"><div class="wrap"><h2 id="books-h" style="margin-bottom:56px">Books by Apostle Israel</h2><article class="book-lead">' +
          (lead.cover_url ? '<img class="cover" src="' + esc(img(lead.cover_url)) + '" alt="Book cover: ' + esc(lead.title) + '" loading="lazy" width="560" height="840">' : '') +
          '<div><h3>' + esc(lead.title) + '</h3><p>' + esc(lead.full_description || lead.short_description || '') + '</p>' + ((lead.format || lead.price_display) ? '<p class="fmt">' + esc([lead.format, lead.price_display].filter(Boolean).join(', ')) + '</p>' : '') + bookBuy(lead) + '</div></article>';
        if (shelf.length) h += '<div class="shelf" role="list">' + shelf.map(function (b) { return '<article role="listitem">' + (b.cover_url ? '<img src="' + esc(img(b.cover_url)) + '" alt="Book cover: ' + esc(b.title) + '" loading="lazy" width="420" height="630">' : '') + '<h3>' + esc(b.title) + '</h3><p>' + esc(b.short_description || '') + '</p>' + (b.status === 'published' && b.selar_url ? '<a class="btn btn-navy btn-sm" href="' + esc(b.selar_url) + '" target="_blank" rel="noopener">Buy now</a>' : '') + '</article>'; }).join('') + '</div>';
        var sp = others.filter(function (b) { return b.selar_url && b.cover_url; });
        if (sp.length) h += '<div class="more"><p>More titles, each on Selar</p><div class="spines">' + sp.map(function (b) { return '<a href="' + esc(b.selar_url) + '" target="_blank" rel="noopener" aria-label="' + esc(b.title) + '"><img src="' + esc(img(b.cover_url)) + '" alt="' + esc(b.title) + '" loading="lazy" width="240" height="360"></a>'; }).join('') + '</div></div>';
        h += '<div class="books-foot"><a class="btn btn-navy" href="books.html">View all books</a></div></div></section>';
      }
      h += liveSection(bc);
      if (photos.length) h += '<section class="section on-ivory" aria-labelledby="media-h"><div class="wrap"><div class="msg-head"><h2 id="media-h">Media and appearances</h2><a class="btn btn-navy btn-sm" href="media.html">Open gallery</a></div>' + galleryHtml(photos) + '</div></section>';
      h += newsletterSection();
      $('#dynamic').innerHTML = h; bindNewsletter(); LIVE = bc.live; applyLive();
      if (LIVE) { $('#hero-live').classList.remove('hidden'); }
    });
  };
  function liveSection(bc) {
    var s = bc.live;
    var frame = s ? ytPlayer(s) : '<div class="live-frame"><span class="chip"><span class="dot"></span>Offline</span><div><p class="state">No broadcast is live right now</p><p class="sub">The player appears here when a broadcast begins.</p></div></div>';
    var copy = s ? '<p style="margin-top:16px"><span class="live-badge"><span class="dot"></span>LIVE</span></p><p class="lede" style="margin-top:12px">' + esc(s.title) + '</p>' : '<p class="lede">Join live ministrations and broadcasts directly on this website, on any phone or computer.</p>';
    var when = s ? '' : '<p class="when">' + (bc.next ? 'Next broadcast: ' + esc(bc.next.title) + ', ' + esc(fmtDate(bc.next.scheduled_at, true)) + '.' : bc.rec[0] ? 'Latest recording: ' + esc(bc.rec[0].title) + '.' : 'Next broadcast: none scheduled yet.') + '</p>';
    return '<section class="section on-navy' + (s ? ' is-live' : '') + '" id="live" aria-labelledby="live-h"><div class="wrap live-grid">' + frame + '<div class="live-copy"><h2 id="live-h">Watch live from anywhere</h2>' + copy + when + '<div class="row-actions" style="gap:12px"><a class="btn btn-gold" href="watch-live.html">' + (s ? 'Open full page' : 'Go to Watch Live') + '</a></div></div></div></section>';
  }

  PAGES.about = function () {
    return Promise.all([rows('bio_content'), rows('gallery_images', function (q) { return q.eq('category', 'publicity').order('sort_order'); })]).then(function (r) {
      var bio = {}; r[0].forEach(function (b) { bio[b.section] = [b.heading, b.body]; });
      var get = function (k) { return bio[k] || FALLBACK_BIO[k]; };
      if (SET.about_image || SET.hero_image) $('#about-img').src = SET.about_image || SET.hero_image;
      var full = ['full_bio', 'journey', 'calling', 'vision', 'preaching', 'authoring', 'speaking'].map(function (k) { var b = get(k); return b ? '<div style="margin-bottom:36px"><h2 style="font-size:1.8rem;margin-bottom:12px">' + esc(b[0]) + '</h2><p>' + esc(b[1]) + '</p></div>' : ''; }).join('');
      var short = get('short_bio');
      var show = function (v) {
        $('#bio-body').innerHTML = v === 'short' ? '<div class="prose"><h2 style="margin-bottom:18px">' + esc(short[0]) + '</h2><p>' + esc(short[1]) + '</p><p class="note">Event organisers may use this version in flyers, programmes and promotional material.</p></div>' : '<div class="prose">' + full + '</div>';
        $$('.tab').forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-v') === v); });
      };
      $$('.tab').forEach(function (t) { t.addEventListener('click', function () { show(t.getAttribute('data-v')); }); }); show('full');
      var acts = ''; if (SET.bio_pdf_url) acts += '<a class="btn btn-gold" href="' + esc(SET.bio_pdf_url) + '" download target="_blank" rel="noopener">Download biography</a>';
      if (SET.speaker_profile_pdf_url) acts += '<a class="btn btn-navy" href="' + esc(SET.speaker_profile_pdf_url) + '" download target="_blank" rel="noopener">Download speaker profile</a>';
      $('#bio-actions').insertAdjacentHTML('afterbegin', acts);
      var ar = get('speaking_areas'); $('#areas').innerHTML = ar ? '<div class="wrap"><h2>' + esc(ar[0]) + '</h2><p class="lede" style="margin-top:16px">' + esc(ar[1]) + '</p></div>' : '';
      if (r[1].length) $('#publicity').innerHTML = '<div class="wrap"><h2>Publicity photographs</h2><p class="lede" style="margin:16px 0 32px">Approved photographs for programmes, flyers and promotional material.</p><div class="cards">' + r[1].map(function (p) { return '<figure><img src="' + esc(img(p.image_url)) + '" alt="' + esc(p.alt_text || 'Apostle Oluwaseun Israel') + '" loading="lazy"><a class="link-btn" href="' + esc(img(p.image_url)) + '" download target="_blank" rel="noopener">Download</a></figure>'; }).join('') + '</div></div>';
    });
  };

  var TYPES = ['Church convention', 'Annual conference', 'Revival meeting', 'Prophetic meeting', 'Leadership seminar', "Ministers' conference", 'Youth conference', 'Special church service', 'Corporate or organisational event', 'Online programme', 'Other'];
  var COUNTRIES = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Cameroon', 'Zambia', 'Zimbabwe', 'Rwanda', 'Benin', 'Togo', 'Sierra Leone', 'Liberia', 'Ethiopia', 'Egypt', 'United Kingdom', 'Ireland', 'Germany', 'France', 'Netherlands', 'Italy', 'Spain', 'Portugal', 'Sweden', 'Norway', 'Switzerland', 'United States', 'Canada', 'Jamaica', 'Trinidad and Tobago', 'Brazil', 'United Arab Emirates', 'Saudi Arabia', 'Qatar', 'India', 'Singapore', 'Malaysia', 'Philippines', 'Australia', 'New Zealand'];
  function fld(k, label, o) {
    o = o || {}; var req = o.req !== false, t = o.type || 'text', inner;
    if (o.select) inner = '<select id="f-' + k + '" name="' + k + '"><option value="">Select</option>' + o.select.map(function (x) { var v = Array.isArray(x) ? x[0] : x, l = Array.isArray(x) ? x[1] : x; return '<option value="' + esc(v) + '">' + esc(l) + '</option>'; }).join('') + '</select>';
    else if (o.area) inner = '<textarea id="f-' + k + '" name="' + k + '" maxlength="4000"></textarea>';
    else inner = '<input id="f-' + k + '" name="' + k + '" type="' + t + '"' + (o.list ? ' list="' + o.list + '"' : '') + (t === 'date' ? ' min="' + new Date().toISOString().slice(0, 10) + '"' : '') + (o.ac ? ' autocomplete="' + o.ac + '"' : '') + '>';
    return '<div class="field"><label for="f-' + k + '">' + label + (req ? '<span class="req"> *</span>' : '') + '</label>' + inner + (o.hint ? '<p class="hint">' + o.hint + '</p>' : '') + '<p class="err" id="e-' + k + '"></p></div>';
  }
  PAGES.invite = function () {
    var today = new Date().toISOString().slice(0, 10);
    $('#invite-form').innerHTML = '<p class="note" style="margin-top:0">Fields marked * are required.</p><div id="form-err"></div>' +
      '<div class="fgrid two">' + fld('full_name', 'Full name of inviting person', { ac: 'name' }) + fld('organisation', 'Church or organisation') + fld('email', 'Official email address', { type: 'email', ac: 'email' }) + fld('phone', 'WhatsApp or telephone number', { type: 'tel', ac: 'tel', hint: 'Include the country code, for example +234.' }) +
      fld('country', 'Country', { list: 'countries', ac: 'country-name' }) + fld('city', 'State or city') + '</div><datalist id="countries">' + COUNTRIES.map(function (c) { return '<option value="' + c + '">'; }).join('') + '</datalist>' +
      '<div class="fgrid two">' + fld('programme_title', 'Programme title') + fld('programme_theme', 'Programme theme', { req: false }) + fld('engagement_type', 'Type of engagement', { select: TYPES }) +
      fld('scope', 'Engagement scope', { select: [['local', 'Local engagement'], ['national', 'National engagement'], ['international', 'International engagement'], ['virtual', 'Virtual engagement']] }) +
      fld('proposed_date', 'Proposed date', { type: 'date' }) + fld('alternative_date', 'Alternative date', { type: 'date', req: false }) + fld('venue', 'Venue or event location') + fld('audience_size', 'Expected audience size', { req: false }) +
      fld('attendance_mode', 'Physical or virtual', { select: [['physical', 'Physical'], ['virtual', 'Virtual'], ['hybrid', 'Physical and virtual']] }) + fld('duration', 'Expected duration of ministration', { req: false, hint: 'For example, 45 minutes or three sessions.' }) + '</div>' +
      fld('details', 'Additional invitation details', { req: false, area: 1 }) +
      '<input class="hp" type="text" name="website" id="hp" tabindex="-1" autocomplete="off" aria-hidden="true"><div id="ts-form"></div><div><button class="btn btn-gold" type="submit" id="send-btn">Submit invitation</button></div>';
    mountTurnstile('#ts-form');
    var REQ = ['full_name', 'organisation', 'email', 'phone', 'country', 'city', 'programme_title', 'engagement_type', 'proposed_date', 'venue', 'attendance_mode', 'scope'], busy = false;
    $('#invite-form').addEventListener('submit', function (ev) {
      ev.preventDefault(); if (busy) return;
      var v = {}; $$('#invite-form [name]').forEach(function (el) { v[el.name] = el.value.trim(); });
      var errs = {}; REQ.forEach(function (k) { if (!v[k]) errs[k] = 'This field is required.'; });
      if (v.email && !validEmail(v.email)) errs.email = 'Enter a valid email address.';
      if (v.phone && v.phone.replace(/\D/g, '').length < 7) errs.phone = 'Enter a valid phone or WhatsApp number.';
      if (v.proposed_date && v.proposed_date < today) errs.proposed_date = 'Choose a date in the future.';
      if (v.alternative_date && v.alternative_date < today) errs.alternative_date = 'Choose a date in the future.';
      $$('#invite-form .err').forEach(function (e) { e.textContent = ''; });
      var keys = Object.keys(errs); keys.forEach(function (k) { $('#e-' + k).textContent = errs[k]; });
      if (keys.length) { $('#f-' + keys[0]).focus(); return; }
      busy = true; $('#send-btn').disabled = true; $('#send-btn').textContent = 'Sending invitation'; $('#form-err').innerHTML = '';
      v.type = 'invitation'; v.website = $('#hp').value;
      submitForm(v).then(function (r) {
        busy = false;
        if (r.ok) { window.scrollTo(0, 0); $('#invite-wrap').innerHTML = '<div class="success" role="status"><h2>Invitation received</h2><p>Thank you for submitting your invitation to Apostle Oluwaseun Israel. Your request has been successfully received. Our office will review the details and contact you through the information provided.</p><span class="ref">Reference: ' + esc(r.reference || '') + '</span><p class="note">Please keep this reference number for any follow-up.</p></div>'; }
        else { $('#send-btn').disabled = false; $('#send-btn').textContent = 'Submit invitation'; $('#form-err').innerHTML = '<p class="alert bad" role="alert">' + esc(r.error || 'Something went wrong. Please try again.') + '</p>'; }
      });
    });
    return Promise.resolve();
  };

  PAGES.watch = function () {
    return Promise.all([rows('broadcasts', function (q) { return q.order('scheduled_at', { ascending: false }).limit(50); }), rows('audio_messages', function (q) { return q.order('published_on', { ascending: false }).limit(3); })]).then(function (r) {
      var bc = pickBroadcasts(r[0]); LIVE = bc.live; applyLive();
      $('#radio-slot').innerHTML = radioSection(r[1]);
      var main = bc.live, h = '';
      var show = function (b, auto) { return ytPlayer(b, auto) + '<div style="margin-top:24px">' + (b.status === 'live' ? '<span class="live-badge"><span class="dot"></span>LIVE</span>' : '') + '<h2 style="margin-top:12px;font-size:2rem">' + esc(b.title) + '</h2>' + (b.description ? '<p class="lede" style="margin-top:10px">' + esc(b.description) + '</p>' : '') + '<div class="row-actions"><button class="btn btn-navy btn-sm" data-share="' + esc(b.title) + '" data-page="watch-live.html">Share</button></div></div>'; };
      if (main) h = show(main, true); else h = '<div class="alert"><strong>No broadcast is live right now.</strong> ' + (bc.next ? 'Next broadcast: ' + esc(bc.next.title) + ', ' + esc(fmtDate(bc.next.scheduled_at, true)) + '.' : 'No broadcast is scheduled yet.') + (bc.next && bc.next.description ? '<p style="margin-top:8px">' + esc(bc.next.description) + '</p>' : '') + '</div>';
      if (main && bc.next) h += '<p class="alert" style="margin-top:24px">Next scheduled: ' + esc(bc.next.title) + ', ' + esc(fmtDate(bc.next.scheduled_at, true)) + '.</p>';
      $('#video-slot').innerHTML = h;
      if (bc.rec.length) {
        $('#recordings').innerHTML = '<div class="wrap"><h2 style="margin-bottom:32px">Previous broadcasts</h2><div class="cards">' + bc.rec.map(function (b) { var id = ytId(b.youtube_url); return '<article class="mcard"><div class="thumbwrap"' + (id ? ' data-vid="' + id + '" data-title="' + esc(b.title) + '"' : '') + '>' + (id ? '<img src="https://img.youtube.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy"><button class="play" aria-label="Watch ' + esc(b.title) + '" data-play style="position:relative">' + playIcon() + '</button>' : '') + '</div><h3>' + esc(b.title) + '</h3><p class="meta">' + esc(fmtDate(b.scheduled_at)) + '</p></article>'; }).join('') + '</div></div>';
        $('#recordings').className = 'section on-ivory';
        setJsonLd('ld-videos', { '@context': 'https://schema.org', '@graph': bc.rec.slice(0, 10).filter(function (b) { return ytId(b.youtube_url); }).map(function (b) { return { '@type': 'VideoObject', name: b.title, description: b.description || b.title, uploadDate: b.scheduled_at || undefined, embedUrl: 'https://www.youtube.com/embed/' + ytId(b.youtube_url), thumbnailUrl: 'https://img.youtube.com/vi/' + ytId(b.youtube_url) + '/hqdefault.jpg' }; }) });
      }
    });
  };

  PAGES.messages = function () {
    return Promise.all([rows('audio_messages', function (q) { return q.order('published_on', { ascending: false }); }), rows('video_messages', function (q) { return q.order('published_on', { ascending: false }); })]).then(function (r) {
      var all = r[1].map(function (m) { return [m, 'video']; }).concat(r[0].map(function (m) { return [m, 'audio']; })), tab = 'all';
      var CATS = ['Faith', 'Purpose', 'Destiny', 'Spiritual Growth', 'Deliverance', 'Wisdom', 'Leadership', 'Life Transformation'];
      $('#cat').innerHTML = '<option value="">All categories</option>' + CATS.map(function (c) { return '<option>' + c + '</option>'; }).join('');
      var draw = function () {
        var q = $('#q').value.toLowerCase(), cat = $('#cat').value;
        var list = all.filter(function (x) { return (tab === 'all' || tab === x[1]) && (!cat || x[0].category === cat) && (!q || x[0].title.toLowerCase().indexOf(q) > -1); }).sort(function (a, b) { return (b[0].is_featured ? 1 : 0) - (a[0].is_featured ? 1 : 0) || new Date(b[0].published_on || 0) - new Date(a[0].published_on || 0); });
        $('#list').innerHTML = list.length ? '<div class="cards">' + list.map(function (x) { return messageCard(x[0], x[1]); }).join('') + '</div>' : '<p class="empty">' + (all.length ? 'No messages match your search.' : 'New messages are being added. Please check back soon.') + '</p>';
      };
      $('#q').addEventListener('input', draw); $('#cat').addEventListener('change', draw);
      $$('.tab').forEach(function (t) { t.addEventListener('click', function () { tab = t.getAttribute('data-v'); $$('.tab').forEach(function (x) { x.setAttribute('aria-pressed', x === t); }); draw(); }); });
      draw();
      var vids = r[1].filter(function (m) { return ytId(m.youtube_url); }).slice(0, 10);
      if (vids.length) setJsonLd('ld-messages', { '@context': 'https://schema.org', '@graph': vids.map(function (m) { return { '@type': 'VideoObject', name: m.title, description: m.description || m.title, uploadDate: m.published_on || undefined, embedUrl: 'https://www.youtube.com/embed/' + ytId(m.youtube_url), thumbnailUrl: m.cover_url ? img(m.cover_url) : 'https://img.youtube.com/vi/' + ytId(m.youtube_url) + '/hqdefault.jpg' }; }) });
    });
  };

  PAGES.books = function () {
    return Promise.all([rows('books', function (q) { return q.order('sort_order'); }), rows('resources', function (q) { return q.order('sort_order'); })]).then(function (r) {
      var books = r[0].length ? r[0].filter(function (b) { return b.status !== 'hidden'; }) : FALLBACK_BOOKS;
      var cats = []; books.forEach(function (b) { if (b.category && cats.indexOf(b.category) < 0) cats.push(b.category); });
      var draw = function () {
        var c = $('#cat') ? $('#cat').value : '', list = books.filter(function (b) { return !c || b.category === c; });
        $('#list').innerHTML = list.length ? list.map(function (b) {
          return '<article class="bk">' + (b.cover_url ? '<img src="' + esc(img(b.cover_url)) + '" alt="Book cover: ' + esc(b.title) + '" loading="lazy">' : '<div></div>') + '<div><h3>' + esc(b.title) + '</h3><p class="meta" style="margin-top:0">' + esc([b.author || 'Apostle Oluwaseun Israel', b.format, b.price_display].filter(Boolean).join(', ')) + '</p>' +
            (b.short_description ? '<p style="margin-top:12px;font-weight:500">' + esc(b.short_description) + '</p>' : '') + (b.full_description ? '<p style="margin-top:10px;color:var(--ink-soft);max-width:60ch">' + esc(b.full_description) + '</p>' : '') +
            '<div class="row-actions" style="align-items:center;margin-top:22px">' + bookBuy(b) + '<button class="link-btn" data-share="' + esc(b.title) + '" data-page="books.html">Share</button></div></div></article>';
        }).join('') : '<p class="empty">Books are being added. Please check back soon.</p>';
      };
      if (cats.length) { $('#filters').innerHTML = '<div class="toolbar"><select id="cat" aria-label="Filter by category"><option value="">All categories</option>' + cats.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('') + '</select></div>'; $('#cat').addEventListener('change', draw); }
      draw();
      setJsonLd('ld-books', { '@context': 'https://schema.org', '@graph': books.filter(function (b) { return b.status === 'published'; }).map(function (b) { return { '@type': 'Book', name: b.title, author: { '@type': 'Person', name: 'Oluwaseun Israel' }, description: b.short_description || b.full_description || undefined, image: b.cover_url ? (/^http/.test(b.cover_url) ? b.cover_url : SITE + '/' + img(b.cover_url)) : undefined, url: b.selar_url || undefined }; }) });
      if (r[1].length) $('#resources').innerHTML = '<div class="wrap"><h2 style="margin-bottom:32px">Additional resources</h2><div class="cards">' + r[1].map(function (x) { return '<article class="mcard">' + (x.image_url ? '<div class="thumbwrap"><img src="' + esc(img(x.image_url)) + '" alt="" loading="lazy"></div>' : '') + '<h3>' + esc(x.title) + '</h3>' + (x.resource_type ? '<span class="cat">' + esc(x.resource_type) + '</span>' : '') + (x.description ? '<p style="margin-top:6px">' + esc(x.description) + '</p>' : '') + '<div class="row-actions">' + (x.status === 'published' && x.link_url ? '<a class="btn btn-navy btn-sm" href="' + esc(x.link_url) + '" target="_blank" rel="noopener">Open</a>' : '<span style="padding:8px 14px;border:1px dashed var(--navy);font-size:.85rem">Coming soon</span>') + '</div></article>'; }).join('') + '</div></div>';
      else $('#resources').className = 'hidden';
    });
  };

  PAGES.media = function () {
    return Promise.all([rows('gallery_images', function (q) { return q.neq('category', 'publicity').order('sort_order'); }), rows('speaking_engagements', function (q) { return q.order('event_date', { ascending: false }); })]).then(function (r) {
      $('#gallery').innerHTML = r[0].length ? galleryHtml(r[0]) : '<p class="empty">Photographs are being added. Please check back soon.</p>';
      if (r[1].length) $('#engagements').innerHTML = '<div class="wrap"><h2 style="margin-bottom:32px">Selected speaking engagements</h2><ul class="eng-arch">' + r[1].map(function (e) { return '<li><h3>' + esc(e.title) + '</h3><p class="meta">' + esc([e.host, e.location, fmtDate(e.event_date)].filter(Boolean).join(', ')) + '</p>' + (e.description ? '<p style="margin-top:6px">' + esc(e.description) + '</p>' : '') + '</li>'; }).join('') + '</ul></div>';
      else $('#engagements').className = 'hidden';
    });
  };

  PAGES.contact = function () {
    $('#c-email').innerHTML = '<a href="mailto:' + esc(SET.contact_email) + '">' + esc(SET.contact_email) + '</a>';
    $('#c-wa').href = 'https://wa.me/' + SET.whatsapp;
    mountTurnstile('#ts-contact');
    var busy = false;
    $('#contact-form').addEventListener('submit', function (ev) {
      ev.preventDefault(); if (busy) return;
      var v = { type: 'enquiry', full_name: $('#c-name').value.trim(), email: $('#c-mail').value.trim(), phone: $('#c-phone').value.trim(), subject: $('#c-subject').value.trim(), message: $('#c-msg').value.trim(), website: $('#hp').value };
      var e = {}; if (!v.full_name) e.name = 'Enter your name.'; if (!validEmail(v.email)) e.mail = 'Enter a valid email address.'; if (!v.subject) e.subject = 'Enter a subject.'; if (v.message.length < 5) e.msg = 'Write your message.';
      ['name', 'mail', 'subject', 'msg'].forEach(function (k) { $('#ce-' + k).textContent = e[k] || ''; });
      if (Object.keys(e).length) return;
      busy = true; $('#c-btn').disabled = true; $('#c-btn').textContent = 'Sending';
      submitForm(v).then(function (r) {
        busy = false;
        if (r.ok) $('#contact-wrap').innerHTML = '<div class="success" role="status"><h2>Message sent</h2><p>Thank you. Your message has been received and our office will reply through the details you provided.</p></div>';
        else { $('#c-btn').disabled = false; $('#c-btn').textContent = 'Send message'; $('#c-err').innerHTML = '<p class="alert bad" role="alert">' + esc(r.error || 'Something went wrong. Please try again.') + '</p>'; }
      });
    });
    return Promise.resolve();
  };

  PAGES.legal = function () {
    var key = document.body.getAttribute('data-section');
    return rows('bio_content', function (q) { return q.eq('section', key); }).then(function (r) {
      var f = FALLBACK_BIO[key], h = r[0] ? r[0].heading : f[0], b = r[0] ? r[0].body : f[1];
      $('#legal-title').textContent = h; $('#legal-body').textContent = b;
    });
  };

  /* ---------- Start ---------- */
  renderChrome();
  var settingsP = sb ? sb.from('site_settings').select('key,value').then(function (r) { (r.data || []).forEach(function (x) { if (x.value) SET[x.key] = x.value; }); }, function () {}) : Promise.resolve();
  settingsP.then(function () {
    renderFooter();
    var run = PAGES[page];
    return run ? run() : null;
  }).then(function () {
    if (page !== 'home' && page !== 'watch' && sb) return sb.from('broadcasts').select('id').eq('status', 'live').eq('is_published', true).limit(1).then(function (r) { LIVE = (r.data && r.data[0]) || null; applyLive(); });
  });
})();
