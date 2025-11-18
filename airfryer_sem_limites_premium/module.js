// super_combo_100_videos/module.js

/**
 * Módulo para o deliverable_key "super_combo_100_videos".
 *
 * Contrato com o index (já está pronto no index.html):
 * - exporta: function mount(container, ctx)
 * - ctx:
 *    - ctx.email
 *    - ctx.products
 *    - ctx.deliverableKey        -> "super_combo_100_videos"
 *    - ctx.openDriveModal(url, title)
 *    - ctx.toDrivePreview(url)
 *
 * Lógica:
 * - 10 categorias
 * - cada categoria com ~10 receitas
 * - cada receita pode ter:
 *    - só vídeo
 *    - só ebook
 *    - vídeo + ebook juntos
 * - A UI mostra botões de acordo com o que a receita tem.
 */

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

/* ====== DEFINIÇÃO DAS CATEGORIAS (10) ======
   Aqui você só descreve a "capa" da categoria.
   O conteúdo (receitas) entra na const receitasPorCategoria logo abaixo.
*/
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
    slug: 'classicos_dia_dia',
    titulo: 'Clássicos do dia a dia',
    descricaoCurta: 'Arroz, frango, legumes… tudo que resolve a vida sem pensar muito.',
    imagemCategoria: 'https://drive.google.com/file/d/11uDv6HV-gSATp-d1LrWce08JM4KYTaVa/view?usp=drive_link',
  },
  {
    id: 2,
    slug: 'lanches_rapidos',
    titulo: 'Lanches rápidos & snacks',
    descricaoCurta: 'Coxinha, pão de queijo, nuggets e muito mais.',
    imagemCategoria: 'https://drive.google.com/file/d/1JkvW1zdTijdDZYDQqTckV0q_eujQgdiH/view?usp=drive_link',
  },
  {
    id: 3,
    slug: 'zero_oleo_fit',
    titulo: 'Zero óleo & fit',
    descricaoCurta: 'Receitas levinhas sem perder o sabor.',
    imagemCategoria: 'https://drive.google.com/file/d/1JaD6sEX6EV13TG01ZkscmCJf1cjVcoIO/view?usp=drive_link',
  },
  {
    id: 4,
    slug: 'cafe_manha',
    titulo: 'Café da manhã turbo',
    descricaoCurta: 'Ideias rápidas pra começar o dia bem.',
    imagemCategoria: 'https://drive.google.com/file/d/13baDB_HNv8rfg_NGvpHkzHP_ZjYFdS26/view?usp=drive_link',
  },
  {
    id: 5,
    slug: 'jantar_pratico',
    titulo: 'Jantar prático',
    descricaoCurta: 'Pratos fáceis pra noite corrida.',
    imagemCategoria: 'https://drive.google.com/file/d/15m-AtVxRvlYkNlrL7aHt-jr_-cEgTYD_/view?usp=drive_link',
  },
  {
    id: 6,
    slug: 'crocantes_perfeitos',
    titulo: 'Crocantes perfeitos',
    descricaoCurta: 'Batata, frango crispy, empanados…',
    imagemCategoria: 'https://drive.google.com/file/d/102MOS0EOlKoDNMaBFxLwTP4UQsDJiI4U/view?usp=drive_link',
  },
  {
    id: 7,
    slug: 'refeicoes_2_pessoas',
    titulo: 'Refeições para duas pessoas',
    descricaoCurta: 'Sem desperdício e na medida certa.',
    imagemCategoria: 'https://drive.google.com/file/d/13dJa_-_6Qdl5nRS_oE69dVV33s8sKAGn/view?usp=drive_link',
  },
  {
    id: 8,
    slug: 'doces_sem_bagunça',
    titulo: 'Doces sem bagunça',
    descricaoCurta: 'Sobremesas rápidas e práticas.',
    imagemCategoria: 'https://drive.google.com/file/d/1_ik-qs45tNBtmRaJBQeqDik6o7TBV7UK/view?usp=drive_link',
  },
  {
    id: 9,
    slug: 'releituras_panela',
    titulo: 'Releituras da panela',
    descricaoCurta: 'Versões adaptadas pra Air Fryer e práticas.',
    imagemCategoria: 'https://drive.google.com/file/d/1qf6hMZQcDRfAjNA3AhU8gEq-lXFMb1CE/view?usp=drive_link',
  },
];

