import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';


// Regla para description de rol
const roleDescriptionSchema = z
  .string()      
  .trim()
  .min(3, 'La description debe tener al menos 3 caracteres')
  .max(100, 'La description no debe superar 100 caracteres');

// Crear rol: body { description }
export const RoleCreateBodySchema = z.object({
  description: roleDescriptionSchema, 
});

export type RoleCreateBody = z.infer<typeof RoleCreateBodySchema>;

// Actualizar rol: body { description }
export const RoleUpdateBodySchema = z.object({
  description: roleDescriptionSchema,
});
export type RoleUpdateBody = z.infer<typeof RoleUpdateBodySchema>;

// Params :id (string -> number)
export const RoleIdParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'id debe ser un entero positivo')
    .transform((v) => Number(v))
    .refine((n) => Number.isInteger(n) && n > 0, 'id debe ser > 0'),
});
export type RoleIdParams = z.infer<typeof RoleIdParamSchema>;

// Query para listado
export const RoleListQuerySchema = z
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
export type RoleListQuery = z.infer<typeof RoleListQuerySchema>;

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
export const validateCreateRoleBody = buildValidator(RoleCreateBodySchema, 'body');
export const validateUpdateRoleBody = buildValidator(RoleUpdateBodySchema, 'body');
export const validateRoleIdParam = buildValidator(RoleIdParamSchema, 'params');
export const validateRoleListQuery = buildValidator(RoleListQuerySchema, 'query');
