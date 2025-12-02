import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import woolPriceService from '../services/woolPriceService.jsx';
import realTimeMarketService from '../services/realTimeMarketService.jsx';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MarketInfo = () => {
  const { t } = useLanguage();

  // News and messages
  const newsItems = [
    {
      id: 1,
      title: 'Wool Prices Rise Due to Increased Demand',
      date: '2024-02-15',
      summary: 'Global wool prices have increased by 8% this quarter due to strong demand from textile manufacturers.'
    },
    {
      id: 2,
      title: 'New Government Subsidy for Wool Farmers',
      date: '2024-02-10',
      summary: 'The agriculture department announces new subsidies to support wool farmers and improve quality standards.'
    },
    {
      id: 3,
      title: 'Sustainable Wool Production Guidelines Released',
      date: '2024-02-05',
      summary: 'New guidelines for sustainable wool production practices to meet international environmental standards.'
    }
  ];

  // Government schemes
  const schemes = [
    {
      name: 'Wool Quality Improvement Scheme',
      description: 'Financial assistance for upgrading wool processing equipment',
      eligibility: 'Registered wool farmers with minimum 50 sheep',
      amount: 'Up to $5,000'
    },
    {
      name: 'Sheep Breed Development Program',
      description: 'Support for improving sheep breeds for better wool quality',
      eligibility: 'Farmers with breeding experience',
      amount: 'Up to $3,000'
    }
  ];
  const [chartData, setChartData] = useState(null);
  const [marketStats, setMarketStats] = useState(null);
  const [trendAnalysis, setTrendAnalysis] = useState(null);
  const [timeRange, setTimeRange] = useState('last10Years');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [realTimeData, setRealTimeData] = useState(null);
  const [globalMarketData, setGlobalMarketData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '600'
          }
        }
      },
      title: {
        display: true,
        text: 'Wool Price Trends Over Time',
        font: {
          size: 16,
          weight: '700'
        },
        color: '#1e293b'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1e293b',
        bodyColor: '#374151',
        borderColor: 'rgba(102, 126, 234, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}/ton`;
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Time Period',
          font: {
            weight: '600'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 10,
          font: {
            size: 11
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Price ($/ton)',
          font: {
            weight: '600'
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          font: {
            size: 11
          },
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      point: {
        hoverBackgroundColor: '#fff',
        hoverBorderWidth: 3
      }
    }
  };

  const loadRealTimeData = async () => {
    try {
      const [realTime, globalData] = await Promise.all([
        realTimeMarketService.getCommodityPrices(),
        realTimeMarketService.getGlobalWoolMarketData()
      ]);
      
      setRealTimeData(realTime);
      setGlobalMarketData(globalData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading real-time data:', error);
    }
  };

  // Load data and update charts
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!woolPriceService.isDataLoaded()) {
        await woolPriceService.loadData();
      }

      const chartData = woolPriceService.getChartData(timeRange);
      const stats = woolPriceService.getMarketStats(timeRange);
      const trends = woolPriceService.getTrendAnalysis(timeRange);

      setChartData(chartData);
      setMarketStats(stats);
      setTrendAnalysis(trends);
    } catch (err) {
      setError('Failed to load market data. Please try again later.');
      console.error('Error loading market data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount and when time range changes
  useEffect(() => {
    loadData();
    loadRealTimeData();
    
    // Set up real-time updates
    const unsubscribe = realTimeMarketService.connectToRealTimeData((data) => {
      setRealTimeData(data);
      setLastUpdate(new Date());
    });
    
    return unsubscribe;
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle time range change
  const handleTimeRangeChange = (newTimeRange) => {
    setTimeRange(newTimeRange);
  };

  // Get trend icon and color
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'bullish':
        return { icon: 'fas fa-arrow-up', color: 'text-success' };
      case 'bearish':
        return { icon: 'fas fa-arrow-down', color: 'text-danger' };
      default:
        return { icon: 'fas fa-minus', color: 'text-muted' };
    }
  };

  if (loading) {
    return (
      <div className="container-fluid" style={{padding: 'var(--klwb-spacing-xl)'}}>
        <div className="klwb-detail-card">
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <h5>Loading market data...</h5>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid" style={{padding: 'var(--klwb-spacing-xl)'}}>
        <div className="klwb-detail-card">
          <div className="klwb-detail-header">
            <h2 className="klwb-detail-title">
              <i className="fas fa-chart-line me-2"></i>
              {t('marketInfo')}
            </h2>
          </div>
          <div className="p-4">
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle me-2"></i>
              {error}
              <button className="klwb-btn-secondary ms-2" onClick={loadData}>
                <i className="fas fa-sync-alt me-1"></i>
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)'}}>
      {/* Header */}
      <div className="klwb-detail-card mb-4">
        <div className="klwb-detail-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="klwb-detail-title">
                <i className="fas fa-chart-line me-2"></i>
                Karnataka Wool Market Information
              </h2>
              <p className="mb-0 text-muted">Live wool market data, trends and industry insights</p>
            </div>
            <div className="time-range-selector">
              <select 
                className="klwb-form-control" 
                value={timeRange} 
                onChange={(e) => handleTimeRangeChange(e.target.value)}
              >
                {woolPriceService.getAvailableTimeRanges().map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">

          {/* Real-Time Market Data */}
          {realTimeData && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card bg-info text-white border-0">
                  <div className="card-body text-center py-4">
                    <i className="fas fa-dollar-sign fa-2x mb-3"></i>
                    <h4 className="mb-1">${realTimeData.currentPrice?.toFixed(2) || 'N/A'}</h4>
                    <small>Current Price/ton</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`card ${realTimeData.change24h >= 0 ? 'bg-success' : 'bg-danger'} text-white border-0`}>
                  <div className="card-body text-center py-4">
                    <i className={`fas fa-arrow-${realTimeData.change24h >= 0 ? 'up' : 'down'} fa-2x mb-3`}></i>
                    <h4 className="mb-1">{realTimeData.change24h >= 0 ? '+' : ''}{realTimeData.change24h?.toFixed(2) || '0'}%</h4>
                    <small>24h Change</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-warning text-white border-0">
                  <div className="card-body text-center py-4">
                    <i className="fas fa-chart-bar fa-2x mb-3"></i>
                    <h4 className="mb-1">{realTimeData.volume?.toLocaleString() || 'N/A'}</h4>
                    <small>Volume (tons)</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card bg-secondary text-white border-0">
                  <div className="card-body text-center py-4">
                    <i className="fas fa-globe fa-2x mb-3"></i>
                    <h4 className="mb-1">${(realTimeData.marketCap / 1e9)?.toFixed(1) || 'N/A'}B</h4>
                    <small>Market Cap</small>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Last Update Info */}
          {lastUpdate && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="alert alert-info d-flex align-items-center justify-content-between">
                  <div>
                    <i className="fas fa-sync-alt me-2"></i>
                    <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                    {realTimeData?.source && (
                      <span className="ms-3">
                        <i className="fas fa-database me-1"></i>
                        Source: {realTimeData.source}
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center">
                    <span className="badge bg-success me-2">
                      <i className="fas fa-wifi me-1"></i>
                      Live Data
                    </span>
                    <small className="text-muted">Updates every 30s</small>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Detailed Market Cards */}
          {marketStats && (
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body bg-gradient-danger text-white rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title text-white-50 mb-1">
                          <i className="fas fa-warehouse me-2"></i>Coarse Wool
                        </h6>
                        <h3 className="mb-0 fw-bold">${marketStats.coarseWool?.current?.toFixed(2) || 'N/A'}/ton</h3>
                        {marketStats.coarseWool?.change !== undefined && (
                          <small className={marketStats.coarseWool.change > 0 ? 'text-success' : 'text-warning'}>
                            <i className={`fas fa-arrow-${marketStats.coarseWool.change > 0 ? 'up' : 'down'} me-1`}></i>
                            {Math.abs(marketStats.coarseWool.change).toFixed(2)}%
                          </small>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="text-white-50 small">Avg: ${marketStats.coarseWool?.average?.toFixed(2) || 'N/A'}</div>
                        <div className="text-white-50 small">Max: ${marketStats.coarseWool?.max?.toFixed(2) || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body bg-gradient-info text-white rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="card-title text-white-50 mb-1">
                          <i className="fas fa-gem me-2"></i>Fine Wool
                        </h6>
                        <h3 className="mb-0 fw-bold">${marketStats.fineWool?.current?.toFixed(2) || 'N/A'}/ton</h3>
                        {marketStats.fineWool?.change !== undefined && (
                          <small className={marketStats.fineWool.change > 0 ? 'text-success' : 'text-warning'}>
                            <i className={`fas fa-arrow-${marketStats.fineWool.change > 0 ? 'up' : 'down'} me-1`}></i>
                            {Math.abs(marketStats.fineWool.change).toFixed(2)}%
                          </small>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="text-white-50 small">Avg: ${marketStats.fineWool?.average?.toFixed(2) || 'N/A'}</div>
                        <div className="text-white-50 small">Max: ${marketStats.fineWool?.max?.toFixed(2) || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Price Trends Chart */}
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="fas fa-chart-line me-2"></i>Wool Price Trends</h5>
            </div>
            <div className="card-body">
              <div className="chart-container" style={{ height: '400px' }}>
                {chartData && (
                  <Line 
                    data={{
                      ...chartData,
                      datasets: [
                        {
                          ...chartData.datasets[0],
                          borderColor: 'rgba(255, 99, 132, 1)',
                          backgroundColor: 'rgba(255, 99, 132, 0.1)',
                          borderWidth: 3,
                          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 5,
                          pointHoverRadius: 8
                        },
                        {
                          ...chartData.datasets[1],
                          borderColor: 'rgba(54, 162, 235, 1)',
                          backgroundColor: 'rgba(54, 162, 235, 0.1)',
                          borderWidth: 3,
                          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                          pointBorderColor: '#fff',
                          pointBorderWidth: 2,
                          pointRadius: 5,
                          pointHoverRadius: 8
                        }
                      ]
                    }} 
                    options={chartOptions} 
                  />
                )}
              </div>
            </div>
          </div>

          {/* Global Market Data */}
          {globalMarketData && (
            <div className="row mb-4">
              <div className="col-md-8">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0"><i className="fas fa-globe me-2"></i>Global Wool Production</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {globalMarketData.globalProduction.topProducers.map((producer, index) => (
                        <div key={index} className="col-md-6 mb-3">
                          <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                            <div>
                              <strong>{producer.country}</strong>
                              <div className="small text-muted">{producer.production}M tonnes</div>
                            </div>
                            <span className={`badge ${producer.change >= 0 ? 'bg-success' : 'bg-danger'}`}>
                              {producer.change >= 0 ? '+' : ''}{producer.change}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-warning text-white">
                    <h5 className="mb-0"><i className="fas fa-chart-pie me-2"></i>Market Indices</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Price Index</span>
                        <strong>{globalMarketData.marketTrends.priceIndex.toFixed(1)}</strong>
                      </div>
                      <div className="progress mt-1">
                        <div className="progress-bar bg-primary" style={{width: `${(globalMarketData.marketTrends.priceIndex / 2000) * 100}%`}}></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Demand Index</span>
                        <strong>{globalMarketData.marketTrends.demandIndex.toFixed(1)}</strong>
                      </div>
                      <div className="progress mt-1">
                        <div className="progress-bar bg-success" style={{width: `${globalMarketData.marketTrends.demandIndex}%`}}></div>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between">
                        <span>Supply Index</span>
                        <strong>{globalMarketData.marketTrends.supplyIndex.toFixed(1)}</strong>
                      </div>
                      <div className="progress mt-1">
                        <div className="progress-bar bg-info" style={{width: `${globalMarketData.marketTrends.supplyIndex}%`}}></div>
                      </div>
                    </div>
                    <div>
                      <div className="d-flex justify-content-between">
                        <span>Volatility</span>
                        <strong>{globalMarketData.marketTrends.volatility.toFixed(1)}%</strong>
                      </div>
                      <div className="progress mt-1">
                        <div className="progress-bar bg-warning" style={{width: `${Math.min(globalMarketData.marketTrends.volatility * 2, 100)}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Regional Prices */}
          {globalMarketData && (
            <div className="row mb-4">
              <div className="col-12">
                <div className="card border-0 shadow-sm">
                  <div className="card-header bg-secondary text-white">
                    <h5 className="mb-0"><i className="fas fa-map-marked-alt me-2"></i>Regional Wool Prices</h5>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      {globalMarketData.regionalPrices.map((region, index) => (
                        <div key={index} className="col-md-3 mb-3">
                          <div className="card bg-light h-100">
                            <div className="card-body text-center">
                              <h6 className="card-title">{region.region}</h6>
                              <h4 className="text-primary">{region.price.toFixed(0)} {region.currency}</h4>
                              <span className={`badge ${region.change >= 0 ? 'bg-success' : 'bg-danger'}`}>
                                {region.change >= 0 ? '+' : ''}{region.change.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* News and Updates */}
          <div className="row mt-4">
            <div className="col-md-8">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0"><i className="fas fa-newspaper me-2"></i>Industry News</h5>
                </div>
                <div className="card-body">
                  {newsItems.map((news, index) => (
                    <div key={news.id} className={`border-bottom pb-3 mb-3 ${index === newsItems.length - 1 ? 'border-0' : ''}`}>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className={`bg-${index % 2 === 0 ? 'primary' : 'info'} text-white rounded-circle d-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px'}}>
                            <i className="fas fa-newspaper"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="fw-bold text-dark mb-2">{news.title}</h6>
                          <p className="text-muted mb-2">{news.summary}</p>
                          <small className="text-muted">
                            <i className="fas fa-calendar me-1"></i>
                            {news.date}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Government Schemes */}
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-warning text-white">
                  <h5 className="mb-0"><i className="fas fa-university me-2"></i>Government Schemes</h5>
                </div>
                <div className="card-body">
                  {schemes.map((scheme, index) => (
                    <div key={index} className={`mb-4 ${index === schemes.length - 1 ? 'mb-0' : ''}`}>
                      <div className="d-flex align-items-start">
                        <div className="flex-shrink-0 me-3">
                          <div className={`bg-${index % 2 === 0 ? 'success' : 'danger'} text-white rounded-circle d-flex align-items-center justify-content-center`} style={{width: '35px', height: '35px'}}>
                            <i className="fas fa-hand-holding-usd"></i>
                          </div>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="text-primary fw-bold mb-2">{scheme.name}</h6>
                          <p className="small mb-2">{scheme.description}</p>
                          <div className="small text-muted mb-2">
                            <strong>Eligibility:</strong> {scheme.eligibility}<br/>
                            <strong>Amount:</strong> {scheme.amount}
                          </div>
                          <button className="btn btn-sm btn-outline-primary">
                            <i className="fas fa-info-circle me-1"></i>Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Sources Info */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="alert alert-success">
            <h6><i className="fas fa-check-circle me-2"></i>Active Data Sources</h6>
            <div className="row">
              <div className="col-md-6">
                <p className="mb-2"><strong>Integrated APIs:</strong></p>
                <ul className="mb-0">
                  <li><i className="fas fa-check text-success me-1"></i>Alpha Vantage API - Commodity data</li>
                  <li><i className="fas fa-check text-success me-1"></i>CoinGecko API - Market volatility indicators</li>
                  <li><i className="fas fa-check text-success me-1"></i>ExchangeRate API - Currency data</li>
                  <li><i className="fas fa-check text-success me-1"></i>Binance WebSocket - Live market feeds</li>
                </ul>
              </div>
              <div className="col-md-6">
                <p className="mb-2"><strong>Available Free Alternatives:</strong></p>
                <ul className="mb-0">
                  <li>Financial Modeling Prep (free tier)</li>
                  <li>IEX Cloud (free tier)</li>
                  <li>Polygon.io (free tier)</li>
                  <li>NewsAPI for industry news</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketInfo;