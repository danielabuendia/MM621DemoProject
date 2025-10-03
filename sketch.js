// === Declaraciones que faltaban ===
let bg, SCENE_W, SCENE_H;

//Variables
let persons = [];
let hats = [];
let glasses = [];
let shirts = [];
let sweaters = [];
let jeans = [];
let shoes = [];

// índices: -1 = oculto (empieza sin ropa)
let iPerson = 0;
let iHat = -1;
let iGlasses = -1;
let iShirt = -1;
let iSweater = -1;
let iJeans = -1;
let iShoe = -1;

let factorModel = 0.85;
let offsetX = 45;
let offsetY = 60;

// Para evitar ReferenceError en keyPressed (si luego no la usas, puedes quitarla)
let editingCat = "";

let offsets = {
  persons: [],
  hats: [],
  glasses: [],
  shirts: [],
  sweaters: [],
  jeans: [],
  shoes: [],
};

function loadOffsets() {
  try {
    let raw = localStorage.getItem("outfitOffsets");
    if (raw) {
      let obj = JSON.parse(raw);
      for (let k in obj) offsets[k] = obj[k];
    }
  } catch {}
}
loadOffsets();

// ⚠️ FIX: usar siempre 'categoria' (antes escribías offsets[cat] y 'cat' no existe)
function ensureOffsets(categoria, n) {
  if (!offsets[categoria]) offsets[categoria] = [];
  for (let i = 0; i < n; i++) {
    if (!offsets[categoria][i]) offsets[categoria][i] = { dx: 0, dy: 0, s: 1 };
  }
}

function preload() {
  bg = loadImage("/images/IMG_8036.JPG", (img) => {
    SCENE_W = img.width;
    SCENE_H = img.height;
  });
  persons = loadBatch("person", 1, 3, "PNG");
  hats = loadBatch("gorro", 1, 4, "PNG");
  glasses = loadBatch("lentes", 1, 5, "PNG");
  shirts = loadBatch("shirt", 1, 9, "PNG");
  sweaters = loadBatch("sueter", 1, 5, "PNG");
  jeans = loadBatch("jeans", 1, 5, "PNG");
  shoes = loadBatch("shoe", 1, 4, "PNG");
}

function setup() {
  createCanvas(700, 900);
  noSmooth(); // opcional
  imageMode(CORNER);
  iPerson = floor(random(persons.length));
  iHat = iGlasses = iShirt = iSweater = iJeans = iShoe = -1;
}

function drawBackgroundCover(img) {
  let cw = width,
    ch = height;
  let iw = img.width,
    ih = img.height;

  // escalar
  let scale = Math.max(cw / iw, ch / ih);
  let w = iw * scale;
  let h = ih * scale;
  image(img, cw / 2, ch / 2, w, h);
}

function draw() {
  clear();

  let IW = SCENE_W || (bg ? bg.width : width);
  let IH = SCENE_H || (bg ? bg.height : height);

  let scale = Math.min(width / IW, height / IH);
  let drawW = IW * scale;
  let drawH = IH * scale;
  let ox = (width - drawW) / 2;
  let oy = (height - drawH) / 2;

  if (bg) image(bg, ox, oy, drawW, drawH);

  let drawOnModel = (img, dx = 0, dy = 0, scaleMul = 1) => {
    if (!img) return;
    image(
      img,
      ox + offsetX + dx,
      oy + offsetY + dy,
      drawW * factorModel * scaleMul,
      drawH * factorModel * scaleMul
    );
  };

  function drawWithOffsets(img, cat, idx) {
    if (!img || idx < 0) return;
    // si quieres mantener ensureOffsets, llama aquí:
    ensureOffsets(cat, idx + 1);
    let o = offsets[cat][idx] || { dx: 0, dy: 0, s: 1 };
    drawOnModel(img, o.dx, o.dy, o.s);
  }

  if (iPerson >= 0) drawWithOffsets(persons[iPerson], "persons", iPerson);
  if (iShoe >= 0) drawWithOffsets(shoes[iShoe], "shoes", iShoe); // ↓ abajo
  if (iJeans >= 0) drawWithOffsets(jeans[iJeans], "jeans", iJeans); // ↑ encima
  if (iShirt >= 0) drawWithOffsets(shirts[iShirt], "shirts", iShirt);
  if (iSweater >= 0) drawWithOffsets(sweaters[iSweater], "sweaters", iSweater);
  if (iGlasses >= 0) drawWithOffsets(glasses[iGlasses], "glasses", iGlasses);
  if (iHat >= 0) drawWithOffsets(hats[iHat], "hats", iHat);
}

// controles
function keyPressed() {
  if (key === " ") {
    saveCanvas("outfit", "png");
    return;
  }

  if (keyCode === UP_ARROW) {
    iHat = next(iHat, hats.length, +1);
    editingCat = "hats";
  }
  if (key === "w" || key === "W") {
    iGlasses = next(iGlasses, glasses.length, +1);
    editingCat = "glasses";
  }
  if (keyCode === DOWN_ARROW) {
    iJeans = next(iJeans, jeans.length, +1);
    editingCat = "jeans";
  }
  if (keyCode === LEFT_ARROW) {
    iShirt = next(iShirt, shirts.length, +1);
    editingCat = "shirts";
  }
  if (keyCode === RIGHT_ARROW) {
    iSweater = next(iSweater, sweaters.length, +1);
    editingCat = "sweaters";
  }
  if (key === "s" || key === "S") {
    iShoe = next(iShoe, shoes.length, +1);
    editingCat = "shoes";
  }

  if (key === "r" || key === "R") {
    iPerson = floor(random(persons.length));
    iHat = iGlasses = iShirt = iSweater = iJeans = iShoe = -1;
    editingCat = "persons";
    return;
  }
}

function loadBatch(prefix, from, to, ext) {
  let arr = [];
  for (let i = from; i <= to; i++) {
    arr.push(loadImage(`images/${prefix}${i}.${ext}`));
  }
  return arr;
}

function next(i, n, step) {
  if (n <= 0) return -1;
  if (i < 0) return 0;
  let k = i + step;
  while (k < 0) k += n;
  while (k >= n) k -= n;
  return k;
}
