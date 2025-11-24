// super_combo_100_videos_ui/module.js  (VERSÃO B - UI PREMIUM)
// Objetivo: renderizar Categorias -> Receitas com visual premium, responsivo e animado.
// Contrato com o index:
// - exporta: function mount(container, ctx)
// - ctx:
//    - ctx.email
//    - ctx.products
//    - ctx.deliverableKey  -> "super_combo_100_videos_ui" (ou o que você setar no produto)
//    - ctx.openDriveModal(url, title)
//    - ctx.toDrivePreview(url)

const BASE_DELIVERABLE = "super_combo_100_videos";

/* ============================================================
   HELPERS
============================================================ */
const el = (root, s) => root.querySelector(s);
const create = (tag, cls) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  return n;
};

function safeLower(v){ return (v || "").toString().toLowerCase(); }

function toDrivePreview(url, ctx){
  if (!url) return "";
  if (ctx && typeof ctx.toDrivePreview === "function") return ctx.toDrivePreview(url);
  if (url.includes("/preview")) return url;
  if (url.includes("/view")) return url.replace("/view", "/preview");
  return url;
}

// Drive image uc?export=view
function toDriveImage(url){
  if (!url) return "";
  try{
    const u = new URL(url);
    if (!u.hostname.includes("drive.google.com")) return url;
    let id = null;
    const m1 = url.match(/\/file\/d\/([^/]+)/);
    if (m1) id = m1[1];
    if (!id && u.searchParams.get("id")) id = u.searchParams.get("id");
    if (!id) return url;
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }catch(e){
    return url;
  }
}

function pickThumb(item){
  return (
    item.thumbnail ||
    item.imagem ||
    item.capa ||
    item.cover_image_url ||
    item.thumb ||
    ""
  );
}
function pickName(item){
  return item.name || item.nome || "Item";
}
function pickDesc(item){
  return item.descricao || item.description || "";
}
function pickVideo(item){
  return item.video || item.video_link || item.drive_video || null;
}
function pickEbook(item){
  return item.ebook || item.link || item.drive_link || null;
}
function classifyItem(item){
  if (pickVideo(item)) return "video";
  if (pickEbook(item)) return "ebook";
  const t = safeLower(item.type || item.tipo);
  if (t.includes("video")) return "video";
  return "ebook";
}

/* ============================================================
   IMPORT BASE MODULE (VERSÃO A)
   - precisa para pegar ctx.comboFlattened com categoria pronta
============================================================ */
async function importBaseModule(){
  const paths = [
    `/${BASE_DELIVERABLE}/module.js`,
    `../${BASE_DELIVERABLE}/module.js`,
    `./${BASE_DELIVERABLE}/module.js`,
    `modules/${BASE_DELIVERABLE}/module.js`,
    `../modules/${BASE_DELIVERABLE}/module.js`,
  ];

  let lastErr = null;
  for (const p of paths){
    try {
      const mod = await import(p);
      return mod;
    } catch (e){
      lastErr = e;
    }
  }
  console.error("❌ Não consegui importar base module:", lastErr);
  return null;
}

