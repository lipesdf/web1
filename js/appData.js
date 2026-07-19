const dadosIniciais = {
  usuarios: [{ id: 1, nome: 'Usuário demonstração', email: 'demo@sjcar.com', senha: '123456', cpf: '00000000000', telefone: '(34) 99999-0000' }],
  veiculos: [
    { id: 'civic', marca: 'Honda', modelo: 'Civic', ano: 2022, cidade: 'Uberlândia', km: 32000, valor: 128900, imagem: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop' },
    { id: 'creta', marca: 'Hyundai', modelo: 'Creta', ano: 2023, cidade: 'Uberlândia', km: 12500, valor: 145000, imagem: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop' },
    { id: 'onix', marca: 'Chevrolet', modelo: 'Onix', ano: 2021, cidade: 'Uberlândia', km: 48000, valor: 78500, imagem: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop' },
    { id: 'mustang', marca: 'Ford', modelo: 'Mustang', ano: 2020, cidade: 'São Paulo', km: 28400, valor: 289900, imagem: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1200&auto=format&fit=crop' },
    { id: 'tcross', marca: 'Volkswagen', modelo: 'T-Cross', ano: 2024, cidade: 'Belo Horizonte', km: 8200, valor: 119900, imagem: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1200&auto=format&fit=crop' },
    { id: 'corolla', marca: 'Toyota', modelo: 'Corolla', ano: 2022, cidade: 'Uberlândia', km: 35700, valor: 132500, imagem: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1200&auto=format&fit=crop' }
  ],
  interesses: []
};
const catalogoVeiculos = {
  Chevrolet: ['Onix', 'Tracker', 'S10', 'Spin'], Fiat: ['Argo', 'Mobi', 'Cronos', 'Strada', 'Toro'], Ford: ['Ka', 'Ranger', 'Mustang'], Honda: ['Civic', 'City', 'HR-V', 'CG 160'], Hyundai: ['HB20', 'Creta', 'Tucson'], Toyota: ['Corolla', 'Yaris', 'Hilux', 'SW4'], Volkswagen: ['Gol', 'Polo', 'T-Cross', 'Nivus', 'Virtus']
};

function lerDados() { const salvo = JSON.parse(localStorage.getItem('sjcar-dados') || 'null'); if (!salvo) return JSON.parse(JSON.stringify(dadosIniciais)); const ids = new Set((salvo.veiculos || []).map(v => v.id)); salvo.veiculos = [...(salvo.veiculos || []), ...dadosIniciais.veiculos.filter(v => !ids.has(v.id))]; return salvo; }
function salvarDados(dados) { localStorage.setItem('sjcar-dados', JSON.stringify(dados)); }
function usuarioAtual() { return JSON.parse(sessionStorage.getItem('sjcar-usuario') || 'null'); }
