import { prisma } from "../utils/prisma.js";

export type CommentWithRepliesDto = {
  id: number;
  authorName: string;
  content: string;
  createdAt: Date;
  plantillaId: number | null;
  replies: {
    id: number;
    authorName: string;
    content: string;
    createdAt: Date;
  }[];
};

export async function getCommentForPlantilla(
  plantillaId: number
): Promise<CommentWithRepliesDto | null> {
  const comment = await prisma.comment.findFirst({
    where: { plantilla_id: plantillaId },
    orderBy: { created_at: "asc" },
    include: {
      replies: {
        orderBy: { created_at: "asc" },
      },
    },
  });

  if (!comment) return null;

  return {
    id: comment.id,
    authorName: comment.author_name,
    content: comment.content,
    createdAt: comment.created_at,
    plantillaId: comment.plantilla_id,
    replies: comment.replies.map((r) => ({
      id: r.id,
      authorName: r.author_name,
      content: r.content,
      createdAt: r.created_at,
    })),
  };
}

export class MainCommentExistsError extends Error {
  constructor() {
    super("MAIN_COMMENT_EXISTS");
    this.name = "MainCommentExistsError";
  }
}

export async function createMainCommentForPlantilla(
  plantillaId: number,
  authorName: string,
  content: string
): Promise<CommentWithRepliesDto> {
  // Reglas: solo un comentario principal por plantilla
  const existing = await prisma.comment.findFirst({
    where: { plantilla_id: plantillaId },
  });

  if (existing) {
    throw new MainCommentExistsError();
  }

  const newComment = await prisma.comment.create({
    data: {
      author_name: authorName,
      content,
      plantilla: {
        connect: { id_plantilla: plantillaId },
      },
    },
    include: {
      replies: true,
    },
  });

  return {
    id: newComment.id,
    authorName: newComment.author_name,
    content: newComment.content,
    createdAt: newComment.created_at,
    plantillaId: newComment.plantilla_id,
    replies: [],
  };
}

export async function createReplyForComment(
  commentId: number,
  authorName: string,
  content: string
): Promise<{
  id: number;
  authorName: string;
  content: string;
  createdAt: Date;
}> {
  // Opcional: verificar que el comentario exista
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!comment) {
    throw new Error("COMMENT_NOT_FOUND");
  }

  const reply = await prisma.replies.create({
    data: {
      author_name: authorName,
      content,
      comment: {
        connect: { id: commentId },
      },
    },
  });

  return {
    id: reply.id,
    authorName: reply.author_name,
    content: reply.content,
    createdAt: reply.created_at,
  };
}
