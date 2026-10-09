import styles from './Card.module.css';
import type { HTMLAttributes, ForwardRefExoticComponent, RefAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Add padding */
  padded?: boolean;
  /** Elevated shadow */
  elevated?: boolean;
  /** Disable hover effect */
  noHover?: boolean;
}

export interface CardCompound {
  Header: ForwardRefExoticComponent<CardHeaderProps & RefAttributes<HTMLDivElement>>;
  Content: ForwardRefExoticComponent<CardContentProps & RefAttributes<HTMLDivElement>>;
  Footer: ForwardRefExoticComponent<CardFooterProps & RefAttributes<HTMLDivElement>>;
}

export const Card = Object.assign(
  (({
    padded = false,
    elevated = false,
    noHover = false,
    className = '',
    children,
    ...props
  }: CardProps) => (
    <div
      className={`${styles.card} ${padded ? styles.padded : ''} ${elevated ? styles.elevated : ''} ${noHover ? '' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )) as ForwardRefExoticComponent<CardProps & RefAttributes<HTMLDivElement>> & CardCompound,
  { displayName: 'Card' }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export const CardHeader = Object.assign(
  (({ title, subtitle, action, children, className = '', ...props }: CardHeaderProps) => (
    <div className={`${styles.header} ${className}`} {...props}>
      <div>
        <h3 className={styles.title}>{title}</h3>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  )) as ForwardRefExoticComponent<CardHeaderProps & RefAttributes<HTMLDivElement>>,
  { displayName: 'CardHeader' }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = Object.assign(
  (({ className = '', children, ...props }: CardContentProps) => (
    <div className={`${styles.content} ${className}`} {...props}>
      {children}
    </div>
  )) as ForwardRefExoticComponent<CardContentProps & RefAttributes<HTMLDivElement>>,
  { displayName: 'CardContent' }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

export const CardFooter = Object.assign(
  (({ justify = 'end', className = '', children, ...props }: CardFooterProps) => (
    <div
      className={`${styles.footer} ${className}`}
      style={{ justifyContent: justify }}
      {...props}
    >
      {children}
    </div>
  )) as ForwardRefExoticComponent<CardFooterProps & RefAttributes<HTMLDivElement>>,
  { displayName: 'CardFooter' }
);

CardFooter.displayName = 'CardFooter';

/** Compound component */
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;