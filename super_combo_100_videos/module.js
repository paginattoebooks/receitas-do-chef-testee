// super_combo_100_videos/module.js  (VERSÃO A - SEM UI)

/**
 * Módulo para o deliverable_key "super_combo_100_videos".
 *
 * Contrato com o index:
 * - exporta: function mount(container, ctx)
 * - ctx:
 *    - ctx.email
 *    - ctx.products
 *    - ctx.deliverableKey        -> "super_combo_100_videos"
 *    - ctx.openDriveModal(url, title)
 *    - ctx.toDrivePreview(url)
 *
 * VERSÃO A (SEM COMBO NA UI):
 * - este módulo NÃO renderiza nada.
 * - este módulo APENAS preenche:
 *    ctx.comboVideos    -> itens com video (video sempre ganha)
 *    ctx.combo    -> itens sem video e com ebook/link
 *    ctx.comboFlattened -> união das duas listas
 *
 * O index pega esses arrays e joga em "Meus Vídeos" / "Meus E-books".
 */

/* ===============================
   HELPERS
================================*/

/* Helper para imagem do Drive (se vier como /file/d/ID/view) */
function toDriveImage(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    if (!u.hostname.includes('drive.google.com')) return url;

    let id = null;
    const m1 = url.match(/\/file\/d\/([^/]+)/);
    if (m1) id = m1[1];
    if (!id && u.searchParams.get('id')) id = u.searchParams.get('id');
    if (!id) return url;

    return `https://drive.google.com/uc?export=view&id=${id}`;
  } catch (e) {
    return url;
  }
}

/* Preview do Drive (usa o ctx se existir) */
function toDrivePreview(url, ctx) {
  if (!url) return "";
  if (ctx && typeof ctx.toDrivePreview === "function") return ctx.toDrivePreview(url);

  if (url.includes("/preview")) return url;
  if (url.includes("/view")) return url.replace("/view", "/preview");
  return url;
}

/* Normaliza campos possíveis */
function pickThumb(item){
  return item.thumbnail || item.imagem || item.capa || item.cover_image_url || "";
}
function pickName(item){
  return item.name || item.nome || "Produto";
}
function pickDesc(item){
  return item.descricao || item.description || "";
}
function pickVideo(item){
  return item.video || item.video_link || item.drive_video || "";
}
function pickEbook(item){
  return item.ebook || item.link || item.drive_link || "";
}

/* ===============================
   DADOS DO COMBO
================================*/

/* ====== DEFINIÇÃO DAS CATEGORIAS (10) ====== */
const categorias = [
  {
    id: 0,
    slug: 'air_fryer',
    titulo: 'Air Fryer',
    descricaoCurta: 'Receitas modernas e práticas na fritadeira sem óleo.',
    imagemCategoria: 'https://drive.google.com/file/d/1yKZrYcvD_ku6nOmFfifVLMFkC04OaD-B/view?usp=drive_link',
  },
  {
    id: 1,
    slug: 'doces_sem_acucar',
    titulo: 'Doces sem Açúcar',
    descricaoCurta: 'Saudável e leve',
    imagemCategoria: 'https://drive.google.com/file/d/11uDv6HV-gSATp-d1LrWce08JM4KYTaVa/view?usp=drive_link',
  },
  {
    id: 2,
    slug: 'paes_e_roscas',
    titulo: 'Pães e Roscas',
    descricaoCurta: 'Caseiro e artesanal',
    imagemCategoria: 'https://drive.google.com/file/d/1JkvW1zdTijdDZYDQqTckV0q_eujQgdiH/view?usp=drive_link',
  },
  {
    id: 3,
    slug: 'bolos',
    titulo: 'Bolos',
    descricaoCurta: 'Gourmet e clássico',
    imagemCategoria: 'https://drive.google.com/file/d/1JaD6sEX6EV13TG01ZkscmCJf1cjVcoIO/view?usp=drive_link',
  },
  {
    id: 4,
    slug: 'massas_e_salgados',
    titulo: 'Massas e Salgados',
    descricaoCurta: 'Tradição e sabor',
    imagemCategoria: 'https://drive.google.com/file/d/13baDB_HNv8rfg_NGvpHkzHP_ZjYFdS26/view?usp=drive_link',
  },
  {
    id: 5,
    slug: 'molhos',
    titulo: 'Molhos',
    descricaoCurta: 'Refinado e versátil.',
    imagemCategoria: 'https://drive.google.com/file/d/15m-AtVxRvlYkNlrL7aHt-jr_-cEgTYD_/view?usp=drive_link',
  },
  {
    id: 6,
    slug: 'sushi',
    titulo: 'Sushi',
    descricaoCurta: 'Oriental e minimalista',
    imagemCategoria: 'https://drive.google.com/file/d/102MOS0EOlKoDNMaBFxLwTP4UQsDJiI4U/view?usp=drive_link',
  },
  {
    id: 7,
    slug: 'receitas_fit',
    titulo: 'Receitas Fit',
    descricaoCurta: 'Saudável e energética.',
    imagemCategoria: 'https://drive.google.com/file/d/13dJa_-_6Qdl5nRS_oE69dVV33s8sKAGn/view?usp=drive_link',
  },
  {
    id: 8,
    slug: 'top_10_noite_de_jantar',
    titulo: 'Top 10 Noite de Jantar',
    descricaoCurta: 'Sofisticado e intimista',
    imagemCategoria: 'https://drive.google.com/file/d/1_ik-qs45tNBtmRaJBQeqDik6o7TBV7UK/view?usp=drive_link',
  },
  {
    id: 9,
    slug: 'top_10_almoco_de_domingo',
    titulo: 'Top 10 Almoço de Domingo',
    descricaoCurta: 'Tradicional e acolhedor.',
    imagemCategoria: 'https://drive.google.com/file/d/1qf6hMZQcDRfAjNA3AhU8gEq-lXFMb1CE/view?usp=drive_link',
  },
];

