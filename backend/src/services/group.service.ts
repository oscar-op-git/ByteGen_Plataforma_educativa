import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class GroupService {
  static async getOrderedTopicsByGroup(groupId: number) {
    // Traer el grupo con sus tópicos ordenados
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

    if (!group) {
      return null;
    }

    // Mapear a JSON con la forma deseada
    const topicsJson = group.orden.map(o => ({
      id: o.topico?.id_topico,
      titulo: o.topico?.titulo,
      description: o.topico?.description,
      puesto: o.puesto,
      multimedia: o.topico?.multimedia_topico.map(mt => ({
        id: mt.multimedia.id_multimedia,
        url_view: mt.multimedia.url_view,
        url_original: mt.multimedia.url_original,
        tipo: mt.tipo_multimedia.description,
      })) || [],
      comment: o.topico?.comment
        ? {
            id: o.topico.comment.id,
            author_name: o.topico.comment.author_name,
            content: o.topico.comment.content,
            created_at: o.topico.comment.created_at,
          }
        : null,
    }));

    return {
      id_group: group.id_group,
      id_course: group.id_course_course,
      topics: topicsJson,
    };
  }
}
