import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { Icon } from '@iconify/react';
/* COMPONENTS */
import PageHeader from '@site/src/components/layout/PageHeader';
import SectionHeader from '@site/src/components/layout/SectionHeader';
/* PAGE DATA */
import operatingSystemData, { returnOperatingSystemData } from '@site/src/components/layout/HeroHeader/installOptions';
import { LATEST_VERSION, LATEST_DESKTOP_VERSION } from '@site/static/data/global';

type DownloadEntry = {
  title: string;
  subtitle?: string;
  icon?: string;
  path: string;
};

type OperatingSystem = {
  id: string;
  label: string;
  preferred: DownloadEntry;
  alt: DownloadEntry;
  third?: DownloadEntry;
  other: { path: string; text: string };
};

const header = {
  title: 'Download Podman',
  subtitle: `Direct downloads for the Podman CLI (v${LATEST_VERSION}) and Podman Desktop (v${LATEST_DESKTOP_VERSION}) on Windows, macOS, and Linux.`,
};

const isExternal = (path: string) => /^https?:\/\//.test(path);

const DownloadLink = ({ entry }: { entry: DownloadEntry }): JSX.Element => {
  const internalPath = useBaseUrl(entry.path.startsWith('/') ? entry.path : `/${entry.path}`);
  const href = isExternal(entry.path) ? entry.path : internalPath;
  return (
    <li>
      <a
        href={href}
        className="flex items-center gap-4 rounded-md bg-gray-50 px-4 py-3 text-purple-900 no-underline transition duration-150 ease-linear hover:bg-purple-700 hover:text-white hover:no-underline hover:shadow-md dark:bg-gray-700 dark:text-white dark:hover:bg-purple-900">
        {entry.icon && <Icon icon={entry.icon} className="text-4xl" />}
        <span>
          <span className="block font-semibold">{entry.title}</span>
          {entry.subtitle && <span className="block text-base">{entry.subtitle}</span>}
        </span>
      </a>
    </li>
  );
};

const PlatformCard = ({ os, recommended = false }: { os: OperatingSystem; recommended?: boolean }): JSX.Element => {
  const entries = [os.preferred, os.alt, os.third].filter(Boolean) as DownloadEntry[];
  return (
    <article
      className={`w-full max-w-md rounded-lg p-6 shadow-lg dark:bg-gray-900 ${
        recommended ? 'bg-purple-50 ring-2 ring-purple-700 dark:ring-purple-500' : 'bg-white'
      }`}>
      <header className="mb-4">
        <h3 className="text-purple-700 dark:text-purple-500">{os.label}</h3>
        {recommended && <p className="text-base text-gray-700 dark:text-gray-100">Detected as your platform</p>}
      </header>
      <ul className="flex list-none flex-col gap-3 pl-0">
        {entries.map(entry => (
          <DownloadLink key={entry.path} entry={entry} />
        ))}
      </ul>
      <p className="mt-4">
        <a href={useBaseUrl(`/${os.other.path}`)}>{os.other.text}</a>
      </p>
    </article>
  );
};

const RecommendedSection = (): JSX.Element => {
  return (
    <section>
      <SectionHeader
        title="Recommended for you"
        description="Detected from your browser. All other platforms are listed below."
        textColor="text-purple-700 dark:text-purple-500"
      />
      <div className="container mb-8 flex justify-center">
        <BrowserOnly fallback={<PlatformCard os={operatingSystemData[0] as OperatingSystem} recommended={true} />}>
          {() => {
            const detected = (returnOperatingSystemData() ?? operatingSystemData[0]) as OperatingSystem;
            return <PlatformCard os={detected} recommended={true} />;
          }}
        </BrowserOnly>
      </div>
    </section>
  );
};

const AllPlatformsSection = (): JSX.Element => {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-gray-100 pb-16 dark:from-gray-900 dark:to-gray-900">
      <SectionHeader
        title="All platforms"
        description="Podman CLI and Podman Desktop downloads for every supported operating system."
        textColor="text-blue-700 dark:text-blue-500"
      />
      <div className="container flex flex-wrap justify-center gap-8">
        {(operatingSystemData as OperatingSystem[]).map(os => (
          <PlatformCard key={os.id} os={os} />
        ))}
      </div>
    </section>
  );
};

function Downloads(): JSX.Element {
  return (
    <Layout title="Downloads" description={header.subtitle}>
      <PageHeader title={header.title} description={header.subtitle} />
      <RecommendedSection />
      <AllPlatformsSection />
    </Layout>
  );
}

export default Downloads;
