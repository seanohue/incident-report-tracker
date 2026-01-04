import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get user (in real app, extract from JWT/session)
export async function getUser(req) {
  const userId = req.headers['x-user-id'] || req.query.userId;
  if (!userId) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
  });
  
  return user;
}

// Helper to get client IP and user agent
export function getRequestMetadata(req) {
  return {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
  };
}

