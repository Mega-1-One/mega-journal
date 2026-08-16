export interface UserSession {
  userId: string;
  email: string;
  name: string;
}

const DEFAULT_SESSION: UserSession = {
  userId: 'usr-demo',
  email: 'trader@megajournal.io',
  name: 'Alex Mercer',
};

/**
 * Gets server-side user session context for authentication and authorization.
 */
export async function getServerSession(): Promise<UserSession> {
  // In production with JWT cookies:
  // Decrypts HTTP-Only session cookie & returns authenticated UserSession object
  return DEFAULT_SESSION;
}
