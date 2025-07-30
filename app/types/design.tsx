export interface LogoStyle {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  rotation?: number;
  textAlign?: string;
  textDecoration?: string;
  fontStyle?: string;
}

export interface SavedDesign {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  logos: Array<{
    id: string;
    type: 'image' | 'text';
    src?: string;
    content?: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    style?: LogoStyle;
    layer: number;
  }>;
  preview_image?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDesignRequest {
  name: string;
  description?: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  logos: Array<{
    id: string;
    type: 'image' | 'text';
    src?: string;
    content?: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    style?: LogoStyle;
    layer: number;
  }>;
  preview_image?: string;
}