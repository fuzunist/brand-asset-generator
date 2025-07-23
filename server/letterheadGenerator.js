const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  Header,
  Footer,
  AlignmentType,
  Table,
  TableCell,
  TableRow,
  BorderStyle,
  WidthType,
  ShadingType,
  UnderlineType
} = require("docx");
const fs = require("fs/promises");
const sharp = require("sharp");
const puppeteer = require("puppeteer");
const path = require("path");

// Enhanced letterhead generator with multiple templates and customizations
async function generateLetterhead(brandIdentity, templateId = 'modern_header', customizations = {}, format = 'docx') {
  const { 
    companyName, 
    address, 
    phone, 
    email, 
    website, 
    logoPath,
    colors = { primary: '#2563eb', secondary: '#64748b', accent: '#f59e0b', text: '#1f2937' },
    fonts = { headline: 'Inter', body: 'Inter' }
  } = brandIdentity;

  // Default customizations
  const defaultCustomizations = {
    headerHeight: 'medium',
    footerStyle: 'full',
    logoPosition: 'left',
    colorScheme: 'brand',
    fontSize: 'medium',
    margins: 'standard',
    includeWatermark: false,
    letterSpacing: 'normal'
  };

  const custom = { ...defaultCustomizations, ...customizations };

  if (format === 'pdf' || format === 'html') {
    return await generateHTMLLetterhead(brandIdentity, templateId, custom, format);
  } else {
    return await generateWordLetterhead(brandIdentity, templateId, custom);
  }
}

// Generate HTML-based letterhead (for PDF or HTML output)
async function generateHTMLLetterhead(brandIdentity, templateId, custom, format) {
  const html = generateTemplateHTML(templateId, brandIdentity, custom, false);
  
  if (format === 'html') {
    return Buffer.from(html, 'utf8');
  }
  
  // Convert HTML to PDF using Puppeteer
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new'
  });
  
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: { 
        top: '0mm', 
        bottom: '0mm', 
        left: '0mm', 
        right: '0mm' 
      }
    });
    
    return pdf;
  } finally {
    await browser.close();
  }
}

// Generate Word document letterhead
async function generateWordLetterhead(brandIdentity, templateId, custom) {
  const { companyName, address, phone, email, website, logoPath, colors, fonts } = brandIdentity;

  // Prepare the logo
  let logoBuffer = null;
  if (logoPath && await fs.access(logoPath).then(() => true).catch(() => false)) {
    const imageBuffer = await fs.readFile(logoPath);
    logoBuffer = await sharp(imageBuffer)
      .resize({ height: custom.headerHeight === 'small' ? 60 : custom.headerHeight === 'large' ? 120 : 80 })
      .png()
      .toBuffer();
  }

  // Convert hex color to docx color format
  const hexToDocxColor = (hex) => hex.replace('#', '').toUpperCase();

  const doc = new Document({
    creator: "Professional Letterhead Generator",
    title: `${companyName} Letterhead - ${templateId}`,
    description: `Professional letterhead template for ${companyName}`,
    styles: {
      paragraphStyles: [
        {
          id: "HeaderStyle",
          name: "Header Style",
          basedOn: "Normal",
          next: "Normal",
          run: {
            size: custom.fontSize === 'small' ? 22 : custom.fontSize === 'large' ? 28 : 24,
            bold: true,
            color: hexToDocxColor(colors.primary),
            font: fonts.headline
          },
          paragraph: {
            spacing: { after: 200 }
          }
        },
        {
          id: "CompanyName",
          name: "Company Name",
          basedOn: "Normal",
          run: {
            size: custom.fontSize === 'small' ? 32 : custom.fontSize === 'large' ? 40 : 36,
            bold: true,
            color: hexToDocxColor(colors.primary),
            font: fonts.headline
          }
        },
        {
          id: "ContactInfo",
          name: "Contact Info",
          basedOn: "Normal",
          run: {
            size: custom.fontSize === 'small' ? 18 : custom.fontSize === 'large' ? 22 : 20,
            color: hexToDocxColor(colors.text),
            font: fonts.body
          }
        },
        {
          id: "BodyText",
          name: "Body Text",
          basedOn: "Normal",
          run: {
            size: custom.fontSize === 'small' ? 22 : custom.fontSize === 'large' ? 26 : 24,
            font: fonts.body
          }
        }
      ]
    },
    sections: [
      generateWordSection(templateId, brandIdentity, custom, logoBuffer, hexToDocxColor)
    ]
  });

  return await Packer.toBuffer(doc);
}

