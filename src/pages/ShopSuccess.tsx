import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/ui/navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Download, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ShopSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [downloadUrls, setDownloadUrls] = useState<any[]>([]);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('verify-payment', {
          body: { sessionId }
        });

        if (error) throw error;

        setOrder(data.order);
        setDownloadUrls(data.downloadUrls || []);
        
        toast({
          title: "Payment Successful!",
          description: "Your digital product is ready for download.",
        });
      } catch (error) {
        console.error('Verification error:', error);
        toast({
          title: "Verification Error",
          description: "Unable to verify payment. Please contact support.",
          variant: "destructive"
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId, toast]);

  if (verifying) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16">
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-2">Verifying your payment...</h1>
            <p className="text-muted-foreground">Please wait while we process your order.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!sessionId || !order) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-16">
          <div className="max-w-4xl mx-auto px-4 py-20 text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Order</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find your order. Please check your email or contact support.
            </p>
            <Link to="/shop">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-16">
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
              <h1 className="text-4xl font-heading font-bold mb-4">
                Payment Successful!
              </h1>
              <p className="text-lg text-muted-foreground">
                Thank you for supporting The Ivy Project. Your digital product is ready for download.
              </p>
            </div>

            <Card className="shadow-warm border-border/50 mb-8">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Order #{order.id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Product:</span>
                    <span>{order.product_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Amount:</span>
                    <span>${(order.amount / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Status:</span>
                    <span className="text-green-600 font-medium">Completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Download Access:</span>
                    <span>30 days from purchase</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {downloadUrls.length > 0 && (
              <Card className="shadow-warm border-border/50 mb-8">
                <CardHeader>
                  <CardTitle>Download Your Digital Product</CardTitle>
                  <CardDescription>
                    Click the download link below to access your digital product. 
                    Links are valid for 24 hours and will be resent to your email.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {downloadUrls.map((download, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center space-x-3">
                          <Download className="w-5 h-5 text-primary" />
                          <span className="font-medium">{download.filename}</span>
                        </div>
                        <Button asChild>
                          <a href={download.url} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                A confirmation email has been sent to {order.customer_email} with your download links.
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/shop">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Shop
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="golden">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default ShopSuccessPage;