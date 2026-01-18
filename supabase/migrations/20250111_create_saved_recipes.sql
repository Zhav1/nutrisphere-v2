-- Create saved_recipes table
create table if not exists public.saved_recipes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  
  -- Recipe data (from Groq response)
  recipe_title text not null,
  recipe_type text not null check (recipe_type in ('Hemat', 'Comfort', 'Mewah')),
  description text,
  total_calories integer,
  total_protein integer,
  shopping_cost integer not null,
  savings_vs_buying integer default 0,
  
  -- Ingredients (JSONB array)
  ingredients jsonb not null default '[]'::jsonb,
  
  -- Cooking steps (JSONB array)
  cooking_steps jsonb not null default '[]'::jsonb,
  
  -- Tools and metadata
  tools_required jsonb default '[]'::jsonb,
  is_rice_cooker_only boolean default false,
  
  -- User interaction
  is_favorite boolean default false,
  
  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  
  -- Constraints
  constraint unique_user_recipe unique(user_id, recipe_title)
);

-- Enable RLS
alter table public.saved_recipes enable row level security;

-- RLS Policies
-- Users can view their own recipes
create policy "Users can view own saved recipes"
  on public.saved_recipes
  for select
  using (auth.uid() = user_id);

-- Users can insert their own recipes
create policy "Users can insert own saved recipes"
  on public.saved_recipes
  for insert
  with check (auth.uid() = user_id);

-- Users can update their own recipes (e.g., toggle favorite)
create policy "Users can update own saved recipes"
  on public.saved_recipes
  for update
  using (auth.uid() = user_id);

-- Users can delete their own recipes
create policy "Users can delete own saved recipes"
  on public.saved_recipes
  for delete
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists saved_recipes_user_id_idx on public.saved_recipes(user_id);
create index if not exists saved_recipes_created_at_idx on public.saved_recipes(created_at desc);
create index if not exists saved_recipes_is_favorite_idx on public.saved_recipes(is_favorite) where is_favorite = true;

-- Function to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger update_saved_recipes_updated_at
  before update on public.saved_recipes
  for each row
  execute function update_updated_at_column();

-- Grant permissions
grant all on public.saved_recipes to authenticated;
grant all on public.saved_recipes to service_role;
