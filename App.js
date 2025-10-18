const STORAGE_KEY = 'blocNotasPro';
function getNotes() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}
function setNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
const notesList = document.getElementById('notesList');
const noteTitle = document.getElementById('noteTitle');
const noteArea = document.getElementById('noteArea');
const saveBtn = document.getElementById('saveBtn');
const newNoteBtn = document.getElementById('newNoteBtn');
const deleteBtn = document.getElementById('deleteBtn');
const themeBtn = document.getElementById('themeBtn');
const status = document.getElementById('status');
const wordCount = document.getElementById('wordCount');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const searchNotes = document.getElementById('searchNotes');
let notes = [];
let currentNoteId = null;
function createNote(title = "Nueva nota", content = "") {
  return {
    id: Date.now().toString() + Math.random().toString(36).substring(2,7),
    title: title.trim() || "Sin título",
    content: content,
    updated: Date.now()
  };
}
function saveCurrentNote() {
  if (!currentNoteId) return;
  let note = notes.find(n => n.id === currentNoteId);
  note.title = noteTitle.value.trim() || "Sin título";
  note.content = noteArea.value;
  note.updated = Date.now();
  setNotes(notes);
  renderNotesList();
  updateStatus('Guardado ✔️');
  setTimeout(() => updateStatus('Listo'), 1200);
}
function deleteCurrentNote() {
  if (!currentNoteId) return;
  if (!confirm('¿Eliminar esta nota?')) return;
  notes = notes.filter(n => n.id !== currentNoteId);
  setNotes(notes);
  if (notes.length > 0) {
    currentNoteId = notes[0].id;
    renderCurrentNote();
  } else {
    currentNoteId = null;
    noteTitle.value = '';
    noteArea.value = '';
  }
  renderNotesList();
  updateStatus('Nota eliminada 🗑️');
}
function renderNotesList(filter="") {
  notesList.innerHTML = '';
  let filtered = notes.filter(n => n.title.toLowerCase().includes(filter.toLowerCase()));
  filtered.sort((a, b) => b.updated - a.updated);
  filtered.forEach(note => {
    let li = document.createElement('li');
    li.className = currentNoteId === note.id ? 'active' : '';
    li.textContent = note.title;
    li.title = "Hacer clic para ver";
    // Rename button
    let renameBtn = document.createElement('button');
    renameBtn.className = 'rename-btn';
    renameBtn.innerText = '✏️';
    renameBtn.title = "Renombrar nota";
    renameBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      renameNotePrompt(note.id);
    });
    li.appendChild(renameBtn);
    li.addEventListener('click', () => {
      if (note.id !== currentNoteId) {
        saveCurrentNote();
        currentNoteId = note.id;
        renderCurrentNote();
        renderNotesList(searchNotes.value);
      }
    });
    notesList.appendChild(li);
  });
  if (!filtered.length) {
    let li = document.createElement('li');
    li.textContent = "No hay notas";
    li.style.opacity = "0.66";
    notesList.appendChild(li);
  }
}
function renderCurrentNote() {
  let note = notes.find(n => n.id === currentNoteId);
  if (!note) {
    noteTitle.value = '';
    noteArea.value = '';
    wordCount.textContent = '0 palabras, 0 caracteres';
    return;
  }
  noteTitle.value = note.title;
  noteArea.value = note.content;
  updateWordCount();
}
function updateStatus(msg) {
  status.textContent = msg;
}
function updateWordCount() {
  let text = noteArea.value;
  let wordLen = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
  let charLen = text.length;
  wordCount.textContent = `${wordLen} palabra${wordLen!==1?'s':''}, ${charLen} caracter${charLen!==1?'es':''}`;
}
function addNewNote() {
  saveCurrentNote();
  let newN = createNote();
  notes.unshift(newN);
  currentNoteId = newN.id;
  setNotes(notes);
  renderNotesList(searchNotes.value);
  renderCurrentNote();
  noteTitle.focus();
  updateStatus('Nota nueva creada ✨');
}
function renameNotePrompt(id) {
  let note = notes.find(n => n.id === id);
  let newTitle = prompt("Nuevo título para la nota:", note.title);
  if (newTitle !== null && newTitle.trim() !== "") {
    note.title = newTitle.trim();
    note.updated = Date.now();
    setNotes(notes);
    renderNotesList(searchNotes.value);
    if (id === currentNoteId) {
      renderCurrentNote();
    }
    updateStatus("Nota renombrada ✏️");
  }
}
function exportNote() {
  if (!currentNoteId) return;
  let note = notes.find(n => n.id === currentNoteId);
  let blob = new Blob([note.content], { type: "text/plain" });
  let a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (note.title.replace(/[^a-z0-9]/gi,'_').toLowerCase() || "nota") + ".txt";
  a.click();
  updateStatus('Nota exportada 📥');
}
function importNoteFile(e) {
  let file = e.target.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = function(evt) {
    addNewNote();
    noteArea.value = evt.target.result;
    saveCurrentNote();
    updateWordCount();
    updateStatus('Nota importada 📤');
  }
  reader.readAsText(file, 'UTF-8');
}
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', importNoteFile);
searchNotes.addEventListener('input', () => renderNotesList(searchNotes.value));
function toggleTheme() {
  document.body.classList.toggle('light');
  themeBtn.textContent = document.body.classList.contains('light') ? '🌞' : '🌙';
  localStorage.setItem('blocNotasProTheme', document.body.classList.contains('light') ? 'light' : 'dark');
}
themeBtn.addEventListener('click', toggleTheme);
saveBtn.addEventListener('click', saveCurrentNote);
newNoteBtn.addEventListener('click', addNewNote);
deleteBtn.addEventListener('click', deleteCurrentNote);
exportBtn.addEventListener('click', exportNote);
noteTitle.addEventListener('input', saveCurrentNote);
noteArea.addEventListener('input', () => {
  saveCurrentNote();
  updateWordCount();
});
noteArea.addEventListener('keyup', updateWordCount);
// Ctrl+S para guardar
window.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    saveCurrentNote();
  }
});
window.addEventListener('DOMContentLoaded', () => {
  // Theme
  if (localStorage.getItem('blocNotasProTheme') === 'light') {
    document.body.classList.add('light');
    themeBtn.textContent = '🌞';
  }
  // Load notes
  notes = getNotes();
  if (!notes.length) {
    notes = [createNote('Bienvenida', '¡Bienvenido/a a tu Bloc de Notas!\n\n- Podés crear, renombrar, eliminar y buscar tus notas.\n- Usá el botón de la luna para cambiar de tema.\n- Exportá o importa notas en TXT.\n- ¡Disfrutá!')];
    setNotes(notes);
  }
  currentNoteId = notes[0].id;
  renderNotesList();
  renderCurrentNote();
  updateStatus('Listo');
  updateWordCount();
});