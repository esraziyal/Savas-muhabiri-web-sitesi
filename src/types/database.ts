export interface Database {
  public: {
    Tables: {
      interviews: {
        Row: {
          id: string;
          title: string;
          slug: string;
          interviewee_name: string;
          interviewee_photo: string;
          subtitle: string;
          header_image: string;
          content: ContentBlock[];
          is_highlighted: boolean;
          published_at: string;
          created_at: string;
          updated_at: string;
          author_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          interviewee_name: string;
          interviewee_photo: string;
          subtitle: string;
          header_image: string;
          content?: ContentBlock[];
          is_highlighted?: boolean;
          published_at?: string;
          created_at?: string;
          updated_at?: string;
          author_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          interviewee_name?: string;
          interviewee_photo?: string;
          subtitle?: string;
          header_image?: string;
          content?: ContentBlock[];
          is_highlighted?: boolean;
          published_at?: string;
          updated_at?: string;
          author_id?: string | null;
        };
      };
      comments: {
        Row: {
          id: string;
          interview_id: string;
          author_name: string;
          author_email: string;
          content: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          interview_id: string;
          author_name: string;
          author_email: string;
          content: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          interview_id?: string;
          author_name?: string;
          author_email?: string;
          content?: string;
          status?: 'pending' | 'approved' | 'rejected';
        };
      };
      hero_slides: {
        Row: {
          id: string;
          image_url: string;
          caption: string | null;
          title: string | null;
          subtitle: string | null;
          interview_slug: string | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          image_url: string;
          caption?: string | null;
          title?: string | null;
          subtitle?: string | null;
          interview_slug?: string | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          image_url?: string;
          caption?: string | null;
          title?: string | null;
          subtitle?: string | null;
          interview_slug?: string | null;
          order_index?: number;
          is_active?: boolean;
        };
      };
      war_correspondents: {
        Row: {
          id: string;
          name: string;
          title: string;
          photo_url: string;
          description: string;
          order_index: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          title: string;
          photo_url: string;
          description: string;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          title?: string;
          photo_url?: string;
          description?: string;
          order_index?: number;
          is_active?: boolean;
        };
      };
    };
  };
}

export type ContentBlock =
  | { type: 'paragraph'; content: string; align?: 'left' | 'center' | 'right' }
  | { type: 'heading'; content: string; level: 2 | 3 }
  | { type: 'image'; url: string; caption?: string; align?: 'left' | 'center' | 'right' }
  | { type: 'link'; text: string; url: string };
  | { type: 'spot'; content: string; align?: 'left' | 'center' | 'right' };


export type Interview = Database['public']['Tables']['interviews']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type HeroSlide = Database['public']['Tables']['hero_slides']['Row'];
export type WarCorrespondent = Database['public']['Tables']['war_correspondents']['Row'];


