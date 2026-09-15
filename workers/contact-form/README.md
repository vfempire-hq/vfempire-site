# contact-form Worker

Receives the register-interest and discovery-call forms and forwards them to VF Mail. Nothing is stored, no third party is involved, no cookie is set.

Deploy once the VF Mail intake endpoint exists:

```
cd workers/contact-form
npx wrangler secret put MAIL_ENDPOINT   # VF Mail HTTP intake or the internal SMTP relay bridge
npx wrangler secret put MAIL_TOKEN
npx wrangler deploy
```

Then replace the `mailto:` CTAs on the training centre, services and contact pages with a `<form method="post" action="/api/contact">` (fields: name, email, subject, message, and an empty honeypot named `website`). Keep the `mailto:` link beside the form as the no-JavaScript fallback. The site CSP already allows `form-action 'self'` and `connect-src 'self'`.
