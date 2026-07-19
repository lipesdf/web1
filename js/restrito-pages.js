const usuario = usuarioAtual();
const veiculos = lerDados().veiculos.filter(v => !v.anuncianteId || !usuario || v.anuncianteId === usuario.id);
const lista = document.getElementById('lista-anuncios');
if (lista) {
  lista.innerHTML = '';
  veiculos.forEach(v => {
    const card = document.createElement('article'); card.className = 'card';
    const media = document.createElement('div'); media.className = 'card-media';
    const imagem = document.createElement('img'); imagem.src = v.imagem; imagem.alt = `${v.marca} ${v.modelo}`; media.appendChild(imagem);
    const fotos = v.imagens || [v.imagem]; let atual = 0;
    if (fotos.length > 1) ['anterior', 'proximo'].forEach(tipo => { const b = document.createElement('button'); b.type = 'button'; b.className = `carrossel-btn ${tipo}`; b.textContent = tipo === 'proximo' ? '›' : '‹'; b.setAttribute('aria-label', tipo === 'proximo' ? 'Próxima foto' : 'Foto anterior'); b.addEventListener('click', e => { e.preventDefault(); atual = (atual + (tipo === 'proximo' ? 1 : -1) + fotos.length) % fotos.length; imagem.src = fotos[atual]; }); media.appendChild(b); });
    const conteudo = document.createElement('div'); conteudo.className = 'card-content'; conteudo.innerHTML = `<h3>${v.marca} ${v.modelo}</h3><div class="info"><span>${v.ano}</span><span>${v.km.toLocaleString('pt-BR')} km</span></div><div class="acoes-anuncio"><a class="card-button" href="anuncio-interno.html?id=${v.id}">Ver anúncio</a><a class="card-button" href="interesses.html?id=${v.id}">Ver interesses</a></div>`;
    card.append(media, conteudo);
    lista.appendChild(card);
  });
}

const interessesLista = document.getElementById('lista-interesses');
if (interessesLista) {
  const interesses = lerDados().interesses;
  interessesLista.innerHTML = interesses.length ? '' : '<p>Nenhuma mensagem de interesse registrada.</p>';
  interesses.forEach(i => { const item = document.createElement('article'); item.className = 'interesse-item'; item.innerHTML = `<h2>${i.nome}</h2><p>Telefone: ${i.telefone}</p><p>${i.mensagem}</p><button type="button" data-id="${i.id}">Excluir mensagem</button>`; item.querySelector('button').addEventListener('click', () => { if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return; const dados = lerDados(); dados.interesses = dados.interesses.filter(x => x.id !== i.id); salvarDados(dados); item.remove(); }); interessesLista.appendChild(item); });
}