/* ====== RECEITAS POR CATEGORIA ======
   Aqui entra a parte "tipo banco" que você já tinha.
   Cada entrada do array é uma receita.
   Campos:
   - nome
   - descricao
   - imagem
   - video (opcional)
   - ebook (opcional)
   A lógica usa:
   - se tiver video && ebook   => 2 botões
   - se tiver só video         => 1 botão de vídeo
   - se tiver só ebook         => 1 botão de ebook
*/
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
        { nome:'Carne moída + Air Fryer', descricao:'Meu jantar mais fácil de todos os tempos!', imagem:'https://drive.google.com/file/d/14tmRObMistPNrH1hRzcXNWgd8Qgp7mSz/view?usp=drive_link', video:'https://drive.google.com/file/d/1Z7ZwUoimF8pz5_YqN2DnVY6xZVyysVim/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1ObxOc2LRENm9p3fc2ZrnsgFjEV3i-H36/view?usp=drive_link' },
        { nome:'Suflê de batata', descricao:'Se você tem uma Air Fryer, precisa experimentar isso hoje mesmo!', imagem:'https://drive.google.com/file/d/1RaVjRKNVgL67KHXy6VqiUNc4jeEh3qEm/view?usp=drive_link', video:'https://drive.google.com/file/d/1seuypdzHRNBPVvfH-RK3HpV4XSmESEmN/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1o0Vm67_WxNM5wcgUEguzMnG346qjrKGr/view?usp=drive_link' },
        { nome:'Lombo Recheado', descricao:'Esta receita fácil de Air Fryer vai te impressionar e surpreender seus convidados!', imagem:'https://drive.google.com/file/d/1exQQ_Bcmb3qQbTxKjmGgxE3Pijrh-Bae/view?usp=drive_link', video:'https://drive.google.com/file/d/1HKCTHRE4PMPnYlC2qTTDg5QEO5aJv4c-/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1qalrQmip0GnvsyFuSmtWPtxQjPK8lavy/view?usp=drive_link' },
        { nome:'Cebola Crocante', descricao:'Você nunca comeu cebolas assim (mágica da fritadeira a ar!)', imagem:'https://drive.google.com/file/d/1N6eFIjBJB-PnwzzAThYlkTe6KYYLyOte/view?usp=drive_link', video:'https://drive.google.com/file/d/1FX21X-XYYR2Y5Z0QoPwjcZg5_QszDqiV/view?usp=drive_link', ebook:'https://drive.google.com/file/d/15l-dUYr9hpevR4IvOVAMETb2sHRVI9UU/view?usp=drive_link' },
        { nome:'Batatas e Atum', descricao:'Você Tem Que Experimentar Isso!', imagem:'https://drive.google.com/file/d/1j5_Ys-K-GdezH-Fs74s78nyUx_E5m4HG/view?usp=drive_link', video:'https://drive.google.com/file/d/1qMp1bL0H4SS47GkuHGw8kiZgy_QtlGwh/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1BAduWoglBCQfXwYXU8DDHVuEtNEwaOI7/view?usp=drive_link' },
        { nome:'Abóbora á Milanesa', descricao:'Abóbora + Descascador + Fritadeira a Ar = Surpreendente!', imagem:'https://drive.google.com/file/d/13sgna13xWEBpMHlMRq8pWgNF-y0Gb2qv/view?usp=drive_link', video:'https://drive.google.com/file/d/1MtuU5JanGPrKE_HniBklGKMNLk-UnENc/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1aMxUchoJfhuLbiMjU24aFMYrMB6EzUfg/view?usp=drive_link' },
        { nome:'Batata Recheada', descricao:'Essa ideia de batata na Air Fryer ficou TÃO boa!', imagem:'https://drive.google.com/file/d/1dTGjNSUhgJv32gHt4Bmo7AFgoK7KV2ky/view?usp=drive_link', video:'https://drive.google.com/file/d/16-7EGRIFs_jH3ksHaMEX6N1dQ6xDW0gw/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1GhuaaOYluim2uHi_tnCmQDlWbb4_ZqXN/view?usp=drive_link' },
        { nome:'Arroz na AirFryer', descricao:'Você Tem Que Experimentar Isso!', imagem:'https://drive.google.com/file/d/197nWRwsyTPQLUP7pKI4Rl20P-p9NI6Z0/view?usp=drive_link', video:'https://drive.google.com/file/d/19MjY-8RGmWK-jzvf1ZVKObttPw46_Hu1/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1sNBz8IEJITpliJrGklgazOlzZUK92m9C/view?usp=drive_link' },
        { nome:'Torresmo', descricao:'Você Tem Que Experimentar Isso!', imagem:'https://drive.google.com/file/d/1WjBh26ZAjqhe3mdZW4pRX44TPNF0cxiS/view?usp=drive_link', video:'https://drive.google.com/file/d/1YUZJqhLH_zNTlyuXkElz0jjToMKJ8N4j/view?usp=drive_link', ebook:'https://drive.google.com/file/d/12cmZxUnKLFp3RYB4kk9MSAIllxQkYKvm/view?usp=drive_link' },
        { nome:'Lasanha a Bolonhesa', descricao:'Você Tem Que Experimentar Isso!', imagem:'https://drive.google.com/file/d/1N55lKQ7rtw-P-HgXYdJ39W3HHA6JUu93/view?usp=drive_link', video:'https://drive.google.com/file/d/1-OOGjsVPnORgRLxftHZjZGwrXi5oxfJu/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1yb9aB52jaYK513067t_F7JSFE3_Xegpn/view?usp=drive_link' }
      ],
      2: [
        { nome:'Pão Com Ovo Gourmet ', descricao:'Aproveitem e experimentem esta deliciosa e simples receita de café da manhã na Air Fryer!', imagem:'https://drive.google.com/file/d/11W_Yv8HNgiXMYYFLcg0UzpYEd8ptNFD1/view?usp=drive_link', video:'https://drive.google.com/file/d/1AMtL7AQ0gTQUhKFd2sTEqzm0wAzLSja7/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1rks_zTohqjxAWCereqMyOEpoQgs4pdR5/view?usp=drive_link' },
        { nome:'Misto Quente À Moda Espanhola', descricao:'Crocante, suculento e pronto em minutos! ', imagem:'https://drive.google.com/file/d/1Z3Hwgw62ikRXStMMT7OIOrKrqfhXaTKg/view?usp=drive_link', video:'https://drive.google.com/file/d/1uJmSbaDhFu-SnoMKxyVQEKCZzm7s5FfS/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1TNCKgZbCXWKxRfFgYbrEI-dkC6NH6D0e/view?usp=drive_link' },
        { nome:'Anéis De Abobrinha A Milanesa', descricao:'Divirta-se reproduzindo esta deliciosa receita de abobrinha na Air Fryer!', imagem:'https://drive.google.com/file/d/1UPWK4IttKTI4v76kEaSPUq5sjYbm2dpK/view?usp=drive_link', video:'https://drive.google.com/file/d/13l722_kMla0slA4dCYjfGvySTr6BoHC9/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1IenVMFWAH52GWURE7npWw1CE885R8Hxp/view?usp=drive_link' },
        { nome:'Sanduíche De Atum Com Tortilhas (Rap 10)', descricao:'Outra Receita Fácil Que Todo Mundo Está Fazendo Agora!', imagem:'https://drive.google.com/file/d/1_buSZ0Ij3rC76Nr2cIZlGNWvKsBL7fLm/view?usp=drive_link', video:'https://drive.google.com/file/d/1fKcxx5ZH0IPBjZcUUnrc-i63jyleA1Rt/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1JuNdDfW4X11kXA08KEzdCCeCl6p6l6J5/view?usp=drive_link' },
        { nome:'Hambúrguer De Carne Bovina Com Vegetais', descricao:'Crocante, suculento e pronto em minutos! ', imagem:'https://drive.google.com/file/d/1-h5TsGJfepZF3cLYyeHJlSzu2AvvseCN/view?usp=drive_link', video:'https://drive.google.com/file/d/1-CEPOTkHt92PUC7E_Adkern4aWFD8BGZ/view?usp=drive_link', ebook:'https://drive.google.com/file/d/18wffSgIefCYRqgXkkgcc9GC8Q0gf1M3j/view?usp=drive_link' },
        { nome:'Bolinho De Carne Com Queijo ', descricao:'Uma deliciosa receita de jantar na Air Fryer ', imagem:'https://drive.google.com/file/d/1I82Fm07ph6JFWfIGuGZVsz4tieP0ahzI/view?usp=drive_link', video:'https://drive.google.com/file/d/1usRYfMpWwNWTmQVj7ZPEZL6KXYz3bZET/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1ekMZmqQdNPOluQMWlg4Po97pHTau36M-/view?usp=drive_link' },
        { nome:'Rocambole De Carne Moída Suculento', descricao:'Esta receita de Rocambole de carne na air fryer ', imagem:'https://drive.google.com/file/d/1AItiSeSD-3IUpEuqtNQHlQiaDWzijiIl/view?usp=drive_link', video:'https://drive.google.com/file/d/1_xNsgQZCb1MVznJalwqXV_k2_95bbVW-/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1-JE3Q28HtWd3tVgJcrmOv4284rChpmCr/view?usp=drive_link' },
        { nome:'Batatas Rápidas e Fáceis na Air Fryer', descricao:'Esta receita de batata na Air Fryer se tornou viral – pronta em minutos!', imagem:'https://drive.google.com/file/d/1ntW7-XB9br-EHig3gJMWT80RBRbln7uf/view?usp=drive_link', video:'https://drive.google.com/file/d/1JtEY_5xuDaTQLF5XYQkIcCcoiVMCMdMi/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1teWLkSEGiedbh0HWK0K1lR88H1cViCnZ/view?usp=drive_link' },
        { nome:'Misto Quente Crocante', descricao:'Crocante, suculento e pronto em minutos! ', imagem:'https://drive.google.com/file/d/1o3tKhhpzia1ozQ-ZdOIASwNsPDIfv6nk/view?usp=drive_link', video:'https://drive.google.com/file/d/1f_Eo9v0U3ZAgbvy-yCIadhkb1h3FuFgu/view?usp=drive_link', ebook:'https://drive.google.com/file/d/12vl3eBTUjwks5OlDNccv9dTPM-1R4sfJ/view?usp=drive_link' },
        { nome:'Ciabatta na Air Fryer ', descricao:'Outra Receita Fácil Que Todo Mundo Está Fazendo Agora!', imagem:'https://drive.google.com/file/d/1KddLzifD_pViBeLQRdMfg_-_K5A4umw0/view?usp=drive_link', video:'https://drive.google.com/file/d/1skzvOfxPrm6fluiC85eA154CZ-QCu5a7/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1jdcg9NYwsqtY_qMAP2KBy1zHNS9XlEwt/view?usp=drive_link' }
       
      ],
      3: [
        { nome:'Frango Com Brócolis', descricao:'Muito Saboroso!', imagem:'https://drive.google.com/file/d/19I6gYt_0oEwsZcUOsO7DBk9WMZ7h1BZw/view?usp=drive_link', video:'https://drive.google.com/file/d/1C0mh1MWYMmh3gA0qAqN3GKZ33Cd1iHRZ/view?usp=drive_link', ebook:'https://drive.google.com/file/d/10JPWnjp9M_lAvoINMqUFnq-XCnnumM2w/view?usp=drive_link' },
        { nome:'Legumes Assados Na Airfryer', descricao:'Muito Saboroso!', imagem:'https://drive.google.com/file/d/18S70gSU4oST_0ZU_QW_qQAe8otoScNT_/view?usp=drive_link', video:'https://drive.google.com/file/d/1kBnmy3SfDPJlPCKre4MfddigFdMYbUW4/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1xwL_sPspdVzf7C4ZY0SVuT9oi3QaeKKD/view?usp=drive_link' },
        { nome:'Frango Com Aspargos Na Air Fryer', descricao:'Rápido E Fácil De Fazer!', imagem:'https://drive.google.com/file/d/1vEU8QoZpcroOJLRCDaYs2bUTl7Z3oEqU/view?usp=drive_link', video:'https://drive.google.com/file/d/1C0mh1MWYMmh3gA0qAqN3GKZ33Cd1iHRZ/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1FGuT9UfiAIXAntZ-GVYoM0e8-SkNBT59/view?usp=drive_link' },
        { nome:'Omelete Simples Na Airfryer ', descricao:'Rápido E Fácil De Fazer!', imagem:'https://drive.google.com/file/d/1eHVF4MInvKCjcl3AW7FH58zPXz9R3VMO/view?usp=drive_link', video:'https://drive.google.com/file/d/1OmTGQTtHQWm3YCEhC3ERu0FMQI2uDrGa/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1qjGfh4uWjtKNwj8E4rRRt70tE2mE6gmt/view?usp=drive_link' },
        { nome:'Coxinha De Frango Fit Na Airfryer ', descricao:'Sem Massa E Com Requeijão', imagem:'https://drive.google.com/file/d/1kofS4GP4-cZTSg3T64PKFtOd0MikbSrO/view?usp=drive_link', video:'https://drive.google.com/file/d/1HGDoZEo7XDVlDb-gSLmXQXdnC4OK4j0A/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1FVVJhs-8h2hVlAWWTRAnt9OMXNcZWlYN/view?usp=drive_link' },
        { nome:'Segredo Do Bife De Couve-Flor', descricao:'O melhor!', imagem:'https://drive.google.com/file/d/1C7Njr4TbHBnsBZodoER5W0X0BZZKuXO_/view?usp=drive_link', video:'https://drive.google.com/file/d/1eYY_UbsMzeBR9PA6qKI2QUDyrkRcqevy/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1o8TQouIPe2qIXk2i_ORsRNpRD2KxlpFK/view?usp=drive_link' },
        { nome:'Torta De Repolho', descricao:'Minha Versão Rápida E Aconchegante Da Noite Da Pizza ', imagem:'https://drive.google.com/file/d/1tpI4QZh3u-q5KboBCuqDGhPhUs9GI67Z/view?usp=drive_link', video:'https://drive.google.com/file/d/1n09IcM1XY9lylmwqQIpDBAGhxhJjU571/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1mfa-ojRIVf9kW4vGNav7-iy8VThOyab0/view?usp=drive_link' },
        { nome:'Tomate Recheado E Assado', descricao:'Suculentos, Dourados E Suavemente Perfumados', imagem:'https://drive.google.com/file/d/1y9hgjk8o-O0AIhD4Urh9D5OJqPetsWGu/view?usp=drive_link', video:'https://drive.google.com/file/d/1fMHJ6cSUB3NXxzm5ZJChBGKqX7Exfatj/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1uTBvM19Lmr9CPiNUiCc87fHT9NdwLmPk/view?usp=drive_link' },
        { nome:'Casserole De Ovos E Legumes', descricao:'Tomates Suculentos, Manjericão Fresco, Pimentões Doces E Mozzarella Derretida ', imagem:'https://drive.google.com/file/d/127ijEIAJZS-uAucH_-Q3sS9q6BVdNz8u/view?usp=drive_link', video:'https://drive.google.com/file/d/1w9pndDd-rQ6u37_USmleAF75ulPAcCtv/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1QFY2Y2ldi4Q0Xr0CNQC4mUOyo9ncGCWv/view?usp=drive_link' },
        { nome:'Beringelas Recheadas E Assadas', descricao:'Douradas, Macias E Cheias De Calor — Essas Berinjelas Recheada!', imagem:'https://drive.google.com/file/d/1EW3JfeGqwujbQr2R0xghCbLyQ6m7FXKv/view?usp=drive_link', video:'https://drive.google.com/file/d/1UJqFTq1HJ2vtx7at-xvdfPk2KpWrWWz8/view?usp=drive_link', ebook:'https://drive.google.com/file/d/1OsdW4KPThJ3Xj_4McyMV_dvjgrA0keuz/view?usp=drive_link' }
      ],
      4: [
        { nome:'Coxinha Recheada', descricao:'Crosta crocante, recheio cremoso e sabor irresistível em cada mordida.', imagem:'salgados/Coxinha Recheada.jpg', video:'https://drive.google.com/file/d/1AY9YB4kx6DfPiZ7eBPDKwjnugZ8ENg7H/view?usp=drive_link', ebook:'salgados/2_1-Coxinha-Recheada.png' },
        { nome:'Pão com Creme', descricao:'Pão caseiro fofinho com recheio cremoso e dourado, perfeito para qualquer lanche.', imagem:'salgados/Pão com Creme.jpg', video:'https://drive.google.com/file/d/1V4T2AHs-aCKiB20EwPC8C424uFluvWvm/view?usp=drive_link', ebook:'salgados/3_2-Pao-com-Creme.png' },
        { nome:'Pão de Alho Diferente', descricao:'Versão especial com tempero marcante e textura perfeita — crocante por fora e macio por dentro.', imagem:'salgados/Pão de Alho Diferente.jpg', video:'https://drive.google.com/file/d/1a14AosP02qAfScHH5MadWXPsFFUgrqg-/view?usp=drive_link', ebook:'salgados/4_3-Pao-de-Alho-Diferente.png' },
        { nome:'Pão Recheado com Carne de Porco', descricao:'Massa leve e recheio suculento, uma combinação rústica e irresistível.', imagem:'salgados/Pão Recheado com Carne de Porco.jpg', video:'https://drive.google.com/file/d/1QDBJwVp25puF9ZPn_o3s060H4oRnjWFm/view?usp=drive_link', ebook:'salgados/5_4-Pao-Recheado-com-Carne-de-Porco.png' },
        { nome:'Receita de Kafta Deliciosa', descricao:'Tempero oriental equilibrado e carne macia no ponto certo, feita em minutos.', imagem:'salgados/Receita de Kafta Deliciosa.jpg', video:'https://drive.google.com/file/d/1qf2__3eMLli32Y60OqaW1SrQ4JrPwWhR/view?usp=drive_link', ebook:'salgados/6_5-Receita-de-Kafta-Deliciosa.png' },
        { nome:'Rocambole de Batata com Carne', descricao:'Camada cremosa de batata enrolando um recheio rico e saboroso.', imagem:'salgados/Rocambole de Batata com Carne.jpg', video:'https://drive.google.com/file/d/1uU_z_FnXfgngOv0UXq7sPyqq6DDNHWkD/view?usp=drive_link', ebook:'salgados/7_6-Rocambole-de-Batata-com-Carne.png' },
        { nome:'Torta de Camarão', descricao:'Recheio cremoso, aroma marcante e massa leve — um clássico que impressiona.', imagem:'salgados/Torta de Camarão.jpg', video:'https://drive.google.com/file/d/13wqcs60kbWuVUJKI_ISCii6TfVHIYqEJ/view?usp=drive_link', ebook:'salgados/8_7-Torta-de-Camarao.png' },
        { nome:'Torta de Esfirra', descricao:'Todo o sabor da esfirra tradicional em uma versão prática e cheia de recheio.', imagem:'salgados/Torta de Esfirra (versão 2).jpg', video:'https://drive.google.com/file/d/11v5KptHvpV--wb62DBEvYze1hTvB3GRz/view?usp=drive_link', ebook:'salgados/9_8-Torta-de-Esfirra-versao-1.png' },
        { nome:'Torta de Linguiça', descricao:'Massa fofa, recheio bem temperado e sabor intenso que conquista em cada fatia.', imagem:'salgados/Torta de Linguiça.jpg', video:'https://drive.google.com/file/d/1Io-v3J3s_-WLIjpjbrpALD07gbXrZvy4/view?usp=drive_link', ebook:'salgados/11_10-Torta-de-Linguica.png' }
      ],
      5: [
        { nome:'Bife ao Molho de Queijo', descricao:'Carne suculenta coberta por um molho cremoso e irresistível de queijo derretido.', imagem:'molhos/Bife ao Molho de Queijo.jpg', video:'https://drive.google.com/file/d/1w-SQiQZCSMZxS8z0vhwWXNCsb2KX-luj/view?usp=drive_link', ebook:'molhos/1_Molho-Cremoso-de-Queijo-Paginatto.png' },
        { nome:'Caldo de Azeitona', descricao:'Sabor intenso e textura aveludada, perfeito para acompanhar massas e carnes.', imagem:'molhos/Caldo de Azeitona.jpg', video:'https://drive.google.com/file/d/11FsnExHGFBHrSa02DIKbTMxT6juHkgac/view?usp=drive_link', ebook:'molhos/2_Caldo-de-Azeitona.png' },
        { nome:'Creme de Milho', descricao:'Leve, cremoso e com sabor caseiro que combina com qualquer prato.', imagem:'molhos/Creme de Milho.jpg', video:'https://drive.google.com/file/d/1Xjv82jzbbCFqMLkUcSsIBJimyTeEFaTw/view?usp=drive_link', ebook:'molhos/3_Creme-de-Milho.png' },
        { nome:'Molho Barbecue', descricao:'Equilíbrio entre o doce e o defumado, ideal para carnes, hambúrgueres e grelhados.', imagem:'molhos/Molho Barbecue.jpg', video:'https://drive.google.com/file/d/1mwI0232ZYbP3P55xFKvwViD52E7zfBnt/view?usp=drive_link', ebook:'molhos/4_Molho-Barbecue.png' },
        { nome:'Molho de Mostarda e Mel', descricao:'Combinação agridoce clássica que realça o sabor de saladas, frangos e sanduíches.', imagem:'molhos/Molho de Mostarda e Mel.jpg', video:'https://drive.google.com/file/d/1rfQnD6YO54eAKXGncgj0rkYOm1yP2Cg7/view?usp=drive_link', ebook:'molhos/5_Molho-de-Mostarda-e-Mel.png' },
        { nome:'Molho de Pimenta Saboroso', descricao:'Feito de forma rápida, com sabor encorpado e aroma irresistível de temperos frescos.', imagem:'molhos/Molho de Pimenta Saboroso.jpg', video:'https://drive.google.com/file/d/1a8IMbVL84opHiFVAcUEehnNcow4dhFSH/view?usp=drive_link', ebook:'molhos/6_Molho-de-Pimenta-Saboroso.png' },
        { nome:'Molho de Tomate na Panela de Pressão', descricao:'Feito de forma rápida, com sabor encorpado e aroma irresistível de temperos frescos.', imagem:'molhos/Molho de Tomate na Panela de Pressão.jpg', video:'https://drive.google.com/file/d/1_MRUBcEHxY-2IJGic8ZDJqljPi9x5Kyk/view?usp=drive_link', ebook:'molhos/7_Molho-de-Tomate-na-Panela-de-Pressao.png' },
        { nome:'Molho Secreto do Big Mac', descricao:'Versão caseira do clássico mais famoso do mundo, cremosa e cheia de sabor.', imagem:'molhos/Molho Secreto do Big Mac.jpg', video:'https://drive.google.com/file/d/1G_zAjQXNymR8O59yZcYTEHIVeE7mL0NF/view?usp=drive_link', ebook:'molhos/8_Molho-Secreto-do-Big-Mac.png' },
        { nome:'Molho Verde para Frutos do Mar', descricao:'Refrescante e levemente ácido, perfeito para acompanhar peixes e camarões.', imagem:'molhos/Molho Verde para Frutos do Mar.jpg', video:'https://drive.google.com/file/d/1oMAqD5ydlaLHs_vuJnarDbfDYH7Je_i6/view?usp=drive_link', ebook:'molhos/9_Molho-Verde-para-Frutos-do-Mar.png' },
        { nome:'Molho Verde para Saladas', descricao:'Textura leve e sabor equilibrado, ideal para dar vida a qualquer salada.', imagem:'molhos/Molho Verde para Saladas.jpg', video:'https://drive.google.com/file/d/1yK2wi15f2_5RWmAgfnAgFaMuNbtQHHut/view?usp=drive_link', ebook:'molhos/10_Molho-Verde-para-Saladas.png' }
      ],
      6: [
        { nome:'Arroz do Sushi', descricao:'Base essencial da culinária japonesa, com textura e tempero perfeitos para moldar sushis e temakis.', imagem:'sushi/Arroz do Sushi.jpg', video:'https://drive.google.com/file/d/1owYkTM4BOHK14SxTF5foZDv3nWHYvotP/view?usp=drive_link', ebook:'sushi/2_1-Aprenda-a-Fazer-o-Shari-Arroz-do-Sushi.png' },
        { nome:'Cortar um Sashimi de Salmão', descricao:'Técnica profissional explicada passo a passo para obter cortes delicados e uniformes.', imagem:'sushi/Cortar um Sashimi de Salmão.jpg', video:'https://drive.google.com/file/d/1eZlu-aLfjLJQOjTNuvfeiMLSq_EWYQTy/view?usp=drive_link', ebook:'sushi/3_2-Como-Cortar-um-Sashimi-de-Salmao.png' },
        { nome:'Hot Roll Crispy', descricao:'Empanado crocante.', imagem:'sushi\\hot toll.jpg', video:'https://drive.google.com/file/d/1ePefgV5OJZ_s80cxQvS_R3UCt9noOuqF/view?usp=drive_link', ebook:'sushi/4_3-Hot-Roll-Filadelfia.png' },
        { nome:'Missoshiro', descricao:'Sopa tradicional japonesa feita com missô, tofu e cebolinha, leve e reconfortante.', imagem:'sushi/Missoshiro.jpg', video:'https://drive.google.com/file/d/1Xd-YYwhTK4_THl9qxQJKt0fh5Fqhx1sR/view?usp=drive_link', ebook:'sushi/5_4-Missoshiro.png' },
        { nome:'Receita de Guioza', descricao:'Pastéis japoneses recheados e selados com crocância por fora e suculência por dentro.', imagem:'sushi/Receita de Guioza.jpg', video:'https://drive.google.com/file/d/1-iWtN4aJVQHz4hMJqRy7U0n9ZUYpP4qS/view?usp=drive_link', ebook:'sushi/6_5-Receita-de-Guioza.png' },
        { nome:'Hossomaki Tradicional', descricao:'Enrolado fino e elegante com arroz, alga nori e recheio clássico de peixe fresco.', imagem:'sushi/Hossomaki.jpg', video:'https://drive.google.com/file/d/1bgfVGZboaGRm3sdurK0AUjQHSr3hxr8a/view?usp=drive_link', ebook:'sushi/7_6-Sushi-Hossomaki-Tradicional.png' },
        { nome:'Temaki de Cream Cheese e Salmão', descricao:'Cone de alga crocante recheado com arroz e salmão fresco, finalizado com cream cheese.', imagem:'sushi/temaki.jpg', video:'https://drive.google.com/file/d/1OOb68ItIG0CReaax_diC_ZFA806_TIsE/view?usp=drive_link', ebook:'sushi/8_7-Temaki-de-Cream-Cheese-e-Salmao.png' },
        { nome:'Tempurá de Camarão com Legumes', descricao:'Massa leve e crocante envolvendo camarões e legumes frescos, fritos à perfeição.', imagem:'sushi/Tempurá de Camarão.jpg', video:'https://drive.google.com/file/d/1a4ok4Sn3xbNK6ckOtE-bbl37tZl4WCF0/view?usp=drive_link', ebook:'sushi/9_8-Tempura-de-Camarao-com-Legumes.png' },
        { nome:'Yakisoba de Carne', descricao:'Macarrão oriental salteado com legumes e tiras de carne ao molho agridoce equilibrado.', imagem:'sushi/Yakisoba de Carne.jpg', video:'https://drive.google.com/file/d/1WZb2Ve1jJZLEcXvtwBjFmTN2DCYLwy7B/view?usp=drive_link', ebook:'sushi/10_9-Yakisoba-de-Carne.png' },
        { nome:'Yakitori – Espetinho Japonês', descricao:'Espetinhos grelhados e caramelizados com molho tare, típicos dos bares japoneses.', imagem:'sushi/Yakitori – Espetinho Japonês.jpg', video:'https://drive.google.com/file/d/1mKOWX--7M2p37ihQuTkrzivyzkXTiUXp/view?usp=drive_link', ebook:'sushi/11_10-Yakitori-Espetinho-Japones.png' }
      ],
      7: [
        { nome:'Arroz de Couve-Flor', descricao:'Leve, nutritivo e com baixo teor de carboidratos — perfeito para substituições saudáveis.', imagem:'receitas fit/Arroz de Couve-Flor.jpg', video:'https://drive.google.com/file/d/1wKH4qNiA-bUtfvEicnAuNJHMjhEAaVwE/view?usp=drive_link', ebook:'receitas fit/Arroz de Couve-Flor.png' },
        { nome:'Bolinho Chocolatudo Saudável', descricao:' Textura macia e sabor intenso de chocolate, feito com ingredientes leves e funcionais.', imagem:'receitas fit/Bolinho Chocolatudo Saudável.jpg', video:'https://drive.google.com/file/d/1IwfgLJ5bni2vGnqDxcIXDseDgNluhWen/view?usp=drive_link', ebook:'receitas fit/3_2-Bolinho-Chocolatudo-Saudavel.png' },
        { nome:'Enroladinho de Rap 10', descricao:'Rápido, prático e versátil — ideal para um lanche leve ou refeição expressa.', imagem:'receitas fit/Enroladinho de Rap 10.jpg', video:'https://drive.google.com/file/d/1B4FPKbT9kxIoPQ4emwkHK03QDJK1A5OM/view?usp=drive_link', ebook:'receitas fit/4_3-Enroladinho-de-Rap-10.png' },
        { nome:'Lasanha de Abobrinha', descricao:'Camadas leves, saborosas e sem massa, com muito recheio e molho cremoso.', imagem:'receitas fit/Lasanha de Abobrinha.jpg', video:'https://drive.google.com/file/d/16IP7Q0yFKZ7cFEWv_Ql4UdB0VYd2drSR/view?usp=drive_link', ebook:'receitas fit/5_4-Lasanha-de-Abobrinha.png' },
        { nome:'Muffin de Legumes', descricao:'Colorido, nutritivo e fácil de preparar — ótimo para lanches e marmitas.', imagem:'receitas fit/Muffin de Legumes.jpg', video:'https://drive.google.com/file/d/1S-Z3xI2p9dksVCC6epo64aPHBKoDrcf-/view?usp=drive_link', ebook:'receitas fit/6_5-Muffin-de-Legumes.png' },
        { nome:'Pão de Queijo de Frigideira', descricao:'Versão rápida do clássico mineiro, pronta em minutos e com casquinha crocante.', imagem:'receitas fit/Pão de Queijo de Frigideira.jpg', video:'https://drive.google.com/file/d/1m1NvTOeePRvwMTCOuLO8pe8VvVO7PqqH/view?usp=drive_link', ebook:'receitas fit/7_6-Pao-de-Queijo-de-Frigideira.png' },
        { nome:'Pão Rápido de Banana e Aveia', descricao:'Doce natural, sem farinha e cheio de fibras — ideal para o café da manhã.', imagem:'receitas fit/Pão Rápido de Banana e Aveia.jpg', video:'https://drive.google.com/file/d/1lamHvWutBfYkkd9FwJaVMUVxQQTjdDpK/view?usp=drive_link', ebook:'receitas fit/8_7-Pao-Rapido-de-Banana-e-Aveia.png' },
        { nome:'Patê de Frango', descricao:'Cremoso e bem temperado, combina com torradas, pães e sanduíches naturais.', imagem:'receitas fit/Patê de Frango.jpg', video:'https://drive.google.com/file/d/1YS-qLafsx58qlLkRRLwuLjU-3e4wyILS/view?usp=drive_link', ebook:'receitas fit/9_8-Pate-de-Frango.png' },
        { nome:'Salada de Grão-de-Bico', descricao:' Refrescante, proteica e colorida, perfeita para acompanhar qualquer prato.', imagem:'receitas fit/Salada de Grão-de-Bico.jpg', video:'https://drive.google.com/file/d/1vXUkdk3HNcW4RwyL7Vi90JrHADR7Lb2L/view?usp=drive_link', ebook:'receitas fit/10_9-Salada-de-Grao-de-Bico.png' },
        { nome:'Suco Verde', descricao:'Bebida detox e revitalizante, com combinação equilibrada de frutas e folhas.', imagem:'receitas fit/Suco Verde.jpg', video:'https://drive.google.com/file/d/1LJntVUvGthxXX_dw6O7UhR7my5h2NPAC/view?usp=drive_link', ebook:'receitas fit/11_10-Suco-Verde.png' }
      ],
      8: [
        { nome:'Arroz com Lentilha', descricao:'Clássico simples e nutritivo, com sabor caseiro e textura soltinha perfeita.', imagem:'top 10 noite de jantar/Arroz com Lentilha.jpg', video:'https://drive.google.com/file/d/1DDNE3szM_szMKasdZTWJ9RhGGYxgOylf/view?usp=drive_link', ebook:'top 10 noite de jantar/1_1-Arroz-com-Lentilha.png' },
        { nome:'Bacalhau à Lagareiro', descricao:'Receita tradicional portuguesa, com bacalhau dourado, batatas e muito azeite.', imagem:'top 10 noite de jantar/Bacalhau à Lagareiro.jpg', video:'https://drive.google.com/file/d/1AuRBwvUqFzLsVIe2DSO8hK990l0OJ-rc/view?usp=drive_link', ebook:'top 10 noite de jantar/2_2-Bacalhau-a-Lagareiro.png' },
        { nome:'Caldo de Mandioca com Linguiça', descricao:'Cremoso, encorpado e cheio de sabor — ideal para dias frios ou jantares reconfortantes.', imagem:'top 10 noite de jantar/Caldo de Mandioca com Linguiça.jpg', video:'https://drive.google.com/file/d/1ahcsTD8nFTDIQ3ux5HQAokXM1TbEwVT4/view?usp=drive_link', ebook:'top 10 noite de jantar/3_3-Caldo-de-Mandioca-com-Linguica.png' },
        { nome:'Feijão Branco com Linguiça', descricao:'Combinação rústica e saborosa, com caldinho espesso e tempero caseiro irresistível.', imagem:'top 10 noite de jantar/Feijão Branco com Linguiça.jpeg', video:'https://drive.google.com/file/d/1ixIyNQ5RtkxOrJjaspqFbQXnSqezIWWq/view?usp=drive_link', ebook:'top 10 noite de jantar/4_4-Feijao-Branco-com-Linguica.png' },
        { nome:'Feijoada Saborosa', descricao:' Clássico brasileiro completo, com carnes suculentas e tempero na medida certa.', imagem:'top 10 noite de jantar/Feijoada Saborosa.jpg', video:'https://drive.google.com/file/d/1sssSaZfmZy7SSlKno4Li8YsD5L4HoUNw/view?usp=drive_link', ebook:'top 10 noite de jantar/5_5-Feijoada-Saborosa.png' },
        { nome:'Filé de Tilápia com Molho de Limão Siciliano', descricao:' Leve e sofisticado, com molho cítrico que realça o sabor do peixe.', imagem:'top 10 noite de jantar/Filé de Tilápia.jpg', video:'https://drive.google.com/file/d/1yCOBiC-S7lD8YDxwFC0YAwBvbeOMzunn/view?usp=drive_link', ebook:'top 10 noite de jantar/6_6-File-de-Tilapia-com-Molho-de-Limao-Siciliano.png' },
        { nome:'Macarrão com Molho de Gorgonzola e Cação Gratinado', descricao:'Textura cremosa e sabor marcante, uma fusão perfeita entre massa e frutos do mar.', imagem:'top 10 noite de jantar/Macarrão.jpg', video:'https://drive.google.com/file/d/1czl_r-2pdlBDlSQ9OmCBgVglDOXxXIAq/view?usp=drive_link', ebook:'top 10 noite de jantar/7_7-Macarrao-com-Molho-de-Gorgonzola-e-Cacao-Gratinado.png' },
        { nome:'Mocotó com Feijão Branco', descricao:'Receita encorpada, nutritiva e cheia de tradição, ideal para quem gosta de sabor intenso.', imagem:'top 10 noite de jantar/Mocotó.jpeg', video:'https://drive.google.com/file/d/1o1a_41KgMlTJLaBNueY66V1EEKdeuiGq/view?usp=drive_link', ebook:'top 10 noite de jantar/8_8-Mocoto-com-Feijao-Branco.png' },
        { nome:'Ossobuco com Mandioca', descricao:'Carne macia cozida lentamente, servida com mandioca cremosa e caldo rico.', imagem:'top 10 noite de jantar/Ossobuco com Mandioca.jpg', video:'https://drive.google.com/file/d/1dYglPkiKUQnEObZQ4ederCcMYWchGAsZ/view?usp=drive_link', ebook:'top 10 noite de jantar/9_9-Ossobuco-com-Mandioca.png' },
        { nome:'Peixe Empanado e Recheado', descricao:'Camada crocante por fora e recheio suculento por dentro, perfeito para surpreender à mesa.', imagem:'top 10 noite de jantar/Peixe Empanado.jpg', video:'https://drive.google.com/file/d/1aQZJ3YRMNc3tiGxiCU01nR_9H6Ucpy5C/view?usp=drive_link', ebook:'top 10 noite de jantar/10_10-Peixe-Empanado-e-Recheado.png' }
      ],
      9: [
        { nome:'Cação com Molho de Camarão e Purê de Batata', descricao:'Peixe macio, molho cremoso e purê suave em uma combinação sofisticada e irresistível.', imagem:'top 10 almoço de domingo/Cação.jpg', video:'https://drive.google.com/file/d/1w3fWSB0V2DuG6Y025drRaodjIg7E1AoW/view?usp=drive_link', ebook:'top 10 almoço de domingo/1_1-Cacao-com-Molho-de-Camarao-e-Pure-de-Batata.png' },
        { nome:'Carne Louca', descricao:'Desfiada, bem temperada e suculenta — perfeita para sanduíches ou acompanhamentos.', imagem:'top 10 almoço de domingo/Carne Louca.jpg', video:'https://drive.google.com/file/d/1-jwc-5hf4hcVaRPvv7ylYdSAu7EpWouQ/view?usp=drive_link', ebook:'top 10 almoço de domingo/2_2-Carne-Louca.png' },
        { nome:'Coroa de Carré de Cordeiro', descricao:'Apresentação elegante, carne macia e sabor marcante para impressionar em qualquer ocasião.', imagem:'top 10 almoço de domingo/coroa.jpg', video:'https://drive.google.com/file/d/1gRRjYiVR3ZZ7MMjRvSq0F2YLUwjqh4ZX/view?usp=drive_link', ebook:'top 10 almoço de domingo/3_3-Coroa-de-Carre-de-Cordeiro.png' },
        { nome:'Cupim com Batata Suculento', descricao:'Corte nobre, cozido lentamente até desmanchar, com batatas douradas e tempero intenso.', imagem:'top 10 almoço de domingo/cupim.jpg', video:'https://drive.google.com/file/d/1OTIso0tz5nJIzspMSEaZ_AJRpt_ZMJJp/view?usp=drive_link', ebook:'top 10 almoço de domingo/4_4-Cupim-com-Batata-Suculento.png' },
        { nome:'Galeto Frito com Chimichurri', descricao:'Frango dourado e crocante servido com o toque refrescante e picante do chimichurri.', imagem:'top 10 almoço de domingo/galeto.jpg', video:'https://drive.google.com/file/d/1wWaJa0AWVpcPDgP8ThXRe28oDPWUsQ1o/view?usp=drive_link', ebook:'top 10 almoço de domingo/5_5-Galeto-Frito-com-Chimichurri.png' },
        { nome:'Mazegohan (Arroz Bege)', descricao:'Receita japonesa tradicional, leve e saborosa, com arroz temperado e ingredientes equilibrados.', imagem:'top 10 almoço de domingo/mazegohan.jpg', video:'https://drive.google.com/file/d/1amwtLsAyINwby5k9NdmeSwVevxWqwSan/view?usp=drive_link', ebook:'top 10 almoço de domingo/6_6-Mazegohan-Arroz-Bege.png' },
        { nome:'Merluza à Portuguesa', descricao:'Peixe delicado com legumes coloridos, azeite e temperos que lembram a culinária lusitana.', imagem:'top 10 almoço de domingo/merluza.jpg', video:'https://drive.google.com/file/d/1E2qelPs1S2xdq4Qrus3VOvxDxF8Ktv-J/view?usp=drive_link', ebook:'top 10 almoço de domingo/7_7-Merluza-a-Portuguesa.png' },
        { nome:'Nhoque de Mandioca com Carne Seca', descricao:'Massa leve e saborosa combinada com recheio cremoso e carne seca desfiada no ponto.', imagem:'top 10 almoço de domingo/nhoque.jpg', video:'https://drive.google.com/file/d/1CU9DQZvjpyHeCX6dmCTb_6ayMhVB5aF7/view?usp=drive_link', ebook:'top 10 almoço de domingo/8_8-Nhoque-de-Mandioca-com-Carne-Seca.png' },
        { nome:'Pimenta Cambuci Recheada', descricao:'Sabor suave e toque artesanal, com recheio cremoso que valoriza o aroma da pimenta.', imagem:'top 10 almoço de domingo/pimenta.jpg', video:'https://drive.google.com/file/d/1XmbuQ0u0_l-QPeZ4znXAFM9r6iyr9QMX/view?usp=drive_link', ebook:'top 10 almoço de domingo/9_9-Pimenta-Cambuci-Recheada.png' },
        { nome:'Yakimeshi de Camarão', descricao:'Arroz oriental salteado com legumes e camarões, leve, colorido e cheio de sabor.', imagem:'top 10 almoço de domingo/Yakimeshi.jpg', video:'https://drive.google.com/file/d/1RJmBi894J89MeAm8vKDNe41bOoXks0LO/view?usp=drive_link', ebook:'top 10 almoço de domingo/10_10-Yakimeshi-de-Camarao.png' }
      ],
      10: [
        { nome:'Cação com Molho de Camarão e Purê de Batata', descricao:'Peixe macio, molho cremoso e purê suave em uma combinação sofisticada e irresistível.', imagem:'top 10 almoço de domingo/Cação.jpg', video:'https://drive.google.com/file/d/1w3fWSB0V2DuG6Y025drRaodjIg7E1AoW/view?usp=drive_link', ebook:'top 10 almoço de domingo/1_1-Cacao-com-Molho-de-Camarao-e-Pure-de-Batata.png' },
        { nome:'Carne Louca', descricao:'Desfiada, bem temperada e suculenta — perfeita para sanduíches ou acompanhamentos.', imagem:'top 10 almoço de domingo/Carne Louca.jpg', video:'https://drive.google.com/file/d/1-jwc-5hf4hcVaRPvv7ylYdSAu7EpWouQ/view?usp=drive_link', ebook:'top 10 almoço de domingo/2_2-Carne-Louca.png' },
        { nome:'Coroa de Carré de Cordeiro', descricao:'Apresentação elegante, carne macia e sabor marcante para impressionar em qualquer ocasião.', imagem:'top 10 almoço de domingo/coroa.jpg', video:'https://drive.google.com/file/d/1gRRjYiVR3ZZ7MMjRvSq0F2YLUwjqh4ZX/view?usp=drive_link', ebook:'top 10 almoço de domingo/3_3-Coroa-de-Carre-de-Cordeiro.png' },
        { nome:'Cupim com Batata Suculento', descricao:'Corte nobre, cozido lentamente até desmanchar, com batatas douradas e tempero intenso.', imagem:'top 10 almoço de domingo/cupim.jpg', video:'https://drive.google.com/file/d/1OTIso0tz5nJIzspMSEaZ_AJRpt_ZMJJp/view?usp=drive_link', ebook:'top 10 almoço de domingo/4_4-Cupim-com-Batata-Suculento.png' },
        { nome:'Galeto Frito com Chimichurri', descricao:'Frango dourado e crocante servido com o toque refrescante e picante do chimichurri.', imagem:'top 10 almoço de domingo/galeto.jpg', video:'https://drive.google.com/file/d/1wWaJa0AWVpcPDgP8ThXRe28oDPWUsQ1o/view?usp=drive_link', ebook:'top 10 almoço de domingo/5_5-Galeto-Frito-com-Chimichurri.png' },
        { nome:'Mazegohan (Arroz Bege)', descricao:'Receita japonesa tradicional, leve e saborosa, com arroz temperado e ingredientes equilibrados.', imagem:'top 10 almoço de domingo/mazegohan.jpg', video:'https://drive.google.com/file/d/1amwtLsAyINwby5k9NdmeSwVevxWqwSan/view?usp=drive_link', ebook:'top 10 almoço de domingo/6_6-Mazegohan-Arroz-Bege.png' },
        { nome:'Merluza à Portuguesa', descricao:'Peixe delicado com legumes coloridos, azeite e temperos que lembram a culinária lusitana.', imagem:'top 10 almoço de domingo/merluza.jpg', video:'https://drive.google.com/file/d/1E2qelPs1S2xdq4Qrus3VOvxDxF8Ktv-J/view?usp=drive_link', ebook:'top 10 almoço de domingo/7_7-Merluza-a-Portuguesa.png' },
        { nome:'Nhoque de Mandioca com Carne Seca', descricao:'Massa leve e saborosa combinada com recheio cremoso e carne seca desfiada no ponto.', imagem:'top 10 almoço de domingo/nhoque.jpg', video:'https://drive.google.com/file/d/1CU9DQZvjpyHeCX6dmCTb_6ayMhVB5aF7/view?usp=drive_link', ebook:'top 10 almoço de domingo/8_8-Nhoque-de-Mandioca-com-Carne-Seca.png' },
        { nome:'Pimenta Cambuci Recheada', descricao:'Sabor suave e toque artesanal, com recheio cremoso que valoriza o aroma da pimenta.', imagem:'top 10 almoço de domingo/pimenta.jpg', video:'https://drive.google.com/file/d/1XmbuQ0u0_l-QPeZ4znXAFM9r6iyr9QMX/view?usp=drive_link', ebook:'top 10 almoço de domingo/9_9-Pimenta-Cambuci-Recheada.png' },
        { nome:'Yakimeshi de Camarão', descricao:'Arroz oriental salteado com legumes e camarões, leve, colorido e cheio de sabor.', imagem:'top 10 almoço de domingo/Yakimeshi.jpg', video:'https://drive.google.com/file/d/1RJmBi894J89MeAm8vKDNe41bOoXks0LO/view?usp=drive_link', ebook:'top 10 almoço de domingo/10_10-Yakimeshi-de-Camarao.png' }
      ]
    };


