import axios from 'axios';

const FASTAPI_BASE_URL = process.env.REACT_APP_FASTAPI_URL || 'http://localhost:8000';

class FastApiService {
  async predictWoolQuality(features) {
    try {
      const response = await axios.post(`${FASTAPI_BASE_URL}/predict-quality`, {
        micron: parseFloat(features.micron),
        stapleLength: parseFloat(features.stapleLength),
        crimp: features.crimp || 'Medium',
        strength: features.strength || 'Medium',
        elasticity: features.elasticity || 'Medium',
        fineness: features.fineness || 'Medium'
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('FastAPI prediction error:', error);
      
      // Fallback to local prediction if API fails
      return {
        success: false,
        error: error.message,
        fallback: this.fallbackPrediction(features)
      };
    }
  }

  fallbackPrediction(features) {
    const micron = parseFloat(features.micron);
    
    // Indian grading system fallback
    let indianGrade;
    if (micron < 25) {
      indianGrade = "Super A";
    } else if (micron <= 34.4) {
      indianGrade = "A";
    } else if (micron <= 37.4) {
      indianGrade = "B";
    } else if (micron <= 40.4) {
      indianGrade = "C";
    } else {
      indianGrade = "D";
    }

    // ML grade estimation
    let mlGrade;
    if (micron < 20) {
      mlGrade = "Premium";
    } else if (micron < 25) {
      mlGrade = "Fine";
    } else if (micron < 30) {
      mlGrade = "Medium";
    } else {
      mlGrade = "Coarse";
    }

    return {
      ml_grade: mlGrade,
      indian_grade: indianGrade
    };
  }

  async checkApiHealth() {
    try {
      const response = await axios.get(`${FASTAPI_BASE_URL}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

const fastApiService = new FastApiService();
export default fastApiService;