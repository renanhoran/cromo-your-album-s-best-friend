UPDATE public.trade_locations
SET descricao = NULL
WHERE descricao = 'Importado / pendente de validação';

INSERT INTO public.trade_locations (nome, endereco, cidade, estado, tipo, lat, lng, horario, descricao, ativo) VALUES
('Oxxo Shopping Iguatemi Campinas', 'Av. Iguatemi, 777 - Loja Oxxo, Campinas', 'Campinas', 'SP', 'ponto_fixo', -22.8996, -47.0567, 'Seg-Dom 8h-22h', 'Ponto oficial Oxxo/Panini. Mesas externas disponíveis para troca.', true),
('Oxxo Campinas Centro', 'R. General Osório, 1200, Campinas', 'Campinas', 'SP', 'ponto_fixo', -22.9056, -47.0608, 'Seg-Dom 7h-23h', 'Ponto oficial Oxxo/Panini.', true),
('Banca Figurinhas - Galeria Metrópolis', 'R. Dr. Quirino, 1400, Campinas', 'Campinas', 'SP', 'ponto_fixo', -22.9048, -47.0589, 'Seg-Sáb 9h-19h', 'Banca de revistas com ponto de troca informal.', true);
