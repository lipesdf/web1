async function carregarComponente(id, caminho) {
  const elemento = document.getElementById(id);
  if (!elemento) return;

  try {
    const resposta = await fetch(caminho);
    if (!resposta.ok) throw new Error(`Erro HTTP ${resposta.status}`);
    elemento.innerHTML = await resposta.text();
  } catch (erro) {
    console.error(`Não foi possível carregar ${caminho}:`, erro);
  }
}

async function iniciarLayout() {
  const paginasRestritas = ['painel.html', 'anunciar.html', 'meus-anuncios.html', 'interesses.html'];
  const paginaAtual = location.pathname.split('/').pop();
  try {
    const resposta = await fetch('../api.php?acao=sessao', { credentials: 'same-origin', cache: 'no-store' });
    const sessao = await resposta.json();
    if (sessao.autenticado) sessionStorage.setItem('sjcar-usuario', JSON.stringify(sessao.usuario)); else sessionStorage.removeItem('sjcar-usuario');
    if (paginasRestritas.includes(paginaAtual) && !sessao.autenticado) { location.replace('login.html'); return; }
  } catch {
    sessionStorage.removeItem('sjcar-usuario');
    if (paginasRestritas.includes(paginaAtual)) { location.replace('login.html'); return; }
  }
  await Promise.all([
    carregarComponente('navbar', '../components/navbar.html'),
    carregarComponente('footer', '../components/footer.html')
  ]);
  window.dispatchEvent(new Event('layout:loaded'));
  configurarNavegacaoSessao();
  if (document.getElementById('lista-anuncios') || document.getElementById('lista-interesses')) {
    const script = document.createElement('script'); script.src = '../js/api-restrito.js?v=3'; document.body.appendChild(script);
  }

  const botao = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-links');
  if (botao && menu) {
    botao.addEventListener('click', () => {
      const aberto = botao.getAttribute('aria-expanded') === 'true';
      botao.setAttribute('aria-expanded', String(!aberto));
      menu.classList.toggle('aberto');
    });
  }
}

function configurarNavegacaoSessao() {
  const menu = document.querySelector('#menu-principal ul');
  if (!menu) return;
  const areaLinks = document.getElementById('menu-principal');
  const autenticado = sessionStorage.getItem('sjcar-usuario');
  const linkSessao = menu.querySelector('[data-auth-link]');
  if (autenticado) {
    const usuario = JSON.parse(autenticado);
    linkSessao.querySelector('a').href = 'painel.html';
    linkSessao.querySelector('a').textContent = 'Área do anunciante';
    if (!areaLinks.querySelector('[data-usuario]')) {
      const itemUsuario = document.createElement('p'); itemUsuario.dataset.usuario = 'true'; itemUsuario.className = 'nav-usuario';
      itemUsuario.textContent = `Olá, ${String(usuario.nome || 'Anunciante').trim().split(/\s+/)[0]}`;
      areaLinks.prepend(itemUsuario);
    }
    if (!menu.querySelector('[data-logout]')) {
      const item = document.createElement('li'); item.dataset.logout = 'true';
      const sair = document.createElement('a'); sair.href = '#'; sair.textContent = 'Sair';
      sair.addEventListener('click', async evento => { evento.preventDefault(); try { await fetch('../api.php?acao=logout', { method: 'POST', credentials: 'same-origin' }); } finally { sessionStorage.removeItem('sjcar-usuario'); location.href = 'home.html'; } });
      item.appendChild(sair); menu.appendChild(item);
    }
  } else {
    areaLinks.querySelector('[data-usuario]')?.remove();
    linkSessao.querySelector('a').href = 'login.html';
    linkSessao.querySelector('a').textContent = 'Entrar';
  }
}

iniciarLayout();
