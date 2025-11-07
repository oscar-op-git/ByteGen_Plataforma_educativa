export type TopicVariant = 'basic' | 'slides' | 'video';

export interface ContentBlock {
  id: string
  type: 'text' | 'code' | 'image' | 'slides' | 'video'
  content: string;
  language?: string;
}

export interface Topic {
  id: string;
  title: string;
  variant?: TopicVariant;
  blocks: ContentBlock[];
}