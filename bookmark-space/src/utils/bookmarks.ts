import type { BookmarkItem, BookmarkCardItem } from '../types';

export function flattenBookmarks(nodes: BookmarkItem[]): BookmarkCardItem[] {
  const result: BookmarkCardItem[] = [];

  const walk = (items: BookmarkItem[]) => {
    for (const item of items) {
      if (item.url) {
        result.push({
          id: item.id,
          title: item.title || item.url,
          url: item.url,
          parentId: item.parentId,
          dateAdded: item.dateAdded
        });
      }
      if (item.children?.length) walk(item.children);
    }
  };

  walk(nodes);
  return result;
}

export function getFolders(nodes: BookmarkItem[]) {
  const folders: { id: string; title: string }[] = [];
  const walk = (items: BookmarkItem[]) => {
    for (const item of items) {
      if (!item.url && item.children) {
        folders.push({ id: item.id, title: item.title || 'Untitled folder' });
        walk(item.children);
      }
    }
  };
  walk(nodes);
  return folders;
}

export function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\\./, '');
  } catch {
    return url;
  }
}

export function getFaviconUrl(url: string) {
  try {
    const host = new URL(url).origin;
    return `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(host)}&sz=64`;
  } catch {
    return '';
  }
}

/**
 * WordPress mShots creates a website screenshot from a URL.
 * This sends the bookmarked URL to that third-party service.
 * Set thumbnail previews off in the UI if you prefer not to share URLs.
 */
export function getThumbnailUrl(url: string) {
  return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=640`;
}

export function isWebUrl(url: string) {
  return /^https?:\\/\\//i.test(url);
}
