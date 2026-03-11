import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'secret-returni-key';
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  id: string;
  role: 'admin' | 'agent' | 'merchant_user' | 'client';
  merchant_id?: string;
  agent_id?: string;
  expiresAt: Date;
};

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

export async function createSession(payload: Omit<SessionPayload, 'expiresAt'>) {
  // 4-hour session: balances security (phone theft) against usability for business use
  const SESSION_HOURS = 4;
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 60 * 60 * 1000);
  const session = await encrypt({ ...payload, expiresAt });

  cookies().set('returni_session', session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
}

export async function deleteSession() {
  cookies().delete('returni_session');
}
