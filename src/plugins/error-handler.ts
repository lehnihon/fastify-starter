import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async (fastify) => {
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      statusCode: 404,
      error: 'Not Found',
      message: `Route ${request.method} ${request.url} not found`,
    })
  })

  fastify.setErrorHandler(
    (error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
      if (error.validation) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.message,
          details: error.validation,
        })
      }

      const statusCode = error.statusCode ?? 500

      if (statusCode >= 500) {
        request.log.error(error)
      }

      return reply.code(statusCode).send({
        statusCode,
        error: error.name,
        message: error.message,
      })
    },
  )
})
