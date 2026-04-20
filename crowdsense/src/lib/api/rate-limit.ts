const rateLimitMap = new Map<string, number>();

export function checkRateLimit(ip: string, limitMs: number = 3000): boolean {
  const now = Date.now();
  const lastCall = rateLimitMap.get(ip) || 0;
  
  if (now - lastCall < limitMs) {
    return false;
  }
  
  rateLimitMap.set(ip, now);
  
  // Cleanup occasionally
  if (rateLimitMap.size > 1000) {
    const oldest = Array.from(rateLimitMap.keys()).slice(0, 100);
    oldest.forEach(k => rateLimitMap.delete(k));
  }
  
  return true;
}
