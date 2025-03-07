/**
 * Service for interacting with AI APIs
 */
export class AIService {
  private apiKey: string;
  private endpoint: string;

  /**
   * Initialize the AI service
   * @param apiKey API key for the AI service
   * @param endpoint Endpoint URL
   */
  constructor(
    apiKey: string = process.env.AI_API_KEY || '',
    endpoint: string = process.env.AI_ENDPOINT || 'https://api.openai.com/v1/chat/completions'
  ) {
    this.apiKey = apiKey;
    this.endpoint = endpoint;
  }

  /**
   * Generate content optimization suggestions
   * @param content The content to optimize
   * @param contentType Type of content (article, image description, etc.)
   * @returns Suggestions for improving the content
   */
  async optimizeContent(content: string, contentType: string): Promise<string> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a content optimization assistant for ${contentType} content. 
                        Provide helpful suggestions to improve engagement, clarity, and impact.`
            },
            {
              role: 'user',
              content: `Please analyze and provide optimization suggestions for this ${contentType}:\n\n${content}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error optimizing content:', error);
      return 'Unable to generate suggestions at this time.';
    }
  }

  /**
   * Generate content recommendations based on user preferences
   * @param userPreferences User preferences and past interactions
   * @param availableContent Array of available content metadata
   * @returns Recommended content IDs with confidence scores
   */
  async generateRecommendations(
    userPreferences: Record<string, any>,
    availableContent: Array<Record<string, any>>
  ): Promise<Array<{ contentId: string; score: number }>> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a content recommendation system. Based on user preferences and available content,
                        you will return a JSON array of content IDs and confidence scores.`
            },
            {
              role: 'user',
              content: `User preferences: ${JSON.stringify(userPreferences)}\n\n
                        Available content: ${JSON.stringify(availableContent)}\n\n
                        Return a JSON array of recommendations in the format:
                        [{"contentId": "id1", "score": 0.95}, {"contentId": "id2", "score": 0.85}]`
            }
          ],
          max_tokens: 500,
          temperature: 0.3
        })
      });

      const data = await response.json();
      try {
        const recommendations = JSON.parse(data.choices[0].message.content);
        return recommendations;
      } catch (e) {
        console.error('Error parsing AI recommendations:', e);
        return [];
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  /**
   * Generate distribution strategy for content
   * @param content Content metadata
   * @param platforms Available distribution platforms
   * @returns Distribution strategy with platform-specific recommendations
   */
  async createDistributionStrategy(
    content: Record<string, any>,
    platforms: string[]
  ): Promise<Record<string, any>> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a content distribution strategist. For the given content and platforms,
                        provide a distribution strategy with platform-specific recommendations.`
            },
            {
              role: 'user',
              content: `Content: ${JSON.stringify(content)}\n\n
                        Platforms: ${JSON.stringify(platforms)}\n\n
                        Provide a detailed distribution strategy as JSON.`
            }
          ],
          max_tokens: 1000,
          temperature: 0.5
        })
      });

      const data = await response.json();
      try {
        const strategy = JSON.parse(data.choices[0].message.content);
        return strategy;
      } catch (e) {
        console.error('Error parsing distribution strategy:', e);
        return {
          error: 'Failed to generate distribution strategy',
          suggestions: data.choices[0].message.content
        };
      }
    } catch (error) {
      console.error('Error creating distribution strategy:', error);
      return { error: 'Failed to generate distribution strategy' };
    }
  }
}

export default AIService; 