// Initialize AOS
if(window.AOS) AOS.init({duration:700,once:true});

// GSAP subtle hero animation
if(window.gsap && window.ScrollTrigger){
	gsap.registerPlugin(ScrollTrigger);
	gsap.from('.hero-title',{y:30,opacity:0,duration:0.9,stagger:0.08});
	gsap.from('.hero-shapes .shape',{y:40,opacity:0,duration:1,stagger:0.15,ease:'power2.out'});
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
	a.addEventListener('click', e=>{
		const href = a.getAttribute('href');
		if(href.length>1){
			e.preventDefault();
			document.querySelector(href)?.scrollIntoView({behavior:'smooth',block:'start'});
		}
	})
});

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
function applyTheme(theme){
	if(theme==='light') document.documentElement.classList.add('light');
	else document.documentElement.classList.remove('light');
	localStorage.setItem('theme',theme);
}
const saved = localStorage.getItem('theme') || 'dark';
applyTheme(saved);
themeToggle?.addEventListener('click', ()=>{
	const next = document.documentElement.classList.contains('light') ? 'dark' : 'light';
	applyTheme(next);
});

// Gallery filter & modal
const grid = document.getElementById('gallery-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn=>btn.addEventListener('click', ()=>{
	filterBtns.forEach(b=>b.classList.remove('active'));
	btn.classList.add('active');
	const f = btn.dataset.filter;
	document.querySelectorAll('.grid-item').forEach(item=>{
		const cat = item.dataset.category;
		if(f==='*' || f===cat) item.style.display = '';
		else item.style.display = 'none';
	})
}));

// modal
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalClose = document.querySelector('.modal-close');
grid?.addEventListener('click', e=>{
	const item = e.target.closest('.grid-item');
	if(!item) return;
	const img = item.querySelector('img');
	modalImg.src = img.src;
	modalImg.alt = img.alt || '';
	modal.setAttribute('aria-hidden','false');
});
modalClose?.addEventListener('click', ()=> modal.setAttribute('aria-hidden','true'));
modal?.addEventListener('click', e=>{ if(e.target===modal) modal.setAttribute('aria-hidden','true') });

// form validation
const form = document.getElementById('contact-form');
form?.addEventListener('submit', e=>{
	e.preventDefault();
	const fm = new FormData(form);
	const message = fm.get('message')?.toString().trim();
	if(!message){
		alert('メッセージを入力してください');
		return;
	}
	// fake submit (demo)
	alert('メッセージを送信しました（デモ）');
	form.reset();
});

// footer year
document.getElementById('year').textContent = new Date().getFullYear();

