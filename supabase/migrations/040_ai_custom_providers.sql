-- ============================================================
-- 040_ai_custom_providers
--
-- Let an account point the BYO-key assistant at OpenAI-compatible
-- hosts (Groq, OpenRouter, Together, Ollama, Azure-compatible, …)
-- instead of only OpenAI / Anthropic.
--
--   1. Widen `ai_configs.provider` CHECK.
--   2. `ai_configs.base_url` — required when provider = 'custom';
--      ignored for presets (their URLs are hardcoded).
--
-- Idempotent — safe to run multiple times.
-- ============================================================

DO $$
DECLARE
  cname text;
BEGIN
  SELECT conname INTO cname
  FROM pg_constraint
  WHERE conrelid = 'public.ai_configs'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%provider%IN%';
  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE ai_configs DROP CONSTRAINT %I', cname);
  END IF;
END $$;

ALTER TABLE ai_configs
  ADD CONSTRAINT ai_configs_provider_check
  CHECK (provider IN ('openai', 'anthropic', 'groq', 'openrouter', 'custom'));

ALTER TABLE ai_configs
  ADD COLUMN IF NOT EXISTS base_url text;
