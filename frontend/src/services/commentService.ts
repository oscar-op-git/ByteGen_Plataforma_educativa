const API_BASE =
  (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) ||
  'http://localhost:3000';
  
export interface ReplyDto {
  id: string

  authorName: string

  content: string

  createdAt: string
}

export interface CommentDto {
  id: string

  authorName: string

  content: string

  createdAt: string

  replies: ReplyDto[]
}

interface ReplyApi {
  id: number

  authorName: string

  content: string

  createdAt: string
}

interface CommentApi {
  id: number

  authorName: string

  content: string

  createdAt: string

  replies: ReplyApi[]
}

interface CommentResponse {
  comment: CommentApi | null
}

interface CreateCommentResponse {
  comment: CommentApi
}

interface CreateReplyResponse {
  reply: ReplyApi
}

interface ErrorResponse {
  message?: string

  error?: string
}

async function requestJson<T>(
  path: string,

  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',

    ...init,

    headers: {
      'Content-Type': 'application/json',

      ...(init?.headers ?? {}),
    },
  })

  const raw = (await res.json()) as T | ErrorResponse

  if (!res.ok) {
    const errorPayload = raw as ErrorResponse

    const message = errorPayload.message ?? errorPayload.error ?? res.statusText

    throw new Error(message)
  }

  return raw as T
}

export async function fetchCommentForPlantilla(
  plantillaId: string | number
): Promise<CommentDto | null> {
  const data = await requestJson<CommentResponse>(
    `/api/comments/plantilla/${plantillaId}`,

    { method: 'GET' }
  )

  const c = data.comment

  if (!c) return null

  return {
    id: String(c.id),

    authorName: c.authorName,

    content: c.content,

    createdAt: c.createdAt,

    replies: c.replies.map((r) => ({
      id: String(r.id),

      authorName: r.authorName,

      content: r.content,

      createdAt: r.createdAt,
    })),
  }
}

export async function postMainCommentApi(
  plantillaId: string | number,

  content: string
): Promise<CommentDto> {
  const data = await requestJson<CreateCommentResponse>(
    `/api/comments/plantilla/${plantillaId}`,

    {
      method: 'POST',

      body: JSON.stringify({ content }),
    }
  )

  const c = data.comment

  return {
    id: String(c.id),

    authorName: c.authorName,

    content: c.content,

    createdAt: c.createdAt,

    replies: c.replies.map((r) => ({
      id: String(r.id),

      authorName: r.authorName,

      content: r.content,

      createdAt: r.createdAt,
    })),
  }
}

export async function postReplyApi(
  commentId: string | number,

  content: string
): Promise<ReplyDto> {
  const data = await requestJson<CreateReplyResponse>(
    `/api/comments/${commentId}/replies`,

    {
      method: 'POST',

      body: JSON.stringify({ content }),
    }
  )

  const r = data.reply

  return {
    id: String(r.id),

    authorName: r.authorName,

    content: r.content,

    createdAt: r.createdAt,
  }
}
