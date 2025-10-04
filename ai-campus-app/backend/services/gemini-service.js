const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    // For development without API key, provide mock responses
    this.apiKey = process.env.GEMINI_API_KEY;
    if (this.apiKey) {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    } else {
      console.log('⚠️  GEMINI_API_KEY not found. Using mock AI responses.');
    }
  }

  async analyzeTaskPatterns(tasks) {
    // Mock response for development without API key
    const mockResponse = `
# AI Task Analysis Report

## 📊 Productivity Overview
- Total Tasks: ${tasks.length}
- Completed: ${tasks.filter(t => t.status === 'completed').length}
- In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
- Pending: ${tasks.filter(t => t.status === 'pending').length}

## ⏱️ Time Management
- Average estimated hours: ${(tasks.reduce((sum, t) => sum + t.estimated_hours, 0) / tasks.length || 0).toFixed(1)}
- Average actual hours: ${(tasks.reduce((sum, t) => sum + t.actual_hours, 0) / tasks.length || 0).toFixed(1)}
- Average efficiency ratio: ${(tasks.reduce((sum, t) => sum + t.efficiency_ratio, 0) / tasks.length || 0).toFixed(2)}

## 🎯 Recommendations
1. Focus on completing pending tasks first
2. Review time estimates for better accuracy
3. Prioritize high-priority items
4. Break down large tasks into smaller steps

*Note: For real AI insights, add your Gemini API key to the .env file*
`;

    if (!this.apiKey) {
      return mockResponse;
    }

    const prompt = `
      Analyze these tasks and provide productivity insights:
      ${JSON.stringify(tasks, null, 2)}
      
      Please provide:
      1. Productivity patterns and completion rates
      2. Time estimation accuracy analysis
      3. Priority distribution insights
      4. 3-4 actionable recommendations
      
      Format as a structured report with clear sections.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API error:', error);
      return mockResponse;
    }
  }

  async suggestTaskTitle(description) {
    if (!this.apiKey) {
      // Mock title suggestions
      const mockTitles = [
        "Complete project documentation",
        "Implement new feature",
        "Review and test code",
        "Plan next sprint tasks"
      ];
      return mockTitles[Math.floor(Math.random() * mockTitles.length)];
    }

    const prompt = `
      Based on this task description: "${description}"
      Suggest a concise, actionable task title (max 5-7 words).
      Return only the title without any explanations or quotes.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini API error:', error);
      return "Complete task: " + description.substring(0, 30) + "...";
    }
  }
}

module.exports = new GeminiService();
