-- Tabela de registro de consentimentos LGPD (auditável)
CREATE TABLE public.lgpd_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL,
  versao TEXT NOT NULL,
  aceito BOOLEAN NOT NULL DEFAULT true,
  user_agent TEXT,
  origem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_lgpd_consents_user_tipo ON public.lgpd_consents (user_id, tipo, created_at DESC);

ALTER TABLE public.lgpd_consents ENABLE ROW LEVEL SECURITY;

-- Cada usuário só vê e cria seus próprios registros. Sem UPDATE/DELETE: registros de consentimento são imutáveis (auditoria LGPD).
CREATE POLICY "Users can read own consents"
ON public.lgpd_consents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own consents"
ON public.lgpd_consents FOR INSERT
WITH CHECK (auth.uid() = user_id);
