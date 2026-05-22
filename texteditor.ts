interface EditorState {
  getLabel(): string;
  onInput(editor: Editor): EditorState;
  onSave(editor: Editor): EditorState;
}

class CleanUnsaved implements EditorState {
  getLabel(): string {
    return "_";
  }
  onInput(_editor: Editor): EditorState {
    return new DirtyUnsaved();
  }
  onSave(editor: Editor): EditorState {
    const filename = promptFilename();
    if (!filename) return this;
    localStorage.setItem(filename, editor.getContent());
    return new CleanSaved(filename);
  }
}

class CleanSaved implements EditorState {
  constructor(private filename: string) {}
  getLabel(): string {
    return this.filename;
  }
  onInput(_editor: Editor): EditorState {
    return new DirtySaved(this.filename);
  }
  onSave(editor: Editor): EditorState {
    localStorage.setItem(this.filename, editor.getContent());
    return new CleanSaved(this.filename);
  }
}

class DirtyUnsaved implements EditorState {
  getLabel(): string {
    return "*";
  }
  onInput(_editor: Editor): EditorState {
    return this;
  }
  onSave(editor: Editor): EditorState {
    const filename = promptFilename();
    if (!filename) return this;
    localStorage.setItem(filename, editor.getContent());
    return new CleanSaved(filename);
  }
}

class DirtySaved implements EditorState {
  constructor(private filename: string) {}
  getLabel(): string {
    return `${this.filename} *`;
  }
  onInput(_editor: Editor): EditorState {
    return this;
  }
  onSave(editor: Editor): EditorState {
    localStorage.setItem(this.filename, editor.getContent());
    return new CleanSaved(this.filename);
  }
}

class Editor {
  private state: EditorState = new CleanUnsaved();
  constructor(private textArea: HTMLTextAreaElement) {}

  getContent(): string {
    return this.textArea.value;
  }

  setContent(value: string) {
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

  loadFile(filename: string) {
    this.setContent(localStorage.getItem(filename) || "");
    this.transitionTo(new CleanSaved(filename));
  }

  private transitionTo(next: EditorState) {
    this.state = next;
    setStateLabel(this.state.getLabel());
  }
}

function promptFilename(): string | null {
  let filename = prompt("Enter a File Name", "");
  if (!filename || filename.trim() === "") return null;
  if (!filename.endsWith(".txt")) filename = filename + ".txt";
  return filename;
}

const textArea = document.getElementById("text") as HTMLTextAreaElement;
const editor = new Editor(textArea);

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

function setStateLabel(value: string) {
  const stateLabel = document.getElementById("state-label");
  if (stateLabel) {
    stateLabel.innerText = value;
  }
}

function showFiles(files: string[], parentId: string) {
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

function listFiles(): string[] {
  const files: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    files.push(localStorage.key(i) || "");
  }
  return files;
}
