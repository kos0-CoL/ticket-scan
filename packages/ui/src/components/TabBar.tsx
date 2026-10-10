'use client';

import styles from './TabBar.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { TabBarProps, TabItem } from '../types';

export function TabBar({ items, pathname, hideOnPaths = ['/login', '/register'], className = '' }: TabBarProps) {
  const currentPath = pathname;
  const shouldHide = hideOnPaths.some(path => currentPath === path || currentPath.startsWith(path + '/'));

  if (shouldHide) return null;

  return (
    <nav
      className={`${styles.tabBar} ${className}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      {items.map((item) => {
        const isActive = currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href + '/'));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.tabItem} ${isActive ? styles.active : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.icon} aria-hidden="true">{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
            {item.badge && (
              <span className={styles.badge} aria-label={`${item.badge} notificaciones`}>
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBarSpacer({ className = '' }: { className?: string }) {
  return <div className={`${styles.spacer} ${className}`} aria-hidden="true" />;
}

TabBar.displayName = 'TabBar';
TabBarSpacer.displayName = 'TabBarSpacer';