import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/utils';

const Section = ({ title, children }) =>
<section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-red-200">{title}</h2>
        <div className="prose prose-lg max-w-none text-gray-700">
            {children}
        </div>
    </section>;


export default function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div className="bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Home"))}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">

                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Button>
                <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-gray-200">
                    <header className="text-center mb-12">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Terms of Service</h1>
                        <p className="mt-4 text-lg text-gray-600">Last Updated: September 4, 2025</p>
                    </header>

                    <main>
                        <Section title="1. Introduction">
                            <p>Welcome to BouncieHouse! These Terms of Service ("Terms") govern your use of the BouncieHouse website, mobile applications, and services (collectively, the "Service"), operated by BouncieHouse, Inc. By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy.</p>
                        </Section>

                        <Section title="2. Service Description">
                            <p>BouncieHouse is an online marketplace that enables registered users ("Members") to rent and offer for rent bounce houses and other party equipment ("Listings"). We act as a platform to facilitate these transactions but are not a party to any rental agreement between Members.</p>
                        </Section>
                        
                        <Section title="3. User Responsibilities">
                            <p>As a user of BouncieHouse, you agree to provide accurate, current, and complete information during the registration process. You are responsible for safeguarding your password and for all activities that occur under your account. You agree not to use the Service for any illegal or unauthorized purpose.</p>
                            <p><strong>Hosts</strong> are responsible for ensuring their listings are accurate, safe, clean, and comply with all local laws and regulations. <strong>Guests</strong> are responsible for using the equipment safely and returning it in the condition it was received.</p>
                        </Section>

                        <Section title="4. Payments and Fees">
                            <p>BouncieHouse, through its third-party payment processor (Stripe), facilitates payments for bookings. We charge a service fee to both Guests and Hosts for each transaction. All fees will be disclosed to you prior to booking or listing. Hosts are responsible for their own tax obligations.</p>
                        </Section>
                        
                        <Section title="5. Cancellations and Refunds">
                            <p>Each Host sets their own cancellation policy, which will be clearly displayed on the listing page. BouncieHouse will honor the Host's chosen policy. Any refunds will be processed in accordance with that policy. We reserve the right to mediate disputes and issue refunds in exceptional circumstances.</p>
                        </Section>

                        <Section title="6. Limitation of Liability">
                            <p>The Service is provided "as is" without any warranties. BouncieHouse is not liable for any personal injury, property damage, or other damages arising from the use of rented equipment. Your use of the Service and any rented equipment is at your own risk.</p>
                        </Section>

                        <Section title="7. Changes to Terms">
                            <p>We may modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page. Your continued use of the Service after such changes constitutes your acceptance of the new Terms.</p>
                        </Section>

                        <Section title="8. Contact Us">
                            <p>If you have any questions about these Terms, please contact us at <a href="mailto:support@bounciehouse.com" className="text-red-600 hover:underline">support@bounciehouse.com</a>.</p>
                        </Section>
                    </main>
                </div>
            </div>
        </div>);

}