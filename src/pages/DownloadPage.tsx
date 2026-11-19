import { Link } from 'react-router-dom';
import { DownloadButtons } from '../components/DownloadButtons';
import { Markdown } from '../components/Markdown';
import { ALL_RELEASES_URL } from '../config/site';
import intro from '../content/download.md?raw';
import notes from '../content/download-notes.md?raw';

/**
 * Download page: an introduction, a button for each platform that links to the newest installer,
 * links to the release notes and to the older releases, and the notes for installing.
 */
export function DownloadPage() {
  return (
    <article className="glass panel prose">
      <Markdown content={intro} />
      <DownloadButtons showStatus />
      <p className="download-more">
        <Link to="/release-notes">Release notes</Link>
        <span aria-hidden="true"> · </span>
        <a href={ALL_RELEASES_URL} target="_blank" rel="noreferrer noopener">
          Older releases
        </a>
      </p>
      <Markdown content={notes} />
    </article>
  );
}
