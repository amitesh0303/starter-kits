import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn more about me and my background.',
};

export default function AboutPage() {
  return (
    <>
      <Hero title="About Me" subtitle="A little background on who I am." />
      <section className={styles.content}>
        <p>
          Hi! I am a developer who enjoys building clean, performant websites.
          This portfolio is built with Next.js and exported as a fully static
          site that can be deployed anywhere.
        </p>
        <p>
          I focus on accessible, responsive design and believe in shipping fast,
          lightweight pages without unnecessary JavaScript.
        </p>
      </section>
    </>
  );
}
