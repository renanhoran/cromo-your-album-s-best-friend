ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cpf_cnpj text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS address_number text,
  ADD COLUMN IF NOT EXISTS address_complement text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS province text,
  ADD COLUMN IF NOT EXISTS city text;