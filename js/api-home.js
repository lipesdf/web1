const apiHome = {
  normalizar: v => String(v || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
  async carregar() {
    const params = new URLSearchParams();
    ['marca', 'modelo', 'cidade'].forEach(id => { const valor = document.getElementById(id)?.value; if (valor) params.set(id, valor); });
    const resposta = await fetch(`../api.php?acao=listar-anuncios&${params}`); const resultado = await resposta.json();
    const cards = document.querySelector('.cards'); if (!cards) return; cards.innerHTML = ''; cards.style.visibility = 'visible';
    resultado.anuncios.forEach(anuncio => { const card = document.createElement('article'); card.className = 'card'; const foto = String(anuncio.Foto || ''); const src = foto.startsWith('http') ? foto : `../uploads/${foto}`; card.innerHTML = `<a class="card-link" href="detalhes-carro.html?id=${anuncio.IdAnuncio}"><div class="card-media"><img src="${src}" alt="${anuncio.Marca} ${anuncio.Modelo}"></div></a><div class="card-content"><h3><a class="titulo-carro" href="detalhes-carro.html?id=${anuncio.IdAnuncio}">${anuncio.Marca} ${anuncio.Modelo}</a></h3><div class="info"><span>${anuncio.AnoFabricacao}</span><span>${Number(anuncio.Quilometragem).toLocaleString('pt-BR')} km</span></div><p class="preco">${Number(anuncio.Valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div>`; cards.appendChild(card); });
  }
};
function iniciarHomeApi() {
  const form = document.getElementById('filtroForm'); if (!form) return;
  const marca = document.getElementById('marca'); const modelo = document.getElementById('modelo');
  marca.innerHTML = '<option value="">Todas as marcas</option>';
  Object.keys(catalogoVeiculos).sort().forEach(nome => { const o = document.createElement('option'); o.value = nome; o.textContent = nome; marca.appendChild(o); });
  modelo.innerHTML = '<option value="">Todos os modelos</option>'; modelo.disabled = true;
  marca.addEventListener('change', () => { modelo.innerHTML = '<option value="">Todos os modelos</option>'; (catalogoVeiculos[marca.value] || []).forEach(nome => { const o = document.createElement('option'); o.value = nome; o.textContent = nome; modelo.appendChild(o); }); modelo.disabled = !marca.value; });
  form.addEventListener('change', () => apiHome.carregar()); apiHome.carregar();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarHomeApi); else iniciarHomeApi();
