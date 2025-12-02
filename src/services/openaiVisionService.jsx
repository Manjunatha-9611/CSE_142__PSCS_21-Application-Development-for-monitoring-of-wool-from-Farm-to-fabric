// Alternative AI service using OpenAI Vision API
// This can be used as a backup if Hugging Face fails

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export const analyzeWoolWithOpenAI = async (imageFile) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this wool sample image and provide a quality score from 0-100 based on fiber appearance, cleanliness, texture, and overall quality. Also categorize as High (76-100), Medium (40-75), or Low (0-39) quality. Respond with JSON format: {"score": number, "category": string, "analysis": string}'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    const content = data.choices[0].message.content;
    const result = JSON.parse(content);
    
    return {
      score: result.score,
      category: result.category,
      analysis: result.analysis,
      timestamp: new Date().toISOString(),
      model: 'GPT-4-Vision'
    };
    
  } catch (error) {
    console.error('OpenAI Vision API error:', error);
    throw error;
  }
};

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
};