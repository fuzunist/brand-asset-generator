const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Header, Footer, Table, TableRow, TableCell, BorderStyle, WidthType } = require("docx");
const sharp = require("sharp");
const fs = require("fs").promises;
const path = require("path");

const generateDocument = async (brandIdentity, templateType, formData) => {
    console.log("Generating document with data:", { brandIdentity, templateType, formData });

    // For this MVP, we'll use a local example logo.
    const logoPath = path.join(__dirname, '..', 'example_logo.png');
    let logoBuffer;
    try {
        logoBuffer = await sharp(logoPath)
            .resize({ height: 40 })
            .png()
            .toBuffer();
    } catch (error) {
        console.error("Error processing logo:", error);
        logoBuffer = null; // Continue without logo if processing fails
    }

    const doc = new Document({
        creator: "BrandBuilder",
        title: formData.projectName || "Document",
        description: `A ${templateType} for ${formData.clientName}`,
        styles: {
            paragraphStyles: [
                {
                    id: "Heading1",
                    name: "Heading 1",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 32, // 16pt
                        bold: true,
                        color: brandIdentity.colors.primary.replace("#", ""),
                    },
                },
                {
                    id: "Heading2",
                    name: "Heading 2",
                    basedOn: "Normal",
                    next: "Normal",
                    quickFormat: true,
                    run: {
                        size: 28, // 14pt
                        bold: true,
                        color: "666666",
                    },
                },
                {
                    id: "BodyText",
                    name: "Body Text",
                    basedOn: "Normal",
                    quickFormat: true,
                    run: {
                        size: 22, // 11pt
                    },
                },
                {
                    id: "SmallText",
                    name: "Small Text",
                    basedOn: "Normal",
                    quickFormat: true,
                    run: {
                        size: 18, // 9pt
                        color: "666666",
                    },
                },
            ],
        },
        sections: [{
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun(""), // Placeholder for the image
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    text: `${brandIdentity.companyName} | ${brandIdentity.contact.address} | ${brandIdentity.contact.phone} | ${brandIdentity.contact.website}`,
                                    size: 18, // 9pt
                                }),
                            ],
                        }),
                    ],
                }),
            },
            children: generateDocumentContent(templateType, formData, brandIdentity),
        }],
    });

    // This is a bit of a workaround to add the image to the header after creation
    doc.sections[0].Header.default.root[0].root.push(
        new TextRun("").addChildElement(doc.sections[0].createImage(logoBuffer))
    );

    const buffer = await Packer.toBuffer(doc);
    return buffer;
};

const generateDocumentContent = (templateType, formData, brandIdentity) => {
    const content = [];

    switch (templateType) {
        case 'proposal':
            return generateProposalContent(formData, brandIdentity);
        case 'contract':
            return generateContractContent(formData, brandIdentity);
        case 'invoice':
            return generateInvoiceContent(formData, brandIdentity);
        case 'quote':
            return generateQuoteContent(formData, brandIdentity);
        case 'report':
            return generateReportContent(formData, brandIdentity);
        case 'letter':
            return generateLetterContent(formData, brandIdentity);
        default:
            return generateProposalContent(formData, brandIdentity);
    }
};

const generateProposalContent = (formData, brandIdentity) => {
    return [
        new Paragraph({
            text: `Sales Proposal: ${formData.projectName}`,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Prepared for: ${formData.clientName}` })],
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Date: ${new Date(formData.date).toLocaleDateString()}` })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "Project Overview",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: formData.projectScope })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "Investment",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Total Project Cost: $${formData.totalPrice}` })],
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Payment Terms: ${formData.paymentTerms || 'Net 30 days'}` })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "Next Steps",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: "Please review this proposal and let us know if you have any questions. We look forward to working with you on this exciting project." })],
            spacing: { after: 200 },
        }),
        ...(formData.notes ? [
            new Paragraph({
                text: "Additional Notes",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                style: "BodyText",
                children: [new TextRun({ text: formData.notes })],
                spacing: { after: 200 },
            })
        ] : [])
    ];
};

const generateContractContent = (formData, brandIdentity) => {
    return [
        new Paragraph({
            text: `Service Agreement`,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `This Service Agreement ("Agreement") is entered into on ${new Date(formData.date).toLocaleDateString()} between ${brandIdentity.companyName} ("Service Provider") and ${formData.clientName} ("Client") for the project titled "${formData.projectName}".` })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "1. Scope of Work",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: formData.projectScope })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "2. Compensation",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `The total compensation for the services outlined in this agreement shall be $${formData.totalPrice}.` })],
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Payment Terms: ${formData.paymentTerms || 'Net 30 days'}` })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "3. Timeline",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Project completion date: ${formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'To be determined'}` })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "4. Terms and Conditions",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: "This agreement shall be governed by the laws of the applicable jurisdiction. Any modifications to this agreement must be made in writing and signed by both parties." })],
            spacing: { after: 400 },
        }),
        ...(formData.notes ? [
            new Paragraph({
                text: "Additional Terms",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                style: "BodyText",
                children: [new TextRun({ text: formData.notes })],
                spacing: { after: 400 },
            })
        ] : []),
        new Paragraph({
            text: "Signatures",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 600, after: 300 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `${brandIdentity.companyName}: _________________________ Date: _____________` })],
            spacing: { after: 300 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `${formData.clientName}: _________________________ Date: _____________` })],
            spacing: { after: 200 },
        })
    ];
};

