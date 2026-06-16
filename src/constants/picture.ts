export type MediaProps = {
  id?: number,
  uniqueId: string,
  mediaPath: string;
  mediaType: string;
  isAdded?: boolean;
  notes?: string;
  addedOn?: number;
};