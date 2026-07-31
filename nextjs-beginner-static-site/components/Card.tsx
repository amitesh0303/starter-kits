import Link from 'next/link';
import styles from './Card.module.css';

interface CardProps {
  title: string;
  description: string;
  href?: string;
}

export function Card({ title, description, href }: CardProps) {
  const content = (
    <div className={styles.card}>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.link}>
        {content}
      </Link>
    );
  }

  return content;
}
