/* BP Log — a tiny blood-pressure diary. All data stays on this device (localStorage). */
(function () {
  'use strict';

  // ---------------------------------------------------------------- storage
  const STORE_KEY = 'bp-log-v1';

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE_KEY));
      if (d && Array.isArray(d.users) && Array.isArray(d.readings)) return d;
    } catch (e) { /* ignore */ }
    return { users: [], readings: [], lang: 'en' };
  }
  const db = load();

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      alert('Could not save on this device. / Хадгалж чадсангүй.');
      return false;
    }
  }

  // Ask iOS/Safari to keep our data (no-op where unsupported).
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { /* ignore */ }

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ---------------------------------------------------------------- i18n
  const T = {
    en: {
      users: 'Users', userCreation: 'User creation', username: 'Username', age: 'Age', gender: 'Gender',
      male: 'Male', female: 'Female', choose: '—', create: 'Create', back: 'Back',
      noUsers: 'No users yet. Tap “User creation” to add one.',
      since: 'since', logResults: 'Log in<br>blood pressure<br>results', calendarView: 'Calendar view',
      backToSwitch: 'Back to user-switch',
      sys: 'SYS', sysDesc: 'Systolic · mm Hg', dia: 'DIA', diaDesc: 'Diastolic · mm Hg',
      pulse: 'Pulse', pulseDesc: 'Optional · bpm',
      logIt: 'Log it', chart: 'Chart', areYouSure: 'Are you sure?', yes: 'Yes', no: 'No',
      saved: 'Saved', userCreated: 'User created',
      filterByDate: 'Filter by date', record: 'Record', recordSubmission: 'Record submission',
      noRecords: 'No records yet.', noRecordsDay: 'No records on this day.', noRecordsRange: 'No records in this date range.',
      from: 'From', to: 'To', apply: 'Apply', clear: 'Clear', cancel: 'Cancel', goToDate: 'Go to date', go: 'Go',
      showing: 'Showing', saveChanges: 'Save changes', del: 'Delete', deleteRecord: 'Delete this record?',
      pdfSoon: 'PDF export is coming soon',
      errName: 'Please enter a username.', errNums: 'Please enter SYS and DIA numbers.',
      errRange: 'Those numbers look wrong. Please check them.', errOrder: 'SYS should be higher than DIA.',
      errPulse: 'Pulse looks wrong. Leave it empty or check it.',
      last7: '7 days', last30: '30 days', all: 'All', chartEmpty: 'Log a few readings to see the chart.',
      nav: { back: 'Back', calendar: 'Calendar', database: 'All records', pdf: 'PDF (coming soon)', chart: 'Chart', lang: 'Switch language' },
      cat: { low: 'Low', normal: 'Normal', elevated: 'Elevated', high: 'High', veryhigh: 'Very high' },
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      wd: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    mn: {
      users: 'Хэрэглэгчид', userCreation: 'Хэрэглэгч нэмэх', username: 'Нэр', age: 'Нас', gender: 'Хүйс',
      male: 'Эрэгтэй', female: 'Эмэгтэй', choose: '—', create: 'Үүсгэх', back: 'Буцах',
      noUsers: 'Хэрэглэгч алга. “Хэрэглэгч нэмэх” дээр дарна уу.',
      since: 'бүртгүүлсэн', logResults: 'Даралтын<br>хэмжилт<br>бүртгэх', calendarView: 'Хуанли',
      backToSwitch: 'Хэрэглэгч солих',
      sys: 'SYS', sysDesc: 'Дээд даралт · mm Hg', dia: 'DIA', diaDesc: 'Доод даралт · mm Hg',
      pulse: 'Пульс', pulseDesc: 'Заавал биш · цохилт/мин',
      logIt: 'Бүртгэх', chart: 'График', areYouSure: 'Итгэлтэй байна уу?', yes: 'Тийм', no: 'Үгүй',
      saved: 'Хадгалагдлаа', userCreated: 'Хэрэглэгч нэмэгдлээ',
      filterByDate: 'Огноогоор шүүх', record: 'Бичлэг', recordSubmission: 'Бүртгэлүүд',
      noRecords: 'Бүртгэл алга байна.', noRecordsDay: 'Энэ өдөр бүртгэл алга.', noRecordsRange: 'Энэ хугацаанд бүртгэл алга.',
      from: 'Эхлэх', to: 'Дуусах', apply: 'Шүүх', clear: 'Цэвэрлэх', cancel: 'Болих', goToDate: 'Огноо сонгох', go: 'Очих',
      showing: 'Харуулж буй', saveChanges: 'Хадгалах', del: 'Устгах', deleteRecord: 'Энэ бичлэгийг устгах уу?',
      pdfSoon: 'PDF удахгүй нэмэгдэнэ',
      errName: 'Нэрээ оруулна уу.', errNums: 'SYS болон DIA тоог оруулна уу.',
      errRange: 'Тоо буруу байх шиг байна. Шалгана уу.', errOrder: 'SYS нь DIA-аас их байх ёстой.',
      errPulse: 'Пульс буруу байна. Хоосон үлдээх эсвэл шалгана уу.',
      last7: '7 хоног', last30: '30 хоног', all: 'Бүгд', chartEmpty: 'График харахын тулд хэдэн хэмжилт бүртгэнэ үү.',
      nav: { back: 'Буцах', calendar: 'Хуанли', database: 'Бүх бүртгэл', pdf: 'PDF (удахгүй)', chart: 'График', lang: 'Хэл солих' },
      cat: { low: 'Бага', normal: 'Хэвийн', elevated: 'Бага зэрэг өндөр', high: 'Өндөр', veryhigh: 'Маш өндөр' },
      months: ['1-р сар', '2-р сар', '3-р сар', '4-р сар', '5-р сар', '6-р сар', '7-р сар', '8-р сар', '9-р сар', '10-р сар', '11-р сар', '12-р сар'],
      wd: ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'],
      wdFull: ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба', 'Ням'],
    },
  };
  const L = () => T[db.lang] || T.en;

  // ---------------------------------------------------------------- helpers
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const dkey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
  const mnWeekday = (d) => T.mn.wdFull[(d.getDay() + 6) % 7];

  function fmtDate(d, withWeekday) {
    if (db.lang === 'mn') {
      const s = `${d.getFullYear()} оны ${d.getMonth() + 1}-р сарын ${d.getDate()}`;
      return withWeekday ? `${s}, ${mnWeekday(d)}` : s;
    }
    return d.toLocaleDateString('en-US', withWeekday
      ? { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
      : { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtTime(d) {
    if (db.lang === 'mn') return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  function fmtDateTime(d) {
    if (db.lang === 'mn') return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${fmtTime(d)}`;
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · ${fmtTime(d)}`;
  }

  // Blood-pressure category (thresholds based on AHA categories).
  const CAT_ORDER = ['normal', 'low', 'elevated', 'high', 'veryhigh'];
  function category(sys, dia) {
    if (sys >= 140 || dia >= 90) return 'veryhigh';
    if (sys >= 130 || dia >= 80) return 'high';
    if (sys < 90 || dia < 60) return 'low';
    if (sys >= 120) return 'elevated';
    return 'normal';
  }

  const CAT_COLOR = { low: '#2F74D0', normal: '#2E9A57', elevated: '#C9A000', high: '#E57A12', veryhigh: '#D23434' };

  const getUser = (id) => db.users.find((u) => u.id === id);
  // Readings for a user, oldest first, each with its submission number N.
  function readingsOf(userId) {
    return db.readings
      .filter((r) => r.userId === userId)
      .sort((a, b) => a.at.localeCompare(b.at))
      .map((r, i) => Object.assign({}, r, { n: i + 1 }));
  }

  // ---------------------------------------------------------------- icons
  const I = {
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 5 5v6"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/><circle cx="8" cy="13" r=".6" fill="currentColor"/><circle cx="12" cy="13" r=".6" fill="currentColor"/><circle cx="16" cy="13" r=".6" fill="currentColor"/><circle cx="8" cy="17" r=".6" fill="currentColor"/><circle cx="12" cy="17" r=".6" fill="currentColor"/><circle cx="16" cy="17" r=".6" fill="currentColor"/></svg>',
    database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>',
    pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M3 7v14h14"/><rect x="7" y="3" width="14" height="14" rx="1"/><text x="14" y="12.5" font-size="5.5" font-family="Arial" font-weight="700" text-anchor="middle" fill="currentColor" stroke="none">PDF</text></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 21V14M9 21V10M14 21V13M19 21V6"/><path d="M3 11l5-5 5 4 8-7" stroke-width="1.5"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    tri: '<svg class="tri" viewBox="0 0 30 14" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M1 1h28L15 13z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>',
  };

  // ---------------------------------------------------------------- navigation
  const app = document.getElementById('app');
  let stack = [{ name: 'home', p: {} }];
  const ui = { usersOpen: true };

  function go(name, p) { stack.push({ name, p: p || {} }); render(true); }
  function replace(name, p) { stack[stack.length - 1] = { name, p: p || {} }; render(true); }
  function back() { if (stack.length > 1) stack.pop(); render(true); }
  function home() { stack = [{ name: 'home', p: {} }]; render(true); }
  const cur = () => stack[stack.length - 1];

  function render(scrollTop) {
    const c = cur();
    const view = (Screens[c.name] || Screens.home)(c.p);
    app.className = view.nav ? 'has-nav' : '';
    app.innerHTML = view.html + (view.nav ? navBar(view.nav) : '');
    document.documentElement.lang = db.lang;
    document.title = 'BP Log';
    bindCommon(view.nav);
    if (view.mount) view.mount();
    if (scrollTop) window.scrollTo(0, 0);
  }

  const $ = (sel) => app.querySelector(sel);
  const $$ = (sel) => Array.from(app.querySelectorAll(sel));
  const on = (sel, fn) => $$(sel).forEach((el) => el.addEventListener('click', fn));

  // ---------------------------------------------------------------- shared UI
  const datePill = () => `<header class="date-pill">${esc(fmtDate(new Date(), true))}</header>`;

  function langToggle() {
    return `<button class="lang ${db.lang}" data-lang aria-label="${L().nav.lang}">
      <span class="${db.lang === 'en' ? 'on' : 'offtxt'}">EN</span>
      <span class="track"><span class="knob"></span></span>
      <span class="${db.lang === 'mn' ? 'on' : 'offtxt'}">MN</span></button>`;
  }

  function navBar(nav) {
    const n = L().nav;
    const b = (key, icon, label, extra) =>
      `<button class="ico ${nav.active === key ? 'active' : ''} ${extra || ''}" data-navbtn="${key}" aria-label="${label}">${icon}</button>`;
    return `<nav class="bottom-nav"><div class="bar">
      ${b('back', I.back, n.back)}
      ${b('calendar', I.calendar, n.calendar)}
      ${b('database', I.database, n.database)}
      ${b('pdf', I.pdf, n.pdf, 'off')}
      ${b('chart', I.chart, n.chart)}
      <span class="divider"></span>
      ${langToggle()}
    </div></nav>`;
  }

  function bindCommon(nav) {
    on('[data-lang]', () => { db.lang = db.lang === 'en' ? 'mn' : 'en'; save(); render(false); });
    if (!nav) return;
    const target = { calendar: 'calendar', database: 'database', chart: 'chart' };
    on('[data-navbtn]', (e) => {
      const key = e.currentTarget.dataset.navbtn;
      if (key === 'back') return back();
      if (key === 'pdf') return toast(L().pdfSoon);
      if (cur().name === target[key]) return;
      go(target[key], { uid: nav.uid });
    });
  }

  function recordRow(r) {
    const c = category(r.sys, r.dia);
    const d = new Date(r.at);
    return `<button class="rec cat-${c}" data-rid="${r.id}">
      <div class="top"><span class="n">${L().record} ${r.n}</span><span>${esc(fmtDateTime(d))}</span></div>
      <div class="bot">
        <span>SYS: <span class="val">${r.sys}</span></span>
        <span>DIA: <span class="val">${r.dia}</span></span>
        ${r.pulse ? `<span>♥ ${r.pulse}</span>` : ''}
        <span class="tag">${L().cat[c]}</span>
      </div></button>`;
  }

  const legend = () => `<div class="legend">${['low', 'normal', 'elevated', 'high', 'veryhigh']
    .map((c) => `<span class="cat-${c}"><i></i>${L().cat[c]}</span>`).join('')}</div>`;

  // ---------------------------------------------------------------- overlays
  function overlay(html, onMount, dismissable) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const el = document.createElement('div');
    el.className = 'overlay';
    el.innerHTML = html;
    document.body.appendChild(el);
    const close = () => el.remove();
    if (dismissable) el.addEventListener('click', (e) => { if (e.target === el) close(); });
    if (onMount) onMount(el, close);
    return close;
  }

  function confirmBox({ title, big, cat, sub, yes, no }) {
    return new Promise((resolve) => {
      overlay(`<div class="modal ${cat ? 'cat-' + cat : ''}" role="dialog" aria-modal="true">
          <h2>${title}</h2>
          ${big ? `<div class="big">${big}</div>` : ''}
          ${sub ? `<div class="sub">${sub}</div>` : ''}
          <button class="btn accent" data-yes>${yes || L().yes}</button>
          <button class="btn" data-no>${no || L().no}</button>
        </div>`, (el, close) => {
        el.querySelector('[data-yes]').addEventListener('click', () => { close(); resolve(true); });
        el.querySelector('[data-no]').addEventListener('click', () => { close(); resolve(false); });
      });
    });
  }

  function success(msg, cat) {
    return new Promise((resolve) => {
      const close = overlay(`<div class="check ${cat ? 'cat-' + cat : ''}">
        <div class="circle">${I.check}</div>
        ${msg ? `<div class="msg ${cat ? '' : 'plain'}">${esc(msg)}</div>` : ''}</div>`);
      setTimeout(() => { close(); resolve(); }, 1100);
    });
  }

  let toastTimer;
  function toast(msg) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), 2600);
  }

  // Parse & validate a reading from three input values.
  function readValues(sysV, diaV, pulseV) {
    const s = sysV.trim(), d = diaV.trim(), p = pulseV.trim();
    if (!/^\d{2,3}$/.test(s) || !/^\d{2,3}$/.test(d)) return { err: L().errNums };
    const sys = +s, dia = +d;
    if (sys < 50 || sys > 300 || dia < 20 || dia > 200) return { err: L().errRange };
    if (sys <= dia) return { err: L().errOrder };
    let pulse = null;
    if (p) {
      if (!/^\d{2,3}$/.test(p) || +p < 25 || +p > 250) return { err: L().errPulse };
      pulse = +p;
    }
    return { sys, dia, pulse };
  }

  // Numeric-only inputs; jump from SYS to DIA after 3 digits.
  function wireNumberInputs() {
    $$('input[data-num]').forEach((inp) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(0, 3);
        if (inp.id === 'sys' && inp.value.length === 3) { const n = $('#dia'); if (n && !n.value) n.focus(); }
      });
    });
  }

  function bpInputs(v) {
    v = v || {};
    const l = L();
    return `
      <div class="bp-row"><input id="sys" data-num inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="120" value="${v.sys || ''}" aria-label="SYS">
        <div><div class="name">${l.sys}</div><div class="desc">${l.sysDesc}</div></div></div>
      <div class="bp-row"><input id="dia" data-num inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="80" value="${v.dia || ''}" aria-label="DIA">
        <div><div class="name">${l.dia}</div><div class="desc">${l.diaDesc}</div></div></div>
      <div class="bp-row pulse"><input id="pulse" data-num inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="70" value="${v.pulse || ''}" aria-label="${l.pulse}">
        <div><div class="name">${l.pulse}</div><div class="desc">${l.pulseDesc}</div></div></div>`;
  }

  // Date-range / single-date sheets
  function dateSheet({ title, fields, onApply, onClear }) {
    const l = L();
    overlay(`<div class="modal sheet" role="dialog" aria-modal="true">
        <h2>${title}</h2>
        ${fields.map((f) => `<div class="form-row" ${f.label ? '' : 'style="grid-template-columns:1fr"'}>${f.label ? `<label for="f-${f.key}">${f.label}</label>` : ''}
          <input type="date" id="f-${f.key}" value="${f.value || ''}"></div>`).join('')}
        <button class="btn accent" data-apply>${onClear ? l.apply : l.go}</button>
        ${onClear ? `<button class="btn" data-clear>${l.clear}</button>` : ''}
        <button class="btn" data-cancel>${l.cancel}</button>
      </div>`, (el, close) => {
      el.querySelector('[data-apply]').addEventListener('click', () => {
        const vals = {};
        fields.forEach((f) => { vals[f.key] = el.querySelector('#f-' + f.key).value; });
        close(); onApply(vals);
      });
      const c = el.querySelector('[data-clear]');
      if (c) c.addEventListener('click', () => { close(); onClear(); });
      el.querySelector('[data-cancel]').addEventListener('click', close);
    }, true);
  }

  // ---------------------------------------------------------------- screens
  const Screens = {
    // Main menu: list of users + "User creation"
    home() {
      const l = L();
      const users = db.users.slice().sort((a, b) => a.name.localeCompare(b.name));
      return {
        html: `${datePill()}
          <button class="dropdown" id="toggleUsers" aria-expanded="${ui.usersOpen}">${I.tri}<span class="label">${l.users}</span></button>
          ${ui.usersOpen ? `<section class="card">
            ${users.length ? `<div class="userlist">${users.map((u) =>
              `<button data-user="${u.id}">${esc(u.name)}${u.age ? `<span class="meta">${esc(u.age)}</span>` : ''}</button>`).join('')}</div>`
              : `<div class="empty">${l.noUsers}</div>`}
          </section>` : ''}
          <div class="spacer"></div>
          <button class="btn" id="toCreate">${l.userCreation}</button>
          <div style="display:flex;justify-content:center;margin-top:14px">${langToggle()}</div>`,
        mount() {
          on('#toggleUsers', () => { ui.usersOpen = !ui.usersOpen; render(false); });
          on('[data-user]', (e) => go('user', { uid: e.currentTarget.dataset.user }));
          on('#toCreate', () => go('createUser'));
        },
      };
    },

    createUser() {
      const l = L();
      return {
        html: `${datePill()}
          <div class="dropdown" aria-expanded="true">${I.tri}<span class="label">${l.userCreation}</span></div>
          <form class="card" id="userForm" autocomplete="off">
            <div class="form-row"><label for="uName">${l.username}</label><input id="uName" maxlength="30" required></div>
            <div class="form-row"><label for="uAge">${l.age}</label><input id="uAge" inputmode="numeric" pattern="[0-9]*" maxlength="3"></div>
            <div class="form-row"><label for="uGender">${l.gender}</label>
              <select id="uGender"><option value="">${l.choose}</option><option value="male">${l.male}</option><option value="female">${l.female}</option></select></div>
            <button class="sr-only" type="submit">${l.create}</button>
          </form>
          <button class="btn" id="createBtn" style="margin-top:14px">${l.create}</button>
          <div class="footer-row">
            <button class="outline-btn" id="backBtn">${I.back}${l.back}</button>
            <div class="outline-btn lang-wrap">${langToggle()}</div>
          </div>`,
        mount() {
          const ageInp = $('#uAge');
          ageInp.addEventListener('input', () => { ageInp.value = ageInp.value.replace(/\D/g, '').slice(0, 3); });
          const submit = async (e) => {
            if (e) e.preventDefault();
            const name = $('#uName').value.trim();
            if (!name) { toast(l.errName); $('#uName').focus(); return; }
            db.users.push({ id: uid(), name, age: $('#uAge').value || '', gender: $('#uGender').value, createdAt: new Date().toISOString() });
            if (!save()) return;
            document.activeElement && document.activeElement.blur();
            await success(l.userCreated);
            ui.usersOpen = true;
            home();
          };
          $('#userForm').addEventListener('submit', submit);
          on('#createBtn', submit);
          on('#backBtn', back);
        },
      };
    },

    // Selected user's menu
    user({ uid: id }) {
      const u = getUser(id);
      if (!u) return Screens.home();
      const l = L();
      return {
        nav: { uid: id, active: '' },
        html: `${datePill()}
          <div class="subbar">${esc(u.name)} · ${l.since} ${esc(fmtDate(new Date(u.createdAt)))}</div>
          <div class="stack">
            <button class="btn big" id="toLog">${l.logResults}</button>
            <button class="btn big" id="toCal">${l.calendarView}</button>
            <button class="btn small" id="toSwitch">${l.backToSwitch}</button>
          </div>`,
        mount() {
          on('#toLog', () => go('log', { uid: id }));
          on('#toCal', () => go('calendar', { uid: id }));
          on('#toSwitch', home);
        },
      };
    },

    // Enter a new reading
    log({ uid: id }) {
      if (!getUser(id)) return Screens.home();
      const l = L();
      return {
        nav: { uid: id, active: '' },
        html: `${datePill()}
          <div class="subbar">${esc(getUser(id).name)}</div>
          <form id="logForm" autocomplete="off">${bpInputs()}<button class="sr-only" type="submit">${l.logIt}</button></form>
          <div class="row-2">
            <button class="btn" id="logIt">${l.logIt}</button>
            <button class="btn" id="toChart">${l.chart}</button>
          </div>`,
        mount() {
          wireNumberInputs();
          const submit = async (e) => {
            if (e) e.preventDefault();
            const v = readValues($('#sys').value, $('#dia').value, $('#pulse').value);
            if (v.err) return toast(v.err);
            document.activeElement && document.activeElement.blur();
            const c = category(v.sys, v.dia);
            const ok = await confirmBox({
              title: l.areYouSure, cat: c, big: `${v.sys} / ${v.dia}`,
              sub: `${l.cat[c]}${v.pulse ? ` · ♥ ${v.pulse}` : ''}<br>${esc(fmtDateTime(new Date()))}`,
            });
            if (!ok) return;
            db.readings.push({ id: uid(), userId: id, sys: v.sys, dia: v.dia, pulse: v.pulse, at: new Date().toISOString() });
            if (!save()) return;
            await success(l.cat[c], c);
            replace('calendar', { uid: id });
          };
          $('#logForm').addEventListener('submit', submit);
          on('#logIt', submit);
          on('#toChart', () => go('chart', { uid: id }));
          setTimeout(() => { const s = $('#sys'); if (s) s.focus(); }, 50);
        },
      };
    },

    // Month calendar with daily counts
    calendar(p) {
      const id = p.uid;
      if (!getUser(id)) return Screens.home();
      const l = L();
      const now = new Date();
      const y = p.y != null ? p.y : now.getFullYear();
      const m = p.m != null ? p.m : now.getMonth();
      const first = new Date(y, m, 1);
      const daysIn = new Date(y, m + 1, 0).getDate();
      const lead = (first.getDay() + 6) % 7; // Monday-first

      const byDay = {};
      readingsOf(id).forEach((r) => {
        const k = dkey(new Date(r.at));
        const c = category(r.sys, r.dia);
        const e = byDay[k] || (byDay[k] = { n: 0, worst: 'normal' });
        e.n++;
        if (CAT_ORDER.indexOf(c) > CAT_ORDER.indexOf(e.worst)) e.worst = c;
      });

      const todayK = dkey(now);
      let cells = l.wd.map((w) => `<div class="wd">${w}</div>`).join('');
      for (let i = 0; i < lead; i++) cells += '<div></div>';
      for (let d = 1; d <= daysIn; d++) {
        const date = new Date(y, m, d);
        const k = dkey(date);
        const e = byDay[k];
        const cls = ['day', k === todayK ? 'today' : '', date > now ? 'future' : '', e ? 'cat-' + e.worst : ''].join(' ');
        cells += `<button class="${cls}" data-day="${k}" aria-label="${esc(fmtDate(date))}: ${e ? e.n : 0}">
          <span class="num">${d}</span><span class="cnt">${e ? e.n : ''}</span></button>`;
      }

      const title = db.lang === 'mn' ? `${y} · ${l.months[m]}` : `${l.months[m]} ${y}`;
      return {
        nav: { uid: id, active: 'calendar' },
        html: `<div class="cal">
            <div class="cal-head">
              <button id="prevM" aria-label="previous month">${I.left}</button>
              <div class="title">${esc(title)}</div>
              <button id="nextM" aria-label="next month">${I.right}</button>
            </div>
            <div class="cal-grid">${cells}</div>
          </div>
          ${legend()}
          <div class="spacer"></div>
          <button class="btn accent" id="filter">${l.filterByDate}</button>`,
        mount() {
          const shift = (delta) => {
            const d = new Date(y, m + delta, 1);
            cur().p = { uid: id, y: d.getFullYear(), m: d.getMonth() };
            render(false);
          };
          on('#prevM', () => shift(-1));
          on('#nextM', () => shift(1));
          on('[data-day]', (e) => go('day', { uid: id, date: e.currentTarget.dataset.day }));
          on('#filter', () => dateSheet({
            title: l.goToDate,
            fields: [{ key: 'date', label: '', value: dkey(now) }],
            onApply: (v) => { if (v.date) go('day', { uid: id, date: v.date }); },
          }));
        },
      };
    },

    // Records on one calendar day
    day({ uid: id, date }) {
      if (!getUser(id)) return Screens.home();
      const l = L();
      const recs = readingsOf(id).filter((r) => dkey(new Date(r.at)) === date);
      return {
        nav: { uid: id, active: 'calendar' },
        html: `<button class="btn accent" id="filter">${l.filterByDate}</button>
          <div class="detail-bar" style="margin:12px 0">${esc(fmtDate(parseKey(date), true))}</div>
          <div class="section-label">${l.recordSubmission}</div>
          <div class="records">${recs.length ? recs.map(recordRow).join('') : `<div class="empty">${l.noRecordsDay}</div>`}</div>`,
        mount() {
          on('[data-rid]', (e) => go('record', { uid: id, rid: e.currentTarget.dataset.rid }));
          on('#filter', () => dateSheet({
            title: l.goToDate,
            fields: [{ key: 'date', label: '', value: date }],
            onApply: (v) => { if (v.date) replace('day', { uid: id, date: v.date }); },
          }));
        },
      };
    },

    // All records, numbered 1..N top to bottom
    database(p) {
      const id = p.uid;
      if (!getUser(id)) return Screens.home();
      const l = L();
      const all = readingsOf(id);
      const recs = all.filter((r) => {
        const k = dkey(new Date(r.at));
        return (!p.from || k >= p.from) && (!p.to || k <= p.to);
      });
      const filtered = p.from || p.to;
      const rangeTxt = filtered
        ? `${p.from ? esc(fmtDate(parseKey(p.from))) : '…'} – ${p.to ? esc(fmtDate(parseKey(p.to))) : '…'}` : '';
      return {
        nav: { uid: id, active: 'database' },
        html: `${datePill()}
          ${filtered ? `<div class="filter-chip"><span>${l.showing}: ${rangeTxt}</span><button id="clearF">${l.clear}</button></div>` : ''}
          <div class="records">${recs.length ? recs.map(recordRow).join('')
            : `<div class="empty">${filtered ? l.noRecordsRange : l.noRecords}</div>`}</div>
          <div class="spacer"></div>
          <button class="btn accent" id="filter">${l.filterByDate}</button>`,
        mount() {
          on('[data-rid]', (e) => go('record', { uid: id, rid: e.currentTarget.dataset.rid }));
          on('#clearF', () => { cur().p = { uid: id }; render(false); });
          on('#filter', () => dateSheet({
            title: l.filterByDate,
            fields: [{ key: 'from', label: l.from, value: p.from }, { key: 'to', label: l.to, value: p.to }],
            onApply: (v) => {
              let { from, to } = v;
              if (from && to && from > to) [from, to] = [to, from];
              cur().p = { uid: id, from, to };
              render(true);
            },
            onClear: () => { cur().p = { uid: id }; render(true); },
          }));
        },
      };
    },

    // One record: view / correct / delete
    record({ uid: id, rid }) {
      const l = L();
      const r = readingsOf(id).find((x) => x.id === rid);
      if (!r) { setTimeout(back, 0); return { html: '' }; }
      const c = category(r.sys, r.dia);
      return {
        nav: { uid: id, active: '' },
        html: `${datePill()}
          <div class="detail-bar">${l.record} ${r.n} · ${esc(fmtDateTime(new Date(r.at)))}</div>
          <div class="cat-banner cat-${c}">${l.cat[c]}</div>
          <form id="recForm" autocomplete="off">${bpInputs(r)}<button class="sr-only" type="submit">${l.saveChanges}</button></form>
          <div class="row-2">
            <button class="btn" id="saveR">${l.saveChanges}</button>
            <button class="btn danger" id="delR">${l.del}</button>
          </div>`,
        mount() {
          wireNumberInputs();
          const submit = async (e) => {
            if (e) e.preventDefault();
            const v = readValues($('#sys').value, $('#dia').value, $('#pulse').value);
            if (v.err) return toast(v.err);
            const rec = db.readings.find((x) => x.id === rid);
            Object.assign(rec, { sys: v.sys, dia: v.dia, pulse: v.pulse });
            if (!save()) return;
            document.activeElement && document.activeElement.blur();
            const nc = category(v.sys, v.dia);
            await success(l.cat[nc], nc);
            back();
          };
          $('#recForm').addEventListener('submit', submit);
          on('#saveR', submit);
          on('#delR', async () => {
            const ok = await confirmBox({ title: l.deleteRecord, cat: c, big: `${r.sys} / ${r.dia}`, sub: esc(fmtDateTime(new Date(r.at))), yes: l.del, no: l.cancel });
            if (!ok) return;
            db.readings = db.readings.filter((x) => x.id !== rid);
            save();
            back();
          });
        },
      };
    },

    // SYS / DIA line chart
    chart(p) {
      const id = p.uid;
      if (!getUser(id)) return Screens.home();
      const l = L();
      const range = p.range || '30';
      let recs = readingsOf(id);
      if (range !== 'all') {
        const cutoff = Date.now() - Number(range) * 864e5;
        recs = recs.filter((r) => new Date(r.at).getTime() >= cutoff);
      }
      return {
        nav: { uid: id, active: 'chart' },
        html: `${datePill()}
          <div class="seg">
            <button data-range="7" class="${range === '7' ? 'on' : ''}">${l.last7}</button>
            <button data-range="30" class="${range === '30' ? 'on' : ''}">${l.last30}</button>
            <button data-range="all" class="${range === 'all' ? 'on' : ''}">${l.all}</button>
          </div>
          <div class="chart-card">
            <div class="chart-title">${esc(getUser(id).name)} · ${l.chart}</div>
            ${recs.length ? chartSvg(recs) : `<div class="empty">${l.chartEmpty}</div>`}
          </div>
          ${legend()}`,
        mount() {
          on('[data-range]', (e) => { cur().p = { uid: id, range: e.currentTarget.dataset.range }; render(false); });
        },
      };
    },
  };

  function chartSvg(recs) {
    const W = 360, H = 240, padL = 34, padR = 10, padT = 14, padB = 28;
    const vals = recs.flatMap((r) => [r.sys, r.dia]);
    const lo = Math.min(50, Math.floor((Math.min(...vals) - 10) / 10) * 10);
    const hi = Math.max(170, Math.ceil((Math.max(...vals) + 10) / 10) * 10);
    const x = (i) => recs.length === 1 ? (padL + W - padR) / 2 : padL + (i * (W - padL - padR)) / (recs.length - 1);
    const y = (v) => padT + ((hi - v) * (H - padT - padB)) / (hi - lo);

    let g = '';
    for (let v = Math.ceil(lo / 20) * 20; v <= hi; v += 20) {
      g += `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" stroke="#0001"/>
        <text x="${padL - 5}" y="${y(v) + 4}" font-size="10" text-anchor="end" fill="#5D6273">${v}</text>`;
    }
    const ref = (v, color) => `<line x1="${padL}" x2="${W - padR}" y1="${y(v)}" y2="${y(v)}" stroke="${color}" stroke-dasharray="4 4" stroke-width="1.2"/>`;
    g += ref(140, '#D23434') + ref(120, '#C9A000') + ref(90, '#D23434') + ref(80, '#C9A000');

    const line = (key, color) => `<polyline fill="none" stroke="${color}" stroke-width="2.2" stroke-linejoin="round"
      points="${recs.map((r, i) => `${x(i)},${y(r[key])}`).join(' ')}"/>`;
    const dots = (key) => recs.map((r, i) => {
      const c = category(r.sys, r.dia);
      return `<circle cx="${x(i)}" cy="${y(r[key])}" r="4.5" fill="${CAT_COLOR[c]}" stroke="#fff" stroke-width="1.5"/>`;
    }).join('');

    const d0 = new Date(recs[0].at), d1 = new Date(recs[recs.length - 1].at);
    const short = (d) => db.lang === 'mn' ? `${d.getMonth() + 1}/${d.getDate()}` : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="SYS / DIA chart">
      ${g}
      ${line('sys', '#8E2A2A')}${line('dia', '#2F5FB3')}
      ${dots('sys')}${dots('dia')}
      <text x="${padL}" y="${H - 8}" font-size="11" fill="#5D6273">${esc(short(d0))}</text>
      <text x="${W - padR}" y="${H - 8}" font-size="11" text-anchor="end" fill="#5D6273">${esc(short(d1))}</text>
      <g font-size="11" font-weight="700">
        <line x1="${padL + 100}" x2="${padL + 116}" y1="${H - 12}" y2="${H - 12}" stroke="#8E2A2A" stroke-width="3"/>
        <text x="${padL + 120}" y="${H - 8}" fill="#8E2A2A">SYS</text>
        <line x1="${padL + 160}" x2="${padL + 176}" y1="${H - 12}" y2="${H - 12}" stroke="#2F5FB3" stroke-width="3"/>
        <text x="${padL + 180}" y="${H - 8}" fill="#2F5FB3">DIA</text>
      </g>
    </svg>`;
  }

  // Keep "today's date" fresh if the app stays open past midnight / returns from background.
  document.addEventListener('visibilitychange', () => {
    const typing = ['log', 'createUser', 'record'].includes(cur().name);
    if (!document.hidden && !typing && !document.querySelector('.overlay')) render(false);
  });

  render(true);

  // Offline support (only works over https or localhost).
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
