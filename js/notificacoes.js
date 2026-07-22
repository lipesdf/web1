async function carregarNotificacoes() {
  const area = document.getElementById('notificacoesPainel'); if (!area) return;
  const resposta = await fetch('../api.php?acao=notificacoes', { credentials: 'same-origin', cache: 'no-store' });
  const dados = await resposta.json();
  if (!dados.total) { area.innerHTML = '<p class="sem-notificacoes">Você não possui novos interesses no momento.</p>'; return; }
  area.innerHTML = `<div class="notificacao-topo"><div><span class="notificacao-icone">!</span><div><strong>Você tem ${dados.total} novo${dados.total === 1 ? '' : 's'} interesse${dados.total === 1 ? '' : 's'}</strong><p>Confira as mensagens recebidas em seus anúncios.</p></div></div><a href="interesses.html">Ver mensagens</a></div><ul>${dados.itens.map(i => `<li><span>${i.Marca} ${i.Modelo}</span><strong>${i.Quantidade} nova${i.Quantidade == 1 ? '' : 's'}</strong></li>`).join('')}</ul>`;
}
carregarNotificacoes();