const generateInvoiceContent = (formData, brandIdentity) => {
    const content = [
        new Paragraph({
            text: "INVOICE",
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Invoice for: ${formData.projectName}` })],
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Bill To: ${formData.clientName}` })],
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Invoice Date: ${new Date(formData.date).toLocaleDateString()}` })],
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Due Date: ${formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'Upon receipt'}` })],
            spacing: { after: 400 },
        })
    ];

    // Add items table if items exist
    if (formData.items && formData.items.length > 0) {
        const tableRows = [
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ text: "Description", style: "BodyText" })],
                        width: { size: 50, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Qty", style: "BodyText", alignment: AlignmentType.CENTER })],
                        width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Rate", style: "BodyText", alignment: AlignmentType.RIGHT })],
                        width: { size: 20, type: WidthType.PERCENTAGE },
                    }),
                    new TableCell({
                        children: [new Paragraph({ text: "Total", style: "BodyText", alignment: AlignmentType.RIGHT })],
                        width: { size: 15, type: WidthType.PERCENTAGE },
                    }),
                ],
            })
        ];

        formData.items.forEach(item => {
            tableRows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ text: item.description, style: "BodyText" })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: item.quantity.toString(), style: "BodyText", alignment: AlignmentType.CENTER })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: `$${item.rate.toFixed(2)}`, style: "BodyText", alignment: AlignmentType.RIGHT })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: `$${(item.quantity * item.rate).toFixed(2)}`, style: "BodyText", alignment: AlignmentType.RIGHT })],
                        }),
                    ],
                })
            );
        });

        const total = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
        
        content.push(
            new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
            }),
            new Paragraph({ text: "", spacing: { after: 300 } }),
            new Paragraph({
                style: "BodyText",
                children: [new TextRun({ text: `Total Amount: $${total.toFixed(2)}`, bold: true })],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 400 },
            })
        );
    } else {
        content.push(
            new Paragraph({
                style: "BodyText",
                children: [new TextRun({ text: `Amount Due: $${formData.totalPrice}`, bold: true })],
                alignment: AlignmentType.RIGHT,
                spacing: { after: 400 },
            })
        );
    }

    content.push(
        new Paragraph({
            text: "Payment Information",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Payment Terms: ${formData.paymentTerms || 'Net 30 days'}` })],
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "SmallText",
            children: [new TextRun({ text: "Thank you for your business!" })],
            spacing: { after: 200 },
        })
    );

    if (formData.notes) {
        content.push(
            new Paragraph({
                text: "Notes",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                style: "BodyText",
                children: [new TextRun({ text: formData.notes })],
                spacing: { after: 200 },
            })
        );
    }

    return content;
};

const generateQuoteContent = (formData, brandIdentity) => {
    return generateInvoiceContent(formData, brandIdentity).map((paragraph, index) => {
        if (index === 0) {
            return new Paragraph({
                text: "PRICE QUOTE",
                heading: HeadingLevel.HEADING_1,
                spacing: { after: 300 },
                alignment: AlignmentType.CENTER,
            });
        }
        return paragraph;
    });
};

const generateReportContent = (formData, brandIdentity) => {
    return [
        new Paragraph({
            text: formData.projectName,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 300 },
            alignment: AlignmentType.CENTER,
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Prepared for: ${formData.clientName}` })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Date: ${new Date(formData.date).toLocaleDateString()}` })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
        }),
        new Paragraph({
            text: "Executive Summary",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: formData.projectScope })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "Findings and Analysis",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: "Detailed analysis and findings will be provided based on the scope of work outlined above." })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            text: "Recommendations",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: "Based on our analysis, we recommend the following actions and next steps." })],
            spacing: { after: 400 },
        }),
        ...(formData.notes ? [
            new Paragraph({
                text: "Additional Notes",
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 },
            }),
            new Paragraph({
                style: "BodyText",
                children: [new TextRun({ text: formData.notes })],
                spacing: { after: 200 },
            })
        ] : [])
    ];
};

const generateLetterContent = (formData, brandIdentity) => {
    return [
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: new Date(formData.date).toLocaleDateString() })],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 400 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: formData.clientName })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: `Re: ${formData.projectName}` })],
            spacing: { after: 400 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: "Dear Sir/Madam," })],
            spacing: { after: 300 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: formData.projectScope })],
            spacing: { after: 300 },
        }),
        ...(formData.notes ? [
            new Paragraph({
                style: "BodyText",
                children: [new TextRun({ text: formData.notes })],
                spacing: { after: 300 },
            })
        ] : []),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: "Thank you for your attention to this matter." })],
            spacing: { after: 300 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: "Sincerely," })],
            spacing: { after: 600 },
        }),
        new Paragraph({
            style: "BodyText",
            children: [new TextRun({ text: brandIdentity.companyName })],
            spacing: { after: 200 },
        })
    ];
};

module.exports = { generateDocument }; 