import "server-only"; // never client

import { SignJWT, jwtVerify } from 'jose'
import { cookies, headers } from "next/headers";

interface SessionPayload {
  ip_address: string
}
 
const secretKey = process.env.SESSION_SECRET
const encodedKey = new TextEncoder().encode(secretKey)
 
export function encrypt(payload: SessionPayload) {
  
  return new SignJWT({
    aud: payload.ip_address,
    iat: new Date().getTime(),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)
}
 
export async function decrypt(session: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload
  } catch (error) {
    console.log('Failed to verify session')
  }
}

export async function setSessionId() {
  "use server"

  function IP() {
    const FALLBACK_IP_ADDRESS = '0.0.0.0'
    const forwardedFor = headers().get('x-forwarded-for')
   
    if (forwardedFor) {
      return forwardedFor.split(',')[0] ?? FALLBACK_IP_ADDRESS
    }
   
    return headers().get('x-real-ip') ?? FALLBACK_IP_ADDRESS
  }

  const ip = await encrypt({
    ip_address: IP()
  });

  cookies().set(
    "session_id", ip 
  );
}


export async function getSessionId() {
  "use server"

  if (!cookies().has('session_id'))
    await setSessionId();

  return cookies().get('session_id');
}