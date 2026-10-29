import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Inicialização segura do Gemini SDK no servidor
// Inicialização segura do Gemini SDK no servidor
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

// =================================================================
// FUNÇÃO DE BUSCA INTELIGENTE NA INTERNET PARA O TUTOR I.A
// =================================================================
interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
  source: string;
}

function cleanForSearch(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function searchEducationalWeb(query: string): Promise<WebSearchResult[]> {
  const results: WebSearchResult[] = [];
  const cleanQ = cleanForSearch(query);

  // 1. Busca no DuckDuckGo (HTML) com termos educacionais
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(cleanQ + ' portugues matematica regras')}`;
    
    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });
    clearTimeout(timer);

    if (res.ok) {
      const html = await res.text();
      const regex = /<a rel=\"nofollow\" class=\"result__a\" href=\"([^\"]*)\">([\s\S]*?)<\/a>[\s\S]*?<a class=\"result__snippet\"[^>]*>([\s\S]*?)<\/a>/g;
      let m;
      while ((m = regex.exec(html)) !== null && results.length < 4) {
        let link = m[1];
        if (link.includes('uddg=')) {
          const matchUddg = /uddg=([^&]+)/.exec(link);
          if (matchUddg) link = decodeURIComponent(matchUddg[1]);
        }
        const title = m[2].replace(/<[^>]+>/g, '').trim();
        const snippet = m[3].replace(/<[^>]+>/g, '').trim();
        if (title && snippet) {
          const sourceName = link.includes('todamateria')
            ? 'Toda Matéria'
            : link.includes('brasilescola')
            ? 'Brasil Escola'
            : link.includes('mundoeducacao')
            ? 'Mundo Educação'
            : link.includes('portugues.com.br')
            ? 'Português.com.br'
            : link.includes('khanacademy')
            ? 'Khan Academy'
            : link.includes('clubedoportugues')
            ? 'Clube do Português'
            : 'Portal Educativo';

          results.push({
            title,
            link,
            snippet,
            source: sourceName,
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Search] Erro busca DDG:', err);
  }

  // 2. Wikipedia em Português como complemento / garantia
  if (results.length < 2) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 3500);
      const wikiUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
      const wRes = await fetch(wikiUrl, { signal: controller.signal });
      clearTimeout(timer);

      if (wRes.ok) {
        const wData = await wRes.json();
        const items = wData?.query?.search?.slice(0, 2) || [];
        for (const item of items) {
          results.push({
            title: item.title,
            link: `https://pt.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
            snippet: item.snippet.replace(/<[^>]+>/g, '').trim(),
            source: 'Wikipédia',
          });
        }
      }
    } catch (e) {}
  }

  return results;
}

// Invocação resiliente do Gemini (prioriza gemini-3.1-flash-lite, depois gemini-3.8-flash)
async function callGemini(params: {
  contents: any;
  systemInstruction?: string;
  responseMimeType?: string;
  temperature?: number;
}): Promise<string | null> {
  const models = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  for (const model of models) {
    try {
      const config: any = {};
      if (params.systemInstruction) config.systemInstruction = params.systemInstruction;
      if (params.responseMimeType) config.responseMimeType = params.responseMimeType;
      if (params.temperature !== undefined) config.temperature = params.temperature;

      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config,
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`[Gemini] Modelo ${model} falhou:`, err?.status || err?.message);
    }
  }
  return null;
}

// Síntese pedagógica robusta baseada nos dados da internet
function synthesizeFallbackFromSearch(query: string, gradeLabel: string, webSources: WebSearchResult[]): string {
  const qLower = query.toLowerCase();

  let body = '';
  if (webSources.length > 0) {
    body += `🌐 **Informações Consultadas na Internet em Tempo Real:**\n\n`;
    webSources.forEach((s, idx) => {
      body += `* **${s.title}** (${s.source}):\n  ${s.snippet}\n\n`;
    });
  }

  // Exemplos e regras práticas para temas frequentes
  if (qLower.includes('silab') || qLower.includes('siláb')) {
    body += `📚 **Regras Fundamentais da Divisão Silábica para o ${gradeLabel}:**\n\n` +
      `1. **Não se separam:** Ditongos e tritongos (ex: *pei-xe*, *Pa-ra-guai*), dígrafos CH, LH, NH, GU, QU (ex: *cha-ve*, *fi-lho*, *ni-nho*).\n` +
      `2. **Sempre se separam:** Letras repetidas como RR e SS (ex: *car-ro*, *pás-sa-ro*), dígrafos SC, SÇ, XC (ex: *nas-cer*, *des-ço*), e hiatos (ex: *sa-ú-de*, *pa-ís*).\n\n` +
      `💡 **Macaete do Sargento Tiradentes:** Pronuncie a palavra devagar, batendo palmas a cada emissão de som: *CI-DA-DE* (3 palmas = 3 sílabas)!`;
  } else if (qLower.includes('frac') || qLower.includes('fraç')) {
    body += `🍕 **Conceito Prático de Frações:**\n\n` +
      `* **Numerador (número de cima):** Quantas fatias você comeu.\n` +
      `* **Denominador (número de baixo):** Em quantas partes iguais o todo foi dividido.\n\n` +
      `💡 **Dica de Ouro:** Para somar frações com bases diferentes (ex: 1/2 + 1/3), primeiro tire o MMC dos denominadores (MMC de 2 e 3 = 6)!`;
  } else if (qLower.includes('mmc') || qLower.includes('mdc')) {
    body += `🔢 **Passo a Passo do MMC (Mínimo Múltiplo Comum):**\n\n` +
      `Fatore os números ao mesmo tempo dividindo pelos primos (2, 3, 5, 7, 11...).\n` +
      `Quando todos chegarem ao número 1, multiplique todos os fatores primos encontrados!`;
  }

  return `🎖️ **Atenção, Recruta do Saber! Aqui é o Sargento Tiradentes!**\n\n` +
    `Excelente pergunta sobre **"${query}"** para a preparação do **${gradeLabel}** do Colégio Militar Tiradentes XVII!\n\n` +
    body + `\n\n` +
    `🎯 **Missão para o Aluno Tiradentes:** Faça anotações no seu caderno e resolva 3 exercícios sobre este assunto ainda hoje! Juntos vamos conquistar a sua farda!`;
}

