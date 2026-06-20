export type MediaProps = {
  id?: number;
  uniqueId: string;
  mediaPath: string;
  mediaType: string;
  notes?: string;
  addedOn?: number;
  modificationTime?: number; // Unix timestamp in milliseconds from device media library
};

export type AlbumWithStats = {
  id: number;
  name: string;
  createdOn: number;
  mediaCount: number;
  coverPath: string | null;
};
