fetch('../api.php?acao=sessao', { credentials: 'same-origin', cache: 'no-store' })
  .then(resposta => resposta.json())
  .then(sessao => { if (!sessao.autenticado) { sessionStorage.removeItem('sjcar-usuario'); location.replace('login.html'); } else sessionStorage.setItem('sjcar-usuario', JSON.stringify(sessao.usuario)); })
  .catch(() => { sessionStorage.removeItem('sjcar-usuario'); location.replace('login.html'); });
