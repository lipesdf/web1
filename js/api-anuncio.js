function exibirErroAnuncio(form, mensagem) {
  let aviso = form.querySelector('.form-erro');
  if (!aviso) { aviso = document.createElement('p'); aviso.className = 'form-erro'; form.prepend(aviso); }
  aviso.textContent = mensagem;
}

async function enviarCadastroAnuncio(evento) {
  evento.preventDefault();
  const form = evento.currentTarget;
  const fotos = document.getElementById('fotos');
  if (fotos.files.length < 3) return exibirErroAnuncio(form, 'Selecione pelo menos três fotos.');
  if ([...fotos.files].some(f => f.size > 2 * 1024 * 1024)) return exibirErroAnuncio(form, 'Cada foto deve ter no máximo 2 MB.');
  try {
    const resposta = await fetch('../api.php?acao=cadastrar-anuncio', { method: 'POST', credentials: 'same-origin', body: new FormData(form) });
    const texto = await resposta.text();
    const resultado = JSON.parse(texto);
    if (!resultado.sucesso) return exibirErroAnuncio(form, resultado.mensagem);
    alert('Anúncio cadastrado com sucesso.');
    location.href = 'meus-anuncios.html';
  } catch (erro) { exibirErroAnuncio(form, `Falha ao cadastrar: ${erro.message}`); }
}

const formularioAnuncio = document.getElementById('anuncioForm');
if (formularioAnuncio) formularioAnuncio.onsubmit = enviarCadastroAnuncio;

const inputFotos = document.getElementById('fotos');
const previewFotos = document.getElementById('previewFotos');
const labelFotos = document.getElementById('labelFotos');
const previewCabecalho = document.getElementById('previewCabecalho');
const contadorFotos = document.getElementById('contadorFotos');
function renderizarPreviews() {
  previewFotos.innerHTML = '';
  [...inputFotos.files].forEach((arquivo, indice) => {
    const item = document.createElement('div'); item.className = 'preview-foto';
    const imagem = document.createElement('img'); imagem.src = URL.createObjectURL(arquivo); imagem.alt = `Foto selecionada ${indice + 1}`; imagem.onload = () => URL.revokeObjectURL(imagem.src);
    const ordem = document.createElement('span'); ordem.className = 'foto-ordem'; ordem.textContent = indice === 0 ? 'Capa' : `${indice + 1}`;
    const remover = document.createElement('button'); remover.type = 'button'; remover.className = 'remover-foto'; remover.textContent = 'Remover'; remover.setAttribute('aria-label', `Remover foto ${indice + 1}`);
    remover.addEventListener('click', () => { const transferencia = new DataTransfer(); [...inputFotos.files].filter((_, i) => i !== indice).forEach(f => transferencia.items.add(f)); inputFotos.files = transferencia.files; renderizarPreviews(); });
    item.append(imagem, ordem, remover); previewFotos.appendChild(item);
  });
  const total = inputFotos.files.length;
  previewCabecalho.hidden = total === 0;
  contadorFotos.textContent = `${total} foto${total === 1 ? '' : 's'}`;
  labelFotos.textContent = total ? 'Adicionar mais fotos' : 'Adicionar fotos do veículo';
}
if (inputFotos) inputFotos.addEventListener('change', renderizarPreviews);
