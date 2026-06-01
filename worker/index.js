export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (request.method !== 'POST') {
      return corsResponse(JSON.stringify({ error: 'Method not allowed' }), 405);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return corsResponse(JSON.stringify({ error: 'Invalid JSON' }), 400);
    }

    const { nome, contato, tipo_projeto, mensagem } = body;
    if (!nome || !contato || !mensagem) {
      return corsResponse(JSON.stringify({ error: 'Missing fields' }), 400);
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nathan Portfolio <onboarding@resend.dev>',
        to: ['nathangguerrero@gmail.com'],
        subject: `Novo contato: ${nome}`,
        html: `
          <h2>Novo contato via portfólio</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Contato:</strong> ${contato}</p>
          <p><strong>Tipo de projeto:</strong> ${tipo_projeto || '—'}</p>
          <p><strong>Mensagem:</strong><br>${mensagem.replace(/\n/g, '<br>')}</p>
        `,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return corsResponse(JSON.stringify({ error: err }), 500);
    }

    return corsResponse(JSON.stringify({ success: true }), 200);
  },
};

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
