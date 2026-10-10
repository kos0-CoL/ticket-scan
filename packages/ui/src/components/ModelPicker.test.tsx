import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ModelPicker } from './ModelPicker';
import { modelCache, getModelCacheKey } from '../lib/cache';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

describe('ModelPicker', () => {
  const mockModels = [
    { id: 'model-1', name: 'Model One', context_length: 100000, pricing: { input: 1, output: 2 } },
    { id: 'model-2', name: 'Model Two', context_length: 200000, pricing: { input: 0, output: 0 } }, // Free model
    { id: 'model-3', name: 'Model Three', context_length: 300000, pricing: { input: 3, output: 4 } },
  ];

  const defaultProps = {
    providerName: 'openrouter',
    value: '',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    modelCache.clear();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders trigger with provider name and placeholder', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('openrouter')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar modelo...')).toBeInTheDocument();
  });

  it('fetches models on mount and caches them', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    // Open dropdown to see models
    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(screen.getByText('Model One')).toBeInTheDocument();
      expect(screen.getByText('Model Two')).toBeInTheDocument();
      expect(screen.getByText('Model Three')).toBeInTheDocument();
    });

    // Verify fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/providers/openrouter/models', expect.any(Object));
  });

  it('uses cached models on subsequent renders', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    const { unmount } = render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    unmount();

    // Render again - should use cache
    render(<ModelPicker {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(screen.getByText('Model One')).toBeInTheDocument();
    });

    // Fetch should only be called once (cached)
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('filters models by search query', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    // Search for "Two"
    const searchInput = screen.getByPlaceholderText('Buscar modelo...');
    fireEvent.change(searchInput, { target: { value: 'Two' } });

    await waitFor(() => {
      expect(screen.getByText('Model Two')).toBeInTheDocument();
      expect(screen.queryByText('Model One')).not.toBeInTheDocument();
      expect(screen.queryByText('Model Three')).not.toBeInTheDocument();
    });
  });

  it('shows free model filter when free models exist', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(screen.getByText('Solo gratuitos (1)')).toBeInTheDocument();
    });
  });

  it('filters to show only free models when checkbox is checked', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(screen.getByText('Solo gratuitos (1)')).toBeInTheDocument();
    });

    // Click the free filter checkbox
    const checkbox = screen.getByRole('checkbox', { name: /solo gratuitos/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByText('Model Two')).toBeInTheDocument();
      expect(screen.queryByText('Model One')).not.toBeInTheDocument();
      expect(screen.queryByText('Model Three')).not.toBeInTheDocument();
      expect(screen.getByText(/filtrados: 1 gratuitos/)).toBeInTheDocument();
    });
  });

  it('displays free badge on free models', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(screen.getByText('Gratis')).toBeInTheDocument();
    });
  });

  it('shows error state when fetch fails', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network error'));

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      // Check for error in the dropdown list
      expect(screen.getByText('Error al cargar modelos')).toBeInTheDocument();
      expect(screen.getByText('Reintentar')).toBeInTheDocument();
    });
  });

  it('calls onChange when model is selected', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Model One'));

    expect(defaultProps.onChange).toHaveBeenCalledWith('model-1');
  });

  it('shows selected model name in trigger', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} value="model-2" />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Model Two')).toBeInTheDocument();
  });

  it('disables interaction when disabled prop is true', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} disabled />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    const trigger = screen.getByRole('button', { name: /openrouter/i });
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);

    // Dropdown should not open
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('calls onLoad callback when models are loaded', async () => {
    const onLoad = vi.fn();
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ models: mockModels }),
    });

    render(<ModelPicker {...defaultProps} onLoad={onLoad} />);

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledWith(mockModels);
    });
  });

  it('calls onError callback when fetch fails', async () => {
    const onError = vi.fn();
    const error = new Error('Network error');
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(error);

    render(<ModelPicker {...defaultProps} onError={onError} />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando...')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /openrouter/i }));

    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error);
    });
  });
});

describe('modelCache', () => {
  beforeEach(() => {
    modelCache.clear();
  });

  it('sets and gets values', () => {
    modelCache.set('key1', { data: 'test' });
    expect(modelCache.get('key1')).toEqual({ data: 'test' });
  });

  it('returns null for non-existent keys', () => {
    expect(modelCache.get('nonexistent')).toBeNull();
  });

  it('expires entries after TTL', async () => {
    modelCache.set('key1', { data: 'test' }, 1); // 1ms TTL
    
    // Wait for expiration
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    
    // The entry should be expired (cleanup happens on get)
    expect(modelCache.get('key1')).toBeNull();
  });

  it('has method returns correct boolean', () => {
    modelCache.set('key1', { data: 'test' });
    expect(modelCache.has('key1')).toBe(true);
    expect(modelCache.has('key2')).toBe(false);
  });

  it('delete removes entries', () => {
    modelCache.set('key1', { data: 'test' });
    expect(modelCache.delete('key1')).toBe(true);
    expect(modelCache.get('key1')).toBeNull();
    expect(modelCache.delete('key1')).toBe(false);
  });

  it('clear removes all entries', () => {
    modelCache.set('key1', { data: 'test' });
    modelCache.set('key2', { data: 'test2' });
    modelCache.clear();
    expect(modelCache.get('key1')).toBeNull();
    expect(modelCache.get('key2')).toBeNull();
  });

  it('getModelCacheKey generates correct key', () => {
    expect(getModelCacheKey('openrouter')).toBe('models:openrouter');
    expect(getModelCacheKey('OpenAI')).toBe('models:openai');
  });
});