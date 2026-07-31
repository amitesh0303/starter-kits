import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { Card } from '@/components/Card';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A selection of projects I have worked on.',
};

const projects = [
  {
    title: 'Portfolio Site',
    description:
      'This very site! Built with Next.js, TypeScript, and CSS Modules. Statically exported for fast loading.',
  },
  {
    title: 'Weather Dashboard',
    description:
      'A responsive weather app built with React and a public API. Shows forecasts for any city.',
  },
  {
    title: 'Task Tracker',
    description:
      'A minimal to-do app with local storage persistence. Vanilla TypeScript, no frameworks.',
  },
];

export default function ProjectsPage() {
  return (
    <>
      <Hero title="Projects" subtitle="Things I have built." />
      <section className={styles.content}>
        <div className={styles.grid}>
          {projects.map((project) => (
            <Card
              key={project.title}
              title={project.title}
              description={project.description}
            />
          ))}
        </div>
      </section>
    </>
  );
}
