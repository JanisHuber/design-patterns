// texteditor.ts
var CleanUnsaved = class {
  getLabel() {
    return "_";
  }
  onInput(_editor) {
    return new DirtyUnsaved();
  }
  onSave(editor2) {
    const filename = promptFilename();
    if (!filename) return this;
    localStorage.setItem(filename, editor2.getContent());
    return new CleanSaved(filename);
  }
};
var CleanSaved = class _CleanSaved {
  filename;
  constructor(filename) {
    this.filename = filename;
  }
  getLabel() {
    return this.filename;
  }
  onInput(_editor) {
    return new DirtySaved(this.filename);
  }
  onSave(editor2) {
    localStorage.setItem(this.filename, editor2.getContent());
    return new _CleanSaved(this.filename);
  }
};
var DirtyUnsaved = class {
  getLabel() {
    return "*";
  }
  onInput(_editor) {
    return this;
  }
  onSave(editor2) {
    const filename = promptFilename();
    if (!filename) return this;
    localStorage.setItem(filename, editor2.getContent());
    return new CleanSaved(filename);
  }
};
var DirtySaved = class {
  filename;
  constructor(filename) {
    this.filename = filename;
  }
  getLabel() {
    return `${this.filename} *`;
  }
  onInput(_editor) {
    return this;
  }
  onSave(editor2) {
    localStorage.setItem(this.filename, editor2.getContent());
    return new CleanSaved(this.filename);
  }
};
var Editor = class {
  textArea;
  state;
  constructor(textArea2) {
    this.textArea = textArea2;
    this.state = new CleanUnsaved();
  }
  getContent() {
    return this.textArea.value;
  }
  setContent(value) {
    this.textArea.value = value;
  }
  input() {
    this.transitionTo(this.state.onInput(this));
  }
  save() {
    this.transitionTo(this.state.onSave(this));
  }
  saveAs() {
    const filename = promptFilename();
    if (!filename) return;
    localStorage.setItem(filename, this.getContent());
    this.transitionTo(new CleanSaved(filename));
  }
  newDoc() {
    this.setContent("");
    this.transitionTo(new CleanUnsaved());
  }
  loadFile(filename) {
    this.setContent(localStorage.getItem(filename) || "");
    this.transitionTo(new CleanSaved(filename));
  }
  transitionTo(next) {
    this.state = next;
    setStateLabel(this.state.getLabel());
  }
};
function promptFilename() {
  let filename = prompt("Enter a File Name", "");
  if (!filename || filename.trim() === "") return null;
  if (!filename.endsWith(".txt")) filename = filename + ".txt";
  return filename;
}
var textArea = document.getElementById("text");
var editor = new Editor(textArea);
document.addEventListener("DOMContentLoaded", () => {
  showFiles(listFiles(), "files-list");
  textArea.addEventListener("input", () => editor.input());
  document.getElementById("save-as-button")?.addEventListener("click", () => {
    editor.saveAs();
    showFiles(listFiles(), "files-list");
  });
  document.getElementById("save-button")?.addEventListener("click", () => {
    editor.save();
    showFiles(listFiles(), "files-list");
  });
  document.getElementById("new-button")?.addEventListener("click", () => {
    editor.newDoc();
  });
  document.addEventListener("contextmenu", (event) => {
    alert("Wanna steal my source code, huh!?");
    event.preventDefault();
    return false;
  });
});
function setStateLabel(value) {
  const stateLabel = document.getElementById("state-label");
  if (stateLabel) {
    stateLabel.innerText = value;
  }
}
function showFiles(files, parentId) {
  const parent = document.getElementById(parentId);
  while (parent && parent.hasChildNodes() && parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
  for (const file of files) {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.innerHTML = file;
    item.appendChild(link);
    parent?.append(item);
    link.addEventListener("click", () => {
      editor.loadFile(file);
    });
  }
}
function listFiles() {
  const files = [];
  for (let i = 0; i < localStorage.length; i++) {
    files.push(localStorage.key(i) || "");
  }
  return files;
}
