/**
 * POST /api/admin/auth — Vercel Serverless Function
 *
 * Valide le mot de passe admin (= SCORING_ADMIN_SECRET).
 * Comparaison en temps constant pour éviter les timing attacks.
 */

export const config = { runtime: 'edge' };

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Response.json({ error: 'Méthode non autorisée' }, { status: 405 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Body JSON invalide' }, { status: 400 });
  }

  const expected = process.env.SCORING_ADMIN_SECRET ?? '';
  if (!expected) {
    return Response.json({ error: 'SCORING_ADMIN_SECRET non configuré' }, { status: 500 });
  }

  if (!timingSafeEqual(body.password ?? '', expected)) {
    return Response.json({ error: 'Mot de passe incorrect' }, { status: 401 });
  }

  return Response.json({ ok: true });
}
