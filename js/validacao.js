function exibirErro(form, mensagem) { let aviso = form.querySelector('.form-erro'); if (!aviso) { aviso = document.createElement('p'); aviso.className = 'form-erro'; form.prepend(aviso); } aviso.textContent = mensagem; }
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toggle-password').forEach(botao => botao.addEventListener('click', () => {
    const campo = document.getElementById(botao.dataset.target);
    const visivel = campo.type === 'text';
    campo.type = visivel ? 'password' : 'text';
    botao.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
  }));
  const login = document.querySelector('#loginForm');
  if (login) login.addEventListener('submit', e => { e.preventDefault(); const dados = lerDados(); const f = new FormData(login); const u = dados.usuarios.find(x => x.email.toLowerCase() === f.get('email').toLowerCase() && x.senha === f.get('senha')); if (!u) return exibirErro(login, 'E-mail ou senha inválidos.'); sessionStorage.setItem('sjcar-usuario', JSON.stringify({ id: u.id, nome: u.nome, email: u.email })); location.href = 'painel.html'; });
  const cadastro = document.querySelector('#cadastroForm');
  if (cadastro) cadastro.addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(cadastro);
    const nome = String(f.get('nome') || '').trim();
    const cpf = String(f.get('cpf') || '').replace(/\D/g, '');
    const email = String(f.get('email') || '').trim().toLowerCase();
    const senha = String(f.get('senha') || '');
    const telefone = String(f.get('telefone') || '').replace(/\D/g, '');
    if (nome.length < 3) return exibirErro(cadastro, 'Informe seu nome completo.');
    if (cpf.length !== 11) return exibirErro(cadastro, 'Informe um CPF válido com 11 números.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return exibirErro(cadastro, 'Informe um e-mail válido.');
    if (senha.length < 6) return exibirErro(cadastro, 'A senha deve possuir pelo menos 6 caracteres.');
    if (telefone.length < 10 || telefone.length > 11) return exibirErro(cadastro, 'Informe um telefone válido.');
    const dados = lerDados();
    if (dados.usuarios.some(u => u.email.toLowerCase() === email)) return exibirErro(cadastro, 'Este e-mail já está cadastrado.');
    dados.usuarios.push({ id: Date.now(), nome, cpf, email, senha, telefone });
    salvarDados(dados);
    location.href = 'login.html';
  });
  const anuncio = document.querySelector('#anuncioForm');
  if (anuncio) anuncio.addEventListener('submit', async e => {
    e.preventDefault();
    const f = new FormData(anuncio);
    const ano = Number(f.get('ano'));
    const km = Number(f.get('quilometragem'));
    const valor = Number(f.get('valor'));
    const fotos = document.getElementById('fotos').files;
    if (String(f.get('marca')).trim().length < 2 || String(f.get('modelo')).trim().length < 2) return exibirErro(anuncio, 'Informe marca e modelo válidos.');
    if (!Number.isInteger(ano) || ano < 1900 || ano > new Date().getFullYear()) return exibirErro(anuncio, 'Informe um ano de fabricação válido.');
    if (!Number.isFinite(km) || km < 0) return exibirErro(anuncio, 'Informe uma quilometragem válida.');
    if (!Number.isFinite(valor) || valor <= 0) return exibirErro(anuncio, 'Informe um valor válido.');
    if (!f.get('cor') || !f.get('descricao') || !f.get('cidade') || !f.get('estado')) return exibirErro(anuncio, 'Preencha todos os dados do veículo.');
    if (fotos.length < 3) return exibirErro(anuncio, 'Selecione pelo menos três fotos do veículo.');
    const dados = lerDados();
    const imagens = await Promise.all([...fotos].map(arquivo => new Promise(resolve => { const leitor = new FileReader(); leitor.onload = () => resolve(leitor.result); leitor.readAsDataURL(arquivo); })));
    const dono = usuarioAtual();
    dados.veiculos.push({ id: `veiculo-${Date.now()}`, anuncianteId: dono ? dono.id : null, marca: f.get('marca'), modelo: f.get('modelo'), ano, km, valor, cidade: f.get('cidade'), estado: f.get('estado'), cor: f.get('cor'), descricao: f.get('descricao'), imagem: imagens[0], imagens });
    salvarDados(dados);
    anuncio.reset();
    exibirErro(anuncio, 'Anúncio salvo com sucesso.');
    anuncio.querySelector('.form-erro').classList.add('sucesso');
  });
});
