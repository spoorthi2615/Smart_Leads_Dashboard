import swaggerJSDoc from 'swagger-jsdoc';
import type { Options } from 'swagger-jsdoc';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Leads API',
      version: '1.0.0',
      description: 'Authentication, lead management, CSV export, and analytics API for the Smart Leads Dashboard.',
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local development',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['Admin', 'Sales User'] },
          },
        },
        Lead: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            status: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Lost'] },
            source: { type: 'string', enum: ['Website', 'Instagram', 'Referral'] },
            createdBy: { $ref: '#/components/schemas/User' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a user',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                    role: { type: 'string', enum: ['Admin', 'Sales User'], default: 'Sales User' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Registered user and JWT token' },
            '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ValidationError' } } } },
            '409': { description: 'Email already registered' },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Authenticated user and JWT token' },
            '400': { description: 'Validation error' },
            '401': { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get authenticated user',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': { description: 'Authenticated user' },
            '401': { description: 'Missing or invalid token' },
          },
        },
      },
      '/leads': {
        get: {
          tags: ['Leads'],
          summary: 'List leads',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
            { name: 'limit', in: 'query', schema: { type: 'integer', default: 10, maximum: 100 } },
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Lost'] } },
            { name: 'source', in: 'query', schema: { type: 'string', enum: ['Website', 'Instagram', 'Referral'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'Paginated leads' },
            '401': { description: 'Missing or invalid token' },
          },
        },
        post: {
          tags: ['Leads'],
          summary: 'Create lead',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Lead' } } },
          },
          responses: {
            '201': { description: 'Created lead' },
            '400': { description: 'Validation error' },
            '403': { description: 'Insufficient permissions' },
          },
        },
      },
      '/leads/export': {
        get: {
          tags: ['Leads'],
          summary: 'Export filtered leads as CSV',
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: 'sort', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
            { name: 'status', in: 'query', schema: { type: 'string', enum: ['New', 'Contacted', 'Qualified', 'Lost'] } },
            { name: 'source', in: 'query', schema: { type: 'string', enum: ['Website', 'Instagram', 'Referral'] } },
            { name: 'search', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            '200': { description: 'CSV file', content: { 'text/csv': { schema: { type: 'string', format: 'binary' } } } },
          },
        },
      },
      '/leads/{id}': {
        get: {
          tags: ['Leads'],
          summary: 'Get lead by ID',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Lead detail' }, '404': { description: 'Lead not found' } },
        },
        put: {
          tags: ['Leads'],
          summary: 'Update lead',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Updated lead' }, '400': { description: 'Validation error' }, '404': { description: 'Lead not found' } },
        },
        delete: {
          tags: ['Leads'],
          summary: 'Delete lead (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: { '200': { description: 'Deleted lead' }, '403': { description: 'Admin role required' }, '404': { description: 'Lead not found' } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);
