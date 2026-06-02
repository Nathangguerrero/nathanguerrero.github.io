/**
 * Cloudflare Worker — proxy do formulário de contato.
 *
 * Recebe um POST JSON do site, valida, e encaminha para a API do Resend usando
 * a API key guardada como secret (env.RESEND_API_KEY) — nunca exposta no frontend.
 *
 * Deploy:  npx wrangler deploy   (de dentro de /worker)
 * Secret:  npx wrangler secret put RESEND_API_KEY
 */

// Origens autorizadas a usar este Worker (evita que outros sites o usem p/ spam).
const ALLOWED_ORIGINS = [
  'https://nathangguerrero.com.br',
  'https://www.nathangguerrero.com.br',
  'https://nathangguerrero.github.io',
];

// Limites para evitar abuso com payloads enormes.
const MAX_LEN = { nome: 200, contato: 200, tipo_projeto: 300, mensagem: 5000 };

const RECIPIENT = 'nathangguerrero@gmail.com';
const SENDER = 'Nathan Portfolio <onboarding@resend.dev>';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      return cors(null, 204, origin);
    }
    if (request.method !== 'POST') {
      return cors(JSON.stringify({ error: 'Method not allowed' }), 405, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return cors(JSON.stringify({ error: 'Invalid JSON' }), 400, origin);
    }

    if (body.website) return cors(JSON.stringify({ success: true }), 200, origin);

    const nome = String(body.nome || '').slice(0, MAX_LEN.nome).trim();
    const contato = String(body.contato || '').slice(0, MAX_LEN.contato).trim();
    const tipo = String(body.tipo_projeto || '').slice(0, MAX_LEN.tipo_projeto).trim();
    const mensagem = String(body.mensagem || '').slice(0, MAX_LEN.mensagem).trim();

    if (!nome || !contato || !mensagem) {
      return cors(JSON.stringify({ error: 'Missing fields' }), 400, origin);
    }

    // Verifica MX do domínio se o contato for email
    if (contato.includes('@')) {
      const domain = contato.split('@')[1];
      const mxValid = await hasMx(domain);
      if (!mxValid) {
        return cors(JSON.stringify({ error: 'E-mail inválido. Verifique o endereço e tente novamente.' }), 400, origin);
      }
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: SENDER,
        to: [RECIPIENT],
        reply_to: contato.includes('@') ? contato : undefined,
        subject: `Novo contato: ${nome}`,
        html: `
          <h2>Novo contato via portfólio</h2>
          <p><strong>Nome:</strong> ${esc(nome)}</p>
          <p><strong>Contato:</strong> ${esc(contato)}</p>
          <p><strong>Tipo de projeto:</strong> ${esc(tipo) || '—'}</p>
          <p><strong>Mensagem:</strong><br>${esc(mensagem).replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return cors(JSON.stringify({ error: err }), 500, origin);
    }

    return cors(JSON.stringify({ success: true }), 200, origin);
  },
};

// Verifica se o domínio tem registro MX via DNS-over-HTTPS do Cloudflare.
async function hasMx(domain) {
  try {
    const res = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { 'Accept': 'application/dns-json' },
    });
    const data = await res.json();
    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return true; // em caso de falha na consulta, deixa passar
  }
}

// Escapa HTML para evitar injeção no corpo do e-mail.
function esc(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cors(body, status, origin) {
  const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const allowOrigin = ALLOWED_ORIGINS.includes(origin) || isLocalhost
    ? origin
    : ALLOWED_ORIGINS[0];
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}
