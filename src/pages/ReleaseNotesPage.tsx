import { Markdown } from '../components/Markdown';
import { ALL_RELEASES_URL } from '../config/site';
import intro from '../content/release-notes.md?raw';
import { useReleaseNotes } from '../hooks/useReleaseNotes';
import { formatReleaseDate } from '../lib/releaseNotes';

/**
 * Release notes page. It asks GitHub for the newest published releases and shows the notes of each
 * one, newest first. When GitHub cannot be reached it points to the releases page instead.
 */
export function ReleaseNotesPage() {
  const { loading, releases } = useReleaseNotes();
  return (
    <article className="glass panel prose">
      <Markdown content={intro} />
      {loading && (
        <p className="download-note" role="status">
          Loading the release notes…
        </p>
      )}
      {!loading && !releases && (
        <p className="download-note" role="status">
          Could not load the release notes. You can read them on the{' '}
          <a href={ALL_RELEASES_URL} target="_blank" rel="noreferrer noopener">
            releases page
          </a>
          .
        </p>
      )}
      {releases?.length === 0 && <p className="download-note">No version has been released yet.</p>}
      {releases?.map((release) => (
        <section key={release.version} className="release" aria-labelledby={`release-${release.version}`}>
          <h2 id={`release-${release.version}`}>Version {release.version}</h2>
          <p className="release__meta">
            {release.publishedAt && <>{formatReleaseDate(release.publishedAt)} · </>}
            <a href={release.url} target="_blank" rel="noreferrer noopener">
              View on GitHub
            </a>
          </p>
          {release.body.trim() ? (
            <Markdown content={release.body} />
          ) : (
            <p>No release notes were written for this version.</p>
          )}
        </section>
      ))}
      <p className="release-more">
        <a href={ALL_RELEASES_URL} target="_blank" rel="noreferrer noopener">
          Older releases
        </a>
      </p>
    </article>
  );
}
