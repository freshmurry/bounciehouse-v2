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


export default function PrivacyPolicyPage() {
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
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
                        <p className="mt-4 text-lg text-gray-600">Last Updated: September 4, 2025</p>
                    </header>

                    <main>
                        <Section title="1. Introduction">
                            <p>BouncieHouse, Inc. ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services (the "Service").</p>
                        </Section>

                        <Section title="2. Information We Collect">
                            <p>We may collect personal information from you in a variety of ways, including:</p>
                            <ul>
                                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, email address, phone number, and demographic information, that you voluntarily give to us when you register with the Service.</li>
                                <li><strong>Financial Data:</strong> Data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you book or list. This information is stored and processed by our third-party payment processor, Stripe.</li>
                                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Service, such as your IP address, your browser type, and your operating system.</li>
                            </ul>
                        </Section>
                        
                        <Section title="3. How We Use Your Information">
                            <p>Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Service to:</p>
                            <ul>
                                <li>Create and manage your account.</li>
                                <li>Facilitate bookings and payments.</li>
                                <li>Email you regarding your account or order.</li>
                                <li>Enable user-to-user communications.</li>
                                <li>Monitor and analyze usage and trends to improve your experience with the Service.</li>
                            </ul>
                        </Section>

                        <Section title="4. Disclosure of Your Information">
                            <p>We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
                            <ul>
                                <li><strong>By Law or to Protect Rights:</strong> If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others.</li>
                                <li><strong>Third-Party Service Providers:</strong> We may share your information with third parties that perform services for us or on our behalf, including payment processing, data analysis, and email delivery.</li>
                                <li><strong>Interactions with Other Users:</strong> If you interact with other users of the Service, those users may see your name, profile photo, and descriptions of your activity, including rental history.</li>
                            </ul>
                        </Section>
                        
                        <Section title="5. Security of Your Information">
                            <p>We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.</p>
                        </Section>
                        
                        <Section title="6. Your Rights">
                             <p>You have the right to access, update, or delete your personal information at any time through your account settings. If you wish to terminate your account, you may do so from your dashboard or by contacting us.</p>
                        </Section>
                        
                        <Section title="7. Contact Us">
                            <p>If you have questions or comments about this Privacy Policy, please contact us at <a href="mailto:privacy@bounciehouse.com" className="text-red-600 hover:underline">privacy@bounciehouse.com</a>.</p>
                        </Section>
                    </main>
                </div>
            </div>
        </div>);

}