import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

// Query para listado de usuarios
export const UserListQuerySchema = z
  .object({
    page: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : 1))
      .refine((n) => Number.isInteger(n) && n > 0, 'page debe ser un entero > 0'),
    pageSize: z
      .string()
      .optional()
      .transform((v) => (v ? Number(v) : 20))
      .refine(
        (n) => Number.isInteger(n) && n > 0 && n <= 100,
        'pageSize debe ser un entero entre 1 y 100'
      ),
    search: z.string().trim().optional(),
  })
  .strict();
export type UserListQuery = z.infer<typeof UserListQuerySchema>;

export const UserIdParamSchema = z.object({
  id: z.string().min(1, 'id es requerido'),
});
export type UserIdParams = z.infer<typeof UserIdParamSchema>;

export const UserRoleBodySchema = z.object({
  roleId: z
    .union([
      z.number().int().positive(),
      z.string().regex(/^\d+$/, 'roleId debe ser entero positivo').transform(Number),
    ])
    .transform((n) => Number(n))
    .refine((n) => Number.isInteger(n) && n > 0, 'roleId debe ser > 0'),
});
export type UserRoleBody = z.infer<typeof UserRoleBodySchema>;

function buildValidator<T extends z.ZodTypeAny>(
  schema: T,
  source: 'body' | 'query' | 'params'
) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse((req as any)[source]);
      (req as any)[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Payload inválido',
          errors: err.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      return res.status(400).json({ message: 'Payload inválido' });
    }
  };
}

// Middlewares de validación
export const validateUserListQuery = buildValidator(UserListQuerySchema, 'query');
export const validateUserIdParam = buildValidator(UserIdParamSchema, 'params');
export const validateUserRoleBody = buildValidator(UserRoleBodySchema, 'body');
