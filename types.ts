export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface EditableBlock {
  id: string;
  type: 'text' | 'image';
  content: string;
  bbox: BoundingBox;
}