// Generate Word document section based on template
function generateWordSection(templateId, brandIdentity, custom, logoBuffer, hexToDocxColor) {
  const { companyName, address, phone, email, website, colors } = brandIdentity;
  
  const marginSize = custom.margins === 'narrow' ? 700 : custom.margins === 'wide' ? 1200 : 950;

  switch (templateId) {
    case 'modern_header':
      return {
        properties: {
          page: {
            margin: {
              top: marginSize,
              bottom: marginSize,
              left: marginSize,
              right: marginSize
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  ...(logoBuffer && custom.logoPosition === 'left' ? [
                    new ImageRun({
                      data: logoBuffer,
                      transformation: {
                        width: 120,
                        height: 80,
                      },
                    }),
                    new TextRun({ text: "   " })
                  ] : []),
                  new TextRun({
                    text: companyName,
                    bold: true,
                    size: 36,
                    color: hexToDocxColor(colors.primary)
                  }),
                  ...(logoBuffer && custom.logoPosition === 'right' ? [
                    new TextRun({ text: "   " }),
                    new ImageRun({
                      data: logoBuffer,
                      transformation: {
                        width: 120,
                        height: 80,
                      },
                    })
                  ] : [])
                ],
                alignment: custom.logoPosition === 'center' ? AlignmentType.CENTER : 
                          custom.logoPosition === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
                spacing: { after: 300 }
              })
            ]
          })
        },
        footers: custom.footerStyle !== 'none' ? {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `${address} | ${phone} | ${email} | ${website}`, 
                    size: 18,
                    color: hexToDocxColor(colors.secondary)
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 }
              })
            ]
          })
        } : undefined,
        children: [
          new Paragraph({
            text: "",
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Dear [Recipient],",
                size: 24
              })
            ],
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This is your professional letterhead template. Replace this content with your actual letter content.",
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This modern design incorporates your brand colors and maintains professional standards while providing ample space for your correspondence.",
                size: 22
              })
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Best regards,",
                size: 22
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "[Your Name]",
                size: 22,
                bold: true
              })
            ]
          })
        ]
      };

    case 'corporate_classic':
      return {
        properties: {
          page: {
            margin: {
              top: marginSize,
              bottom: marginSize,
              left: marginSize,
              right: marginSize
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: logoBuffer ? [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: {
                      width: 150,
                      height: 100,
                    },
                  })
                ] : [],
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: companyName.toUpperCase(),
                    bold: true,
                    size: 40,
                    color: hexToDocxColor(colors.primary)
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: "Excellence in Business Solutions",
                    size: 20,
                    italics: true,
                    color: hexToDocxColor(colors.secondary)
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { after: 300 }
              })
            ]
          })
        },
        footers: custom.footerStyle !== 'none' ? {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `📍 ${address} • 📞 ${phone} • ✉️ ${email} • 🌐 ${website}`, 
                    size: 18,
                    color: "FFFFFF"
                  })
                ],
                alignment: AlignmentType.CENTER,
                shading: {
                  type: ShadingType.SOLID,
                  color: hexToDocxColor(colors.primary)
                },
                spacing: { before: 200, after: 200 }
              })
            ]
          })
        } : undefined,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: new Date().toLocaleDateString(),
                size: 20,
                color: hexToDocxColor(colors.secondary)
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Dear Valued Client,",
                size: 24
              })
            ],
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This classic corporate design maintains professionalism while incorporating your brand identity seamlessly.",
                size: 22
              })
            ],
            spacing: { after: 300 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Our commitment to excellence is reflected in every aspect of our communication, including this carefully designed letterhead template.",
                size: 22
              })
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Sincerely,",
                size: 22
              })
            ],
            spacing: { after: 400 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "[Your Name]",
                size: 22,
                bold: true
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "[Your Title]",
                size: 20,
                color: hexToDocxColor(colors.secondary)
              })
            ]
          })
        ]
      };

    case 'minimalist_top':
      return {
        properties: {
          page: {
            margin: {
              top: marginSize,
              bottom: marginSize,
              left: marginSize,
              right: marginSize
            }
          }
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: logoBuffer ? [
                  new ImageRun({
                    data: logoBuffer,
                    transformation: {
                      width: 100,
                      height: 60,
                    },
                  })
                ] : [],
                alignment: custom.logoPosition === 'center' ? AlignmentType.CENTER : 
                          custom.logoPosition === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
                spacing: { after: 200 }
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: companyName,
                    size: 28,
                    color: hexToDocxColor(colors.text)
                  })
                ],
                alignment: custom.logoPosition === 'center' ? AlignmentType.CENTER : 
                          custom.logoPosition === 'right' ? AlignmentType.RIGHT : AlignmentType.LEFT,
                spacing: { after: 200 }
              })
            ]
          })
        },
        footers: custom.footerStyle !== 'none' ? {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({ 
                    text: `${address} • ${phone} • ${email} • ${website}`, 
                    size: 16,
                    color: hexToDocxColor(colors.secondary)
                  })
                ],
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 }
              })
            ]
          })
        } : undefined,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: new Date().toLocaleDateString(),
                size: 20,
                color: hexToDocxColor(colors.secondary)
              })
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Dear [Recipient],",
                size: 24
              })
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "This minimalist design focuses on clarity and simplicity, perfect for modern business communication.",
                size: 22
              })
            ],
            spacing: { after: 600 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Best regards,",
                size: 22
              })
            ],
            spacing: { after: 200 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "[Your Name]",
                size: 22,
                bold: true
              })
            ]
          })
        ]
      };

    default:
      return generateWordSection('modern_header', brandIdentity, custom, logoBuffer, hexToDocxColor);
  }
}

