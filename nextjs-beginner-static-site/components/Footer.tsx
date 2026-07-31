import { SiteConfig } from '@/config';
import styles from './Footer.module.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <p>
        &copy; {year} {SiteConfig.author}. Built with Next.js.
      </p>
    </footer>
  );
}
