-- Sprint 4: ML Metrics Tracking
-- Tracks OCR accuracy, categorization accuracy, and cost per request

-- ML Metrics table
CREATE TABLE IF NOT EXISTS ml_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type varchar(50) NOT NULL, -- 'ocr_accuracy', 'categorization_accuracy', 'cost', 'latency'
  provider_id uuid REFERENCES ml_providers(id) ON DELETE SET NULL,
  model_id varchar(100),
  value numeric NOT NULL,
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ml_metrics_type_idx ON ml_metrics(metric_type);
CREATE INDEX IF NOT EXISTS ml_metrics_provider_idx ON ml_metrics(provider_id);
CREATE INDEX IF NOT EXISTS ml_metrics_recorded_idx ON ml_metrics(recorded_at DESC);

-- View for daily aggregated metrics
CREATE OR REPLACE VIEW v_daily_ml_metrics AS
SELECT
  date_trunc('day', recorded_at) as day,
  metric_type,
  provider_id,
  model_id,
  count(*) as request_count,
  avg(value) as avg_value,
  min(value) as min_value,
  max(value) as max_value,
  sum(value) as sum_value,
  jsonb_object_agg(DISTINCT metric_type, jsonb_build_object(
    'count', count(*),
    'avg', round(avg(value)::numeric, 4),
    'sum', round(sum(value)::numeric, 4)
  )) as metrics_summary
FROM ml_metrics
GROUP BY date_trunc('day', recorded_at), metric_type, provider_id, model_id
ORDER BY day DESC;

-- View for provider performance comparison
CREATE OR REPLACE VIEW v_provider_performance AS
SELECT
  p.name as provider_name,
  p.default_model,
  COUNT(DISTINCT m.id) as total_requests,
  AVG(CASE WHEN m.metric_type = 'cost' THEN m.value END) as avg_cost_usd,
  AVG(CASE WHEN m.metric_type = 'latency' THEN m.value END) as avg_latency_ms,
  AVG(CASE WHEN m.metric_type = 'ocr_accuracy' THEN m.value END) as avg_ocr_accuracy,
  AVG(CASE WHEN m.metric_type = 'categorization_accuracy' THEN m.value END) as avg_cat_accuracy,
  SUM(CASE WHEN m.metric_type = 'cost' THEN m.value END) as total_cost_usd
FROM ml_providers p
LEFT JOIN ml_metrics m ON p.id = m.provider_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.default_model
ORDER BY total_requests DESC;

-- Function to record metric
CREATE OR REPLACE FUNCTION record_ml_metric(
  p_metric_type varchar,
  p_provider_id uuid DEFAULT NULL,
  p_model_id varchar DEFAULT NULL,
  p_value numeric,
  p_metadata jsonb DEFAULT '{}'
) RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO ml_metrics (metric_type, provider_id, model_id, value, metadata)
  VALUES (p_metric_type, p_provider_id, p_model_id, p_value, p_metadata);
END;
$$;