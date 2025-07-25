const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs').promises;
const path = require('path');

class DocumentGenerator {
    async generateProposal(data) {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "PROJECT PROPOSAL",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Client: ",
                                bold: true,
                            }),
                            new TextRun({
                                text: data.clientName || "Client Name",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Project: ",
                                bold: true,
                            }),
                            new TextRun({
                                text: data.projectName || "Project Name",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Date: ",
                                bold: true,
                            }),
                            new TextRun({
                                text: new Date(data.proposalDate || Date.now()).toLocaleDateString(),
                            }),
                        ],
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "Project Overview",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.projectDescription || "Project description goes here.",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "Timeline",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.timeline || "Project timeline information.",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "Budget",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.budget || "Budget information.",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "Deliverables",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.deliverables || "List of deliverables.",
                    }),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
    }

    async generateContract(data) {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        text: "SERVICE CONTRACT",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "This Service Contract (\"Contract\") is entered into on ",
                            }),
                            new TextRun({
                                text: new Date(data.contractDate || Date.now()).toLocaleDateString(),
                                bold: true,
                            }),
                            new TextRun({
                                text: " between:",
                            }),
                        ],
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Client: ",
                                bold: true,
                            }),
                            new TextRun({
                                text: data.clientName || "Client Name",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "Service Provider: ",
                                bold: true,
                            }),
                            new TextRun({
                                text: "Your Company Name",
                            }),
                        ],
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "1. Project Description",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.projectDescription || "Project description goes here.",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "2. Timeline",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.timeline || "Project timeline.",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "3. Payment Terms",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.paymentTerms || "Payment terms and conditions.",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "4. Terms and Conditions",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: data.terms || "Additional terms and conditions.",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        text: "Signatures",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: "",
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: "_______________________",
                            }),
                            new TextRun({
                                text: "                    ",
                            }),
                            new TextRun({
                                text: "_______________________",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: data.signatoryName || "Client Representative",
                            }),
                            new TextRun({
                                text: "                         ",
                            }),
                            new TextRun({
                                text: "Service Provider",
                            }),
                        ],
                    }),
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: data.signatoryTitle || "Title",
                            }),
                            new TextRun({
                                text: "                                        ",
                            }),
                            new TextRun({
                                text: "Title",
                            }),
                        ],
                    }),
                ],
            }],
        });

        const buffer = await Packer.toBuffer(doc);
        return buffer;
    }
}

module.exports = new DocumentGenerator(); 