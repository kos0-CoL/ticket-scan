import styles from './Card.module.css';
import type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps } from '../types';

const CardComponent = ({
  padded = false,
  elevated = false,
  noHover = false,
  className = '',
  children,
  ...props
}: CardProps) => (
  <div
    className={`${styles.card} ${padded ? styles.padded : ''} ${elevated ? styles.elevated : ''} ${noHover ? '' : styles.hover} ${className}`}
    {...props}
  >
    {children}
  </div>
);

CardComponent.displayName = 'Card';

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  return (
    <div className={`${styles.header} ${className}`} {...props}>
      <div>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

CardHeader.displayName = 'CardHeader';

export function CardContent({ className = '', children, ...props }: { className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`${styles.content} ${className}`} {...props}>
      {children}
    </div>
  );
}

CardContent.displayName = 'CardContent';

export function CardFooter({ justify = 'end', className = '', children, ...props }: { justify?: 'start' | 'center' | 'end' | 'between'; className?: string; children: React.ReactNode } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`${styles.footer} ${className}`}
      style={{ justifyContent: justify }}
      {...props}
    >
      {children}
    </div>
  );
}

CardFooter.displayName = 'CardFooter';

export const Card = Object.assign(CardComponent, {
  Header: CardHeader,
  Content: CardContent,
  Footer: CardFooter,
});