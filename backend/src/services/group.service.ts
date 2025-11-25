import { PrismaClient } from '@prisma/client';
import { OrderedTopicsResponse, TopicDto, MultimediaDto } from './types.js';

const prisma = new PrismaClient();

export class GroupService {
  static async getOrderedTopicsByGroup(groupId: number): Promise<OrderedTopicsResponse | null> {
    const group = await prisma.group.findUnique({
      where: { id_group: groupId },
      include: {
        orden: {
          orderBy: { puesto: 'asc' },
          include: {
            topico: {
              include: {
                multimedia_topico: {
                  include: {
                    multimedia: true,
                    tipo_multimedia: true,
                  },
                },
                comment: true,
              },
            },
          },
        },
      },
    });

    if (!group) return null;

    const topics: TopicDto[] = group.orden
      .filter((o) => o.topico !== null)
      .map((o) => {
        const t = o.topico!;
        const multimedia: MultimediaDto[] = (t.multimedia_topico ?? []).map((mt) => ({
          id_multimedia: mt.multimedia.id_multimedia,
          url_view: mt.multimedia.url_view,
          url_original: mt.multimedia.url_original,
          tipo: mt.tipo_multimedia?.description ?? null,
        }));

        return {
          id_topico: t.id_topico,
          titulo: t.titulo ?? null,
          description: t.description ?? null,
          puesto: o.puesto ?? null,
          multimedia,
          comment: t.comment
            ? {
                id: t.comment.id,
                author_name: t.comment.author_name,
                content: t.comment.content,
                created_at: t.comment.created_at,
              }
            : null,
        };
      });

    return {
      id_group: group.id_group,
      id_course: group.id_course_course,
      topics,
    };
  }
}
