/* ==========================================================
   Bunné Fortune — payment.js  (หน้าโอนเงิน)
   - สร้างคิวอาร์ PromptPay/TrueMoney แบบล็อกยอด (EMVCo + CRC16)
   - ปุ่มคัดลอก / พลิกการ์ด / บันทึกรูป
   ★ รหัสวอลเล็ตอยู่ตรงนี้ แก้ที่เดียว (ได้จาก QR ในโปสเตอร์ของร้าน) ★
   ========================================================== */
const PAY = {
  walletId: '004999115500901',   // e-wallet ID ของ TrueMoney Wallet (ถอดจาก QR ในโปสเตอร์ร้าน)
  maxAmount: 100000,             // ยอดสูงสุดที่ให้สร้างคิวอาร์
  shopName: 'Bunné Fortune',
};

/* ---------- สร้างข้อความ QR (EMVCo) ---------- */
function crc16(str) {
  let c = 0xFFFF;
  for (let i = 0; i < str.length; i++) {
    c ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) c = (c & 0x8000) ? ((c << 1) ^ 0x1021) & 0xFFFF : (c << 1) & 0xFFFF;
  }
  return c.toString(16).toUpperCase().padStart(4, '0');
}
function tlv(tag, val) { return tag + String(val.length).padStart(2, '0') + val; }
function buildPayload(amount) {               // amount = ตัวเลข  หรือ null = QR แบบไม่ระบุยอด
  const merchant = tlv('00', 'A000000677010111') + tlv('03', PAY.walletId);
  let body = tlv('00', '01') + tlv('01', amount ? '12' : '11') + tlv('29', merchant) + tlv('53', '764');
  if (amount) body += tlv('54', amount.toFixed(2));
  body += tlv('58', 'TH') + '6304';
  return body + crc16(body);
}

