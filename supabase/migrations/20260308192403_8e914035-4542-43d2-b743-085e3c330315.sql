ALTER TABLE public.profiles 
ADD COLUMN pdf_color_mode text NOT NULL DEFAULT 'gradient',
ADD COLUMN pdf_color_start text NOT NULL DEFAULT '#AAFF45',
ADD COLUMN pdf_color_end text NOT NULL DEFAULT '#FF6B1A';