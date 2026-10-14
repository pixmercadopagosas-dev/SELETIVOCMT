import { Module, Topic, Lesson, EducationalVideo } from '../types';

export const GRADES_INFO = [
  {
    id: '6_ano',
    name: '6º Ano do Ensino Fundamental',
    shortName: '6º Ano',
    targetAge: '10 a 11 anos',
    description: 'Preparação completa para o exame de admissão com 30 questões (15 Português + 15 Matemática).',
    totalQuestionsOfficial: 30,
    portugueseCount: 15,
    mathCount: 15,
  },
  {
    id: '7_ano',
    name: '7º Ano do Ensino Fundamental',
    shortName: '7º Ano',
    targetAge: '11 a 12 anos',
    description: 'Preparação completa para o exame de admissão com 40 questões (20 Português + 20 Matemática).',
    totalQuestionsOfficial: 40,
    portugueseCount: 20,
    mathCount: 20,
  },
] as const;

export const SUBJECTS_INFO = [
  {
    id: 'portugues',
    name: 'Língua Portuguesa',
    color_hex: '#1e3a8a', // Azul marinho institucional
    badgeColor: 'bg-blue-900 text-white',
    accentBorder: 'border-blue-700',
    icon: 'book-open',
  },
  {
    id: 'matematica',
    name: 'Matemática',
    color_hex: '#b91c1c', // Vermelho militar / carmesim
    badgeColor: 'bg-red-800 text-white',
    accentBorder: 'border-red-600',
    icon: 'calculator',
  },
] as const;

export const MODULES_DATA: Module[] = [
  // =================== 6º ANO - LÍNGUA PORTUGUESA ===================
  {
    id: 'm-6-port-1',
    grade_id: '6_ano',
    subject_id: 'portugues',
    title: 'Leitura, Gêneros e Tipologias Textuais',
    description: 'Compreensão de textos, versos, estrofes, eu lírico, parágrafos e tipologias narrativas e descritivas.',
    order_index: 1,
  },
  {
    id: 'm-6-port-2',
    grade_id: '6_ano',
    subject_id: 'portugues',
    title: 'Fonologia e Divisão Silábica',
    description: 'Letra e fonema, encontros vocálicos, consonantais, dígrafos, divisão e classificação silábica.',
    order_index: 2,
  },
  {
    id: 'm-6-port-3',
    grade_id: '6_ano',
    subject_id: 'portugues',
    title: 'Tonicidade e Acentuação Gráfica',
    description: 'Sílaba tônica, oxítonas, paroxítonas, proparoxítonas e regras de acentuação gráfica oficial.',
    order_index: 3,
  },
  {
    id: 'm-6-port-4',
    grade_id: '6_ano',
    subject_id: 'portugues',
    title: 'Classes Gramaticais Fundamentais',
    description: 'Substantivo, adjetivo, artigo, numeral, pronome e verbo: flexões nominais e verbais.',
    order_index: 4,
  },
  {
    id: 'm-6-port-5',
    grade_id: '6_ano',
    subject_id: 'portugues',
    title: 'Ortografia Oficial e Semântica',
    description: 'Emprego de X/CH, S/Z, J/G, Ç/SS, além de sinônimos, antônimos e ordem alfabética no dicionário.',
    order_index: 5,
  },

  // =================== 6º ANO - MATEMÁTICA ===================
  {
    id: 'm-6-mat-1',
    grade_id: '6_ano',
    subject_id: 'matematica',
    title: 'Sistema Decimal e Operações Fundamentais',
    description: 'Números até bilhões, valor posicional, decomposição, 4 operações e propriedades matemáticas.',
    order_index: 1,
  },
  {
    id: 'm-6-mat-2',
    grade_id: '6_ano',
    subject_id: 'matematica',
    title: 'Cálculo Mental e Números Romanos',
    description: 'Estimativas, arredondamentos e sistema de numeração romano (I, V, X, L, C, D, M) em contextos.',
    order_index: 2,
  },
  {
    id: 'm-6-mat-3',
    grade_id: '6_ano',
    subject_id: 'matematica',
    title: 'Frações, MMC e MDC',
    description: 'Frações equivalentes, simplificação, comparação, operações, cálculo do MMC e MDC.',
    order_index: 3,
  },
  {
    id: 'm-6-mat-4',
    grade_id: '6_ano',
    subject_id: 'matematica',
    title: 'Geometria Plana, Sólidos e Ângulos',
    description: 'Figuras planas, perímetro, área básica, ângulos (agudo, reto, obtuso), simetria e sólidos espaciais.',
    order_index: 4,
  },
  {
    id: 'm-6-mat-5',
    grade_id: '6_ano',
    subject_id: 'matematica',
    title: 'Medidas, Espaço e Tratamento da Informação',
    description: 'Medidas de tempo, comprimento, massa, capacidade, leitura de gráficos e tabelas estatísticas.',
    order_index: 5,
  },

  // =================== 7º ANO - LÍNGUA PORTUGUESA ===================
  {
    id: 'm-7-port-1',
    grade_id: '7_ano',
    subject_id: 'portugues',
    title: 'Linguagem, Variação Linguística e Sentidos',
    description: 'Língua, linguagem verbal e não-verbal, variedades linguísticas e adequação comunicativa.',
    order_index: 1,
  },
  {
    id: 'm-7-port-2',
    grade_id: '7_ano',
    subject_id: 'portugues',
    title: 'Pontuação, Fonologia e Acentuação',
    description: 'Sinais de pontuação, expressividade, encontros vocálicos, consonantais e acentuação da norma culta.',
    order_index: 2,
  },
  {
    id: 'm-7-port-3',
    grade_id: '7_ano',
    subject_id: 'portugues',
    title: 'Morfologia: Advérbios, Verbos e Nomes',
    description: 'Classes de palavras com ênfase no advérbio, tempos e modos verbais, e flexões nominais completas.',
    order_index: 3,
  },
  {
    id: 'm-7-port-4',
    grade_id: '7_ano',
    subject_id: 'portugues',
    title: 'Ortografia Rigorosa e Relações Semânticas',
    description: 'Regras ortográficas especiais com X, CH, S, Z, J, G, Ç, SS, os 4 porquês e sinonímia/antonímia.',
    order_index: 4,
  },

  // =================== 7º ANO - MATEMÁTICA ===================
  {
    id: 'm-7-mat-1',
    grade_id: '7_ano',
    subject_id: 'matematica',
    title: 'Números Naturais, Primos e Divisibilidade',
    description: 'Classes e ordens, números primos, critérios de divisibilidade (2 a 10), potências e raízes.',
    order_index: 1,
  },
  {
    id: 'm-7-mat-2',
    grade_id: '7_ano',
    subject_id: 'matematica',
    title: 'Frações Avançadas e Números Decimais',
    description: 'Operações completas (+, -, *, /) com frações, números mistos, decimais até milésimos e arredondamentos.',
    order_index: 2,
  },
  {
    id: 'm-7-mat-3',
    grade_id: '7_ano',
    subject_id: 'matematica',
    title: 'Porcentagem e Situações Financeiras',
    description: 'Cálculo percentual, aumentos, descontos comerciais e problemas com sistema monetário brasileiro.',
    order_index: 3,
  },
  {
    id: 'm-7-mat-4',
    grade_id: '7_ano',
    subject_id: 'matematica',
    title: 'Geometria Plana, Espacial e Cartesiana',
    description: 'Ponto, reta, plano, polígonos, quadriláteros, plano cartesiano, sólidos, planificações e volumes.',
    order_index: 4,
  },
  {
    id: 'm-7-mat-5',
    grade_id: '7_ano',
    subject_id: 'matematica',
    title: 'Estatística, Probabilidade e Expressões',
    description: 'Média, mediana, moda, noções de probabilidade, gráficos, tabelas e expressões numéricas com problemas.',
    order_index: 5,
  },
];

export const TOPICS_DATA: Topic[] = [
  // =================== 6º ANO PORTUGUÊS ===================
  {
    id: 'top-6-port-generos',
    module_id: 'm-6-port-1',
    title: 'Gêneros e Tipologias Textuais (Narrativo, Poema e Crônica)',
    summary: 'Compreensão de texto, versos, estrofes, eu lírico, parágrafos e características narrativas do edital.',
    order_index: 1,
  },
  {
    id: 'top-6-port-fonemas',
    module_id: 'm-6-port-2',
    title: 'Letras, Fonemas, Encontros e Dígrafos',
    summary: 'Diferença entre letra e som, ditongos, tritongos, hiatos e dígrafos consonantais e vocálicos.',
    order_index: 1,
  },
  {
    id: 'top-6-port-tonicidade',
    module_id: 'm-6-port-3',
    title: 'Tonicidade e Posição da Sílaba Tônica',
    summary: 'Identificação da sílaba mais forte e classificação em oxítonas, paroxítonas e proparoxítonas.',
    order_index: 1,
  },
  {
    id: 'top-6-port-acentuacao',
    module_id: 'm-6-port-3',
    title: 'Regras de Acentuação Gráfica Oficial',
    summary: 'Regras para monossílabos tônicos, oxítonas, paroxítonas e a regra obrigatória das proparoxítonas.',
    order_index: 2,
  },
  {
    id: 'top-6-port-classes',
    module_id: 'm-6-port-4',
    title: 'Substantivos e Adjetivos: Classificação e Flexões',
    summary: 'Nomeação dos seres, características, concordância e flexões de gênero, número e grau.',
    order_index: 1,
  },
  {
    id: 'top-6-port-verbos',
    module_id: 'm-6-port-4',
    title: 'Verbos: Tempos, Modos (Indicativo e Imperativo) e Pessoas',
    summary: 'Ações, estados e fenômenos. Identificação do imperativo nas instruções e comandos disciplinares.',
    order_index: 2,
  },
  {
    id: 'top-6-port-ortografia',
    module_id: 'm-6-port-5',
    title: 'Ortografia: Emprego de X, CH, S, Z, J, G, Ç e SS',
    summary: 'Dicas práticas e regras da norma culta para acertar a grafia das palavras no processo seletivo.',
    order_index: 1,
  },

  // =================== 6º ANO MATEMÁTICA ===================
  {
    id: 'top-6-mat-posicional',
    module_id: 'm-6-mat-1',
    title: 'Sistema Decimal e Valor Posicional até Bilhões',
    summary: 'Compreensão de ordens e classes numéricas, valor absoluto e valor relativo (posicional).',
    order_index: 1,
  },
  {
    id: 'top-6-mat-operacoes',
    module_id: 'm-6-mat-1',
    title: 'As Quatro Operações Fundamentais e Propriedades',
    summary: 'Adição, subtração, multiplicação e divisão com resolução de situações-problema do cotidiano.',
    order_index: 2,
  },
  {
    id: 'top-6-mat-romanos',
    module_id: 'm-6-mat-2',
    title: 'Algarismos Romanos: Leitura, Escrita e Conversão (I a M)',
    summary: 'Regras aditivas e subtrativas com I, V, X, L, C, D e M em monumentos, séculos e relógios.',
    order_index: 1,
  },
  {
    id: 'top-6-mat-fracoes',
    module_id: 'm-6-mat-3',
    title: 'Frações Equivalentes, Simplificação e Operações',
    summary: 'Conceito de partes de um todo, comparação, frações irredutíveis e operações fundamentais.',
    order_index: 1,
  },
  {
    id: 'top-6-mat-mmc-mdc',
    module_id: 'm-6-mat-3',
    title: 'Mínimo Múltiplo Comum (MMC) e Máximo Divisor Comum (MDC)',
    summary: 'Método da decomposição simultânea em primos para resolver problemas de encontros e lotes iguais.',
    order_index: 2,
  },
  {
    id: 'top-6-mat-geometria',
    module_id: 'm-6-mat-4',
    title: 'Figuras Planas, Perímetro, Área e Ângulos',
    summary: 'Cálculo de contorno (perímetro), superfície (área) e classificação de ângulos (reto, agudo, obtuso).',
    order_index: 1,
  },
  {
    id: 'top-6-mat-medidas',
    module_id: 'm-6-mat-5',
    title: 'Unidades de Medida e Tratamento da Informação',
    summary: 'Medidas de tempo (horas/min/s), comprimento (m/km), massa (kg/g), capacidade (litro) e gráficos.',
    order_index: 1,
  },

  // =================== 7º ANO PORTUGUÊS ===================
  {
    id: 'top-7-port-linguagem',
    module_id: 'm-7-port-1',
    title: 'Linguagem Verbal, Não-Verbal e Variações Linguísticas',
    summary: 'Língua formal e informal, adequação aos contextos, variedades regionais e recursos expressivos.',
    order_index: 1,
  },
  {
    id: 'top-7-port-pontuacao',
    module_id: 'm-7-port-2',
    title: 'Pontuação Expressiva: Vírgula, Vocativo e Aposto',
    summary: 'Emprego correto da vírgula para isolar vocativo, aposto e enumerações em textos seletivos.',
    order_index: 1,
  },
  {
    id: 'top-7-port-adverbio',
    module_id: 'm-7-port-3',
    title: 'Advérbios e Locuções Adverbiais de Modo, Tempo e Lugar',
    summary: 'Palavras invariáveis que modificam verbos, adjetivos e advérbios indicando circunstâncias.',
    order_index: 1,
  },
  {
    id: 'top-7-port-verbos-avancados',
    module_id: 'm-7-port-3',
    title: 'Verbos: Modos Indicativo, Subjuntivo e Correlação Temporal',
    summary: 'Expressão de certeza, hipótese, dúvida e ordem nas formas verbais compostas e primitivas.',
    order_index: 2,
  },
  {
    id: 'top-7-port-ortografia',
    module_id: 'm-7-port-4',
    title: 'Uso dos Porquês, Homônimos, Parônimos e Semântica',
    summary: 'Domínio dos 4 porquês (por que, por quê, porque, porquê), sentido literal e sentido figurado.',
    order_index: 1,
  },

  // =================== 7º ANO MATEMÁTICA ===================
  {
    id: 'top-7-mat-divisibilidade',
    module_id: 'm-7-mat-1',
    title: 'Critérios de Divisibilidade (2 a 10) e Números Primos',
    summary: 'Identificação rápida de divisores sem conta longa e fatoração completa em números primos.',
    order_index: 1,
  },
  {
    id: 'top-7-mat-potencias',
    module_id: 'm-7-mat-1',
    title: 'Potenciação e Raízes Quadradas Exatas',
    summary: 'Propriedades das potências de base 10, expoentes naturais e cálculo de raízes quadradas exatas.',
    order_index: 2,
  },
  {
    id: 'top-7-mat-fracoes-avancadas',
    module_id: 'm-7-mat-2',
    title: 'Operações com Frações, Números Mistos e Decimais',
    summary: 'Multiplicação e divisão fracionária, transformação de frações em números decimais e arredondamento.',
    order_index: 1,
  },
  {
    id: 'top-7-mat-porcentagem',
    module_id: 'm-7-mat-3',
    title: 'Porcentagem, Acréscimos, Descontos e Sistema Monetário',
    summary: 'Cálculo ágil de porcentagens por fração centesimal e resolução de descontos e aumentos do dia a dia.',
    order_index: 1,
  },
  {
    id: 'top-7-mat-cartesiano',
    module_id: 'm-7-mat-4',
    title: 'Plano Cartesiano, Coordenadas e Geometria Espacial',
    summary: 'Pares ordenados (x, y), eixos ortogonais, vértices, faces e arestas de sólidos geométricos.',
    order_index: 1,
  },
  {
    id: 'top-7-mat-estatistica',
    module_id: 'm-7-mat-5',
    title: 'Estatística: Média, Moda, Mediana e Probabilidade',
    summary: 'Cálculo de medidas de tendência central, interpretação de gráficos e probabilidade de eventos simples.',
    order_index: 1,
  },
];

