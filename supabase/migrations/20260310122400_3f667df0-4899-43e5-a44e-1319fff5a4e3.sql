
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS note text NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS reminder_at timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS progetti_completati integer NOT NULL DEFAULT 0;