/* ============================================================
   UI STYLES (premium + animações)
============================================================ */
function injectStyles(container){
  if (container.__comboStylesInjected) return;
  container.__comboStylesInjected = true;

  const style = create("style");
  style.textContent = `
  .sc-root{
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Inter, Arial, sans-serif;
    color:#0f2024;
    display:grid;
    gap:16px;
  }

  /* top bar interno */
  .sc-top{
    display:flex; align-items:center; justify-content:space-between; gap:12px;
    padding:8px 2px;
  }
  .sc-title{
    font-size: clamp(18px, 3vw, 22px);
    font-weight: 900;
    letter-spacing: .2px;
  }
  .sc-sub{
    color:#6a7a80; font-size:13px;
  }

  /* grid categorias */
  .sc-grid{
    display:grid; gap:14px;
    grid-template-columns: 1fr;
  }
  @media (min-width:540px){
    .sc-grid{ grid-template-columns: repeat(2,1fr); }
  }
  @media (min-width:920px){
    .sc-grid{ grid-template-columns: repeat(3,1fr); }
  }

  .sc-card{
    background:#fff;
    border-radius:18px;
    overflow:hidden;
    box-shadow: 0 10px 26px rgba(3,41,48,.10);
    cursor:pointer;
    transform: translateY(0);
    transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
    display:flex; flex-direction:column;
  }
  .sc-card:hover{
    transform: translateY(-3px);
    box-shadow: 0 16px 34px rgba(3,41,48,.16);
    filter: saturate(1.02);
  }
  .sc-thumb{
    width:100%;
    aspect-ratio: 16/9;
    object-fit:cover;
    background:#eaf1f3;
  }
  .sc-body{
    padding:12px 14px 14px;
    display:grid; gap:6px;
    text-align:center;
  }
  .sc-h3{
    font-size:18px;
    font-weight:900;
    letter-spacing:.2px;
  }
  .sc-desc{
    font-size:13px; color:#6a7a80;
  }
  .sc-meta{
    margin-top:4px;
    font-size:11px;
    font-weight:800;
    letter-spacing:.12em;
    text-transform:uppercase;
    color:#0a6e80;
  }

  /* receitas view */
  .sc-back{
    border:0; background:#e9f6f8; color:#054957;
    padding:9px 12px; border-radius:999px;
    font-weight:900; cursor:pointer;
    transition: filter .15s ease, transform .15s ease;
  }
  .sc-back:hover{ filter:brightness(.97); transform:translateY(-1px); }

  .sc-list{
    display:grid; gap:12px;
  }

  .sc-recipe{
    background:#fff;
    border-radius:18px;
    overflow:hidden;
    box-shadow: 0 10px 26px rgba(3,41,48,.10);
    display:grid;
    grid-template-columns: 1fr;
  }

  @media (min-width:700px){
    .sc-recipe{
      grid-template-columns: 240px 1fr;
      min-height:180px;
    }
  }

  .sc-recipe-thumb{
    width:100%;
    height:100%;
    min-height:160px;
    object-fit:cover;
    background:#eaf1f3;
  }
  .sc-recipe-body{
    padding:14px;
    display:grid; gap:8px;
    align-content:center;
  }
  .sc-recipe-title{
    font-size:16px; font-weight:900;
  }
  .sc-recipe-desc{
    font-size:13px; color:#6a7a80;
  }
  .sc-btnrow{
    display:flex; gap:8px; flex-wrap:wrap;
  }
  .sc-btn{
    border:0; cursor:pointer; font-weight:900;
    border-radius:10px; padding:9px 12px;
    background:#e9f6f8; color:#054957;
    transition: filter .15s ease, transform .15s ease;
  }
  .sc-btn:hover{ filter:brightness(.97); transform:translateY(-1px); }
  .sc-btn.primary{
    background: linear-gradient(90deg, #18b0c8 0%, #22d1e2 100%);
    color:#002e36;
  }

  /* animações leves */
  .fade-in{ animation: fadeIn .18s ease both; }
  @keyframes fadeIn{ from{opacity .4; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }

  .sc-empty{
    background:#fff; border-radius:16px; padding:14px;
    color:#7b8b90; font-size:14px; font-weight:700;
    box-shadow: 0 8px 20px rgba(3,41,48,.08);
  }
  `;
  container.appendChild(style);
}

/* ============================================================
   BUILD DATA -> categorias + receitas
============================================================ */
function groupByCategory(flatItems){
  // flatItems já vem com categoria/categoria_id/categoria_slug da base
  const map = new Map();

  flatItems.forEach(it => {
    const cat = it.categoria || "Outros";
    const key = it.categoria_slug || cat;
    if (!map.has(key)){
      map.set(key, {
        key,
        titulo: cat,
        slug: it.categoria_slug || key,
        id: it.categoria_id ?? null,
        imagemCategoria: it.imagemCategoria || null,
        items: []
      });
    }
    map.get(key).items.push(it);
  });

  // ordena por id se existir
  const arr = Array.from(map.values()).sort((a,b)=>{
    if (a.id == null || b.id == null) return a.titulo.localeCompare(b.titulo);
    return a.id - b.id;
  });

  return arr;
}

/* ============================================================
   RENDERERS
============================================================ */
function renderCategories(container, ctx, categories){
  container.innerHTML = "";
  const root = create("div","sc-root fade-in");

  const top = create("div","sc-top");
  const left = create("div");
  const title = create("div","sc-title");
  title.textContent = "Categorias do seu Combo";
  const sub = create("div","sc-sub");
  sub.textContent = "Escolha uma categoria para ver as receitas e materiais.";
  left.appendChild(title);
  left.appendChild(sub);
  top.appendChild(left);
  root.appendChild(top);

  const grid = create("div","sc-grid");
  categories.forEach(cat=>{
    const card = create("div","sc-card");

    const img = create("img","sc-thumb");
    // tenta imagemCategoria da base; se não tiver, pega thumb da primeira receita
    const thumbFallback = pickThumb(cat.items[0] || {});
    img.src = toDriveImage(cat.imagemCategoria || thumbFallback);
    card.appendChild(img);

    const body = create("div","sc-body");
    const h3 = create("div","sc-h3");
    h3.textContent = cat.titulo;

    const desc = create("div","sc-desc");
    // se a base não trouxe descricaoCurta, mostra “X receitas”
    const count = cat.items.length;
    desc.textContent = cat.descricaoCurta || `${count} itens liberados`;

    const meta = create("div","sc-meta");
    meta.textContent = `${count} receitas`;

    body.appendChild(h3);
    body.appendChild(desc);
    body.appendChild(meta);

    card.appendChild(body);

    card.onclick = () => renderRecipes(container, ctx, cat, categories);

    grid.appendChild(card);
  });

  root.appendChild(grid);
  container.appendChild(root);
}

