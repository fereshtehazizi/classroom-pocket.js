export default class Learn {
  constructor(storage){ this.storage = storage; this.current = null; this.known = new Set(); this.bind(); this.tab='notes'; }
  bind(){
    this.select = document.getElementById('learn-select');
    this.area = document.getElementById('learn-area');
    document.getElementById('learn-tabs').addEventListener('click', (e)=>{
      if(e.target.dataset.tab){ this.tab = e.target.dataset.tab; this.render(); document.querySelectorAll('#learn-tabs .nav-link').forEach(n=>n.classList.remove('active')); e.target.classList.add('active'); }
    });
    this.select.addEventListener('change', ()=>{ this.open(this.select.value); });
    // keyboard shortcuts
  window.addEventListener('keydown', (e) => {
  // if the user is typing in an input or textarea, ignore it ^_^
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

  if (e.key === ' ' && this.tab === 'flashcards') {
    e.preventDefault();
    this.flipCard && this.flipCard();
  }

  // Left arrow → switch to previous tab
  if (e.key === 'ArrowLeft') {
    if (this.tab === 'flashcards') this.switchTab('notes');
    else if (this.tab === 'quiz') this.switchTab('flashcards');
  }

  // Right arrow → switch to next tab
  if (e.key === 'ArrowRight') {
    if (this.tab === 'notes') this.switchTab('flashcards');
    else if (this.tab === 'flashcards') this.switchTab('quiz');
  }
});
  }
  switchTab(t){ document.querySelectorAll('#learn-tabs .nav-link').forEach(n=>n.classList.remove('active')); const btn = Array.from(document.querySelectorAll('#learn-tabs .nav-link')).find(b=>b.dataset.tab===t); if(btn) btn.classList.add('active'); this.tab=t; this.render(); }
  renderSelect(){
    const idx = this.storage.getIndex();
    this.select.innerHTML = '<option value="">choose a capsule</option>';
    idx.forEach(i=> this.select.innerHTML += `<option value="${i.id}">${escapeHtml(i.title)}</option>`);
  }
  open(id){
    if(!id) return;
    const c = this.storage.loadCapsule(id);
    if(!c) return alert('Not found');
    this.current = c;
    // load known set from localStorage progress
    try{ const p = JSON.parse(localStorage.getItem('pc_progress_'+id) || '{}'); this.known = new Set(p.knownFlashcards || []); }catch(e){ this.known = new Set(); }
    this.render();
    // set meta
    document.getElementById('learn-meta').innerHTML = `<div class="small-muted">${escapeHtml(c.subject||'')} · ${escapeHtml(c.level)} <br> ${escapeHtml(c.description)}</div>`;
    this.select.value = id;
  }
  render(){
    if(!this.current) return this.area.innerHTML = '<p class="text-muted">Select a capsule.</p>';
    if(this.tab==='notes') return this.renderNotes();
    if(this.tab==='flashcards') return this.renderFlashcards();
    if(this.tab==='quiz') return this.renderQuiz();
  }
  renderNotes(){
    const notes = this.current.notes || [];
    this.area.innerHTML = `
      <div><p id="notes-p" class="mb-2" style="font-size: 14px; color: #bd20bdff">Your notes are shown here.( ´･･)ﾉ(._.)</p></div>
      <ol id="notes-list">${notes.map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ol>
    `;
    document.getElementById('notes-p').addEventListener('p', (e)=>{
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('#notes-list li').forEach(li=> li.style.display = li.textContent.toLowerCase().includes(q)?'list-item':'none');
    });
  }
  renderFlashcards() {
  const cards = this.current.flashcards || [];
  if (cards.length === 0) {
    this.area.innerHTML = '<p class="text-muted">No flashcards.</p>';
    return;
  }

  this.index = 0;
  this.area.innerHTML = `
    <div class="d-flex justify-content-start"><span class="text-secondary" style="font-size: 14px;">press space to flip the card | click on the flashcard to flip</span></div>
    <div id="fc-wrap" class="flashcard-wrap mx-auto mt-3" style="width: 90%; height: 240px; perspective: 1000px;">
      <div class="flashcard-inner text-center position-relative w-100 h-100 transition-transform duration-500"></div>
    </div>

    <div class="mt-3 d-flex gap-2 justify-content-between">
    <div>
      <button id="fc-prev" class="mar-5 btn btn-sm btn-outline-light">← Prev</button>
      <button id="fc-next" class="mar-5 btn btn-sm btn-outline-light">Next →</button>
      <button id="fc-known" class="mar-5 btn btn-sm btn-success">Known</button>
      <button id="fc-unknown" class="mar-5 btn btn-sm btn-warning">Unknown</button>
      </div>
      <div class="text-start mt-2 small-muted">Known:
      <span id="known-count">${this.known.size}</span> / ${cards.length}
    </div>
    </div>
  `;

  this.renderCard();

  document.getElementById('fc-prev').onclick = () => {
    this.index = (this.index - 1 + cards.length) % cards.length;
    this.renderCard();
  };
  document.getElementById('fc-next').onclick = () => {
    this.index = (this.index + 1) % cards.length;
    this.renderCard();
  };
  document.getElementById('fc-known').onclick = () => {
    this.known.add(this.index);
    this.saveProgress();
    this.updateKnownCount();
  };
  document.getElementById('fc-unknown').onclick = () => {
    this.known.delete(this.index);
    this.saveProgress();
    this.updateKnownCount();
  };

  // Space key flip handler
  this.flipCard = () => {
    const inner = document.querySelector('.flashcard-inner');
    inner.classList.toggle('flipped');
  };

  const fcWrap = document.getElementById('fc-wrap');
fcWrap.addEventListener('click', () => this.flipCard());

}

renderCard() {
  const card = this.current.flashcards[this.index];
  const inner = document.querySelector('.flashcard-inner');
  inner.innerHTML = `
    <div class="flashcard-face flashcard-front bg-black text-light d-flex align-items-center justify-content-center p-3 rounded position-absolute w-100 h-100 backface-hidden">
      ${escapeHtml(card.front || '')}
    </div>
    <div class="flashcard-face flashcard-back bg-black text-light d-flex align-items-center justify-content-center p-3 rounded position-absolute w-100 h-100 backface-hidden rotated">
      ${escapeHtml(card.back || '')}
    </div>
  `;
  inner.classList.remove('flipped');
  this.updateKnownCount();
}

  updateKnownCount(){ document.getElementById('known-count').textContent = this.known.size; }
  saveProgress(){ localStorage.setItem('pc_progress_'+this.current.id, JSON.stringify({ knownFlashcards: Array.from(this.known) })); }
  renderQuiz(){
    const questions = this.current.quiz || [];
    if(questions.length===0){ this.area.innerHTML = '<p class="text-muted">No quiz questions.</p>'; return; }
    this.qIndex = 0; this.correct = 0;
    this.area.innerHTML = '<div id="quiz-wrap"></div>';
    this.showQuestion();
  }
  showQuestion(){
    const q = this.current.quiz[this.qIndex];
    const wrap = document.getElementById('quiz-wrap');
    wrap.innerHTML = `
      <div><strong>Q${this.qIndex+1}.</strong> ${escapeHtml(q.q)}</div>
      <div class="mt-2">${q.choices.map((c,i)=>`<button class="btn btn-outline-light m-1 choice" data-i="${i}">${escapeHtml(c)}</button>`).join('')}</div>
      <div class="mt-2 small-muted">Progress: ${this.qIndex+1} / ${this.current.quiz.length}</div>
    `;
    wrap.querySelectorAll('.choice').forEach(b=> b.addEventListener('click', (e)=> this.answer(parseInt(e.target.dataset.i))));
  }
  answer(choice){
    const q = this.current.quiz[this.qIndex];
    const correct = q.correct;
    const wrap = document.getElementById('quiz-wrap');
    if(choice===correct){ this.correct++; wrap.innerHTML += '<div class="mt-2 text-success">Correct</div>'; } else { wrap.innerHTML += `<div class="mt-2 text-danger">Incorrect - correct: ${escapeHtml(q.choices[correct]||'')} <br> <span class="text-light"> Reason: ${escapeHtml(q.explanation)}</span></div>`; }
    setTimeout(()=>{ this.qIndex++; if(this.qIndex>=this.current.quiz.length) this.finishQuiz(); else this.showQuestion(); }, 1500);
  }
  finishQuiz(){
    const score = Math.round((this.correct / this.current.quiz.length)*100);
    // save best score
    const pid = 'pc_progress_'+this.current.id;
    const prev = JSON.parse(localStorage.getItem(pid) || '{}');
    if(!prev.bestScore || score>prev.bestScore) prev.bestScore = score;
    localStorage.setItem(pid, JSON.stringify(prev));
    this.area.innerHTML = `<div class="h4">Score: ${score}%</div><div class="small-muted">Best: ${prev.bestScore}%</div>`;
  }
}

function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
