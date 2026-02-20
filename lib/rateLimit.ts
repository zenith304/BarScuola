/**
 * Simple in-memory rate limiter.
 * Limits repeated requests from the same IP within a time window.
 * NOTE: This resets on server restart. For production with multiple instances,
 * use Redis (Upstash is free and works great with Vercel).
 */

type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export function rateLimit(ip: string, options: { maxRequests: number; windowMs: number }): boolean {
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetAt) {
        // New window
        store.set(ip, { count: 1, resetAt: now + options.windowMs });
        return true; // Allowed
    }

    if (entry.count >= options.maxRequests) {
        return false; // Blocked
    }

    entry.count++;
    return true; // Allowed
}
