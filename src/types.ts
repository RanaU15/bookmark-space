export interface BookmarkItem {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkItem[];
  parentId?: string;
  dateAdded?: number;
}

export interface BookmarkCardItem {
  id: string;
  title: string;
  url: string;
  parentId?: string;
  dateAdded?: number;
}
