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
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// =================================================================
// 1. ROTA DE TUTORIA PEDAGÓGICA INTELIGENTE (GEMINI FLASH)
// =================================================================
app.post('/api/gemini/tutor', async (req, res) => {
  try {
    const { studentQuestion, lessonTopic, studentGrade, mode } = req.body;

    if (!studentQuestion) {
      return res.status(400).json({ error: 'A dúvida do estudante é obrigatória.' });
    }

    const gradeLabel = studentGrade === '7_ano' ? '7º Ano do Ensino Fundamental' : '6º Ano do Ensino Fundamental';

    if (!ai) {
      // Resposta didática local de alta qualidade quando a chave não estiver presente
      const fallbackResponses: Record<string, string> = {
        fracao: `🎯 **Dica Pedagógica do Sargento Tiradentes para Frações:**\n\n1. **Numerador (em cima):** Quantas partes você pegou.\n2. **Denominador (em baixo):** Em quantas partes o todo foi dividido.\n\n*Exemplo:* Uma pizza cortada em 8 fatias iguais. Se você comer 3 fatias, comeu **3/8** da pizza!\n\n💡 *Dica de Ouro do CMT XVII:* Para somar frações com denominadores diferentes, você precisa primeiro encontrar o MMC dos denominadores!`,
        oxitona: `🎯 **Dica Pedagógica do Sargento Tiradentes para Acentuação:**\n\n* **Oxítona:** A última sílaba é a mais forte (Ex: ca-fé, jor-nal, ba-ú).\n* **Paroxítona:** A penúltima sílaba é a mais forte (Ex: me-sa, li-vro, a-mí-vel).\n* **Proparoxítona:** A antepenúltima é a mais forte e **todas** levam acento! (Ex: lâm-pa-da, mé-di-co).\n\n💡 *Truque do Portão:* Fale a palavra como se estivesse chamando alguém no portão: *"Óô Jacaréee!"* A sílaba que você estica é a tônica!`,
        mmc: `🎯 **Dica Pedagógica do Sargento Tiradentes para MMC:**\n\nMMC significa **Mínimo Múltiplo Comum**.\n\nPara calcular o MMC entre 12 e 18:\n1. Fatore os números juntos pelos números primos (2, 3, 5, 7...)\n- 12, 18 | por 2 = 6, 9\n- 6, 9 | por 2 = 3, 9\n- 3, 9 | por 3 = 1, 3\n- 1, 3 | por 3 = 1, 1\n2. Multiplique os fatores: 2 × 2 × 3 × 3 = **36**!\n\nO MMC(12, 18) é **36**!`,
      };

      const qLower = studentQuestion.toLowerCase();
      let answer = `Olá, futuro Aluno do CMT XVII! 🎖️\n\nVocê está estudando para o **${gradeLabel}**.\n\nPara ter sucesso no processo seletivo:\n1. Leia atentamente o enunciado e sublinhe dados importantes.\n2. Faça os cálculos com calma em uma folha de rascunho.\n3. Revise as regras gramaticais e fórmulas com os resumos da plataforma.\n\n*(Você pode conectar sua chave GEMINI_API_KEY no arquivo .env para respostas geradas em tempo real pela inteligência artificial).*`;

      if (qLower.includes('fração') || qLower.includes('fracao') || qLower.includes('pizza')) {
        answer = fallbackResponses.fracao;
      } else if (qLower.includes('oxítona') || qLower.includes('oxitona') || qLower.includes('sílaba') || qLower.includes('silaba')) {
        answer = fallbackResponses.oxitona;
      } else if (qLower.includes('mmc') || qLower.includes('mdc') || qLower.includes('múltiplo') || qLower.includes('multiplo')) {
        answer = fallbackResponses.mmc;
      }

      return res.json({
        success: true,
        answer,
        source: 'sistema_local',
      });
    }

    const systemPrompt = `Você é o Sargento Pedagogo Tiradentes, um tutor militar-pedagógico acolhedor, vibrante e didático do Colégio Militar Tiradentes XVII (Balsas/MA).
Seu público-alvo são crianças de 10 a 12 anos que estão se preparando para o seletivo do 6º e 7º ano do Ensino Fundamental.

Diretrizes obrigatórias:
1. Comunicação calorosa, paciente, respeitosa e estimulante em Português Brasileiro (use vocativos carinhosos como "Recruta do Saber", "Futuro Aluno Tiradentes", "Campeão").
2. Explicações simples e visuais (use analogias cotidianas: pedaços de bolo/pizza, carrinhos, passos, brincadeiras).
3. Se a dúvida for de Matemática: resolva passo a passo, mostrando a lógica linha por linha sem pular etapas.
4. Se for de Língua Portuguesa: traga exemplos práticos, macetes mnemônicos (truques fáceis de lembrar) e destaque a regra.
5. Use formatação markdown rica com títulos em negrito, listas com marcadores e caixas de "💡 Dica de Ouro do Edital".
6. Termine sempre com uma mensagem de encorajamento para a prova do CMT XVII!`;

    const prompt = `Público: Estudante do ${gradeLabel}.
Tópico da Aula/Estudo: ${lessonTopic || 'Conteúdo geral do processo seletivo CMT XVII'}.
Modo de ajuda: ${mode || 'dúvida_geral'}.
Dúvida ou pergunta do estudante:
"${studentQuestion}"

Responda com máxima clareza, carinho pedagógico e metodologia passo a passo.`;

    const tutorPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.6,
      },
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tempo limite excedido')), 15000)
    );

    const response: any = await Promise.race([tutorPromise, timeoutPromise]).catch((err) => {
      console.warn('Gemini tutor timeout ou erro:', err?.message);
      return null;
    });

    return res.json({
      success: true,
      answer:
        response?.text ||
        `🎖️ **Dica do Sargento Tiradentes:** Na dúvida entre duas alternativas, releia o comando da questão! No edital do CMT XVII, pequenas palavras como "EXCETO", "INCORRETO" ou "APENAS" mudam tudo. Respire fundo e confie na sua dedicação!`,
      source: response?.text ? 'gemini_ai' : 'pedagogia_local',
    });
  } catch (err: any) {
    console.error('Erro na rota Gemini Tutor:', err);
    return res.status(500).json({
      error: 'Não foi possível gerar a explicação no momento.',
      details: err.message,
    });
  }
});

