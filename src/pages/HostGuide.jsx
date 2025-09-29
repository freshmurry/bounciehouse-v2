import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, DollarSign, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { createPageUrl } from '@/utils';

const StepCard = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex items-start gap-6">
        <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Icon className="w-6 h-6 text-red-600" />
            </div>
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{children}</p>
        </div>
    </div>
);

export default function HostGuidePage() {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Button 
                    variant="ghost" 
                    onClick={() => navigate(createPageUrl("Home"))}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Button>
                
                <header className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Your Guide to Hosting</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Turn your bounce house into a successful side-hustle with BouncieHouse. Here's everything you need to know.</p>
                </header>

                <main className="space-y-8">
                    <StepCard icon={PlusCircle} title="1. Create Your Listing">
                        Showcase what makes your bounce house great. Upload high-quality photos from multiple angles, write a detailed description including dimensions and special features, and set your location. The more details you provide, the more likely guests are to book.
                    </StepCard>
                    
                    <StepCard icon={DollarSign} title="2. Set Your Pricing & Availability">
                        You're in control of your earnings. Set a competitive daily or hourly rate. Use our calendar to block off dates when your bounce house isn't available. Consider offering special pricing for weekdays or longer rentals to attract more customers.
                    </StepCard>

                    <StepCard icon={Sparkles} title="3. Prepare for Guests">
                        Cleanliness and safety are key. Before each rental, thoroughly inspect and clean your bounce house. Ensure all stakes, blowers, and extension cords are in excellent working condition. A great experience leads to great reviews.
                    </StepCard>

                    <StepCard icon={MessageCircle} title="4. Communicate Effectively">
                        Respond to booking requests and inquiries promptly. Clear and friendly communication builds trust. Confirm delivery times, setup location, and any special instructions with the guest before the event day.
                    </StepCard>
                    
                    <StepCard icon={Shield} title="5. Ensure a Safe Setup">
                        On the day of the rental, arrive on time for delivery. Set up the bounce house on a flat, clear surface away from power lines or hazards. Securely stake it to the ground and review all safety rules with the guest before you leave.
                    </StepCard>
                    
                    <div className="text-center pt-8">
                        <h2 className="text-3xl font-bold text-gray-900">Ready to Get Started?</h2>
                        <p className="mt-3 text-gray-600 text-lg">Join our community of hosts and start earning today!</p>
                        <Button 
                            size="lg"
                            onClick={() => navigate(createPageUrl("CreateListing"))}
                            className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg"
                        >
                            List Your Bounce House
                        </Button>
                    </div>
                </main>
            </div>
        </div>
    );
}