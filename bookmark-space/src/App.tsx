import { useMemo, useState, useEffect } from 'react';
import { Bookmark, Search, SlidersHorizontal, Sun, Moon, RefreshCw, X, ExternalLink } from 'lucide-react';
import BookmarkCard from './components/BookmarkCard';
import Sidebar from './components/Sidebar';
import { useBookmarks } from './hooks/useBookmarks';
import type { BookmarkItem } from './types';

function findFolderBookmarkIds(nodes: BookmarkItem[], folderId: string): Set<string> {
  const ids = new Set<string>();
  const find = (items: BookmarkItem[]): boolean => {
    for (const item of items) {
      if (item.id === folderId) {
        const collect = (children: BookmarkItem[]) => children.forEach(child => {
          if (child.url) ids.add(child.id);
          if (child.children) collect(child.children);
        });
        collect(item.children || []);
        return true;
      }
      if (item.children && find(item.children)) return true;
    }
    return false;
  };
  find(nodes);
  return ids;
}

export default function App() {
  const { tree, bookmarks, folders, loading, error, refresh, isExtension } = useBookmarks();
  const [query, setQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [previewsEnabled, setPreviewsEnabled] = useState(true);

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage) return;
    chrome.storage.local.get(['theme', 'previewsEnabled'], (values) => {
      if (values.theme === 'light' || values.theme === 'dark') setTheme(values.theme);
      if (typeof values.previewsEnabled === 'boolean') setPreviewsEnabled(values.previewsEnabled);
    });
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ theme, previewsEnabled });
    }
  }, [theme, previewsEnabled]);

  const visibleBookmarks = useMemo(() => {
    let list = bookmarks;
    if (selectedFolder !== 'all') {
      const ids = findFolderBookmarkIds(tree, selectedFolder);
      list = list.filter(item => ids.has(item.id));
    }
    const normalized = query.trim().toLowerCase();
    if (normalized) {
      list = list.filter(item => item.title.toLowerCase().includes(normalized) || item.url.toLowerCase().includes(normalized));
    }
    return list;
  }, [bookmarks, query, selectedFolder, tree]);

  const selectedFolderName = folders.find(folder => folder.id === selectedFolder)?.title;
  const title = selectedFolder === 'all' ? 'All bookmarks' : selectedFolderName || 'Bookmarks';

  return (
    <div className="app-shell">
      <Sidebar folders={folders} selectedFolder={selectedFolder} onSelect={setSelectedFolder}
        total={bookmarks.length} onSettings={() => setSettingsOpen(true)} />
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>Library</span><b>/</b><strong>{title}</strong></div>
          <div className="top-actions">
            <button className="icon-button" title="Refresh bookmarks" onClick={refresh}><RefreshCw size={17} /></button>
            <button className="icon-button" title="Toggle theme" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </header>

        <section className="welcome">
          <div>
            <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PERSONAL WEB LIBRARY</div>
            <h1>Everything you saved.<br /><span>Right where you need it.</span></h1>
            <p>Your bookmarks, beautifully brought together.</p>
          </div>
          <div className="bookmark-count"><Bookmark size={17} /><strong>{bookmarks.length}</strong><span>saved links</span></div>
        </section>

        <section className="toolbar">
          <div className="search-box">
            <Search size={18} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search bookmarks or paste a URL..." />
            {query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={16} /></button>}
            <kbd>SEARCH</kbd>
          </div>
          <button className="filter-button" onClick={() => setSettingsOpen(true)}><SlidersHorizontal size={16} /> Preferences</button>
        </section>

        <div className="section-heading">
          <div><h2>{title}</h2><span>{visibleBookmarks.length} websites</span></div>
          <span className="sort-label">Synced with Chrome</span>
        </div>

        {loading ? <div className="state-message"><RefreshCw className="spin" /> Loading your bookmarks...</div> :
          error ? <div className="state-message error-state">{error}<p>Load the unpacked extension in Chrome and open a new tab.</p></div> :
          visibleBookmarks.length ? (
            <div className="bookmark-grid">
              {visibleBookmarks.map(bookmark => <BookmarkCard key={bookmark.id} bookmark={bookmark} previewsEnabled={previewsEnabled} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><Bookmark size={25} /></div>
              <h3>{query ? 'No matching bookmarks' : 'Nothing here yet'}</h3>
              <p>{query ? 'Try another search term.' : 'Bookmark a website in Chrome and it will appear here automatically.'}</p>
              {query && <button className="text-button" onClick={() => setQuery('')}>Clear search</button>}
            </div>
          )}
      </main>

      {settingsOpen && (
        <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <section className="settings-modal" onClick={event => event.stopPropagation()}>
            <div className="modal-heading"><div><span className="eyebrow">PERSONALIZE</span><h2>Settings</h2></div>
              <button className="icon-button" onClick={() => setSettingsOpen(false)}><X size={18} /></button></div>
            <div className="setting-row"><div><strong>Website thumbnails</strong><p>Load screenshot previews for bookmarked websites.</p></div>
              <button className={`toggle ${previewsEnabled ? 'on' : ''}`} onClick={() => setPreviewsEnabled(!previewsEnabled)} aria-label="Toggle website thumbnails"><i /></button></div>
            <div className="privacy-note"><strong>Thumbnail privacy</strong><p>Previews use WordPress mShots. The bookmarked URL is sent to that third-party service to generate a screenshot. Turn previews off to avoid this. Favicons are fetched separately from Google's favicon service.</p></div>
            <div className="setting-row"><div><strong>Appearance</strong><p>Choose your preferred theme.</p></div>
              <button className="theme-choice" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <><Sun size={15}/> Dark</> : <><Moon size={15}/> Light</>}</button></div>
            <button className="done-button" onClick={() => setSettingsOpen(false)}>Done</button>
          </section>
        </div>
      )}
      {!isExtension && <div className="dev-banner">Development preview: install the built extension in Chrome to load real bookmarks.</div>}
    </div>
  );
}