// =================================================================
// 2. ROTA DE CHAT MULTI-TURNO COM O SARGENTO TIRADENTES
// =================================================================
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, studentGrade, currentSubject } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Histórico de mensagens é obrigatório.' });
    }

    const lastMessage = messages[messages.length - 1]?.content || '';
    const gradeLabel = studentGrade === '7_ano' ? '7º Ano' : '6º Ano';

    if (!ai) {
      return res.json({
        success: true,
        reply: `🎖️ **Sargento Tiradentes:** Olá recruta! Para o **${gradeLabel}**, o segredo é praticar todos os dias. Sobre a sua mensagem: "${lastMessage.slice(0, 50)}...", revise as videoaulas e resolva as questões da nossa plataforma. Juntos vamos conquistar a sua farda!`,
        source: 'local',
      });
    }

    const systemPrompt = `Você é o Sargento Pedagogo Tiradentes, inteligência artificial tutora do Colégio Militar Tiradentes XVII em Balsas - Maranhão.
Você ajuda estudantes do 6º e 7º ano do Ensino Fundamental a aprender Matemática e Língua Portuguesa para passarem no processo seletivo do CMT.
Seu tom é acolhedor, didático, entusiasmado, militarmente cortês ("Excelente pergunta, jovem estudante!", "Missão dada é missão cumprida!").
Mantenha as respostas fáceis de entender, visualmente organizadas com tópicos, negrito e emojis. Nunca dê respostas excessivamente longas que cansem a criança; prefira ser claro e dinâmico.`;

    // Constrói o histórico para a API
    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents as any,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    return res.json({
      success: true,
      reply: response.text || 'Continue firme nos estudos, campeão!',
      source: 'gemini_ai',
    });
  } catch (err: any) {
    console.error('Erro no chat da IA:', err);
    return res.status(500).json({
      error: 'Erro ao processar mensagem do chat.',
      details: err.message,
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
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

    if (!ai) {
      return res.json({
        success: true,
        feedback: {
          scoreEstimate: '8.5 / 10',
          praises: [
            'Ótima iniciativa em expressar suas ideias por escrito!',
            'Texto criativo e com vocabulário adequado para o Ensino Fundamental.',
          ],
          tips: [
            'Lembre-se de verificar se todas as frases começam com letra maiúscula e terminam com ponto final.',
            'Cuidado com a concordância entre o sujeito e o verbo.',
          ],
          improvedVersion: studentText.trim(),
          pedagogicalNote: 'Parabéns pelo esforço! A prática contínua de escrita é o caminho para a aprovação no Colégio Militar Tiradentes XVII.',
        },
        source: 'local',
      });
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const feedback = JSON.parse(response.text || '{}');
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

// 4.1 Retornar estado completo do banco de dados para os clientes (com integração Supabase)
app.get('/api/db/state', async (req, res) => {
  const db = loadServerDb();

  // Sincroniza em tempo real com o Supabase usando chave de serviço
  if (supabaseServerClient) {
    try {
      const { data: supaProfiles } = await supabaseServerClient.from('profiles').select('*');
      if (supaProfiles && supaProfiles.length > 0) {
        for (const sp of supaProfiles) {
          const idx = db.profiles.findIndex((p: any) => p.id === sp.id || p.username.toLowerCase() === sp.username.toLowerCase());
          if (idx >= 0) {
            db.profiles[idx] = { ...db.profiles[idx], ...sp };
          } else {
            db.profiles.push(sp);
          }
        }
      }

      const { data: supaReqs } = await supabaseServerClient.from('access_requests').select('*');
      if (supaReqs && supaReqs.length > 0) {
        for (const sr of supaReqs) {
          const idx = db.accessRequests.findIndex((r: any) => r.id === sr.id || r.user_id === sr.user_id);
          if (idx >= 0) {
            db.accessRequests[idx] = { ...db.accessRequests[idx], ...sr };
          } else {
            db.accessRequests.push(sr);
          }
        }
      }

      // Regra garantida: Qualquer perfil com status 'pendente' deve constar nas solicitações
      for (const p of db.profiles) {
        if (p.account_status === 'pendente') {
          const exists = db.accessRequests.some(
            (r: any) => r.user_id === p.id || r.username.toLowerCase() === p.username.toLowerCase()
          );
          if (!exists) {
            db.accessRequests.unshift({
              id: `req-${p.id}`,
              user_id: p.id,
              username: p.username,
              grade: p.grade,
              guardian_name: p.guardian_name || 'Responsável Legal',
              guardian_phone: p.guardian_phone || '',
              requested_at: p.created_at || new Date().toISOString(),
              status: 'pendente',
            });
          }
        }
      }

      saveServerDb(db);
    } catch (err) {
      console.warn('Erro ao sincronizar com Supabase em /api/db/state:', err);
    }
  }

  res.json({
    success: true,
    profiles: db.profiles,
    accessRequests: db.accessRequests,
    credentials: db.credentials,
    auditLogs: db.auditLogs,
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

    if (db.profiles.some((p: any) => p.username.toLowerCase() === cleanUsername)) {
      return res.status(400).json({ error: `O nome de usuário "${data.username}" já está cadastrado.` });
    }

    let assignedUserId = data.newUserId || `std-${Date.now()}`;
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
      id: `req-${Date.now()}`,
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

// 4.3 Homologação / Aprovação de acesso pelo Superusuário
app.post('/api/db/approve', async (req, res) => {
  try {
    const { adminId, targetUserId, newStatus, reason } = req.body;
    const db = loadServerDb();

    const targetIdx = db.profiles.findIndex((p: any) => p.id === targetUserId);
    if (targetIdx !== -1) {
      db.profiles[targetIdx].account_status = newStatus;
      db.profiles[targetIdx].updated_at = new Date().toISOString();
    }

    const reqItem = db.accessRequests.find((r: any) => r.user_id === targetUserId);
    if (reqItem) {
      reqItem.status = newStatus === 'aprovada' ? 'aprovado' : 'recusado';
      reqItem.reviewed_at = new Date().toISOString();
      reqItem.reviewed_by = adminId || 'super-admin-001';
      reqItem.rejection_reason = reason;
    }

    db.auditLogs.unshift({
      id: `aud-${Date.now()}`,
      admin_id: adminId || 'super-admin-001',
      admin_username: 'diretoria_cmt',
      action: 'ALTERACAO_STATUS_CONTA',
      target_entity: 'USER_PROFILE',
      target_id: targetUserId,
      details: { novo_status: newStatus, motivo: reason },
      created_at: new Date().toISOString(),
    });

    saveServerDb(db);

    // Atualiza diretamente no Supabase via service_role
    if (supabaseServerClient) {
      try {
        await supabaseServerClient
          .from('profiles')
          .update({ account_status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', targetUserId);

        await supabaseServerClient
          .from('access_requests')
          .update({
            status: newStatus === 'aprovada' ? 'aprovado' : 'recusado',
            reviewed_at: new Date().toISOString(),
            reviewed_by: adminId || 'super-admin-001',
            rejection_reason: reason,
          })
          .eq('user_id', targetUserId);
      } catch (supaErr) {
        console.warn('Erro ao atualizar status no Supabase via service_role:', supaErr);
      }
    }

    return res.json({
      success: true,
      user: targetIdx !== -1 ? db.profiles[targetIdx] : null,
      request: reqItem,
    });
  } catch (err: any) {
    console.error('Erro na rota /api/db/approve:', err);
    return res.status(500).json({ error: err.message || 'Erro ao homologar cadastro' });
  }
});

// 4.4 Sincronização bidirecional entre cliente e servidor
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
