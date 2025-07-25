import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { FileText, Download, Loader2, AlertCircle } from 'lucide-react';

const SmartDocumentGenerator = () => {
    const [activeTab, setActiveTab] = useState('proposal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        // Common fields
        clientName: '',
        projectName: '',
        projectDescription: '',
        timeline: '',
        
        // Proposal specific
        proposalDate: new Date().toISOString().split('T')[0],
        budget: '',
        deliverables: '',
        
        // Contract specific
        contractDate: new Date().toISOString().split('T')[0],
        paymentTerms: '',
        terms: '',
        signatoryName: '',
        signatoryTitle: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleGenerateDocument = async (type) => {
        setLoading(true);
        setError('');

        try {
            const endpoint = type === 'proposal' ? '/api/documents/proposal' : '/api/documents/contract';
            const response = await axios.post(`http://localhost:3001${endpoint}`, {
                ...formData,
                brandIdentityId: 'test-brand-id'
            }, {
                responseType: 'blob'
            });

            // Create download link
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_${formData.projectName.replace(/\s+/g, '_')}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
            // Success notification
            setError('');
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`);
        } catch (err) {
            setError(`Failed to generate ${type}. Please try again.`);
            console.error('Error generating document:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="w-6 h-6" />
                        Smart Document Generator
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Generate professional proposals and contracts with your brand identity
                    </p>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="proposal">Proposal Generator</TabsTrigger>
                            <TabsTrigger value="contract">Contract Generator</TabsTrigger>
                        </TabsList>

                        {/* Common Fields */}
                        <div className="space-y-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="clientName">Client Name</Label>
                                    <Input
                                        id="clientName"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        placeholder="Enter client name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="projectName">Project Name</Label>
                                    <Input
                                        id="projectName"
                                        name="projectName"
                                        value={formData.projectName}
                                        onChange={handleInputChange}
                                        placeholder="Enter project name"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="projectDescription">Project Description</Label>
                                <Textarea
                                    id="projectDescription"
                                    name="projectDescription"
                                    value={formData.projectDescription}
                                    onChange={handleInputChange}
                                    placeholder="Describe the project scope and objectives"
                                    rows={4}
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="timeline">Timeline</Label>
                                <Input
                                    id="timeline"
                                    name="timeline"
                                    value={formData.timeline}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 4-6 weeks"
                                />
                            </div>
                        </div>

                        <TabsContent value="proposal" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="proposalDate">Proposal Date</Label>
                                    <Input
                                        id="proposalDate"
                                        name="proposalDate"
                                        type="date"
                                        value={formData.proposalDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="budget">Budget</Label>
                                    <Input
                                        id="budget"
                                        name="budget"
                                        value={formData.budget}
                                        onChange={handleInputChange}
                                        placeholder="e.g., $10,000"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="deliverables">Deliverables</Label>
                                <Textarea
                                    id="deliverables"
                                    name="deliverables"
                                    value={formData.deliverables}
                                    onChange={handleInputChange}
                                    placeholder="List key deliverables (one per line)"
                                    rows={4}
                                />
                            </div>
                            
                            <Button
                                onClick={() => handleGenerateDocument('proposal')}
                                disabled={loading || !formData.clientName || !formData.projectName}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Generate Proposal
                                    </>
                                )}
                            </Button>
                        </TabsContent>

                        <TabsContent value="contract" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="contractDate">Contract Date</Label>
                                    <Input
                                        id="contractDate"
                                        name="contractDate"
                                        type="date"
                                        value={formData.contractDate}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                                    <Input
                                        id="paymentTerms"
                                        name="paymentTerms"
                                        value={formData.paymentTerms}
                                        onChange={handleInputChange}
                                        placeholder="e.g., 50% upfront, 50% on completion"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="terms">Terms & Conditions</Label>
                                <Textarea
                                    id="terms"
                                    name="terms"
                                    value={formData.terms}
                                    onChange={handleInputChange}
                                    placeholder="Enter specific terms and conditions"
                                    rows={4}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="signatoryName">Signatory Name</Label>
                                    <Input
                                        id="signatoryName"
                                        name="signatoryName"
                                        value={formData.signatoryName}
                                        onChange={handleInputChange}
                                        placeholder="Enter signatory name"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="signatoryTitle">Signatory Title</Label>
                                    <Input
                                        id="signatoryTitle"
                                        name="signatoryTitle"
                                        value={formData.signatoryTitle}
                                        onChange={handleInputChange}
                                        placeholder="e.g., CEO, Director"
                                    />
                                </div>
                            </div>
                            
                            <Button
                                onClick={() => handleGenerateDocument('contract')}
                                disabled={loading || !formData.clientName || !formData.projectName}
                                className="w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="mr-2 h-4 w-4" />
                                        Generate Contract
                                    </>
                                )}
                            </Button>
                        </TabsContent>
                    </Tabs>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                            <AlertCircle className="w-5 h-5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SmartDocumentGenerator; 