-- ============================================================
-- 041_ai_custom_providers_fix
--
-- 040 dropped the provider CHECK using `IN (...)` in pg_get_constraintdef,
-- but Postgres stores the original as `= ANY (ARRAY[...])`, so the drop
-- no-op'd and ADD CONSTRAINT failed. Drop by name, then recreate +
-- add base_url.
-- ============================================================

ALTER TABLE ai_configs DROP CONSTRAINT IF EXISTS ai_configs_provider_check;

ALTER TABLE ai_configs
  ADD CONSTRAINT ai_configs_provider_check
  CHECK (provider IN ('openai', 'anthropic', 'groq', 'openrouter', 'custom'));

ALTER TABLE ai_configs
  ADD COLUMN IF NOT EXISTS base_url text;