function renderRecipes(container, ctx, cat, categories){
  container.innerHTML = "";
  const root = create("div","sc-root fade-in");

  const top = create("div","sc-top");
  const back = create("button","sc-back");
  back.textContent = "← Voltar";
  back.onclick = () => renderCategories(container, ctx, categories);

  const left = create("div");
  const title = create("div","sc-title");
  title.textContent = cat.titulo;
  const sub = create("div","sc-sub");
  sub.textContent = "Toque em assistir ou baixar o material.";
  left.appendChild(title);
  left.appendChild(sub);

  top.appendChild(back);
  top.appendChild(left);
  root.appendChild(top);

  const list = create("div","sc-list");

  // ordena por ordem se tiver, senão por nome
  const items = [...cat.items].sort((a,b)=>{
    if (a.ordem != null && b.ordem != null) return a.ordem - b.ordem;
    return pickName(a).localeCompare(pickName(b));
  });

  items.forEach(it=>{
    const card = create("div","sc-recipe");

    const img = create("img","sc-recipe-thumb");
    img.src = toDriveImage(pickThumb(it));
    card.appendChild(img);

    const body = create("div","sc-recipe-body");
    const h3 = create("div","sc-recipe-title");
    h3.textContent = pickName(it);

    const p = create("div","sc-recipe-desc");
    p.textContent = pickDesc(it);

    const row = create("div","sc-btnrow");

    const v = pickVideo(it);
    const e = pickEbook(it);

    if (v){
      const bv = create("button","sc-btn primary");
      bv.textContent = "Assistir vídeo";
      bv.onclick = () => ctx.openDriveModal(toDrivePreview(v, ctx), pickName(it));
      row.appendChild(bv);
    }

    if (e){
      const be = create("button","sc-btn");
      be.textContent = "Baixar e-book";
      be.onclick = () => ctx.openDriveModal(toDrivePreview(e, ctx), pickName(it));
      row.appendChild(be);
    }

    body.appendChild(h3);
    body.appendChild(p);
    body.appendChild(row);
    card.appendChild(body);

    list.appendChild(card);
  });

  if (!items.length){
    const empty = create("div","sc-empty");
    empty.textContent = "Nenhum item liberado nesta categoria.";
    list.appendChild(empty);
  }

  root.appendChild(list);
  container.appendChild(root);
}

/* ============================================================
   MAIN
============================================================ */
export async function mount(container, ctx){
  if (!container) return;
  injectStyles(container);

  // limpa e cria placeholder
  container.innerHTML = "";
  const loading = create("div","sc-empty fade-in");
  loading.textContent = "Carregando seu combo…";
  container.appendChild(loading);

  // valida posse do combo base
  const produtosDB = Array.isArray(ctx.products) ? ctx.products : [];
  const possuiBaseCombo = produtosDB.some(
    p => (p.deliverable_key || p.deliverableKey) === BASE_DELIVERABLE
  );

  if (!possuiBaseCombo){
    container.innerHTML = "";
    const empty = create("div","sc-empty fade-in");
    empty.textContent = "Este combo não está liberado para o seu e-mail.";
    container.appendChild(empty);
    return;
  }

  // importa base e popula ctx comboFlattened
  const baseMod = await importBaseModule();
  if (!baseMod || typeof baseMod.mount !== "function"){
    container.innerHTML = "";
    const empty = create("div","sc-empty fade-in");
    empty.textContent = "Não consegui carregar o módulo base do combo.";
    container.appendChild(empty);
    return;
  }

  // cria ctx auxiliar pra base montar dados (sem UI)
  const ctxAux = {
    email: ctx.email,
    products: produtosDB,
    deliverableKey: BASE_DELIVERABLE,
    openDriveModal: ctx.openDriveModal,
    toDrivePreview: ctx.toDrivePreview
  };

  try{
    baseMod.mount(null, ctxAux); // preenche comboFlattened
  }catch(e){
    console.error("❌ Base mount falhou:", e);
  }

  const flat = Array.isArray(ctxAux.comboFlattened) ? ctxAux.comboFlattened : [];

  // se base não trouxe categoria, cai pro plano B:
  // agrupa por nome de categoria vindo do item ou “E-books”
  const normalizedFlat = flat.map(it=>({
    ...it,
    categoria: it.categoria || (classifyItem(it)==="ebook" ? "E-books Especiais do Combo" : "Receitas do Combo"),
    categoria_slug: it.categoria_slug || safeLower(it.categoria || "combo"),
    categoria_id: it.categoria_id ?? null,
  }));

  const categories = groupByCategory(normalizedFlat);

  container.innerHTML = "";
  if (!categories.length){
    const empty = create("div","sc-empty fade-in");
    empty.textContent = "Nenhum item interno encontrado no combo.";
    container.appendChild(empty);
    return;
  }

  renderCategories(container, ctx, categories);
}
