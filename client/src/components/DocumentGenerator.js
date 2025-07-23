import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { 
    FileText, 
    Download, 
    Plus, 
    Trash2, 
    ArrowRight, 
    ArrowLeft, 
    Check,
    DollarSign,
    Calendar,
    User,
    Building,
    Zap,
    BarChart3,
    Mail,
    Briefcase,
    Scale,
    Calculator
} from 'lucide-react';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const DocumentGenerator = () => {
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        clientName: '',
        projectName: '',
        projectScope: '',
        totalPrice: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: '',
        paymentTerms: '30 days',
        notes: '',
        items: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const [brandData, setBrandData] = useState(null);
    const [generatedDocuments, setGeneratedDocuments] = useState([]);
    const [activeCategory, setActiveCategory] = useState('All');

    // Enhanced document templates with modern icons
    const documentTemplates = [
        {
            id: 'proposal',
            title: 'Sales Proposal',
            description: 'Professional proposal for new client projects with detailed scope and pricing',
            icon: FileText,
            gradient: 'from-blue-500 to-blue-600',
            features: ['Project scope', 'Timeline', 'Pricing breakdown', 'Terms & conditions'],
            category: 'Sales'
        },
        {
            id: 'contract',
            title: 'Service Agreement',
            description: 'Comprehensive service contract with legal terms and project details',
            icon: Scale,
            gradient: 'from-green-500 to-green-600',
            features: ['Legal terms', 'Payment schedule', 'Deliverables', 'Cancellation policy'],
            category: 'Legal'
        },
        {
            id: 'invoice',
            title: 'Professional Invoice',
            description: 'Detailed invoice with itemized billing and payment instructions',
            icon: Calculator,
            gradient: 'from-purple-500 to-purple-600',
            features: ['Itemized billing', 'Tax calculations', 'Payment terms', 'Due dates'],
            category: 'Finance'
        },
        {
            id: 'quote',
            title: 'Price Quote',
            description: 'Detailed price quotation with optional pricing and service packages',
            icon: DollarSign,
            gradient: 'from-orange-500 to-orange-600',
            features: ['Package options', 'Validity period', 'Detailed pricing', 'Quick acceptance'],
            category: 'Sales'
        },
        {
            id: 'report',
            title: 'Business Report',
            description: 'Professional business or project report with data and recommendations',
            icon: BarChart3,
            gradient: 'from-indigo-500 to-indigo-600',
            features: ['Executive summary', 'Data analysis', 'Recommendations', 'Appendices'],
            category: 'Business'
        },
        {
            id: 'letter',
            title: 'Business Letter',
            description: 'Formal business correspondence on branded letterhead',
            icon: Mail,
            gradient: 'from-teal-500 to-teal-600',
            features: ['Branded letterhead', 'Professional formatting', 'Contact details', 'Digital signature'],
            category: 'Communication'
        }
    ];

    useEffect(() => {
        fetchBrandData();
        fetchGeneratedDocuments();
    }, []);

    const fetchBrandData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/press-kit/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBrandData(response.data);
        } catch (error) {
            console.error('Error fetching brand data:', error);
        }
    };

    const fetchGeneratedDocuments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3001/api/documents/history', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setGeneratedDocuments(response.data);
        } catch (error) {
            console.error('Error fetching document history:', error);
        }
    };

    const openModal = (template) => {
        setSelectedTemplate(template);
        setIsModalOpen(true);
        setCurrentStep(1);
        setError('');
        setFormData(prev => ({
            ...prev,
            items: template.id === 'invoice' || template.id === 'quote' ? [{ description: '', quantity: 1, rate: 0 }] : []
        }));
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTemplate(null);
        setCurrentStep(1);
        setError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const addItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { description: '', quantity: 1, rate: 0 }]
        }));
    };

    const removeItem = (index) => {
        setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const calculateTotal = () => {
        return formData.items.reduce((total, item) => total + (item.quantity * item.rate), 0);
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                return formData.clientName && formData.projectName;
            case 2:
                if (selectedTemplate?.id === 'invoice' || selectedTemplate?.id === 'quote') {
                    return formData.items.length > 0 && formData.items.every(item => item.description && item.quantity > 0 && item.rate >= 0);
                }
                return formData.projectScope;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
            setError('');
        } else {
            setError('Please fill in all required fields before proceeding.');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:3001/api/documents/generate', {
                templateType: selectedTemplate.id,
                formData: {
                    ...formData,
                    totalPrice: selectedTemplate.id === 'invoice' || selectedTemplate.id === 'quote' 
                        ? calculateTotal().toString() 
                        : formData.totalPrice
                }
            }, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${selectedTemplate.title.replace(/ /g, '_')}_${formData.clientName.replace(/ /g, '_')}.docx`;
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                if (filenameMatch && filenameMatch.length > 1) {
                    filename = filenameMatch[1];
                }
            }

            saveAs(response.data, filename);
            closeModal();
            fetchGeneratedDocuments();

        } catch (err) {
            console.error('Error generating document:', err);
            setError('Failed to generate the document. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = ['All', ...new Set(documentTemplates.map(template => template.category))];
    const filteredTemplates = activeCategory === 'All' 
        ? documentTemplates 
        : documentTemplates.filter(template => template.category === activeCategory);

    const progressValue = (currentStep / 3) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Modern Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="text-center">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                                <FileText className="h-12 w-12 text-white" />
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-6">
                            Document Generator
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                            Create professional business documents with your brand identity. 
                            Choose from our collection of templates and generate documents in seconds.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Modern Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-blue-500 rounded-xl">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Available Templates</p>
                                    <p className="text-3xl font-bold text-slate-900">{documentTemplates.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-500 rounded-xl">
                                    <Check className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Generated Today</p>
                                    <p className="text-3xl font-bold text-slate-900">{generatedDocuments.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="p-3 bg-purple-500 rounded-xl">
                                    <Zap className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-slate-600">Avg. Generation</p>
                                    <p className="text-3xl font-bold text-slate-900">5s</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Modern Category Tabs */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-6 h-12">
                        {categories.map(category => (
                            <TabsTrigger key={category} value={category} className="text-sm font-medium">
                                {category}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>

                {/* Modern Template Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {filteredTemplates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                            <Card key={template.id} className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-0 shadow-lg overflow-hidden">
                                {/* Template Header with Gradient */}
                                <div className={`h-32 bg-gradient-to-r ${template.gradient} relative`}>
                                    <div className="absolute inset-0 bg-black/10"></div>
                                    <div className="relative z-10 p-6 flex items-center justify-between h-full">
                                        <IconComponent className="h-10 w-10 text-white" />
                                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                            {template.category}
                                        </Badge>
                                    </div>
                                </div>

                                <CardHeader className="pb-4">
                                    <CardTitle className="text-xl text-slate-800">{template.title}</CardTitle>
                                    <CardDescription className="text-slate-600 leading-relaxed">
                                        {template.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="pb-6">
                                    <div className="space-y-2 mb-6">
                                        <p className="text-sm font-semibold text-slate-700 mb-3">Features:</p>
                                        {template.features.slice(0, 3).map((feature, index) => (
                                            <div key={index} className="flex items-center text-sm text-slate-600">
                                                <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-0">
                                    <Button 
                                        onClick={() => openModal(template)}
                                        className={`w-full bg-gradient-to-r ${template.gradient} hover:opacity-90 transition-all duration-200 shadow-lg`}
                                        size="lg"
                                    >
                                        Create {template.title}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>

                {/* Recent Documents Section */}
                {generatedDocuments.length > 0 && (
                    <Card className="border-0 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl text-slate-800 flex items-center">
                                <Briefcase className="mr-3 h-6 w-6" />
                                Recent Documents
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {generatedDocuments.slice(0, 5).map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{doc.name}</p>
                                                <p className="text-sm text-slate-500">Generated {doc.date}</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm">
                                            <Download className="mr-2 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modern Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <div className="flex items-center space-x-4">
                            {selectedTemplate && (
                                <>
                                    <div className={`p-3 bg-gradient-to-r ${selectedTemplate.gradient} rounded-xl`}>
                                        <selectedTemplate.icon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl">Create {selectedTemplate.title}</DialogTitle>
                                        <DialogDescription className="text-slate-600">
                                            {selectedTemplate.description}
                                        </DialogDescription>
                                    </div>
                                </>
                            )}
                        </div>
                    </DialogHeader>

                    {/* Progress Indicator */}
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">
                                Step {currentStep} of 3
                            </span>
                            <span className="text-sm text-slate-500">
                                {currentStep === 1 ? 'Basic Info' : currentStep === 2 ? 'Details' : 'Review'}
                            </span>
                        </div>
                        <Progress value={progressValue} className="h-2" />
                    </div>

                    {/* Modal Content */}
                    <div className="px-6 overflow-y-auto max-h-96">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {currentStep === 1 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                        <User className="mr-2 h-5 w-5" />
                                        Basic Information
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="clientName">Client Name *</Label>
                                            <Input
                                                id="clientName"
                                                name="clientName"
                                                value={formData.clientName}
                                                onChange={handleInputChange}
                                                placeholder="Enter client or company name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="projectName">Project Name *</Label>
                                            <Input
                                                id="projectName"
                                                name="projectName"
                                                value={formData.projectName}
                                                onChange={handleInputChange}
                                                placeholder="Enter project title"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date *</Label>
                                            <Input
                                                id="date"
                                                name="date"
                                                type="date"
                                                value={formData.date}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="dueDate">Due Date</Label>
                                            <Input
                                                id="dueDate"
                                                name="dueDate"
                                                type="date"
                                                value={formData.dueDate}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                        <Building className="mr-2 h-5 w-5" />
                                        Project Details
                                    </h3>
                                    
                                    {(selectedTemplate?.id === 'invoice' || selectedTemplate?.id === 'quote') ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-base font-medium">Line Items</Label>
                                                <Button type="button" onClick={addItem} variant="outline" size="sm">
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    Add Item
                                                </Button>
                                            </div>
                                            {formData.items.map((item, index) => (
                                                <Card key={index} className="p-4">
                                                    <div className="grid grid-cols-12 gap-4 items-end">
                                                        <div className="col-span-5">
                                                            <Label>Description</Label>
                                                            <Input
                                                                value={item.description}
                                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                                placeholder="Service or product description"
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <Label>Quantity</Label>
                                                            <Input
                                                                type="number"
                                                                value={item.quantity}
                                                                onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                                                                min="1"
                                                            />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <Label>Rate ($)</Label>
                                                            <Input
                                                                type="number"
                                                                value={item.rate}
                                                                onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <Button
                                                                type="button"
                                                                onClick={() => removeItem(index)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="col-span-1 text-right font-medium">
                                                            ${(item.quantity * item.rate).toFixed(2)}
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                            <Card className="p-4 bg-slate-50">
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-slate-900">
                                                        Total: ${calculateTotal().toFixed(2)}
                                                    </p>
                                                </div>
                                            </Card>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="projectScope">Project Scope *</Label>
                                                <Textarea
                                                    id="projectScope"
                                                    name="projectScope"
                                                    value={formData.projectScope}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    placeholder="Describe the project scope, deliverables, and key requirements..."
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="totalPrice">Total Price ($) *</Label>
                                                    <Input
                                                        id="totalPrice"
                                                        name="totalPrice"
                                                        type="number"
                                                        value={formData.totalPrice}
                                                        onChange={handleInputChange}
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="paymentTerms">Payment Terms</Label>
                                                    <Input
                                                        id="paymentTerms"
                                                        name="paymentTerms"
                                                        value={formData.paymentTerms}
                                                        onChange={handleInputChange}
                                                        placeholder="e.g., Net 30 days"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                                        <Check className="mr-2 h-5 w-5" />
                                        Review & Generate
                                    </h3>
                                    <Card className="p-6 bg-slate-50">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Document Type</p>
                                                <p className="text-lg font-semibold text-slate-900">{selectedTemplate?.title}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Client</p>
                                                <p className="text-lg font-semibold text-slate-900">{formData.clientName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Project</p>
                                                <p className="text-lg font-semibold text-slate-900">{formData.projectName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-600">Total Value</p>
                                                <p className="text-lg font-semibold text-slate-900">
                                                    ${(selectedTemplate?.id === 'invoice' || selectedTemplate?.id === 'quote') 
                                                        ? calculateTotal().toFixed(2) 
                                                        : formData.totalPrice}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleInputChange}
                                            rows={3}
                                            placeholder="Any additional notes or special instructions..."
                                        />
                                    </div>
                                </div>
                            )}

                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                        </form>
                    </div>

                    <Separator />

                    <DialogFooter className="px-6 py-4">
                        <div className="flex justify-between w-full">
                            <div>
                                {currentStep > 1 && (
                                    <Button type="button" onClick={prevStep} variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Previous
                                    </Button>
                                )}
                            </div>
                            <div className="space-x-3">
                                <Button type="button" onClick={closeModal} variant="outline">
                                    Cancel
                                </Button>
                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!validateStep(currentStep)}
                                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                                    >
                                        Next
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="mr-2 h-4 w-4" />
                                                Generate Document
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default DocumentGenerator; 