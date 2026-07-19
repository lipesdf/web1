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
  const paginasRestritas = ['painel.html', 'anunciar.html', 'meus-anuncios.html', 'anuncio-interno.html', 'interesses.html'];
  if (paginasRestritas.includes(location.pathname.split('/').pop()) && !sessionStorage.getItem('sjcar-usuario')) {
    location.replace('login.html');
    return;
  }
  await Promise.all([
    carregarComponente('navbar', '../components/navbar.html'),
    carregarComponente('footer', '../components/footer.html')
  ]);
  window.dispatchEvent(new Event('layout:loaded'));
  configurarNavegacaoSessao();

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
  const autenticado = sessionStorage.getItem('sjcar-usuario');
  const linkSessao = menu.querySelector('[data-auth-link]');
  if (autenticado) {
    linkSessao.querySelector('a').href = 'painel.html';
    linkSessao.querySelector('a').textContent = 'Área do anunciante';
    if (!menu.querySelector('[data-logout]')) {
      const item = document.createElement('li'); item.dataset.logout = 'true';
      const sair = document.createElement('a'); sair.href = '#'; sair.textContent = 'Sair';
      sair.addEventListener('click', evento => { evento.preventDefault(); sessionStorage.removeItem('sjcar-usuario'); location.href = 'home.html'; });
      item.appendChild(sair); menu.appendChild(item);
    }
  } else {
    linkSessao.querySelector('a').href = 'login.html';
    linkSessao.querySelector('a').textContent = 'Entrar';
  }
}

iniciarLayout();
