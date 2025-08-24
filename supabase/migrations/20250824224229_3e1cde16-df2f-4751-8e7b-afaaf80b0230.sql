-- Create orders table to track digital product purchases
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE,
  product_name TEXT NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending',
  download_url TEXT,
  download_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (user_id = auth.uid() OR customer_email = auth.email());

-- Edge functions can manage orders
CREATE POLICY "Service role can manage orders" 
ON public.orders 
FOR ALL 
USING (true);

-- Create storage bucket for digital products
INSERT INTO storage.buckets (id, name, public) 
VALUES ('digital-products', 'digital-products', false);

-- RLS policies for digital products storage
CREATE POLICY "Admins can upload digital products" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'digital-products' AND auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Purchased products access" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'digital-products' AND 
  name IN (
    SELECT download_url FROM public.orders 
    WHERE (user_id = auth.uid() OR customer_email = auth.email()) 
    AND status = 'completed'
    AND download_expires_at > now()
  )
);

-- Create trigger for timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();