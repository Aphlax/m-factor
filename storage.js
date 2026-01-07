import {COLOR} from './ui-properties.js';

const DB = "m-factor",
    VERSION = 2;

const STORAGE = {
  saves: "saves",
  settings: "settings",
};

const MODE = {
  initial: 0,
  ready: 1,
  saving: 2,
  loading: 3,
  error: 4,
};

function Storage(game) {
  this.game = game;
  this.db = undefined;
  this.dbReady = undefined;
  
  this.mode = MODE.initial;
  this.lastError = undefined;
}

Storage.prototype.initialize = function() {
  const request = indexedDB.open(DB, VERSION);
  
  request.onerror = e => {
    console.log(this.lastError = e.target);
    this.mode = MODE.error;
  };
  
  request.onupgradeneeded = e => {
    const db = e.target.result;

    if (!db.objectStoreNames.contains(STORAGE.saves)) {
      db.createObjectStore(STORAGE.saves, {keyPath: "name"});
    }
    if (!db.objectStoreNames.contains(STORAGE.settings)) {
      db.createObjectStore(STORAGE.settings, {keyPath: "name"});
    }
  };
  
  request.onsuccess = e => {
    this.db = e.target.result;
    this.mode = MODE.ready;
    if (this.dbReady) this.dbReady();
  };
};

Storage.prototype.save = function(storage, save) {
  if (this.mode != MODE.ready) return;
  if (!storage) throw new Error("Invalid storage.")
  if (save.name === undefined) throw new Error("Invalid name.")
  this.mode = MODE.saving;
  const transaction = this.db.transaction([storage], "readwrite");
  
  transaction.objectStore(storage).put(save);
  
  transaction.onerror = e => {
    console.log(this.lastError = e.target);
    this.mode = MODE.error;
  };
  
  transaction.oncomplete = e => {
    this.mode = MODE.ready;
  };
};

Storage.prototype.load = function(storage, name) {
  if (this.mode != MODE.ready) return;
  if (!storage) throw new Error("Invalid storage.")
  this.mode = MODE.loading;
  return new Promise(res => {
    const transaction = this.db.transaction([storage]);
    const request = transaction.objectStore(storage)
        .get(name);
        
    request.onsuccess = e => {
      if (!request.result) {
        console.log(this.lastError =
            "Error: Key (" + name + ") does not exist.");
        this.mode = MODE.error;
        return;
      }
      this.mode = MODE.ready;
      res(request.result);
    };
    
    transaction.onerror = e => {
      console.log(this.lastError = e.target);
      this.mode = MODE.error;
    };
  });
};

/** Actual public settings object with default values. */
const SETTINGS = {
  altMode: true,
  debugInfo: false,
  debugBelts: false,
  debugPipes: false,
  debugPoles: false,
  godMode: false,
};

Storage.prototype.loadSettings = function() {
  this.dbReady = () => {
    this.mode = MODE.loading;
    const transaction = this.db.transaction([STORAGE.settings]);
    const request = transaction.objectStore(STORAGE.settings)
        .getAll();
    
    request.onsuccess = e => {
      for (let res of request.result) {
        if (res.name == "altMode") {
          SETTINGS.altMode = res.value;
        } else if (res.name == "debugInfo") {
          SETTINGS.debugInfo = res.value;
        } else if (res.name == "debugBelts") {
          SETTINGS.debugBelts = res.value;
        } else if (res.name == "debugPipes") {
          SETTINGS.debugPipes = res.value;
        } else if (res.name == "debugPoles") {
          SETTINGS.debugPoles = res.value;
        } else if (res.name == "godMode") {
          SETTINGS.godMode = res.value;
        }
      }
      this.mode = MODE.ready;
    };
    
    transaction.onerror = e => {
      console.log(this.lastError = e.target);
      this.mode = MODE.error;
    };
  };
  if (this.db) this.dbReady();
  
  return SETTINGS;
};

Storage.prototype.draw = function(ctx, time) {
  if (this.mode == MODE.ready) return;
  
  const x = ctx.canvas.width / 2;
  const y = ctx.canvas.height - 110;
  
  ctx.beginPath();
  ctx.arc(x + 50, y, 22, 3 / 2 * Math.PI, Math.PI / 2);
  ctx.arc(x - 50, y, 22, Math.PI / 2, 3 / 2 * Math.PI);
  ctx.fillStyle = COLOR.background2;
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = COLOR.border1;
  ctx.stroke();
  
  let textCenter = 0;
  if (this.mode == MODE.initial ||
      this.mode == MODE.saving ||
      this.mode == MODE.loading) {
    const a = time / 300,
        l = 0.5 * Math.sin(time / 250) + 1.5;
    ctx.beginPath();
    ctx.arc(x - 50, y, 13, a - l, a + l);
    ctx.strokeStyle = COLOR.progressBar;
    ctx.lineWidth = 5;
    ctx.stroke();
    textCenter = 16;
  }
  
  let text = "";
  if (this.mode == MODE.initial) {
    text = "Setup";
  } else if (this.mode == MODE.saving) {
    text = "Saving";
  } else if (this.mode == MODE.loading) {
    text = "Loading";
  } else if (this.mode == MODE.error) {
    text = "Error";
  }
  ctx.font = "18px monospace";
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillStyle = COLOR.primary;
  ctx.fillText(text, x + textCenter, y);
  ctx.textAlign = "start";
};

export {Storage, STORAGE, SETTINGS};
