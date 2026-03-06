/* ============================================================
   THE SEN HOME HUB — Shared App Logic
   ============================================================ */

'use strict';

/* ── FAVOURITES (localStorage) ── */
window.SHH = {

  STORE_KEY: 'shh-favourites',

  getFavs() {
    try { return JSON.parse(localStorage.getItem(this.STORE_KEY) || '[]'); }
    catch { return []; }
  },

  saveFavs(favs) {
    localStorage.setItem(this.STORE_KEY, JSON.stringify(favs));
  },

  isFaved(id) {
    return this.getFavs().some(f => f.id === id);
  },

  toggleFav(id, title, url, zone) {
    let favs = this.getFavs();
    const idx = favs.findIndex(f => f.id === id);
    if (idx > -1) {
      favs.splice(idx, 1);
      this.saveFavs(favs);
      this.toast('Removed from saved ♡');
      return false;
    } else {
      favs.push({ id, title, url, zone, saved: Date.now() });
      this.saveFavs(favs);
      this.toast('Saved! ♥');
      return true;
    }
  },

  getFavCount() { return this.getFavs().length; },

  /* ── TOAST ── */
  _toastTimer: null,
  toast(msg) {
    let el = document.getElementById('shh-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'shh-toast';
      el.className = 'toast';
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  },

  /* ── MODAL HELPERS ── */
  openModal(id)  { const m = document.getElementById(id); if (m) m.classList.add('open'); },
  closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); },

  initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) overlay.classList.remove('open');
      });
    });
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const m = btn.closest('.modal-overlay');
        if (m) m.classList.remove('open');
      });
    });
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
      btn.addEventListener('click', () => this.openModal(btn.dataset.modalOpen));
    });
  },

  /* ── HEART BUTTONS ── */
  initHearts() {
    document.querySelectorAll('[data-fav]').forEach(btn => {
      const id    = btn.dataset.fav;
      const title = btn.dataset.favTitle || '';
      const url   = btn.dataset.favUrl   || window.location.href;
      const zone  = btn.dataset.favZone  || 'parent';
      if (this.isFaved(id)) { btn.textContent = '♥'; btn.classList.add('saved'); }
      btn.addEventListener('click', e => {
        e.preventDefault(); e.stopPropagation();
        const saved = this.toggleFav(id, title, url, zone);
        btn.textContent = saved ? '♥' : '♡';
        btn.classList.toggle('saved', saved);
        this.updateFavCounters();
      });
    });
  },

  updateFavCounters() {
    const n = this.getFavCount();
    document.querySelectorAll('[data-fav-count]').forEach(el => {
      el.textContent = n + (n === 1 ? ' saved item' : ' saved items');
    });
  },

  /* ── ZONE TOGGLE (homepage) ── */
  initZoneToggle() {
    const btns  = document.querySelectorAll('[data-zone-btn]');
    const zones = document.querySelectorAll('[data-zone]');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.zoneBtn;
        btns.forEach(b  => b.classList.toggle('active', b.dataset.zoneBtn === target));
        zones.forEach(z => {
          const show = z.dataset.zone === target;
          z.classList.toggle('hidden', !show);
          if (show) {
            z.classList.remove('anim-fade-up');
            void z.offsetWidth;
            z.classList.add('anim-fade-up');
          }
        });
        localStorage.setItem('shh-last-zone', target);
      });
    });
    // restore last zone
    const last = localStorage.getItem('shh-last-zone');
    if (last) {
      const btn = document.querySelector(`[data-zone-btn="${last}"]`);
      if (btn) btn.click();
    }
  },

  /* ── SEN PILL FILTER ── */
  initSenFilter() {
    document.querySelectorAll('[data-sen-pill]').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('active');
      });
    });
  },

  /* ── INIT ALL ── */
  init() {
    this.initModals();
    this.initHearts();
    this.initZoneToggle();
    this.initSenFilter();
    this.updateFavCounters();
  }
};

document.addEventListener('DOMContentLoaded', () => SHH.init());

/* ── PWA SERVICE WORKER REGISTRATION ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
