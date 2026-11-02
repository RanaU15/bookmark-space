import { Bookmark, Folder, Globe, Settings, Sparkles } from 'lucide-react';
import type { BookmarkItem } from '../types';

interface Props {
  folders: { id: string; title: string }[];
  selectedFolder: string;
  onSelect: (id: string) => void;
  total: number;
  onSettings: () => void;
}

export default function Sidebar({ folders, selectedFolder, onSelect, total, onSettings }: Props) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Bookmark size={20} /></div>
        <div><b>Bookmark Space</b><small>Your web, organized</small></div>
      </div>
      <div className="side-label">LIBRARY</div>
      <button className={`nav-item ${selectedFolder === 'all' ? 'active' : ''}`} onClick={() => onSelect('all')}>
        <Globe size={17} /><span>All bookmarks</span><em>{total}</em>
      </button>
      <div className="side-label folder-label">YOUR FOLDERS</div>
      <div className="folder-list">
        {folders.map(folder => (
          <button key={folder.id} className={`nav-item ${selectedFolder === folder.id ? 'active' : ''}`}
            onClick={() => onSelect(folder.id)} title={folder.title}>
            <Folder size={16} /><span>{folder.title}</span>
          </button>
        ))}
        {folders.length === 0 && <p className="empty-folders">Your Chrome folders will appear here.</p>}
      </div>
      <div className="sidebar-bottom">
        <div className="tip"><Sparkles size={16} /><span>All your saved places, one space.</span></div>
        <button className="nav-item settings-button" onClick={onSettings}><Settings size={17} /><span>Settings</span></button>
      </div>
    </aside>
  );
}
