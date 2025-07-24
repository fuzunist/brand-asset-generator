// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Modal and form elements
const formModal = document.getElementById('formModal');
const documentForm = document.getElementById('documentForm');
const modalTitle = document.getElementById('modalTitle');
const templateTypeInput = document.getElementById('templateType');
const contractFields = document.getElementById('contractFields');
const generateBtn = document.getElementById('generateBtn');

// Template cards
const templateCards = document.querySelectorAll('.template-card');

// Add click event to template cards
templateCards.forEach(card => {
    card.addEventListener('click', () => {
        const templateType = card.dataset.template;
        openModal(templateType);
    });
});

// Open modal function
function openModal(templateType) {
    templateTypeInput.value = templateType;
    
    // Set modal title
    if (templateType === 'proposal') {
        modalTitle.textContent = 'Satış Teklifi Oluştur';
        contractFields.classList.add('hidden');
        // Make contract fields not required
        document.querySelector('input[name="startDate"]').removeAttribute('required');
        document.querySelector('input[name="endDate"]').removeAttribute('required');
    } else {
        modalTitle.textContent = 'Hizmet Sözleşmesi Oluştur';
        contractFields.classList.remove('hidden');
        // Make contract fields required
        document.querySelector('input[name="startDate"]').setAttribute('required', 'required');
        document.querySelector('input[name="endDate"]').setAttribute('required', 'required');
    }
    
    // Set today's date as default
    document.querySelector('input[name="date"]').value = new Date().toISOString().split('T')[0];
    
    // Show modal
    formModal.classList.remove('hidden');
}

// Close modal function
function closeModal() {
    formModal.classList.add('hidden');
    documentForm.reset();
}

// Handle form submission
documentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Disable button and show loading state
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Oluşturuluyor...';
    
    // Collect form data
    const formData = new FormData(documentForm);
    const data = {
        templateType: formData.get('templateType'),
        formData: {
            clientName: formData.get('clientName'),
            projectName: formData.get('projectName'),
            projectScope: formData.get('projectScope'),
            totalPrice: parseFloat(formData.get('totalPrice')),
            date: formData.get('date')
        }
    };
    
    // Add contract-specific fields if needed
    if (data.templateType === 'contract') {
        data.formData.startDate = formData.get('startDate');
        data.formData.endDate = formData.get('endDate');
    }
    
    try {
        // Make API request
        const response = await fetch(`${API_BASE_URL}/documents/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Döküman oluşturulurken bir hata oluştu');
        }
        
        // Get the blob from response
        const blob = await response.blob();
        
        // Get filename from Content-Disposition header
        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : `dokuman_${Date.now()}.docx`;
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Show success message
        showNotification('Döküman başarıyla oluşturuldu ve indirildi!', 'success');
        
        // Close modal
        closeModal();
        
    } catch (error) {
        console.error('Error:', error);
        showNotification(error.message, 'error');
    } finally {
        // Reset button state
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-download mr-2"></i>Döküman Oluştur';
    }
});

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white transition-all duration-300 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${
                type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle'
            } mr-2"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('opacity-0');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Close modal when clicking outside
formModal.addEventListener('click', (e) => {
    if (e.target === formModal) {
        closeModal();
    }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !formModal.classList.contains('hidden')) {
        closeModal();
    }
});