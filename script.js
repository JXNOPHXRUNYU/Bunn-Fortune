/* ==========================================================
   Bunné Fortune — script.js
   ★ ลิงก์ทั้งหมดของร้านอยู่ตรงนี้ แก้ที่เดียว ทุกหน้าเปลี่ยนตาม ★
   ========================================================== */
const LINKS = {
  line: 'https://lin.ee/3OlsODJ',
  lineId: '@063sfyty',
  lineName: 'Bunne Fortune',
  instagram: 'https://www.instagram.com/bunne_fortune',
  instagramName: 'bunne_fortune',
  packages: 'https://bunnefortune21.simdif.com/',
  reviewStory: 'https://www.instagram.com/s/aGlnaGxpZ2h0OjE4MDAyMDYzNjA2OTA3MzIz?story_media_id=3854168727315500391&srtk=MW1kY3d6M3RteGhibQ==',
  wallpaperStory: 'https://www.instagram.com/s/aGlnaGxpZ2h0OjE3ODQ5MDExNTgxNDkzMzQ0?story_media_id=3840334746514080960&srtk=cnIweWhoeTc4cXll',
};

const PAGES = [
  { href: 'index.html', label: 'หน้าหลัก' },
  { href: 'promotion.html', label: 'Promotion' },
  { href: 'packages.html', label: 'แพ็คเกจ' },
  { href: 'more.html', label: 'โปรยอดนิยม' },
  { href: 'booking.html', label: 'จองคิว & ติดต่อ' },
  { href: 'payment.html', label: 'โอนเงิน' },
];

/* ---------- Navbar + Footer (ใส่ให้อัตโนมัติทุกหน้า) ---------- */
function buildChrome() {
  const current = location.pathname.split('/').pop() || 'index.html';
  const links = PAGES.map(p =>
    `<li><a href="${p.href}" class="${p.href === current ? 'active' : ''}">${p.label}</a></li>`
  ).join('');

  const header = document.getElementById('site-header');
  if (header) header.innerHTML = `
    <nav class="navbar">
      <div class="container nav-inner">
        <a href="index.html" class="brand"><span class="bun">🐰</span>Bunné Fortune</a>
        <button class="burger" aria-label="เปิดเมนู" aria-expanded="false">☰</button>
        <ul class="nav-links">${links}</ul>
      </div>
    </nav>`;

  const footer = document.getElementById('site-footer');
  if (footer) footer.innerHTML = `
    <svg class="wave" viewBox="0 0 1440 50" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 25 Q 90 0 180 25 T 360 25 T 540 25 T 720 25 T 900 25 T 1080 25 T 1260 25 T 1440 25 V50 H0Z" fill="#e2d1ff"/>
    </svg>
    <div class="footer">
      <div class="container">
        <div style="font-size:2.4rem" class="en">🐰🔮✨</div>
        <h3 class="en" style="font-size:1.8rem;color:var(--lilac-500)">Bunné Fortune</h3>
        <p>มาให้แม่หมอช่วยหาคำตอบด้วยกันนะคะ</p>
        <div class="footer-btns">
          <a class="btn line" href="${LINKS.line}" target="_blank" rel="noopener">💬 LINE Official : ${LINKS.lineName}</a>
          <a class="btn ig" href="${LINKS.instagram}" target="_blank" rel="noopener">📷 IG : ${LINKS.instagramName}</a>
        </div>
        <small>รับคิวแค่ในไลน์เท่านั้น ไม่ตอบแชทไอจีค่ะ · LINE ID ${LINKS.lineId}</small>
        <small>© ${new Date().getFullYear()} Bunné Fortune · ดูดวงเพื่อความสบายใจ</small>
      </div>
    </div>
    <a class="float-line" href="${LINKS.line}" target="_blank" rel="noopener" aria-label="ติดต่อทาง LINE">💬</a>`;

  // ผูกลิงก์ให้ปุ่มที่ใส่ class ไว้ (js-line, js-ig, js-packages, js-review, js-wallpaper)
  const hooks = { 'js-line': 'line', 'js-ig': 'instagram', 'js-packages': 'packages', 'js-review': 'reviewStory', 'js-wallpaper': 'wallpaperStory' };
  Object.entries(hooks).forEach(([cls, key]) => {
    document.querySelectorAll('.' + cls).forEach(a => { a.href = LINKS[key]; a.target = '_blank'; a.rel = 'noopener'; });
  });
  document.querySelectorAll('.js-line-id').forEach(el => (el.textContent = LINKS.lineId));

  // เมนูมือถือ
  const burger = document.querySelector('.burger');
  const menu = document.querySelector('.nav-links');
  if (burger) burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    burger.textContent = open ? '✕' : '☰';
  });
}

