// src/modules/groups/types.ts
export interface MultimediaDto {
  id_multimedia: number;
  url_view?: string | null;
  url_original?: string | null;
  tipo?: string | null; // tipo_topico.description
}

export interface TopicDto {
  id_topico: number;
  titulo?: string | null;
  description?: string | null;
  puesto?: number | null; // orden.puesto
  multimedia: MultimediaDto[];
}

export interface OrderedTopicsResponse {
  id_group: number;
  topics: TopicDto[];
}
