create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text,
  cidade text,
  avatar text default '⚽',
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create table public.user_stickers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  sticker_id text not null,
  count integer default 1 check (count >= 0),
  updated_at timestamptz default now(),
  unique(user_id, sticker_id)
);
alter table public.user_stickers enable row level security;
create policy "Users can manage own stickers" on public.user_stickers
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table public.trade_locations (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  endereco text,
  cidade text not null,
  estado text default 'SP',
  tipo text default 'ponto_fixo',
  lat numeric,
  lng numeric,
  horario text,
  descricao text,
  ativo boolean default true,
  created_by uuid references auth.users,
  data_evento timestamptz,
  created_at timestamptz default now()
);
alter table public.trade_locations enable row level security;
create policy "Anyone can read locations" on public.trade_locations
  for select using (true);
create policy "Auth users can create locations" on public.trade_locations
  for insert with check (auth.uid() = created_by);
create policy "Creators can update own locations" on public.trade_locations
  for update using (auth.uid() = created_by);

insert into public.trade_locations (nome, endereco, cidade, estado, tipo, lat, lng, horario, descricao) values
  ('Oxxo Shopping Iguatemi Campinas', 'Av. Iguatemi, 777 - Loja Oxxo, Campinas', 'Campinas', 'SP', 'ponto_fixo', -22.8996, -47.0567, 'Seg-Dom 8h-22h', 'Ponto oficial Oxxo/Panini. Mesas externas disponíveis para troca.'),
  ('Oxxo Campinas Centro', 'R. General Osório, 1200, Campinas', 'Campinas', 'SP', 'ponto_fixo', -22.9056, -47.0608, 'Seg-Dom 7h-23h', 'Ponto oficial Oxxo/Panini.'),
  ('Banca Figurinhas - Galeria Metrópolis', 'R. Dr. Quirino, 1400, Campinas', 'Campinas', 'SP', 'ponto_fixo', -22.9048, -47.0589, 'Seg-Sáb 9h-19h', 'Banca de revistas com ponto de troca informal.'),
  ('Praça Carlos Gomes - Encontrão Semanal', 'Praça Carlos Gomes, Centro, Campinas', 'Campinas', 'SP', 'evento', -22.9055, -47.0620, 'Sábados 9h-12h', 'Encontro semanal de colecionadores. Leve suas repetidas!'),
  ('Shopping Galeria - Campinas', 'R. Ferreira Penteado, 1, Campinas', 'Campinas', 'SP', 'ponto_fixo', -22.9050, -47.0601, 'Seg-Dom 10h-22h', 'Área de lazer do shopping com ponto de troca informal.'),
  ('Oxxo Paulínia Centro', 'Av. Prefeito Rodrigo Rigo, Paulínia', 'Paulínia', 'SP', 'ponto_fixo', -22.7620, -47.1535, 'Seg-Dom 7h-23h', 'Ponto oficial Oxxo/Panini em Paulínia.'),
  ('Praça Central de Paulínia', 'Praça Dr. Milton Gianini, Centro, Paulínia', 'Paulínia', 'SP', 'ponto_fixo', -22.7608, -47.1542, 'Fins de semana 9h-12h', 'Ponto informal de encontro de colecionadores da região.');