export interface ReelItem {
  id: string;
  videoUrl: string;
  username: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views: string;
  hashtags: string[];
  duration: string;
}

export interface Comment {
  id: string;
  username: string;
  text: string;
  date: string;
  likes: number;
  avatar?: string;
  replies?: Comment[];
  parentId?: string;
}

export interface ReactionEmoji {
  emoji: string;
  label: string;
}