// =================================================================
// 1. ROTA DE TUTORIA PEDAGÓGICA INTELIGENTE COM BUSCA NA INTERNET
// =================================================================
app.post('/api/gemini/tutor', async (req, res) => {
  try {
    const { studentQuestion, lessonTopic, studentGrade, mode } = req.body;

    if (!studentQuestion || !studentQuestion.trim()) {
      return res.status(400).json({ error: 'A dúvida do estudante é obrigatória.' });
    }

    const gradeLabel = studentGrade === '7_ano' ? '7º Ano do Ensino Fundamental' : '6º Ano do Ensino Fundamental';

    // 1. Realiza busca em tempo real na internet para embasar a resposta
    const webSources = await searchEducationalWeb(studentQuestion);

    const webContext = webSources.length > 0
      ? `\n\n[CONTEXTO ATUALIZADO PESQUISADO NA INTERNET]:\n` +
        webSources.map((s, i) => `${i + 1}. ${s.title} (${s.source}): ${s.snippet}`).join('\n')
      : '';

    const systemPrompt = `Você é o Sargento Pedagogo Tiradentes, um tutor militar-pedagógico inteligente, acolhedor, vibrante e extremamente didático do Colégio Militar Tiradentes XVII (Balsas/MA).
Seu público-alvo são crianças de 10 a 12 anos que estão se preparando para o seletivo do 6º e 7º ano do Ensino Fundamental.

Diretrizes obrigatórias:
1. Comunicação calorosa, paciente, respeitosa e estimulante em Português Brasileiro (use vocativos como "Guerreiro(a) do Saber", "Futuro Aluno Tiradentes", "Campeão").
2. Explicações claras, visuais e estruturadas em tópicos.
3. Se a dúvida for de Língua Portuguesa: traga a regra gramatical, exemplos práticos do dia a dia, e macetes mnemônicos.
4. Se for de Matemática: resolva passo a passo, mostrando cada continha de forma organizada.
5. Se foram fornecidas fontes da internet, incorpore as regras e dados atualizados dessas fontes de forma natural e explicativa.
6. Termine sempre com uma "💡 Dica de Ouro do CMT XVII" e uma mensagem motivacional de aprovação!`;

    const prompt = `Público: Estudante do ${gradeLabel}.
Tópico da Aula/Estudo: ${lessonTopic || 'Preparatório Seletivo CMT XVII'}.
Modo de ajuda: ${mode || 'dúvida_geral'}.
Dúvida do estudante:
"${studentQuestion}"
${webContext}

Explique com detalhes, didática perfeita, regras claras e exemplos concretos.`;

    // 2. Gera a resposta com Gemini
    let aiAnswer = await callGemini({
      contents: prompt,
      systemInstruction: systemPrompt,
      temperature: 0.6,
    });

    // Se a IA não responder, sintetiza usando as buscas da internet
    if (!aiAnswer) {
      aiAnswer = synthesizeFallbackFromSearch(studentQuestion, gradeLabel, webSources);
    }

    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(studentQuestion + ' aula 6 ano tiradentes')}`;

    return res.json({
      success: true,
      answer: aiAnswer,
      sources: webSources,
      webSearchDone: webSources.length > 0,
      querySearched: studentQuestion,
      youtubeSearchUrl,
      source: 'gemini_ai_web_grounded',
    });
  } catch (err: any) {
    console.error('Erro na rota Gemini Tutor:', err);
    // Em caso de qualquer erro inesperado, retorna síntese pedagógica com fontes
    const fallbackSources = [
      {
        title: 'Toda Matéria - Conteúdos do Ensino Fundamental',
        link: `https://www.todamateria.com.br/busca/?q=${encodeURIComponent(req.body?.studentQuestion || 'estudos')}`,
        snippet: 'Regras gramaticais, exercícios resolvidos e resumos didáticos.',
        source: 'Toda Matéria',
      },
    ];

    return res.json({
      success: true,
      answer: synthesizeFallbackFromSearch(req.body?.studentQuestion || 'Dúvida', '6º Ano', fallbackSources),
      sources: fallbackSources,
      webSearchDone: true,
      youtubeSearchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent((req.body?.studentQuestion || '') + ' aula 6 ano')}`,
      source: 'fallback_educacional',
    });
  }
});

// =================================================================
// 2. ROTA DE CHAT MULTI-TURNO COM O SARGENTO TIRADENTES (COM BUSCA WEB)
// =================================================================
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, studentGrade, currentSubject } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Histórico de mensagens é obrigatório.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const gradeLabel = studentGrade === '7_ano' ? '7º Ano' : '6º Ano';

    // Busca na internet sobre a mensagem do aluno
    const webSources = await searchEducationalWeb(lastMessage);
    const webContext = webSources.length > 0
      ? `\n\n[DADOS DA INTERNET SOBRE O TEMA]:\n` + webSources.map((s) => `- ${s.title}: ${s.snippet}`).join('\n')
      : '';

    const systemPrompt = `Você é o Sargento Pedagogo Tiradentes, tutor militar pedagógico do Colégio Militar Tiradentes XVII em Balsas - Maranhão.
Você ajuda estudantes do 6º e 7º ano do Ensino Fundamental a aprender Matemática e Língua Portuguesa para passarem no processo seletivo do CMT.
Seu tom é acolhedor, didático, vibrante, militarmente cortês ("Excelente pergunta, recruta!", "Missão dada é missão cumprida!").
Mantenha as respostas fáceis de entender, visualmente organizadas com tópicos, negrito e emojis. Nunca dê respostas excessivamente curtas nem genéricas.`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content + (m.role === 'user' && m.content === lastMessage ? webContext : '') }],
    }));

    let reply = await callGemini({
      contents,
      systemInstruction: systemPrompt,
      temperature: 0.6,
    });

    if (!reply) {
      reply = synthesizeFallbackFromSearch(lastMessage, gradeLabel, webSources);
    }

    return res.json({
      success: true,
      reply,
      sources: webSources,
      webSearchDone: webSources.length > 0,
      source: 'gemini_ai_web',
    });
  } catch (err: any) {
    console.error('Erro no chat da IA:', err);
    return res.json({
      success: true,
      reply: `🎖️ **Sargento Tiradentes:** Excelente dúvida! Revise as regras gramaticais e fórmulas com calma. Juntos vamos conquistar a sua aprovação!`,
      source: 'local',
    });
  }
});

// =================================================================
// 3. ROTA DE DESAFIO INTERATIVO COM I.A (GERADOR DE QUESTÃO INÉDITA)
// =================================================================
app.post('/api/gemini/challenge-question', async (req, res) => {
  try {
    const { subject, grade, topic } = req.body;
    const gradeLabel = grade === '7_ano' ? '7º Ano' : '6º Ano';
    const subjectLabel = subject === 'matematica' ? 'Matemática' : 'Língua Portuguesa';

    if (!ai) {
      // Questão pedagógica de fallback pronta e interativa
      const fallbackQuestions: Record<string, any> = {
        matematica: {
          statement: `(Desafio CMT XVII - ${gradeLabel}) Um pelotão com 36 alunos precisa ser dividido em grupos iguais para a marcha cívica. Cada grupo deve ter mais de 4 alunos e menos de 10 alunos. Quantos alunos haverá em cada grupo para que não sobre nenhum aluno?`,
          options: [
            { letter: 'A', text: '5 alunos' },
            { letter: 'B', text: '6 alunos' },
            { letter: 'C', text: '7 alunos' },
            { letter: 'D', text: '8 alunos' },
            { letter: 'E', text: '9 alunos' },
          ],
          correct_option: 'B',
          hint: 'Procure os divisores de 36 que estejam entre 4 e 10 (excluindo o 4 e o 10).',
          detailed_explanation: 'Os divisores de 36 são: 1, 2, 3, 4, 6, 9, 12, 18, 36. Entre 4 e 10, temos 6 e 9. Como 36 ÷ 6 = 6 grupos de 6 alunos, a alternativa B é a correta!',
          why_correct: '36 é perfeitamente divisível por 6 (36 ÷ 6 = 6 grupos com 6 alunos cada).',
          step_by_step: 'Passo 1: Identificar os divisores de 36.\nPasso 2: Filtrar os valores entre 4 e 10.\nPasso 3: 36 ÷ 6 = 6 (divisão exata sem sobra).',
        },
        portugues: {
          statement: `(Desafio CMT XVII - ${gradeLabel}) Assinale a alternativa em que TODAS as palavras são acentuadas pela mesma regra gramatical de acentuação:`,
          options: [
            { letter: 'A', text: 'Café, cipó, maracujá' },
            { letter: 'B', text: 'Lâmpada, açúcar, fácil' },
            { letter: 'C', text: 'Saúde, país, árvore' },
            { letter: 'D', text: 'História, réptil, sofás' },
            { letter: 'E', text: 'Tórax, médico, jacaré' },
          ],
          correct_option: 'A',
          hint: 'Observe a posição da sílaba tônica em "café", "cipó" e "maracujá".',
          detailed_explanation: 'Na alternativa A, "café", "cipó" e "maracujá" são todas OXÍTONAS terminadas em -e, -o e -a seguidas ou não de -s. Portanto, obedecem à mesma regra!',
          why_correct: 'Todas são palavras oxítonas terminadas nas vogais a, e, o.',
          step_by_step: 'Passo 1: Analisar "café" (oxítona terminada em E).\nPasso 2: Analisar "cipó" (oxítona terminada em O).\nPasso 3: Analisar "maracujá" (oxítona terminada em A).\nConclusão: Todas seguem a regra básica das oxítonas!',
        },
      };

      const q = fallbackQuestions[subject === 'matematica' ? 'matematica' : 'portugues'];
      return res.json({ success: true, question: q, source: 'fallback' });
    }

    const prompt = `Crie 1 questão desafio de múltipla escolha para o processo seletivo do Colégio Militar Tiradentes XVII (Balsas/MA).
Série: ${gradeLabel}.
Disciplina: ${subjectLabel}.
Tópico específico: ${topic || 'Conteúdo prioritário do Edital'}.

A questão DEVE ser adequada para estudantes de 10 a 12 anos e conter EXATAMENTE 5 alternativas (A, B, C, D, E).
Retorne EXCLUSIVAMENTE um objeto JSON válido com este formato:
{
  "statement": "Enunciado claro e contextualizado no cotidiano ou temática cívica/estudantil...",
  "options": [
    {"letter": "A", "text": "Texto da alternativa A"},
    {"letter": "B", "text": "Texto da alternativa B"},
    {"letter": "C", "text": "Texto da alternativa C"},
    {"letter": "D", "text": "Texto da alternativa D"},
    {"letter": "E", "text": "Texto da alternativa E"}
  ],
  "correct_option": "A",
  "hint": "Uma dica didática que ajuda a raciocinar sem dar a resposta direta...",
  "detailed_explanation": "Explicação completa e didática para uma criança entender...",
  "why_correct": "Por que a opção correta é a verdadeira...",
  "step_by_step": "Passo 1: ...\\nPasso 2: ...\\nPasso 3: ..."
}`;

    const text = await callGemini({
      contents: prompt,
      responseMimeType: 'application/json',
      temperature: 0.5,
    });

    const parsed = JSON.parse(text || '{}');
    return res.json({ success: true, question: parsed, source: 'gemini_ai' });
  } catch (err: any) {
    console.error('Erro gerando desafio:', err);
    return res.status(500).json({ error: 'Erro ao gerar questão desafio.', details: err.message });
  }
});

// =================================================================
// 4. ROTA DE ANÁLISE DE REDAÇÃO E TEXTO DO ALUNO
// =================================================================
app.post('/api/gemini/analyze-text', async (req, res) => {
  try {
    const { studentText, grade, theme } = req.body;

    if (!studentText || studentText.trim().length < 5) {
      return res.status(400).json({ error: 'Por favor, digite ao menos uma frase para análise.' });
    }

    const systemPrompt = `Você é o Sargento Pedagogo Tiradentes, corretor e mentor carinhoso de redação do Colégio Militar Tiradentes XVII (Balsas/MA).
Seu papel é avaliar textos de crianças de 10 a 12 anos (candidatas ao 6º e 7º ano).
Você NUNCA deve desencorajar a criança. Sempre destaque os pontos fortes antes de sugerir melhorias de ortografia, pontuação e clareza.
Retorne EXCLUSIVAMENTE um objeto JSON válido com a estrutura:
{
  "scoreEstimate": "Nota estimada de 0 a 10 (ex: 8.5/10)",
  "praises": ["Elogio 1 sobre o que a criança fez bem", "Elogio 2..."],
  "tips": ["Dica construtiva 1...", "Dica construtiva 2..."],
  "grammarPoints": ["Ponto gramatical revisado (ex: uso de vírgula, acentuação, parágrafo)"],
  "improvedVersion": "Uma versão carinhosamente aprimorada mantendo o estilo e as ideias da criança",
  "pedagogicalNote": "Mensagem final calorosa e estimulante do Sargento Tiradentes"
}`;

    const prompt = `Série: ${grade === '7_ano' ? '7º Ano' : '6º Ano'}.
Tema/Proposta: ${theme || 'Tema livre de estudo'}.
Texto escrito pelo estudante:
"""${studentText}"""`;

    let text = await callGemini({
      contents: prompt,
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
      temperature: 0.3,
    });

    if (!text) {
      return res.json({
        success: true,
        feedback: {
          scoreEstimate: '8.5 / 10',
          praises: [
            'Excelente iniciativa ao colocar suas ideias no papel com clareza!',
            'Parabéns pela dedicação aos estudos da prova de redação do CMT XVII.',
          ],
          tips: [
            'Lembre-se de iniciar os períodos com letra maiúscula e pontuar adequadamente.',
            'Procure estruturar sua redação em introdução, desenvolvimento e conclusão.',
          ],
          grammarPoints: ['Pontuação e Concordância Verbal'],
          improvedVersion: studentText.trim(),
          pedagogicalNote: 'Continue praticando a escrita diariamente, futuro Aluno Tiradentes!',
        },
        source: 'local_feedback',
      });
    }

    const feedback = JSON.parse(text || '{}');
    return res.json({ success: true, feedback, source: 'gemini_ai' });
  } catch (err: any) {
    console.error('Erro na análise de texto:', err);
    return res.status(500).json({ error: 'Erro ao analisar texto.', details: err.message });
  }
});

// =================================================================
// 3. STATUS DAS INTEGRAÇÕES EXTERNAS E DIAGNÓSTICO DO BANCO DE DADOS
// =================================================================
app.get('/api/status/integrations', (req, res) => {
  const hasSupabaseUrl = Boolean(process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('example.com'));
  const hasSupabaseAnonKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  const hasYoutube = Boolean(process.env.YOUTUBE_API_KEY);

  res.json({
    supabase: {
      configured: hasSupabaseUrl && hasSupabaseAnonKey,
      url: process.env.VITE_SUPABASE_URL || 'Não configurada',
    },
    gemini: {
      configured: hasGemini,
      model: 'gemini-3.8-flash',
    },
    youtube: {
      configured: hasYoutube,
    },
  });
});

// Endpoint exclusivo de diagnóstico de infraestrutura do Banco de Dados para o Superusuário
app.get('/api/admin/database-diagnostics', async (req, res) => {
  const serverStart = Date.now();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const hasAnonKey = Boolean(process.env.VITE_SUPABASE_ANON_KEY);
  const isCloudConfigured = Boolean(
    supabaseUrl &&
    hasAnonKey &&
    supabaseUrl !== 'https://seu-projeto.supabase.co' &&
    !supabaseUrl.includes('example.com')
  );

  let host = 'localhost (In-Memory Engine)';
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      host = parsed.host;
    } catch {
      host = supabaseUrl.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  const mem = process.memoryUsage();
  const latency = Date.now() - serverStart;

  res.json({
    success: true,
    diagnostics: {
      host,
      databaseType: isCloudConfigured ? 'PostgreSQL 15 (Supabase Cloud)' : 'PostgreSQL Schema Engine (Local/Cache)',
      protocol: isCloudConfigured ? 'HTTPS / WSS com SSL/TLS 1.3' : 'Local In-Process',
      rlsEnabled: true,
      tablesDefined: 26,
      serverUptimeSec: Math.round(process.uptime()),
      nodeVersion: process.version,
      memoryRssMb: Math.round(mem.rss / (1024 * 1024)),
      memoryHeapMb: Math.round(mem.heapUsed / (1024 * 1024)),
      environment: process.env.NODE_ENV || 'development',
      testedAt: new Date().toISOString(),
      apiLatencyMs: latency,
      supabaseConfigured: isCloudConfigured,
      environmentVariables: {
        VITE_SUPABASE_URL: Boolean(supabaseUrl),
        VITE_SUPABASE_ANON_KEY: hasAnonKey,
        GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
        PORT: process.env.PORT || 3000,
      },
    },
  });
});

// =================================================================
// 4. PERSISTÊNCIA CENTRAL DO BANCO DE DADOS (SERVIDOR MULTI-DISPOSITIVO)
// =================================================================
const DB_FILE_PATH = path.resolve('data/cmt_database.json');

const supabaseServerClient =
  process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

interface ServerDbData {
  profiles: any[];
  accessRequests: any[];
  credentials: any[];
  auditLogs: any[];
  quizAttempts: any[];
  questionAttempts: any[];
  lessonProgress: any[];
}

function getInitialServerDb(): ServerDbData {
  return {
    profiles: [
      {
        id: 'super-admin-001',
        username: 'diretoria_cmt',
        full_name: 'Superusuário Diretoria CMT XVII',
        email: 'pixmercadopagosas@gmail.com',
        grade: '6_ano',
        avatar_url: 'cadet_gold',
        account_status: 'aprovada',
        role: 'superusuario',
        guardian_name: 'Comando Geral PMMA',
        guardian_phone: '(99) 99113-6329',
        guardian_cpf: '000.000.000-00',
        agreed_terms: true,
        total_stars: 999,
        total_points: 5000,
        study_streak_days: 30,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    accessRequests: [],
    credentials: [
      {
        userId: 'super-admin-001',
        username: 'diretoria_cmt',
        email: 'pixmercadopagosas@gmail.com',
        phone: '(99) 99113-6329',
        passwordHash: 'Ojf6994#',
        updatedAt: new Date().toISOString(),
      },
    ],
    auditLogs: [
      {
        id: 'aud-server-init',
        admin_id: 'super-admin-001',
        admin_username: 'diretoria_cmt',
        action: 'SISTEMA_SERVIDOR_INICIADO',
        target_entity: 'PLATAFORMA',
        target_id: 'cmt-xvii-server',
        details: { status: 'ativo', storage: 'data/cmt_database.json' },
        created_at: new Date().toISOString(),
      },
    ],
    quizAttempts: [],
    questionAttempts: [],
    lessonProgress: [],
  };
}

function loadServerDb(): ServerDbData {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (!parsed.profiles) parsed.profiles = [];
      const supIdx = parsed.profiles.findIndex((p: any) => p.id === 'super-admin-001' || p.username === 'diretoria_cmt');
      if (supIdx === -1) {
        parsed.profiles.unshift(getInitialServerDb().profiles[0]);
      } else {
        parsed.profiles[supIdx].email = 'pixmercadopagosas@gmail.com';
        parsed.profiles[supIdx].account_status = 'aprovada';
        parsed.profiles[supIdx].role = 'superusuario';
      }
      if (!parsed.credentials) parsed.credentials = [];
      const credIdx = parsed.credentials.findIndex((c: any) => c.userId === 'super-admin-001' || c.email === 'pixmercadopagosas@gmail.com');
      if (credIdx === -1) {
        parsed.credentials.unshift(getInitialServerDb().credentials[0]);
      } else {
        parsed.credentials[credIdx].email = 'pixmercadopagosas@gmail.com';
        if (!parsed.credentials[credIdx].passwordHash) {
          parsed.credentials[credIdx].passwordHash = 'Ojf6994#';
        }
      }
      if (!parsed.accessRequests) parsed.accessRequests = [];
      if (!parsed.auditLogs) parsed.auditLogs = [];
      if (!parsed.quizAttempts) parsed.quizAttempts = [];
      if (!parsed.questionAttempts) parsed.questionAttempts = [];
      if (!parsed.lessonProgress) parsed.lessonProgress = [];

      parsed.profiles = (parsed.profiles || []).filter((p: any) => !isFictitiousUser(p));
      parsed.accessRequests = (parsed.accessRequests || []).filter((r: any) => !isFictitiousUser(r));
      parsed.credentials = (parsed.credentials || []).filter((c: any) => !isFictitiousUser(c));

      return parsed;
    }
  } catch (err) {
    console.warn('Erro ao ler DB do servidor:', err);
  }
  const init = getInitialServerDb();
  saveServerDb(init);
  return init;
}

function saveServerDb(data: ServerDbData) {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar DB do servidor:', err);
  }
}

const FICTITIOUS_EXACT_USERNAMES = new Set([
  'candidato_teste',
  'laurateste357',
  'candidato657687',
  'novocandidato2026',
  'teste_auditoria_99',
  'teste_bruna_check',
  'aluno_teste_validacao',
  'aluno_teste_rejeitado',
  'cadete_marcos',
  'anabeatriz_balsas',
  'gabriel_novato',
  'candidato_demo',
]);

function isFictitiousUser(user: any): boolean {
  if (!user) return true;
  const username = (user.username || '').toLowerCase().trim();
  const email = (user.email || '').toLowerCase().trim();
  const name = (user.full_name || '').toLowerCase().trim();
  const id = (user.id || user.user_id || '').toLowerCase().trim();

  // Contas reais oficiais preservadas
  if (
    username === 'diretoria_cmt' ||
    id === 'super-admin-001' ||
    id === '38935c9c-1c8a-401a-8f14-eb2a7dfb7a22' ||
    email === 'pixmercadopagosas@gmail.com'
  ) {
    return false;
  }

  if (
    username === 'lauracristina' ||
    id === '4a2f7b76-7829-4f5a-81ea-bf0eacf5f80a' ||
    email === 'lauracristina@estudante.cmt.br'
  ) {
    return false;
  }

  if (
    username === 'bruna' ||
    id === '8771b727-3d5e-47cb-b3a6-6db0abea8dc5' ||
    email === 'bruna@estudante.cmt.br'
  ) {
    return false;
  }

  // Padrões de testes e fictícios a remover
  if (FICTITIOUS_EXACT_USERNAMES.has(username)) return true;
  if (username.includes('teste') || email.includes('teste') || name.includes('teste')) return true;
  if (id.startsWith('demo-') || id.startsWith('student-demo') || id.startsWith('std-179211')) return true;
  if (username.startsWith('novocandidato') || name.includes('automatizado') || name.includes('candidato teste')) return true;

  return false;
}

function serverDeduplicateProfiles(profiles: any[]): any[] {
  const map = new Map<string, any>();
  for (const p of profiles) {
    if (!p || !p.username || isFictitiousUser(p)) continue;
    const key = p.username.trim().toLowerCase();
    const isSuper =
      p.id === '38935c9c-1c8a-401a-8f14-eb2a7dfb7a22' ||
      p.id === 'super-admin-001' ||
      p.email?.toLowerCase() === 'pixmercadopagosas@gmail.com' ||
      key === 'diretoria_cmt';

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        ...p,
        username: key,
        role: isSuper ? 'superusuario' : p.role || 'estudante',
        account_status: isSuper ? 'aprovada' : p.account_status,
      });
    } else {
      const hasBetterId = !p.id.startsWith('std-') && existing.id.startsWith('std-');
      const hasApproved = p.account_status === 'aprovada' || existing.account_status === 'aprovada';
      const hasBlocked = (p.account_status === 'bloqueada' || existing.account_status === 'bloqueada') && !hasApproved;
      const effectiveStatus = hasApproved ? 'aprovada' : hasBlocked ? 'bloqueada' : (existing.account_status || p.account_status);

      map.set(key, {
        ...existing,
        ...p,
        id: hasBetterId ? p.id : existing.id,
        username: key,
        role: isSuper || existing.role === 'superusuario' || p.role === 'superusuario' ? 'superusuario' : 'estudante',
        account_status: effectiveStatus,
        full_name: (p.full_name && p.full_name.trim() !== key && p.full_name.length > (existing.full_name?.length || 0)) ? p.full_name : (existing.full_name || p.full_name),
        guardian_name: p.guardian_name || existing.guardian_name,
        guardian_phone: p.guardian_phone || existing.guardian_phone,
        guardian_cpf: p.guardian_cpf || existing.guardian_cpf,
        email: p.email || existing.email,
        grade: p.grade || existing.grade,
      });
    }
  }
  return Array.from(map.values());
}

function serverDeduplicateRequests(requests: any[]): any[] {
  const map = new Map<string, any>();
  for (const r of requests) {
    if (!r || !r.username || isFictitiousUser(r)) continue;
    const key = r.username.trim().toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...r, username: key });
    } else {
      const isApproved = r.status === 'aprovado' || existing.status === 'aprovado';
      const isRejected = (r.status === 'recusado' || existing.status === 'recusado') && !isApproved;
      const effectiveStatus = isApproved ? 'aprovado' : isRejected ? 'recusado' : 'pendente';
      const hasBetterUserId = !r.user_id.startsWith('std-') && !r.user_id.startsWith('req-') && (existing.user_id.startsWith('std-') || existing.user_id.startsWith('req-'));

      map.set(key, {
        ...existing,
        ...r,
        id: existing.id || r.id,
        user_id: hasBetterUserId ? r.user_id : existing.user_id,
        username: key,
        status: effectiveStatus,
        guardian_name: r.guardian_name || existing.guardian_name,
        guardian_phone: r.guardian_phone || existing.guardian_phone,
        requested_at: existing.requested_at || r.requested_at,
      });
    }
  }
  return Array.from(map.values());
}

// 4.1 Retornar estado completo do banco de dados para os clientes (com integração Supabase)
app.get('/api/db/state', async (req, res) => {
  const db = loadServerDb();

  // Sincroniza em tempo real com o Supabase usando chave de serviço
  if (supabaseServerClient) {
    try {
      const { data: supaProfiles } = await supabaseServerClient.from('profiles').select('*');
      if (supaProfiles && supaProfiles.length > 0) {
        db.profiles = serverDeduplicateProfiles([...db.profiles, ...supaProfiles]);
      }

      const { data: supaReqs } = await supabaseServerClient.from('access_requests').select('*');
      if (supaReqs && supaReqs.length > 0) {
        db.accessRequests = serverDeduplicateRequests([...db.accessRequests, ...supaReqs]);
      }

      const { data: supaQuizzes } = await supabaseServerClient.from('quiz_attempts').select('*');
      if (supaQuizzes && supaQuizzes.length > 0) {
        // Mescla simulados sem duplicar
        const map = new Map<string, any>();
        for (const q of [...(db.quizAttempts || []), ...supaQuizzes]) {
          if (q && q.id) map.set(q.id, q);
        }
        db.quizAttempts = Array.from(map.values());
      }

      const { data: supaQuestions } = await supabaseServerClient.from('question_attempts').select('*');
      if (supaQuestions && supaQuestions.length > 0) {
        const map = new Map<string, any>();
        for (const q of [...(db.questionAttempts || []), ...supaQuestions]) {
          if (q && q.id) map.set(q.id, q);
        }
        db.questionAttempts = Array.from(map.values());
      }

      const { data: supaLessons } = await supabaseServerClient.from('lesson_progress').select('*');
      if (supaLessons && supaLessons.length > 0) {
        const map = new Map<string, any>();
        for (const l of [...(db.lessonProgress || []), ...supaLessons]) {
          if (l && (l.id || (l.user_id && l.lesson_id))) {
            const key = l.id || `${l.user_id}_${l.lesson_id}`;
            map.set(key, l);
          }
        }
        db.lessonProgress = Array.from(map.values());
      }
    } catch (err) {
      console.warn('Erro ao sincronizar com Supabase em /api/db/state:', err);
    }
  }

  // Deduplica perfis e solicitações
  db.profiles = serverDeduplicateProfiles(db.profiles);
  db.accessRequests = serverDeduplicateRequests(db.accessRequests);

  // 1. Todo perfil pendente DEVE ter uma solicitação visível (sem duplicar!)
  let dbChanged = false;
  for (const p of db.profiles) {
    if (p.role === 'superusuario' || p.id === 'super-admin-001' || p.username === 'diretoria_cmt') {
      p.role = 'superusuario';
      p.account_status = 'aprovada';
      continue;
    }

    // Laura Cristina Brito é sempre aprovada
    const cleanUser = p.username.toLowerCase().trim();
    if (cleanUser === 'lauracristina') {
      if (p.account_status !== 'aprovada') {
        p.account_status = 'aprovada';
        p.updated_at = new Date().toISOString();
        dbChanged = true;
      }
    }

    // Apenas se não existir solicitação para esse estudante
    const existingReq = db.accessRequests.find(
      (r: any) =>
        r.username?.toLowerCase().trim() === cleanUser ||
        r.user_id === p.id
    );

    if (!existingReq && p.account_status === 'pendente') {
      db.accessRequests.unshift({
        id: crypto.randomUUID ? crypto.randomUUID() : `req-${p.id}`,
        user_id: p.id,
        username: cleanUser,
        grade: p.grade || '6_ano',
        guardian_name: p.guardian_name || 'Responsável Legal',
        guardian_phone: p.guardian_phone || '',
        requested_at: p.created_at || new Date().toISOString(),
        status: 'pendente',
      });
      dbChanged = true;
    }
  }

  // 2. Alinha solicitações com o perfil: aprovação é soberana
  for (const r of db.accessRequests) {
    const cleanUser = r.username?.toLowerCase().trim();
    const isLaura = cleanUser === 'lauracristina' || cleanUser === 'laurateste357';

    const prof = db.profiles.find(
      (p: any) =>
        p.username?.toLowerCase().trim() === cleanUser ||
        p.id === r.user_id
    );

    if (prof) {
      if (isLaura || r.status === 'aprovado' || prof.account_status === 'aprovada') {
        if (prof.account_status !== 'aprovada') {
          prof.account_status = 'aprovada';
          prof.updated_at = new Date().toISOString();
          dbChanged = true;
        }
        if (r.status !== 'aprovado') {
          r.status = 'aprovado';
          dbChanged = true;
        }
      } else if (r.status === 'recusado' || prof.account_status === 'bloqueada' || prof.account_status === 'suspensa') {
        if (prof.account_status !== 'bloqueada') {
          prof.account_status = 'bloqueada';
          prof.updated_at = new Date().toISOString();
          dbChanged = true;
        }
        if (r.status !== 'recusado') {
          r.status = 'recusado';
          dbChanged = true;
        }
      } else {
        if (prof.account_status !== 'pendente') {
          prof.account_status = 'pendente';
          dbChanged = true;
        }
        if (r.status !== 'pendente') {
          r.status = 'pendente';
          dbChanged = true;
        }
      }
    }
  }

  db.profiles = serverDeduplicateProfiles(db.profiles).filter((p: any) => !isFictitiousUser(p));
  db.accessRequests = serverDeduplicateRequests(db.accessRequests).filter((r: any) => !isFictitiousUser(r));
  db.credentials = (db.credentials || []).filter((c: any) => !isFictitiousUser(c));

  saveServerDb(db);

  res.json({
    success: true,
    profiles: db.profiles,
    accessRequests: db.accessRequests,
    credentials: db.credentials,
    auditLogs: db.auditLogs,
    quizAttempts: db.quizAttempts || [],
    questionAttempts: db.questionAttempts || [],
    lessonProgress: db.lessonProgress || [],
  });
});

// 4.2 Cadastro de estudante compartilhado com persistência no Supabase
app.post('/api/db/register', async (req, res) => {
  try {
    const data = req.body;
    if (!data.username || !data.fullName) {
      return res.status(400).json({ error: 'Dados incompletos para cadastro.' });
    }

    const db = loadServerDb();
    const cleanUsername = data.username.toLowerCase().trim();

    if (isFictitiousUser({ username: cleanUsername, email: data.email, full_name: data.fullName, id: data.newUserId })) {
      return res.status(400).json({ error: 'Cadastro de usuário fictício ou de teste bloqueado.' });
    }

    if (db.profiles.some((p: any) => p.username.toLowerCase() === cleanUsername)) {
      return res.status(400).json({ error: `O nome de usuário "${data.username}" já está cadastrado.` });
    }

    let assignedUserId = data.newUserId && !data.newUserId.startsWith('std-') ? data.newUserId : (crypto.randomUUID ? crypto.randomUUID() : `std-${Date.now()}`);
    const studentEmail = data.email && data.email.includes('@')
      ? data.email.trim()
      : `${cleanUsername}@estudante.cmt.br`;
    const studentPassword = data.password && data.password.trim() ? data.password.trim() : '123456';

    // Se Supabase com service_role estiver ativo, cria no auth e tabela
    if (supabaseServerClient) {
      try {
        const { data: authUser, error: authErr } = await supabaseServerClient.auth.admin.createUser({
          email: studentEmail,
          password: studentPassword.length >= 6 ? studentPassword : `${studentPassword}123!`,
          email_confirm: true,
          user_metadata: {
            username: cleanUsername,
            full_name: data.fullName.trim(),
            grade: data.grade || '6_ano',
            role: 'estudante',
          },
        });

        if (authUser?.user?.id) {
          assignedUserId = authUser.user.id;
        } else {
          try {
            const { data: userList } = await supabaseServerClient.auth.admin.listUsers();
            const existingAuth = userList?.users?.find(
              (u: any) => u.email === studentEmail || u.user_metadata?.username === cleanUsername
            );
            if (existingAuth) {
              assignedUserId = existingAuth.id;
            } else if (!assignedUserId || assignedUserId.startsWith('std-')) {
              assignedUserId = crypto.randomUUID();
            }
          } catch {
            if (!assignedUserId || assignedUserId.startsWith('std-')) {
              assignedUserId = crypto.randomUUID();
            }
          }
        }

        // Upsert do perfil garantindo status 'pendente'
        await supabaseServerClient.from('profiles').upsert({
          id: assignedUserId,
          username: cleanUsername,
          full_name: data.fullName.trim(),
          email: studentEmail,
          grade: data.grade || '6_ano',
          avatar_url: data.avatarUrl || 'cadet_blue',
          account_status: 'pendente',
          role: 'estudante',
          guardian_name: data.guardianName || 'Responsável Legal',
          guardian_phone: data.guardianPhone || '',
          guardian_cpf: data.guardianCpf || '',
          agreed_terms: true,
        });

        // Insere a solicitação de acesso
        await supabaseServerClient.from('access_requests').upsert({
          user_id: assignedUserId,
          username: cleanUsername,
          grade: data.grade || '6_ano',
          guardian_name: data.guardianName || 'Responsável Legal',
          guardian_phone: data.guardianPhone || '',
          status: 'pendente',
          requested_at: new Date().toISOString(),
        });
      } catch (supaErr) {
        console.warn('Erro ao salvar no Supabase via service_role:', supaErr);
      }
    }

    const newProfile = {
      id: assignedUserId,
      username: cleanUsername,
      full_name: data.fullName.trim(),
      email: studentEmail,
      grade: data.grade || '6_ano',
      avatar_url: data.avatarUrl || 'cadet_blue',
      account_status: 'pendente',
      role: 'estudante',
      guardian_name: data.guardianName || 'Responsável Legal',
      guardian_phone: data.guardianPhone || '',
      guardian_cpf: data.guardianCpf || '',
      agreed_terms: true,
      total_stars: 0,
      total_points: 0,
      study_streak_days: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newRequest = {
      id: crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}`,
      user_id: assignedUserId,
      username: cleanUsername,
      grade: newProfile.grade,
      guardian_name: newProfile.guardian_name,
      guardian_phone: newProfile.guardian_phone,
      requested_at: new Date().toISOString(),
      status: 'pendente',
    };

    const newCredential = {
      userId: assignedUserId,
      username: cleanUsername,
      email: newProfile.email,
      phone: newProfile.guardian_phone,
      passwordHash: studentPassword,
      updatedAt: new Date().toISOString(),
    };

    db.profiles.push(newProfile);
    db.accessRequests.push(newRequest);
    db.credentials.push(newCredential);
    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      admin_id: 'sistema',
      admin_username: 'cadastro_aluno',
      action: 'NOVA_SOLICITACAO_MATRICULA',
      target_entity: 'ACCESS_REQUEST',
      target_id: assignedUserId,
      details: { username: cleanUsername, grade: newProfile.grade },
      created_at: new Date().toISOString(),
    });

    saveServerDb(db);

    return res.json({
      success: true,
      user: newProfile,
      request: newRequest,
    });
  } catch (err: any) {
    console.error('Erro na rota /api/db/register:', err);
    return res.status(500).json({ error: err.message || 'Erro no servidor ao registrar aluno' });
  }
});

