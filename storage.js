export default class Storage {
  constructor(){
    this.indexKey = 'pc_capsules_index';
  }
  _saveIndex(idx){ localStorage.setItem(this.indexKey, JSON.stringify(idx)); }
  getIndex(){ try{ return JSON.parse(localStorage.getItem(this.indexKey)||'[]'); }catch(e){ return []; } }
  saveCapsule(obj){
    if(!obj.id) obj.id = Date.now().toString();
    obj.schema = 'pocket-classroom/v1';
    obj.updatedAt = new Date().toISOString();
    localStorage.setItem('pc_capsule_'+obj.id, JSON.stringify(obj));
    const idx = this.getIndex().filter(i=>i.id!==obj.id);
    idx.unshift({id: obj.id, title: obj.title, subject: obj.subject, level: obj.level, description: obj.description, updatedAt: obj.updatedAt, flashcardCount: (obj.flashcards || []).length, quizCount: (obj.quiz || []).length });
    this._saveIndex(idx);
  }
  loadCapsule(id){ try{ return JSON.parse(localStorage.getItem('pc_capsule_'+id)); }catch(e){ return null; } }
  deleteCapsule(id){ localStorage.removeItem('pc_capsule_'+id); const idx = this.getIndex().filter(i=>i.id!==id); this._saveIndex(idx); }
  exportCapsule(id){
    const cap = this.loadCapsule(id); if(!cap){ alert('Not found'); return; }
    const blob = new Blob([JSON.stringify(cap, null,2)], {type:'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (cap.title||'capsule')+'.json'; a.click();
  }
  async importFile(file){
    if(!file) return;
    const t = await file.text();
    try{
      const obj = JSON.parse(t);
      if(obj.schema!=='pocket-classroom/v1') throw new Error('Invalid schema');
      // generate new id
      obj.id = Date.now().toString();
      this.saveCapsule(obj);
      alert('Imported: '+obj.title);
    }catch(e){ alert('Import failed: '+e.message); }
  }
}