/* ---------- วาด QR ลง canvas ---------- */
function drawQR(canvas, text) {
  const { QRCode, QRErrorCorrectLevel } = window.BunneQR;
  const qr = new QRCode(-1, QRErrorCorrectLevel.M);
  qr.addData(text); qr.make();
  const n = qr.getModuleCount(), quiet = 4, size = canvas.width;
  const cell = size / (n + quiet * 2);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#4a2f86';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
    if (qr.isDark(r, c)) ctx.fillRect(Math.floor((c + quiet) * cell), Math.floor((r + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
  }
}

/* กรอบมนสำหรับ canvas (ctx.roundRect ใช้ไม่ได้บน iOS ก่อน 16) */
function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/* ---------- หน้าจอ ---------- */
(function () {
  const $ = id => document.getElementById(id);
  const flip = $('qrFlip'), front = $('qrFront'), back = $('qrBack'), canvas = $('qrCanvas');
  const empty = $('qrEmpty'), caption = $('qrCaption'), amountEl = $('amount'), msg = $('amtMsg');
  const flipBtn = $('flipBtn'), saveBtn = $('saveBtn'), toastEl = $('toast');
  if (!flip) return;
  let amount = null, showBack = false;

  const fmt = n => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function toast(t) { toastEl.textContent = t; toastEl.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => toastEl.classList.remove('show'), 1800); }

  function setFace(b) {
    showBack = b;
    flip.classList.toggle('flipped', b);
    back.setAttribute('aria-hidden', String(!b)); front.setAttribute('aria-hidden', String(b));
    flipBtn.setAttribute('aria-pressed', String(b));
    flipBtn.textContent = b ? '🔄 พลิกกลับไปคิวอาร์ปกติ' : '🔄 พลิกไปคิวอาร์ล็อกยอด';
  }
  function parse(v) {
    const s = v.replace(/[,\s฿]/g, '');
    if (!s) return { state: 'empty' };
    if (!/^\d{1,6}(\.\d{0,2})?$/.test(s)) return { state: 'bad' };
    const n = parseFloat(s);
    if (!(n > 0)) return { state: 'zero' };
    if (n > PAY.maxAmount) return { state: 'big' };
    return { state: 'ok', n: Math.round(n * 100) / 100 };
  }
  function update() {
    const p = parse(amountEl.value);
    amount = null;
    canvas.style.visibility = 'hidden'; caption.textContent = ''; empty.style.display = '';
    if (p.state === 'ok') {
      amount = p.n;
      drawQR(canvas, buildPayload(amount));
      canvas.style.visibility = 'visible'; empty.style.display = 'none';
      caption.textContent = '฿ ' + fmt(amount);
      msg.textContent = 'สร้างคิวอาร์ล็อกยอด ' + fmt(amount) + ' บาท แล้วค่ะ'; msg.className = 'pay-msg ok';
      setFace(true);
    } else {
      msg.className = 'pay-msg' + (p.state === 'empty' ? '' : ' err');
      msg.textContent = { empty: '', bad: 'กรอกเป็นตัวเลขได้เลยค่ะ เช่น 89 หรือ 259.50', zero: 'ยอดต้องมากกว่า 0 บาทนะคะ',
        big: 'ยอดสูงสุด ' + PAY.maxAmount.toLocaleString('th-TH') + ' บาทค่ะ' }[p.state];
      if (p.state === 'empty') setFace(false);
    }
  }
  amountEl.addEventListener('input', update);
  document.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => { amountEl.value = b.dataset.amt; update(); }));
  flipBtn.addEventListener('click', () => setFace(!showBack));

  /* คัดลอก */
  function legacyCopy(t) {
    return new Promise((ok, no) => {
      const ta = document.createElement('textarea'); ta.value = t; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
      document.body.appendChild(ta); ta.focus(); ta.select();
      let done = false; try { done = document.execCommand('copy'); } catch (e) {} ta.remove();
      done ? ok() : no();
    });
  }
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(t).catch(() => legacyCopy(t));
    return legacyCopy(t);
  }
  document.querySelectorAll('.copy-btn').forEach(b => b.addEventListener('click', () => {
    copyText(b.dataset.copy).then(() => toast('คัดลอก' + b.dataset.what + 'แล้วค่ะ ✨')).catch(() => toast('คัดลอกไม่สำเร็จ ลองกดค้างที่ตัวเลขแทนนะคะ'));
  }));

  /* บันทึกรูป */
  function download(href, name) { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); }
  saveBtn.addEventListener('click', () => {
    if (showBack && amount) {
      const W = 720, H = 860, c = document.createElement('canvas'); c.width = W; c.height = H;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#f3e6ff'); g.addColorStop(1, '#ffe3f2');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
      x.fillStyle = '#fff'; roundRectPath(x, 40, 40, W - 80, H - 80, 36); x.fill();
      x.drawImage(canvas, 90, 90, 540, 540);
      x.textAlign = 'center'; x.fillStyle = '#5b4391';
      x.font = '700 40px "Mali","Itim",sans-serif'; x.fillText(PAY.shopName, W / 2, 690);
      x.font = '700 52px "Mali","Itim",sans-serif'; x.fillText('฿ ' + fmt(amount), W / 2, 760);
      x.font = '500 26px "Mali","Itim",sans-serif'; x.fillStyle = '#7d68ad'; x.fillText('สแกนจ่ายผ่านแอปธนาคาร / ทรูมันนี่', W / 2, 805);
      download(c.toDataURL('image/png'), 'bunne-fortune-qr-' + amount.toFixed(2) + '.png');
      toast('บันทึกคิวอาร์ล็อกยอดแล้วค่ะ ✨');
    } else {
      const url = 'images/pay-poster-full.webp';
      fetch(url).then(r => { if (!r.ok) throw 0; return r.blob(); })
        .then(bl => { download(URL.createObjectURL(bl), 'bunne-fortune-payment-qr.webp'); toast('บันทึกโปสเตอร์คิวอาร์แล้วค่ะ ✨'); })
        .catch(() => { window.open(url, '_blank', 'noopener'); toast('เปิดรูปแล้วค่ะ กดค้างที่รูปเพื่อบันทึกได้เลย'); });  // เปิดจากไฟล์ในเครื่อง (file://) เบราว์เซอร์จะไม่ให้ดาวน์โหลดตรง
    }
  });

  setFace(false); update();
})();
