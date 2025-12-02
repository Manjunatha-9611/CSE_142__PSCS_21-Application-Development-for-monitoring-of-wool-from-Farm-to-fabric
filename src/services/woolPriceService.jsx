// Wool Price Data Service
// Processes the wool price dataset and provides chart-ready data

class WoolPriceService {
  constructor() {
    this.rawData = null;
    this.processedData = null;
    this.lastProcessed = null;
  }

  // Parse CSV data
  parseCSVData(csvText) {
    const lines = csvText.trim().split('\n');
    // const headers = lines[0].split(','); // Headers not used in current implementation
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      if (values.length >= 6) {
        const row = {
          month: values[0].trim(),
          coarseWoolPrice: this.parsePrice(values[1]),
          coarseWoolChange: this.parsePercentage(values[2]),
          cottonChange: this.parsePercentage(values[4]),
          fineWoolPrice: this.parsePrice(values[5]),
          fineWoolChange: this.parsePercentage(values[6])
        };
        
        // Only include rows with valid data
        if (row.coarseWoolPrice !== null || row.fineWoolPrice !== null) {
          data.push(row);
        }
      }
    }

    return data;
  }

  // Parse price values (handle commas and quotes)
  parsePrice(value) {
    if (!value || value.trim() === '' || value === '-') return null;
    const cleaned = value.replace(/[",]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Parse percentage values
  parsePercentage(value) {
    if (!value || value.trim() === '' || value === '-') return null;
    const cleaned = value.replace('%', '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  // Convert month string to date
  parseDate(monthStr) {
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const parts = monthStr.split('-');
    if (parts.length === 2) {
      const month = months[parts[0]];
      const year = parseInt(parts[1]);
      if (month !== undefined && year) {
        return new Date(year + (year < 50 ? 2000 : 1900), month);
      }
    }
    return null;
  }

  // Process data for charts
  processData(rawData) {
    const data = this.parseCSVData(rawData);
    
    // Sort by date
    data.sort((a, b) => {
      const dateA = this.parseDate(a.month);
      const dateB = this.parseDate(b.month);
      return dateA - dateB;
    });

    // Extract data for different time periods
    const allData = data;
    const last5Years = data.filter(row => {
      const date = this.parseDate(row.month);
      return date && date >= new Date(2015, 0, 1);
    });
    const last10Years = data.filter(row => {
      const date = this.parseDate(row.month);
      return date && date >= new Date(2010, 0, 1);
    });
    const last20Years = data.filter(row => {
      const date = this.parseDate(row.month);
      return date && date >= new Date(2000, 0, 1);
    });

    this.processedData = {
      all: allData,
      last5Years,
      last10Years,
      last20Years,
      lastProcessed: new Date()
    };

    return this.processedData;
  }

  // Get chart data for different time periods
  getChartData(timeRange = 'last10Years', chartType = 'line') {
    if (!this.processedData) {
      throw new Error('Data not processed. Call processData() first.');
    }

    const data = this.processedData[timeRange] || this.processedData.last10Years;
    
    const labels = data.map(row => {
      const date = this.parseDate(row.month);
      return date ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : row.month;
    });

    // const coarseWoolData = data.map(row => row.coarseWoolPrice).filter(price => price !== null);
    // const fineWoolData = data.map(row => row.fineWoolPrice).filter(price => price !== null);

    return {
      labels,
      datasets: [
        {
          label: 'Coarse Wool Price ($/ton)',
          data: data.map(row => row.coarseWoolPrice),
          borderColor: 'rgb(102, 126, 234)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(102, 126, 234)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        },
        {
          label: 'Fine Wool Price ($/ton)',
          data: data.map(row => row.fineWoolPrice),
          borderColor: 'rgb(17, 153, 142)',
          backgroundColor: 'rgba(17, 153, 142, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(17, 153, 142)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };
  }

  // Get market statistics
  getMarketStats(timeRange = 'last10Years') {
    if (!this.processedData) {
      throw new Error('Data not processed. Call processData() first.');
    }

    const data = this.processedData[timeRange] || this.processedData.last10Years;
    
    const coarsePrices = data.map(row => row.coarseWoolPrice).filter(price => price !== null);
    const finePrices = data.map(row => row.fineWoolPrice).filter(price => price !== null);

    const getStats = (prices) => {
      if (prices.length === 0) return null;
      
      const sorted = [...prices].sort((a, b) => a - b);
      const current = prices[prices.length - 1];
      const previous = prices[prices.length - 2];
      
      return {
        current: current,
        previous: previous,
        change: previous ? ((current - previous) / previous * 100) : 0,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
        median: sorted[Math.floor(sorted.length / 2)]
      };
    };

    return {
      coarseWool: getStats(coarsePrices),
      fineWool: getStats(finePrices),
      timeRange,
      dataPoints: data.length
    };
  }

  // Get price trends analysis
  getTrendAnalysis(timeRange = 'last10Years') {
    if (!this.processedData) {
      throw new Error('Data not processed. Call processData() first.');
    }

    const data = this.processedData[timeRange] || this.processedData.last10Years;
    const recentData = data.slice(-12); // Last 12 months
    
    const coarsePrices = recentData.map(row => row.coarseWoolPrice).filter(price => price !== null);
    const finePrices = recentData.map(row => row.fineWoolPrice).filter(price => price !== null);

    const getTrend = (prices) => {
      if (prices.length < 2) return 'stable';
      
      const first = prices[0];
      const last = prices[prices.length - 1];
      const change = ((last - first) / first) * 100;
      
      if (change > 5) return 'bullish';
      if (change < -5) return 'bearish';
      return 'stable';
    };

    return {
      coarseWoolTrend: getTrend(coarsePrices),
      fineWoolTrend: getTrend(finePrices),
      period: 'Last 12 months',
      analysis: this.generateTrendAnalysis(coarsePrices, finePrices)
    };
  }

  // Generate trend analysis text
  generateTrendAnalysis(coarsePrices, finePrices) {
    const coarseTrend = this.getTrendDirection(coarsePrices);
    const fineTrend = this.getTrendDirection(finePrices);
    
    let analysis = [];
    
    if (coarseTrend === 'up') {
      analysis.push('Coarse wool prices are showing an upward trend, indicating strong demand.');
    } else if (coarseTrend === 'down') {
      analysis.push('Coarse wool prices are declining, suggesting market challenges.');
    } else {
      analysis.push('Coarse wool prices remain relatively stable.');
    }
    
    if (fineTrend === 'up') {
      analysis.push('Fine wool prices are increasing, reflecting premium market positioning.');
    } else if (fineTrend === 'down') {
      analysis.push('Fine wool prices are decreasing, indicating market pressure.');
    } else {
      analysis.push('Fine wool prices show stability.');
    }
    
    return analysis.join(' ');
  }

  // Get trend direction
  getTrendDirection(prices) {
    if (prices.length < 3) return 'stable';
    
    const recent = prices.slice(-3);
    const isIncreasing = recent[2] > recent[1] && recent[1] > recent[0];
    const isDecreasing = recent[2] < recent[1] && recent[1] < recent[0];
    
    if (isIncreasing) return 'up';
    if (isDecreasing) return 'down';
    return 'stable';
  }

  // Load and process data from CSV
  async loadData() {
    try {
      const response = await fetch('/Wool price 1990=2020.csv');
      const csvText = await response.text();
      this.rawData = csvText;
      return this.processData(csvText);
    } catch (error) {
      console.error('Error loading wool price data:', error);
      throw error;
    }
  }

  // Check if data is loaded
  isDataLoaded() {
    return this.processedData !== null;
  }

  // Get available time ranges
  getAvailableTimeRanges() {
    return [
      { value: 'last5Years', label: 'Last 5 Years' },
      { value: 'last10Years', label: 'Last 10 Years' },
      { value: 'last20Years', label: 'Last 20 Years' },
      { value: 'all', label: 'All Data (1990-2020)' }
    ];
  }
}

// Create singleton instance
const woolPriceService = new WoolPriceService();

export default woolPriceService;