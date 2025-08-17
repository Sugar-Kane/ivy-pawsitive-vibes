import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Send, Save, Eye } from "lucide-react";

interface Newsletter {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'sent';
  created_at: string;
  sent_at?: string;
  sent_to_count?: number;
}

const AdminNewsletter = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [currentNewsletter, setCurrentNewsletter] = useState({ title: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchNewsletters();
    fetchSubscriberCount();
  }, []);

  const fetchNewsletters = async () => {
    const { data, error } = await supabase
      .from('newsletters')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch newsletters",
        variant: "destructive",
      });
    } else {
      setNewsletters((data || []) as Newsletter[]);
    }
  };

  const fetchSubscriberCount = async () => {
    const { count, error } = await supabase
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('verified', true);

    if (!error) {
      setSubscriberCount(count || 0);
    }
  };

  const saveNewsletter = async () => {
    if (!currentNewsletter.title.trim() || !currentNewsletter.content.trim()) {
      toast({
        title: "Error",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from('newsletters')
      .insert([{
        title: currentNewsletter.title,
        content: currentNewsletter.content,
        status: 'draft'
      }]);

    setIsLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save newsletter",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Newsletter saved as draft",
      });
      setCurrentNewsletter({ title: '', content: '' });
      fetchNewsletters();
    }
  };

  const sendNewsletter = async (newsletter: Newsletter) => {
    if (subscriberCount === 0) {
      toast({
        title: "No subscribers",
        description: "There are no verified subscribers to send to",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          newsletterId: newsletter.id,
          title: newsletter.title,
          content: newsletter.content
        }
      });

      if (error) throw error;

      toast({
        title: "Newsletter sent!",
        description: `Newsletter sent to ${data.sentCount} subscribers`,
      });

      fetchNewsletters();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send newsletter: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Newsletter Admin</h1>
          <p className="text-muted-foreground mt-2">
            Create and send newsletters to {subscriberCount} verified subscribers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Newsletter */}
          <Card>
            <CardHeader>
              <CardTitle>Create Newsletter</CardTitle>
              <CardDescription>Write and save your newsletter content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  value={currentNewsletter.title}
                  onChange={(e) => setCurrentNewsletter(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Newsletter title..."
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Content</label>
                <Textarea
                  value={currentNewsletter.content}
                  onChange={(e) => setCurrentNewsletter(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your newsletter content here..."
                  className="mt-1 min-h-[300px]"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={saveNewsletter} 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Newsletter List */}
          <Card>
            <CardHeader>
              <CardTitle>Newsletter History</CardTitle>
              <CardDescription>Manage your newsletters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsletters.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No newsletters yet. Create your first one!
                  </p>
                ) : (
                  newsletters.map((newsletter) => (
                    <div
                      key={newsletter.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-foreground">{newsletter.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            Created: {new Date(newsletter.created_at).toLocaleDateString()}
                          </p>
                          {newsletter.sent_at && (
                            <p className="text-sm text-muted-foreground">
                              Sent: {new Date(newsletter.sent_at).toLocaleDateString()} 
                              to {newsletter.sent_to_count} subscribers
                            </p>
                          )}
                        </div>
                        <Badge variant={newsletter.status === 'sent' ? 'default' : 'secondary'}>
                          {newsletter.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedNewsletter(newsletter)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                        {newsletter.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => sendNewsletter(newsletter)}
                            disabled={isSending}
                          >
                            {isSending ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-1" />
                                Send
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        {selectedNewsletter && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{selectedNewsletter.title}</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNewsletter(null)}
                  >
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {selectedNewsletter.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNewsletter;