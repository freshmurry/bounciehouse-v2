import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    PlayCircle, 
    CheckCircle, 
    XCircle, 
    AlertCircle,
    RefreshCw,
    Mail,
    CreditCard,
    Database,
    Globe
} from 'lucide-react';
import { siteAudit } from '@/api/functions';
import { testPaymentFlow } from '@/api/functions';
import { testEmailFlow } from '@/api/functions';

export default function SystemTestPanel() {
    const [auditResults, setAuditResults] = useState(null);
    const [paymentResults, setPaymentResults] = useState(null);
    const [emailResults, setEmailResults] = useState(null);
    const [isLoading, setIsLoading] = useState({});
    const [testEmail, setTestEmail] = useState('');

    const runTest = async (testType, testFunction, params = {}) => {
        setIsLoading(prev => ({ ...prev, [testType]: true }));
        try {
            const { data } = await testFunction(params);
            
            switch (testType) {
                case 'audit':
                    setAuditResults(data);
                    break;
                case 'payment':
                    setPaymentResults(data);
                    break;
                case 'email':
                    setEmailResults(data);
                    break;
            }
        } catch (error) {
            console.error(`${testType} test failed:`, error);
            const errorResult = {
                status: 'failed',
                error: error.message,
                timestamp: new Date().toISOString()
            };
            
            switch (testType) {
                case 'audit':
                    setAuditResults(errorResult);
                    break;
                case 'payment':
                    setPaymentResults(errorResult);
                    break;
                case 'email':
                    setEmailResults(errorResult);
                    break;
            }
        }
        setIsLoading(prev => ({ ...prev, [testType]: false }));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pass':
            case 'healthy':
            case 'all_passed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'fail':
            case 'failed':
            case 'some_failed':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'warning':
                return <AlertCircle className="w-4 h-4 text-yellow-600" />;
            case 'running':
                return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'pass': 'bg-green-100 text-green-800',
            'fail': 'bg-red-100 text-red-800',
            'warning': 'bg-yellow-100 text-yellow-800',
            'running': 'bg-blue-100 text-blue-800',
            'healthy': 'bg-green-100 text-green-800',
            'issues_found': 'bg-red-100 text-red-800',
            'all_passed': 'bg-green-100 text-green-800',
            'some_failed': 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
                {status?.replace(/_/g, ' ')}
            </Badge>
        );
    };

    const TestCard = ({ title, icon: Icon, results, testType, onRun, params }) => (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {title}
                    {results && getStatusIcon(results.status)}
                </CardTitle>
                <div className="flex justify-between items-center">
                    <Button 
                        onClick={() => onRun(testType, params)}
                        disabled={isLoading[testType]}
                        size="sm"
                    >
                        {isLoading[testType] ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Running...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                Run Test
                            </>
                        )}
                    </Button>
                    {results && getStatusBadge(results.status)}
                </div>
            </CardHeader>
            <CardContent>
                {results ? (
                    <div className="space-y-3">
                        {results.summary && (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>Total Tests: {results.summary.total}</div>
                                <div>Passed: {results.summary.passed}</div>
                                <div>Failed: {results.summary.failed}</div>
                                <div>Warnings: {results.summary.warnings}</div>
                            </div>
                        )}
                        
                        {results.tests && (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                {Object.entries(results.tests).map(([key, test]) => (
                                    <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                                        <span className="font-medium">{key}</span>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(test.status)}
                                            {getStatusBadge(test.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {results.errors && results.errors.length > 0 && (
                            <div className="text-red-600 text-sm">
                                <strong>Errors:</strong>
                                <ul className="list-disc list-inside">
                                    {results.errors.map((error, i) => (
                                        <li key={i}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {results.timestamp && (
                            <div className="text-xs text-gray-500">
                                Last run: {new Date(results.timestamp).toLocaleString()}
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-500">Click "Run Test" to start testing this system component.</p>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">System Testing & Debugging</h2>
                <Button 
                    onClick={() => {
                        runTest('audit', siteAudit);
                        runTest('payment', testPaymentFlow);
                        runTest('email', testEmailFlow, { test_email: testEmail });
                    }}
                    disabled={Object.values(isLoading).some(loading => loading)}
                >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run All Tests
                </Button>
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="details">Test Details</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <TestCard
                            title="System Audit"
                            icon={Database}
                            results={auditResults}
                            testType="audit"
                            onRun={() => runTest('audit', siteAudit)}
                        />
                        
                        <TestCard
                            title="Payment Flow"
                            icon={CreditCard}
                            results={paymentResults}
                            testType="payment"
                            onRun={() => runTest('payment', testPaymentFlow)}
                        />
                        
                        <TestCard
                            title="Email System"
                            icon={Mail}
                            results={emailResults}
                            testType="email"
                            onRun={() => runTest('email', testEmailFlow, { test_email: testEmail })}
                        />
                    </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                    {auditResults && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Audit Results</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                                    {JSON.stringify(auditResults, null, 2)}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Configuration</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Test Email Address
                                </label>
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={(e) => setTestEmail(e.target.value)}
                                    placeholder="Enter email for testing..."
                                    className="w-full p-2 border border-gray-300 rounded"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty to use your account email
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}