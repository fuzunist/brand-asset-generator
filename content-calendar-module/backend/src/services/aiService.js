const OpenAI = require('openai');
const db = require('../config/database');
const logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 150;
    this.temperature = parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7;
  }
  
  /**
   * Generate content prompts for an event
   * @param {string} eventName - Name of the event
   * @param {string} userIndustry - User's industry
   * @param {string} eventDescription - Optional event description
   * @returns {Object} Generated prompts
   */
  async generateContentPrompts(eventName, userIndustry, eventDescription = null) {
    try {
      // Check cache first
      const cached = await this.getCachedPrompts(eventName, userIndustry);
      if (cached) {
        logger.info(`Using cached prompts for ${eventName} - ${userIndustry}`);
        return cached;
      }
      
      // Generate new prompts
      const prompt = this.buildPrompt(eventName, userIndustry, eventDescription);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a creative social media assistant that helps businesses create engaging content. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
        response_format: { type: 'json_object' }
      });
      
      const response = completion.choices[0].message.content;
      const prompts = JSON.parse(response);
      
      // Cache the prompts
      await this.cachePrompts(eventName, userIndustry, prompts);
      
      return prompts;
      
    } catch (error) {
      logger.error('Error generating AI prompts:', error);
      
      // Return fallback prompts
      return this.getFallbackPrompts(eventName, userIndustry);
    }
  }
  
  /**
   * Build the prompt for OpenAI
   * @param {string} eventName 
   * @param {string} userIndustry 
   * @param {string} eventDescription 
   * @returns {string} Formatted prompt
   */
  buildPrompt(eventName, userIndustry, eventDescription) {
    const context = eventDescription ? 
      `Event: ${eventName}. ${eventDescription}` : 
      `Event: ${eventName}`;
    
    return `You are a creative social media assistant. A company in the '${userIndustry}' industry wants to post about '${eventName}'. 
    
${context}

Generate 2 short, creative content angles that are specific to their industry. Each angle should be actionable and engaging.
Format your response as a JSON object with keys "angle1" and "angle2".

Example format:
{
  "angle1": "Specific, actionable content idea tailored to the industry",
  "angle2": "Another creative angle that connects the event to the industry"
}`;
  }
  
  /**
   * Get cached prompts from database
   * @param {string} eventName 
   * @param {string} userIndustry 
   * @returns {Object|null} Cached prompts or null
   */
  async getCachedPrompts(eventName, userIndustry) {
    try {
      const cached = await db('ai_prompt_cache')
        .where('event_name', eventName)
        .where('industry', userIndustry)
        .where('expires_at', '>', new Date())
        .first();
      
      if (cached) {
        return JSON.parse(cached.prompts);
      }
      
      return null;
    } catch (error) {
      logger.error('Error fetching cached prompts:', error);
      return null;
    }
  }
  
  /**
   * Cache generated prompts
   * @param {string} eventName 
   * @param {string} userIndustry 
   * @param {Object} prompts 
   */
  async cachePrompts(eventName, userIndustry, prompts) {
    try {
      // Cache for 30 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      
      await db('ai_prompt_cache')
        .insert({
          event_name: eventName,
          industry: userIndustry,
          prompts: JSON.stringify(prompts),
          expires_at: expiresAt
        })
        .onConflict(['event_name', 'industry'])
        .merge();
        
    } catch (error) {
      logger.error('Error caching prompts:', error);
    }
  }
  
  /**
   * Get fallback prompts when AI generation fails
   * @param {string} eventName 
   * @param {string} userIndustry 
   * @returns {Object} Fallback prompts
   */
  getFallbackPrompts(eventName, userIndustry) {
    const fallbackMap = {
      'technology': {
        angle1: `Share how your team celebrates ${eventName} and connects it to your latest tech innovations`,
        angle2: `Create a poll asking your audience about their ${eventName} traditions in the digital age`
      },
      'fashion': {
        angle1: `Showcase a special ${eventName} collection or style inspiration`,
        angle2: `Share behind-the-scenes content of your team preparing for ${eventName}`
      },
      'food-beverage': {
        angle1: `Feature a special ${eventName} menu item or recipe`,
        angle2: `Share the story behind your ${eventName} traditions and offerings`
      },
      'retail': {
        angle1: `Announce a special ${eventName} promotion or featured products`,
        angle2: `Create a gift guide or shopping tips for ${eventName}`
      },
      'default': {
        angle1: `Share how your business celebrates ${eventName} with your community`,
        angle2: `Ask your audience about their favorite ${eventName} memories or traditions`
      }
    };
    
    const normalizedIndustry = userIndustry.toLowerCase().replace(/[^a-z-]/g, '-');
    return fallbackMap[normalizedIndustry] || fallbackMap.default;
  }
  
  /**
   * Clear expired cache entries
   */
  async clearExpiredCache() {
    try {
      const deleted = await db('ai_prompt_cache')
        .where('expires_at', '<', new Date())
        .del();
      
      if (deleted > 0) {
        logger.info(`Cleared ${deleted} expired cache entries`);
      }
    } catch (error) {
      logger.error('Error clearing expired cache:', error);
    }
  }
}

module.exports = new AIService();