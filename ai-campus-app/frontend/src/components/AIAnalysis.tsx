import React, { useState } from 'react';
import { aiAPI } from '../services/api';

const AIAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const getAIAnalysis = async () => {
    setLoading(true);
    setAnalysis('');
    
    try {
      const response = await aiAPI.getAnalysis();
      // Clean up the markdown formatting
      const cleanAnalysis = response.data.analysis
        .replace(/^#+/gm, '') // Remove # headers
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
        .replace(/\*(.*?)\*/g, '$1'); // Remove *italic*
      setAnalysis(cleanAnalysis);
    } catch (error: any) {
      console.error('AI Analysis error:', error);
      setAnalysis('AI analysis is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-analysis">
      <h3>🤖 AI Task Analysis</h3>
      <p>Get insights about your task patterns and productivity</p>
      
      <button 
        onClick={getAIAnalysis} 
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Analyzing with AI...' : 'Get AI Insights'}
      </button>
      
      {analysis && (
        <div className="analysis-result">
          <h4>AI Analysis Results:</h4>
          <div className="analysis-content">
            {analysis.split('\n').map((line, index) => {
              // Skip empty lines
              if (line.trim() === '') return <br key={index} />;
              
              // Style headers based on content
              if (line.includes('TASK ANALYSIS REPORT') || line.includes('OVERVIEW') || 
                  line.includes('TIME MANAGEMENT') || line.includes('PRIORITY BREAKDOWN') ||
                  line.includes('RECOMMENDATIONS') || line.includes('QUICK WINS')) {
                return <h5 key={index} style={{color: '#667eea', margin: '10px 0 5px 0'}}>{line}</h5>;
              }
              
              // Style list items
              if (line.trim().startsWith('•')) {
                return <div key={index} style={{paddingLeft: '20px'}}>{line}</div>;
              }
              
              return <div key={index}>{line}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysis;
