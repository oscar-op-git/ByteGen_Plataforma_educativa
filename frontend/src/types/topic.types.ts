export type TopicVariant = 'basic' | 'slides';

export interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'image' | 'slides'
  content: string;
  language?: string;
}

export interface Topic {
  id: string;
  title: string;
  variant?: TopicVariant;
  blocks: ContentBlock[];
}