import Storage from './storage.js';
import Author from './author.js';
import Learn from './learn.js';

const storage = new Storage();
const author = new Author(storage);
const learn = new Learn(storage);

function show(view){
  document.querySelectorAll('.view').forEach(v=>v.classList.add('d-none'));
  document.getElementById('view-'+view).classList.remove('d-none');
}

document.getElementById('btn-library').onclick = ()=> { renderLibrary(); show('library'); };
document.getElementById('btn-author').onclick = ()=> { author.loadEmpty(); show('author'); };
document.getElementById('btn-learn').onclick = ()=> { learn.renderSelect(); show('learn'); };
document.getElementById('btn-new').onclick = ()=> { author.loadEmpty(); show('author'); };
document.getElementById('btn-import').onclick = ()=> document.getElementById('file-import').click();
document.getElementById('file-import').addEventListener('change', async (e)=> { await storage.importFile(e.target.files[0]); renderLibrary(); });

function renderLibrary(){
  const grid = document.getElementById('library-grid');
  const index = storage.getIndex();
  grid.innerHTML = '';
  if(index.length === 0){
    grid.innerHTML = '<p class="text-muted">No capsules yet. Create one using Author.</p>';
    return;
  }
  index.forEach(c => {

    const progress = JSON.parse(localStorage.getItem('pc_progress_' + c.id) || '{}');
    const bestScore = progress.bestScore || 0;
    const knownCount = (progress.knownFlashcards || []).length;
    const totalCards = c.flashcardCount || 0;
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card bg-black text-light card-compact p-3 h-100">
            <div class="d-flex justify-content-between">
                <div>
                    <h5>${escapeHtml(c.title)}</h5>
                    <div class="title">${escapeHtml(c.subject||'')} · ${escapeHtml(c.level)}</div>
                    <div class="title">Updated ${new Date(c.updatedAt).toLocaleString()}</div>
                    <div class="mt-3">
                    <div class="progress-label mb-1">Quiz best: ${bestScore}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width:${bestScore}%;"></div>
                    </div>
                    <div class="known mt-3">Known cards: ${knownCount} / ${totalCards}</div>
                </div>
                </div>
                <div class="d-flex flex-column mt-4 gap-2">
                    <button class="btn btn-sm btn-success" data-action="learn" data-id="${c.id}">Learn</button>
                    <button class="btn btn-sm btn-outline-light" data-action="edit" data-id="${c.id}">Edit</button>
                    <button class="btn btn-sm btn-outline-info" data-action="export" data-id="${c.id}">Export</button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${c.id}">Delete</button>
                </div>
            </div>
        </div>
    `;
    grid.appendChild(col);
  });
  grid.querySelectorAll('button').forEach(btn=> btn.addEventListener('click', (e)=>{
    const id = btn.dataset.id;
    const act = btn.dataset.action;
    if(act==='learn'){ learn.open(id); show('learn'); }
    if(act==='edit'){ author.loadForEdit(id); show('author'); }
    if(act==='export'){ storage.exportCapsule(id); }
    if(act==='delete'){ if(confirm('Delete capsule?')){ storage.deleteCapsule(id); renderLibrary(); } }
  }));
}

function escapeHtml(s){ return String(s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

// initial render
renderLibrary();
