const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testBrandBookGenerator() {
    console.log('Starting brand book generator test...');

    // 1. Prepare the data
    const logoPath = path.join(__dirname, '..', 'Gradients Set Bright Colours.eps'); // Using the provided .eps as a stand-in. Note: server expects SVG. This might fail if SVG parsing is strict.
    const brandIdentity = {
        name: 'Test Brand',
        colors: {
            primary: '#FF6347',   // Tomato
            secondary: '#4682B4'  // SteelBlue
        },
        fonts: {
            headline: 'Montserrat',
            body: 'Lato'
        }
    };

    // 2. Create form data
    const form = new FormData();
    form.append('logo', fs.createReadStream(logoPath));
    form.append('brandIdentity', JSON.stringify(brandIdentity));

    // 3. Make the API request
    try {
        console.log('Sending request to http://localhost:3001/api/brand-book/generate');
        const response = await axios.post('http://localhost:3001/api/brand-book/generate', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': 'Bearer dev-token' // Dev bypass token
            },
            responseType: 'arraybuffer' // Important to receive the PDF as a buffer
        });

        // 4. Save the output
        if (response.status === 200) {
            const outputPath = path.join(__dirname, 'TestBrandGuide.pdf');
            fs.writeFileSync(outputPath, response.data);
            console.log(`✅ Success! Brand guide saved to ${outputPath}`);
        } else {
            console.error(`❌ Error: Server responded with status ${response.status}`);
            console.error(response.data.toString());
        }

    } catch (error) {
        console.error('❌ An error occurred during the test:');
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response Data:', error.response.data.toString());
            console.error('Response Status:', error.response.status);
            console.error('Response Headers:', error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request Data:', error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error Message:', error.message);
        }
    }
}

testBrandBookGenerator(); 