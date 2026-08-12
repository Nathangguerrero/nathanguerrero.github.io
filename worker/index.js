/**
 * Cloudflare Worker — proxy do formulário de contato.
 *
 * Recebe um POST JSON do site, valida, e encaminha para a API do Resend usando
 * a API key guardada como secret (env.RESEND_API_KEY) — nunca exposta no frontend.
 *
 * Deploy:  npx wrangler deploy   (de dentro de /worker)
 * Secrets: npx wrangler secret put RESEND_API_KEY
 *          npx wrangler secret put RECAPTCHA_SECRET
 */

// Origens autorizadas a usar este Worker (evita que outros sites o usem p/ spam).
const ALLOWED_ORIGINS = [
  'https://nathangguerrero.com.br',
  'https://www.nathangguerrero.com.br',
  'https://nathangguerrero.github.io',
];
const ALLOWED_RECAPTCHA_HOSTNAMES = [
  'nathangguerrero.com.br',
  'www.nathangguerrero.com.br',
  'nathangguerrero.github.io',
  'localhost',
  '127.0.0.1',
];

// Limites para evitar abuso com payloads enormes.
const MAX_LEN = { nome: 200, contato: 200, tipo_projeto: 300, mensagem: 5000 };

const RECIPIENT = 'nathangguerrero@gmail.com';
const SENDER = 'Nathan Portfolio <onboarding@resend.dev>';

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';

    if (!isAllowedOrigin(origin)) {
      return json({ error: 'Origin not allowed' }, 403, origin);
    }

    if (request.method === 'OPTIONS') {
      return json(null, 204, origin);
    }
    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON' }, 400, origin);
    }

    if (body.website) return json({ success: true }, 200, origin);

    const recaptchaToken = String(body.recaptcha_token || '').trim();
    if (!recaptchaToken) {
      return json({ error: 'Não foi possível validar a proteção anti-spam. Tente novamente.' }, 400, origin);
    }

    if (!env.RECAPTCHA_SECRET) {
      console.error('RECAPTCHA_SECRET não configurado no Worker.');
      return json({ error: 'Serviço temporariamente indisponível.' }, 503, origin);
    }

    const recaptchaOk = await verifyRecaptcha(
      recaptchaToken,
      env.RECAPTCHA_SECRET,
      request.headers.get('CF-Connecting-IP') || '',
    );
    if (!recaptchaOk) {
      return json({ error: 'Não foi possível validar a proteção anti-spam. Tente novamente.' }, 400, origin);
    }

    const nome = String(body.nome || '').slice(0, MAX_LEN.nome).trim();
    const contato = String(body.contato || '').slice(0, MAX_LEN.contato).trim();
    const tipo = String(body.tipo_projeto || '').slice(0, MAX_LEN.tipo_projeto).trim();
    const mensagem = String(body.mensagem || '').slice(0, MAX_LEN.mensagem).trim();

    if (!nome || !contato || !mensagem) {
      return json({ error: 'Missing fields' }, 400, origin);
    }

    // Verifica MX do domínio se o contato for email
    if (contato.includes('@')) {
      const domain = contato.split('@')[1];
      const mxValid = await hasMx(domain);
      if (!mxValid) {
        return json({ error: 'E-mail inválido. Verifique o endereço e tente novamente.' }, 400, origin);
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
      console.error('Falha no Resend:', res.status, await res.text());
      return json({ error: 'Não foi possível enviar a mensagem. Tente novamente.' }, 502, origin);
    }

    return json({ success: true }, 200, origin);
  },
};

// Valida o token no servidor. Tokens do reCAPTCHA são de uso único e expiram rapidamente.
async function verifyRecaptcha(token, secret, remoteIp) {
  try {
    const params = new URLSearchParams({ secret, response: token });
    if (remoteIp) params.set('remoteip', remoteIp);
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.success === true && ALLOWED_RECAPTCHA_HOSTNAMES.includes(data.hostname);
  } catch {
    return false;
  }
}

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

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.includes(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function json(payload, status, origin) {
  return new Response(payload === null ? null : JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(isAllowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    },
  });
}
