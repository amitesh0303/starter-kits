import { Hero } from '@/components/Hero';
import { Card } from '@/components/Card';
import styles from './page.module.css';

const highlights = [
  {
    title: 'Static Export',
    description: 'Generates plain HTML, CSS, and JS. Deploy anywhere.',
    href: '/projects',
  },
  {
    title: 'TypeScript',
    description: 'Full type safety across all pages and components.',
  },
  {
    title: 'CSS Modules',
    description: 'Scoped styles with zero runtime cost.',
  },
];

export default function HomePage() {
  return (
    <>
      <Hero
        title="Welcome to My Portfolio"
        subtitle="A simple static site built with Next.js, TypeScript, and CSS Modules."
      />
      <section className={styles.highlights}>
        <h2 className={styles.sectionTitle}>Highlights</h2>
        <div className={styles.grid}>
          {highlights.map((item) => (
            <Card
              key={item.title}
              title={item.title}
              description={item.description}
              href={item.href}
            />
          ))}
        </div>
      </section>
    </>
  );
}
