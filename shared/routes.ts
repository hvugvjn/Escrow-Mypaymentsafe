import { z } from 'zod';
import { insertProjectSchema, insertMilestoneSchema, projects, milestones, escrows } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  forbidden: z.object({ message: z.string() }),
};

export const api = {
  profile: {
    update: {
      method: 'PUT' as const,
      path: '/api/profile' as const,
      input: z.object({
        role: z.enum(['BUYER', 'FREELANCER']).optional(),
        companyName: z.string().optional(),
        phone: z.string().optional(),
        country: z.string().optional(),
        skills: z.string().optional(),
        portfolioLink: z.string().optional(),
        bio: z.string().optional(),
        resumeUrl: z.string().optional(),
      }),
      responses: {
        200: z.any(), // Returns User
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    }
  },
  projects: {
    list: {
      method: 'GET' as const,
      path: '/api/projects' as const,
      responses: {
        200: z.array(z.custom<typeof projects.$inferSelect>()),
        401: errorSchemas.unauthorized,
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/projects/:id' as const,
      responses: {
        200: z.object({
          project: z.custom<typeof projects.$inferSelect>(),
          milestones: z.array(z.custom<typeof milestones.$inferSelect>()),
          escrow: z.custom<typeof escrows.$inferSelect>().nullable(),
          buyerName: z.string(),
          freelancerName: z.string(),
        }),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
    getByCode: {
      method: 'GET' as const,
      path: '/api/projects/code/:code' as const,
      responses: {
        200: z.object({
          project: z.custom<typeof projects.$inferSelect>(),
          milestones: z.array(z.custom<typeof milestones.$inferSelect>()),
        }),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
    create: {
      method: 'POST' as const,
      path: '/api/projects' as const,
      input: insertProjectSchema,
      responses: {
        201: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      }
    },
    join: {
      method: 'POST' as const,
      path: '/api/projects/join' as const,
      input: z.object({ projectCode: z.string() }),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    },
    fund: {
      method: 'POST' as const,
      path: '/api/projects/:id/fund' as const,
      input: z.object({}),
      responses: {
        200: z.custom<typeof escrows.$inferSelect>(),
        400: errorSchemas.validation,
        403: errorSchemas.forbidden,
      }
    }
  },
  milestones: {
    create: {
      method: 'POST' as const,
      path: '/api/projects/:projectId/milestones' as const,
      input: insertMilestoneSchema,
      responses: {
        201: z.custom<typeof milestones.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    submit: {
      method: 'POST' as const,
      path: '/api/milestones/:id/submit' as const,
      input: z.object({ submissionUrl: z.string() }),
      responses: {
        200: z.custom<typeof milestones.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    approve: {
      method: 'POST' as const,
      path: '/api/milestones/:id/approve' as const,
      input: z.object({}),
      responses: {
        200: z.custom<typeof milestones.$inferSelect>(),
        400: errorSchemas.validation,
      }
    },
    requestRevision: {
      method: 'POST' as const,
      path: '/api/milestones/:id/revision' as const,
      input: z.object({}),
      responses: {
        200: z.custom<typeof milestones.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  },
  disputes: {
    raise: {
      method: 'POST' as const,
      path: '/api/projects/:id/dispute' as const,
      input: z.object({ reason: z.string() }),
      responses: {
        200: z.custom<typeof projects.$inferSelect>(),
        400: errorSchemas.validation,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
