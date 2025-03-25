import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Store, CheckCircle, AlertCircle, Info } from "lucide-react";

// Vendor registration form schema
const vendorRegistrationSchema = z.object({
  storeName: z.string().min(3, { message: "Store name must be at least 3 characters" }),
  storeDescription: z.string().min(20, { message: "Please provide a more detailed store description (min 20 characters)" }),
  logo: z.string().url({ message: "Please enter a valid URL for your logo" }).optional().or(z.literal("")),
  banner: z.string().url({ message: "Please enter a valid URL for your banner" }).optional().or(z.literal("")),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Please enter your business address" }),
  businessRegistrationNumber: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
});

type VendorRegistrationFormValues = z.infer<typeof vendorRegistrationSchema>;

const VendorRegistration: React.FC = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Check if user is logged in
  if (!user) {
    navigate("/auth/login?redirect=/vendor/register");
    return null;
  }

  const form = useForm<VendorRegistrationFormValues>({
    resolver: zodResolver(vendorRegistrationSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      logo: "",
      banner: "",
      phoneNumber: "",
      address: "",
      businessRegistrationNumber: "",
      taxIdentificationNumber: "",
    }
  });

  const onSubmit = async (data: VendorRegistrationFormValues) => {
    try {
      // Create the vendor profile
      await apiRequest("POST", "/api/vendors", {
        ...data,
        userId: user.id
      });

      toast({
        title: "Registration submitted successfully!",
        description: "Your vendor application has been submitted and is pending approval.",
      });

      // Redirect to a confirmation page
      navigate("/vendor/pending-approval");
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-center mb-6">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-100 p-3 rounded-full text-primary-600 mb-4">
              <Store className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Become a Vendor</h1>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Join our marketplace and start selling your products to customers worldwide.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Important Information</AlertTitle>
          <AlertDescription>
            Your vendor application will be reviewed by our team. You'll be notified once your account is approved.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Registration</CardTitle>
            <CardDescription>
              Provide details about your business to get started selling on our platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Store Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="storeName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name*</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Store Name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This will be displayed to customers on your store page and products.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="storeDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Description*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell customers about your store, products, and what makes you unique..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/logo.png" {...field} />
                          </FormControl>
                          <FormDescription>
                            Square image, minimum 200x200 pixels.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="banner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Store Banner URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/banner.jpg" {...field} />
                          </FormControl>
                          <FormDescription>
                            Recommended size: 1200x300 pixels.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Business Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Phone Number*</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address*</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Full business address" 
                            className="min-h-[80px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessRegistrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Registration Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} />
                          </FormControl>
                          <FormDescription>
                            If applicable in your region.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="taxIdentificationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Identification Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Optional" {...field} />
                          </FormControl>
                          <FormDescription>
                            For tax purposes.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button type="submit" className="w-full">
                    Submit Application
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col text-sm text-gray-500">
            <p>* Required fields</p>
            <p className="mt-2">By submitting this application, you agree to our Vendor Terms and Conditions.</p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VendorRegistration;