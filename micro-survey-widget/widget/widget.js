(function() {
    'use strict';
    
    // Configuration
    const API_BASE_URL = 'https://api.brandos.com/api/public';
    const WIDGET_VERSION = '1.0.0';
    
    // Widget styles (will be injected into iframe)
    const WIDGET_STYLES = `
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
            background: transparent;
        }
        
        .brandos-widget {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 20px;
            max-width: 320px;
            z-index: 999999;
            transition: all 0.3s ease;
        }
        
        .brandos-widget.minimized {
            transform: translateY(calc(100% + 20px));
        }
        
        .brandos-widget-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        
        .brandos-widget-title {
            font-size: 16px;
            font-weight: 600;
            color: #1a1a1a;
        }
        
        .brandos-widget-close {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #666;
            font-size: 20px;
            line-height: 1;
        }
        
        .brandos-widget-close:hover {
            color: #333;
        }
        
        .brandos-widget-question {
            margin-bottom: 16px;
            font-size: 15px;
            color: #333;
        }
        
        .brandos-widget-options {
            display: flex;
            gap: 8px;
            flex-direction: column;
        }
        
        .brandos-widget-option {
            background: #f5f5f5;
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 12px 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: center;
            font-size: 14px;
            font-weight: 500;
        }
        
        .brandos-widget-option:hover {
            background: #e8e8e8;
            border-color: #007bff;
        }
        
        .brandos-widget-option:active {
            transform: scale(0.98);
        }
        
        .brandos-widget-options.poll {
            flex-direction: row;
        }
        
        .brandos-widget-options.poll .brandos-widget-option {
            flex: 1;
        }
        
        .brandos-widget-stars {
            display: flex;
            gap: 8px;
            justify-content: center;
        }
        
        .brandos-widget-star {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 28px;
            color: #ddd;
            transition: color 0.2s ease;
            padding: 0;
        }
        
        .brandos-widget-star:hover,
        .brandos-widget-star.active {
            color: #ffc107;
        }
        
        .brandos-widget-thank-you {
            text-align: center;
            padding: 20px 0;
            font-size: 16px;
            color: #28a745;
        }
        
        .brandos-widget-error {
            text-align: center;
            padding: 20px 0;
            font-size: 14px;
            color: #dc3545;
        }
        
        .brandos-widget-loading {
            text-align: center;
            padding: 20px 0;
            color: #666;
        }
        
        .brandos-widget-results {
            margin-top: 16px;
        }
        
        .brandos-widget-result-item {
            margin-bottom: 12px;
        }
        
        .brandos-widget-result-label {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 13px;
            color: #666;
        }
        
        .brandos-widget-result-bar {
            height: 20px;
            background: #f0f0f0;
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }
        
        .brandos-widget-result-fill {
            height: 100%;
            background: #007bff;
            transition: width 0.5s ease;
            border-radius: 4px;
        }
        
        @media (max-width: 640px) {
            .brandos-widget {
                bottom: 0;
                right: 0;
                left: 0;
                max-width: none;
                border-radius: 12px 12px 0 0;
            }
        }
    `;
    
    // Main widget class
    class BrandOSSurveyWidget {
        constructor(container, surveyId) {
            this.container = container;
            this.surveyId = surveyId;
            this.surveyData = null;
            this.iframe = null;
            this.hasVoted = false;
            
            this.init();
        }
        
        async init() {
            try {
                // Create iframe for style isolation
                this.createIframe();
                
                // Load survey data
                await this.loadSurvey();
                
                // Render widget
                this.render();
                
                // Setup event listeners
                this.setupEventListeners();
            } catch (error) {
                console.error('BrandOS Widget Error:', error);
                this.renderError('Failed to load survey');
            }
        }
        
        createIframe() {
            this.iframe = document.createElement('iframe');
            this.iframe.style.cssText = `
                border: none;
                width: 100%;
                height: 100%;
                position: fixed;
                bottom: 0;
                right: 0;
                z-index: 999999;
                background: transparent;
            `;
            
            // Set iframe attributes for security
            this.iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin');
            this.iframe.setAttribute('title', 'BrandOS Survey Widget');
            
            this.container.appendChild(this.iframe);
            
            // Get iframe document
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            
            // Write initial HTML structure
            iframeDoc.open();
            iframeDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>${WIDGET_STYLES}</style>
                </head>
                <body>
                    <div id="brandos-widget-root"></div>
                </body>
                </html>
            `);
            iframeDoc.close();
        }
        
        async loadSurvey() {
            const response = await fetch(`${API_BASE_URL}/surveys/${this.surveyId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Survey not found');
            }
            
            this.surveyData = await response.json();
            this.hasVoted = this.surveyData.hasVoted;
        }
        
        render() {
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            const root = iframeDoc.getElementById('brandos-widget-root');
            
            if (!this.surveyData) {
                root.innerHTML = '<div class="brandos-widget-loading">Loading...</div>';
                return;
            }
            
            let content = `
                <div class="brandos-widget" id="brandos-widget">
                    <div class="brandos-widget-header">
                        <h3 class="brandos-widget-title">Quick Question</h3>
                        <button class="brandos-widget-close" id="brandos-close">×</button>
                    </div>
            `;
            
            if (this.hasVoted) {
                content += `
                    <div class="brandos-widget-thank-you">
                        Thank you for your feedback!
                    </div>
                `;
            } else {
                content += `
                    <div class="brandos-widget-question">${this.escapeHtml(this.surveyData.question)}</div>
                `;
                
                if (this.surveyData.type === 'poll') {
                    content += `
                        <div class="brandos-widget-options poll">
                            <button class="brandos-widget-option" data-value="option1">
                                ${this.escapeHtml(this.surveyData.options.option1)}
                            </button>
                            <button class="brandos-widget-option" data-value="option2">
                                ${this.escapeHtml(this.surveyData.options.option2)}
                            </button>
                        </div>
                    `;
                } else if (this.surveyData.type === 'rating') {
                    content += `
                        <div class="brandos-widget-stars">
                            ${[1, 2, 3, 4, 5].map(i => 
                                `<button class="brandos-widget-star" data-value="${i}">★</button>`
                            ).join('')}
                        </div>
                    `;
                }
            }
            
            content += '</div>';
            
            root.innerHTML = content;
            
            // Adjust iframe size
            setTimeout(() => {
                const widget = iframeDoc.getElementById('brandos-widget');
                if (widget) {
                    const height = widget.offsetHeight + 40;
                    const width = Math.min(360, window.innerWidth);
                    this.iframe.style.height = height + 'px';
                    this.iframe.style.width = width + 'px';
                }
            }, 50);
        }
        
        setupEventListeners() {
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            
            // Close button
            const closeBtn = iframeDoc.getElementById('brandos-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
            
            // Poll options
            if (this.surveyData.type === 'poll') {
                const options = iframeDoc.querySelectorAll('.brandos-widget-option');
                options.forEach(option => {
                    option.addEventListener('click', (e) => {
                        const value = e.target.getAttribute('data-value');
                        this.submitVote(value);
                    });
                });
            }
            
            // Rating stars
            if (this.surveyData.type === 'rating') {
                const stars = iframeDoc.querySelectorAll('.brandos-widget-star');
                
                // Hover effect
                stars.forEach((star, index) => {
                    star.addEventListener('mouseenter', () => {
                        stars.forEach((s, i) => {
                            if (i <= index) {
                                s.classList.add('active');
                            } else {
                                s.classList.remove('active');
                            }
                        });
                    });
                    
                    star.addEventListener('click', (e) => {
                        const value = e.target.getAttribute('data-value');
                        this.submitVote(value);
                    });
                });
                
                // Reset on mouse leave
                const starsContainer = iframeDoc.querySelector('.brandos-widget-stars');
                starsContainer.addEventListener('mouseleave', () => {
                    stars.forEach(s => s.classList.remove('active'));
                });
            }
        }
        
        async submitVote(value) {
            try {
                const response = await fetch(`${API_BASE_URL}/surveys/${this.surveyId}/vote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ response: value })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to submit vote');
                }
                
                this.hasVoted = true;
                this.showThankYou();
                
                // Auto-close after 3 seconds
                setTimeout(() => this.close(), 3000);
                
            } catch (error) {
                console.error('Vote submission error:', error);
                this.renderError(error.message);
            }
        }
        
        showThankYou() {
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            const widget = iframeDoc.getElementById('brandos-widget');
            
            const content = `
                <div class="brandos-widget-header">
                    <h3 class="brandos-widget-title">Thank You!</h3>
                    <button class="brandos-widget-close" id="brandos-close">×</button>
                </div>
                <div class="brandos-widget-thank-you">
                    Your feedback has been recorded.
                </div>
            `;
            
            widget.innerHTML = content;
            
            // Re-attach close button listener
            const closeBtn = iframeDoc.getElementById('brandos-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }
        
        renderError(message) {
            const iframeDoc = this.iframe.contentDocument || this.iframe.contentWindow.document;
            const root = iframeDoc.getElementById('brandos-widget-root');
            
            root.innerHTML = `
                <div class="brandos-widget">
                    <div class="brandos-widget-header">
                        <h3 class="brandos-widget-title">Error</h3>
                        <button class="brandos-widget-close" id="brandos-close">×</button>
                    </div>
                    <div class="brandos-widget-error">${this.escapeHtml(message)}</div>
                </div>
            `;
            
            const closeBtn = iframeDoc.getElementById('brandos-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }
        
        close() {
            if (this.iframe && this.iframe.parentNode) {
                this.iframe.parentNode.removeChild(this.iframe);
            }
        }
        
        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }
    
    // Initialize widget when DOM is ready
    function initWidget() {
        const container = document.getElementById('brandos-survey-widget');
        if (!container) {
            console.error('BrandOS Widget: Container element not found');
            return;
        }
        
        const surveyId = container.getAttribute('data-survey-id');
        if (!surveyId) {
            console.error('BrandOS Widget: Survey ID not provided');
            return;
        }
        
        // Create widget instance
        new BrandOSSurveyWidget(container, surveyId);
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidget);
    } else {
        initWidget();
    }
})();