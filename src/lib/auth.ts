// Stub auth handlers for NextAuth API route
// TODO: Configure NextAuth with proper providers and configuration

export const handlers = {
  GET: async () => {
    return new Response('Not implemented', { status: 501 });
  },
  POST: async () => {
    return new Response('Not implemented', { status: 501 });
  },
};

export const auth = async () => null;
export const signIn = async () => null;
export const signOut = async () => null;
