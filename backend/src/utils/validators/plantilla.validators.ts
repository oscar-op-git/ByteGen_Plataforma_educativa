import { z } from 'zod';

export const contentBlockSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'code', 'slides', 'video']),
  content: z.string(),
  language: z.string().optional(),
});

export const topicJsonSchema = z.object({
  id: z.string(),
  title: z.string(),
  variant: z.enum(['basic', 'slides', 'video']).optional(),
  blocks: z.array(contentBlockSchema),
});

export const createPlantillaSchema = z.object({
  nombre: z.string().min(1),
  es_borrador: z.boolean().optional(),
  json: topicJsonSchema,
});
