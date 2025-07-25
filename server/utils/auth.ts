import jwt from 'jsonwebtoken';

// JWT secret key - should match the one used for token generation
const JWT_SECRET = process.env.JWT_SECRET!;

interface TokenPayload {
  id: number;
  email: string;
  username: string;
  iat?: number;
  exp?: number;
}

export function getUserIdFromToken(event: any): { userId: number | null; error: string | null } {
  try {
    // Get the Authorization header
    const authHeader = getHeader(event, 'Authorization');
    
    if (!authHeader) {
      return { userId: null, error: 'Authorization header missing' };
    }

    // Check if it's a Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return { userId: null, error: 'Invalid token format' };
    }

    const token = parts[1];
    
    // Verify and decode the token
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    
    if (!decoded || !decoded.id) {
      return { userId: null, error: 'Invalid token payload' };
    }
    
    return { userId: decoded.id, error: null };
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return { userId: null, error: 'Token expired' };
    }
    return { userId: null, error: 'Invalid token' };
  }
}