import { useCallback, useEffect, useMemo, useState } from 'react';
import type { BookmarkItem } from '../types';
import { flattenBookmarks, getFolders } from '../utils/bookmarks';

const isExtension = typeof chrome !== 'undefined' && !!chrome.bookmarks;

export function useBookmarks() {
  const [tree, setTree] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(() => {
    if (!isExtension) {
      setError('Open this page as an installed Chrome extension to access bookmarks.');
      setLoading(false);
      return;
    }
    chrome.bookmarks.getTree((nodes) => {
      const runtimeError = chrome.runtime.lastError;
      if (runtimeError) {
        setError(runtimeError.message || 'Could not read bookmarks.');
      } else {
        setTree(nodes as BookmarkItem[]);
        setError('');
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();
    if (!isExtension) return;

    const changed = () => refresh();
    chrome.bookmarks.onCreated.addListener(changed);
    chrome.bookmarks.onRemoved.addListener(changed);
    chrome.bookmarks.onChanged.addListener(changed);
    chrome.bookmarks.onMoved.addListener(changed);
    chrome.bookmarks.onChildrenReordered.addListener(changed);
    chrome.bookmarks.onImportEnded.addListener(changed);

    return () => {
      chrome.bookmarks.onCreated.removeListener(changed);
      chrome.bookmarks.onRemoved.removeListener(changed);
      chrome.bookmarks.onChanged.removeListener(changed);
      chrome.bookmarks.onMoved.removeListener(changed);
      chrome.bookmarks.onChildrenReordered.removeListener(changed);
      chrome.bookmarks.onImportEnded.removeListener(changed);
    };
  }, [refresh]);

  const bookmarks = useMemo(() => flattenBookmarks(tree), [tree]);
  const folders = useMemo(() => getFolders(tree), [tree]);

  return { tree, bookmarks, folders, loading, error, refresh, isExtension };
}