/* ====== RECEITAS POR CATEGORIA (SEU BLOCO ORIGINAL) ====== */
const receitasPorCategoria = {
  0: [
    { nome:'Bolo de Laranja na Air Fryer', descricao:'Bolo fofinho com calda cítrica, feito inteiro na air fryer.', imagem:'https://drive.google.com/file/d/1Y4wBdu3-mobB-05pBw-6uw6bJwIIBsmI/view?usp=drive_link', video:'https://drive.google.com/file/d/1OSxkt3goIm8qYROuzfqKqS2JFza23ONX/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1rdIVtAZ8CU1yglsqIDBtjt3mYWKmwxrv/view?usp=drive_link' },
    { nome:'Batata assada', descricao:'Sabe aquele dia que você chega em casa cansado e quer algo rápido, essa batata vai te surpreender!', imagem:'https://drive.google.com/file/d/1k9AM4QfKhPcPI1Rn5XLh7qX-Scf7Kt5x/view?usp=drive_link', video:'https://drive.google.com/file/d/1GIWI1Q_Q7glbU1DSE9QAboqiaE94JuDc/view?usp=drive_link' , ebook:'https://drive.google.com/file/d/1cXNgvmH6ybhFgG0TSpKs9Hn2RZO8WYL2/view?usp=drive_link' },
    { nome:'Carnes com batatas', descricao:'Um prato prático para um jantar rápido e delicioso!', imagem:'https://drive.google.com/file/d/1JtjLNjR_7rHE8wMEUVflqyc7FLbN6Lka/view?usp=drive_link', video:'https://drive.google.com/file/d/1OSxkt3goIm8qYROuzfqKqS2JFza23ONX/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1T4DVELRijFYgPFkEk7Gs3GfZL1Sf_FXQ/view?usp=drive_link' },
    { nome:'Costelinha', descricao:'Essa costelinha é dos Deuses, vai conquistar sua familia!', imagem:'https://drive.google.com/file/d/1zidfGZErqzaZRSwH3mdnBblKJPlxDnkB/view?usp=drive_link', video:'https://drive.google.com/file/d/1YthUFzMwf_iazTNNdiDI0tnjwe2Gf3qW/view?usp=drive_link' , ebook:'https://drive.google.com/file/d/1qXGjnbyIDEqT46Dffwk4GShWgbN0o8tP/view?usp=drive_link'},
    { nome:'Lasanha', descricao:'Um prato prático para um jantar rápido e delicioso!', imagem:'https://drive.google.com/file/d/1xHIqEtcxZqouiTJNlAPI_avXvhx5ZJaO/view?usp=drive_link', video:'https://drive.google.com/file/d/1lOaN6Wt18KJnijNaRpiVPzw9AkMUjHQM/view?usp=drive_link' , ebook:'https://drive.google.com/file/d/12jvHJEXjC6NvAxb77PWp8tlFA26kousH/view?usp=drive_link'},
    { nome:'Linguiça', descricao:'Acredito que você nunca comeu uma linguiça tão saborosa como essa!', imagem:'https://drive.google.com/file/d/18g5cOgAf5SK6E7TvPWmwGIwtN-D70b3x/view?usp=drive_link', video:'https://drive.google.com/file/d/1AdiSfmtK9gjKjmcOBVvf9XxPuL9f6g_o/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1jH4ud6rwRXoVQBJNwiyir628fUFxhBqc/view?usp=drive_link' },
    { nome:'Brownie', descricao:' Um brownie rápido e prático, que vai surpreender sua família!', imagem:'https://drive.google.com/file/d/1kNb7HYukHlOkD1sSQL-JAlUJoKw0nzGN/view?usp=drive_link', video:'https://drive.google.com/file/d/1N8qA1kA8aMq7RbVYmJQVAgbyGGUtA5Pz/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1pM7-H3epLEpjTFaCm2iuxkC2Vb3wfOTo/view?usp=drive_link' },
    { nome:'Pudim de Leite Condesado', descricao:'Você nunca fez um pudim tão prático e rápido como esse!', imagem:'https://drive.google.com/file/d/14H_e408nT8qETrmRHlBVXTzy-m3ykVDz/view?usp=drive_link', video:'https://drive.google.com/file/d/1VVy5xduHmJKY2aWNEK9lGZjczxANmiPr/view?usp=drive_link' , ebook:'https://drive.google.com/file/d/1T0rahimEroIxiw3CKL8y7vM457nYcL6r/view?usp=drive_link'},
    { nome:'Batata doce frita', descricao:'Perfeitas para lanches e saladas.', imagem:'https://drive.google.com/file/d/1WTruqZVzs5yd-61NaoI8mL85Vm_x1OYc/view?usp=drive_link', video:'https://drive.google.com/file/d/1RipcY4hfK1ujqtbGOEYV5G3K-vUDZCPt/view?usp=drive_link' , ebook:'https://drive.google.com/file/d/1Y-4cFoldpBd4IgslOM31VOTWrFKI-FeI/view?usp=drive_link'},
    { nome:'Sobrecoxa Cremosa', descricao:'Essa sobrecoxa fica sensacional, cremosa por dentro e crocante por fora!', imagem:'https://drive.google.com/file/d/1WRMzg-3x1bBiRzqu1XUv1_LjVeD1hejD/view?usp=drive_link', video:'https://drive.google.com/file/d/1xXQqWdlgs1s-WpEx4WoW3-leVQi7Isst/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1v8ROU9BrenKh1wpxYbEeI8ncisXEYEmM/view?usp=drive_link' }
  ],
  1: [
    { nome:'Cocada Cremosa E Cocada ', descricao:'Sabe aquela cocada que você amaaaa? Ela também agora na versão fit, sem culpa.', imagem:'https://drive.google.com/file/d/15CEdSWWmQhotlfqGnYF0KKpMCVwN4S9v/view?usp=drive_link', video:'https://drive.google.com/file/d/1g3bGt5KxlUruFFUcnF14l-kw80UyPIwA/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1cXEnjGZ8e9uaqdk446ERsdin_s50t970/view?usp=drive_link' },
    { nome:'Bolo Cremoso De Mandioca', descricao:'Você nunca comeu um bolo tão delicioso como esse, ele é Divino!', imagem:'https://drive.google.com/file/d/10XB8rRm4N4pX6etx-dNc_9LsiAqwfrDS/view?usp=drive_link', video:'https://drive.google.com/file/d/1sIgSyrTzQgUw8aST5dDSqjFmdG8Fd0JJ/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1BFGXEsG79VuV1xsBku0bMYXqc6T6yvrS/view?usp=drive_link' },
    { nome:'Bolo de iogurte', descricao:'Pensa na cremosidade deste bolo de bolo de iogurte, hummm… Mais parece um doce!', imagem:'https://drive.google.com/file/d/12Nd37m7K_JOSVp2p7fprvq-J80mhS2nd/view?usp=drive_link', video:'https://drive.google.com/file/d/15wHTg8LzQ1jFFD7tAVHChNHIKtCswoww/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1waFnLyD-MdJrgIHDh0HEi4QrcSEM2n1P/view?usp=drive_link' },
    { nome:'Brownie De Banana', descricao:'Um brownie sem açúcar, sem farinha e ainda delicioso. Sim ele existe!', imagem:'https://drive.google.com/file/d/17WKpE7TCrd-koxa2g-vtWJBJj-yQQKK7/view?usp=drive_link', video:'https://drive.google.com/file/d/1uJ_ryqVub7PQVQpX_ziRjywPPk9Hg-IM/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1pn7yCi71OggTrdGyHthi8RxNBdHXC9yA/view?usp=drive_link' },
    { nome:'Doce De Castanha', descricao:'Esse docinho de castanhas low carb, e zero açúcar é demais!', imagem:'https://drive.google.com/file/d/1MLyVzgeYO49A8wp6-Pqf7B3CckwRM9bv/view?usp=drive_link', video:'https://drive.google.com/file/d/1EQieRGxBCD-K3528kEhoRMHSQfItqdNM/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1csqEnqHP40fo0KkufVBaHSIjFg_jxIwX/view?usp=drive_link' },
    { nome:'Docinho De Banana Com Chocolate', descricao:'Esse docinho é mais uma das maravilhas da linha low carb, surpreenda-se!', imagem:'https://drive.google.com/file/d/1lT7zxKHntRf_97AFbunOFcOxpLgcltxa/view?usp=drive_link', video:'https://drive.google.com/file/d/1MUUU8a9FG2SSltFEQdm4SCk_KqC8d6Rt/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1FgripFIxrUA_fDWrPVVHjqxXcE-WuPDV/view?usp=drive_link' },
    { nome:'Panqueca De Banana', descricao:'Essa é mais uma das deliciosas opções para seu café da manhã super proteico e saudável! ', imagem:'https://drive.google.com/file/d/1EnmV-TZnC4jX7T_CjnoFXc1gS5MgBfTP/view?usp=drive_link', video:'https://drive.google.com/file/d/1cVhgtvmJkkmNVmzdD5iBeH9cP5XjGIVN/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1C-pV29AnJh75oLTq0e9XX-ENBfO0cVkk/view?usp=drive_link' },
    { nome:'Pudim Sem Açúcar E Sem Leite Condensado', descricao:'Esse pudim é de comer rezando, pensa em uma receita incrível!', imagem:'https://drive.google.com/file/d/1LJQwHz78WRszxpZtsVfwUkfGs0R5uD2c/view?usp=drive_link', video:'https://drive.google.com/file/d/1moifpKHAjFkJUuwn2X4nGTb036Kexjw7/view?usp=drive_link', ebook:'https://drive.google.com/file/d/11DjoKsY0yq_h322Y5WZPqQxFYe_DHTY4/view?usp=drive_link' },
    { nome:'Sobremesa De Coco Com Chocolate ', descricao:'Essa sobremesa irá conquistar sua família, coco e chocolate são irresistíveis!', imagem:'https://drive.google.com/file/d/1Sr7B5b1zput9NbJcPQ0YPv9REj5v6aN7/view?usp=drive_link', video:'https://drive.google.com/file/d/1D72v8Qmo209FXf_MKqHJhfMRzeY0evpU/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1b8CQIH2zOTUOO1uPMGxS05Th4fwTOiCT/view?usp=drive_link' }
  ],
  2: [
    { nome:'Bolacha de Amendoim', descricao:'Crocrante por fora e macia por dentro, com o sabor marcante do amendoim torrado.', imagem:'https://drive.google.com/file/d/1xN0E0CBmS6eswnk9xwVyOYfxE--85Jh5/view?usp=drive_link', video:'https://drive.google.com/file/d/1O3cRFybL6OY6CXFIvFdo3Q3lKniZryYT/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1s-vEbWBGRZUvEwysZDQOB2L4av05AE-k/view?usp=drive_link' },
    { nome:'Incrível Pão de Água', descricao:'Massa leve, casquinha dourada e textura perfeita, igual aos pães de padaria artesanal.', imagem:'https://drive.google.com/file/d/1oXS1DAqlEXvZ5cP_Yh3M4B6QRlDNBW8W/view?usp=drive_link', video:'https://drive.google.com/file/d/1Gy_pkpsk2ztPS2izthfhCDOodG-cOXaH/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1AXK3BDrM4Kiy8Op4L1oypSXZZ9BCgd6y/view?usp=drive_link' },
    { nome:'Pão Caseiro na Air Fryer', descricao:'Fácil de fazer, fofinho e pronto em minutos — ideal para o café da manhã.', imagem:'https://drive.google.com/file/d/1z3JM6K6H9nfvP9ylCHPe8AozlrT4oXpO/view?usp=drive_link', video:'https://drive.google.com/file/d/1AXzn67TNT8_99sarTc-7mZPvcpvpeW5s/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1vM260ZVTkJswvsz-uPaqYCAY5OEgWIi3/view?usp=drive_link' },
    { nome:'Pão de Frigideira com Amido de Milho', descricao:'Rápido, sem forno e com textura macia, perfeito para um lanche prático.', imagem:'https://drive.google.com/file/d/1jTQWKpry4dRIugbS_FMWk9X81fpyWsMh/view?usp=drive_link', video:'https://drive.google.com/file/d/1vo4WRufaFcsvD0tuZgdEdoRb9G7oDibm/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1-21kOg9Up0te6-AixMLjTE_Fwz4G6MiG/view?usp=drive_link' },
    { nome:'Pão Rápido', descricao:' Preparado em poucos minutos, com poucos ingredientes e sabor de pão fresco.', imagem:'https://drive.google.com/file/d/1wAHzoqsbusxXoYT0Ow4eEtD8pEjES_4b/view?usp=drive_link', video:'https://drive.google.com/file/d/1_c8oCXDOksLixP_BrAyVqjj3LEJISxxS/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1xBZUO0cxvTc7Jof3s89OHDPyammhOiyN/view?usp=drive_link' },
    { nome:'Pão Rápido de Aveia', descricao:'Versão nutritiva e leve, feita sem farinha branca e pronta em instantes.', imagem:'https://drive.google.com/file/d/1tMAKKQOQ6iIkEoUH-PbOJZJSarlhy7EN/view?usp=drive_link', video:'https://drive.google.com/file/d/1DvTnsRf8Dhi7fyyO2nErXdiVshqk2ANd/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1L7kAzbN-JY45rKw5JxFX_eqC8NAWhu-U/view?usp=drive_link' },
    { nome:'Rosca Caseira', descricao:'Tradicional, fofa e com aquele aroma irresistível que lembra pão de vó.', imagem:'https://drive.google.com/file/d/1gdycpUdBEszjr9W5hQC21ess4c7Q6li4/view?usp=drive_link', video:'https://drive.google.com/file/d/14YZRBuvC_ErA6RrxB23REA3i3czSqhv9/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1JG6MkltNKrWweRoysxPREIGI5wa4ADE_/view?usp=drive_link' },
    { nome:'Rosca de Coco Deliciosa', descricao:'Recheada com coco fresco e calda suave, perfeita para acompanhar o café.', imagem:'https://drive.google.com/file/d/1yzqM2DzXf8F2kNdMEd6r3X24ofzlbaTt/view?usp=drive_link', video:'https://drive.google.com/file/d/10rFjJBYXvmxKQpXKFfOqoXkCF3p6A8m6/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1Nkc8v8rn5P4uQpq7qRS9ob2cBgbv7JPA/view?usp=drive_link' },
    { nome:'Rosca Manteiguinha', descricao:'Sabor amanteigado e textura leve que derrete na boca.', imagem:'https://drive.google.com/file/d/1tbgFPCau3C7-6RVAbfrYb6zn3xvEA215/view?usp=drive_link', video:'https://drive.google.com/file/d/16XHJQfB9QjMNm3P5eTxOXvu2jrbv_YIH/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1oUetj_KcOW1JbkBpaxzDJeIjECFT7cXL/view?usp=drive_link' },
    { nome:'Rosquinha de Nata', descricao:'Aromática, macia e com sabor suave de nata — simples e irresistível', imagem:'https://drive.google.com/file/d/1qOFroSY3uCewgWLozY-9SlucKDHs0Bj1/view?usp=drive_link', video:'https://drive.google.com/file/d/1x1hIAZGJm53ChmrQtLnralbvA6KOhVkw/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1heygMApgoC6xhNCJ9kRsgshbM6rwYMA3/view?usp=drive_link' }
  ],
  3: [
    { nome:'Bolo Amanteigado de Morango', descricao:'Massa leve, sabor delicado e pedaços de morango que deixam cada fatia irresistível.', imagem:'https://drive.google.com/file/d/1VWUwvJ9Ja2Dw9ralnsIB4x6fPJm25UDq/view?usp=drive_link', video:'https://drive.google.com/file/d/1A0BpvsTsVqCjxZMKjBiIE77c7zHceoOp/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1_FGvqiNPpXFSD3OiDwAXlZN1W4-DZsEK/view?usp=drive_link' },
    { nome:'Bolo de Amendoim com Chocolate', descricao:'Combinação perfeita entre o sabor intenso do amendoim e a cremosidade do chocolate.', imagem:'https://drive.google.com/file/d/1AYk96V1lLc822Qz4w4Ga-VSWZ_-Tfamv/view?usp=drive_link', video:'https://drive.google.com/file/d/1is0O5Y9PRZfv-ieY2HCO9xyysxm7CWVV/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1MjXKeUBH9oru7MIzjvyq5pMQAYbnQkgh/view?usp=drive_link' },
    { nome:'Bolo de Cenoura com Chocolate', descricao:'Clássico caseiro com textura macia e cobertura de chocolate brilhante e encorpado', imagem:'https://drive.google.com/file/d/1bWEDGsbdpxAu0Hsvk4WWqiBCLaLba3KF/view?usp=drive_link', video:'https://drive.google.com/file/d/1PsmXrPv7Uwi2qlk2KA3--zMVXS4RuDY1/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1TK-Yjpj2k_bZ6CHeqZqE9rYAu92_LvAq/view?usp=drive_link' },
    { nome:'Bolo de Chocolate Maravilhoso', descricao:' Rico em sabor, úmido e com o equilíbrio ideal entre doçura e intensidade.', imagem:'https://drive.google.com/file/d/1Yv1Wr-12UCsheu11q6EvBOoh02JHib1R/view?usp=drive_link', video:'https://drive.google.com/file/d/1pXqfr1HVILItjMyb7iet2L_-zDws5eMM/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1a5YDAY3OOGb3W_HHg5NBhZCYk69FYXkj/view?usp=drive_link' },
    { nome:'Bolo de Limão Siciliano', descricao:' Refrescante, leve e com aquele toque azedinho que combina com qualquer hora do dia.', imagem:'https://drive.google.com/file/d/1iZlvr_oHq3247ejJg9_o9O5NH-rULyl8/view?usp=drive_link', video:'https://drive.google.com/file/d/1VRQOjHT-ypl_7Hq5jGGE6G0Yo6pGfgOS/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1RVj81uIx9k74dEFEmUxc7sWHJAmzo-N4/view?usp=drive_link' },
    { nome:'Bolo de Laranja Fofinho', descricao:'Feito com suco natural, aroma cítrico e uma maciez que derrete na boca.', imagem:'https://drive.google.com/file/d/1OLOXv2RVgFXtVB_zpc2EkIpzVI0DY6zA/view?usp=drive_link', video:'https://drive.google.com/file/d/1BOEjb14xQ2zkbjwbgnQjPG9uloriG3D9/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1t327XFEcbrKY6EFf1OKVjWWVBN-pUSID/view?usp=drive_link' },
    { nome:'Bolo de Milho', descricao:'Sabor tradicional, textura cremosa e o perfume inconfundível do milho fresco.', imagem:'https://drive.google.com/file/d/14uCHdVYMGIPfhGEJHluRswrZ192CiFCA/view?usp=drive_link', video:'https://drive.google.com/file/d/1WnB8XMTz1kcRas-ZSiSqJoZRXPxiyvxc/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1_3meJnoZIZ0Qwz-OUDbYDKRlX6HPeRDU/view?usp=drive_link' },
    { nome:'Bolo de Paçoca', descricao:'Explosão de sabor e nostalgia com a doçura única da paçoca em cada mordida.', imagem:'https://drive.google.com/file/d/11m0gn_lqiu1UYhsW-KOHhEL82X5Cxrpm/view?usp=drive_link', video:'https://drive.google.com/file/d/1QPa_j92eXwd_I7_yMYSeH0YyScGA55HX/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1g9FMX3M3Zn0uCqQqvXfys9WkfQxTR3ib/view?usp=drive_link' },
    { nome:'Bolo de Reis Delicioso', descricao:'Inspirado na receita clássica europeia, com frutas cristalizadas e aroma marcante.', imagem:'https://drive.google.com/file/d/1TN3td2fOOVTmQ4IJNfn28hx8MHz4b-X7/view?usp=drive_link', video:'https://drive.google.com/file/d/1qDcKLXx_jth7fvFSjYWwbFDh0q6uatBK/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1vWyPi2MimtW_h8KEciBsPGR4h3VmceDF/view?usp=drive_link' },
    { nome:'Cuca de Uva', descricao:'Cobertura crocante, recheio suculento e o contraste perfeito entre massa e frutas.', imagem:'https://drive.google.com/file/d/1MY2StFbXxSY0_J31hjPr49wjB69lO0wB/view?usp=drive_link', video:'https://drive.google.com/file/d/158qA_703cHRCZCHCQGADLGCJzE1fUrH9/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1kor8jhyCyFk4Pk6eRIJGX1zzjuwbBITW/view?usp=drive_link' }
  ],
  4: [
    { nome:'Coxinha Recheada', descricao:'Crosta crocante, recheio cremoso e sabor irresistível em cada mordida.', imagem:'https://drive.google.com/file/d/1VGjfCdBRUHvB_Ce-BwfusGhRwVoN-VYt/view?usp=drive_link', video:'https://drive.google.com/file/d/1AY9YB4kx6DfPiZ7eBPDKwjnugZ8ENg7H/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1nQN_0UOyrFTxAdtej6IJNJvLt1zWxleD/view?usp=drive_link' },
    { nome:'Pão com Creme', descricao:'Pão caseiro fofinho com recheio cremoso e dourado, perfeito para qualquer lanche.', imagem:'https://drive.google.com/file/d/1nXABHUC6NDaryF98sJ5omHEew34uHiLX/view?usp=drive_link', video:'https://drive.google.com/file/d/1V4T2AHs-aCKiB20EwPC8C424uFluvWvm/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1nQC5pivb_wBYZjiwgtlQnOGxTkUTrKHq/view?usp=drive_link' },
    { nome:'Pão de Alho Diferente', descricao:'Versão especial com tempero marcante e textura perfeita — crocante por fora e macio por dentro.', imagem:'https://drive.google.com/file/d/1e2CeCAj2wuEyTnkwcg0l_sHtGSk3iJl-/view?usp=drive_link', video:'https://drive.google.com/file/d/1a14AosP02qAfScHH5MadWXPsFFUgrqg-/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1skoNW5mBQR7_pwNijL0yLOOrIcgf3R-a/view?usp=drive_link' },
    { nome:'Pão Recheado com Carne de Porco', descricao:'Massa leve e recheio suculento, uma combinação rústica e irresistível.', imagem:'https://drive.google.com/file/d/1jW_6CUCPu8w-xWQ34_U7RSe7C_ibrrLx/view?usp=drive_link', video:'https://drive.google.com/file/d/1QDBJwVp25puF9ZPn_o3s060H4oRnjWFm/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1r-LGvSdBmjmbuGq4RHP6YB9IBpRKKkqR/view?usp=drive_link' },
    { nome:'Receita de Kafta Deliciosa', descricao:'Tempero oriental equilibrado e carne macia no ponto certo, feita em minutos.', imagem:'https://drive.google.com/file/d/1d5Rzk-Y8e4xDutYBeHK0OrnA9OY7mwt-/view?usp=drive_link', video:'https://drive.google.com/file/d/1qf2__3eMLli32Y60OqaW1SrQ4JrPwWhR/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1cyzYl_dqdGJ4FtCnNbkIutrzXlBTF_hH/view?usp=drive_link' },
    { nome:'Rocambole de Batata com Carne', descricao:'Camada cremosa de batata enrolando um recheio rico e saboroso.', imagem:'https://drive.google.com/file/d/1ExYQ6Wsn3fZZlB5ycq_0jZr-5MiPknZP/view?usp=drive_link', video:'https://drive.google.com/file/d/1uU_z_FnXfgngOv0UXq7sPyqq6DDNHWkD/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1Hv6l1xaYS3HPAeRzA71tpi2JqPba7UKv/view?usp=drive_link' },
    { nome:'Torta de Camarão', descricao:'Recheio cremoso, aroma marcante e massa leve — um clássico que impressiona.', imagem:'https://drive.google.com/file/d/1tRIDJQz1e2P-sTAbSosGv_DSssJlHcCn/view?usp=drive_link', video:'https://drive.google.com/file/d/13wqcs60kbWuVUJKI_ISCii6TfVHIYqEJ/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1xFgLA3ri667HW9ud95bSINnu1j_r0dGi/view?usp=drive_link' },
    { nome:'Torta de Esfirra', descricao:'Todo o sabor da esfirra tradicional em uma versão prática e cheia de recheio.', imagem:'https://drive.google.com/file/d/13D1UyKfYeCxe0OYiJyQznNebZCFBlsEq/view?usp=drive_link', video:'https://drive.google.com/file/d/11v5KptHvpV--wb62DBEvYze1hTvB3GRz/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1DtbjAMpdx8Bx2yQNhJFqjcUPRFfHjF9E/view?usp=drive_link' },
    { nome:'Torta de Linguiça', descricao:'Massa fofa, recheio bem temperado e sabor intenso que conquista em cada fatia.', imagem:'https://drive.google.com/file/d/1YNLWR7akto0OuduMoMrEU0bL_LsQ5qtu/view?usp=drive_link', video:'https://drive.google.com/file/d/1Io-v3J3s_-WLIjpjbrpALD07gbXrZvy4/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1qJ1aoTVMTxMZlHCPp_tFDk7Eo03E6Et3/view?usp=drive_link' }
  ],
  5: [
    { nome:'Bife ao Molho de Queijo', descricao:'Carne suculenta coberta por um molho cremoso e irresistível de queijo derretido.', imagem:'https://drive.google.com/file/d/1O5nLWGkZv7K1119aEHlbq8gCl0qAjc0p/view?usp=drive_link', video:'https://drive.google.com/file/d/1w-SQiQZCSMZxS8z0vhwWXNCsb2KX-luj/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1Z3TY06e4NaXQIUtabgbsYP3e5SyjviAv/view?usp=drive_link' },
    { nome:'Caldo de Azeitona', descricao:'Sabor intenso e textura aveludada, perfeito para acompanhar massas e carnes.', imagem:'https://drive.google.com/file/d/193qlfD5xSUwOT8KxCQWL4TgWe7l-w6cD/view?usp=drive_link', video:'https://drive.google.com/file/d/11FsnExHGFBHrSa02DIKbTMxT6juHkgac/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1vZzlzi6zvaGeH9yZU69ysMvgqWd2zZ4q/view?usp=drive_link' },
    { nome:'Creme de Milho', descricao:'Leve, cremoso e com sabor caseiro que combina com qualquer prato.', imagem:'https://drive.google.com/file/d/1Lg5p8ut1Q7vz6BkwNRXfJ3w_iOb-CBbO/view?usp=drive_link', video:'https://drive.google.com/file/d/1Xjv82jzbbCFqMLkUcSsIBJimyTeEFaTw/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1KvFYxCLUKZ1rceWHs5t6l0DPb6-qrpU8/view?usp=drive_link' },
    { nome:'Molho Barbecue', descricao:'Equilíbrio entre o doce e o defumado, ideal para carnes, hambúrgueres e grelhados.', imagem:'https://drive.google.com/file/d/1vfZmpg1EVEcHMNhC8hQYMhvrAqFvmGUJ/view?usp=drive_link', video:'https://drive.google.com/file/d/1mwI0232ZYbP3P55xFKvwViD52E7zfBnt/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1gldG-alQyH0ph6eXcTjZlBufwcES9IKs/view?usp=drive_link' },
    { nome:'Molho de Mostarda e Mel', descricao:'Combinação agridoce clássica que realça o sabor de saladas, frangos e sanduíches.', imagem:'https://drive.google.com/file/d/1YKVP6dm8WtH-iHHGkcA69Iigp3SR03vE/view?usp=drive_link', video:'https://drive.google.com/file/d/1rfQnD6YO54eAKXGncgj0rkYOm1yP2Cg7/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1OjWlYgUC8iLv4C20QMyGnNDsMI5yYoGi/view?usp=drive_link' },
    { nome:'Molho de Pimenta Saboroso', descricao:'Feito de forma rápida, com sabor encorpado e aroma irresistível de temperos frescos.', imagem:'https://drive.google.com/file/d/1GdjcbTcwW0VN_D6NZDRuppsDCSnY11kE/view?usp=drive_link', video:'https://drive.google.com/file/d/1a8IMbVL84opHiFVAcUEehnNcow4dhFSH/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1sq9hCrZyGkyfMutRW0z7_tUuiEgU0Oij/view?usp=drive_link' },
    { nome:'Molho de Tomate na Panela de Pressão', descricao:'Feito de forma rápida, com sabor encorpado e aroma irresistível de temperos frescos.', imagem:'https://drive.google.com/file/d/1ZlwqHSatMB_8Kc4DFUYI7Zb-ZMJUAjW0/view?usp=drive_link', video:'https://drive.google.com/file/d/1_MRUBcEHxY-2IJGic8ZDJqljPi9x5Kyk/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1ShjXSqhRSDhEsO3VEWA2M9pkLe5yKpdC/view?usp=drive_link' },
    { nome:'Molho Secreto do Big Mac', descricao:'Versão caseira do clássico mais famoso do mundo, cremosa e cheia de sabor.', imagem:'https://drive.google.com/file/d/1IA0YXu6QUJDbfInNK9tw2UTEL6-x9dc8/view?usp=drive_link', video:'https://drive.google.com/file/d/1G_zAjQXNymR8O59yZcYTEHIVeE7mL0NF/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1zRHEu2gxHXxRQBAkrIlVm7ADun7fbedS/view?usp=drive_link' },
    { nome:'Molho Verde para Frutos do Mar', descricao:'Refrescante e levemente ácido, perfeito para acompanhar peixes e camarões.', imagem:'https://drive.google.com/file/d/1vrocAkSDmmVJmOIKhSRPWeaen2wxwe5c/view?usp=drive_link', video:'https://drive.google.com/file/d/1oMAqD5ydlaLHs_vuJnarDbfDYH7Je_i6/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1cy0cBQN9t3oOJSvGwBzoBeFRCCa7pw-m/view?usp=drive_link' },
    { nome:'Molho Verde para Saladas', descricao:'Textura leve e sabor equilibrado, ideal para dar vida a qualquer salada.', imagem:'https://drive.google.com/file/d/1Dc-ZC9yT6XgjxTYMLqsPN2OlcSBDCrcM/view?usp=drive_link', video:'https://drive.google.com/file/d/1yK2wi15f2_5RWmAgfnAgFaMuNbtQHHut/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1JSMNb2EyR3nns2M44SVMn_okB7YThx6R/view?usp=drive_link' }
  ],
  6: [
    { nome:'Arroz do Sushi', descricao:'Base essencial da culinária japonesa, com textura e tempero perfeitos para moldar sushis e temakis.', imagem:'https://drive.google.com/file/d/179euwh8z_IA8mALTFb1wvtRpvHgARiB3/view?usp=drive_link', video:'https://drive.google.com/file/d/1owYkTM4BOHK14SxTF5foZDv3nWHYvotP/view?usp=drive_link', ebook:'https://drive.google.com/file/d/17gq26DDldVkhKcbN_adyKv2GJlSrji6x/view?usp=drive_link' },
    { nome:'Cortar um Sashimi de Salmão', descricao:'Técnica profissional explicada passo a passo para obter cortes delicados e uniformes.', imagem:'https://drive.google.com/file/d/159SD69hmycnEnXx0iUUdX_5h_gbdvMMk/view?usp=drive_link', video:'https://drive.google.com/file/d/1eZlu-aLfjLJQOjTNuvfeiMLSq_EWYQTy/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1n_g5unkb5sdngQoDZZSWIJ31QWrdWyCG/view?usp=drive_link' },
    { nome:'Hot Roll Crispy', descricao:'Empanado crocante.', imagem:'https://drive.google.com/file/d/1cJk3K0xZeaGvUcfiX25MWp4ifvUi7BP_/view?usp=drive_link', video:'https://drive.google.com/file/d/1ePefgV5OJZ_s80cxQvS_R3UCt9noOuqF/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1DN1TtWxEL-9yHrDXU0wKe3Y932Q3goV-/view?usp=drive_link' },
    { nome:'Missoshiro', descricao:'Sopa tradicional japonesa feita com missô, tofu e cebolinha, leve e reconfortante.', imagem:'https://drive.google.com/file/d/11HJkqr2C_xE-hnrkJbJ9EewKjdMx5Lgr/view?usp=drive_link', video:'https://drive.google.com/file/d/1Xd-YYwhTK4_THl9qx8JKt0fh5Fqhx1sR/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1wGyF8P9SDm_yOan6qiWAk1_GMg5bi1bk/view?usp=drive_link' },
    { nome:'Receita de Guioza', descricao:'Pastéis japoneses recheados e selados com crocância por fora e suculência por dentro.', imagem:'https://drive.google.com/file/d/1bxOXfxpEiTFVrRuggQ8ftzF5_qz-Ptsh/view?usp=drive_link', video:'https://drive.google.com/file/d/1-iWtN4aJVQHz4hMJqRy7U0n9ZUYpP4qS/view?usp=drive_link', ebook:'https://drive.google.com/file/d/12y6Vc6nxr2BR7u-ENHqDOuBXm11VWCHu/view?usp=drive_link' },
    { nome:'Hossomaki Tradicional', descricao:'Enrolado fino e elegante com arroz, alga nori e recheio clássico de peixe fresco.', imagem:'https://drive.google.com/file/d/1099rUNLVhtvLjGJojyM0_hhZkdCljK1g/view?usp=drive_link', video:'https://drive.google.com/file/d/1bgfVGZboaGRm3sdurK0AUjQHSr3hxr8a/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1MJtIDm4F5IK9FRk6YinmF8sg5YO8JCeE/view?usp=drive_link' },
    { nome:'Temaki de Cream Cheese e Salmão', descricao:'Cone de alga crocante recheado com arroz e salmão fresco, finalizado com cream cheese.', imagem:'https://drive.google.com/file/d/1R3xDabgvjATPEbFp_lit9IHnJ5MGKzCN/view?usp=drive_link', video:'https://drive.google.com/file/d/1OOb68ItIG0CReaax_diC_ZFA806_TIsE/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1WFPYSVnPVHPIWF9o9u_3KPt_uaa4fliL/view?usp=drive_link' },
    { nome:'Tempurá de Camarão com Legumes', descricao:'Massa leve e crocante envolvendo camarões e legumes frescos, fritos à perfeição.', imagem:'https://drive.google.com/file/d/1BnTBPdKcGoCvJp7wY-Z_CyBTocmkKLjp/view?usp=drive_link', video:'https://drive.google.com/file/d/1a4ok4Sn3xbNK6ckOtE-bbl37tZl4WCF0/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1JnkalQmf9tmTgeEi0yw4U619WbQSqLpu/view?usp=drive_link' },
    { nome:'Yakisoba de Carne', descricao:'Macarrão oriental salteado com legumes e tiras de carne ao molho agridoce equilibrado.', imagem:'https://drive.google.com/file/d/1skqo385-EvUf2BlEdBnLCHINLWg40PMz/view?usp=drive_link', video:'https://drive.google.com/file/d/1WZb2Ve1jJZLEcXvtwBjFmTN2DCYLwy7B/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1xUlkIQQR7yjkHbw38KBsPkYVGRbCw0aU/view?usp=drive_link' },
    { nome:'Yakitori – Espetinho Japonês', descricao:'Espetinhos grelhados e caramelizados com molho tare, típicos dos bares japoneses.', imagem:'https://drive.google.com/file/d/1iIWXj2t9X29hHWIljBcw1XX1_j1ViU0X/view?usp=drive_link', video:'https://drive.google.com/file/d/1mKOWX--7M2p37ihQuTkrzivyzkXTiUXp/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1XthUm0HJILJ8khAelgf5v2Ulz8IZJpX_/view?usp=drive_link' }
  ],
  7: [
    { nome:'Arroz de Couve-Flor', descricao:'Leve, nutritivo e com baixo teor de carboidratos — perfeito para substituições saudáveis.', imagem:'https://drive.google.com/file/d/12iyx2cR-m3YIV7timYWpGA53uBofr91n/view?usp=drive_link', video:'https://drive.google.com/file/d/1wKH4qNiA-bUtfvEicnAuNJHMjhEAaVwE/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1HMj_J5Ug1_MS8MEsTZklJ2dc0YhjY_VU/view?usp=drive_link' },
    { nome:'Bolinho Chocolatudo Saudável', descricao:' Textura macia e sabor intenso de chocolate, feito com ingredientes leves e funcionais.', imagem:'https://drive.google.com/file/d/182w59mQuDdfOxd5lS5PsUIK2FXm8bNaQ/view?usp=drive_link', video:'https://drive.google.com/file/d/1IwfgLJ5bni2vGnqDxcIXDseDgNluhWen/view?usp=drive_link', ebook:'https://drive.google.com/file/d/16mNmUD7ecFB6W6tupkt-WDSXsHM8JHLK/view?usp=drive_link' },
    { nome:'Enroladinho de Rap 10', descricao:'Rápido, prático e versátil — ideal para um lanche leve ou refeição expressa.', imagem:'https://drive.google.com/file/d/1stJH68JnLlFB0QH5siFoKpMa3dil4_KU/view?usp=drive_link', video:'https://drive.google.com/file/d/1B4FPKbT9kxIoPQ4emwkHK03QDJK1A5OM/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1FPxd9hFX9RkBlpTSq01DSVYJRLWGippb/view?usp=drive_link' },
    { nome:'Lasanha de Abobrinha', descricao:'Camadas leves, saborosas e sem massa, com muito recheio e molho cremoso.', imagem:'https://drive.google.com/file/d/18_V8jVc5ssF0rXbafwvd9vhgfOZ7-eKJ/view?usp=drive_link', video:'https://drive.google.com/file/d/16IP7Q0yFKZ7cFEWv_Ql4UdB0VYd2drSR/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1GwFvZ4HcoVEZqq1e5ymMyn9LhLCP3t8o/view?usp=drive_link' },
    { nome:'Muffin de Legumes', descricao:'Colorido, nutritivo e fácil de preparar — ótimo para lanches e marmitas.', imagem:'https://drive.google.com/file/d/1D2Wb8pi2HUGIIxMksyFbMgOw568i2DLC/view?usp=drive_link', video:'https://drive.google.com/file/d/1S-Z3xI2p9dksVCC6epo64aPHBKoDrcf-/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1qkoiFBfSKXHh9f-P5gLiVpb8rcihMAvE/view?usp=drive_link' },
    { nome:'Pão de Queijo de Frigideira', descricao:'Versão rápida do clássico mineiro, pronta em minutos e com casquinha crocante.', imagem:'https://drive.google.com/file/d/12h7w0h2J5j7pIgDMW55YXGe76SU2Ov7X/view?usp=drive_link', video:'https://drive.google.com/file/d/1m1NvTOeePRvwMTCOuLO8pe8VvVO7PqqH/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1v6kr9f17Bc8m4jsc_RAmxdgARqu74_op/view?usp=drive_link' },
    { nome:'Pão Rápido de Banana e Aveia', descricao:'Doce natural, sem farinha e cheio de fibras — ideal para o café da manhã.', imagem:'https://drive.google.com/file/d/17DmIPU_EhADSLJNzrUi2BUohrWhIXDH3/view?usp=drive_link', video:'https://drive.google.com/file/d/1lamHvWutBfYkkd9FwJaVMUVxQQTjdDpK/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1UZBFxIGY4tfnlDbKsui0_4d8_0soyTDZ/view?usp=drive_link' },
    { nome:'Patê de Frango', descricao:'Cremoso e bem temperado, combina com torradas, pães e sanduíches naturais.', imagem:'https://drive.google.com/file/d/1McaWVRFGPkd3dACOzxJyZUjjQzmoEz7X/view?usp=drive_link', video:'https://drive.google.com/file/d/1YS-qLafsx58qlLkRRLwuLjU-3e4wyILS/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1tzDrSY1On9jFc0B5lhGLGGkhDeDb9bLB/view?usp=drive_link' },
    { nome:'Salada de Grão-de-Bico', descricao:' Refrescante, proteica e colorida, perfeita para acompanhar qualquer prato.', imagem:'https://drive.google.com/file/d/1qDSMLTTRMwUsXM7xvEKZsjil-G0sfgRs/view?usp=drive_link', video:'https://drive.google.com/file/d/1vXUkdk3HNcW4RwyL7Vi90JrHADR7Lb2L/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1oad8f3WXABlyDqGN4ekJQddIaAyBfXii/view?usp=drive_link' },
    { nome:'Suco Verde', descricao:'Bebida detox e revitalizante, com combinação equilibrada de frutas e folhas.', imagem:'https://drive.google.com/file/d/1vlAsALB-KK8vAilm4uMHEKBdGjN7Btq3/view?usp=drive_link', video:'https://drive.google.com/file/d/1LJntVUvGthxXX_dw6O7UhR7my5h2NPAC/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1IYy56OGZUoj41gU0HNM6PArw_--o7lqO/view?usp=drive_link' }
  ],
  8: [
    { nome:'Arroz com Lentilha', descricao:'Clássico simples e nutritivo, com sabor caseiro e textura soltinha perfeita.', imagem:'https://drive.google.com/file/d/1ZN6ok2c8DpEW4aZ1w6iy4x9rRrjHsDzk/view?usp=drive_link', video:'https://drive.google.com/file/d/1DDNE3szM_szjKasdZTWJ9RhGGYxgOylf/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1o5Oc6S5YBgQqP4O9qzCGMV3hHjW0MTzH/view?usp=drive_link' },
    { nome:'Bacalhau à Lagareiro', descricao:'Receita tradicional portuguesa, com bacalhau dourado, batatas e muito azeite.', imagem:'https://drive.google.com/file/d/1OwmZKu-dt2IXjYbBy6WH0rWZv5_iZQT3/view?usp=drive_link', video:'https://drive.google.com/file/d/1AuRBwvUqFzLsVIe2DSO8hK990l0OJ-rc/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1sBVi10jR2NBua_0BGcXQ6hCC24kuL7aP/view?usp=drive_link' },
    { nome:'Caldo de Mandioca com Linguiça', descricao:'Cremoso, encorpado e cheio de sabor — ideal para dias frios ou jantares reconfortantes.', imagem:'https://drive.google.com/file/d/1GYumzeJg53RKj9A6GgCm1r15Q7XPUJL9/view?usp=drive_link', video:'https://drive.google.com/file/d/1ahcsTD8nFTDIQ3ux5HQAokXM1TbEwVT4/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1NAb9xDycclT6O2YUtzKVnEF6HP3LDy6a/view?usp=drive_link' },
    { nome:'Feijão Branco com Linguiça', descricao:'Combinação rústica e saborosa, com caldinho espesso e tempero caseiro irresistível.', imagem:'https://drive.google.com/file/d/17rA2qrM-0eA9cu_Lan0wlk--_ntqW7Hv/view?usp=drive_link', video:'https://drive.google.com/file/d/1ixIyNQ5RtkxOrJjaspqFbQXnSqezIWWq/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1AG0Gi0u_ZU0pW7sdJv5kxzRV-6InGPMB/view?usp=drive_link' },
    { nome:'Feijoada Saborosa', descricao:' Clássico brasileiro completo, com carnes suculentas e tempero na medida certa.', imagem:'https://drive.google.com/file/d/16ceQQYqkZstk_kfBk3bXJKMrUO3aPV7i/view?usp=drive_link', video:'https://drive.google.com/file/d/1sssSaZfmZy7SSlKno4Li8YsD5L4HoUNw/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1Y4s7vAspqbP5ceb0RfoLURl__rvb2yyL/view?usp=drive_link' },
    { nome:'Filé de Tilápia com Molho de Limão Siciliano', descricao:' Leve e sofisticado, com molho cítrico que realça o sabor do peixe.', imagem:'https://drive.google.com/file/d/1vCFYn-AbBwPGrtuu_rjZe-5aYM7rgBeY/view?usp=drive_link', video:'https://drive.google.com/file/d/1yCOBiC-S7lD8YDxwFC0YAwBvbeOMzunn/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1k9ykYNuA2S2SFiyXP4OP4d5wPPt478jS/view?usp=drive_link' },
    { nome:'Macarrão com Molho de Gorgonzola e Cação Gratinado', descricao:'Textura cremosa e sabor marcante, uma fusão perfeita entre massa e frutos do mar.', imagem:'https://drive.google.com/file/d/1eWbTljkvTzaezdJ3mHxalyTdtlpM3GRy/view?usp=drive_link', video:'https://drive.google.com/file/d/1czl_r-2pdlBDlSQ9OmCBgVglDOXxXIAq/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1gXgqwJT5iame-87k248_5T9IrEWtsuFi/view?usp=drive_link' },
    { nome:'Mocotó com Feijão Branco', descricao:'Receita encorpada, nutritiva e cheia de tradição, ideal para quem gosta de sabor intenso.', imagem:'https://drive.google.com/file/d/1Gp8bA45rv6jq2Y5liOtoI30gr3V0KlIc/view?usp=drive_link', video:'https://drive.google.com/file/d/1o1a_41KgMlTJLaBNueY66V1EEKdeuiGq/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1CF40t-vcT5Zbe8WGtDOIq5ZtUKoEhaDp/view?usp=drive_link' },
    { nome:'Ossobuco com Mandioca', descricao:'Carne macia cozida lentamente, servida com mandioca cremosa e caldo rico.', imagem:'https://drive.google.com/file/d/116nZM6Xbg3y2kwhbeuCrDWZqE1es-x1Z/view?usp=drive_link', video:'https://drive.google.com/file/d/1dYglPkiKUQnEObZQ4ederCcMYWchGAsZ/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1bHgHEqjQlAUQOqieaS-sib9HKsk9ks45/view?usp=drive_link' },
    { nome:'Peixe Empanado e Recheado', descricao:'Camada crocante por fora e recheio suculento por dentro, perfeito para surpreender à mesa.', imagem:'https://drive.google.com/file/d/1onkzMPbvvy6sZHGScjIPj3zPsRCFCxrF/view?usp=drive_link', video:'https://drive.google.com/file/d/1aQZJ3YRMNc3tiGxiCU01nR_9H6Ucpy5C/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1mBUhPFYE59_nV7SzB1X2Hpv53FcqE998/view?usp=drive_link' }
  ],
  9: [
    { nome:'Cação com Molho de Camarão e Purê de Batata', descricao:'Peixe macio, molho cremoso e purê suave em uma combinação sofisticada e irresistível.', imagem:'https://drive.google.com/file/d/1F2W-nAnuT84DfKVeZ2USOzpxz0vs9B4e/view?usp=drive_link', video:'https://drive.google.com/file/d/1w3fWSB0V2DuG6Y025drRaodjIg7E1AoW/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1W8kpmoa_lv3rhIMKW5x5I0tRWbLZt648/view?usp=drive_link' },
    { nome:'Carne Louca', descricao:'Desfiada, bem temperada e suculenta — perfeita para sanduíches ou acompanhamentos.', imagem:'https://drive.google.com/file/d/1eFDDh3tmPXCsrYtXh3bi7CgAgovf82bX/view?usp=drive_link', video:'https://drive.google.com/file/d/1-jwc-5hf4hcVaRPvv7ylYdSAu7EpWouQ/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1EggSH7A_XH91u9aWuOfb2Xhkph8NaRAS/view?usp=drive_link' },
    { nome:'Coroa de Carré de Cordeiro', descricao:'Apresentação elegante, carne macia e sabor marcante para impressionar em qualquer ocasião.', imagem:'https://drive.google.com/file/d/1OFytCT6haEru7NB3Fb6GzhcPFQX3RJ2O/view?usp=drive_link', video:'https://drive.google.com/file/d/1gRRjYiVR3ZZ7MMjRvSq0F2YLUwjqh4ZX/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1u54nqdADlJKQMIzqCE_Me_xRtfEOSzLH/view?usp=drive_link' },
    { nome:'Cupim com Batata Suculento', descricao:'Corte nobre, cozido lentamente até desmanchar, com batatas douradas e tempero intenso.', imagem:'https://drive.google.com/file/d/1Dyx6fSb4UUnX4IIgvlX1MJAaKwrxOGvb/view?usp=drive_link', video:'https://drive.google.com/file/d/1OTIso0tz5nJIzspMSEaZ_AJRpt_ZMJJp/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1WtDUwUbpCNIKuH968Ui0Xw2KiHI0YE18/view?usp=drive_link' },
    { nome:'Galeto Frito com Chimichurri', descricao:'Frango dourado e crocante servido com o toque refrescante e picante do chimichurri.', imagem:'https://drive.google.com/file/d/1GYQz4ho2LjijAE6FVI1I95JXmHV-aJIu/view?usp=drive_link', video:'https://drive.google.com/file/d/1wWaJa0AWVpcPDgP8ThXRe28oDPWUsQ1o/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1AHTiGhE8AD0Qtxjb8LFmzhUxWY4G81CJ/view?usp=drive_link' },
    { nome:'Mazegohan (Arroz Bege)', descricao:'Receita japonesa tradicional, leve e saborosa, com arroz temperado e ingredientes equilibrados.', imagem:'https://drive.google.com/file/d/1EvkeUrk0y7lsAsDqoJJ60kNB2E1PngE9/view?usp=drive_link', video:'https://drive.google.com/file/d/1amwtLsAyINwby5k9NdmeSwVevxWqwSan/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1WP_zaD4WZ4XkJ9Sg0dR-wWDXftBsDtg7/view?usp=drive_link' },
    { nome:'Merluza à Portuguesa', descricao:'Peixe delicado com legumes coloridos, azeite e temperos que lembram a culinária lusitana.', imagem:'https://drive.google.com/file/d/1D-BG26x7OgCM29oanyFgBVSSweyvKc7S/view?usp=drive_link', video:'https://drive.google.com/file/d/1E2qelPs1S2xdq4Qrus3VOvxDxF8Ktv-J/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1qs2MvZW0QkzS2e-5VkijV1iazrxdV5lp/view?usp=drive_link' },
    { nome:'Nhoque de Mandioca com Carne Seca', descricao:'Massa leve e saborosa combinada com recheio cremoso e carne seca desfiada no ponto.', imagem:'https://drive.google.com/file/d/1YoStX1-DcWLnjMCW8MBftAiUzWi6_NfM/view?usp=drive_link', video:'https://drive.google.com/file/d/1CU9DQZvjpyHeCX6dmCTb_6ayMhVB5aF7/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1VpZ4ijvjy4Wjgeaa5JZEQLVPlBwdfrsd/view?usp=drive_link' },
    { nome:'Pimenta Cambuci Recheada', descricao:'Sabor suave e toque artesanal, com recheio cremoso que valoriza o aroma da pimenta.', imagem:'https://drive.google.com/file/d/1v0lq8_UvVtLKYsWMd3nqttIfTnB-AtZn/view?usp=drive_link', video:'https://drive.google.com/file/d/1XmbuQ0u0_l-QPeZ4znXAFM9r6iyr9QMX/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1fSeSeDfJ9jHPIk4tGqB8erRTSsO2bAgy/view?usp=drive_link' },
    { nome:'Yakimeshi de Camarão', descricao:'Arroz oriental salteado com legumes e camarões, leve, colorido e cheio de sabor.', imagem:'https://drive.google.com/file/d/1BA_0Sn82jIOL7eGJHlXb_JD3QKYMgwTc/view?usp=drive_link', video:'https://drive.google.com/file/d/1RJmBi894J89MeAm8vKDNe41bOoXks0LO/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1t4IVM5XQieI_KPwHEZzL0WJVimBJMJhg/view?usp=drive_link' }
  ]
};

