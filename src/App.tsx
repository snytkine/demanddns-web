import { Route, Routes } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { NetworkBackground } from './components/NetworkBackground';
import { PageTransition } from './components/PageTransition';
import { useTheme } from './hooks/useTheme';
import { DownloadPage } from './pages/DownloadPage';
import { HomePage } from './pages/HomePage';
import { MarkdownPage } from './pages/MarkdownPage';
import { ReleaseNotesPage } from './pages/ReleaseNotesPage';
import documentation from './content/documentation.md?raw';
import features from './content/features.md?raw';
import tutorials from './content/tutorials.md?raw';

export function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <NetworkBackground />
      <div className="app">
        <Header theme={theme} onToggleTheme={toggleTheme} />
        <main className="main">
          <PageTransition>
            {(location) => (
              <Routes location={location}>
                <Route path="/" element={<HomePage theme={theme} />} />
                <Route path="/features" element={<MarkdownPage content={features} />} />
                <Route path="/documentation" element={<MarkdownPage content={documentation} />} />
                <Route path="/tutorials" element={<MarkdownPage content={tutorials} />} />
                <Route path="/download" element={<DownloadPage />} />
                <Route path="/release-notes" element={<ReleaseNotesPage />} />
                <Route
                  path="*"
                  element={<MarkdownPage content={'# Page not found\n\nGo back to the [home page](/).'} />}
                />
              </Routes>
            )}
          </PageTransition>
        </main>
        <Footer />
      </div>
    </>
  );
}
