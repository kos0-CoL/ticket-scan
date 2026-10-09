'use client';
import styles from './TabBar.module.css';
import type { ReactNode } from 'react';
import Link from 'next/link';

export interface TabItem {
  /** Route href */
  href: string;
  /** Display label */
  label: string;
  /** Icon (emoji, SVG, or ReactNode) */
  icon: ReactNode;
  /** Optional badge count */
  badge?: number;
  /** Whether this tab is currently active (auto-detected from pathname if not provided) */
  active?: boolean;
}

export interface TabBarProps {
  /** Array of tab items */
  items: TabItem[];
  /** Current pathname (for auto-active detection) */
  pathname?: string;
  /** Custom className */
  className?: string;
  /** Hide on certain paths */
  hideOnPaths?: string[];
  /** Custom render for tab item */
  renderItem?: (item: TabItem, isActive: boolean, index: number) => ReactNode;
}

export function TabBar({
  items,
  pathname = '/',
  className = '',
  hideOnPaths = [],
  renderItem,
}: TabBarProps) {
  const shouldHide = hideOnPaths.some(path =>
    pathname === path || (path.endsWith('*') && pathname.startsWith(path.slice(0, -1)))
  );

  if (shouldHide) return null;

  return (
    <nav className={`${styles.tabBar} ${className}`} aria-label="Navegación principal">
      {items.map((item, index) => {
        const isActive = item.active ?? (item.href === pathname || (item.href !== '/' && pathname.startsWith(item.href)));

        if (renderItem) {
          return (
            <div key={item.href} className={styles.tabItemRelative}>
              {renderItem(item, isActive, index)}
              {item.badge && item.badge > 0 && (
                <span className={styles.tabBadge}>{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''} ${styles.tabItemRelative}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.tabIcon} aria-hidden="true">{item.icon}</span>
            <span className={styles.tabLabel}>{item.label}</span>
            {item.badge && item.badge > 0 && (
              <span className={styles.tabBadge}>{item.badge > 99 ? '99+' : item.badge}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

TabBar.displayName = 'TabBar';

/** Safe area padding utility for content above tab bar */
export const TabBarSpacer = ({ className = '' }: { className?: string }) => (
  <div className={`${styles.tabBar} ${className}`} aria-hidden="true" style={{ pointerEvents: 'none' }} />
);