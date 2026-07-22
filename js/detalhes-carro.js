const carros = {
  civic: {
    categoria: 'Sedan',
    nome: 'Honda Civic Touring',
    resumo: 'Sedan automatico completo, banco em couro e multimidia.',
    preco: 128900,
    ano: '2022',
    km: '32.000 KM',
    cidade: 'Uberlandia',
    combustivel: 'Flex',
    cambio: 'Automatico',
    cor: 'Prata',
    descricao: 'Honda Civic Touring em excelente estado, com revisoes em dia, interior conservado e pacote completo de conforto e seguranca para uso urbano ou viagens.',
    itens: ['Bancos em couro', 'Central multimidia', 'Piloto automatico', 'Camera de re', 'Controle de estabilidade', 'Ar digital dual zone'],
    imagens: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1549925862-990f1d7b9f3f?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1400&auto=format&fit=crop'
    ]
  },
  creta: {
    categoria: 'SUV',
    nome: 'Hyundai Creta',
    resumo: 'SUV confortavel, economico e perfeito para viagens longas.',
    preco: 145000,
    ano: '2023',
    km: '12.500 KM',
    cidade: 'Uberlandia',
    combustivel: 'Flex',
    cambio: 'Automatico',
    cor: 'Branco',
    descricao: 'Hyundai Creta com baixa quilometragem, dirigibilidade leve, bom espaco interno e conjunto ideal para familia.',
    itens: ['Chave presencial', 'Sensor de estacionamento', 'Central multimidia', 'Rodas de liga leve', 'Controle de tracao', 'Ar-condicionado digital'],
    imagens: [
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1400&auto=format&fit=crop'
    ]
  },
  onix: {
    categoria: 'Hatch',
    nome: 'Chevrolet Onix',
    resumo: 'Compacto moderno com otimo consumo e central multimidia.',
    preco: 78500,
    ano: '2021',
    km: '48.000 KM',
    cidade: 'Uberlandia',
    combustivel: 'Flex',
    cambio: 'Manual',
    cor: 'Vermelho',
    descricao: 'Chevrolet Onix com bom consumo, manutencao acessivel e equipamentos essenciais para o dia a dia.',
    itens: ['Direcao eletrica', 'Central multimidia', 'Bluetooth', 'Vidros eletricos', 'Airbags', 'Computador de bordo'],
    imagens: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?q=80&w=1400&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1400&auto=format&fit=crop'
    ]
  }
};

const formatarMoeda = (valor) => valor.toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0
});

const parametros = new URLSearchParams(window.location.search);
const carroSelecionado = carros[parametros.get('id')] || carros.civic;

async function carregarAnuncioApi() {
  const id = parametros.get('id');
  if (!id || !/^\d+$/.test(id)) return;
  try {
    const resposta = await fetch(`../api.php?acao=anuncio&id=${id}`); const resultado = await resposta.json();
    if (!resultado.sucesso) return;
    const a = resultado.anuncio;
    preencherDetalhes({ categoria: 'Veículo', nome: `${a.Marca} ${a.Modelo}`, resumo: a.Descricao, preco: Number(a.Valor), ano: a.AnoFabricacao, km: `${Number(a.Quilometragem).toLocaleString('pt-BR')} KM`, cidade: a.Cidade, combustivel: '-', cambio: '-', cor: a.Cor, descricao: a.Descricao, itens: [], imagens: a.fotos.map(f => `../uploads/${f}`) });
  } catch (erro) { console.error(erro); }
}

function preencherDetalhes(carro) {
  document.title = `${carro.nome} | S&J CAR`;
  document.getElementById('carroCategoria').textContent = carro.categoria;
  document.getElementById('carroNome').textContent = carro.nome;
  document.getElementById('carroResumo').textContent = carro.resumo;
  document.getElementById('carroPreco').textContent = formatarMoeda(carro.preco);
  document.getElementById('carroAno').textContent = carro.ano;
  document.getElementById('carroKm').textContent = carro.km;
  document.getElementById('carroCidade').textContent = carro.cidade;
  document.getElementById('carroCombustivel').textContent = carro.combustivel;
  document.getElementById('carroCambio').textContent = carro.cambio;
  document.getElementById('carroCor').textContent = carro.cor;
  document.getElementById('carroDescricao').textContent = carro.descricao;
  document.getElementById('mensagem').value = `Tenho interesse no ${carro.nome}.`;

  const imagemPrincipal = document.getElementById('imagemPrincipal');
  imagemPrincipal.src = carro.imagens[0];
  imagemPrincipal.alt = carro.nome;

  const lista = document.getElementById('itensLista');
  lista.innerHTML = '';
  carro.itens.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    lista.appendChild(li);
  });

  const miniaturas = document.getElementById('miniaturas');
  miniaturas.innerHTML = '';
  carro.imagens.forEach((imagem, index) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = index === 0 ? 'ativo' : '';
    botao.setAttribute('aria-label', `Ver foto ${index + 1}`);

    const img = document.createElement('img');
    img.src = imagem;
    img.alt = `${carro.nome} foto ${index + 1}`;
    botao.appendChild(img);

    botao.addEventListener('click', () => {
      imagemPrincipal.src = imagem;
      document.querySelectorAll('.miniaturas button').forEach((item) => item.classList.remove('ativo'));
      botao.classList.add('ativo');
    });

    miniaturas.appendChild(botao);
  });
}
// funcao para configurar o simulador de financiamento ficticia, atualizar quando tiver backend
function configurarSimulador(carro) {
  const entrada = document.getElementById('entrada');
  const entradaValor = document.getElementById('entradaValor');
  const parcelaValor = document.getElementById('parcelaValor');

  entrada.max = Math.floor(carro.preco * 0.8 / 1000) * 1000;
  entrada.value = Math.floor(carro.preco * 0.27 / 1000) * 1000;

  function atualizarParcela() {
    const entradaAtual = Number(entrada.value);
    const valorFinanciado = carro.preco - entradaAtual;
    const parcela = Math.round((valorFinanciado * 1.18) / 48);

    entradaValor.textContent = formatarMoeda(entradaAtual);
    parcelaValor.textContent = `48x de ${formatarMoeda(parcela)}`;
  }

  entrada.addEventListener('input', atualizarParcela);
  atualizarParcela();
}

function configurarAcoes() {
  const favoritoBtn = document.getElementById('favoritoBtn');
  favoritoBtn.addEventListener('click', () => {
    favoritoBtn.classList.toggle('ativo');
    favoritoBtn.textContent = favoritoBtn.classList.contains('ativo') ? 'Veiculo salvo' : 'Salvar veiculo';
  });

  document.querySelector('.contato-form').addEventListener('submit', (event) => {
    event.preventDefault();
    if (/^\d+$/.test(parametros.get('id') || '')) {
      fetch('../api.php?acao=cadastrar-interesse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idAnuncio: parametros.get('id'), nome: document.getElementById('nome').value, telefone: document.getElementById('telefone').value, mensagem: document.getElementById('mensagem').value }) }).then(() => alert('Interesse registrado com sucesso.'));
      return;
    }
    alert('Este anúncio não está disponível no banco de dados.');
  });
}

preencherDetalhes(carroSelecionado);
configurarSimulador(carroSelecionado);
configurarAcoes();
carregarAnuncioApi();
