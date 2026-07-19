const imagensCarros = [
  ['photo-1552519507-da3b142c6e3d', 'photo-1549925862-990f1d7b9f3f', 'photo-1542362567-b07e54358753'],
  ['photo-1492144534655-ae79c964c9d7', 'photo-1533473359331-0135ef1b58bf', 'photo-1541899481282-d53bffe3c35d'],
  ['photo-1503376780353-7e6692767b70', 'photo-1525609004556-c46c7d6cf023', 'photo-1514316454349-750a7fd3da3a'],
  ['photo-1549317661-bd32c8ce0db2', 'photo-1503736334956-4c8f8e92946d', 'photo-1553440569-bcc63803a83d'],
  ['photo-1553440569-bcc63803a83d', 'photo-1492144534655-ae79c964c9d7', 'photo-1502877338535-766e1452684a'],
  ['photo-1558981806-ec527fa84c39', 'photo-1503376780353-7e6692767b70', 'photo-1542362567-b07e54358753']
];

const dadosLocais = lerDados();
const normalizar = valor => String(valor || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replaceAll(' ', '-');
function atualizarOpcoes(id, campo, textoPadrao) {
  const select = document.getElementById(id); if (!select) return;
  const atual = select.value; const valores = [...new Set(dadosLocais.veiculos.map(v => ({ valor: normalizar(v[campo]), texto: v[campo] })).map(x => JSON.stringify(x)))].map(x => JSON.parse(x));
  select.innerHTML = `<option value="">${textoPadrao}</option>`;
  valores.forEach(x => { const option = document.createElement('option'); option.value = x.valor; option.textContent = x.texto; select.appendChild(option); });
  select.value = atual;
}
atualizarOpcoes('marca', 'marca', 'Todas as marcas');
atualizarOpcoes('modelo', 'modelo', 'Todos os modelos');
atualizarOpcoes('cidade', 'cidade', 'Todas as cidades');

const buscaMarca = document.getElementById('marca');
const buscaModelo = document.getElementById('modelo');
if (buscaMarca && buscaModelo && typeof catalogoVeiculos !== 'undefined') {
  buscaMarca.innerHTML = '<option value="">Todas as marcas</option>';
  Object.keys(catalogoVeiculos).sort().forEach(marca => { const o = document.createElement('option'); o.value = normalizar(marca); o.textContent = marca; buscaMarca.appendChild(o); });
  buscaModelo.innerHTML = '<option value="">Todos os modelos</option>';
  buscaMarca.addEventListener('change', () => {
    buscaModelo.innerHTML = '<option value="">Todos os modelos</option>';
    const marcaOriginal = Object.keys(catalogoVeiculos).find(m => normalizar(m) === buscaMarca.value);
    (catalogoVeiculos[marcaOriginal] || []).forEach(modelo => { const o = document.createElement('option'); o.value = normalizar(modelo); o.textContent = modelo; buscaModelo.appendChild(o); });
    buscaModelo.disabled = !marcaOriginal;
  });
}
const cardsContainer = document.querySelector('.cards');
const idsFixos = new Set([...cardsContainer.querySelectorAll('.card')].map(card => card.dataset.modelo));
dadosLocais.veiculos.filter(v => !idsFixos.has(String(v.modelo).toLowerCase())).forEach(v => {
  const card = document.createElement('article'); card.className = 'card';
  card.dataset.marca = normalizar(v.marca); card.dataset.modelo = normalizar(v.modelo); card.dataset.cidade = normalizar(v.cidade);
  const media = document.createElement('div'); media.className = 'card-media';
  const imagem = document.createElement('img'); imagem.src = v.imagem; imagem.alt = `${v.marca} ${v.modelo}`; media.appendChild(imagem);
  const fotos = v.imagens || [v.imagem]; let fotoAtual = 0;
  if (fotos.length > 1) ['anterior', 'proximo'].forEach(tipo => { const botao = document.createElement('button'); botao.type = 'button'; botao.className = `carrossel-btn ${tipo}`; botao.textContent = tipo === 'proximo' ? '›' : '‹'; botao.setAttribute('aria-label', tipo === 'proximo' ? 'Próxima foto' : 'Foto anterior'); botao.addEventListener('click', evento => { evento.preventDefault(); evento.stopPropagation(); fotoAtual = (fotoAtual + (tipo === 'proximo' ? 1 : -1) + fotos.length) % fotos.length; imagem.src = fotos[fotoAtual]; }); media.appendChild(botao); });
  const conteudo = document.createElement('div'); conteudo.className = 'card-content';
  const titulo = document.createElement('h3'); titulo.textContent = `${v.marca} ${v.modelo}`;
  const descricao = document.createElement('p'); descricao.className = 'descricao'; descricao.textContent = v.descricao || 'Veículo anunciado recentemente.';
  const info = document.createElement('div'); info.className = 'info'; info.innerHTML = `<span>${v.ano}</span><span>${Number(v.km).toLocaleString('pt-BR')} km</span>`;
  const preco = document.createElement('p'); preco.className = 'preco'; preco.textContent = Number(v.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  conteudo.append(titulo, descricao, info, preco); card.append(media, conteudo); cardsContainer.appendChild(card);
});

document.querySelectorAll('.card-media').forEach((media, cardIndex) => {
  const img = media.querySelector('img');
  const fotos = (imagensCarros[cardIndex] || []).map(id => `https://images.unsplash.com/${id}?q=80&w=1200&auto=format&fit=crop`);
  if (fotos.length < 2) return;
  let atual = 0;
  ['anterior', 'proximo'].forEach(tipo => {
    const botao = document.createElement('button');
    botao.type = 'button'; botao.className = `carrossel-btn ${tipo}`;
    botao.setAttribute('aria-label', tipo === 'proximo' ? 'Próxima foto' : 'Foto anterior');
    botao.textContent = tipo === 'proximo' ? '›' : '‹';
    botao.addEventListener('click', (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      atual = (atual + (tipo === 'proximo' ? 1 : -1) + fotos.length) % fotos.length;
      img.src = fotos[atual];
    });
    media.appendChild(botao);
  });
});

const filtroForm = document.getElementById('filtroForm');
if (filtroForm) filtroForm.addEventListener('submit', evento => {
  evento.preventDefault();
  const filtros = new FormData(filtroForm);
  const marca = filtros.get('marca');
  const modelo = filtros.get('modelo');
  const cidade = filtros.get('cidade');
  let encontrados = 0;
  document.querySelectorAll('.cards .card').forEach(card => {
    const corresponde = (!marca || card.dataset.marca === marca) && (!modelo || card.dataset.modelo === modelo) && (!cidade || card.dataset.cidade === cidade);
    card.hidden = !corresponde;
    if (corresponde) encontrados++;
  });
  let aviso = document.getElementById('resultado-busca');
  if (!aviso) { aviso = document.createElement('p'); aviso.id = 'resultado-busca'; aviso.setAttribute('role', 'status'); document.getElementById('anuncios').prepend(aviso); }
  aviso.textContent = encontrados ? `${encontrados} anúncio(s) encontrado(s).` : 'Nenhum anúncio encontrado para os filtros selecionados.';
});

if (filtroForm) filtroForm.querySelectorAll('select').forEach(select => {
  select.addEventListener('change', () => filtroForm.requestSubmit());
});
