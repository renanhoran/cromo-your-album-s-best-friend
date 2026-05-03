ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS asaas_payment_id text;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS premium_ate;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS asaas_subscription_id;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS periodo_assinatura;