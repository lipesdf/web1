function atualizarNavbar() {
  const menu = document.querySelector('#menu-principal ul');
  if (!menu) return;
  const atual = usuarioAtual();
  menu.querySelector('[data-auth-link]')?.remove();
  const item = document.createElement('li'); item.dataset.authLink = 'true';
  const link = document.createElement('a');
  if (atual) { link.href = 'painel.html'; link.textContent = 'Área do anunciante'; }
  else { link.href = 'login.html'; link.textContent = 'Entrar'; }
  item.appendChild(link); menu.appendChild(item);
}
window.addEventListener('layout:loaded', atualizarNavbar);
document.addEventListener('DOMContentLoaded', () => setTimeout(atualizarNavbar, 300));