/* ====== RENDER CATEGORIAS (TELA 1) ====== */
function renderCategorias(container, state, ctx) {
  container.innerHTML = `
    <section class="section">
      <h2 class="h2">Super Combo Culinário</h2>
      <p class="sub">
        Categorias exclusivas liberadas pelo seu combo especial.
      </p>
      <div class="grid" id="comboCatsGrid"></div>
    </section>
  `;

  const grid = container.querySelector('#comboCatsGrid');

  categorias.forEach((cat) => {
    const div = document.createElement('div');
    div.className = 'card';
    const imgUrl = toDriveImage(cat.imagemCategoria);

    div.innerHTML = `
      <img class="thumb" src="${imgUrl}" alt="${cat.titulo}">
      <div class="card-body">
        <h3>${cat.titulo}</h3>
        <p>${cat.descricaoCurta || ''}</p>
        <div class="row-btns">
          <button class="btn">Ver receitas</button>
        </div>
      </div>
    `;

    div.querySelector('button.btn').addEventListener('click', () => {
      state.categoriaSelecionada = cat.id;
      renderReceitas(container, state, ctx);
    });

    grid.appendChild(div);
  });
}

/* ====== RENDER RECEITAS (TELA 2: DENTRO DA CATEGORIA) ====== */
function renderReceitas(container, state, ctx) {
  const catId = state.categoriaSelecionada;
  const categoria = categorias.find((c) => c.id === catId);
  const receitas = receitasPorCategoria[catId] || [];

  if (!categoria) {
    state.categoriaSelecionada = null;
    renderCategorias(container, state, ctx);
    return;
  }

  container.innerHTML = `
    <section class="section">
      <button class="btn" id="btnVoltarCategorias" style="margin-bottom: 12px;">
        ← Voltar para categorias
      </button>
      <h2 class="h2">${categoria.titulo}</h2>
      <p class="sub">${categoria.descricaoCurta || ''}</p>
      <div class="grid" id="comboReceitasGrid"></div>
    </section>
  `;

  const grid = container.querySelector('#comboReceitasGrid');
  const btnVoltar = container.querySelector('#btnVoltarCategorias');

  btnVoltar.addEventListener('click', () => {
    state.categoriaSelecionada = null;
    renderCategorias(container, state, ctx);
  });

  receitas.forEach((rec) => {
    const hasVideo = !!rec.video;
    const hasEbook = !!rec.ebook;

    const div = document.createElement('div');
    div.className = 'card';

    const imgUrl = toDriveImage(rec.imagem);

    // Labelzinho do tipo de conteúdo
    let tipoLabel = '';
    if (hasVideo && hasEbook) tipoLabel = 'Vídeo + E-book';
    else if (hasVideo)        tipoLabel = 'Conteúdo em vídeo';
    else if (hasEbook)        tipoLabel = 'Somente e-book';

    div.innerHTML = `
      <img class="thumb" src="${imgUrl}" alt="${rec.nome}">
      <div class="card-body">
        <h3>${rec.nome}</h3>
        <p>${rec.descricao || ''}</p>
        ${tipoLabel ? `<p style="font-size:12px;color:#0d5f70;font-weight:600;margin-bottom:8px;">${tipoLabel}</p>` : ''}
        <div class="row-btns"></div>
      </div>
    `;

    const btnRow = div.querySelector('.row-btns');

    if (hasVideo) {
      const btnVideo = document.createElement('button');
      btnVideo.className = 'btn';
      btnVideo.textContent = 'Assistir vídeo';
      btnVideo.addEventListener('click', () => {
        ctx.openDriveModal(rec.video, rec.nome);
      });
      btnRow.appendChild(btnVideo);
    }

    if (hasEbook) {
      const btnEbook = document.createElement('button');
      btnEbook.className = 'btn';
      btnEbook.textContent = 'Abrir e-book';
      btnEbook.addEventListener('click', () => {
        ctx.openDriveModal(rec.ebook, rec.nome);
      });
      btnRow.appendChild(btnEbook);
    }

    // se por algum motivo não tiver nem vídeo nem ebook, mostra um botão desabilitado
    if (!hasVideo && !hasEbook) {
      const btnDisabled = document.createElement('button');
      btnDisabled.className = 'btn';
      btnDisabled.disabled = true;
      btnDisabled.textContent = 'Conteúdo indisponível';
      btnRow.appendChild(btnDisabled);
    }

    grid.appendChild(div);
  });
}

/* ====== FUNÇÃO PRINCIPAL CHAMADA PELO INDEX ====== */
export function mount(container, ctx) {
  // garante que o usuário realmente tem esse combo
  const possuiCombo = ctx.products.some(
    (p) => (p.deliverable_key || p.deliverableKey) === ctx.deliverableKey
  );

  if (!possuiCombo) {
    container.innerHTML = '<p class="msg">Você ainda não tem acesso a este combo.</p>';
    return;
  }

  const state = {
    categoriaSelecionada: null,
  };

  renderCategorias(container, state, ctx);
}
