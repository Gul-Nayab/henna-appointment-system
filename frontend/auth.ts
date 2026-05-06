import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

type DbUser = {
  userId: number;
  username: string;
  password: string;
  name: string;
  email?: string | null;
  phoneNumber?: string | null;
  role: 'CUSTOMER' | 'ARTIST';
};

async function getUserFromDb(username: string, password: string) {
  try {
    const response = await fetch(
      `${process.env.BACKEND_URL}/api/users/username/${username}`,
      { cache: 'no-store' },
    );

    if (!response.ok) return null;

    const dbUser = (await response.json()) as DbUser;

    if (!dbUser?.password) return null;

    const passwordMatches = await bcrypt.compare(password, dbUser.password);

    if (!passwordMatches) return null;

    return dbUser;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!username || !password) return null;

        const user = await getUserFromDb(username, password);

        if (!user) return null;

        return {
          id: String(user.userId),
          name: user.name,
          email: user.email ?? undefined,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      session.user.username = token.username as string;
      session.user.role = token.role as 'CUSTOMER' | 'ARTIST';

      return session;
    },
  },
});
