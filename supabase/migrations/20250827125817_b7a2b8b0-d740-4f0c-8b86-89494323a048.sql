-- Create photo_submissions table for gallery submissions
CREATE TABLE public.photo_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  photo_urls TEXT[] NOT NULL,
  event_date DATE NOT NULL,
  story TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_by_name TEXT,
  submitted_by_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.photo_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for photo submissions
CREATE POLICY "Anyone can submit photos" 
ON public.photo_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all submissions" 
ON public.photo_submissions 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update submissions" 
ON public.photo_submissions 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage submissions" 
ON public.photo_submissions 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_photo_submissions_updated_at
BEFORE UPDATE ON public.photo_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for photo submissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('photo-submissions', 'photo-submissions', false);

-- Create storage policies for photo submissions
CREATE POLICY "Anyone can upload photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'photo-submissions');

CREATE POLICY "Admins can view all photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'photo-submissions' AND is_admin(auth.uid()));

CREATE POLICY "Service role can manage photos" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'photo-submissions');

-- Update email_subscribers table to include gallery notifications preference
ALTER TABLE public.email_subscribers 
ADD COLUMN IF NOT EXISTS gallery_notifications BOOLEAN DEFAULT true;

-- Update notification preferences JSON structure
UPDATE public.email_subscribers 
SET notification_preferences = notification_preferences || '{"gallery_notifications": true}' 
WHERE notification_preferences IS NOT NULL;