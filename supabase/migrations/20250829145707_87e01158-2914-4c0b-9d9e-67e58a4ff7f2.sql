-- Add structured address support to appointments table
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS structured_address JSONB,
ADD COLUMN IF NOT EXISTS coordinates POINT;

-- Create index for better performance on coordinates
CREATE INDEX IF NOT EXISTS idx_appointments_coordinates ON appointments USING GIST(coordinates);

-- Add structured address support for contact submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  organization TEXT,
  address TEXT,
  structured_address JSONB,
  coordinates POINT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_submissions
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for contact_submissions
CREATE POLICY "Anyone can submit contact forms" 
ON contact_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can view contact submissions" 
ON contact_submissions 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Service role can manage contact submissions" 
ON contact_submissions 
FOR ALL 
USING (true);

-- Create trigger for automatic timestamp updates on contact_submissions
CREATE TRIGGER update_contact_submissions_updated_at
BEFORE UPDATE ON contact_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();