export const LESSONS_DATA: Lesson[] = [
  // =========================================================================
  // 6º ANO - LÍNGUA PORTUGUESA (AULAS COMPLETAS E PEDAGÓGICAS)
  // =========================================================================
  {
    id: 'les-6-port-generos',
    topic_id: 'top-6-port-generos',
    title: 'Leitura e Gêneros Textuais: Poema, Fábula e Notícia',
    learning_objective: 'Distinguir os gêneros textuais cobrados no edital, reconhecer versos, estrofes, eu lírico e parágrafos, compreendendo a finalidade comunicativa de cada texto.',
    simple_explanation: 'Cada texto que lemos tem um objetivo e uma forma especial de ser construído: um poema expressa sentimentos em versos e estrofes, uma fábula ensina uma lição com animais falantes, e uma notícia nos informa sobre fatos reais com clareza e verdade!',
    detailed_development: `No processo seletivo do Colégio Militar Tiradentes XVII, a prova de Língua Portuguesa sempre traz textos ricos para testar sua capacidade de interpretação.

1. ESTRUTURA DOS TEXTOS EM VERSO E PROSA:
- Poema: É estruturado em versos (cada linha do poema) e estrofes (o bloco ou conjunto de versos). A voz que expressa sentimentos no poema é chamada de "Eu Lírico" ou "Eu Poético" (não confunda o autor real com a voz do poema!).
- Prosa: É o texto corrido, organizado em linhas contínuas e dividido em parágrafos (como contos, notícias e crônicas).

2. OS PRINCIPAIS GÊNEROS COBRADOS NO EDITAL:
- Fábula: Narrativa curta em que os personagens são geralmente animais com comportamentos humanos. Possui sempre uma "Moral da História" (ensinamento sobre virtudes, respeito e prudência).
- Notícia: Texto informativo e jornalístico que relata um acontecimento real. Responde às perguntas essenciais: O quê? Quem? Onde? Quando? Como? Por quê?
- Crônica: Texto leve que retrata cenas do cotidiano (uma conversa no ônibus, uma aula na escola, um acontecimento na cidade de Balsas), misturando observação e reflexão.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Contagem de versos e estrofes',
        problem: 'Um poema possui 3 blocos de texto, e cada bloco tem exatamente 4 linhas. Quantos versos e estrofes ele tem?',
        steps: [
          'Passo 1: Lembre-se de que cada linha individual é um verso.',
          'Passo 2: Cada bloco separado por um espaço em branco é uma estrofe.',
          'Passo 3: Temos 3 blocos -> portanto, 3 estrofes.',
          'Passo 4: Cada bloco tem 4 versos -> 3 × 4 = 12 versos no total.',
        ],
        final_answer: 'O poema possui 3 estrofes e 12 versos.',
      },
    ],
    daily_applications: 'A leitura atenta de ordens de serviço, avisos no quadro do Colégio Militar e artigos informativos exige a identificação imediata do gênero e da mensagem principal.',
    summary_keypoints: [
      'Verso = cada linha do poema.',
      'Estrofe = conjunto ou bloco de versos.',
      'Eu Lírico = a voz que fala dentro do poema.',
      'Fábula = personagens animais e moral educativa.',
      'Notícia = relato objetivo de fatos reais.',
    ],
    common_pitfalls: 'Confundir o autor do poema com o "eu lírico". O autor pode ser um adulto experiente escrevendo na voz de uma criança.',
    quick_review_questions: [
      {
        question: 'O que diferencia um texto em verso de um texto em prosa?',
        answer: 'O texto em verso é organizado em linhas curtas e estrofes; o texto em prosa é organizado em linhas contínuas e parágrafos.',
        tip: 'Lembre-se: poesia usa versos; redação tradicional usa parágrafos.',
      },
    ],
    order_index: 1,
    is_active: true,
  },

  {
    id: 'les-6-port-fonemas',
    topic_id: 'top-6-port-fonemas',
    title: 'Fonologia: Letra x Fonema, Encontros Vocálicos e Dígrafos',
    learning_objective: 'Diferenciar letra (símbolo gráfico) de fonema (som da fala), identificar ditongos, tritongos, hiatos e contar corretamente os dígrafos em palavras do cotidiano.',
    simple_explanation: 'Letra é o que a gente vê e escreve no papel; fonema é o som que a gente ouve e pronuncia! Às vezes uma palavra tem o mesmo número de letras e fonemas, mas quando há letras que não têm som (como o H) ou duas letras que fazem um só som (dígrafos), o número de fonemas muda!',
    detailed_development: `1. LETRA E FONEMA:
- Letra: Representação gráfica do som (alfabeto de 26 letras).
- Fonema: A menor unidade sonora capaz de diferenciar palavras (ex: Bota x Pota).
- Atenção ao "H": Na palavra "HOJE", temos 4 letras (H-O-J-E), mas apenas 3 fonemas (/o-j-e/), pois a letra H inicial não emite som!

2. ENCONTROS VOCÁLICOS:
- Ditongo: Encontro de uma vogal + semivogal (ou vice-versa) na MESMA sílaba (ex: pei-xe, pai, noi-te).
- Tritongo: Encontro de semivogal + vogal + semivogal na MESMA sílaba (ex: U-ru-guai, i-guais).
- Hiato: Encontro de duas vogais que ficam em SÍLABAS SEPARADAS ao dividir a palavra (ex: sa-ú-de, ba-ú, co-e-lho).

3. DÍGRAFOS (Duas letras produzindo UM ÚNICO fonema):
- Dígrafos Consonantais: CH, LH, NH, RR, SS, SC, SÇ, XC, GU (antes de e/i), QU (antes de e/i).
- Dígrafos Vocálicos: am, an, em, en, im, in, om, on, um, un (quando formam som nasal, ex: "canto" tem 5 letras e 4 fonemas).`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Contando letras e fonemas na palavra "GUERRA"',
        problem: 'Quantas letras e quantos fonemas possui a palavra "guerra"?',
        steps: [
          'Passo 1: Conte as letras escritas: G - U - E - R - R - A = 6 letras.',
          'Passo 2: Identifique os dígrafos: "GU" antes de E soa como /g/ (1 dígrafo); "RR" soa como um /r/ forte (1 dígrafo).',
          'Passo 3: Subtraia os dígrafos: 6 letras - 2 letras absorvidas = 4 fonemas (/g-e-r-a/).',
        ],
        final_answer: 'A palavra "guerra" possui 6 letras e 4 fonemas.',
      },
    ],
    daily_applications: 'A correta separação silábica e contagem fonética são essenciais na caligrafia militar, na translineação correta nas redações e na oratória em formaturas.',
    summary_keypoints: [
      'Letra se escreve; fonema se escuta.',
      'Dígrafo = 2 letras que emitem 1 som só.',
      'Hiato = vogais vizinhas que se separam na divisão silábica.',
      'Letra H no início não representa fonema.',
    ],
    common_pitfalls: 'Esquecer os dígrafos vocálicos (am, an, em, en...). Na palavra "campo", há 5 letras e 4 fonemas devido ao dígrafo "am" nasal.',
    quick_review_questions: [
      {
        question: 'Quantos fonemas tem a palavra "chave"?',
        answer: '4 fonemas (c-h faz um só som de /x/, seguido de a-v-e). Possui 5 letras e 4 fonemas.',
        tip: 'CH é dígrafo consonantal.',
      },
    ],
    order_index: 2,
    is_active: true,
  },

  {
    id: 'les-6-port-tonicidade',
    topic_id: 'top-6-port-tonicidade',
    title: 'Tonicidade: Sílaba Tônica, Oxítonas, Paroxítonas e Proparoxítonas',
    learning_objective: 'Identificar com facilidade a sílaba tônica das palavras da língua portuguesa e classificá-las corretamente quanto à sua posição.',
    simple_explanation: 'Toda palavra que possui mais de uma sílaba tem uma sílaba que nós pronunciamos com mais força e intensidade. Essa sílaba especial se chama sílaba tônica! As outras sílabas, faladas com menos força, são chamadas de átonas.',
    detailed_development: `Imagine que você está chamando alguém que mora longe pelo nome, na frente do portão. Quando você "chama" a palavra, a sílaba que fica mais demorada e forte na voz é a sílaba tônica!

Exemplo clássico:
- "Ca-feeeeeé!" -> A última sílaba é a mais forte.
- "A-miiii-go!" -> A penúltima sílaba é a mais forte.
- "Mééé-di-co!" -> A antepenúltima sílaba é a mais forte.

Para classificar no exame do Colégio Militar Tiradentes, conte sempre do final da palavra para o começo (de trás para frente):
1. OXÍTONA: Quando a última sílaba é a mais forte.
   Exemplos: urubu (u-ru-BU), jacaré (ja-ca-RÉ), coração (co-ra-ÇÃO), papel (pa-PEL).
2. PAROXÍTONA: Quando a penúltima sílaba é a mais forte. Na Língua Portuguesa, a grande maioria das palavras é paroxítona!
   Exemplos: mesa (ME-sa), escola (es-CO-la), lápis (LÁ-pis), soldado (sol-DA-do).
3. PROPAROXÍTONA: Quando a antepenúltima sílaba é a mais forte.
   Exemplos: lâmpada (LÂM-pa-da), pássaro (PÁS-sa-ro), exército (e-XÉR-ci-to).

Atenção à REGRA DE OURO DAS PROPAROXÍTONAS: TODAS as palavras proparoxítonas na língua portuguesa são obrigatoriamente acentuadas graficamente!`,
    step_by_step_examples: [
      {
        title: 'Exemplo 1: Classificando a palavra "SOLDADO"',
        problem: 'Classifique a palavra "soldado" quanto à posição da sua sílaba tônica.',
        steps: [
          'Passo 1: Faça a divisão silábica correta da palavra: sol - da - do.',
          'Passo 2: Finja que você está chamando no portão: "Sol-daaa-do!".',
          'Passo 3: A sílaba que sustentou a voz com mais energia foi "da".',
          'Passo 4: Verifique a posição de trás para frente: "-do" é a última; "-da-" é a penúltima.',
        ],
        final_answer: 'Como a sílaba mais forte é a penúltima, a palavra "soldado" é PAROXÍTONA.',
      },
    ],
    daily_applications: 'No Colégio Militar Tiradentes, você precisará ler textos em voz alta, redigir relatórios e entoar hinos com dicção impecável.',
    summary_keypoints: [
      'Sílaba tônica é a sílaba pronunciada com maior intensidade de voz.',
      'Oxítona = última sílaba é a tônica.',
      'Paroxítona = penúltima sílaba é a tônica.',
      'Proparoxítona = antepenúltima sílaba é a tônica.',
      'Regra inegociável: toda proparoxítona recebe acento gráfico.',
    ],
    common_pitfalls: 'Achar que toda sílaba tônica tem acento gráfico. Palavras como "caderno", "menino" e "Brasil" são tônicas sem ter acento escrito!',
    quick_review_questions: [
      {
        question: 'Qual é a classificação da palavra "árvore"?',
        answer: 'Proparoxítona (ár-vo-re: antepenúltima é a mais forte e tem acento).',
        tip: 'Conte sempre da direita para a esquerda.',
      },
    ],
    order_index: 3,
    is_active: true,
  },

  {
    id: 'les-6-port-acentuacao',
    topic_id: 'top-6-port-acentuacao',
    title: 'Regras de Acentuação Gráfica: Monossílabos, Oxítonas e Paroxítonas',
    learning_objective: 'Dominar as regras oficiais de acentuação gráfica do Acordo Ortográfico vigente para monossílabos tônicos, oxítonas e paroxítonas.',
    simple_explanation: 'Colocamos acento gráfico (agudo ou circunflexo) nas palavras para sinalizar a pronúncia correta segundo regras estabelecidas pela gramática oficial da nossa língua.',
    detailed_development: `1. MONOSSÍLABOS TÔNICOS:
Acentuam-se os monossílabos tônicos terminados em:
- A, E, O (seguidos ou não de S).
Exemplos: pá, pás, pé, pés, nó, nós, já, vê.

2. OXÍTONAS:
Acentuam-se as oxítonas terminadas em:
- A, E, O (seguidos ou não de S);
- EM, ENS.
Exemplos: sofás, café, cipó, armazém, parabéns.

3. PROPAROXÍTONAS:
Regra mais simples do mundo: TODAS são acentuadas sem exceção!
Exemplos: médico, relâmpago, xícara, exército.

4. PAROXÍTONAS:
Como a maioria das palavras em português já é paroxítona natural, acentuam-se apenas as que terminam em terminações especiais:
- R, I(s), N, L, U(s), X, Ã(s), Ão(s), UM, UNS, PS, Ditongos.
(Dica mnemônica dos professores militares: memorize a palavra ROUXINOL + Ditongo!).
Exemplos: caráter, júri, pólen, fácil, vírus, tórax, ímã, órgão, álbum, bíceps, história, colégio.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Justificando o acento de "PARABÉNS"',
        problem: 'Por que a palavra "parabéns" é acentuada?',
        steps: [
          'Passo 1: Identifique a tonicidade: pa - ra - BÉNS (última sílaba é a mais forte -> Oxítona).',
          'Passo 2: Verifique a terminação da palavra: termina em "-ens".',
          'Passo 3: Aplique a regra das oxítonas: oxítonas terminadas em A, E, O, EM, ENS são acentuadas.',
        ],
        final_answer: 'É acentuada por ser uma palavra oxítona terminada em "-ens".',
      },
    ],
    daily_applications: 'Em redações e redações oficiais, a correta acentuação é critério rigoroso de pontuação pelos avaliadores militares.',
    summary_keypoints: [
      'Monossílabos tônicos acentuados: terminados em A, E, O.',
      'Oxítonas acentuadas: terminadas em A, E, O, EM, ENS.',
      'Proparoxítonas: 100% acentuadas.',
      'Paroxítonas terminadas em ditongo oral recebem acento (ex: colégio, vitória).',
    ],
    common_pitfalls: 'Acentuar palavras oxítonas terminadas em I ou U sem hiato (ex: caju e urubu NÃO têm acento!).',
    quick_review_questions: [
      {
        question: 'A palavra "colégio" é acentuada por qual regra?',
        answer: 'Paroxítona terminada em ditongo crescente.',
        tip: 'co-lé-gio: a penúltima sílaba é tônica e termina em "-io" (ditongo).',
      },
    ],
    order_index: 4,
    is_active: true,
  },

  {
    id: 'les-6-port-classes',
    topic_id: 'top-6-port-classes',
    title: 'Classes de Palavras: Substantivos, Adjetivos e Artigos',
    learning_objective: 'Reconhecer substantivos e adjetivos em frases, identificando suas flexões de gênero (masculino/feminino) e número (singular/plural), e a função dos artigos definidos e indefinidos.',
    simple_explanation: 'O substantivo é a palavra que dá nome a tudo o que existe no mundo (pessoas, lugares, objetos, sentimentos). Já o adjetivo é a palavra que dá uma qualidade ou característica a esse substantivo!',
    detailed_development: `1. O SUBSTANTIVO (Dá nome aos seres):
- Próprio: Nome de pessoas, cidades ou países com letra maiúscula (ex: Tiradentes, Balsas, Maranhão).
- Comum: Nome genérico dado a seres da mesma espécie (ex: soldado, escola, caderno).
- Concreto: Seres com existência própria no mundo real ou imaginário (ex: mesa, árvore, fada).
- Abstrato: Sentimentos, ações ou qualidades que dependem de outro ser para existir (ex: coragem, disciplina, amor, estudo).
- Coletivo: Palavra no singular que indica um conjunto de seres da mesma espécie (ex: pelotão = soldados; cardume = peixes; biblioteca = livros).

2. O ADJETIVO (Caracteriza o substantivo):
- Atribui qualidade, estado ou aspecto (ex: aluno DEDICADO, farda IMPECÁVEL, prova DIFÍCIL).
- Concordância Nominal: O adjetivo deve SEMPRE concordar em gênero e número com o substantivo que acompanha (ex: Os alunos disciplinados / As alunas disciplinadas).

3. O ARTIGO:
- Definidos (determinam com precisão): o, a, os, as.
- Indefinidos (generalizam): um, uma, uns, umas.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Análise mórfica na oração militar',
        problem: 'Na frase "O bravo cadete recebeu a insígnia dourada", classifique as palavras destacadas.',
        steps: [
          'Passo 1: "O" e "a" determinam os seres -> Artigos definidos.',
          'Passo 2: "cadete" e "insígnia" nomeiam pessoas e objetos -> Substantivos.',
          'Passo 3: "bravo" qualifica o cadete; "dourada" qualifica a insígnia -> Adjetivos.',
        ],
        final_answer: 'Contém substantivos ("cadete", "insígnia") caracterizados por adjetivos ("bravo", "dourada").',
      },
    ],
    daily_applications: 'A disciplina militar preza pela precisão: descrever situações com substantivos exatos e adjetivos objetivos evita confusões em comandos.',
    summary_keypoints: [
      'Substantivo nomeia seres, objetos e ideias.',
      'Adjetivo qualifica ou caracteriza o substantivo.',
      'Artigo define ou indefine o substantivo.',
      'Concordância: gênero e número caminham juntos.',
    ],
    common_pitfalls: 'Confundir substantivo abstrato com adjetivo. "Corajoso" é adjetivo; "coragem" é substantivo abstrato!',
    quick_review_questions: [
      {
        question: 'Qual é o substantivo coletivo de soldados?',
        answer: 'Pelotão, batalhão, tropa ou exército.',
        tip: 'Indica um conjunto organizado de militares.',
      },
    ],
    order_index: 5,
    is_active: true,
  },

  {
    id: 'les-6-port-verbos',
    topic_id: 'top-6-port-verbos',
    title: 'Verbos Fundamentais: Ações, Modos e o Modo Imperativo',
    learning_objective: 'Identificar verbos em orações, reconhecer os modos Indicativo, Subjuntivo e Imperativo, compreendendo o valor de comandos no ambiente escolar e militar.',
    simple_explanation: 'O verbo é a palavra mais ativa da língua portuguesa! Ele nos mostra uma ação que alguém faz (correr), um estado em que alguém se encontra (estar calmo) ou um fenômeno da natureza (chover).',
    detailed_development: `1. OS TRÊS TEMPOS BÁSICOS:
- Presente: O fato acontece no momento atual (ex: Os cadetes estudam agora).
- Pretérito (Passado): O fato já aconteceu (ex: Os cadetes estudaram ontem).
- Futuro: O fato ainda vai acontecer (ex: Os cadetes estudarão amanhã).

2. OS MODOS VERBAIS:
- Modo Indicativo: Expressa CERTEZA, fatos reais e garantidos (ex: "Eu passarei no exame do Tiradentes").
- Modo Subjuntivo: Expressa DÚVIDA, possibilidade, desejo ou hipótese (ex: "Se eu estudar bastante, passarei").
- Modo Imperativo: Expressa ORDEM, PEDIDO, INSTRUÇÃO ou COMANDO!
  Exemplo de comando militar: "Marchem com cadência!", "Apresentem as carteirinhas!", "Mantenham o silêncio!"`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Reconhecendo o modo da oração',
        problem: 'Identifique o modo do verbo na frase: "Façam a prova com calma e leiam todas as questões."',
        steps: [
          'Passo 1: Identifique os verbos da oração: "Façam" (fazer) e "leiam" (ler).',
          'Passo 2: Observe a intenção comunicativa: o professor está dando uma orientação/ordem direta aos alunos.',
          'Passo 3: A forma que instrui, aconselha ou comanda pertence ao Modo Imperativo.',
        ],
        final_answer: 'Os verbos estão no MODO IMPERATIVO afirmativo.',
      },
    ],
    daily_applications: 'A linguagem das ordens de comando militar (Sentido! Cobrir! Descansar!) baseia-se diretamente no modo imperativo ou infinitivo com valor de comando.',
    summary_keypoints: [
      'Verbo indica ação, estado ou fenômeno da natureza.',
      'Indicativo = certeza e fato real.',
      'Subjuntivo = dúvida e possibilidade.',
      'Imperativo = ordem, instrução, pedido ou conselho.',
    ],
    common_pitfalls: 'Confundir o pretérito perfeito (ação concluída: estudou) com o pretérito imperfeito (ação contínua ou habitual no passado: estudava).',
    quick_review_questions: [
      {
        question: 'Em "Não corram no pátio!", o verbo está em qual modo?',
        answer: 'Modo Imperativo Negativo.',
        tip: 'Indica uma proibição ou instrução direta.',
      },
    ],
    order_index: 6,
    is_active: true,
  },

  {
    id: 'les-6-port-ortografia',
    topic_id: 'top-6-port-ortografia',
    title: 'Ortografia Oficial: Emprego de X/CH, S/Z, J/G e Ç/SS',
    learning_objective: 'Aplicar as regras ortográficas do edital para o emprego de letras com grafia duvidosa e utilizar a ordem alfabética na consulta ao dicionário.',
    simple_explanation: 'A ortografia é o conjunto de regras que nos ensina a escrever as palavras com as letras certas. Embora algumas letras tenham o mesmo som, há pistas valiosas para saber quando usar cada uma!',
    detailed_development: `1. EMPREGO DO X:
- Usa-se X após ditongos (duas vogais na mesma sílaba): peixe, caixa, faixa, frouxo.
- Usa-se X após a sílaba inicial "EN-": enxada, enxame, enxaqueca (exceção: quando a palavra primitiva começa com ch, como encharcar de charco).
- Usa-se X após a sílaba inicial "ME-": mexer, mexicano, mexilhão (exceção: mecha de cabelo).

2. EMPREGO DO J:
- Em palavras de origem tupi, indígena ou africana: jiboia, pajé, jenipapo, canjica.
- Em formas verbais de verbos terminados em -jar: viajar -> viajem (eles), arranjar -> arranje.

3. EMPREGO DO Ç e SS:
- Usa-se Ç e nunca SS no início de palavras.
- Usa-se SS apenas entre duas vogais para produzir o som de /s/: pássaro, osso, massa.
- Nenhuma palavra em português começa com Ç ou com SS!`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Justificando a escrita de "PEIXE"',
        problem: 'Por que a palavra "peixe" é grafada com X e não com CH?',
        steps: [
          'Passo 1: Observe a divisão silábica: pei - xe.',
          'Passo 2: Na primeira sílaba, há um encontro vocálico: "ei" é um ditongo decrescente.',
          'Passo 3: Regra oficial: após ditongo, emprega-se X.',
        ],
        final_answer: 'Grafa-se com X por ocorrer imediatamente após o ditongo "ei".',
      },
    ],
    daily_applications: 'Consultar dicionários por ordem alfabética para conferir vocábulos desconhecidos em redações do Colégio Tiradentes.',
    summary_keypoints: [
      'Após ditongo, grafa-se X (ex: caixa, peixe).',
      'Após sílaba inicial EN-, grafa-se X (ex: enxada).',
      'Palavras tupis e africanas grafam-se com J (ex: pajé, jiboia).',
      'Nenhuma palavra começa com Ç ou SS.',
    ],
    common_pitfalls: 'Escrever "viajem" achando que é o substantivo. "A viagem" (substantivo) é com G; "que eles viajem" (verbo) é com J!',
    quick_review_questions: [
      {
        question: 'Como se grafa o objeto de cavar a terra: enchada ou enxada?',
        answer: 'Enxada (com X, após a sílaba inicial en-).',
        tip: 'Regra do EN- inicial seguido de X.',
      },
    ],
    order_index: 7,
    is_active: true,
  },

  // =========================================================================
  // 6º ANO - MATEMÁTICA (AULAS COMPLETAS E PEDAGÓGICAS)
  // =========================================================================
  {
    id: 'les-6-mat-posicional',
    topic_id: 'top-6-mat-posicional',
    title: 'Sistema de Numeração Decimal e Valor Posicional até Bilhões',
    learning_objective: 'Compreender o princípio posicional decimal, distinguir valor absoluto de valor relativo, e ler números gigantescos organizados em classes e ordens.',
    simple_explanation: 'Nosso sistema de contagem é decimal porque agrupamos as quantidades de 10 em 10. Ele também é posicional: o mesmo algarismo 5 pode valer 5 unidades, 50, 500 ou 5 milhões, dependendo da casa onde ele se senta!',
    detailed_development: `No Sistema Decimal utilizamos apenas dez algarismos: 0, 1, 2, 3, 4, 5, 6, 7, 8 e 9.

Dividimos os algarismos em ORDENS (cada algarismo da direita para a esquerda) e agrupamos de 3 em 3 formando uma CLASSE:
1. Classe das Unidades Simples (1ª ordem U, 2ª ordem D, 3ª ordem C).
2. Classe dos Milhares (4ª ordem UM = 1.000, 5ª ordem DM = 10.000, 6ª ordem CM = 100.000).
3. Classe dos Milhões (7ª ordem UMi = 1.000.000, 8ª ordem DMi = 10.000.000, 9ª ordem CMi = 100.000.000).
4. Classe dos Bilhões (10ª ordem UBi = 1.000.000.000).

VALOR ABSOLUTO vs. VALOR RELATIVO (POSICIONAL):
- Valor Absoluto (VA): É o valor do algarismo isolado, não importa onde ele esteja. O VA de 7 é sempre 7.
- Valor Relativo (VR): É o valor que assume de acordo com a casa que ocupa. No número 7.420, o VR do 7 é 7.000!`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Decomposição de 45.208.613',
        problem: 'Identifique o número de ordens, classes e o valor relativo do algarismo 5 em 45.208.613.',
        steps: [
          'Passo 1: Conta-se 8 algarismos -> 8 ordens.',
          'Passo 2: Blocos de 3 algarismos: 45 . 208 . 613 -> 3 classes.',
          'Passo 3: O algarismo 5 está na Unidade de Milhão (7ª ordem).',
          'Passo 4: Valor relativo: 5 × 1.000.000 = 5.000.000.',
        ],
        final_answer: 'Possui 8 ordens, 3 classes e o valor relativo do 5 é 5.000.000.',
      },
    ],
    daily_applications: 'A população do Brasil (mais de 203 milhões), orçamentos de obras em Balsas e dados astronômicos são medidos nessa escala.',
    summary_keypoints: [
      'Cada algarismo ocupa uma ordem.',
      'A cada 3 ordens da direita para a esquerda, forma-se uma classe.',
      'Valor Absoluto não muda; Valor Relativo depende da ordem ocupada.',
    ],
    common_pitfalls: 'Contar as ordens da esquerda para a direita. Ordens são sempre contadas da direita para a esquerda!',
    quick_review_questions: [
      {
        question: 'Qual é o valor relativo do algarismo 8 no número 38.450?',
        answer: '8.000 (oito mil unidades).',
        tip: 'O algarismo 8 está na 4ª ordem (unidades de milhar).',
      },
    ],
    order_index: 1,
    is_active: true,
  },

  {
    id: 'les-6-mat-operacoes',
    topic_id: 'top-6-mat-operacoes',
    title: 'As Quatro Operações Fundamentais e Propriedades',
    learning_objective: 'Dominar algoritmos da adição, subtração, multiplicação e divisão, aplicando as propriedades comutativa, associativa e distributiva na resolução de problemas.',
    simple_explanation: 'As quatro operações são as ferramentas mestras da matemática: juntar (adição), retirar ou comparar (subtração), repetir parcelas iguais (multiplicação) e repartir em partes iguais (divisão).',
    detailed_development: `1. PROPRIEDADES DA ADIÇÃO E MULTIPLICAÇÃO:
- Comutativa: A ordem dos fatores/parcelas não altera o resultado (3 + 5 = 5 + 3 e 4 × 7 = 7 × 4).
- Associativa: Podemos agrupar de maneiras diferentes ( (2 + 3) + 4 = 2 + (3 + 4) ).
- Elemento Neutro: O zero na adição (8 + 0 = 8) e o um na multiplicação (9 × 1 = 9).
- Propriedade Distributiva: Multiplicar um número por uma soma ( 3 × (10 + 2) = 3×10 + 3×2 = 30 + 6 = 36 ).

2. RELAÇÃO FUNDAMENTAL DA DIVISÃO EUCLIDIANA:
Dividendo = (Divisor × Quociente) + Resto
Lembre-se sempre: o resto deve ser estritamente menor que o divisor!`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Problema das cadeiras do auditório',
        problem: 'O auditório do Colégio Militar possui 18 fileiras com 24 cadeiras em cada uma. Se 380 alunos ocuparam os assentos, quantas cadeiras ficaram vazias?',
        steps: [
          'Passo 1: Calcule o total de cadeiras: 18 × 24 = 432 cadeiras.',
          'Passo 2: Subtraia as cadeiras ocupadas pelos estudantes: 432 - 380.',
          'Passo 3: 432 - 380 = 52 cadeiras restantes.',
        ],
        final_answer: 'Ficaram exatamente 52 cadeiras vazias.',
      },
    ],
    daily_applications: 'Controle de suprimentos do rancho militar, cálculo de notas e rateio de despesas escolares.',
    summary_keypoints: [
      'Dividendo = (Divisor × Quociente) + Resto.',
      'O resto nunca pode ser maior ou igual ao divisor.',
      'A propriedade distributiva acelera o cálculo mental.',
    ],
    common_pitfalls: 'Esquecer de colocar o zero no quociente quando o número baixado na divisão for menor que o divisor.',
    quick_review_questions: [
      {
        question: 'Numa divisão de divisor 6, qual é o maior resto possível?',
        answer: '5.',
        tip: 'O maior resto possível é sempre o divisor menos um.',
      },
    ],
    order_index: 2,
    is_active: true,
  },

  {
    id: 'les-6-mat-romanos',
    topic_id: 'top-6-mat-romanos',
    title: 'Algarismos Romanos: Leitura, Escrita e Conversão (I a M)',
    learning_objective: 'Ler e converter números romanos de 1 a 3.999 usando as regras de adição e subtração oficial cobradas no exame do Colégio Militar.',
    simple_explanation: 'Os antigos romanos usavam 7 letras maiúsculas para representar números: I (1), V (5), X (10), L (50), C (100), D (500) e M (1.000). Com regras de somar e subtrair, escrevemos qualquer número!',
    detailed_development: `OS SETE SÍMBOLOS FUNDAMENTAIS:
- I = 1 | V = 5 | X = 10 | L = 50 | C = 100 | D = 500 | M = 1.000

AS TRÊS REGRAS DE OURO:
1. Regra da Repetição: Os símbolos I, X, C e M podem ser repetidos no máximo 3 vezes seguidas (ex: III = 3, XXX = 30, CCC = 300, MMM = 3.000). Os símbolos V, L e D NUNCA se repetem!
2. Regra Aditiva: Símbolo menor à direita de um maior é SOMADO (ex: VI = 5+1 = 6; LX = 50+10 = 60; CL = 100+50 = 150).
3. Regra Subtrativa: Símbolo menor à esquerda de um maior é SUBTRAÍDO:
   - I antes de V ou X: IV = 4; IX = 9.
   - X antes de L ou C: XL = 40; XC = 90.
   - C antes de D ou M: CD = 400; CM = 900.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Conversão do número romano CMLXXIV',
        problem: 'Converta CMLXXIV para o sistema decimal.',
        steps: [
          'Passo 1: CM = 1.000 - 100 = 900.',
          'Passo 2: LXX = 50 + 10 + 10 = 70.',
          'Passo 3: IV = 5 - 1 = 4.',
          'Passo 4: Some tudo: 900 + 70 + 4 = 974.',
        ],
        final_answer: 'O número equivale a 974.',
      },
    ],
    daily_applications: 'Numeração de séculos históricos, capítulos de leis, relógios antigos e nomes de papas e reis.',
    summary_keypoints: [
      'I=1, V=5, X=10, L=50, C=100, D=500, M=1.000.',
      'Apenas I, X, C, M repetem até 3 vezes.',
      'Símbolo menor à esquerda subtrai.',
    ],
    common_pitfalls: 'Escrever 4 como IIII ou 90 como LXXXX. O correto é IV e XC!',
    quick_review_questions: [
      {
        question: 'Como se escreve o número 49 em algarismos romanos?',
        answer: 'XLIX (40 = XL e 9 = IX). Jamais escreva IL!',
        tip: 'O algarismo I só pode subtrair de V e X.',
      },
    ],
    order_index: 3,
    is_active: true,
  },

  {
    id: 'les-6-mat-fracoes',
    topic_id: 'top-6-mat-fracoes',
    title: 'Frações: Conceito, Equivalência e Operações Básicas',
    learning_objective: 'Compreender o significado de numerador e denominador, simplificar frações até a forma irredutível e calcular frações de uma quantidade.',
    simple_explanation: 'Uma fração representa uma ou mais partes de um todo que foi dividido em partes exatamente iguais. O número de baixo (denominador) diz em quantas fatias dividimos; o número de cima (numerador) diz quantas fatias pegamos!',
    detailed_development: `1. TERMOS DA FRAÇÃO:
- Numerador: partes consideradas (fica em cima).
- Denominador: total de partes iguais em que o todo foi repartido (fica em baixo e nunca pode ser zero!).

2. FRAÇÕES EQUIVALENTES:
São frações que representam a mesma quantidade, mesmo escritas com números diferentes!
Para encontrar frações equivalentes, basta multiplicar ou dividir o numerador e o denominador pelo mesmo número diferente de zero (ex: 1/2 = 2/4 = 3/6 = 5/10).

3. CÁLCULO DE FRAÇÃO DE UMA QUANTIDADE:
Para calcular (a/b) de um número total:
Divida o número pelo denominador e multiplique pelo numerador!
Exemplo: 3/4 de 40 alunos = (40 ÷ 4) × 3 = 10 × 3 = 30 alunos.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Acertos no simulado do CMT',
        problem: 'Em uma prova com 30 questões, uma aluna acertou 4/5 da prova. Quantas questões ela acertou?',
        steps: [
          'Passo 1: Divida o total pelo denominador: 30 ÷ 5 = 6 (valor de 1/5).',
          'Passo 2: Multiplique pelo numerador: 6 × 4 = 24 questões.',
        ],
        final_answer: 'Ela acertou 24 questões.',
      },
    ],
    daily_applications: 'Receitas culinárias, divisão de fatias de pizza, cálculo de porcentagens e rendimento escolar.',
    summary_keypoints: [
      'Numerador indica as partes tomadas; Denominador indica o total de divisões.',
      'Fração irredutível não pode mais ser simplificada.',
      'Fração de quantidade: divide pelo de baixo e multiplica pelo de cima.',
    ],
    common_pitfalls: 'Somar denominadores na adição de frações com mesmo denominador (ex: 1/5 + 2/5 = 3/5 e NÃO 3/10!).',
    quick_review_questions: [
      {
        question: 'Qual é a forma simplificada de 12/18?',
        answer: '2/3 (dividindo ambos por 6).',
        tip: 'Encontre o MDC de 12 e 18 para simplificar de uma só vez.',
      },
    ],
    order_index: 4,
    is_active: true,
  },

  {
    id: 'les-6-mat-mmc-mdc',
    topic_id: 'top-6-mat-mmc-mdc',
    title: 'Mínimo Múltiplo Comum (MMC) e Máximo Divisor Comum (MDC)',
    learning_objective: 'Diferenciar múltiplos de divisores, calcular o MMC e o MDC pela fatoração simultânea em números primos e resolver problemas práticos de encontros e divisões em lotes.',
    simple_explanation: 'O MMC é o menor número que é múltiplo comum de dois ou mais números (usado para saber quando coisas voltam a acontecer juntas!). O MDC é o maior número que divide perfeitamente todos eles ao mesmo tempo (usado para repartir em pedaços do maior tamanho possível).',
    detailed_development: `MÉTODO DA FATORAÇÃO SIMULTÂNEA:
1. Calculando o MMC:
   Divida simultaneamente pelos números primos (2, 3, 5, 7, 11...). Multiplique TODOS os fatores encontrados no final!
2. Calculando o MDC:
   Destaque apenas os fatores primos que dividiram TODOS os números da linha ao mesmo tempo. O MDC é a multiplicação desses fatores comuns!

DICAS DE INTERPRETAÇÃO NO EDITAL CMT XVII:
- Problemas com: "quando vão se encontrar de novo", "partem juntos novamente", "piscam ao mesmo tempo" -> Problema de MMC!
- Problemas com: "dividir no maior tamanho possível sem sobrar nada", "repartir em lotes iguais máximos" -> Problema de MDC!`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Semáforos em Balsas',
        problem: 'Dois semáforos piscam em alerta: um a cada 12 segundos e o outro a cada 18 segundos. Se piscaram juntos agora, após quanto tempo piscarão juntos de novo?',
        steps: [
          'Passo 1: Pergunta sobre encontro simultâneo futuro -> Calcular MMC de 12 e 18.',
          'Passo 2: Fatoração: 12, 18 por 2 -> 6, 9; por 2 -> 3, 9; por 3 -> 1, 3; por 3 -> 1, 1.',
          'Passo 3: Multiplique: 2 × 2 × 3 × 3 = 4 × 9 = 36.',
        ],
        final_answer: 'Piscarão juntos novamente após 36 segundos.',
      },
    ],
    daily_applications: 'Horários de remédios (um de 6h em 6h e outro de 8h em 8h), sincronia de patrulhas e divisões de turmas em pelotões equilibrados.',
    summary_keypoints: [
      'MMC = encontros periódicos futuros (multiplica todos os fatores).',
      'MDC = maior divisão comum sem sobra (multiplica apenas os fatores comuns).',
      'Primos: 2, 3, 5, 7, 11, 13, 17, 19...',
    ],
    common_pitfalls: 'Confundir quando a questão pede MMC e quando pede MDC no enunciado.',
    quick_review_questions: [
      {
        question: 'Qual é o MMC entre 4 e 6?',
        answer: '12.',
        tip: 'Múltiplos de 4: 0, 4, 8, 12... Múltiplos de 6: 0, 6, 12... Menor comum positivo: 12.',
      },
    ],
    order_index: 5,
    is_active: true,
  },

  {
    id: 'les-6-mat-geometria',
    topic_id: 'top-6-mat-geometria',
    title: 'Geometria: Figuras Planas, Perímetro, Área e Ângulos',
    learning_objective: 'Calcular o perímetro e a área de quadrados e retângulos, e classificar ângulos em agudo, reto e obtuso.',
    simple_explanation: 'O perímetro é a medida de todo o contorno (como a cerca de um campo de futebol). A área é a medida do espaço de dentro da superfície (como a grama que cobre o campo inteiro)!',
    detailed_development: `1. PERÍMETRO (Contorno):
Soma de todos os lados da figura plana.
- Perímetro do Retângulo: P = 2 × (comprimento + largura).
- Perímetro do Quadrado: P = 4 × lado.

2. ÁREA (Superfície):
- Área do Quadrado: A = lado × lado (L²).
- Área do Retângulo: A = base × altura (b × h).
Unidades de área usamexpoente 2: m² (metros quadrados), cm² (centímetros quadrados).

3. CLASSIFICAÇÃO DOS ÂNGULOS:
- Ângulo Reto: Mede exatamente 90º (o canto perfeito de uma folha de papel ou de uma parede).
- Ângulo Agudo: Mede menos de 90º (mais fechadinho).
- Ângulo Obtuso: Mede mais de 90º e menos de 180º (mais aberto).
- Ângulo Raso: Mede exatamente 180º (uma linha reta).`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Campo de futebol society em Balsas',
        problem: 'Um campo retangular tem 40 metros de comprimento e 25 metros de largura. Calcule o seu perímetro e a sua área.',
        steps: [
          'Passo 1: Perímetro = 40 + 25 + 40 + 25 = 130 metros.',
          'Passo 2: Área = base × altura = 40 × 25 = 1.000 metros quadrados (m²).',
        ],
        final_answer: 'Perímetro = 130 m e Área = 1.000 m².',
      },
    ],
    daily_applications: 'Dimensionamento de quadras esportivas, cálculo de pisos cerâmicos e alinhamento de formações militares.',
    summary_keypoints: [
      'Perímetro = soma dos lados (unidade linear: m, cm).',
      'Área = medida da superfície (unidade quadrada: m², cm²).',
      'Reto = 90º; Agudo < 90º; Obtuso > 90º.',
    ],
    common_pitfalls: 'Confundir unidades: perímetro é em metros (m); área é em metros quadrados (m²)!',
    quick_review_questions: [
      {
        question: 'Quantos graus mede um ângulo reto?',
        answer: 'Exatamente 90 graus.',
        tip: 'Simbolizado pelo quadradinho com um ponto no meio.',
      },
    ],
    order_index: 6,
    is_active: true,
  },

  {
    id: 'les-6-mat-medidas',
    topic_id: 'top-6-mat-medidas',
    title: 'Medidas de Tempo, Comprimento, Massa e Gráficos',
    learning_objective: 'Converter unidades de tempo (horas, minutos, segundos), comprimento (m, km), massa (kg, g), capacidade (L, mL) e interpretar gráficos e tabelas estatísticas.',
    simple_explanation: 'Para medir o mundo, criamos réguas padronizadas: medimos o tempo em relógios (60 minutos por hora), o comprimento em metros e quilômetros, o peso em quilos e os líquidos em litros!',
    detailed_development: `1. MEDIDAS DE TEMPO:
- 1 hora = 60 minutos
- 1 minuto = 60 segundos
- 1 hora = 3.600 segundos
- 1 dia = 24 horas

2. MEDIDAS DE COMPRIMENTO E MASSA:
- 1 quilômetro (km) = 1.000 metros (m)
- 1 metro (m) = 100 centímetros (cm)
- 1 quilograma (kg) = 1.000 gramas (g)
- 1 tonelada (t) = 1.000 quilogramas (kg)
- 1 litro (L) = 1.000 mililitros (mL)

3. LEITURA DE GRÁFICOS E TABELAS:
- Gráficos de barras e colunas: o tamanho da barra indica a quantidade ou frequência.
- Gráficos de linha: mostram a evolução de dados ao longo do tempo.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Duração do teste físico',
        problem: 'Um estudante correu por 1 hora e 25 minutos na pista de atletismo. Quantos minutos durou essa corrida no total?',
        steps: [
          'Passo 1: Converta 1 hora em minutos: 1 hora = 60 minutos.',
          'Passo 2: Some os 25 minutos adicionais: 60 + 25 = 85 minutos.',
        ],
        final_answer: 'A corrida durou 85 minutos.',
      },
    ],
    daily_applications: 'Cronometragem de testes de aptidão física (TAF), pesagem de mochilas escolares e dosagem de hidratação.',
    summary_keypoints: [
      '1 h = 60 min = 3.600 s.',
      '1 km = 1.000 m; 1 kg = 1.000 g; 1 L = 1.000 mL.',
      'Sempre observe a legenda e o título ao analisar gráficos.',
    ],
    common_pitfalls: 'Achar que 1 hora tem 100 minutos porque nosso sistema é decimal. Tempo é medido na base sexagesimal (60)!',
    quick_review_questions: [
      {
        question: 'Quantos gramas há em 2,5 quilogramas?',
        answer: '2.500 gramas (2,5 × 1.000).',
        tip: 'Multiplique por 1.000 para converter kg em g.',
      },
    ],
    order_index: 7,
    is_active: true,
  },

  // =========================================================================
  // 7º ANO - LÍNGUA PORTUGUESA (AULAS COMPLETAS E PEDAGÓGICAS)
  // =========================================================================
  {
    id: 'les-7-port-linguagem',
    topic_id: 'top-7-port-linguagem',
    title: 'Linguagem Verbal, Não-Verbal e Variações Linguísticas',
    learning_objective: 'Compreender a diferença entre linguagem verbal, não-verbal e mista, e identificar as variações linguísticas (regional, social e nível formal/informal).',
    simple_explanation: 'Nos comunicamos com palavras (linguagem verbal), mas também com gestos, placas e cores (linguagem não-verbal). Além disso, a língua se transforma de acordo com a região, a idade e a situação!',
    detailed_development: `1. TIPOS DE LINGUAGEM:
- Verbal: Utiliza palavras escritas ou faladas (livros, discursos, redações).
- Não-Verbal: Utiliza sinais visuais, sons, gestos, desenhos e cores sem palavras (semáforo, cartão vermelho no futebol, toque de corneta militar).
- Mista (Híbrida): Combina palavras e imagens (quadrinhos, placas com desenho e texto, tirinhas, memes).

2. VARIAÇÕES LINGUÍSTICAS:
- Variação Regional (Diatópica): Palavras típicas de diferentes regiões do Brasil (ex: macaxeira no Nordeste / aipim no Sudeste / mandioca no Sul).
- Variação Social (Diastrática): Gírias de grupos jovens, jargão profissional médico ou militar.
- Adequação Linguística: Saber quando usar a norma culta padrão (numa prova, num documento militar) e a linguagem coloquial informal (com amigos na hora do recreio).`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Análise de uma placa militar de "PARE"',
        problem: 'Uma placa octogonal vermelha com a palavra "PARE" escrita em branco pertence a qual tipo de linguagem?',
        steps: [
          'Passo 1: A forma octogonal e a cor vermelha transmitem a mensagem de parada sem palavras (não-verbal).',
          'Passo 2: A palavra escrita "PARE" transmite a mensagem com letras (verbal).',
          'Passo 3: A fusão de imagem e texto caracteriza a linguagem mista.',
        ],
        final_answer: 'Linguagem Mista.',
      },
    ],
    daily_applications: 'Nos desfiles cívicos e continências militares, a comunicação não-verbal expressa respeito e disciplina sem necessidade de palavras.',
    summary_keypoints: [
      'Verbal usa palavras; Não-verbal usa imagens, gestos e sons.',
      'Mista combina palavras e imagens.',
      'A norma culta é a exigência formal do processo seletivo do CMT.',
    ],
    common_pitfalls: 'Achar que a variação linguística é "erro de português". Na linguística moderna, cada variedade é válida em seu contexto social adequado.',
    quick_review_questions: [
      {
        question: 'O toque de silêncio da corneta militar é qual tipo de linguagem?',
        answer: 'Linguagem Não-Verbal sonora.',
        tip: 'Transmite uma mensagem clara sem o uso de palavras faladas.',
      },
    ],
    order_index: 1,
    is_active: true,
  },

  {
    id: 'les-7-port-pontuacao',
    topic_id: 'top-7-port-pontuacao',
    title: 'Pontuação Expressiva: Uso da Vírgula, Vocativo e Aposto',
    learning_objective: 'Empregar a vírgula com rigor para isolar vocativos e apostos, e compreender os efeitos de sentido provocados pelos sinais de pontuação.',
    simple_explanation: 'A pontuação é como o sinal de trânsito do texto: ela organiza o pensamento, evita mal-entendidos e dá entonação às frases. Uma vírgula no lugar errado pode mudar todo o sentido de uma frase!',
    detailed_development: `1. A REGRA DE OURO DA VÍRGULA:
NUNCA se separa o Sujeito do seu Verbo por vírgula, e NUNCA se separa o Verbo de seus complementos diretos!
Incorreto: O aluno do Colégio Militar, estudou muito. (ERRADO!)
Correto: O aluno do Colégio Militar estudou muito.

2. QUANDO A VÍRGULA É OBRIGATÓRIA:
- Para isolar o VOCATIVO (chamamento, invocação da pessoa):
  Exemplo: "Cadetes, prestem atenção ao comando!" / "Obrigado pela ajuda, professor."
- Para isolar o APOSTO EXPLICATIVO (termo que explica um substantivo anterior):
  Exemplo: "Tiradentes, patrono das Polícias Militares do Brasil, lutou pela liberdade."
- Para separar elementos em enumeração:
  Exemplo: "Ele comprou caderno, lápis, borracha e régua."
- Para isolar adjuntos adverbiais deslocados:
  Exemplo: "Em Balsas, o clima é quente e acolhedor."`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Diferenciando Vocativo e Sujeito',
        problem: 'Compare: 1) "Alunos prestaram atenção." 2) "Alunos, prestem atenção!" Qual contém vocativo?',
        steps: [
          'Passo 1: Na frase 1, "Alunos" é o sujeito que realizou a ação (sem vírgula).',
          'Passo 2: Na frase 2, o orador está chamando diretamente os estudantes (com vírgula e verbo no imperativo).',
          'Passo 3: O chamamento com vírgula é o Vocativo.',
        ],
        final_answer: 'A frase 2 contém o vocativo isolado por vírgula.',
      },
    ],
    daily_applications: 'Redação de atas, solicitações formais e redações discursivas do exame seletivo.',
    summary_keypoints: [
      'Nunca separe sujeito do verbo com vírgula.',
      'Vocativo = chamamento -> sempre isolado por vírgula.',
      'Aposto explicativo vem sempre entre vírgulas.',
    ],
    common_pitfalls: 'Achar que a vírgula serve apenas para "quando a respiração cansa". A vírgula é sintática e gramatical!',
    quick_review_questions: [
      {
        question: 'Em "Balsas, 12 de outubro de 2026", por que há vírgula?',
        answer: 'Para separar o nome da localidade na indicação de datas.',
        tip: 'Regra padrão para cabeçalhos e correspondências.',
      },
    ],
    order_index: 2,
    is_active: true,
  },

  {
    id: 'les-7-port-adverbio',
    topic_id: 'top-7-port-adverbio',
    title: 'Advérbios e Locuções Adverbiais: Identificação e Circunstâncias',
    learning_objective: 'Identificar advérbios e locuções adverbiais, reconhecer as circunstâncias que expressam no texto e compreender sua função invariável.',
    simple_explanation: 'O advérbio é uma palavra companheira e invariável. Ele serve para nos contar "como", "quando", "onde" ou "com que intensidade" uma ação aconteceu, adicionando uma circunstância à frase.',
    detailed_development: `O advérbio modifica principalmente três elementos:
1. Um VERBO: O estudante correu MUITO. (intensidade da corrida).
2. Um ADJETIVO: O cadete estava BASTANTE calmo. (intensifica o adjetivo calmo).
3. Outro ADVÉRBIO: O alarme tocou MUITO cedo. (intensifica o advérbio cedo).

CARACTERÍSTICA CRUCIAL: O advérbio é INVARIÁVEL!
Ele nunca vai para o plural e nunca vai para o feminino!
Exemplo: "Eles estavam MEIO preocupados" (correto: meio = um pouco). Jamais diga "meias preocupadas"!

PRINCIPAIS CIRCUNSTÂNCIAS DOS ADVÉRBIOS:
- TEMPO: hoje, ontem, amanhã, cedo, tarde, sempre, nunca, já.
- LUGAR: aqui, ali, acolá, perto, longe, dentro, fora.
- MODO: bem, mal, assim, depressa, devagar, pacientemente, calmamente.
- INTENSIDADE: muito, pouco, bastante, demais, tão, quase.
- AFIRMAÇÃO: sim, certamente, com certeza, realmente.
- NEGAÇÃO: não, tampouco, absolutamente.
- DÚVIDA: talvez, quiçá, provavelmente.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Analisando as circunstâncias adverbiais',
        problem: 'Na frase: "O pelotão marchou silenciosamente pelo pátio ontem", identifique os advérbios.',
        steps: [
          'Passo 1: Verbo principal: "marchou".',
          'Passo 2: Como marcharam? "silenciosamente" -> Advérbio de MODO.',
          'Passo 3: Onde marcharam? "pelo pátio" -> Locução adverbial de LUGAR.',
          'Passo 4: Quando marcharam? "ontem" -> Advérbio de TEMPO.',
        ],
        final_answer: 'Contém: "silenciosamente" (modo), "pelo pátio" (lugar) e "ontem" (tempo).',
      },
    ],
    daily_applications: 'Nos comandos de ordem unida militar e relatórios diários de serviço.',
    summary_keypoints: [
      'Advérbios são palavras gramaticalmente invariáveis.',
      'Modificam verbos, adjetivos ou outros advérbios.',
      'Locuções adverbiais iniciam frequentemente com preposição (ex: às pressas, com cuidado).',
    ],
    common_pitfalls: 'Flexionar a palavra "meio" quando atua como advérbio.',
    quick_review_questions: [
      {
        question: 'Em "O aluno respondeu com certeza", qual é a função de "com certeza"?',
        answer: 'Locução adverbial de afirmação.',
        tip: 'Equivale a "certamente".',
      },
    ],
    order_index: 3,
    is_active: true,
  },

  {
    id: 'les-7-port-verbos-avancados',
    topic_id: 'top-7-port-verbos-avancados',
    title: 'Verbos no 7º Ano: Modos Indicativo, Subjuntivo e Correlação',
    learning_objective: 'Distinguir os tempos do indicativo e do subjuntivo (presente, pretérito imperfeito e futuro do subjuntivo) e conjugar verbos regulares e irregulares.',
    simple_explanation: 'Enquanto o indicativo fala de coisas certas e reais, o subjuntivo é o modo dos sonhos, desejos e condições: "se eu pudesse...", "quando você vier...", "tomara que dê certo!".',
    detailed_development: `1. TEMPOS DO MODO SUBJUNTIVO:
- Presente do Subjuntivo: Introduzido por "que" (Que eu estude, que tu estudes, que ele estude...). Expressa desejo.
- Pretérito Imperfeito do Subjuntivo: Introduzido por "se" (Se eu estudasse, se tu estudasses, se ele estudasse...). Termina sempre em "-sse". Expressa condição.
- Futuro do Subjuntivo: Introduzido por "quando" (Quando eu estudar, quando tu estudares, quando ele estudar...). Expressa possibilidade futura.

2. CORRELAÇÃO VERBAL (Harmonia nos tempos):
Se a condição está no imperfeito do subjuntivo (-sse), a consequência deve estar no futuro do pretérito do indicativo (-ria)!
Exemplo: "Se eu ESTUDASSE mais, PASSARIA com louvor no Colégio Militar." (Correto!).
Nunca diga: "Se eu estudasse, passava" em uma redação culta formal.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Completando a oração condicional',
        problem: 'Complete a frase: "Se os candidatos ______ (manter) o foco, eles obteriam ótimas notas."',
        steps: [
          'Passo 1: A oração principal tem "obteriam" (futuro do pretérito).',
          'Passo 2: A oração subordinada com "se" exige o pretérito imperfeito do subjuntivo.',
          'Passo 3: O verbo manter conjuga como ter: se eles mantivessem.',
        ],
        final_answer: 'A forma correta é "MANTIVESSEM".',
      },
    ],
    daily_applications: 'Argumentação lógica em redações dissertativas e construção de hipóteses científicas.',
    summary_keypoints: [
      'Indicativo = certeza; Subjuntivo = hipótese e desejo.',
      'Pretérito imperfeito do subjuntivo termina em -sse.',
      'Correlação: Se fizesse... conseguiria.',
    ],
    common_pitfalls: 'Conjugar o futuro do subjuntivo de verbos derivados incorretamente (ex: quando ele "ver" em vez de quando ele "vir").',
    quick_review_questions: [
      {
        question: 'Qual é o pretérito imperfeito do subjuntivo do verbo "estudar" na 1ª pessoa?',
        answer: 'Se eu estudasse.',
        tip: 'Preste atenção na terminação -sse.',
      },
    ],
    order_index: 4,
    is_active: true,
  },

  {
    id: 'les-7-port-ortografia',
    topic_id: 'top-7-port-ortografia',
    title: 'Os 4 Porquês, Homônimos, Parônimos e Semântica',
    learning_objective: 'Dominar o uso de por que, por quê, porque e porquê, diferenciar homônimos de parônimos e distinguir sentido literal (denotação) de sentido figurado (conotação).',
    simple_explanation: 'Na língua portuguesa temos 4 formas de escrever "porque", cada uma com um papel específico. Além disso, aprenderemos como palavras parecidas têm significados completamente diferentes!',
    detailed_development: `1. O SEGREDO DOS 4 PORQUÊS:
- POR QUE (separado e sem acento): Usado no início ou meio de perguntas diretas ou indiretas, ou quando equivale a "pelo qual" / "por qual razão" (ex: "Por que você quer entrar no Colégio Militar?").
- POR QUÊ (separado e com acento): Usado no FINAL de frases interrogativas ou isolado antes do ponto (ex: "Você não estudou ontem, por quê?").
- PORQUE (junto e sem acento): Conjunção explicativa ou causal = "pois", "já que". Usado nas respostas (ex: "Estudo com dedicação porque quero um futuro brilhante.").
- PORQUÊ (junto e com acento): É um substantivo! Significa "o motivo", "a razão", e vem sempre acompanhado de artigo ou pronome (ex: "Não entendi o porquê de tanta correria.").

2. HOMÔNIMOS vs. PARÔNIMOS:
- Homônimos: Palavras com som igual ou grafia igual, mas significados diferentes (ex: sessão de cinema / seção de setor / cessão de doar).
- Parônimos: Palavras parecidas na pronúncia e na escrita, mas não iguais (ex: eminente = nobre, ilustre / iminente = prestes a acontecer).

3. DENOTAÇÃO E CONOTAÇÃO:
- Denotação: Sentido real, literal do dicionário (D de Dicionário!).
- Conotação: Sentido figurado, poético e simbólico (C de Criatividade!).`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Escolhendo o porquê correto',
        problem: 'Complete a frase: "Ninguém explicou o _____ de adiar o início da cerimônia."',
        steps: [
          'Passo 1: Observe a palavra anterior: temos o artigo definido "o".',
          'Passo 2: Palavra precedida de artigo atua como substantivo (= o motivo).',
          'Passo 3: O porquê substantivado é escrito junto e com acento circunflexo: porquê.',
        ],
        final_answer: 'A forma correta é "PORQUÊ".',
      },
    ],
    daily_applications: 'Redações oficiais, relatórios e exames de admissão eliminatórios.',
    summary_keypoints: [
      'Por que = início/meio de perguntas.',
      'Por quê = final de frases interrogativas.',
      'Porque = respostas e explicações (pois).',
      'Porquê = substantivo (o motivo).',
      'Denotação = real; Conotação = figurado.',
    ],
    common_pitfalls: 'Confundir "eminente" com "iminente". Um perigo iminente está prestes a acontecer!',
    quick_review_questions: [
      {
        question: 'Qual é o porquê usado para responder perguntas?',
        answer: 'Porque (junto e sem acento).',
        tip: 'Equivale à palavra "pois".',
      },
    ],
    order_index: 5,
    is_active: true,
  },

  // =========================================================================
  // 7º ANO - MATEMÁTICA (AULAS COMPLETAS E PEDAGÓGICAS)
  // =========================================================================
  {
    id: 'les-7-mat-divisibilidade',
    topic_id: 'top-7-mat-divisibilidade',
    title: 'Critérios de Divisibilidade (2 a 10) e Números Primos',
    learning_objective: 'Identificar instantaneamente a divisibilidade de números por 2, 3, 4, 5, 6, 9 e 10 sem armar conta, e reconhecer números primos até 100.',
    simple_explanation: 'Critérios de divisibilidade são "truques e atalhos matemáticos" que nos dizem se um número pode ser dividido por outro perfeitamente sem sobrar nada, apenas olhando para seus algarismos!',
    detailed_development: `1. OS CRITÉRIOS DE DIVISIBILIDADE:
- Por 2: O número deve ser PAR (terminar em 0, 2, 4, 6 ou 8).
- Por 3: A SOMA de todos os seus algarismos deve ser divisível por 3 (ex: 741 -> 7+4+1 = 12; como 12 divide por 3, 741 também divide!).
- Por 4: Se os dois últimos algarismos formarem um número divisível por 4 ou terminarem em 00 (ex: 5.324 -> 24 divide por 4).
- Por 5: Deve terminar em 0 ou 5.
- Por 6: Deve ser divisível por 2 E por 3 ao mesmo tempo (ou seja, ser par e a soma dos algarismos ser múltipla de 3!).
- Por 9: A SOMA de seus algarismos deve ser divisível por 9 (ex: 5.688 -> 5+6+8+8 = 27; como 27 divide por 9, 5.688 divide por 9!).
- Por 10: Deve terminar em 0.

2. NÚMEROS PRIMOS:
Um número natural é PRIMO quando possui exatamente dois divisores distintos: o 1 e ele mesmo!
- O número 2 é o ÚNICO número par que é primo!
- Os primeiros números primos: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47...`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Testando se 150 é divisível por 2, 3 e 5 ao mesmo tempo',
        problem: 'Verifique se o número 150 é divisível por 2, 3 e 5.',
        steps: [
          'Passo 1: Termina em 0 -> é par, portanto é divisível por 2.',
          'Passo 2: Termina em 0 -> é divisível por 5.',
          'Passo 3: Soma dos algarismos: 1 + 5 + 0 = 6. Como 6 é múltiplo de 3, 150 é divisível por 3.',
        ],
        final_answer: 'Sim! 150 é divisível simultaneamente por 2, 3 e 5 (e consequentemente por 30).',
      },
    ],
    daily_applications: 'Criptografia digital bancária, divisão de equipes em gincanas escolares e simplificação instantânea de frações.',
    summary_keypoints: [
      'Divisível por 2: termina em par.',
      'Divisível por 3 e 9: soma dos algarismos.',
      'Divisível por 5: termina em 0 ou 5.',
      'O número 2 é o único primo par.',
    ],
    common_pitfalls: 'Achar que o número 1 é primo. O número 1 só tem 1 divisor, portanto não é primo nem composto!',
    quick_review_questions: [
      {
        question: 'O número 111 é divisível por 3?',
        answer: 'Sim! 1 + 1 + 1 = 3, que é divisível por 3.',
        tip: 'Regra da soma dos algarismos.',
      },
    ],
    order_index: 1,
    is_active: true,
  },

  {
    id: 'les-7-mat-potencias',
    topic_id: 'top-7-mat-potencias',
    title: 'Potenciação, Raízes Quadradas e Propriedades de Potências',
    learning_objective: 'Calcular potências de base inteira e expoente natural, aplicar as propriedades da multiplicação e divisão de potências de mesma base, e extrair raízes quadradas exatas.',
    simple_explanation: 'A potenciação é uma multiplicação acelerada onde multiplicamos o mesmo número por ele mesmo várias vezes (ex: 2³ = 2 × 2 × 2 = 8). Já a raiz quadrada é a operação inversa: perguntamos qual número multiplicado por ele mesmo dá aquele resultado!',
    detailed_development: `1. ELEMENTOS DA POTÊNCIA:
aⁿ = b (onde "a" é a base, "n" é o expoente e "b" é a potência).
- 5² = 5 × 5 = 25 (cinco elevado ao quadrado).
- 2⁴ = 2 × 2 × 2 × 2 = 16.

2. REGRAS IMPORTANTES:
- Todo número elevado a 0 é igual a 1 (ex: 7⁰ = 1).
- Todo número elevado a 1 é ele mesmo (ex: 9¹ = 9).
- Base 10: 10³ = 1.000 (o número 1 seguido de 3 zeros).

3. PROPRIEDADES DE MESMA BASE:
- Multiplicação de mesma base: conserva a base e SOMA os expoentes ( aᵐ × aⁿ = aᵐ⁺ⁿ ).
- Divisão de mesma base: conserva a base e SUBTRAI os expoentes ( aᵐ ÷ aⁿ = aᵐ⁻ⁿ ).
- Potência de potência: conserva a base e MULTIPLICA os expoentes ( (aᵐ)ⁿ = aᵐˣⁿ ).

4. RAIZ QUADRADA EXATA:
√49 = 7 porque 7 × 7 = 49.
√100 = 10 porque 10 × 10 = 100.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Simplificando a expressão de potências',
        problem: 'Calcule o valor de: 2³ × 2² ÷ 2⁴.',
        steps: [
          'Passo 1: Aplique a multiplicação de mesma base: 2³ × 2² = 2³⁺² = 2⁵.',
          'Passo 2: Aplique a divisão de mesma base: 2⁵ ÷ 2⁴ = 2⁵⁻⁴ = 2¹.',
          'Passo 3: Resolva a potência: 2¹ = 2.',
        ],
        final_answer: 'O resultado final é 2.',
      },
    ],
    daily_applications: 'Cálculo de crescimento populacional, área de terrenos quadrados e armazenamento de memória em computadores (bytes).',
    summary_keypoints: [
      'Multiplicação de mesma base soma expoentes.',
      'Divisão de mesma base subtrai expoentes.',
      'Todo número elevado a zero vale 1.',
      'Raiz quadrada de A é o número que multiplicado por si mesmo resulta em A.',
    ],
    common_pitfalls: 'Multiplicar a base pelo expoente! 3² NÃO é 3 × 2 = 6; o correto é 3 × 3 = 9!',
    quick_review_questions: [
      {
        question: 'Quanto é 4³?',
        answer: '64 (4 × 4 × 4 = 16 × 4 = 64).',
        tip: 'Multiplique o 4 por si mesmo três vezes.',
      },
    ],
    order_index: 2,
    is_active: true,
  },

  {
    id: 'les-7-mat-fracoes-avancadas',
    topic_id: 'top-7-mat-fracoes-avancadas',
    title: 'Operações Avançadas com Frações e Números Decimais',
    learning_objective: 'Multiplicar e dividir frações, resolver números mistos, transformar frações em decimais e realizar operações combinadas com parênteses e colchetes.',
    simple_explanation: 'Para multiplicar frações, multiplicamos reto (de cima com de cima, de baixo com de baixo). Para dividir frações, mantemos a primeira e multiplicamos pelo inverso da segunda!',
    detailed_development: `1. MULTIPLICAÇÃO DE FRAÇÕES:
Multiplica-se numerador com numerador e denominador com denominador:
(2/3) × (4/5) = (2 × 4) / (3 × 5) = 8/15.

2. DIVISÃO DE FRAÇÕES:
Conserva-se a primeira fração e multiplica-se pelo INVERSO da segunda:
(3/4) ÷ (2/5) = (3/4) × (5/2) = (3 × 5) / (4 × 2) = 15/8.

3. NÚMERO MISTO:
Composto por uma parte inteira e uma parte fracionária (ex: 2 inteiros e 1/3 = (2 × 3 + 1) / 3 = 7/3).

4. TRANSFORMAÇÃO DE FRAÇÃO EM DECIMAL:
Basta dividir o numerador pelo denominador!
Exemplo: 3/4 = 3 ÷ 4 = 0,75.
1/2 = 0,5 | 1/4 = 0,25 | 1/5 = 0,20.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Divisão de frações em problema prático',
        problem: 'Um garrafão contém 3/4 de litro de água. Quantos copinhos de 1/8 de litro conseguimos encher?',
        steps: [
          'Passo 1: Monte a divisão: (3/4) ÷ (1/8).',
          'Passo 2: Inverta a segunda fração e multiplique: (3/4) × (8/1).',
          'Passo 3: Calcule o produto: (3 × 8) / (4 × 1) = 24 / 4 = 6.',
        ],
        final_answer: 'Conseguimos encher exatamente 6 copinhos.',
      },
    ],
    daily_applications: 'Cálculo de dosagens de medicamentos, divisão de tanques de combustível e receitas proporcionais.',
    summary_keypoints: [
      'Multiplicação de fração: reto (cima com cima, baixo com baixo).',
      'Divisão de fração: conserva a 1ª e multiplica pelo inverso da 2ª.',
      'Fração em decimal: divide o de cima pelo de baixo.',
    ],
    common_pitfalls: 'Esquecer de inverter a segunda fração na divisão.',
    quick_review_questions: [
      {
        question: 'Quanto é (1/2) × (3/4)?',
        answer: '3/8 (1×3 / 2×4).',
        tip: 'Multiplicação direta.',
      },
    ],
    order_index: 3,
    is_active: true,
  },

  {
    id: 'les-7-mat-porcentagem',
    topic_id: 'top-7-mat-porcentagem',
    title: 'Porcentagem, Acréscimos, Descontos e Sistema Monetário',
    learning_objective: 'Dominar o conceito de razão centesimal, calcular porcentagens por meio de frações e decimais, e resolver situações de descontos e aumentos em compras.',
    simple_explanation: 'Porcentagem significa simplesmente "uma parte de cada 100". Quando dizemos 25%, estamos dizendo que tomamos 25 partes de um total de 100 partes iguais. O símbolo "%" representa o denominador 100!',
    detailed_development: `TRÊS FORMAS DE REPRESENTAR A MESMA QUANTIDADE:
1. Forma percentual: 20%
2. Forma fracionária: 20/100 (simplificada vira 1/5)
3. Forma decimal: 0,20 ou 0,2

CÁLCULOS RÁPIDOS DE CABEÇA:
- 10% de um valor: desloque a vírgula 1 casa para a esquerda (10% de 240 = 24).
- 50% de um valor: é a metade exata (dividir por 2).
- 25% de um valor: é a quarta parte (dividir por 4).
- 1% de um valor: desloque a vírgula 2 casas para a esquerda.

DESCONTOS E AUMENTOS:
- Desconto: Subtrai-se o valor percentual do preço original.
- Acréscimo / Aumento: Soma-se o valor percentual ao preço original.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Fardamento escolar do CMT',
        problem: 'O uniforme escolar custa R$ 120,00. Pago via PIX, o responsável ganha 10% de desconto. Quanto pagará?',
        steps: [
          'Passo 1: Calcule 10% de R$ 120,00: 120 ÷ 10 = R$ 12,00 de desconto.',
          'Passo 2: Subtraia o desconto: R$ 120,00 - R$ 12,00 = R$ 108,00.',
        ],
        final_answer: 'O responsável pagará R$ 108,00 com o desconto.',
      },
    ],
    daily_applications: 'Descontos no comércio de Balsas, cálculo de rendimentos e pesquisas de satisfação.',
    summary_keypoints: [
      'Porcentagem é razão cujo denominador é 100.',
      'Desconto diminui o valor; Acréscimo aumenta o valor.',
      '50% = metade, 25% = quarta parte, 10% = décima parte.',
    ],
    common_pitfalls: 'Esquecer de subtrair o desconto ao final e responder apenas o valor do desconto.',
    quick_review_questions: [
      {
        question: 'Quanto é 50% de R$ 90,00?',
        answer: 'R$ 45,00 (a metade).',
        tip: '50% é igual a 1/2.',
      },
    ],
    order_index: 4,
    is_active: true,
  },

  {
    id: 'les-7-mat-cartesiano',
    topic_id: 'top-7-mat-cartesiano',
    title: 'Plano Cartesiano, Coordenadas e Geometria Espacial',
    learning_objective: 'Localizar pontos no plano cartesiano por pares ordenados (x, y), e identificar vértices, faces e arestas de sólidos geométricos espaciais (poliedros e corpos redondos).',
    simple_explanation: 'O plano cartesiano é como um mapa de batalha com linhas horizontais e verticais que se cruzam: para achar qualquer ponto secreto, você dá um passo na horizontal (x) e outro na vertical (y)!',
    detailed_development: `1. O PLANO CARTESIANO:
Formado por duas retas numéricas perpendiculares que se cruzam na origem O(0,0):
- Eixo horizontal X: Eixo das Abscissas.
- Eixo vertical Y: Eixo das Ordenadas.
- Par Ordenado P(x, y): O primeiro número é sempre a posição no eixo X; o segundo é a posição no eixo Y!
Exemplo: P(3, 5) significa andar 3 unidades para a direita no eixo X e subir 5 unidades no eixo Y.

2. GEOMETRIA ESPACIAL (SÓLIDOS GEOMÉTRICOS):
- Poliedros: Sólidos formados apenas por faces planas (cubo, paralelepípedo, pirâmide).
- Corpos Redondos: Sólidos com superfícies curvas que rolam (esfera, cilindro, cone).
- Elementos:
  * Vértices: As pontas/bicos onde as arestas se encontram.
  * Arestas: As linhas/quinas do sólido.
  * Faces: As paredes ou superfícies planas.
Relação de Euler para poliedros convexos: V - A + F = 2.`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Contando elementos do Cubo',
        problem: 'Quantos vértices, faces e arestas possui um cubo (dado tradicional)?',
        steps: [
          'Passo 1: Faces = 6 faces quadradas (de 1 a 6).',
          'Passo 2: Vértices = 4 pontas em cima + 4 pontas em baixo = 8 vértices.',
          'Passo 3: Arestas = 4 quinas em cima + 4 quinas em baixo + 4 quinas laterais = 12 arestas.',
        ],
        final_answer: 'Possui 6 faces, 8 vértices e 12 arestas.',
      },
    ],
    daily_applications: 'GPS de navegação, leitura de coordenadas em mapas militares de patrulha e design 3D.',
    summary_keypoints: [
      'Par ordenado P(x, y): x é horizontal (abscissa) e y é vertical (ordenada).',
      'Poliedros têm faces planas; corpos redondos possuem curvas.',
      'Cubo possui 6 faces, 8 vértices e 12 arestas.',
    ],
    common_pitfalls: 'Inverter a ordem do par ordenado (colocar y antes de x). É sempre (x, y) em ordem alfabética!',
    quick_review_questions: [
      {
        question: 'No ponto P(4, 7), qual é a ordenada?',
        answer: '7 (o segundo número do par ordenado, correspondente ao eixo Y).',
        tip: 'Abscissa é X (4), Ordenada é Y (7).',
      },
    ],
    order_index: 5,
    is_active: true,
  },

  {
    id: 'les-7-mat-estatistica',
    topic_id: 'top-7-mat-estatistica',
    title: 'Estatística e Probabilidade: Média, Moda, Mediana e Chances',
    learning_objective: 'Calcular a média aritmética, identificar a moda e a mediana de um conjunto de dados, e calcular a probabilidade clássica de eventos simples.',
    simple_explanation: 'Estatística nos ajuda a entender grupos de números: a média junta tudo e divide igualmente, a moda é o número mais popular que mais se repete, e a mediana é o número que senta exatamente no meio da fila!',
    detailed_development: `1. MEDIDAS DE TENDÊNCIA CENTRAL:
- Média Aritmética: Soma todos os valores e divide pela quantidade de elementos somados.
  Exemplo: Notas 7, 8 e 9 -> Média = (7 + 8 + 9) ÷ 3 = 24 ÷ 3 = 8,0.
- Moda: É o valor que aparece com maior frequência no conjunto (o que mais se repete).
  Exemplo: Nos números {5, 6, 6, 7, 8}, a moda é 6.
- Mediana: É o valor central após organizar os dados em ordem crescente (ROL).
  Se a quantidade for ímpar: é o elemento do meio exato.
  Se for par: é a média dos dois elementos centrais.

2. PROBABILIDADE CLÁSSICA:
Probabilidade = (Casos Favoráveis) / (Casos Possíveis)
Exemplo: Ao lançar um dado comum de 6 faces, qual a chance de sair um número par?
Casos favoráveis: {2, 4, 6} = 3 casos.
Casos possíveis: {1, 2, 3, 4, 5, 6} = 6 casos.
Probabilidade = 3/6 = 1/2 = 50%!`,
    step_by_step_examples: [
      {
        title: 'Exemplo: Média de simulados do candidato',
        problem: 'Um estudante tirou as seguintes notas nos quatro simulados de Matemática: 80, 85, 90 e 85. Qual é a sua média e qual é a moda?',
        steps: [
          'Passo 1: Média = (80 + 85 + 90 + 85) ÷ 4 = 340 ÷ 4 = 85.',
          'Passo 2: Moda = a nota 85 apareceu duas vezes, enquanto as outras apareceram apenas uma vez.',
        ],
        final_answer: 'Média = 85 e Moda = 85.',
      },
    ],
    daily_applications: 'Estatísticas de desempenho do concurso, pesquisas de intenção de voto e sorteios escolares.',
    summary_keypoints: [
      'Média = soma dos valores dividida pelo número de valores.',
      'Moda = valor mais frequente.',
      'Mediana = valor do meio na lista organizada em ordem crescente.',
      'Probabilidade = favoráveis / possíveis.',
    ],
    common_pitfalls: 'Calcular a mediana sem antes ordenar os números em ordem crescente (fazer o ROL)!',
    quick_review_questions: [
      {
        question: 'Qual é a mediana dos números: 2, 8, 3, 9, 5?',
        answer: '5.',
        tip: 'Coloque em ordem crescente primeiro: 2, 3, 5, 8, 9. O número do meio é o 5.',
      },
    ],
    order_index: 6,
    is_active: true,
  },
];

export const EDUCATIONAL_VIDEOS_DATA: EducationalVideo[] = [
  // =================== 6º ANO PORTUGUÊS ===================
  {
    id: 'vid-6-port-generos',
    topic_id: 'top-6-port-generos',
    lesson_id: 'les-6-port-generos',
    title: 'Gêneros Textuais [Prof Noslen]',
    channel_name: 'Professor Noslen',
    duration_label: '14 min',
    youtube_url: 'https://www.youtube.com/watch?v=Ucjv4LT8CSg',
    video_id: 'Ucjv4LT8CSg',
    is_approved: true,
  },
  {
    id: 'vid-6-port-fonemas',
    topic_id: 'top-6-port-fonemas',
    lesson_id: 'les-6-port-fonemas',
    title: '🟣 FONÉTICA e FONOLOGIA || Português do Zero',
    channel_name: 'Português com Letícia',
    duration_label: '18 min',
    youtube_url: 'https://www.youtube.com/watch?v=k0sM0Ovooo8',
    video_id: 'k0sM0Ovooo8',
    is_approved: true,
  },
  {
    id: 'vid-tonicidade',
    topic_id: 'top-6-port-tonicidade',
    lesson_id: 'les-6-port-tonicidade',
    title: 'SÍLABA TÔNICA + EXERCÍCIOS RESOLVIDOS [Prof Noslen]',
    channel_name: 'Professor Noslen',
    duration_label: '16 min',
    youtube_url: 'https://www.youtube.com/watch?v=KhmC47yLES4',
    video_id: 'KhmC47yLES4',
    is_approved: true,
  },
  {
    id: 'vid-6-port-acentuacao',
    topic_id: 'top-6-port-acentuacao',
    lesson_id: 'les-6-port-acentuacao',
    title: 'Acentuação ♫ Malha Funk da Acentuação ♫ [Prof Noslen]',
    channel_name: 'Professor Noslen',
    duration_label: '12 min',
    youtube_url: 'https://www.youtube.com/watch?v=Sy_LUnePfRE',
    video_id: 'Sy_LUnePfRE',
    is_approved: true,
  },
  {
    id: 'vid-6-port-classes',
    topic_id: 'top-6-port-classes',
    lesson_id: 'les-6-port-classes',
    title: 'O que é SUBSTANTIVO? [Prof Noslen]',
    channel_name: 'Professor Noslen',
    duration_label: '15 min',
    youtube_url: 'https://www.youtube.com/watch?v=g_JrU_UNkz8',
    video_id: 'g_JrU_UNkz8',
    is_approved: true,
  },
  {
    id: 'vid-6-port-verbos',
    topic_id: 'top-6-port-verbos',
    lesson_id: 'les-6-port-verbos',
    title: 'VERBO + EXERCÍCIOS RESOLVIDOS [Prof Noslen]',
    channel_name: 'Professor Noslen',
    duration_label: '18 min',
    youtube_url: 'https://www.youtube.com/watch?v=OgZFm6udINE',
    video_id: 'OgZFm6udINE',
    is_approved: true,
  },
  {
    id: 'vid-6-port-ortografia',
    topic_id: 'top-6-port-ortografia',
    lesson_id: 'les-6-port-ortografia',
    title: 'TESTE de ORTOGRAFIA! Você acerta TUDO? || Português com Letícia',
    channel_name: 'Português com Letícia',
    duration_label: '15 min',
    youtube_url: 'https://www.youtube.com/watch?v=_-nX0aWcHlw',
    video_id: '_-nX0aWcHlw',
    is_approved: true,
  },

  // =================== 6º ANO MATEMÁTICA ===================
  {
    id: 'vid-posicional',
    topic_id: 'top-6-mat-posicional',
    lesson_id: 'les-6-mat-posicional',
    title: 'ORDENS E CLASSES DOS NÚMEROS | SISTEMA DE NUMERAÇÃO DECIMAL \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '14 min',
    youtube_url: 'https://www.youtube.com/watch?v=cTfRpRD5xUg',
    video_id: 'cTfRpRD5xUg',
    is_approved: true,
  },
  {
    id: 'vid-6-mat-operacoes',
    topic_id: 'top-6-mat-operacoes',
    lesson_id: 'les-6-mat-operacoes',
    title: 'MULTIPLICAÇÃO E DIVISÃO DE NÚMEROS NATURAIS \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '16 min',
    youtube_url: 'https://www.youtube.com/watch?v=o2SJ5pUp_00',
    video_id: 'o2SJ5pUp_00',
    is_approved: true,
  },
  {
    id: 'vid-6-mat-romanos',
    topic_id: 'top-6-mat-romanos',
    lesson_id: 'les-6-mat-romanos',
    title: 'NÚMEROS ROMANOS | SISTEMA DE NUMERAÇÃO ROMANO | \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '13 min',
    youtube_url: 'https://www.youtube.com/watch?v=opVjVyl_vO4',
    video_id: 'opVjVyl_vO4',
    is_approved: true,
  },
  {
    id: 'vid-6-mat-fracoes',
    topic_id: 'top-6-mat-fracoes',
    lesson_id: 'les-6-mat-fracoes',
    title: 'FRAÇÃO - COMO REPRESENTAR UMA FRAÇÃO \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '15 min',
    youtube_url: 'https://www.youtube.com/watch?v=vF0Q0ZAH9Uc',
    video_id: 'vF0Q0ZAH9Uc',
    is_approved: true,
  },
  {
    id: 'vid-mmc-mdc',
    topic_id: 'top-6-mat-mmc-mdc',
    lesson_id: 'les-6-mat-mmc-mdc',
    title: 'MÚLTIPLO COMUM e MÁXIMO DIVISOR COMUM | MMC e MDC - RESUMÃO -',
    channel_name: 'Gis com Giz',
    duration_label: '17 min',
    youtube_url: 'https://www.youtube.com/watch?v=yqKOhCuo3hA',
    video_id: 'yqKOhCuo3hA',
    is_approved: true,
  },
  {
    id: 'vid-6-mat-geometria',
    topic_id: 'top-6-mat-geometria',
    lesson_id: 'les-6-mat-geometria',
    title: 'ÁREA E PERÍMETRO | RESOLUÇÃO DE PROBLEMAS | EXERCÍCIOS',
    channel_name: 'Gis com Giz',
    duration_label: '16 min',
    youtube_url: 'https://www.youtube.com/watch?v=dArATPsuLjM',
    video_id: 'dArATPsuLjM',
    is_approved: true,
  },
  {
    id: 'vid-6-mat-medidas',
    topic_id: 'top-6-mat-medidas',
    lesson_id: 'les-6-mat-medidas',
    title: 'MEDIDAS DE ÁREA - CONVERSÃO DE UNIDADES DE MEDIDA DE ÁREA #02',
    channel_name: 'Gis com Giz',
    duration_label: '14 min',
    youtube_url: 'https://www.youtube.com/watch?v=LWH7LNhbxPM',
    video_id: 'LWH7LNhbxPM',
    is_approved: true,
  },

  // =================== 7º ANO PORTUGUÊS ===================
  {
    id: 'vid-7-port-linguagem',
    topic_id: 'top-7-port-linguagem',
    lesson_id: 'les-7-port-linguagem',
    title: 'Linguagem Verbal e Linguagem Não Verbal – Revisão com Prof. Noslen',
    channel_name: 'Professor Noslen',
    duration_label: '12 min',
    youtube_url: 'https://www.youtube.com/watch?v=Gb_D0fRBXSY',
    video_id: 'Gb_D0fRBXSY',
    is_approved: true,
  },
  {
    id: 'vid-7-port-pontuacao',
    topic_id: 'top-7-port-pontuacao',
    lesson_id: 'les-7-port-pontuacao',
    title: '🟣 Aprenda a usar a VÍRGULA! | AULA COMPLETA de Português para concursos',
    channel_name: 'Português com Letícia',
    duration_label: '21 min',
    youtube_url: 'https://www.youtube.com/watch?v=0Q6tIli7oJg',
    video_id: '0Q6tIli7oJg',
    is_approved: true,
  },
  {
    id: 'vid-adverbio',
    topic_id: 'top-7-port-adverbio',
    lesson_id: 'les-7-port-adverbio',
    title: 'ADVÉRBIO + EXERCÍCIOS RESOLVIDOS [Prof Noslen]',
    channel_name: 'Professor Noslen',
    duration_label: '18 min',
    youtube_url: 'https://www.youtube.com/watch?v=hOQl9wrtSbo',
    video_id: 'hOQl9wrtSbo',
    is_approved: true,
  },
  {
    id: 'vid-7-port-verbos-avancados',
    topic_id: 'top-7-port-verbos-avancados',
    lesson_id: 'les-7-port-verbos-avancados',
    title: 'VERBO + EXERCÍCIOS RESOLVIDOS [Prof Noslen]',
    channel_name: 'Professor Noslen',
    duration_label: '18 min',
    youtube_url: 'https://www.youtube.com/watch?v=OgZFm6udINE',
    video_id: 'OgZFm6udINE',
    is_approved: true,
  },
  {
    id: 'vid-7-port-ortografia',
    topic_id: 'top-7-port-ortografia',
    lesson_id: 'les-7-port-ortografia',
    title: '🟣 USO DOS PORQUÊS: POR QUE, PORQUE, POR QUÊ, PORQUÊ | Português do Zero',
    channel_name: 'Português com Letícia',
    duration_label: '14 min',
    youtube_url: 'https://www.youtube.com/watch?v=0mlxn9JJqww',
    video_id: '0mlxn9JJqww',
    is_approved: true,
  },

  // =================== 7º ANO MATEMÁTICA ===================
  {
    id: 'vid-7-mat-divisibilidade',
    topic_id: 'top-7-mat-divisibilidade',
    lesson_id: 'les-7-mat-divisibilidade',
    title: 'CRITÉRIOS de DIVISIBILIDADE | REGRAS DE DIVISIBILIDADE | \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '16 min',
    youtube_url: 'https://www.youtube.com/watch?v=RAXp2qjhA1M',
    video_id: 'RAXp2qjhA1M',
    is_approved: true,
  },
  {
    id: 'vid-7-mat-potencias',
    topic_id: 'top-7-mat-potencias',
    lesson_id: 'les-7-mat-potencias',
    title: 'POTENCIAÇÃO E RADICIAÇÃO COM RADICAIS \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '15 min',
    youtube_url: 'https://www.youtube.com/watch?v=uqZuvrV7cEs',
    video_id: 'uqZuvrV7cEs',
    is_approved: true,
  },
  {
    id: 'vid-7-mat-fracoes-avancadas',
    topic_id: 'top-7-mat-fracoes-avancadas',
    lesson_id: 'les-7-mat-fracoes-avancadas',
    title: 'MULTIPLICAÇÃO E DIVISÃO COM FRAÇÕES | FRAÇÃO | \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '14 min',
    youtube_url: 'https://www.youtube.com/watch?v=WsWRpp35Uhc',
    video_id: 'WsWRpp35Uhc',
    is_approved: true,
  },
  {
    id: 'vid-porcentagem',
    topic_id: 'top-7-mat-porcentagem',
    lesson_id: 'les-7-mat-porcentagem',
    title: 'PORCENTAGEM | COMO CALCULAR PORCENTAGEM | \\Prof. Gis/ #01',
    channel_name: 'Gis com Giz',
    duration_label: '15 min',
    youtube_url: 'https://www.youtube.com/watch?v=OjOyNmTt7Mw',
    video_id: 'OjOyNmTt7Mw',
    is_approved: true,
  },
  {
    id: 'vid-7-mat-cartesiano',
    topic_id: 'top-7-mat-cartesiano',
    lesson_id: 'les-7-mat-cartesiano',
    title: 'PLANO CARTESIANO | Aprenda de uma forma diferente \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '13 min',
    youtube_url: 'https://www.youtube.com/watch?v=EAeTBeEHSD4',
    video_id: 'EAeTBeEHSD4',
    is_approved: true,
  },
  {
    id: 'vid-7-mat-estatistica',
    topic_id: 'top-7-mat-estatistica',
    lesson_id: 'les-7-mat-estatistica',
    title: 'MÉDIA, MODA E MEDIANA | MEDIDAS DE TENDÊNCIA CENTRAL \\Prof. Gis/',
    channel_name: 'Gis com Giz',
    duration_label: '17 min',
    youtube_url: 'https://www.youtube.com/watch?v=GIzwKJL33_g',
    video_id: 'GIzwKJL33_g',
    is_approved: true,
  },
];
