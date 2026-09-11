import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { AppError } from '#app/lib/errors'

export default fp(async (fastify) => {
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      error: {
        code: 'NOT_FOUND',
        statusCode: 404,
        message: `Route ${request.method} ${request.url} not found`,
      },
    })
  })

  fastify.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (error.validation) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            statusCode: 400,
            message: error.message,
            details: error.validation,
          },
        })
      }

      if (error instanceof AppError) {
        return reply.code(error.statusCode).send({
          error: {
            code: error.code,
            statusCode: error.statusCode,
            message: error.message,
            ...(error.details !== undefined ? { details: error.details } : {}),
          },
        })
      }

      const statusCode = error.statusCode ?? 500

      if (statusCode >= 500) {
        request.log.error(error)
      }

      return reply.code(statusCode).send({
        error: {
          code: 'INTERNAL_ERROR',
          statusCode,
          message: statusCode >= 500 ? 'Internal Server Error' : error.message,
        },
      })
    },
  )
})
