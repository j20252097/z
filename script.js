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

// remove gallery/modal handlers (focus mode)

// form validation
// --- Blackjack game ---
const bjNew = document.getElementById('bj-new');
const bjHit = document.getElementById('bj-hit');
const bjStand = document.getElementById('bj-stand');
const dealerCardsEl = document.getElementById('dealer-cards');
const playerCardsEl = document.getElementById('player-cards');
const dealerScoreEl = document.getElementById('dealer-score');
const playerScoreEl = document.getElementById('player-score');
const bjLog = document.getElementById('bj-log');

let deck = [];
let playerHand = [];
let dealerHand = [];
let inRound = false;
let soundEnabled = true;

// simple sounds (public domain short tones)
const snd = {
	deal: new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg'),
	click: new Audio('https://actions.google.com/sounds/v1/buttons/button_press.ogg'),
	win: new Audio('https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg'),
	lose: new Audio('https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg')
};

function playSound(name){ if(!soundEnabled) return; try{ snd[name]?.currentTime=0; snd[name]?.play(); }catch(e){} }

function createDeck(){
	const suits = ['♠','♥','♦','♣'];
	const ranks = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const d = [];
	for(const s of suits){
		for(const r of ranks){
			d.push({suit:s,rank:r});
		}
	}
	return d;
}

function shuffle(d){
	for(let i=d.length-1;i>0;i--){
		const j = Math.floor(Math.random()*(i+1));
		[d[i],d[j]]=[d[j],d[i]];
	}
}

function cardValue(card){
	if(card.rank==='A') return 11;
	if(['J','Q','K'].includes(card.rank)) return 10;
	return Number(card.rank);
}

function scoreHand(hand){
	let total = 0; let aces = 0;
	for(const c of hand){
		if(c.rank==='A'){ aces++; total+=11; }
		else if(['J','Q','K'].includes(c.rank)) total+=10;
		else total+=Number(c.rank);
	}
	while(total>21 && aces>0){ total-=10; aces--; }
	return total;
}

function renderCard(card){
	const el = document.createElement('div');
	el.className = 'card';
	const isRed = card.suit==='♥' || card.suit==='♦';
	const front = document.createElement('div'); front.className='face front'; front.innerHTML = `<div>${card.rank}</div><div>${card.suit}</div>`; if(isRed) front.classList.add('red');
	const back = document.createElement('div'); back.className='face back'; back.textContent = '';
	el.appendChild(front); el.appendChild(back);
	return el;
}

function renderHands(hideDealerHole=true){
	dealerCardsEl.innerHTML = '';
	playerCardsEl.innerHTML = '';
	dealerHand.forEach((c,i)=>{
		const el = renderCard(c);
		if(i===0 && hideDealerHole && inRound){
			// show back for dealer hole
			el.querySelector('.front').style.visibility='hidden';
			el.querySelector('.back').textContent = '';
			el.classList.add('flip');
		}
		dealerCardsEl.appendChild(el);
	});
	playerHand.forEach(c=> playerCardsEl.appendChild(renderCard(c)));
	dealerScoreEl.textContent = inRound ? (hideDealerHole? '?' : String(scoreHand(dealerHand))) : '--';
	playerScoreEl.textContent = String(scoreHand(playerHand));
}

function log(msg){
	if(!bjLog) return;
	const p = document.createElement('div'); p.textContent = msg; bjLog.prepend(p);
}

function dealCard(to){
	if(deck.length===0) deck = createDeck();
	const c = deck.pop();
	to.push(c);
	playSound('deal');
}

function startRound(){
	deck = createDeck(); shuffle(deck);
	playerHand = []; dealerHand = [];
	inRound = true; bjLog.innerHTML='';
	// deal animation sequence
	const sequence = [() => { dealCard(playerHand); renderHands(true); },
										() => { setTimeout(()=>{ dealCard(dealerHand); renderHands(true); }, 250); },
										() => { setTimeout(()=>{ dealCard(playerHand); renderHands(true); }, 500); },
										() => { setTimeout(()=>{ dealCard(dealerHand); renderHands(true); }, 750); }];
	sequence.forEach((fn,i)=> setTimeout(fn, i*300));
	setTimeout(()=>{ renderHands(true); log('ゲーム開始 — ヒットまたはスタンドを選択してください'); }, 1200);
}

function playerHit(){
	if(!inRound) return; dealCard(playerHand); renderHands(true); playSound('click');
	const s = scoreHand(playerHand);
	if(s>21){
		playSound('lose');
		endRound('バースト — あなたの負け');
	}
}

function dealerPlay(){
	// simple dealer AI: hit until 17 or more
	while(scoreHand(dealerHand)<17){ dealCard(dealerHand); }
}

function endRound(msg){
	inRound = false; dealerPlay(); renderHands(false);
	const pScore = scoreHand(playerHand); const dScore = scoreHand(dealerHand);
	let result = msg;
	if(!msg){
		if(pScore>21) result='バースト — あなたの負け';
		else if(dScore>21) result='ディーラーがバースト — あなたの勝ち';
		else if(pScore> dScore) result='あなたの勝ち';
		else if(pScore===dScore) result='引き分け';
		else result='あなたの負け';
	}
	if(result.includes('勝ち')) playSound('win'); else if(result.includes('負け')) playSound('lose');
	log(result + ` (あなた ${pScore} - ディーラー ${dScore})`);
}

bjNew?.addEventListener('click', ()=> startRound());
bjHit?.addEventListener('click', ()=> playerHit());
bjStand?.addEventListener('click', ()=>{ if(!inRound) return; endRound(); });

// footer year
document.getElementById('year').textContent = new Date().getFullYear();

