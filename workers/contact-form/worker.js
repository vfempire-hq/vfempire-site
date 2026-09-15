// vfempire.com contact-form Worker. Accepts a JSON or form POST from a page on vfempire.com,
// validates it, and forwards it to VF Mail through MAIL_ENDPOINT (a same-organisation SMTP relay
// or the VF Mail HTTP intake) with MAIL_TOKEN. No third-party service, no storage, no cookies.
//
// Wire a page to it with a plain <form method="post" action="/api/contact"> that carries
// name, email, subject, message and an empty honeypot field named "website"; the page keeps
// its mailto: link as the fallback for visitors without JavaScript.
const MAX = { name: 120, email: 200, subject: 160, message: 4000 };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return cors(new Response(null, { status: 204 }), env);
    if (request.method !== 'POST') return cors(json({ ok: false, error: 'POST only' }, 405), env);
    const origin = request.headers.get('Origin') || '';
    if (origin && origin !== env.ALLOWED_ORIGIN) return cors(json({ ok: false, error: 'origin not allowed' }, 403), env);

    let body = {};
    const ct = request.headers.get('Content-Type') || '';
    try {
      if (ct.includes('application/json')) body = await request.json();
      else body = Object.fromEntries((await request.formData()).entries());
    } catch { return cors(json({ ok: false, error: 'unreadable body' }, 400), env); }

    if (body.website) return cors(json({ ok: true }), env); // honeypot: pretend success, send nothing
    const field = (k) => String(body[k] || '').trim().slice(0, MAX[k]);
    const name = field('name'), email = field('email'), subject = field('subject') || 'Website enquiry', message = field('message');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) return cors(json({ ok: false, error: 'email and message are required' }, 422), env);

    const payload = {
      to: env.TO, replyTo: email,
      subject: `[vfempire.com] ${subject}`,
      text: `From: ${name || '(no name)'} <${email}>\nPage: ${request.headers.get('Referer') || 'unknown'}\n\n${message}`,
    };
    const r = await fetch(env.MAIL_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.MAIL_TOKEN}` },
      body: JSON.stringify(payload),
    });
    if (!r.ok) return cors(json({ ok: false, error: `mail relay returned ${r.status}` }, 502), env);
    if (ct.includes('application/json')) return cors(json({ ok: true }), env);
    return Response.redirect(`${env.ALLOWED_ORIGIN}/contact/?sent=1`, 303);
  },
};

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });
const cors = (res, env) => { res.headers.set('Access-Control-Allow-Origin', env.ALLOWED_ORIGIN); res.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); res.headers.set('Access-Control-Allow-Headers', 'Content-Type'); return res; };
