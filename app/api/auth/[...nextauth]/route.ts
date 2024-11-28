// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import type { Session } from 'next-auth'
import AzureADProvider from 'next-auth/providers/azure-ad'
import { supabase } from '@/lib/supabase'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      azure_id: string
      last_login: string
    }
  }
}

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID,
      authorization: {
        params: { scope: 'openid profile user.read email' }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        const { data: existingUser } = await supabase
          .from('users')
          .select()
          .eq('email', user.email)
          .single()

        if (!existingUser) {
          const { data: newUser } = await supabase
            .from('users')
            .insert({
              email: user.email,
              name: user.name || '',
              azure_id: account.providerAccountId,
              last_login: new Date().toISOString()
            })
            .select()
            .single()

          if (newUser) {
            token.user = newUser
          }
        } else {
          token.user = existingUser
        }
      }
      return token
    },

    async session({ session, token }: { session: Session; token: any }) {
      if (token.user) {
        session.user = token.user
      }
      return session
    },
  }
})

export { handler as GET, handler as POST }
