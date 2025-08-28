import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, Building, Phone, MapPin, CheckCircle2, Home, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import AddressAutocomplete from '@/components/AddressAutocomplete';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const appointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  contactNumber: z.string().min(10, 'Please enter a valid phone number'),
  location: z.string().min(5, 'Please enter a complete address'),
  appointmentDate: z.date({
    required_error: 'Please select a date',
  }),
  appointmentTime: z.string({
    required_error: 'Please select a time',
  }),
  notes: z.string().optional(),
});

type AppointmentForm = z.infer<typeof appointmentSchema>;

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00'
];

const AppointmentBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);
  const [structuredAddress, setStructuredAddress] = useState<any>(null); // Store structured address data
  const { toast } = useToast();
  
  const form = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  });

  const onSubmit = async (data: AppointmentForm) => {
    setIsSubmitting(true);
    
    try {
      // First, create the appointment
      const { data: appointmentData, error } = await supabase
        .from('appointments')
        .insert({
          name: data.name,
          business_name: data.businessName,
          contact_number: data.contactNumber,
          location: data.location,
          appointment_date: format(data.appointmentDate, 'yyyy-MM-dd'),
          appointment_time: data.appointmentTime,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send email notification to admin
      try {
        const { error: emailError } = await supabase.functions.invoke('send-appointment-notification', {
          body: {
            appointmentId: appointmentData.id,
            sendCustomerConfirmation: false // Can be enabled if customer email field is added
          }
        });
        
        if (emailError) {
          console.error('Email notification failed:', emailError);
          // Don't fail the whole process if email fails
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }

      setConfirmedBooking(data);
      setIsConfirmed(true);
      form.reset();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Booking Failed',
        description: 'There was an error booking your appointment. Please try again or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Show confirmation screen after successful booking
  if (isConfirmed && confirmedBooking) {
    return (
      <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50 text-center">
        <div className="mb-8">
          <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
          <h3 className="text-3xl font-heading font-bold mb-2 text-primary">
            Booking Confirmed!
          </h3>
          <p className="text-lg text-muted-foreground mb-6">
            Your visit with Ivy has been successfully scheduled.
          </p>
        </div>

        <div className="bg-accent/10 rounded-xl p-6 mb-8 border border-accent/20">
          <h4 className="font-semibold text-lg mb-4">Visit Details</h4>
          <div className="space-y-2 text-sm">
            <p><strong>Date:</strong> {format(confirmedBooking.appointmentDate, 'MMMM do, yyyy')}</p>
            <p><strong>Time:</strong> {confirmedBooking.appointmentTime}</p>
            <p><strong>Contact:</strong> {confirmedBooking.name}</p>
            <p><strong>Location:</strong> {confirmedBooking.location}</p>
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-6 mb-8 border border-primary/20">
          <h5 className="font-semibold text-sm mb-2 flex items-center justify-center">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            What happens next?
          </h5>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• We'll review your request within 24–48 hours</li>
            <li>• Our team will contact you to confirm details</li>
            <li>• We'll coordinate the perfect visit for your needs</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.location.href = '/'}
            className="flex items-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Website
          </Button>
          <Button 
            variant="golden" 
            size="lg"
            onClick={() => window.location.href = '/donate'}
            className="flex items-center"
          >
            <Heart className="w-5 h-5 mr-2" />
            Support Our Mission
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-3xl p-8 shadow-warm border border-border/50">
      <div className="mb-8">
        <h3 className="text-2xl font-heading font-bold mb-2 flex items-center">
          <CalendarIcon className="w-6 h-6 mr-3 text-primary" />
          Book Your Visit with Ivy
        </h3>
        <p className="text-muted-foreground">
          Schedule a therapy visit to bring comfort and joy to your facility or event.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                <User className="w-5 h-5 mr-2 text-primary" />
                Contact Information
              </h4>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business/Organization Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Hospital, nursing home, school, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(209) 819-9985" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Visit Details */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                Visit Details
              </h4>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complete Address *</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value || ''}
                        onChange={field.onChange}
                        onAddressSelect={setStructuredAddress}
                        placeholder="Street address, city, state, zip"
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Preferred Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={isDateDisabled}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Time *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Special requests, accessibility needs, or other important information..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="pt-4">
            <Button
              type="submit"
              variant="golden"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                'Booking Your Visit...'
              ) : (
                <>
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Book Visit with Ivy
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      <div className="mt-6 p-4 bg-accent/10 rounded-xl border border-accent/20">
        <h5 className="font-semibold text-sm mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-accent" />
          What happens next?
        </h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• We'll review your request within 24–48 hours</li>
          <li>• Our team will contact you to confirm details</li>
          <li>• We'll coordinate the perfect visit for your needs</li>
        </ul>
      </div>
    </div>
  );
};

export default AppointmentBooking;