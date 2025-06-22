import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('NEXT_PUBLIC_JWT_SECRET is required');
}

interface JwtPayload {
  email: string;
  exp: number;
}

export function generateJWT(payload: JwtPayload) {
  return jwt.sign(payload, JWT_SECRET as string);
}

export function verifyJWT(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
}
