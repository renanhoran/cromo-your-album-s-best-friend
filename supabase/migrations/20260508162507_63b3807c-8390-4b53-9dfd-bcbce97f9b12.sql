ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_importacao_concluido boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS aviso_camera_ocr_visto boolean DEFAULT false;