export default class Author {
  constructor(storage) { this.storage = storage; this.editedId = null; this.bind(); }
  bind() {
    this.form = document.getElementById('author-form');
    this.title = document.getElementById('meta-title');
    this.subject = document.getElementById('meta-subject');
    this.level = document.getElementById('meta-level');
    this.description = document.getElementById('meta-description')
    this.notes = document.getElementById('meta-notes');
    this.flashcardsContainer = document.getElementById('flashcards-container');
    this.quizContainer = document.getElementById('quiz-container');
    document.getElementById('add-flashcard').onclick = () => this.addFlashcard();
    document.getElementById('add-question').onclick = () => this.addQuestion();
    document.getElementById('save-capsule').onclick = (e) => { e.preventDefault(); this.save(); };

    document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();

    // Only trigger save when in the Author section
    const authorView = document.getElementById('view-author');
    if (!authorView.classList.contains('d-none')) {
      document.getElementById('save-capsule').click();
    }
  }
});

  }
  loadEmpty() {
    this.editedId = null;
    this.title.value = ''; this.subject.value = ''; this.level.value = 'Beginner'; this.description.value = ''; this.notes.value = '';
    this.flashcardsContainer.innerHTML = ''; this.quizContainer.innerHTML = '';
  }
  loadForEdit(id) {
    const cap = this.storage.loadCapsule(id);
    if (!cap) return alert('Not found');
    this.editedId = id;
    this.title.value = cap.title || '';
    this.subject.value = cap.subject || '';
    this.level.value = cap.level || 'Beginner';
    this.description.value = (cap.description || '');
    this.notes.value = (cap.notes || []).join('\n');
    this.flashcardsContainer.innerHTML = '';
    (cap.flashcards || []).forEach(f => this.addFlashcard(f.front, f.back));
    this.quizContainer.innerHTML = '';
    (cap.quiz || []).forEach(q => this.addQuestion(q.q, q.choices, q.correct, q.explanation));
  }

  addFlashcard(front = '', back = '') {
    const div = document.createElement('div');
    div.className = 'flashcard-editor mb-3 p-3 border border-secondary rounded';

    div.innerHTML = `
    <div class="d-flex justify-content-between align-items-center mb-2">
      <small class="text-light">press ← / → to flip | Click buttons to flip</small>
      <div class="text-end">
        <i class="mar-5 fa-solid fa-play rotate px-4 btn border-secondary border-outline-0 text-light me-1 front-btn"></i>
          <i class="mar-5 fa-solid fa-play px-4 btn border-secondary border-outline-0 text-light back-btn"></i>
      </div>
    </div>
    <div class="position-relative">
      <textarea class="form-control fc-front mb-2 text-center bg-dark text-light border-secondary" 
        placeholder="Front" style="height:150px;">${escapeHtml(front)}</textarea>
      <textarea class="form-control fc-back mb-2 text-center bg-dark text-light border-secondary d-none" 
        placeholder="Back" style="height:150px;">${escapeHtml(back)}</textarea>
        <div class="text-end mt-2">
        <button class="btn btn-sm btn-outline-danger btn-remove">Remove</button>
        </div>
    </div>
  `;

    const frontInput = div.querySelector('.fc-front');
    const backInput = div.querySelector('.fc-back');
    const frontBtn = div.querySelector('.front-btn');
    const backBtn = div.querySelector('.back-btn');
    const removeBtn = div.querySelector('.btn-remove');

    // Show front/back
    const showFront = () => {
      frontInput.classList.remove('d-none');
      backInput.classList.add('d-none');
      frontInput.focus();
    };
    const showBack = () => {
      frontInput.classList.add('d-none');
      backInput.classList.remove('d-none');
      backInput.focus();
    };

    // Button handlers
    frontBtn.onclick = showFront;
    backBtn.onclick = showBack;
    removeBtn.onclick = () => div.remove();

    // Keyboard arrows
    div.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showFront(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showBack(); }
    });

    this.flashcardsContainer.appendChild(div);
    frontInput.focus();
  }

  addQuestion(q = '', choices = ['', '', '', ''], correct = 0, explanation = '') {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 7);
    const div = document.createElement('div'); div.className = 'mb-2 p-2 border rounded bg-dark border-secondary';
    div.innerHTML = `
      <div class="mb-1"><input class="form-control q-text text-light bg-dark border-secondary" placeholder="Question" value="${escapeHtml(q)}"></div>
      <div class="row g-1">
        <div class="col-md-3 col-6"><input class="form-control text-light bg-dark border-secondary choice" placeholder="A" value="${escapeHtml(choices[0] || '')}"></div>
        <div class="col-md-3 col-6"><input class="form-control text-light bg-dark border-secondary choice" placeholder="B" value="${escapeHtml(choices[1] || '')}"></div>
        <div class="col-md-3 col-6"><input class="form-control text-light bg-dark border-secondary choice" placeholder="C" value="${escapeHtml(choices[2] || '')}"></div>
        <div class="col-md-3 col-6"><input class="form-control text-light bg-dark border-secondary choice" placeholder="D" value="${escapeHtml(choices[3] || '')}"></div>
      </div>
      <div class="mt-2 row g-2">
      <div class="col-md-3 col-5">
        <label class="small-muted mb-2 label-t">Correct index (0-3)</label>
        <input type="number" min="0" max="3" class="form-control border-secondary bg-dark text-light w-100 correct-index" value="${escapeHtml(String(correct))}"></div>
        <div class="col-12 col-md-9">
        <label class="small-muted mb-2 label-t">Explanation</label>
        <input class="form-control border-secondary bg-dark text-light w-100" placeholder="the reason why it is correct ..." value="${escapeHtml(explanation)}"></div></div>
        <div class="mt-2 w-100 d-flex justify-content-end"><button class="btn btn-sm btn-outline-danger btn-remove">Remove</button></div>
    `;
    div.querySelector('.btn-remove').onclick = () => div.remove();
    this.quizContainer.appendChild(div);
  }
  save() {
    const title = this.title.value.trim();
    if (!title) return alert('Title required');
    const capsule = {
      id: this.editedId || undefined,
      title,
      subject: this.subject.value.trim(),
      level: this.level.value,
      description: this.description.value,
      notes: this.notes.value.split('\n').map(s => s.trim()).filter(Boolean),
      flashcards: Array.from(this.flashcardsContainer.querySelectorAll('.flashcard-editor')).map(div => ({
        front: div.querySelector('.fc-front').value.trim(),
        back: div.querySelector('.fc-back').value.trim()
      })).filter(f => f.front || f.back),
      quiz: Array.from(this.quizContainer.querySelectorAll('div.p-2')).map(d => {
  const choices = Array.from(d.querySelectorAll('.choice')).map(i => i.value);
  const explanationInput = d.querySelector('input[placeholder="the reason why it is correct ..."]');
  return {
    q: d.querySelector('.q-text').value,
    choices,
    correct: parseInt(d.querySelector('.correct-index').value) || 0,
    explanation: explanationInput ? explanationInput.value.trim() : ''
  };
}).filter(q => q.q && q.choices.some(Boolean))

    };
    if (!(capsule.notes.length || capsule.flashcards.length || capsule.quiz.length)) return alert('Add at least notes, flashcards or quiz');
    this.storage.saveCapsule(capsule);
    alert('Saved');
    // reload library view by dispatching a custom event
    document.getElementById('btn-library').click();
  }
}

function escapeHtml(s) { return String(s || '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;'); }
