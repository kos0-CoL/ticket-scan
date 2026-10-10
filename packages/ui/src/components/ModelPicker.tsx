'use client';

import styles from './ModelPicker.module.css';
import { useState, useEffect } from 'react';
import type { ModelPickerProps } from '../types';

interface Model {
  id: string;
  name: string;
  context_length: number;
  pricing: { input: number; output: number };
}

export function ModelPicker({
  providerName,
  value,
  onChange,
  placeholder = 'Seleccionar modelo...',
  className = '',
}: ModelPickerProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  useEffect(() => {
    async function fetchModels() {
      if (loadedFor === providerName) return;
      try {
        const res = await fetch(`/api/providers/${providerName}/models`);
        if (res.ok) {
          const data = await res.json();
          setModels(data.models || []);
          setLoadedFor(providerName);
        }
      } catch (error) {
        console.error('Error loading models:', error);
      }
    }
    fetchModels();
  }, [providerName, loadedFor]);

  const filteredModels = models.filter((model) =>
    model.name.toLowerCase().includes(search.toLowerCase()) ||
    model.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (modelId: string) => {
    onChange(modelId);
    setIsOpen(false);
  };

  const selectedModel = models.find(m => m.id === value);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      <button
        type="button"
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${providerName} - ${placeholder}`}
      >
        <div className={styles.triggerContent}>
          <span className={styles.providerName}>{providerName}</span>
          <span className={styles.modelName}>
            {selectedModel?.name || value || placeholder}
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
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>
          <div className={styles.list}>
            {filteredModels.length === 0 ? (
              <div className={styles.empty}>
                {models.length === 0 ? 'Cargando modelos...' : 'No se encontraron modelos'}
              </div>
            ) : (
              filteredModels.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  className={`${styles.option} ${value === model.id ? styles.selected : ''}`}
                  onClick={() => handleSelect(model.id)}
                  role="option"
                  aria-selected={value === model.id}
                >
                  <span className={styles.optionName}>{model.name}</span>
                  <span className={styles.optionMeta}>
                    {model.context_length.toLocaleString()} ctx •
                    ${model.pricing.input}/${model.pricing.output} por 1K
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

ModelPicker.displayName = 'ModelPicker';