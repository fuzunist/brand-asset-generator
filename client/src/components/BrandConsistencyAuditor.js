import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Palette, Type } from 'lucide-react';
import { useAuth } from '../AuthContext';

const BrandConsistencyAuditor = () => {
    const { token } = useAuth();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [auditResults, setAuditResults] = useState(null);
    const [brandIdentityId, setBrandIdentityId] = useState(null);
    const [debugInfo, setDebugInfo] = useState('');

    // Enhanced logging function
    const logDebug = (message, data = null) => {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}`;
        console.log(logMessage, data);
        
        // Update debug info for UI display
        setDebugInfo(prev => prev + logMessage + '\n');
    };

    // Fetch brand identity on component mount
    useEffect(() => {
        const fetchBrandIdentity = async () => {
            logDebug('Starting brand identity fetch');
            try {
                const endpoint = 'http://localhost:3001/api/user/brand-identity';
                logDebug(`Making request to: ${endpoint}`);
                
                const response = await fetch(endpoint, {
                    headers: {
                        'Authorization': `Bearer ${token || 'dev-token'}`
                    }
                });

                logDebug(`Brand identity response status: ${response.status}`);
                logDebug(`Brand identity response headers:`, Object.fromEntries(response.headers.entries()));

                if (response.ok) {
                    const data = await response.json();
                    logDebug('Brand identity data received:', data);
                    // For now, we're using a hardcoded ID since the endpoint doesn't return it
                    setBrandIdentityId(1);
                } else {
                    const errorText = await response.text();
                    logDebug(`Brand identity error response: ${errorText}`);
                }
            } catch (err) {
                logDebug('Brand identity fetch error:', err);
                console.error('Failed to fetch brand identity:', err);
            }
        };

        fetchBrandIdentity();
    }, []);

    const handleAudit = async () => {
        if (!url) {
            setError('Please enter a URL to audit');
            return;
        }

        // Basic URL validation
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
        } catch (e) {
            setError('Please enter a valid URL');
            return;
        }

        setLoading(true);
        setError('');
        setAuditResults(null);
        setDebugInfo(''); // Clear previous debug info

        try {
            const endpoint = 'http://localhost:3001/api/audits/consistency';
            const requestBody = {
                url: url.startsWith('http') ? url : `https://${url}`,
                brand_identity_id: brandIdentityId
            };

            logDebug('Starting audit request');
            logDebug(`Endpoint: ${endpoint}`);
            logDebug('Request body:', requestBody);
            logDebug('Request headers:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token || 'dev-token'}`
            });

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || 'dev-token'}`
                },
                body: JSON.stringify(requestBody)
            });

            logDebug(`Response status: ${response.status}`);
            logDebug(`Response status text: ${response.statusText}`);
            logDebug('Response headers:', Object.fromEntries(response.headers.entries()));

            // Get response text first to check if it's JSON
            const responseText = await response.text();
            logDebug('Raw response text:', responseText);

            let data;
            try {
                data = JSON.parse(responseText);
                logDebug('Parsed JSON response:', data);
            } catch (parseError) {
                logDebug('JSON parse error:', parseError);
                logDebug('Response text that failed to parse:', responseText);
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
            }

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            setAuditResults(data);
            logDebug('Audit completed successfully');
        } catch (err) {
            logDebug('Audit error:', err);
            setError(err.message || 'An error occurred while auditing the website');
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBadgeVariant = (score) => {
        if (score >= 90) return 'default';
        if (score >= 70) return 'secondary';
        return 'destructive';
    };

    const ColorSwatch = ({ color }) => (
        <div className="flex items-center space-x-2">
            <div 
                className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
                title={color}
            />
            <span className="text-sm font-mono">{color.toUpperCase()}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Brand Consistency Auditor</CardTitle>
                    <CardDescription>
                        Analyze your website to ensure it follows your brand guidelines for colors and typography.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="url">Website URL</Label>
                        <div className="flex space-x-2">
                            <Input
                                id="url"
                                type="text"
                                placeholder="https://ficonica.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAudit()}
                                disabled={loading}
                                className="flex-1"
                            />
                            <Button 
                                onClick={handleAudit} 
                                disabled={loading || !url}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Auditing...
                                    </>
                                ) : (
                                    'Run Audit'
                                )}
                            </Button>
                        </div>
                    </div>

                    {loading && (
                        <Alert>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <AlertDescription>
                                Analyzing your website... This may take up to 30 seconds.
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Debug Information */}
                    {debugInfo && (
                        <Card className="bg-gray-50">
                            <CardHeader>
                                <CardTitle className="text-sm">Debug Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-40">
                                    {debugInfo}
                                </pre>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {auditResults && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Audit Results</CardTitle>
                                <CardDescription>
                                    {auditResults.auditUrl}
                                </CardDescription>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500 mb-1">Consistency Score</div>
                                <div className={`text-3xl font-bold ${getScoreColor(auditResults.score)}`}>
                                    {auditResults.score}%
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Color Palette Audit */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Palette className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-semibold">Color Palette Audit</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Approved Colors */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <h4 className="font-medium text-green-600">
                                            Approved Colors ({auditResults.results.colors.approved.length})
                                        </h4>
                                    </div>
                                    {auditResults.results.colors.approved.length > 0 ? (
                                        <div className="space-y-2">
                                            {auditResults.results.colors.approved.map((color, index) => (
                                                <ColorSwatch key={index} color={color} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No approved colors found</p>
                                    )}
                                </div>

                                {/* Unapproved Colors */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <h4 className="font-medium text-red-600">
                                            Off-Brand Colors ({auditResults.results.colors.unapproved.length})
                                        </h4>
                                    </div>
                                    {auditResults.results.colors.unapproved.length > 0 ? (
                                        <div className="space-y-2">
                                            {auditResults.results.colors.unapproved.map((color, index) => (
                                                <ColorSwatch key={index} color={color} />
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No off-brand colors found</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-6" />

                        {/* Typography Audit */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Type className="h-5 w-5 text-gray-600" />
                                <h3 className="text-lg font-semibold">Typography Audit</h3>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                {/* Approved Fonts */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <h4 className="font-medium text-green-600">
                                            Approved Fonts ({auditResults.results.fonts.approved.length})
                                        </h4>
                                    </div>
                                    {auditResults.results.fonts.approved.length > 0 ? (
                                        <div className="space-y-1">
                                            {auditResults.results.fonts.approved.map((font, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Badge variant="outline" className="font-mono">
                                                        {font}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No approved fonts found</p>
                                    )}
                                </div>

                                {/* Unapproved Fonts */}
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <h4 className="font-medium text-red-600">
                                            Off-Brand Fonts ({auditResults.results.fonts.unapproved.length})
                                        </h4>
                                    </div>
                                    {auditResults.results.fonts.unapproved.length > 0 ? (
                                        <div className="space-y-1">
                                            {auditResults.results.fonts.unapproved.map((font, index) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <Badge variant="destructive" className="font-mono">
                                                        {font}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No off-brand fonts found</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Brand Guidelines Reference */}
                        {auditResults.brandIdentity && (
                            <>
                                <div className="border-t pt-6" />
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-700 mb-2">Your Brand Guidelines</h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-gray-600">Brand:</span>{' '}
                                            <span className="font-medium">{auditResults.brandIdentity.name}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Approved Colors:</span>{' '}
                                            <span className="font-mono">
                                                {auditResults.brandIdentity.approvedColors.map(c => c.toUpperCase()).join(', ')}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Approved Fonts:</span>{' '}
                                            <span className="font-mono">
                                                {auditResults.brandIdentity.approvedFonts.join(', ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BrandConsistencyAuditor;