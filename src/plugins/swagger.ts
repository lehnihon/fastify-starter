import fastifySwagger from '@fastify/swagger'
import scalarApiReference from '@scalar/fastify-api-reference'
import fp from 'fastify-plugin'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import type { OpenAPIV3 } from 'openapi-types'

const errorStatusCodes = ['400', '401', '403', '404', '409', '500']
const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options']

const errorResponses: Record<string, OpenAPIV3.ResponseObject> =
  Object.fromEntries(
    errorStatusCodes.map((code) => [
      code,
      {
        description: 'Error response',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
          },
        },
      },
    ]),
  )

export default fp(async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Fastify Starter API',
        description: 'Fastify 5 + TypeScript + Drizzle + Swagger/OpenAPI',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
        schemas: {
          ErrorResponse: {
            type: 'object',
            required: ['error'],
            properties: {
              error: {
                type: 'object',
                required: ['code', 'statusCode', 'message'],
                properties: {
                  code: { type: 'string' },
                  statusCode: { type: 'integer' },
                  message: { type: 'string' },
                  details: {},
                },
              },
            },
          },
        },
      },
    },
    transform: jsonSchemaTransform,
    transformObject: (documentObject) => {
      if (!('openapiObject' in documentObject)) {
        return documentObject.swaggerObject
      }

      const { openapiObject } = documentObject

      for (const pathItem of Object.values(openapiObject.paths ?? {})) {
        for (const [method, rawOperation] of Object.entries(pathItem ?? {})) {
          if (httpMethods.includes(method)) {
            const operation = rawOperation as OpenAPIV3.OperationObject
            operation.responses = {
              ...errorResponses,
              ...operation.responses,
            }
          }
        }
      }

      return openapiObject
    },
  })

  await fastify.register(scalarApiReference, {
    routePrefix: '/reference',
  })
})
