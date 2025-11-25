// src/modules/groups/types.ts
export interface MultimediaDto {
  id_multimedia: number;
  url_view?: string | null;
  url_original?: string | null;
  tipo?: string | null; // viene de tipo_multimedia.description
}

export interface TopicDto {
  id_topico: number;
  titulo?: string | null;
  description?: string | null;
  puesto?: number | null;
  multimedia: MultimediaDto[];
  comment?: {
    id: number;
    author_name: string;
    content: string;
    created_at: Date;
  } | null;
}

export interface OrderedTopicsResponse {
  id_group: number;
  id_course: number;
  topics: TopicDto[];
}
