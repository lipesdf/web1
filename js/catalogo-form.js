const campoMarca = document.getElementById('marca');
const campoModelo = document.getElementById('modelo');
if (campoMarca && campoModelo) {
  Object.keys(catalogoVeiculos).sort().forEach(marca => { const option = document.createElement('option'); option.value = marca; option.textContent = marca; campoMarca.appendChild(option); });
  campoMarca.addEventListener('change', () => {
    campoModelo.innerHTML = '<option value="">Selecione o modelo</option>';
    campoModelo.disabled = !campoMarca.value;
    (catalogoVeiculos[campoMarca.value] || []).forEach(modelo => { const option = document.createElement('option'); option.value = modelo; option.textContent = modelo; campoModelo.appendChild(option); });
  });
}
