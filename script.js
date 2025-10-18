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
// --- Calculator ---
const calcDisplay = document.getElementById('calc-display');
const calc = document.getElementById('calc');
if(calc){
	calc.addEventListener('click', e=>{
		const btn = e.target.closest('button');
		if(!btn) return;
		const action = btn.dataset.action;
		const value = btn.dataset.value;
		const fn = btn.dataset.fn;

		if(action==='clear'){
			calcDisplay.value = '';
			return;
		}
		if(action==='back'){
			calcDisplay.value = calcDisplay.value.slice(0,-1);
			return;
		}
		if(action==='eval'){
			// safe eval: allow digits, operators and Math names
			try{
				const expr = calcDisplay.value.replace(/÷/g,'/').replace(/×/g,'*').replace(/−/g,'-');
				// basic whitelist: digits, operators, parentheses, dot, letters
				if(!/^[0-9+\-*/().^ %A-Za-z,]+$/.test(expr)) throw new Error('不正な文字');
				// replace ^ with Math.pow usage if present: a^b => Math.pow(a,b)
				const safeExpr = expr.replace(/(\d+(?:\.\d+)?|\([^()]+\))\s*\^\s*(\d+(?:\.\d+)?|\([^()]+\))/g, 'Math.pow($1,$2)');
				// eslint-disable-next-line no-new-func
				const fnc = new Function('Math', 'return ' + safeExpr);
				const res = fnc(Math);
				calcDisplay.value = String(res);
			}catch(err){
				alert('計算式にエラーがあります');
			}
			return;
		}

		if(fn){
			// apply function to current value
			try{
				const v = parseFloat(calcDisplay.value || '0');
				// map Math.pow button to square if no argument
				if(fn==='Math.pow'){
					calcDisplay.value = String(Math.pow(v,2));
				} else {
					const result = Function('Math','v','return ' + fn + '(v)')(Math,v);
					calcDisplay.value = String(result);
				}
			}catch(e){ alert('関数適用エラー') }
			return;
		}

		if(value){
			calcDisplay.value = (calcDisplay.value || '') + value;
		}
	});
}

// --- Mahjong simple pair matching ---
const mahjongBoard = document.getElementById('mahjong-board');
const shuffleBtn = document.getElementById('shuffle-tiles');
const resetBtn = document.getElementById('reset-tiles');

function generateTiles(){
	// create 32 pairs (64 tiles) but for small demo use 32 tiles (16 pairs)
	const symbols = ['🀄','🀅','🀆','🀇','🀈','🀉','🀊','🀋','🀌','🀍','🀎','🀏','🀐','🀑','🀒','🀓'];
	const pairs = symbols.concat(symbols); // 32
	// shuffle
	for(let i=pairs.length-1;i>0;i--){
		const j = Math.floor(Math.random()*(i+1));
		[pairs[i],pairs[j]] = [pairs[j],pairs[i]];
	}
	return pairs;
}

let tiles = [];
let selected = [];

function renderBoard(){
	if(!mahjongBoard) return;
	mahjongBoard.innerHTML = '';
	tiles.forEach((t,idx)=>{
		const d = document.createElement('div');
		d.className = 'mahjong-tile';
		d.tabIndex = 0;
		d.dataset.index = idx;
		d.textContent = t;
		mahjongBoard.appendChild(d);
	});
}

function initMahjong(){
	tiles = generateTiles();
	selected = [];
	renderBoard();
}

mahjongBoard?.addEventListener('click', e=>{
	const t = e.target.closest('.mahjong-tile');
	if(!t) return;
	const idx = Number(t.dataset.index);
	if(t.classList.contains('removed')) return;
	if(selected.includes(idx)){
		selected = selected.filter(i=>i!==idx);
		t.classList.remove('selected');
		return;
	}
	selected.push(idx);
	t.classList.add('selected');
	if(selected.length===2){
		const [a,b] = selected;
		if(tiles[a]===tiles[b]){
			// match: remove
			const aEl = mahjongBoard.querySelector(`[data-index="${a}"]`);
			const bEl = mahjongBoard.querySelector(`[data-index="${b}"]`);
			aEl.classList.add('removed'); bEl.classList.add('removed');
			aEl.textContent = '';
			bEl.textContent = '';
		} else {
			// no match: brief highlight then unselect
			setTimeout(()=>{
				mahjongBoard.querySelector(`[data-index="${a}"]`)?.classList.remove('selected');
				mahjongBoard.querySelector(`[data-index="${b}"]`)?.classList.remove('selected');
			},400);
		}
		selected = [];
	}
});

shuffleBtn?.addEventListener('click', ()=>{ initMahjong(); });
resetBtn?.addEventListener('click', ()=>{ initMahjong(); });

// init on load
initMahjong();

// footer year
document.getElementById('year').textContent = new Date().getFullYear();

