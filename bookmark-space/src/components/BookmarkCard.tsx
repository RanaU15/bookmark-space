import { useState } from 'react';
import { ExternalLink, Globe } from 'lucide-react';
import type { BookmarkCardItem } from '../types';
import { getFaviconUrl, getHostname, getThumbnailUrl, isWebUrl } from '../utils/bookmarks';

interface Props {
  bookmark: BookmarkCardItem;
  previewsEnabled: boolean;
}

export default function BookmarkCard({ bookmark, previewsEnabled }: Props) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);
  const valid = isWebUrl(bookmark.url);
  const favicon = getFaviconUrl(bookmark.url);
  const thumbnail = getThumbnailUrl(bookmark.url);

  const openBookmark = () => {
    if (valid) window.open(bookmark.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <article className="bookmark-card" onClick={openBookmark} role="link" tabIndex={0}
      onKeyDown={(event) => { if (event.key === 'Enter') openBookmark(); }}>
      <div className="preview">
        {previewsEnabled && valid && !previewFailed ? (
          <img
            className="thumbnail"
            src={thumbnail}
            alt=""
            loading="lazy"
            onError={() => setPreviewFailed(true)}
          />
        ) : (
          <div className="preview-fallback">
            <span>{getHostname(bookmark.url).slice(0, 1).toUpperCase()}</span>
          </div>
        )}
        <div className="preview-shade" />
        <div className="card-open"><ExternalLink size={15} /></div>
      </div>
      <div className="card-details">
        <div className="favicon-wrap">
          {favicon && !faviconFailed
            ? <img src={favicon} alt="" onError={() => setFaviconFailed(true)} />
            : <Globe size={17} />}
        </div>
        <div className="card-copy">
          <strong title={bookmark.title}>{bookmark.title}</strong>
          <span title={bookmark.url}>{getHostname(bookmark.url)}</span>
        </div>
      </div>
    </article>
  );
}
