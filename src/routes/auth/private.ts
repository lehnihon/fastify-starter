import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authenticated } from '#app/lib/authenticated'
import { meResponseSchema } from '#app/routes/auth/schemas'

export const authPrivateRoutes = authenticated((app) => {
  const typed = app.withTypeProvider<ZodTypeProvider>()

  typed.get(
    '/me',
    {
      schema: {
        tags: ['auth'],
        security: [{ bearerAuth: [] }],
        response: { 200: meResponseSchema },
      },
    },
    async (request) => {
      return {
        data: {
          sub: request.user.sub,
          email: request.user.email,
          role: request.user.role,
        },
      }
    },
  )
})
