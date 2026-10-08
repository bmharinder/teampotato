/* ===== LIFE IN 2050 — script.js ===== */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- Floating particles (canvas) ---------- */
const cv = $('#fx'), cx = cv.getContext('2d');
let dots = [];
function sizeCanvas() {
  cv.width = innerWidth; cv.height = innerHeight;
  const n = innerWidth < 700 ? 30 : 70;
  dots = Array.from({length: n}, () => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height,
    r: Math.random() * 1.8 + .4, v: Math.random() * .5 + .15,
    c: ['0,240,255', '59,130,246', '168,85,247'][Math.floor(Math.random() * 3)]
  }));
}
function drawDots() {
  cx.clearRect(0, 0, cv.width, cv.height);
  dots.forEach(d => {
    d.y -= d.v; if (d.y < -5) { d.y = cv.height + 5; d.x = Math.random() * cv.width; }
    cx.beginPath(); cx.arc(d.x, d.y, d.r, 0, 7);
    cx.fillStyle = `rgba(${d.c},.8)`; cx.shadowBlur = 10; cx.shadowColor = `rgb(${d.c})`; cx.fill();
  });
  requestAnimationFrame(drawDots);
}
sizeCanvas(); drawDots(); addEventListener('resize', sizeCanvas);

/* ---------- PAGE 1 : form validation ---------- */
const form = $('#form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#name').value.trim();
  const mobile = $('#mobile').value.replace(/[\s-]/g, '');
  const email = $('#email').value.trim();
  const err = { name: '', mobile: '', email: '' };
  if (!name) err.name = 'Please enter your full name.';
  else if (name.length < 2) err.name = 'Name is too short.';
  if (!mobile) err.mobile = 'Please enter your mobile number.';
  else if (!/^\+?\d{10,13}$/.test(mobile)) err.mobile = 'Enter a valid mobile number (10–13 digits).';
  if (!email) err.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) err.email = 'Enter a valid email address.';
  ['name', 'mobile', 'email'].forEach(k => $('#e-' + k).textContent = err[k]);
  if (err.name || err.mobile || err.email) return;

  /* Only the NAME is remembered. Mobile & email are never stored or shown. */
  try { localStorage.setItem('future2050_name', name); } catch (x) {}
  startTransition(name);
});

/* ---------- Transition + portal intro ---------- */
let timers = [], introDone = false;
function startTransition(name) {
  $('#loader').classList.remove('hidden');
  setTimeout(() => {
    $('#page1').classList.add('hidden');
    $('#loader').classList.add('hidden');
    runIntro(name);
  }, 1500);
}
function runIntro(name) {
  const intro = $('#intro');
  $('#introName').textContent = 'Welcome, ' + name.split(' ')[0];
  $('#greet').textContent = 'WELCOME, ' + name.toUpperCase();
  intro.classList.remove('hidden');
  const steps = [[100, 'p1'], [1000, 'p2'], [1300, 'p3'], [2100, 'p4'], [2900, 'p5']];
  steps.forEach(([t, c]) => timers.push(setTimeout(() => intro.classList.add(c), t)));
  timers.push(setTimeout(endIntro, 4200));
}
function endIntro() {
  if (introDone) return; introDone = true;
  timers.forEach(clearTimeout);
  const intro = $('#intro');
  intro.classList.add('fade');
  $('#site').classList.remove('hidden');
  setTimeout(() => { intro.classList.add('hidden'); initReveal(); }, 900);
}
$('#skip').addEventListener('click', endIntro);

/* ---------- Scroll reveal, counters, rings ---------- */
const C = 326.7; // circle circumference (r = 52)
function animateCount(el) {
  const to = +el.dataset.count; let n = 0;
  const t = setInterval(() => { n += Math.max(1, Math.round(to / 40)); if (n >= to) { n = to; clearInterval(t); } el.textContent = n; }, 35);
}
function initReveal() {
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    const el = en.target; el.classList.add('show'); io.unobserve(el);
    el.querySelectorAll('[data-count]').forEach(animateCount);
    el.querySelectorAll('.bar').forEach(b => b.style.strokeDashoffset = C * (1 - b.dataset.pct / 100));
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));
}

/* ---------- Navigation ---------- */
$('#burger').addEventListener('click', () => $('#links').classList.toggle('open'));
$$('#links a').forEach(a => a.addEventListener('click', () => $('#links').classList.remove('open')));
$('#top').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
setInterval(() => {
  const d = new Date();
  $('#clock').textContent = 'YEAR: 2050 • ' + d.toLocaleTimeString([], { hour12: false });
}, 1000);

/* ---------- Transport animation ---------- */
$('#launch').addEventListener('click', () => {
  const car = $('#car2');
  car.classList.remove('go'); void car.offsetWidth; car.classList.add('go');
  beep(300, 700, .5);
});

/* ---------- Sound (Web Audio — free, no files needed) ---------- */
let audio, muted = false;
function beep(f1, f2, dur) {
  if (muted) return;
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator(), g = audio.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(f1, audio.currentTime);
    o.frequency.exponentialRampToValueAtTime(f2, audio.currentTime + dur);
    g.gain.setValueAtTime(.12, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + dur);
    o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + dur);
  } catch (x) {}
}
$('#mute').addEventListener('click', e => {
  muted = !muted; e.target.textContent = muted ? '🔇 SOUND OFF' : '🔊 SOUND ON';
});

/* ---------- Activate City AI ---------- */
$('#activate').addEventListener('click', e => {
  const st = $('#aiStatus'), msg = $('#aiMsg');
  if (document.body.classList.contains('online')) return;
  document.body.classList.add('online');
  st.textContent = 'ONLINE'; st.classList.add('on');
  e.target.textContent = 'CITY AI ONLINE';
  msg.innerHTML = '<b>CITY AI ACTIVATED</b><p>Welcome to the intelligent city of 2050.</p>';
  msg.classList.add('show');
  beep(200, 1000, .7);
  setTimeout(() => beep(600, 1200, .4), 500);
});
