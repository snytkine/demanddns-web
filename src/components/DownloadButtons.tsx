import { DOWNLOADS } from '../config/site';
import { useLatestRelease } from '../hooks/useLatestRelease';
import { detectPlatform } from '../lib/platform';
import { formatSize } from '../lib/release';

interface DownloadButtonsProps {
  /** Show a note under the buttons when the latest version could not be looked up. */
  readonly showStatus?: boolean;
}

/**
 * Download buttons for each supported platform. The visitor's platform, when detected, is listed
 * first and highlighted.
 *
 * Each button first links to the releases page. Once GitHub reports the latest release, it links
 * straight to that platform's installer and shows the version, the file size and a link to the
 * SHA-256 checksum.
 */
export function DownloadButtons({ showStatus = false }: DownloadButtonsProps) {
  const detected = detectPlatform(typeof navigator === 'undefined' ? '' : navigator.userAgent);
  const { loading, release } = useLatestRelease();
  const ordered = [...DOWNLOADS].sort((a, b) => Number(b.platform === detected) - Number(a.platform === detected));
  return (
    <>
      <ul className="download-list">
        {ordered.map((option) => {
          const asset = release?.assets[option.platform];
          return (
            <li key={option.platform} className="download-card">
              <a
                className={`button${option.platform === detected ? ' button--primary' : ''}`}
                href={asset?.url ?? option.url}
                rel="noreferrer"
              >
                {option.label}
              </a>
              <span className="download-card__req">{option.requirement}</span>
              {release && asset && (
                <span className="download-card__req">
                  Version {release.version} · {formatSize(asset.size)}
                  {asset.checksumUrl && (
                    <>
                      {' · '}
                      <a href={asset.checksumUrl} rel="noreferrer">
                        SHA-256
                      </a>
                    </>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      {showStatus && !loading && !release && (
        <p className="download-note" role="status">
          Could not check for the latest version. The buttons open the releases page, where you can pick the file for
          your computer.
        </p>
      )}
    </>
  );
}