// Generate complete HTML for templates
function generateTemplateHTML(templateId, brand, custom, isPreview = false) {
  if (!brand) return '';

  const scale = isPreview ? 0.3 : 1;
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

  // For the full HTML templates, I'll use the same structure as in the client component
  // but adapted for server-side generation
  
  const logoUrl = brand.logoPath || '/api/placeholder/150/60';
  
  switch (templateId) {
    case 'modern_header':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${brand.companyName} Letterhead</title>
          <style>
            body { ${baseStyles} }
            @page { margin: 0; size: A4; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div style="transform: scale(${scale}); transform-origin: top left; width: ${100/scale}%; height: ${isPreview ? '400px' : '11in'};">
            <header style="background: linear-gradient(135deg, ${brand.colors.primary} 0%, ${brand.colors.secondary} 100%); height: ${headerHeight}; padding: ${margins}; display: flex; align-items: center; justify-content: space-between; color: white;">
              <div style="display: flex; align-items: center; gap: 20px;">
                ${custom.logoPosition === 'left' || custom.logoPosition === 'center' ? `<img src="${logoUrl}" alt="Logo" style="height: 50px; filter: brightness(0) invert(1);">` : ''}
                <div>
                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; font-family: '${brand.fonts.headline}';">${brand.companyName}</h1>
                </div>
              </div>
              ${custom.logoPosition === 'right' ? `<img src="${logoUrl}" alt="Logo" style="height: 50px; filter: brightness(0) invert(1);">` : ''}
            </header>
            <main style="padding: ${margins}; min-height: 400px;">
              <p style="color: #666; font-style: italic; margin-bottom: 30px;">Professional letterhead template with modern design</p>
              <p>Dear [Recipient],</p>
              <br>
              <p>This is your custom letterhead template. Replace this content with your actual letter content.</p>
              <br>
              <p>This modern design incorporates your brand colors and maintains professional standards while providing ample space for your correspondence.</p>
              <br>
              <p>Best regards,</p>
              <br>
              <p><strong>[Your Name]</strong></p>
            </main>
            ${custom.footerStyle !== 'none' ? `
              <footer style="border-top: 3px solid ${brand.colors.primary}; padding: 20px ${margins}; background: #f8fafc; margin-top: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; font-size: 11px; color: #64748b;">
                  <div>${brand.address}</div>
                  <div style="display: flex; gap: 15px;">
                    <span>📞 ${brand.phone}</span>
                    <span>✉️ ${brand.email}</span>
                    <span>🌐 ${brand.website}</span>
                  </div>
                </div>
              </footer>
            ` : ''}
            ${custom.includeWatermark ? `
              <div style="position: absolute; bottom: 50px; right: 50px; opacity: 0.1; transform: rotate(-45deg); font-size: 48px; font-weight: bold; color: ${brand.colors.primary}; pointer-events: none;">
                ${brand.companyName}
              </div>
            ` : ''}
          </div>
        </body>
        </html>
      `;

    case 'elegant_sidebar':
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${brand.companyName} Letterhead</title>
          <style>
            body { ${baseStyles} }
            @page { margin: 0; size: A4; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div style="transform: scale(${scale}); transform-origin: top left; width: ${100/scale}%; height: ${isPreview ? '400px' : '11in'}; display: flex;">
            <aside style="width: 200px; background: ${brand.colors.primary}; color: white; padding: ${margins}; display: flex; flex-direction: column; gap: 30px;">
              <div style="text-align: center;">
                <img src="${logoUrl}" alt="Logo" style="width: 100px; height: auto; filter: brightness(0) invert(1); margin-bottom: 20px;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; font-family: '${brand.fonts.headline}';">${brand.companyName}</h2>
              </div>
              <div style="font-size: 10px; line-height: 1.8;">
                <div style="margin-bottom: 15px;">
                  <strong>Address:</strong><br>
                  ${brand.address}
                </div>
                <div style="margin-bottom: 15px;">
                  <strong>Phone:</strong><br>
                  ${brand.phone}
                </div>
                <div style="margin-bottom: 15px;">
                  <strong>Email:</strong><br>
                  ${brand.email}
                </div>
                <div>
                  <strong>Website:</strong><br>
                  ${brand.website}
                </div>
              </div>
            </aside>
            <main style="flex: 1; padding: ${margins}; background: white;">
              <div style="border-bottom: 2px solid ${brand.colors.accent}; padding-bottom: 20px; margin-bottom: 30px;">
                <h1 style="margin: 0; color: ${brand.colors.primary}; font-family: '${brand.fonts.headline}'; font-size: 24px;">Letter</h1>
                <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${new Date().toLocaleDateString()}</p>
              </div>
              <div style="color: #333; line-height: 1.8;">
                <p>Dear [Recipient],</p>
                <br>
                <p>This elegant sidebar design provides a sophisticated look for your professional correspondence.</p>
                <br>
                <p>The sidebar contains all your contact information while keeping the main content area clean and focused.</p>
                <br>
                <p>Best regards,</p>
                <br>
                <p><strong>[Your Name]</strong></p>
              </div>
            </main>
          </div>
        </body>
        </html>
      `;

    // Add other templates following the same pattern...
    default:
      return generateTemplateHTML('modern_header', brand, custom, isPreview);
  }
}

module.exports = { generateLetterhead }; 