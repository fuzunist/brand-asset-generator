import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../AuthContext';
import { 
    FileText, 
    Download, 
    Eye,
    Settings,
    Palette,
    Layout,
    Sparkles,
    AlertCircle,
    Loader2,
    Crown,
    Rocket,
    Laptop,
    CheckCircle
} from 'lucide-react';

// shadcn/ui imports
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

function LetterheadGenerator() {
  const { brandDetails } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [brandData, setBrandData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('modern_header');
  const [customizations, setCustomizations] = useState({
    headerHeight: 'medium',
    footerStyle: 'full',
    logoPosition: 'left',
    colorScheme: 'brand',
    fontSize: 'medium',
    margins: 'standard',
    includeWatermark: false,
    letterSpacing: 'normal'
  });
  const [previewData, setPreviewData] = useState(null);

  // Template definitions with modern icons
  const templates = {
    modern_header: {
      name: 'Modern Header',
      description: 'Clean design with prominent header section',
      category: 'Professional',
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600'
    },
    elegant_sidebar: {
      name: 'Elegant Sidebar',
      description: 'Sophisticated layout with left sidebar design',
      category: 'Creative',
      icon: Layout,
      gradient: 'from-purple-500 to-purple-600'
    },
    minimalist_top: {
      name: 'Minimalist Top',
      description: 'Simple and clean top-aligned layout',
      category: 'Minimal',
      icon: Sparkles,
      gradient: 'from-slate-500 to-slate-600'
    },
    corporate_classic: {
      name: 'Corporate Classic',
      description: 'Traditional business letterhead design',
      category: 'Professional',
      icon: FileText,
      gradient: 'from-green-500 to-green-600'
    },
    creative_split: {
      name: 'Creative Split',
      description: 'Modern split-layout with visual impact',
      category: 'Creative',
      icon: Palette,
      gradient: 'from-pink-500 to-pink-600'
    },
    tech_modern: {
      name: 'Tech Modern',
      description: 'Contemporary design for tech companies',
      category: 'Tech',
      icon: Laptop,
      gradient: 'from-cyan-500 to-cyan-600'
    },
    luxury_premium: {
      name: 'Luxury Premium',
      description: 'High-end design with premium feel',
      category: 'Luxury',
      icon: Crown,
      gradient: 'from-yellow-500 to-yellow-600'
    },
    startup_fresh: {
      name: 'Startup Fresh',
      description: 'Dynamic layout for modern startups',
      category: 'Modern',
      icon: Rocket,
      gradient: 'from-orange-500 to-orange-600'
    }
  };

  const fetchBrandData = async () => {
    try {
      // This would typically fetch from your API
      // For now, using dummy data that matches your brand structure
      const dummyBrandData = {
        name: 'TechCorp Solutions',
        logo: brandDetails?.logoWithText || brandDetails?.logoWithoutText || '/api/placeholder/150/60',
        colors: {
          primary: brandDetails?.primaryColor || '#2563eb',
          secondary: brandDetails?.secondaryColor || '#64748b',
          accent: '#f59e0b',
          text: '#1f2937'
        },
        fonts: {
          headline: 'Inter',
          body: 'Inter'
        },
        contact: {
          address: '123 Business Ave, Suite 456, New York, NY 10001',
          phone: '+1 (555) 123-4567',
          email: 'contact@techcorp.com',
          website: 'www.techcorp.com'
        }
      };
      setBrandData(dummyBrandData);
    } catch (error) {
      console.error('Error fetching brand data:', error);
      setError('Failed to load brand data');
    }
  };

  const generateTemplateHTML = useCallback((templateId, brand, custom, isPreview = false) => {
    if (!brand) return '';

    // For preview, we'll use a different approach - fit the content to the container
    // instead of scaling down which leaves empty space
    const baseStyles = `
      font-family: '${brand.fonts.body}', Arial, sans-serif;
      color: ${brand.colors.text};
      line-height: 1.6;
      margin: 0;
      padding: 0;
      font-size: ${custom.fontSize === 'small' ? '11px' : custom.fontSize === 'large' ? '14px' : '12px'};
      letter-spacing: ${custom.letterSpacing === 'tight' ? '-0.025em' : custom.letterSpacing === 'wide' ? '0.05em' : 'normal'};
    `;

    const headerHeight = custom.headerHeight === 'small' ? '80px' : custom.headerHeight === 'large' ? '150px' : '120px';
    const margins = custom.margins === 'narrow' ? '20px' : custom.margins === 'wide' ? '40px' : '30px';

    // For preview, adjust sizes to fit container
    const previewStyles = isPreview ? `
      width: 100%;
      height: 100%;
      min-height: 300px;
      max-height: 400px;
      overflow: hidden;
      position: relative;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    ` : `
      width: 8.5in;
      height: 11in;
      position: relative;
    `;

    switch (templateId) {
      case 'modern_header':
        return `
          <div style="${baseStyles} ${previewStyles}">
            <header style="background: linear-gradient(135deg, ${brand.colors.primary} 0%, ${brand.colors.secondary} 100%); height: ${isPreview ? '25%' : headerHeight}; padding: ${isPreview ? '15px' : margins}; display: flex; align-items: center; justify-content: space-between; color: white;">
              <div style="display: flex; align-items: center; gap: ${isPreview ? '10px' : '20px'};">
                ${custom.logoPosition === 'left' || custom.logoPosition === 'center' ? `<img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '30px' : '50px'}; filter: brightness(0) invert(1);">` : ''}
                <div>
                  <h1 style="margin: 0; font-size: ${isPreview ? '16px' : '28px'}; font-weight: 700; font-family: '${brand.fonts.headline}';">${brand.name}</h1>
                </div>
              </div>
              ${custom.logoPosition === 'right' ? `<img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '30px' : '50px'}; filter: brightness(0) invert(1);">` : ''}
            </header>
            <main style="padding: ${isPreview ? '15px' : margins}; ${isPreview ? 'flex-grow: 1; overflow-y: auto;' : 'min-height: 400px;'}">
              <p style="color: #666; font-style: italic; margin-bottom: ${isPreview ? '15px' : '30px'}; font-size: ${isPreview ? '10px' : '12px'};">Professional letterhead template with modern design</p>
              <p style="font-size: ${isPreview ? '10px' : '12px'};">Dear [Recipient],</p>
              <p style="font-size: ${isPreview ? '10px' : '12px'};">This is your custom letterhead template. Replace this content with your actual letter content.</p>
            </main>
            ${custom.footerStyle !== 'none' ? `
              <footer style="border-top: 3px solid ${brand.colors.primary}; padding: ${isPreview ? '10px 15px' : `20px ${margins}`}; background: #f8fafc; ${isPreview ? 'margin-top: auto;' : 'margin-top: auto;'}">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: ${isPreview ? '8px' : '15px'}; font-size: ${isPreview ? '8px' : '11px'}; color: #64748b;">
                  <div>${brand.contact.address}</div>
                  <div style="display: flex; gap: ${isPreview ? '8px' : '15px'};">
                    <span>📞 ${brand.contact.phone}</span>
                    <span>✉️ ${brand.contact.email}</span>
                    <span>🌐 ${brand.contact.website}</span>
                  </div>
                </div>
              </footer>
            ` : ''}
            ${custom.includeWatermark ? `
              <div style="position: absolute; bottom: ${isPreview ? '20px' : '50px'}; right: ${isPreview ? '20px' : '50px'}; opacity: 0.1; transform: rotate(-45deg); font-size: ${isPreview ? '20px' : '48px'}; font-weight: bold; color: ${brand.colors.primary}; pointer-events: none;">
                ${brand.name}
              </div>
            ` : ''}
          </div>
        `;

      case 'elegant_sidebar':
        return `
          <div style="${baseStyles} ${previewStyles} display: flex;">
            <aside style="width: ${isPreview ? '30%' : '200px'}; background: ${brand.colors.primary}; color: white; padding: ${isPreview ? '10px' : margins}; display: flex; flex-direction: column; gap: ${isPreview ? '15px' : '30px'};">
              <div style="text-align: center;">
                <img src="${brand.logo}" alt="Logo" style="width: ${isPreview ? '50px' : '100px'}; height: auto; filter: brightness(0) invert(1); margin-bottom: ${isPreview ? '10px' : '20px'};">
                <h2 style="margin: 0; font-size: ${isPreview ? '10px' : '18px'}; font-weight: 600; font-family: '${brand.fonts.headline}';">${brand.name}</h2>
              </div>
              <div style="font-size: ${isPreview ? '7px' : '10px'}; line-height: 1.8;">
                <div style="margin-bottom: ${isPreview ? '8px' : '15px'};">
                  <strong>Address:</strong><br>
                  ${brand.contact.address}
                </div>
                <div style="margin-bottom: ${isPreview ? '8px' : '15px'};">
                  <strong>Phone:</strong><br>
                  ${brand.contact.phone}
                </div>
                <div style="margin-bottom: ${isPreview ? '8px' : '15px'};">
                  <strong>Email:</strong><br>
                  ${brand.contact.email}
                </div>
                <div>
                  <strong>Website:</strong><br>
                  ${brand.contact.website}
                </div>
              </div>
            </aside>
            <main style="flex: 1; padding: ${isPreview ? '10px' : margins}; background: white;">
              <div style="border-bottom: 2px solid ${brand.colors.accent}; padding-bottom: ${isPreview ? '10px' : '20px'}; margin-bottom: ${isPreview ? '15px' : '30px'};">
                <h1 style="margin: 0; color: ${brand.colors.primary}; font-family: '${brand.fonts.headline}'; font-size: ${isPreview ? '14px' : '24px'};">Letter</h1>
                <p style="margin: 5px 0 0 0; color: #666; font-size: ${isPreview ? '8px' : '14px'};">${new Date().toLocaleDateString()}</p>
              </div>
              <div style="color: #333; line-height: 1.8; font-size: ${isPreview ? '8px' : '12px'};">
                <p>Dear [Recipient],</p>
                <p>This elegant sidebar design provides a sophisticated look for your professional correspondence.</p>
                <p>The sidebar contains all your contact information while keeping the main content area clean and focused.</p>
              </div>
            </main>
          </div>
        `;

      case 'minimalist_top':
        return `
          <div style="${baseStyles} ${previewStyles}">
            <header style="border-bottom: 1px solid #e2e8f0; padding-bottom: ${isPreview ? '10px' : '20px'}; margin-bottom: ${isPreview ? '20px' : '40px'}; text-align: ${custom.logoPosition};">
              <img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '25px' : '40px'}; margin-bottom: ${isPreview ? '8px' : '15px'};">
              <h1 style="margin: 0; font-size: ${isPreview ? '12px' : '18px'}; font-weight: 300; color: ${brand.colors.text}; font-family: '${brand.fonts.headline}';">${brand.name}</h1>
            </header>
            <main style="padding: 0 ${isPreview ? '15px' : margins}; max-width: ${isPreview ? '100%' : '600px'}; margin: 0 auto;">
              <p style="color: #666; margin-bottom: ${isPreview ? '15px' : '30px'}; font-size: ${isPreview ? '8px' : '11px'}; text-align: right;">${new Date().toLocaleDateString()}</p>
              <div style="color: #333; line-height: 2; font-size: ${isPreview ? '8px' : '12px'};">
                <p>Dear [Recipient],</p>
                <br>
                <p>This minimalist design focuses on clarity and simplicity, perfect for modern business communication.</p>
                <br>
                <p>Best regards,</p>
                <p>[Your Name]</p>
              </div>
            </main>
            <footer style="position: absolute; bottom: ${isPreview ? '15px' : '30px'}; left: ${isPreview ? '15px' : margins}; right: ${isPreview ? '15px' : margins}; text-align: center; font-size: ${isPreview ? '7px' : '9px'}; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: ${isPreview ? '8px' : '15px'};">
              ${brand.contact.address} • ${brand.contact.phone} • ${brand.contact.email} • ${brand.contact.website}
            </footer>
          </div>
        `;

      case 'corporate_classic':
        return `
          <div style="${baseStyles} ${previewStyles}">
            <header style="text-align: center; padding: ${isPreview ? '15px 15px 10px 15px' : `${margins} ${margins} 20px ${margins}`}; border-bottom: 3px double ${brand.colors.primary};">
              <img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '35px' : '60px'}; margin-bottom: ${isPreview ? '8px' : '15px'};">
              <h1 style="margin: 0; font-size: ${isPreview ? '14px' : '24px'}; font-weight: 700; color: ${brand.colors.primary}; font-family: '${brand.fonts.headline}'; text-transform: uppercase; letter-spacing: ${isPreview ? '1px' : '2px'};">${brand.name}</h1>
              <p style="margin: ${isPreview ? '5px' : '10px'} 0 0 0; color: #666; font-size: ${isPreview ? '8px' : '12px'}; font-style: italic;">Excellence in Business Solutions</p>
            </header>
            <main style="padding: ${isPreview ? '20px 15px' : `40px ${margins}`};">
              <div style="text-align: right; margin-bottom: ${isPreview ? '15px' : '30px'}; color: #666; font-size: ${isPreview ? '8px' : '11px'};">
                ${new Date().toLocaleDateString()}
              </div>
              <div style="color: #333; line-height: 1.8; font-size: ${isPreview ? '8px' : '12px'};">
                <p>Dear Valued Client,</p>
                <br>
                <p>This classic corporate design maintains professionalism while incorporating your brand identity seamlessly.</p>
                <br>
                <p>Sincerely,</p>
                <br>
                <p>[Your Name]<br>[Your Title]</p>
              </div>
            </main>
            <footer style="position: absolute; bottom: ${isPreview ? '10px' : '20px'}; left: 0; right: 0; text-align: center; background: ${brand.colors.primary}; color: white; padding: ${isPreview ? '8px' : '15px'}; font-size: ${isPreview ? '7px' : '10px'};">
              <div style="display: flex; justify-content: center; gap: ${isPreview ? '10px' : '30px'}; flex-wrap: wrap;">
                <span>📍 ${brand.contact.address}</span>
                <span>📞 ${brand.contact.phone}</span>
                <span>✉️ ${brand.contact.email}</span>
                <span>🌐 ${brand.contact.website}</span>
              </div>
            </footer>
          </div>
        `;

      case 'creative_split':
        return `
          <div style="${baseStyles} ${previewStyles}">
            <div style="position: absolute; top: 0; left: 0; width: ${isPreview ? '40%' : '300px'}; height: 100%; background: linear-gradient(45deg, ${brand.colors.primary}, ${brand.colors.accent}); clip-path: polygon(0 0, 70% 0, 85% 100%, 0 100%);"></div>
            <header style="position: relative; z-index: 2; padding: ${isPreview ? '15px' : margins}; color: white; height: ${isPreview ? '30%' : headerHeight}; display: flex; flex-direction: column; justify-content: center;">
              <img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '25px' : '50px'}; filter: brightness(0) invert(1); margin-bottom: ${isPreview ? '8px' : '15px'};">
              <h1 style="margin: 0; font-size: ${isPreview ? '12px' : '22px'}; font-weight: 800; font-family: '${brand.fonts.headline}'; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${brand.name}</h1>
              <p style="margin: 5px 0 0 0; font-size: ${isPreview ? '8px' : '12px'}; opacity: 0.9;">Creative Solutions</p>
            </header>
            <main style="margin-left: ${isPreview ? '42%' : '320px'}; padding: ${isPreview ? '20px 15px 20px 0' : `40px ${margins} 40px 0`}; color: #333;">
              <div style="background: white; padding: ${isPreview ? '15px' : '30px'}; border-radius: ${isPreview ? '4px' : '8px'}; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                <div style="text-align: right; margin-bottom: ${isPreview ? '10px' : '20px'}; color: #666; font-size: ${isPreview ? '8px' : '11px'};">
                  ${new Date().toLocaleDateString()}
                </div>
                <div style="font-size: ${isPreview ? '8px' : '12px'};">
                  <p>Dear [Recipient],</p>
                  <br>
                  <p>This creative split design makes a bold statement while maintaining readability and professionalism.</p>
                  <br>
                  <p>The dynamic layout reflects innovation and forward-thinking approach.</p>
                  <br>
                  <p>Best regards,<br>[Your Name]</p>
                </div>
              </div>
            </main>
            <footer style="position: absolute; bottom: ${isPreview ? '10px' : '20px'}; right: ${isPreview ? '15px' : margins}; left: ${isPreview ? '42%' : '320px'}; text-align: right; font-size: ${isPreview ? '7px' : '9px'}; color: #666;">
              ${brand.contact.phone} • ${brand.contact.email} • ${brand.contact.website}
            </footer>
          </div>
        `;

      case 'tech_modern':
        return `
          <div style="${baseStyles} ${previewStyles} background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);">
            <header style="background: white; border-left: 5px solid ${brand.colors.primary}; padding: ${isPreview ? '15px' : margins}; margin-bottom: ${isPreview ? '15px' : '30px'}; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: ${isPreview ? '10px' : '20px'};">
                  <img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '25px' : '45px'};">
                  <div>
                    <h1 style="margin: 0; font-size: ${isPreview ? '12px' : '20px'}; font-weight: 600; color: ${brand.colors.primary}; font-family: '${brand.fonts.headline}';">${brand.name}</h1>
                    <p style="margin: 0; color: #64748b; font-size: ${isPreview ? '8px' : '11px'};">Technology Solutions</p>
                  </div>
                </div>
                <div style="text-align: right; font-size: ${isPreview ? '7px' : '10px'}; color: #64748b;">
                  <div style="font-weight: 600; color: ${brand.colors.primary};">CONTACT</div>
                  <div>${brand.contact.phone}</div>
                  <div>${brand.contact.email}</div>
                </div>
              </div>
            </header>
            <main style="background: white; margin: 0 ${isPreview ? '15px' : margins}; padding: ${isPreview ? '15px' : '30px'}; border-radius: ${isPreview ? '4px' : '8px'}; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <div style="border-left: 3px solid ${brand.colors.accent}; padding-left: ${isPreview ? '8px' : '15px'}; margin-bottom: ${isPreview ? '12px' : '25px'};">
                <p style="margin: 0; color: #666; font-size: ${isPreview ? '8px' : '11px'}; text-transform: uppercase; letter-spacing: 1px;">DATE: ${new Date().toLocaleDateString()}</p>
              </div>
              <div style="color: #334155; line-height: 1.7; font-size: ${isPreview ? '8px' : '12px'};">
                <p>Dear Innovation Partner,</p>
                <br>
                <p>This modern tech-inspired design reflects the cutting-edge nature of technology businesses.</p>
                <br>
                <p>Clean lines and contemporary styling convey professionalism and innovation.</p>
              </div>
            </main>
            <footer style="position: absolute; bottom: ${isPreview ? '10px' : '20px'}; left: ${isPreview ? '15px' : margins}; right: ${isPreview ? '15px' : margins}; text-align: center; color: #64748b; font-size: ${isPreview ? '7px' : '9px'};">
              <div style="border-top: 1px solid #e2e8f0; padding-top: ${isPreview ? '8px' : '15px'};">
                ${brand.contact.address} | ${brand.contact.website}
              </div>
            </footer>
          </div>
        `;

      case 'luxury_premium':
        return `
          <div style="${baseStyles} ${previewStyles} background: #fefefe;">
            <header style="text-align: center; padding: ${isPreview ? '20px 15px 15px 15px' : `40px ${margins} 30px ${margins}`}; border-bottom: 1px solid #d4af37;">
              <img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '35px' : '70px'}; margin-bottom: ${isPreview ? '10px' : '20px'}; filter: sepia(1) hue-rotate(30deg) saturate(2);">
              <h1 style="margin: 0; font-size: ${isPreview ? '14px' : '28px'}; font-weight: 300; color: #1a1a1a; font-family: serif; letter-spacing: ${isPreview ? '1.5px' : '3px'}; text-transform: uppercase;">${brand.name}</h1>
              <div style="width: ${isPreview ? '30px' : '60px'}; height: 2px; background: linear-gradient(to right, transparent, #d4af37, transparent); margin: ${isPreview ? '8px' : '15px'} auto;"></div>
              <p style="margin: 0; color: #666; font-size: ${isPreview ? '8px' : '11px'}; font-style: italic; letter-spacing: 1px;">PREMIUM EXCELLENCE</p>
            </header>
            <main style="padding: ${isPreview ? '25px 15px' : `50px ${margins}`}; max-width: ${isPreview ? '100%' : '500px'}; margin: 0 auto;">
              <div style="text-align: right; margin-bottom: ${isPreview ? '15px' : '30px'}; color: #666; font-size: ${isPreview ? '8px' : '11px'}; font-family: serif;">
                ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div style="color: #2a2a2a; line-height: 2; font-family: serif; font-size: ${isPreview ? '8px' : '13px'};">
                <p>Dear Esteemed Client,</p>
                <br>
                <p>This premium design conveys luxury, sophistication, and exclusivity for high-end businesses.</p>
                <br>
                <p>Every detail has been crafted to reflect excellence and prestige.</p>
                <br>
                <p style="margin-top: ${isPreview ? '20px' : '40px'};">With distinguished regards,</p>
                <br>
                <p>[Your Name]<br><span style="font-size: ${isPreview ? '7px' : '10px'}; color: #666;">[Your Title]</span></p>
              </div>
            </main>
            <footer style="position: absolute; bottom: ${isPreview ? '15px' : '30px'}; left: 0; right: 0; text-align: center; color: #666; font-size: ${isPreview ? '7px' : '9px'}; font-family: serif;">
              <div style="display: inline-block; background: white; padding: 0 ${isPreview ? '10px' : '20px'};">
                ${brand.contact.address}
              </div>
              <div style="margin-top: ${isPreview ? '5px' : '10px'}; display: flex; justify-content: center; gap: ${isPreview ? '10px' : '20px'};">
                <span>${brand.contact.phone}</span>
                <span>•</span>
                <span>${brand.contact.email}</span>
                <span>•</span>
                <span>${brand.contact.website}</span>
              </div>
            </footer>
          </div>
        `;

      case 'startup_fresh':
        return `
          <div style="${baseStyles} ${previewStyles} background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: url('data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 100 100\\"><circle cx=\\"20\\" cy=\\"20\\" r=\\"2\\" fill=\\"rgba(255,255,255,0.1)\\"/><circle cx=\\"80\\" cy=\\"20\\" r=\\"2\\" fill=\\"rgba(255,255,255,0.1)\\"/><circle cx=\\"20\\" cy=\\"80\\" r=\\"2\\" fill=\\"rgba(255,255,255,0.1)\\"/><circle cx=\\"80\\" cy=\\"80\\" r=\\"2\\" fill=\\"rgba(255,255,255,0.1)\\"/></svg>'); opacity: 0.5;"></div>
            <header style="position: relative; z-index: 2; padding: ${isPreview ? '15px' : margins}; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: ${isPreview ? '8px' : '15px'};">
                  <img src="${brand.logo}" alt="Logo" style="height: ${isPreview ? '25px' : '40px'}; filter: brightness(0) invert(1);">
                  <div>
                    <h1 style="margin: 0; font-size: ${isPreview ? '12px' : '22px'}; font-weight: 700; font-family: '${brand.fonts.headline}';">${brand.name}</h1>
                    <p style="margin: 0; font-size: ${isPreview ? '7px' : '10px'}; opacity: 0.8; text-transform: uppercase; letter-spacing: ${isPreview ? '1px' : '2px'};">Innovation Hub</p>
                  </div>
                </div>
                <div style="text-align: right; font-size: ${isPreview ? '7px' : '10px'}; opacity: 0.9;">
                  <div style="font-weight: 600;">LET'S CONNECT</div>
                  <div>${brand.contact.email}</div>
                  <div>${brand.contact.phone}</div>
                </div>
              </div>
            </header>
            <main style="position: relative; z-index: 2; margin: ${isPreview ? '15px' : '30px'} ${isPreview ? '15px' : margins}; background: rgba(255,255,255,0.95); color: #333; padding: ${isPreview ? '20px' : '40px'}; border-radius: ${isPreview ? '8px' : '15px'}; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: ${isPreview ? '15px' : '30px'}; padding-bottom: ${isPreview ? '8px' : '15px'}; border-bottom: 2px solid #f0f0f0;">
                <h2 style="margin: 0; color: #667eea; font-size: ${isPreview ? '10px' : '18px'}; font-weight: 600;">Fresh Communication</h2>
                <span style="color: #666; font-size: ${isPreview ? '8px' : '11px'};">${new Date().toLocaleDateString()}</span>
              </div>
              <div style="line-height: 1.8; font-size: ${isPreview ? '8px' : '12px'};">
                <p>Hey there!</p>
                <br>
                <p>This fresh, startup-inspired design brings energy and modernity to your business communications.</p>
                <br>
                <p>Perfect for innovative companies that want to stand out from the crowd.</p>
                <br>
                <p>Cheers,<br>[Your Name]</p>
              </div>
            </main>
            <footer style="position: absolute; bottom: ${isPreview ? '10px' : '20px'}; left: ${isPreview ? '15px' : margins}; right: ${isPreview ? '15px' : margins}; text-align: center; color: rgba(255,255,255,0.8); font-size: ${isPreview ? '7px' : '9px'}; z-index: 2;">
              <div style="background: rgba(255,255,255,0.1); padding: ${isPreview ? '5px' : '10px'}; border-radius: ${isPreview ? '10px' : '20px'}; backdrop-filter: blur(10px);">
                ${brand.contact.address} • ${brand.contact.website}
              </div>
            </footer>
          </div>
        `;

      default:
        return generateTemplateHTML('modern_header', brand, custom, isPreview);
    }
  }, []);

  const generatePreview = useCallback(() => {
    if (!brandData) return;

    const previewContent = generateTemplateHTML(selectedTemplate, brandData, customizations, true);
    setPreviewData(previewContent);
  }, [selectedTemplate, brandData, customizations, generateTemplateHTML]);

  // Load brand data on component mount and when brandDetails change
  useEffect(() => {
    fetchBrandData();
  }, [brandDetails]);

  // Update preview when template or customizations change
  useEffect(() => {
    generatePreview();
  }, [selectedTemplate, customizations, brandData, generatePreview]);

  const handleCustomizationChange = (key, value) => {
    setCustomizations(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDownload = async (format = 'docx') => {
    if (!brandData) {
      setError('Brand data not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/api/letterhead/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          customizations: customizations,
          format: format,
          brand_identity_id: 'user123_brand_abc'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const filename = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 
                     `letterhead-${selectedTemplate}.${format}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (e) {
      console.error('Error downloading letterhead:', e);
      setError('Failed to download letterhead. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTemplatesByCategory = () => {
    const categories = {};
    Object.entries(templates).forEach(([id, template]) => {
      if (!categories[template.category]) {
        categories[template.category] = [];
      }
      categories[template.category].push({ id, ...template });
    });
    return categories;
  };

  const categorizedTemplates = getTemplatesByCategory();

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-full">
            <FileText className="h-12 w-12 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
            Letterhead Generator
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Create professional letterheads with customizable templates. Choose your design and personalize it with your brand.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Templates and Customization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Template Selection */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 flex items-center">
                <Layout className="mr-3 h-6 w-6" />
                Choose Template
              </CardTitle>
              <CardDescription>
                Select from our collection of professional letterhead templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Professional" className="w-full">
                <TabsList className="grid grid-cols-4 w-full">
                  {Object.keys(categorizedTemplates).map(category => (
                    <TabsTrigger key={category} value={category}>
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {Object.entries(categorizedTemplates).map(([category, templates]) => (
                  <TabsContent key={category} value={category} className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {templates.map((template) => {
                        const IconComponent = template.icon;
                        return (
                          <Card 
                            key={template.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                              selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 bg-gradient-to-r ${template.gradient} rounded-lg`}>
                                  <IconComponent className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-slate-800 truncate">
                                    {template.name}
                                  </h3>
                                  <p className="text-sm text-slate-600 mt-1">
                                    {template.description}
                                  </p>
                                  {selectedTemplate === template.id && (
                                    <Badge className="mt-2 bg-blue-100 text-blue-800">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Customization Options */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-slate-800 flex items-center">
                <Settings className="mr-3 h-6 w-6" />
                Customization Options
              </CardTitle>
              <CardDescription>
                Adjust the template settings to match your preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="headerHeight">Header Height</Label>
                  <select
                    id="headerHeight"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={customizations.headerHeight}
                    onChange={(e) => handleCustomizationChange('headerHeight', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoPosition">Logo Position</Label>
                  <select
                    id="logoPosition"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={customizations.logoPosition}
                    onChange={(e) => handleCustomizationChange('logoPosition', e.target.value)}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <select
                    id="fontSize"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={customizations.fontSize}
                    onChange={(e) => handleCustomizationChange('fontSize', e.target.value)}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="margins">Margins</Label>
                  <select
                    id="margins"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={customizations.margins}
                    onChange={(e) => handleCustomizationChange('margins', e.target.value)}
                  >
                    <option value="narrow">Narrow</option>
                    <option value="standard">Standard</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footerStyle">Footer Style</Label>
                  <select
                    id="footerStyle"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={customizations.footerStyle}
                    onChange={(e) => handleCustomizationChange('footerStyle', e.target.value)}
                  >
                    <option value="none">None</option>
                    <option value="minimal">Minimal</option>
                    <option value="full">Full</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="letterSpacing">Letter Spacing</Label>
                  <select
                    id="letterSpacing"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm"
                    value={customizations.letterSpacing}
                    onChange={(e) => handleCustomizationChange('letterSpacing', e.target.value)}
                  >
                    <option value="tight">Tight</option>
                    <option value="normal">Normal</option>
                    <option value="wide">Wide</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeWatermark"
                  checked={customizations.includeWatermark}
                  onChange={(e) => handleCustomizationChange('includeWatermark', e.target.checked)}
                  className="rounded border-slate-300"
                />
                <Label htmlFor="includeWatermark">Include watermark</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Preview and Download */}
        <div className="space-y-6">
          {/* Brand Details Status */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center">
                <Sparkles className="mr-3 h-5 w-5" />
                Marka Durumu
              </CardTitle>
              <CardDescription>
                Merkezi Brand Details'ten logo ve renk bilgileri alınıyor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(brandDetails?.logoWithText || brandDetails?.logoWithoutText) ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={brandDetails.logoWithText || brandDetails.logoWithoutText} 
                      alt="Brand logo" 
                      className="w-12 h-12 object-contain rounded border"
                    />
                    <div>
                      <p className="text-sm font-medium text-green-800">
                        Logo {brandDetails.logoWithText ? '(Yazılı)' : '(Yazısız)'}
                      </p>
                      <p className="text-sm text-green-600">Antetli kağıtta kullanılıyor</p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              ) : (
                <Alert className="border-amber-200 bg-amber-50">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    Lütfen yukarıdaki Brand Details bölümünden logo yükleyin.
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Color Preview */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Kullanılan Renkler</h4>
                <div className="flex space-x-2">
                  <div 
                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: brandDetails?.primaryColor || '#4F46E5' }}
                    title="Birinci Renk"
                  />
                  <div 
                    className="w-8 h-8 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: brandDetails?.secondaryColor || '#EC4899' }}
                    title="İkinci Renk"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center">
                <Eye className="mr-3 h-5 w-5" />
                Live Preview
                <Badge variant="secondary" className="ml-auto">
                  {templates[selectedTemplate]?.name}
                </Badge>
              </CardTitle>
              <CardDescription>
                See how your letterhead will look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 overflow-hidden" style={{ minHeight: '350px', height: '400px' }}>
                {previewData ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: previewData }}
                    className="w-full h-full flex items-stretch"
                    style={{ minHeight: '350px' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500">
                    <div className="text-center">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                      <p>Preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Download Options */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-slate-800 flex items-center">
                <Download className="mr-3 h-5 w-5" />
                Download Options
              </CardTitle>
              <CardDescription>
                Choose your preferred format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={() => handleDownload('docx')}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download DOCX
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={() => handleDownload('pdf')}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                  className="w-full border-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                
                <Button
                  onClick={() => handleDownload('html')}
                  disabled={isLoading}
                  variant="outline"
                  size="lg"
                  className="w-full border-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Template Info */}
          {templates[selectedTemplate] && (
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800 flex items-center">
                  <Sparkles className="mr-3 h-5 w-5" />
                  Template Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                                         <div className={`p-2 bg-gradient-to-r ${templates[selectedTemplate].gradient} rounded-lg`}>
                       {React.createElement(templates[selectedTemplate].icon, { className: "h-5 w-5 text-white" })}
                     </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{templates[selectedTemplate].name}</h4>
                      <p className="text-sm text-slate-600">{templates[selectedTemplate].description}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">{templates[selectedTemplate].category}</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

export default LetterheadGenerator; 