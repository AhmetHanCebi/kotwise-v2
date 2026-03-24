// Re-export useAuth from AuthContext so all existing imports continue to work.
// Auth state is now shared via React Context (single getSession, single listener).
export { useAuth } from '@/contexts/AuthContext';
