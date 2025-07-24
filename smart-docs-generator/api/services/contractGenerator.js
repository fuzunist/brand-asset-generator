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
  ImageRun,
  UnderlineType
} = require('docx');

const generateContract = async (data) => {
  const {
    clientName,
    projectName,
    projectScope,
    totalPrice,
    date,
    startDate,
    endDate,
    companyName,
    companyTagline,
    companyAddress,
    companyCity,
    companyPhone,
    companyEmail,
    companyWebsite,
    primaryColor,
    taxNumber,
    taxOffice,
    logoBuffer
  } = data;

  // Format dates
  const formattedDate = new Date(date).toLocaleDateString('tr-TR');
  const formattedStartDate = new Date(startDate).toLocaleDateString('tr-TR');
  const formattedEndDate = new Date(endDate).toLocaleDateString('tr-TR');
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
          text: 'HİZMET SÖZLEŞMESİ',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        }),

        // Contract Date
        new Paragraph({
          children: [
            new TextRun({
              text: `Sözleşme Tarihi: ${formattedDate}`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.RIGHT,
          spacing: {
            after: 400,
          },
        }),

        // Parties Section
        new Paragraph({
          text: 'TARAFLAR',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        // Service Provider
        new Paragraph({
          children: [
            new TextRun({
              text: 'HİZMET SAĞLAYICI: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: companyName,
              size: 24,
            }),
          ],
          spacing: {
            after: 100,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Adres: ${companyAddress}, ${companyCity}`,
              size: 22,
            }),
          ],
          spacing: {
            after: 100,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Vergi No: ${taxNumber} - ${taxOffice}`,
              size: 22,
            }),
          ],
          spacing: {
            after: 200,
          },
        }),

        // Client
        new Paragraph({
          children: [
            new TextRun({
              text: 'HİZMET ALAN: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: clientName,
              size: 24,
            }),
          ],
          spacing: {
            after: 400,
          },
        }),

        // Subject Section
        new Paragraph({
          text: 'SÖZLEŞMENİN KONUSU',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        new Paragraph({
          text: `İşbu sözleşme, ${companyName} tarafından ${clientName} için gerçekleştirilecek "${projectName}" projesine ilişkin hizmetleri kapsamaktadır.`,
          size: 24,
          spacing: {
            after: 200,
          },
        }),

        // Scope Section
        new Paragraph({
          text: 'HİZMET KAPSAMI',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        new Paragraph({
          text: projectScope,
          size: 24,
          spacing: {
            after: 400,
          },
        }),

        // Duration Section
        new Paragraph({
          text: 'SÖZLEŞMENİN SÜRESİ',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Başlangıç Tarihi: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: formattedStartDate,
              size: 24,
            }),
          ],
          spacing: {
            after: 100,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Bitiş Tarihi: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: formattedEndDate,
              size: 24,
            }),
          ],
          spacing: {
            after: 400,
          },
        }),

        // Payment Section
        new Paragraph({
          text: 'ÖDEME KOŞULLARI',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        new Paragraph({
          children: [
            new TextRun({
              text: 'Toplam Hizmet Bedeli: ',
              bold: true,
              size: 24,
            }),
            new TextRun({
              text: formattedPrice,
              size: 24,
              bold: true,
              underline: {
                type: UnderlineType.SINGLE,
              },
            }),
            new TextRun({
              text: ' + KDV',
              size: 24,
            }),
          ],
          spacing: {
            after: 200,
          },
        }),

        new Paragraph({
          text: 'Ödeme Planı:',
          bold: true,
          size: 24,
          spacing: {
            after: 100,
          },
        }),

        new Paragraph({
          text: '• %50 Sözleşme imzalandığında',
          size: 24,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: '• %50 Proje tesliminde',
          size: 24,
          spacing: { after: 400 },
        }),

        // General Terms
        new Paragraph({
          text: 'GENEL ŞARTLAR',
          heading: HeadingLevel.HEADING_2,
          color: primaryColor.replace('#', ''),
          spacing: {
            before: 400,
            after: 200,
          },
        }),

        new Paragraph({
          text: '1. Taraflar, bu sözleşmeden doğan yükümlülüklerini zamanında ve eksiksiz olarak yerine getirmeyi kabul ve taahhüt eder.',
          size: 22,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: '2. Hizmet sağlayıcı, işbu sözleşme kapsamındaki hizmetleri profesyonel standartlarda sunmayı taahhüt eder.',
          size: 22,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: '3. Proje kapsamında üretilen tüm fikri mülkiyet hakları, ödeme tamamlandıktan sonra hizmet alana devredilecektir.',
          size: 22,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: '4. Taraflar, gizlilik ilkesine uygun hareket edecek ve birbirlerine ait gizli bilgileri üçüncü şahıslarla paylaşmayacaktır.',
          size: 22,
          spacing: { after: 100 },
        }),
        new Paragraph({
          text: '5. Bu sözleşmeden doğan anlaşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.',
          size: 22,
          spacing: { after: 400 },
        }),

        // Signatures
        new PageBreak(),
        new Paragraph({
          text: 'İmzalar',
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.CENTER,
          spacing: {
            before: 400,
            after: 400,
          },
        }),

        // Signature Table
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: 'HİZMET SAĞLAYICI',
                      bold: true,
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      text: companyName,
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100 },
                    }),
                    new Paragraph({
                      text: '\n\n\n',
                      spacing: { before: 400 },
                    }),
                    new Paragraph({
                      text: '_____________________',
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      text: 'İmza',
                      alignment: AlignmentType.CENTER,
                      size: 20,
                    }),
                  ],
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE,
                  },
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: 'HİZMET ALAN',
                      bold: true,
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      text: clientName,
                      alignment: AlignmentType.CENTER,
                      spacing: { before: 100 },
                    }),
                    new Paragraph({
                      text: '\n\n\n',
                      spacing: { before: 400 },
                    }),
                    new Paragraph({
                      text: '_____________________',
                      alignment: AlignmentType.CENTER,
                    }),
                    new Paragraph({
                      text: 'İmza',
                      alignment: AlignmentType.CENTER,
                      size: 20,
                    }),
                  ],
                  width: {
                    size: 50,
                    type: WidthType.PERCENTAGE,
                  },
                }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  return doc;
};

module.exports = {
  generateContract
};