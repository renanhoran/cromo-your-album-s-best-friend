UPDATE public.profiles
SET is_premium = false,
    plano = NULL,
    onboarding_concluido = true,
    teste_iniciado_em = now()
WHERE id = '4c3914c9-4162-4d91-b4c5-12a425a3fa30';
