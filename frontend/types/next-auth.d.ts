import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      role: 'CUSTOMER' | 'ARTIST';
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    username?: string;
    role?: 'CUSTOMER' | 'ARTIST';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    username?: string;
    role?: 'CUSTOMER' | 'ARTIST';
  }
}