/* ====== E-BOOKS DESTACADOS ====== */
const ebooksDestacados = [
  {
    id: 'ebook001',
    nome: 'Air Fryer Do Chef Básico',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1igDIdMXjNMIpnc-Y2iV2U0ekb19mRGmr/view?usp=drive_link',
    descricao: 'As melhores receitas.',
    link: 'https://drive.google.com/file/d/1pxl9iIbp5Gr8rUtxTUGh2I8I5ZrVED0u/view?usp=drive_link'
  },
  {
    id: 'ebook002',
    nome: 'AIR FRYER DO CHEF PREMIUM',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1h-AmPaneLT8du0Aw1hurdzKwfjUV3p_q/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/1qZA9cFGP-vgl43YcrYd1XcanRfY6NeyX/view?usp=drive_link'
  },
  {
    id: 'ebook003',
    nome: 'AIR FRYER DO CHEF: 100 RECEITAS',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1L9OBnnlUZmbT2oVzGFs7K7RXcPTUIOsC/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/1qGJb9BMHsHiP9UJy7IXXOoKonAuR7Cyw/view?usp=drive_link'
  },
  {
    id: 'ebook004',
    nome: 'AIR FRYER DO CHEF: AS TOP 10',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1ZyUt8N8DLNFF7f32DQQvRIZufYRW7y2/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/1Vso6lkQ8dHlU08ORLGmDjEktoNtaMEgm/view?usp=drive_link'
  },
  {
    id: 'ebook005',
    nome: 'AIR FRYER SEM LIMITES',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1h-AmPaneLT8du0Aw1hurdzKwfjUV3p_q/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/1YgdG0X_4BPbxgc2n7Vhv7xgZ2yAMEe5c/view?usp=drive_link'
  },
  {
    id: 'ebook006',
    nome: 'AIR FRYER SEM LIMITES | PREMIUM',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1bZllFk06BkczH8NpJZ766Cp25W9GIep0/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/185PqGff9SL3dPvxqLH5cIaqm9EoD7tOY/view?usp=drive_link'
  },
  {
    id: 'ebook007',
    nome: 'DOCES SEM AÇÚCAR',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1GCeT43aXdgho--1rTyYCK2EewiPE4kWb/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/1HGCXmTBO4ATBzHMmWnlIiX8xMRHxjjki/view?usp=drive_link'
  },
  {
    id: 'ebook008',
    nome: 'Edição Gourmet – Air Fryer do Chef',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1uHqofQez_mTc3oaSe3ZDgvOtwrfQcbhX/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/1qvzSlZstRcXr56mJTOIO_ycE0yhCgap0/view?usp=drive_link'
  },
  {
    id: 'ebook009',
    nome: 'RECHEIO SEM FOGO',
    tipo: 'ebook',
    capa: 'https://drive.google.com/file/d/1_0bqgru6frrs8W1BX-LkkuKtVTuZbML4/view?usp=drive_link',
    descricao: 'Receitas práticas e saudáveis para fazer na Airfryer.',
    link: 'https://drive.google.com/file/d/1_CwnFjHxMqlVPWJbVkizZxPphwsZPuql/view?usp=drive_link'
  }
];
/* ====== EXPORTS DE DADOS PARA O INDEX (NOVO) ====== */

