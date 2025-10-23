import { listarDepartamentos } from '../services/departmentsService';

// Função para buscar departamentos da API
export const getDepartamentosOptions = async () => {
  try {
    const response = await listarDepartamentos();
    if (response.success && response.data) {
      // Converter dados da API para o formato esperado pelo frontend
      const options = [
        { value: '', label: 'Selecione um departamento' },
        ...response.data.map(dept => ({
          value: dept.nome,
          label: `${getEmojiForDepartment(dept.nome)} ${dept.nome}`
        }))
      ];
      return options;
    }
  } catch (error) {
    console.error('Erro ao buscar departamentos da API:', error);
  }
  
  // Fallback: retornar dados mocados em caso de erro
  return getDepartamentosOptionsFallback();
};

// Função para obter emoji baseado no nome do departamento
const getEmojiForDepartment = (name) => {
  const emojiMap = {
    'Diretoria': '🏛️',
    'Conselho de Pastores': '👨‍💼',
    'Conselho Fiscal': '📊',
    'Conselho Administrativo': '⚙️',
    'Diaconia': '🤝',
    'Homens': '👨',
    'Mulheres': '👩',
    'Jovens': '👥',
    'Adolescentes': '🧑‍🎓',
    'Maturidade': '👴👵',
    'Conselho Missionário': '🌍',
    'Adoração': '🎵',
    'Ginc': '🎸',
    'Dança': '💃',
    'Presídio': '🔒',
    '2 Toques': '🥁',
    'Intercessão': '🙏',
    'Ministério Com Surdos': '🤟',
    'Educação Religiosa': '📚',
    'Cursos Missionários': '🎓',
    'GCs': '🏠',
    'Saúde': '🏥',
    'Audiovisual': '📹',
    'AOC': '👶',
    'Obras': '🔨',
    'Somos Um': '🤝',
    'Kids': '👶'
  };
  
  return emojiMap[name] || '🏢';
};

// Dados mocados como fallback
const getDepartamentosOptionsFallback = () => [
  { value: '', label: 'Selecione um departamento' },
  { value: 'Diretoria', label: '🏛️ Diretoria - Líder Pr Marcos Lopes' },
  { value: 'Conselho de Pastores', label: '👨‍💼 Conselho de Pastores - Líder Pr Marcos Lopes' },
  { value: 'Conselho Fiscal', label: '📊 Conselho Fiscal - Líder Maxwell Firmino' },
  { value: 'Conselho Administrativo', label: '⚙️ Conselho Administrativo - Líder Adriano Lima' },
  { value: 'Diaconia', label: '🤝 Diaconia - Líder Pr Marcos Lopes' },
  { value: 'Homens', label: '👨 Homens - Adriano Lima' },
  { value: 'Mulheres', label: '👩 Mulheres - Pra Cemi Quadros' },
  { value: 'Jovens', label: '👥 Jovens - Líder Matheus/ Sara Lima' },
  { value: 'Adolescentes', label: '🧑‍🎓 Adolescentes - Líder Matheus Rodrigues' },
  { value: 'Maturidade', label: '👴👵 Maturidade - Líder Maria Auxiliadora/Rita Oliveira' },
  { value: 'Conselho Missionário', label: '🌍 Conselho Missionário - Líder Pr Marcos Lopes' },
  { value: 'Adoração', label: '🎵 Adoração - Líder Pr Eraldo Melo/ Pr Hosit Quadros' },
  { value: 'Ginc', label: '🎸 Ginc - Líder Pr Carlos Henrique / Gustavo Guimarães' },
  { value: 'Dança', label: '💃 Dança - Líder Melody Melo/ Amanda Brandão' },
  { value: 'Presídio', label: '🔒 Presídio - Líder Pr Paulo Moreno' },
  { value: '2 Toques', label: '🥁 2 Toques - Líder Pr Edimo Agostinho/ Emerson Guedes' },
  { value: 'Intercessão', label: '🙏 Intercessão - Líder Rosana Santos/ Geneci Rosaneli' },
  { value: 'Ministério Com Surdos', label: '🤟 Ministério Com Surdos - Líder Pr Carlos Henrique/ Rosa Dornelles' },
  { value: 'Educação Religiosa', label: '📚 Educação Religiosa - Líder Gustavo Guimarães/ Thais Ciaramella' },
  { value: 'Cursos Missionários', label: '🎓 Cursos Missionários - Líder Pr Carlos Henrique/ Sheila Pinho' },
  { value: 'GCs', label: '🏠 GCs - Líder Pr Marcos Lopes/ Pr Alberto Rúbio' },
  { value: 'Saúde', label: '🏥 Saúde - Líder Dr Cristiano Góes/ Dr Victor Bergsten' },
  { value: 'Audiovisual', label: '📹 Audiovisual - Líder Ulisses Herdy' },
  { value: 'AOC', label: '👶 AOC - Líder Bruna Marnet/ Gabriela Ferreira' },
  { value: 'Obras', label: '🔨 Obras - Jaime Abreu/ João Oliva' },
  { value: 'Somos Um', label: '🤝 Somos Um - Líder Ricardo/ Nathalia Cayres' },
  { value: 'Kids', label: '👶 Kids - Líder Nikson/ Rosana Carvalho e Eduardo/ Marcela Rebouças' }
];

// Exportar dados mocados para compatibilidade (será removido depois)
export const departamentosOptions = getDepartamentosOptionsFallback(); 