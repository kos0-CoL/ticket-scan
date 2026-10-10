'use client';

import styles from './ModelPicker.module.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { ModelPickerProps, Model } from '../types';
import { modelCache, getModelCacheKey } from '../lib/cache';

export function ModelPicker({
  providerName,
  value,
  onChange,
  placeholder = 'Seleccionar modelo...',
  className = '',
  showFreeOnly: initialShowFreeOnly = false,
  onError,
  onLoad,
  disabled = false,
}: ModelPickerProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showFreeOnly, setShowFreeOnly] = useState(initialShowFreeOnly);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchModels = useCallback(async () => {
    const cacheKey = getModelCacheKey(providerName);
    const cached = modelCache.get(cacheKey);
    
    if (cached) {
      setModels(cached);
      setLoadedFor(providerName);
      setError(null);
      onLoad?.(cached);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/providers/${providerName}/models`, {
        signal: abortControllerRef.current.signal,
      });
      
      if (!res.ok) {
        throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      const fetchedModels = data.models || [];
      
      modelCache.set(cacheKey, fetchedModels);
      setModels(fetchedModels);
      setLoadedFor(providerName);
      setError(null);
      onLoad?.(fetchedModels);
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const error = err;
        setError(error);
        onError?.(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [providerName, onError, onLoad]);

  useEffect(() => {
    fetchModels();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchModels]);

  const filteredModels = models.filter((model) => {
    const matchesSearch = 
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesFreeFilter = !showFreeOnly || 
      (model.pricing.input === 0 && model.pricing.output === 0);
    
    return matchesSearch && matchesFreeFilter;
  });

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setIsOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const selectedModel = models.find(m => m.id === value);

  const freeModelsCount = models.filter(m => m.pricing.input === 0 && m.pricing.output === 0).length;
  const hasFreeModels = freeModelsCount > 0;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${providerName} - ${placeholder}`}
        disabled={disabled}
      >
        <div className={styles.triggerContent}>
          <span className={styles.providerName}>{providerName}</span>
          <span className={styles.modelName}>
            {isLoading ? (
              <span className={styles.loadingText}>Cargando...</span>
            ) : error ? (
              <span className={styles.errorText}>Error al cargar</span>
            ) : (
              selectedModel?.name || value || placeholder
            )}
          </span>
        </div>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label={`Modelos de ${providerName}`}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar modelo..."
              value={search}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              disabled={disabled}
            />
            {hasFreeModels && (
              <label className={styles.freeFilterWrapper}>
                <input
                  type="checkbox"
                  className={styles.freeFilterCheckbox}
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                  disabled={disabled}
                />
                <span className={styles.freeFilterLabel}>
                  Solo gratuitos ({freeModelsCount})
                </span>
              </label>
            )}
          </div>
          
          {error && (
            <div className={styles.errorBanner}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Error al cargar modelos: {error.message}</span>
              <button 
                type="button" 
                className={styles.retryButton}
                onClick={fetchModels}
                disabled={isLoading}
              >
                Reintentar
              </button>
            </div>
          )}

          <div className={styles.list}>
            {filteredModels.length === 0 ? (
              <div className={styles.empty}>
                {isLoading ? (
                  <>
                    <div className={styles.spinner} aria-label="Cargando modelos" />
                    <span>Cargando modelos...</span>
                  </>
                ) : error ? (
                  <span>Error al cargar modelos</span>
                ) : models.length === 0 ? (
                  <span>No hay modelos disponibles</span>
                ) : (
                  <span>No se encontraron modelos</span>
                )}
              </div>
            ) : (
              filteredModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={`${styles.option} ${value === model.id ? styles.selected : ''} ${model.pricing.input === 0 && model.pricing.output === 0 ? styles.free : ''}`}
                  onClick={() => handleSelect(model.id)}
                  role="option"
                  aria-selected={value === model.id}
                  disabled={disabled}
                >
                  <div className={styles.optionHeader}>
                    <span className={styles.optionName}>{model.name}</span>
                    {model.pricing.input === 0 && model.pricing.output === 0 && (
                      <span className={styles.freeBadge}>Gratis</span>
                    )}
                  </div>
                  <span className={styles.optionMeta}>
                    {model.context_length.toLocaleString()} ctx •
                    {model.pricing.input === 0 && model.pricing.output === 0 ? (
                      'Gratis'
                    ) : (
                      `$${model.pricing.input}/$${model.pricing.output} por 1K`
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
          
          {models.length > 0 && (
            <div className={styles.footer}>
              <span className={styles.modelCount}>
                {filteredModels.length} de {models.length} modelos
                {showFreeOnly && ` (filtrados: ${freeModelsCount} gratuitos)`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ModelPicker.displayName = 'ModelPicker';