// Junta todas as receitas de todas as categorias em um único array
const receitasFlat = Object.values(receitasPorCategoria || {}).flat();

// Array único que o index vai usar (mod.itens)
export const itens = [
  // todas as receitas (normalmente vão virar VÍDEOS, porque têm .video)
  ...receitasFlat.map((rec, idx) => ({
    ...rec,
    id: rec.id || `rec_${idx}`,
  })),

    // todos os e-books destacados
  ...ebooksDestacados.map((eb, idx) => ({
    ...eb,
    id: eb.id || `ebook_${idx}`,
  })),
];

// Opcional: também exporta só os ebooks num array separado
export const ebooks = ebooksDestacados;


/* ===============================
   EXTRAÇÃO PARA A ÁREA DE MEMBROS
================================*/

/**
 * Regra master:
 * - tem video? => VÍDEO (mesmo se tiver ebook junto)
 * - não tem video e tem ebook/link? => EBOOK
 */
function buildComboData() {
  const comboVideos = [];
  const comboEbooks = [];

  // receitas por categoria
  categorias.forEach(cat => {
    const receitas = receitasPorCategoria[cat.id] || [];
    receitas.forEach((rec, idx) => {
      const video = pickVideo(rec);
      const ebook = pickEbook(rec);
      const thumb = pickThumb(rec);

      const baseItem = {
        source: "combo",
        deliverable_key: "super_combo_100_videos",
        categoria: cat.titulo,
        categoria_id: cat.id,
        categoria_slug: cat.slug,
        ordem: idx + 1,
        nome: pickName(rec),
        descricao: pickDesc(rec),
        thumb,
        video: video || null,
        ebook: ebook || null,
      };

      if (video) {
        comboVideos.push({ ...baseItem, tipo: "video" });
      } else if (ebook) {
        comboEbooks.push({ ...baseItem, tipo: "ebook" });
      }
    });
  });

  // ebooks destacados (sempre ebook, pq não têm video)
  ebooksDestacados.forEach((eb, idx) => {
    const ebook = pickEbook(eb);
    if (!ebook) return;

    comboEbooks.push({
      source: "combo",
      deliverable_key: "super_combo_100_videos",
      categoria: "E-books Especiais do Combo",
      categoria_id: -1,
      categoria_slug: "ebooks_especiais",
      ordem: idx + 1,
      tipo: "ebook",
      nome: pickName(eb),
      descricao: pickDesc(eb),
      thumb: pickThumb(eb),
      video: null,
      ebook,
    });
  });

  return {
    comboVideos,
    comboEbooks,
    comboFlattened: [...comboVideos, ...comboEbooks],
  };
}

/* ===============================
   FUNÇÃO PRINCIPAL (CHAMADA PELO INDEX)
   - SEM UI
================================*/
export function mount(container, ctx) {
  // NÃO renderiza combo na UI
  if (container) container.innerHTML = "";

  // valida acesso ao combo pelo deliverable_key
  const possuiCombo = Array.isArray(ctx.products) && ctx.products.some(
    (p) => (p.deliverable_key || p.deliverableKey) === ctx.deliverableKey
  );

  if (!possuiCombo) {
    ctx.comboVideos = [];
    ctx.comboEbooks = [];
    ctx.comboFlattened = [];
    return;
  }

  // EXTRAÇÃO E ENTREGA PARA O INDEX
  const data = buildComboData();
  ctx.comboVideos = data.comboVideos;
  ctx.comboEbooks = data.comboEbooks;
  ctx.comboFlattened = data.comboFlattened;

  // debug opcional
  window.__comboData = window.__comboData || {};
  window.__comboData[ctx.deliverableKey] = data;

  console.log("✅ comboVideos:", ctx.comboVideos.length);
  console.log("✅ comboEbooks:", ctx.comboEbooks.length);
}



