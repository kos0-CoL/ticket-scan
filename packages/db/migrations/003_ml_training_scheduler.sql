-- Sprint 4: ML Training Job Scheduler (pg_cron)
-- Runs weekly on Sunday at 2:00 AM UTC

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the training job
SELECT cron.schedule(
  'weekly-ml-training',
  '0 2 * * 0', -- Every Sunday at 2:00 AM UTC
  $$
  DO $$
  DECLARE
    selected_feedback jsonb;
    training_job_id uuid;
    model_version text := 'v' || to_char(now(), 'YYYYMMDD') || '_' || floor(random() * 1000)::text;
  BEGIN
    -- Create training job record
    INSERT INTO ml_training_jobs (status, model_name, model_version, config, started_at)
    VALUES ('running', 'ticket_categorizer', model_version, 
      jsonb_build_object(
        'trigger', 'weekly_scheduled',
        'feedback_count', (
          SELECT count(*) FROM feedback_images 
          WHERE selected_for_training = true 
          AND (training_job_id IS NULL OR training_job_id NOT IN (
            SELECT id FROM ml_training_jobs WHERE status IN ('running', 'completed')
          ))
        )
      ),
      now()
    ) RETURNING id INTO training_job_id;

    -- Get selected feedback for this training run
    SELECT jsonb_agg(to_jsonb(fi)) INTO selected_feedback
    FROM feedback_images fi
    WHERE fi.selected_for_training = true
    AND (fi.training_job_id IS NULL OR fi.training_job_id NOT IN (
      SELECT id FROM ml_training_jobs WHERE status IN ('running', 'completed')
    ));

    -- Link feedback to training job
    INSERT INTO ml_training_jobs_feedback (job_id, feedback_id)
    SELECT training_job_id, jsonb_array_elements_text(selected_feedback::jsonb -> 'id')
    ON CONFLICT DO NOTHING;

    -- Update feedback records with training_job_id
    UPDATE feedback_images
    SET training_job_id = training_job_id
    WHERE selected_for_training = true
    AND (training_job_id IS NULL OR training_job_id NOT IN (
      SELECT id FROM ml_training_jobs WHERE status IN ('running', 'completed')
    ));

    -- Simulate training completion (in reality, this would trigger an external ML pipeline)
    -- For now, mark as completed with mock metrics
    PERFORM pg_sleep(1); -- placeholder for actual training

    UPDATE ml_training_jobs
    SET status = 'completed',
        completed_at = now(),
        metrics = jsonb_build_object(
          'accuracy', 0.92 + random() * 0.05,
          'f1_score', 0.89 + random() * 0.05,
          'training_samples', jsonb_array_length(selected_feedback),
          'cost_usd', round((random() * 5 + 1)::numeric, 2)
        ),
        model_path = 'models/ticket_categorizer_' || model_version || '.onnx'
    WHERE id = training_job_id;

  EXCEPTION WHEN OTHERS THEN
    UPDATE ml_training_jobs
    SET status = 'failed',
        completed_at = now(),
        metrics = jsonb_build_object('error', SQLERRM)
    WHERE id = training_job_id;
  END;
  $$
);

-- Manual trigger function
CREATE OR REPLACE FUNCTION trigger_manual_training()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  PERFORM cron.schedule('manual-ml-training-' || floor(random() * 1000000)::text, '0 0 0 0 0 *', 
    $$
    SELECT trigger_ml_training();
    $$);
END;
$$;

-- View training job history
CREATE OR REPLACE VIEW v_training_job_history AS
SELECT 
  id,
  model_name,
  model_version,
  status,
  config,
  metrics,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at))::int as duration_seconds
FROM ml_training_jobs
ORDER BY started_at DESC;