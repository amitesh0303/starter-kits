import type { Metadata } from 'next';
import { Hero } from '@/components/Hero';
import { SiteConfig } from '@/config';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with me.',
};

export default function ContactPage() {
  return (
    <>
      <Hero title="Contact" subtitle="Get in touch." />
      <section className={styles.content}>
        <p>
          Want to work together or just say hello? Send me an email at{' '}
          <a href={`mailto:${SiteConfig.contactEmail}`}>
            {SiteConfig.contactEmail}
          </a>
          .
        </p>
      </section>
    </>
  );
}