/* ---------- ดาว/ประกายลอยขึ้นด้านหลัง ---------- */
function buildSky() {
  const sky = document.createElement('div');
  sky.id = 'sky';
  document.body.prepend(sky);
  const icons = ['✨', '⭐', '🌙', '💜', '🫧', '🔮', '☁️', '🌸', '✦'];
  const w = window.innerWidth;
  const count = w < 700 ? 7 : (w < 1100 ? 12 : 22);   // น้อยลงบนมือถือ/ไอแพด ให้ลื่นและประหยัดแบต
  for (let i = 0; i < count; i++) {
    const s = document.createElement('span');
    s.className = 'floaty';
    s.textContent = icons[Math.floor(Math.random() * icons.length)];
    s.style.left = Math.random() * 100 + 'vw';
    s.style.fontSize = 14 + Math.random() * 22 + 'px';
    s.style.animationDuration = 12 + Math.random() * 16 + 's';
    s.style.animationDelay = -Math.random() * 20 + 's';
    sky.appendChild(s);
  }
}

/* ---------- ประกายตามเมาส์ ---------- */
function sparkleCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  let last = 0;
  window.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - last < 70) return;
    last = now;
    const s = document.createElement('span');
    s.className = 'sparkle-trail';
    s.textContent = ['✨', '💜', '⭐', '🫧'][Math.floor(Math.random() * 4)];
    s.style.left = e.clientX + 'px';
    s.style.top = e.clientY + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  });
}

/* ---------- Scroll reveal ---------- */
function revealOnScroll() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('show'); io.unobserve(en.target); } });
  }, { threshold: .15 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ---------- FAQ accordion ---------- */
function faq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    const ans = item.querySelector('.faq-a');
    btn.addEventListener('click', () => {
      const open = item.classList.toggle('open');
      ans.style.maxHeight = open ? ans.scrollHeight + 'px' : 0;
    });
  });
}

/* ---------- แตะไพ่เพื่อพลิก (มือถือ) ---------- */
function flipCards() {
  document.querySelectorAll('.flip').forEach(c => c.addEventListener('click', () => c.classList.toggle('flipped')));
}

/* ---------- คลิกรูปให้ขยายดู (รูปรีวิว / อินโฟกราฟิก) ---------- */
function lightbox() {
  const imgs = document.querySelectorAll('.zoomable img');
  if (!imgs.length) return;
  const box = document.createElement('div');
  box.className = 'lightbox';
  box.innerHTML = '<img alt=""><button aria-label="ปิด">✕</button>';
  document.body.appendChild(box);
  const big = box.querySelector('img');
  imgs.forEach(img => img.addEventListener('click', () => { big.src = img.dataset.full || img.src; big.alt = img.alt; box.classList.add('open'); }));
  box.addEventListener('click', () => box.classList.remove('open'));
}

/* ---------- พลิกบัตรแม่หมอ ---------- */
function idCards() {
  document.querySelectorAll('.idc').forEach(card => {
    const flip = () => { const on = card.classList.toggle('flipped'); card.setAttribute('aria-pressed', on); };
    card.addEventListener('click', e => { if (e.target.closest('a')) return; flip(); });
    card.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('a')) { e.preventDefault(); flip(); } });
  });
}

/* ---------- เปลี่ยนหน้าแบบนุ่มๆ ---------- */
function pageTransition() {
  document.querySelectorAll('a[href$=".html"], a[href*=".html#"]').forEach(a => {
    a.addEventListener('click', e => {
      if (a.target === '_blank' || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      document.body.classList.add('leaving');
      setTimeout(() => (location.href = a.getAttribute('href')), 300);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildChrome();
  buildSky();
  sparkleCursor();
  revealOnScroll();
  faq();
  flipCards();
  lightbox();
  idCards();
  pageTransition();
});
