const {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageBreak,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  convertInchesToTwip,
  ImageRun
} = require('docx');

const generateProposal = async (data) => {
  const {
    clientName,
    projectName,
    projectScope,
    totalPrice,
    date,
    companyName,
    companyTagline,
    companyAddress,
    companyCity,
    companyPhone,
    companyEmail,
    companyWebsite,
    primaryColor,
    logoBuffer
  } = data;

  // Format date
  const formattedDate = new Date(date).toLocaleDateString('tr-TR');
  const formattedPrice = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(totalPrice);

  // Create document
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
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
                    height: 50,
                  },
                }),
              ] : [
                new TextRun({
                  text: companyName,
                  bold: true,
                  size: 28,
                  color: primaryColor.replace('#', ''),
                }),
              ],
              alignment: AlignmentType.RIGHT,
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `${companyAddress}, ${companyCity} | `,
                  size: 18,
                  color: '666666',
                }),
                new TextRun({
                  text: `Tel: ${companyPhone} | `,
                  size: 18,
                  color: '666666',
                }),
                new TextRun({
                  text: companyWebsite,
                  size: 18,
                  color: primaryColor.replace('#', ''),
                }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
      children: [
        // Title
        new Paragraph({
          text: 'SATIŞ TEKLİFİ',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        }),

        // Date
        new Paragraph({
          children: [
            new TextRun({
              text: `Tarih: ${formattedDate}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: {
            after: 400,
          },
        }),

        // Client Info
        new Paragraph({
          text: 'Sayın,',
          size: 24,
          spacing: {
            after: 200,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: clientName,
              bold: true,
              size: 28,
            }),
          ],
          spacing: {
            after: 400,
          },
        }),

        // Introduction
        new Paragraph({
          text: `${projectName} projesi için hazırlamış olduğumuz teklifi bilgilerinize sunarız.`,
          size: 24,
          spacing: {
            after: 400,
          },
        }),

        // Project Details Section
        new Paragraph({
          text: 'PROJE DETAYLARI',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        // Project Name
        new Paragraph({
          children: [
            new TextRun({
              text: 'Proje Adı: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: projectName,
              size: 24,
            }),
          ],
          spacing: {
            after: 200,
          },
        }),

        // Project Scope
        new Paragraph({
          text: 'Proje Kapsamı:',
          bold: true,
          size: 24,
          spacing: {
            after: 100,
          },
        }),
        new Paragraph({
          text: projectScope,
          size: 24,
          spacing: {
            after: 400,
          },
        }),

        // Pricing Section
        new Paragraph({
          text: 'FİYATLANDIRMA',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        // Price Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    text: 'Hizmet',
                    bold: true,
                    alignment: AlignmentType.CENTER,
                  })],
                  shading: {
                    fill: 'E5E7EB',
                  },
                }),
                new TableCell({
                  children: [new Paragraph({ 
                    text: 'Tutar',
                    bold: true,
                    alignment: AlignmentType.CENTER,
                  })],
                  shading: {
                    fill: 'E5E7EB',
                  },
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph(projectName)],
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: formattedPrice,
                    alignment: AlignmentType.RIGHT,
                  })],
                }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph({ 
                    text: 'TOPLAM',
                    bold: true,
                    alignment: AlignmentType.RIGHT,
                  })],
                  shading: {
                    fill: 'E5E7EB',
                  },
                }),
                new TableCell({
                  children: [new Paragraph({
                    text: formattedPrice,
                    bold: true,
                    alignment: AlignmentType.RIGHT,
                  })],
                  shading: {
                    fill: 'E5E7EB',
                  },
                }),
              ],
            }),
          ],
        }),

        // Terms
        new Paragraph({
          text: 'TEKLİF ŞARTLARI',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        new Paragraph({
          text: '• Bu teklif 30 gün geçerlidir.',
          size: 24,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: '• Fiyatlara KDV dahil değildir.',
          size: 24,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: '• Ödeme koşulları: %50 başlangıç, %50 teslimatta.',
          size: 24,
          spacing: { after: 400 },
        }),

        // Closing
        new Paragraph({
          text: 'Teklifimizin kabul görmesi temennisiyle, saygılarımızı sunarız.',
          size: 24,
          spacing: {
            before: 400,
            after: 400,
          },
        }),

        // Signature
        new Paragraph({
          text: companyName,
          bold: true,
          size: 28,
          color: primaryColor.replace('#', ''),
          alignment: AlignmentType.RIGHT,
        }),
        new Paragraph({
          text: companyTagline,
          size: 24,
          italics: true,
          color: '666666',
          alignment: AlignmentType.RIGHT,
        }),
      ],
    }],
  });

  return doc;
};

module.exports = {
  generateProposal
};