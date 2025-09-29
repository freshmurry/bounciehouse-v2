import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Shield, X } from 'lucide-react';

const ADMIN_USER_EMAILS = ["gideon@base44.ai", "lawrencemurry@yahoo.com"];

export default function DebugPanel() {
    const [user, setUser] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                if (currentUser && ADMIN_USER_EMAILS.includes(currentUser.email)) {
                    setUser(currentUser);
                    setIsVisible(true);
                }
            } catch {
                    // Not logged in or not an admin, do nothing
                }
        };
        fetchUser();
    }, []);

    if (!isVisible) return null;

    if (!isOpen) {
        return (
            <div className="fixed bottom-4 right-4 z-[9999]">
                <Button onClick={() => setIsOpen(true)} size="icon" className="rounded-full shadow-lg bg-blue-600 hover:bg-blue-700">
                    <Shield className="h-6 w-6 text-white" />
                </Button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-[9998]" onClick={() => setIsOpen(false)}>
            <div 
                className="fixed bottom-0 right-0 h-2/3 w-full max-w-md bg-white shadow-2xl rounded-tl-lg p-4 flex flex-col z-[9999] overflow-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h3 className="font-bold text-lg">Admin Debug Panel</h3>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <div>
                    <h4 className="font-semibold">Current User Data:</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mt-2">
                        {JSON.stringify(user, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}