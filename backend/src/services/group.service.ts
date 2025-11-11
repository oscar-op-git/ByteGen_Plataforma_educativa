// src/modules/groups/group.service.ts
import { PrismaClient } from '@prisma/client';
import { OrderedTopicsResponse, TopicDto, MultimediaDto } from './types.js';

const prisma = new PrismaClient();

export class GroupService {
  /**
   * Devuelve tópicos ordenados por orden.puesto para un group.
   * Incluye multimedia asociada (a través de multimedia_topico) y el tipo de multimedia.
   */
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
              },
            },
          },
        },
      },
    });

    if (!group) return null;

    const topics: TopicDto[] = group.orden
      // opcional: filtrar orden que no tengan topico
      .filter((o) => o.topico !== null)
      .map((o) => {
        const t = o.topico!;
        const multimedia: MultimediaDto[] = (t.multimedia_topico ?? []).map((mt) => ({
          id_multimedia: mt.id_multimedia_multimedia,
          url_view: mt.multimedia?.url_view ?? null,
          url_original: mt.multimedia?.url_original ?? null,
          tipo: mt.tipo_topico?.description ?? null,
        }));

        const topicDto: TopicDto = {
          id_topico: t.id_topico,
          titulo: t.titulo ?? null,
          description: t.description ?? null,
          puesto: o.puesto ?? null,
          multimedia,
        };

        return topicDto;
      });

    return {
      id_group: group.id_group,
      topics,
    };
  }
}
