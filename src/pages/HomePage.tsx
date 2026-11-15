import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { GlassIcon } from '../components/GlassIcon';
import { Markdown } from '../components/Markdown';
import type { IconName } from '../config/site';
import type { Theme } from '../hooks/useTheme';
import home from '../content/home.md?raw';
import downloadCard from '../content/cards/download.md?raw';
import featuresCard from '../content/cards/features.md?raw';
import howItWorksCard from '../content/cards/how-it-works.md?raw';

// three.js is large; load it only when the home page is shown.
const NetworkScene = lazy(() => import('../components/NetworkScene'));

interface HomeCard {
  readonly icon: IconName;
  readonly content: string;
  readonly to: string;
  readonly linkLabel: string;
}

const cards: readonly HomeCard[] = [
  { icon: 'features', content: featuresCard, to: '/features', linkLabel: 'Explore features' },
  { icon: 'how-it-works', content: howItWorksCard, to: '/documentation', linkLabel: 'Read the documentation' },
  { icon: 'download', content: downloadCard, to: '/download', linkLabel: 'Get Command DNS' },
];

interface HomePageProps {
  readonly theme: Theme;
}

export function HomePage({ theme }: HomePageProps) {
  return (
    <>
      <section className="hero">
        <div className="hero__text prose">
          <Markdown content={home} />
          <div className="hero__actions">
            <Link className="button button--primary" to="/download">
              Download
            </Link>
            <Link className="button" to="/features">
              See features
            </Link>
          </div>
        </div>
        <div className="hero__scene">
          <Suspense fallback={<div className="scene scene--loading" />}>
            <NetworkScene theme={theme} />
          </Suspense>
        </div>
      </section>

      <section className="cards" aria-label="Overview">
        {cards.map((card) => (
          <div className="glass card" key={card.to}>
            <GlassIcon name={card.icon} size="large" />
            <div className="card__body">
              <Markdown content={card.content} />
            </div>
            <Link className="card__link" to={card.to}>
              {card.linkLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
        ))}
      </section>
    </>
  );
}