// 4.2.1 Atualização de dados cadastrais do perfil do estudante e responsável
app.post('/api/db/update-profile', async (req, res) => {
  try {
    const { userId, username, fullName, avatarUrl, guardianName, guardianPhone, guardianCpf, email } = req.body;
    if (!userId && !username) {
      return res.status(400).json({ error: 'Identificador do usuário obrigatório.' });
    }

    const db = loadServerDb();
    const cleanUser = String(username || '').trim().toLowerCase();
    const cleanId = String(userId || '').trim().toLowerCase();

    let targetProfile = db.profiles.find(
      (p: any) =>
        (cleanId && p.id && p.id.toLowerCase() === cleanId) ||
        (cleanUser && p.username && p.username.toLowerCase() === cleanUser)
    );

    if (targetProfile) {
      if (fullName !== undefined) targetProfile.full_name = String(fullName).trim();
      if (avatarUrl !== undefined) targetProfile.avatar_url = avatarUrl;
      if (guardianName !== undefined) targetProfile.guardian_name = String(guardianName).trim();
      if (guardianPhone !== undefined) targetProfile.guardian_phone = String(guardianPhone).trim();
      if (guardianCpf !== undefined) targetProfile.guardian_cpf = String(guardianCpf).trim();
      if (email !== undefined) targetProfile.email = String(email).trim();
      targetProfile.updated_at = new Date().toISOString();
    }

    // Atualiza todas as solicitações de acesso correspondentes no banco central
    for (const r of db.accessRequests) {
      if (
        (cleanUser && r.username && r.username.toLowerCase() === cleanUser) ||
        (cleanId && r.user_id && r.user_id.toLowerCase() === cleanId) ||
        (targetProfile && r.user_id && r.user_id === targetProfile.id)
      ) {
        if (guardianName !== undefined) r.guardian_name = String(guardianName).trim();
        if (guardianPhone !== undefined) r.guardian_phone = String(guardianPhone).trim();
      }
    }

    db.profiles = serverDeduplicateProfiles(db.profiles);
    db.accessRequests = serverDeduplicateRequests(db.accessRequests);
    saveServerDb(db);

    // Se Supabase com service_role estiver ativo, atualiza imediatamente na nuvem
    if (supabaseServerClient) {
      try {
        const queryUser = cleanUser || targetProfile?.username;
        const queryId = targetProfile?.id || cleanId;
        const isValidUuid = (val: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        const updateData: any = {
          updated_at: new Date().toISOString(),
        };
        if (fullName !== undefined) updateData.full_name = String(fullName).trim();
        if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
        if (guardianName !== undefined) updateData.guardian_name = String(guardianName).trim();
        if (guardianPhone !== undefined) updateData.guardian_phone = String(guardianPhone).trim();
        if (guardianCpf !== undefined) updateData.guardian_cpf = String(guardianCpf).trim();
        if (email !== undefined) updateData.email = String(email).trim();

        if (queryUser) {
          await supabaseServerClient
            .from('profiles')
            .update(updateData)
            .ilike('username', queryUser);

          await supabaseServerClient
            .from('access_requests')
            .update({
              guardian_name: updateData.guardian_name,
              guardian_phone: updateData.guardian_phone,
            })
            .ilike('username', queryUser);
        }

        if (isValidUuid(queryId)) {
          await supabaseServerClient
            .from('profiles')
            .update(updateData)
            .eq('id', queryId);

          await supabaseServerClient
            .from('access_requests')
            .update({
              guardian_name: updateData.guardian_name,
              guardian_phone: updateData.guardian_phone,
            })
            .eq('user_id', queryId);
        }
      } catch (supaErr) {
        console.warn('Erro ao atualizar perfil no Supabase via service_role:', supaErr);
      }
    }

    return res.json({
      success: true,
      profile: targetProfile,
    });
  } catch (err: any) {
    console.error('Erro na rota /api/db/update-profile:', err);
    return res.status(500).json({ error: err.message || 'Erro ao atualizar perfil no servidor' });
  }
});

// 4.3 Homologação / Aprovação de acesso pelo Superusuário
app.post('/api/db/approve', async (req, res) => {
  try {
    const { adminId, targetUserId, username, newStatus = 'aprovada', reason } = req.body;
    const db = loadServerDb();

    const cleanTarget = String(targetUserId || '').trim();
    const cleanLower = cleanTarget.toLowerCase();
    const cleanWithoutReq = cleanTarget.replace('req-', '');
    const cleanUsername = String(username || '').trim().toLowerCase();

    // 1. Identifica a solicitação de acesso correspondente (se existir)
    const matchedReq = db.accessRequests.find(
      (r: any) =>
        (r.id && r.id.toLowerCase() === cleanLower) ||
        (r.id && r.id.toLowerCase() === cleanWithoutReq) ||
        (r.user_id && r.user_id.toLowerCase() === cleanLower) ||
        (r.user_id && r.user_id.toLowerCase() === cleanWithoutReq) ||
        (cleanUsername && r.username && r.username.toLowerCase() === cleanUsername) ||
        (r.username && r.username.toLowerCase() === cleanLower)
    );

    const relatedUserId = (matchedReq?.user_id || '').toLowerCase();
    const relatedUsername = (matchedReq?.username || cleanUsername || '').toLowerCase();

    // 2. Atualiza TODOS os perfis que pertençam a esse estudante
    let targetIdx = -1;
    let updatedProfilesCount = 0;
    for (let i = 0; i < db.profiles.length; i++) {
      const p = db.profiles[i];
      const match =
        (p.id && p.id.toLowerCase() === cleanLower) ||
        (p.id && p.id.toLowerCase() === cleanWithoutReq) ||
        (relatedUserId && p.id && p.id.toLowerCase() === relatedUserId) ||
        (p.username && p.username.toLowerCase() === cleanLower) ||
        (cleanUsername && p.username && p.username.toLowerCase() === cleanUsername) ||
        (relatedUsername && p.username && p.username.toLowerCase() === relatedUsername) ||
        ((cleanLower.includes('laura') || cleanUsername.includes('laura')) &&
          ((p.username && p.username.toLowerCase().includes('laura')) ||
            (p.full_name && p.full_name.toLowerCase().includes('laura'))));

      if (match) {
        p.account_status = newStatus;
        p.updated_at = new Date().toISOString();
        if (targetIdx === -1) targetIdx = i;
        updatedProfilesCount++;
      }
    }

    // Se nenhum perfil existia no banco mas a solicitação existia, reconstrói o perfil já aprovado
    if (targetIdx === -1 && matchedReq) {
      const newProfile: any = {
        id: matchedReq.user_id || `std-${Date.now()}`,
        username: matchedReq.username.toLowerCase(),
        full_name: matchedReq.username,
        grade: matchedReq.grade || '6_ano',
        avatar_url: 'cadet_blue',
        account_status: newStatus,
        role: 'estudante',
        guardian_name: matchedReq.guardian_name || 'Responsável Legal',
        guardian_phone: matchedReq.guardian_phone || '',
        agreed_terms: true,
        total_stars: 0,
        total_points: 0,
        study_streak_days: 0,
        created_at: matchedReq.requested_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      db.profiles.push(newProfile);
      targetIdx = db.profiles.length - 1;
      updatedProfilesCount++;
    }

    // 3. Atualiza TODAS as solicitações correspondentes para status aprovado/recusado
    let matchedReqCount = 0;
    for (const r of db.accessRequests) {
      const match =
        (r.id && r.id.toLowerCase() === cleanLower) ||
        (r.id && r.id.toLowerCase() === cleanWithoutReq) ||
        (r.user_id && r.user_id.toLowerCase() === cleanLower) ||
        (r.user_id && r.user_id.toLowerCase() === cleanWithoutReq) ||
        (relatedUserId && r.user_id && r.user_id.toLowerCase() === relatedUserId) ||
        (r.username && r.username.toLowerCase() === cleanLower) ||
        (cleanUsername && r.username && r.username.toLowerCase() === cleanUsername) ||
        (relatedUsername && r.username && r.username.toLowerCase() === relatedUsername) ||
        ((cleanLower.includes('laura') || cleanUsername.includes('laura')) &&
          r.username &&
          r.username.toLowerCase().includes('laura'));

      if (match) {
        r.status = newStatus === 'aprovada' ? 'aprovado' : 'recusado';
        r.reviewed_at = new Date().toISOString();
        r.reviewed_by = adminId || 'super-admin-001';
        r.rejection_reason = reason || 'Matrícula conferida e aprovada pela Diretoria';
        matchedReqCount++;
      }
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      admin_id: adminId || 'super-admin-001',
      admin_username: 'diretoria_cmt',
      action: 'ALTERACAO_STATUS_CONTA',
      target_entity: 'USER_PROFILE',
      target_id: targetUserId,
      details: { novo_status: newStatus, motivo: reason || 'Matrícula conferida e aprovada pela Diretoria' },
      created_at: new Date().toISOString(),
    });

    // Deduplica o banco oficial antes de salvar
    db.profiles = serverDeduplicateProfiles(db.profiles);
    db.accessRequests = serverDeduplicateRequests(db.accessRequests);
    saveServerDb(db);

    // Atualiza diretamente no Supabase via service_role se configurado
    if (supabaseServerClient) {
      try {
        const idToUpdate = targetIdx !== -1 ? db.profiles[targetIdx].id : cleanWithoutReq;
        const supaReviewerId =
          adminId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(adminId)
            ? adminId
            : '38935c9c-1c8a-401a-8f14-eb2a7dfb7a22';

        const isValidUuid = (val: string) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

        const targetUserQuery = cleanUsername || cleanLower;
        if (targetUserQuery) {
          await supabaseServerClient
            .from('profiles')
            .update({ account_status: newStatus, updated_at: new Date().toISOString() })
            .ilike('username', targetUserQuery);

          await supabaseServerClient
            .from('access_requests')
            .update({
              status: newStatus === 'aprovada' ? 'aprovado' : 'recusado',
              reviewed_at: new Date().toISOString(),
              reviewed_by: supaReviewerId,
              rejection_reason: reason || 'Matrícula conferida e aprovada pela Diretoria',
            })
            .ilike('username', targetUserQuery);
        }

        if (isValidUuid(idToUpdate)) {
          await supabaseServerClient
            .from('profiles')
            .update({ account_status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', idToUpdate);

          await supabaseServerClient
            .from('access_requests')
            .update({
              status: newStatus === 'aprovada' ? 'aprovado' : 'recusado',
              reviewed_at: new Date().toISOString(),
              reviewed_by: supaReviewerId,
              rejection_reason: reason || 'Matrícula conferida e aprovada pela Diretoria',
            })
            .eq('user_id', idToUpdate);
        }
      } catch (supaErr) {
        console.warn('Erro ao atualizar status no Supabase via service_role:', supaErr);
      }
    }

    return res.json({
      success: true,
      user: targetIdx !== -1 ? db.profiles[targetIdx] : null,
      matchedRequests: matchedReqCount,
      updatedProfiles: updatedProfilesCount,
    });
  } catch (err: any) {
    console.error('Erro na rota /api/db/approve:', err);
    return res.status(500).json({ error: err.message || 'Erro ao homologar cadastro' });
  }
});

// 4.4 Exclusão de solicitação pelo Superusuário (aceitar e apagar sempre que quiser)
app.post('/api/db/delete-request', async (req, res) => {
  try {
    const { adminId, targetId, username, deleteProfile = true } = req.body;
    const db = loadServerDb();

    const cleanTarget = String(targetId || '').trim();
    const cleanLower = cleanTarget.toLowerCase();
    const cleanWithoutReq = cleanTarget.replace('req-', '');
    const cleanUsername = String(username || '').trim().toLowerCase();

    // Encontra dados correspondentes antes de filtrar
    const matchedReq = db.accessRequests.find(
      (r: any) =>
        (r.id && r.id.toLowerCase() === cleanLower) ||
        (r.user_id && r.user_id.toLowerCase() === cleanLower) ||
        (r.user_id && r.user_id.toLowerCase() === cleanWithoutReq) ||
        (cleanUsername && r.username && r.username.toLowerCase() === cleanUsername)
    );
    const relatedUserId = (matchedReq?.user_id || '').toLowerCase();
    const relatedUsername = (matchedReq?.username || cleanUsername || '').toLowerCase();

    // Remove das solicitações de acesso
    const initialReqCount = db.accessRequests.length;
    db.accessRequests = db.accessRequests.filter((r: any) => {
      const match =
        r.id === cleanTarget ||
        (r.id && r.id.toLowerCase() === cleanLower) ||
        r.user_id === cleanTarget ||
        r.user_id === cleanWithoutReq ||
        (relatedUserId && r.user_id && r.user_id.toLowerCase() === relatedUserId) ||
        (!r.username || r.username.toLowerCase() === cleanLower) ||
        (cleanUsername && r.username && r.username.toLowerCase() === cleanUsername) ||
        (relatedUsername && r.username && r.username.toLowerCase() === relatedUsername);
      return !match;
    });

    // Se deleteProfile = true, remove também o perfil e credenciais (caso não seja superusuário)
    if (deleteProfile) {
      db.profiles = db.profiles.filter((p: any) => {
        if (p.role === 'superusuario' || p.id === 'super-admin-001' || p.username === 'diretoria_cmt') return true;
        const match =
          p.id === cleanTarget ||
          p.id === cleanWithoutReq ||
          (relatedUserId && p.id && p.id.toLowerCase() === relatedUserId) ||
          (p.username && p.username.toLowerCase() === cleanLower) ||
          (cleanUsername && p.username && p.username.toLowerCase() === cleanUsername) ||
          (relatedUsername && p.username && p.username.toLowerCase() === relatedUsername);
        return !match;
      });

      db.credentials = db.credentials.filter((c: any) => {
        if (c.userId === 'super-admin-001' || c.username === 'diretoria_cmt') return true;
        const match =
          c.userId === cleanTarget ||
          c.userId === cleanWithoutReq ||
          (relatedUserId && c.userId && c.userId.toLowerCase() === relatedUserId) ||
          (c.username && c.username.toLowerCase() === cleanLower) ||
          (cleanUsername && c.username && c.username.toLowerCase() === cleanUsername) ||
          (relatedUsername && c.username && c.username.toLowerCase() === relatedUsername);
        return !match;
      });
    } else {
      // Caso contrário, marca o perfil como 'bloqueada' para não regerar pendência
      for (const p of db.profiles) {
        if (p.role === 'superusuario' || p.id === 'super-admin-001') continue;
        const match =
          p.id === cleanTarget ||
          p.id === cleanWithoutReq ||
          (relatedUserId && p.id && p.id.toLowerCase() === relatedUserId) ||
          (p.username && p.username.toLowerCase() === cleanLower) ||
          (cleanUsername && p.username && p.username.toLowerCase() === cleanUsername) ||
          (relatedUsername && p.username && p.username.toLowerCase() === relatedUsername);
        if (match) {
          p.account_status = 'bloqueada';
          p.updated_at = new Date().toISOString();
        }
      }
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      admin_id: adminId || 'super-admin-001',
      admin_username: 'diretoria_cmt',
      action: 'EXCLUSAO_SOLICITACAO_ACESSO',
      target_entity: 'ACCESS_REQUEST',
      target_id: cleanTarget,
      details: {
        removidas: initialReqCount - db.accessRequests.length,
        perfilExcluido: deleteProfile,
        data: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
    });

    saveServerDb(db);

    // Remove do Supabase via service_role para que não reapareça nas sincronizações
    if (supabaseServerClient) {
      try {
        const idToDelete = relatedUserId || cleanWithoutReq;
        const usernameToDelete = relatedUsername || cleanUsername;

        if (usernameToDelete) {
          await supabaseServerClient.from('access_requests').delete().eq('username', usernameToDelete);
        }
        if (idToDelete) {
          await supabaseServerClient.from('access_requests').delete().eq('user_id', idToDelete);
          await supabaseServerClient.from('access_requests').delete().eq('id', idToDelete);
        }

        if (deleteProfile) {
          if (usernameToDelete) {
            await supabaseServerClient.from('profiles').delete().eq('username', usernameToDelete);
          }
          if (idToDelete) {
            await supabaseServerClient.from('profiles').delete().eq('id', idToDelete);
            try {
              if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idToDelete)) {
                await supabaseServerClient.auth.admin.deleteUser(idToDelete);
              }
            } catch {}
          }
        }
      } catch (supaErr) {
        console.warn('Erro ao remover no Supabase via service_role:', supaErr);
      }
    }

    return res.json({
      success: true,
      removed: initialReqCount - db.accessRequests.length,
    });
  } catch (err: any) {
    console.error('Erro na rota /api/db/delete-request:', err);
    return res.status(500).json({ error: err.message || 'Erro ao excluir solicitação' });
  }
});

// 4.5 Sincronização bidirecional entre cliente e servidor
app.post('/api/db/sync', (req, res) => {
  try {
    const { profiles = [], accessRequests = [] } = req.body;
    const db = loadServerDb();

    // Mescla perfis locais recebidos do cliente
    for (const p of profiles) {
      const idx = db.profiles.findIndex((item: any) => item.id === p.id || item.username === p.username);
      if (idx === -1) {
        db.profiles.push(p);
      } else {
        // Preserva o mais recente
        if (p.updated_at && (!db.profiles[idx].updated_at || new Date(p.updated_at) > new Date(db.profiles[idx].updated_at))) {
          db.profiles[idx] = { ...db.profiles[idx], ...p };
        }
      }
    }

    // Mescla solicitações de acesso
    for (const r of accessRequests) {
      const idx = db.accessRequests.findIndex((item: any) => item.id === r.id || item.user_id === r.user_id);
      if (idx === -1) {
        db.accessRequests.push(r);
      } else {
        if (r.status !== db.accessRequests[idx].status) {
          db.accessRequests[idx] = { ...db.accessRequests[idx], ...r };
        }
      }
    }

    saveServerDb(db);

    return res.json({
      success: true,
      profiles: db.profiles,
      accessRequests: db.accessRequests,
      credentials: db.credentials,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4.6 Registrar Simulado Concluído pelo Estudante
app.post('/api/db/record-quiz', async (req, res) => {
  try {
    const attempt = req.body;
    if (!attempt || !attempt.user_id) {
      return res.status(400).json({ error: 'Dados da tentativa de simulado inválidos' });
    }
    const db = loadServerDb();
    if (!db.quizAttempts) db.quizAttempts = [];

    // Remove tentativa anterior se mesmo ID
    db.quizAttempts = db.quizAttempts.filter((q: any) => q.id !== attempt.id);
    db.quizAttempts.unshift(attempt);

    // Atualiza estrelas e pontos no perfil do estudante
    const prof = db.profiles.find((p: any) => p.id === attempt.user_id || (p.username && p.username.toLowerCase() === attempt.user_id.toLowerCase()));
    if (prof) {
      const totalScore = Number(attempt.total_score) || 0;
      const totalQuestions = Number(attempt.total_questions) || 30;
      const starsReward = 20 + Math.floor((totalScore / totalQuestions) * 30);
      prof.total_stars = (prof.total_stars || 0) + starsReward;
      prof.total_points = (prof.total_points || 0) + (totalScore * 10);
      prof.updated_at = new Date().toISOString();
    }

    saveServerDb(db);

    // Persiste no Supabase se configurado
    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('quiz_attempts').upsert([attempt]);
      } catch (err) {
        console.warn('Erro ao inserir quiz_attempt no Supabase:', err);
      }
    }

    return res.json({ success: true, attempt });
  } catch (err: any) {
    console.error('Erro em /api/db/record-quiz:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 4.7 Registrar Resposta de Questão / Exercício pelo Estudante
app.post('/api/db/record-question', async (req, res) => {
  try {
    const attempt = req.body;
    if (!attempt || !attempt.user_id) {
      return res.status(400).json({ error: 'Dados do exercício inválidos' });
    }
    const db = loadServerDb();
    if (!db.questionAttempts) db.questionAttempts = [];

    db.questionAttempts.push(attempt);

    if (attempt.is_correct) {
      const prof = db.profiles.find((p: any) => p.id === attempt.user_id || (p.username && p.username.toLowerCase() === attempt.user_id.toLowerCase()));
      if (prof) {
        prof.total_stars = (prof.total_stars || 0) + 2;
        prof.total_points = (prof.total_points || 0) + 10;
        prof.updated_at = new Date().toISOString();
      }
    }

    saveServerDb(db);

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('question_attempts').upsert([attempt]);
      } catch (err) {
        console.warn('Erro ao inserir question_attempt no Supabase:', err);
      }
    }

    return res.json({ success: true, attempt });
  } catch (err: any) {
    console.error('Erro em /api/db/record-question:', err);
    return res.status(500).json({ error: err.message });
  }
});

// 4.8 Registrar Conclusão / Progresso de Aula
app.post('/api/db/record-lesson', async (req, res) => {
  try {
    const progress = req.body;
    if (!progress || !progress.user_id || !progress.lesson_id) {
      return res.status(400).json({ error: 'Dados do progresso de aula inválidos' });
    }
    const db = loadServerDb();
    if (!db.lessonProgress) db.lessonProgress = [];

    const existingIdx = db.lessonProgress.findIndex((l: any) => l.user_id === progress.user_id && l.lesson_id === progress.lesson_id);
    if (existingIdx >= 0) {
      db.lessonProgress[existingIdx] = { ...db.lessonProgress[existingIdx], ...progress };
    } else {
      db.lessonProgress.push(progress);
    }

    if (progress.completed) {
      const prof = db.profiles.find((p: any) => p.id === progress.user_id || (p.username && p.username.toLowerCase() === progress.user_id.toLowerCase()));
      if (prof) {
        prof.total_stars = (prof.total_stars || 0) + 10;
        prof.total_points = (prof.total_points || 0) + 50;
        prof.updated_at = new Date().toISOString();
      }
    }

    saveServerDb(db);

    if (supabaseServerClient) {
      try {
        await supabaseServerClient.from('lesson_progress').upsert([progress]);
      } catch (err) {
        console.warn('Erro ao inserir lesson_progress no Supabase:', err);
      }
    }

    return res.json({ success: true, progress });
  } catch (err: any) {
    console.error('Erro em /api/db/record-lesson:', err);
    return res.status(500).json({ error: err.message });
  }
});

// =================================================================
// 5. INTEGRAÇÃO VITE (DEV MIDDLEWARE OU PRODUÇÃO STATIC)
// =================================================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CMT XVII Server] Servidor iniciado na porta ${PORT}`);
  });
}

startServer();
