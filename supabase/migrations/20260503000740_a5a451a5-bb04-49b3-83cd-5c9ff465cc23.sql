ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS teste_iniciado_em timestamptz NOT NULL DEFAULT now();