async function apiJson(acao, opcoes = {}) {
  const resposta = await fetch(`../api.php?acao=${acao}`, { credentials: 'same-origin', ...opcoes });
  return resposta.json();
}
const srcFoto = nome => String(nome || '').startsWith('http') ? nome : `../uploads/${nome || ''}`;

async function iniciarApiRestrita() {
  const lista = document.getElementById('lista-anuncios');
  if (lista) {
    const resultado = await apiJson('meus-anuncios');
    lista.innerHTML = '';
    (resultado.anuncios || []).forEach(a => {
      const card = document.createElement('article'); card.className = 'card';
      const media = document.createElement('div'); media.className = 'card-media';
      const imagem = document.createElement('img'); imagem.src = srcFoto(a.Foto); imagem.alt = `${a.Marca} ${a.Modelo}`; media.appendChild(imagem);
      const fotos = a.Fotos || []; let atual = 0;
      if (fotos.length > 1) ['anterior', 'proximo'].forEach(tipo => { const botao = document.createElement('button'); botao.type = 'button'; botao.className = `carrossel-btn ${tipo}`; botao.textContent = tipo === 'proximo' ? '›' : '‹'; botao.setAttribute('aria-label', tipo === 'proximo' ? 'Próxima foto' : 'Foto anterior'); botao.addEventListener('click', () => { atual = (atual + (tipo === 'proximo' ? 1 : -1) + fotos.length) % fotos.length; imagem.src = srcFoto(fotos[atual]); }); media.appendChild(botao); });
      const conteudo = document.createElement('div'); conteudo.className = 'card-content'; conteudo.innerHTML = `<h3>${a.Marca} ${a.Modelo}</h3><div class="info"><span>${a.AnoFabricacao}</span><span>${Number(a.Quilometragem).toLocaleString('pt-BR')} km</span></div><div class="acoes-anuncio"><a class="card-button" href="detalhes-carro.html?id=${a.IdAnuncio}">Ver anúncio</a><a class="card-button" href="interesses.html?id=${a.IdAnuncio}">Ver interesses</a><button class="card-button botao-excluir-card" type="button">Excluir veículo</button></div>`;
      conteudo.querySelector('.botao-excluir-card').addEventListener('click', async () => { if (!confirm(`Tem certeza que deseja excluir o veículo ${a.Marca} ${a.Modelo}?`)) return; const resultado = await apiJson('excluir-anuncio', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: a.IdAnuncio }) }); if (resultado.removido) card.remove(); else alert('Não foi possível excluir este anúncio.'); });
      card.append(media, conteudo);
      lista.appendChild(card);
    });
  }
  const listaInteresses = document.getElementById('lista-interesses');
  if (listaInteresses) {
    const resultado = await apiJson('listar-interesses'); listaInteresses.innerHTML = '';
    (resultado.interesses || []).forEach(i => { const item = document.createElement('article'); item.className = 'interesse-item'; item.innerHTML = `<h2>${i.Nome}</h2><p>Veículo: ${i.Marca} ${i.Modelo}</p><p>Telefone: ${i.Telefone}</p><p>${i.Mensagem}</p><button type="button">Excluir mensagem</button>`; item.querySelector('button').addEventListener('click', async () => { if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return; await apiJson('excluir-interesse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: i.IdInteresse }) }); item.remove(); }); listaInteresses.appendChild(item); });
    await apiJson('marcar-interesses-lidos', { method: 'POST' });
  }
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciarApiRestrita); else iniciarApiRestrita();
