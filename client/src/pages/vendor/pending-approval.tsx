import React from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClockIcon, HomeIcon, ArrowRightIcon } from "lucide-react";

const VendorPendingApproval: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto bg-yellow-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Application Under Review</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">
            Thank you for applying to become a vendor on our platform! Your application is currently being reviewed by our team.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 my-4">
            <h3 className="font-medium text-gray-700 mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 text-left space-y-2">
              <li className="flex items-start">
                <ArrowRightIcon className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>Our team will review your application within 1-2 business days.</span>
              </li>
              <li className="flex items-start">
                <ArrowRightIcon className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>You'll receive an email notification about the status of your application.</span>
              </li>
              <li className="flex items-start">
                <ArrowRightIcon className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <span>Once approved, you'll gain access to the vendor dashboard where you can add products and start selling.</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            If you have any questions, please contact our support team at <a href="mailto:support@example.com" className="text-primary hover:underline">support@example.com</a>
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/">
            <Button variant="outline" className="mr-2">
              <HomeIcon className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VendorPendingApproval;