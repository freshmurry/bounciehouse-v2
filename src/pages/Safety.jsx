import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck, UserCheck, Wind, AlertTriangle, Phone } from 'lucide-react';
import { createPageUrl } from '@/utils';

const SafetyPoint = ({ icon: Icon, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
            <Icon className="w-8 h-8 text-red-600" />
        </div>
        <div>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-gray-600 mt-1 leading-relaxed">{children}</p>
        </div>
    </div>
);

export default function SafetyStandardsPage() {
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
                
                <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-gray-200">
                    <header className="text-center mb-12">
                        <ShieldCheck className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Trust & Safety</h1>
                        <p className="mt-4 text-lg text-gray-600">Your family's safety is our top priority. We've established these standards for every rental on BouncieHouse.</p>
                    </header>

                    <main className="space-y-10">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Commitment</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-red-50 p-6 rounded-lg">
                                    <h3 className="font-bold text-lg text-red-800 mb-2">For Our Hosts</h3>
                                    <p className="text-red-700">We require all hosts to adhere to strict maintenance and cleaning schedules, provide detailed safety instructions, and carry appropriate insurance coverage.</p>
                                </div>
                                <div className="bg-blue-50 p-6 rounded-lg">
                                    <h3 className="font-bold text-lg text-blue-800 mb-2">For Our Guests</h3>
                                    <p className="text-blue-700">We provide clear safety guidelines, a secure payment platform, and access to 24/7 support to ensure a worry-free rental experience from start to finish.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Safety Practices</h2>
                            <div className="space-y-8">
                                <SafetyPoint icon={ShieldCheck} title="Proper Anchoring">
                                    All bounce houses must be securely anchored to the ground using heavy-duty stakes for grass or sandbags for hard surfaces. This is critical to prevent tipping or movement, especially in windy conditions.
                                </SafetyPoint>
                                <SafetyPoint icon={UserCheck} title="Adult Supervision">
                                    A responsible adult must supervise children on the bounce house at all times. Never leave children unattended. The supervisor should enforce rules and ensure safe play.
                                </SafetyPoint>
                                <SafetyPoint icon={Wind} title="Weather Awareness">
                                    Bounce houses should not be used in high winds (over 15-20 mph), heavy rain, or thunderstorms. Hosts must provide clear weather-related cancellation policies, and guests should always prioritize safety over play.
                                </SafetyPoint>
                                <SafetyPoint icon={AlertTriangle} title="Safe Play Rules">
                                    Strict rules must be enforced: no shoes, no sharp objects, no flips or roughhousing, and no overcrowding. Adhere to the manufacturer's capacity limits, and group children of similar size together.
                                </SafetyPoint>
                                <SafetyPoint icon={Phone} title="Emergency Preparedness">
                                    Hosts should provide clear emergency contact information. In case of a power failure or deflation, the supervisor must calmly and quickly help all children exit the unit.
                                </SafetyPoint>
                            </div>
                        </div>

                        <div className="text-center pt-8 border-t border-gray-200">
                             <h2 className="text-2xl font-bold text-gray-900">Have Questions?</h2>
                             <p className="mt-3 text-gray-600 text-lg">Our support team is here to help. Your peace of mind is important to us.</p>
                             <Button 
                                size="lg"
                                onClick={() => navigate(createPageUrl("Support"))}
                                className="mt-6 bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-lg shadow-lg"
                             >
                                Contact Support
                             </Button>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}