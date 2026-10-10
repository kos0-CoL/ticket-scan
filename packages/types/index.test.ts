import { describe, it, expect } from 'vitest';
import type { User, Ticket, MLProvider, LandingSection, AnalyticsData } from '../index';

describe('types', () => {
  describe('User', () => {
    it('accepts valid user', () => {
      const user: User = {
        id: '1',
        email: 'test@test.com',
        role: 'user',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };
      expect(user.email).toBe('test@test.com');
    });

    it('requires role to be admin or user', () => {
      const user: User = {
        id: '1',
        email: 'test@test.com',
        role: 'admin',
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };
      expect(['admin', 'user']).toContain(user.role);
    });
  });

  describe('Ticket', () => {
    it('accepts valid ticket', () => {
      const ticket: Ticket = {
        id: '1',
        user_id: '1',
        comercio: 'Carrefour',
        fecha: '2025-01-15',
        total: 1000,
        fuente: 'camera',
        created_at: '2025-01-15',
        updated_at: '2025-01-15',
      };
      expect(ticket.comercio).toBe('Carrefour');
    });
  });

  describe('MLProvider', () => {
    it('accepts valid provider', () => {
      const provider: MLProvider = {
        id: '1',
        name: 'OpenRouter',
        api_key_encrypted: 'encrypted',
        default_model: 'gemini-1.5-flash',
        fallback_order: 1,
        is_active: true,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };
      expect(provider.name).toBe('OpenRouter');
    });
  });

  describe('LandingSection', () => {
    it('accepts valid section', () => {
      const section: LandingSection = {
        id: '1',
        key: 'hero',
        title: 'Hero',
        content: {},
        enabled: true,
        sort_order: 1,
        created_at: '2025-01-01',
        updated_at: '2025-01-01',
      };
      expect(section.key).toBe('hero');
    });
  });

  describe('AnalyticsData', () => {
    it('has correct structure', () => {
      const data: AnalyticsData = {
        currentMonth: { total: 1000, count: 5, average: 200 },
        previousMonth: { total: 800, count: 4, average: 200 },
        monthlyTrend: [],
        byCategory: [],
        topMerchants: [],
      };
      expect(data.currentMonth.total).toBe(1000);
    });
  });
});