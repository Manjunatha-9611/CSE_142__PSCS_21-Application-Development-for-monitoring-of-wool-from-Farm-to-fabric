import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

const EducationTraining = ({ user }) => {
  const { t } = useLanguage();
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [producers, setProducers] = useState([]);
  const [trainingCourses, setTrainingCourses] = useState([]);
  const [userEnrollments, setUserEnrollments] = useState([]);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
    'Uttarakhand', 'West Bengal', 'Jammu and Kashmir', 'Ladakh'
  ];

  const regions = [
    { id: 'north', name: 'North India', states: ['Punjab', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Ladakh'] },
    { id: 'south', name: 'South India', states: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana'] },
    { id: 'east', name: 'East India', states: ['West Bengal', 'Odisha', 'Jharkhand', 'Bihar'] },
    { id: 'west', name: 'West India', states: ['Maharashtra', 'Gujarat', 'Rajasthan', 'Goa'] },
    { id: 'central', name: 'Central India', states: ['Madhya Pradesh', 'Chhattisgarh'] },
    { id: 'northeast', name: 'Northeast India', states: ['Assam', 'Arunachal Pradesh', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Sikkim'] }
  ];

  const sampleProducers = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      expertise: 'Merino Wool Production',
      location: 'Rajasthan',
      region: 'west',
      experience: '15 years',
      contact: '+91-9876543210',
      rating: 4.8,
      specializations: ['Quality Control', 'Breeding', 'Marketing'],
      certifications: ['Organic Certified', 'ISO 9001']
    },
    {
      id: 2,
      name: 'Priya Sharma',
      expertise: 'Wool Processing & Dyeing',
      location: 'Punjab',
      region: 'north',
      experience: '12 years',
      contact: '+91-9876543211',
      rating: 4.9,
      specializations: ['Natural Dyeing', 'Quality Assessment', 'Training'],
      certifications: ['Eco-Friendly Processing', 'Quality Certified']
    },
    {
      id: 3,
      name: 'Amit Patel',
      expertise: 'Wool Marketing & Export',
      location: 'Gujarat',
      region: 'west',
      experience: '20 years',
      contact: '+91-9876543212',
      rating: 4.7,
      specializations: ['Export Management', 'Market Analysis', 'Business Development'],
      certifications: ['Export Certified', 'Business Excellence']
    },
    {
      id: 4,
      name: 'Sunita Devi',
      expertise: 'Traditional Wool Crafts',
      location: 'Himachal Pradesh',
      region: 'north',
      experience: '25 years',
      contact: '+91-9876543213',
      rating: 4.9,
      specializations: ['Traditional Weaving', 'Craft Preservation', 'Skill Development'],
      certifications: ['Master Craftsman', 'Heritage Certified']
    },
    {
      id: 5,
      name: 'Karthik Reddy',
      expertise: 'Modern Wool Technology',
      location: 'Andhra Pradesh',
      region: 'south',
      experience: '10 years',
      contact: '+91-9876543214',
      rating: 4.6,
      specializations: ['Technology Integration', 'Automation', 'Quality Systems'],
      certifications: ['Technology Certified', 'Innovation Award']
    }
  ];

  const trainingResources = [
    {
      id: 1,
      title: 'Wool Quality Assessment Techniques',
      category: 'Quality Control',
      level: 'Intermediate',
      duration: '2 hours',
      description: 'Learn advanced techniques for assessing wool quality, including micron testing and fiber analysis.',
      instructor: 'Dr. Ramesh Singh',
      rating: 4.8,
      students: 1250,
      price: 'Free'
    },
    {
      id: 2,
      title: 'Sustainable Wool Production Methods',
      category: 'Sustainability',
      level: 'Beginner',
      duration: '1.5 hours',
      description: 'Introduction to eco-friendly and sustainable wool production practices.',
      instructor: 'Prof. Meera Patel',
      rating: 4.9,
      students: 2100,
      price: 'Free'
    },
    {
      id: 3,
      title: 'Wool Marketing Strategies for Farmers',
      category: 'Marketing',
      level: 'Advanced',
      duration: '3 hours',
      description: 'Comprehensive guide to marketing wool products in domestic and international markets.',
      instructor: 'Amit Kumar',
      rating: 4.7,
      students: 890,
      price: '₹500'
    },
    {
      id: 4,
      title: 'Modern Wool Processing Technology',
      category: 'Technology',
      level: 'Intermediate',
      duration: '2.5 hours',
      description: 'Understanding modern machinery and technology in wool processing.',
      instructor: 'Dr. Suresh Reddy',
      rating: 4.6,
      students: 650,
      price: '₹300'
    },
    {
      id: 5,
      title: 'Wool Business Management',
      category: 'Business',
      level: 'Advanced',
      duration: '4 hours',
      description: 'Complete business management course for wool entrepreneurs.',
      instructor: 'Rajesh Gupta',
      rating: 4.8,
      students: 420,
      price: '₹800'
    }
  ];

  useEffect(() => {
    setProducers(sampleProducers);
    setTrainingCourses(trainingResources);
    if (user) {
      loadUserEnrollments();
    }
  }, [user]);

  const loadUserEnrollments = async () => {
    if (!user) return;
    try {
      const enrollments = await firebaseService.getUserEnrollments(user.uid);
      setUserEnrollments(enrollments);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    }
  };

  const handleEnrollment = async (courseId) => {
    if (!user) {
      alert(t('loginToEnroll'));
      return;
    }

    try {
      const result = await firebaseService.enrollInCourse(courseId, user.uid);
      if (result.success) {
        alert(t('enrollSuccess'));
        loadUserEnrollments();
      } else {
        alert(t('enrollFailed') + ': ' + result.error);
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert(t('enrollFailed'));
    }
  };

  const filteredProducers = producers.filter(producer => {
    const matchesRegion = selectedRegion === 'all' || producer.region === selectedRegion;
    const matchesState = selectedState === 'all' || producer.location === selectedState;
    const matchesSearch = producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producer.expertise.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRegion && matchesState && matchesSearch;
  });

  const getRegionStates = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.states : [];
  };

  return (
    <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)' }}>
      {/* Header */}
      <div className="klwb-detail-card mb-4">
        <div className="klwb-detail-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="klwb-detail-title">
                <i className="fas fa-graduation-cap me-2"></i>
                {t('educationTitle')}
              </h2>
              <p className="mb-0 text-muted">{t('educationSubtitle')}</p>
            </div>
            <Link to="/dashboard" className="klwb-btn-secondary">
              <i className="fas fa-arrow-left me-2"></i>{t('backToDashboard')}
            </Link>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Training Resources */}
        <div className="col-lg-8">
          <div className="klwb-detail-card mb-4">
            <div className="klwb-detail-header">
              <h5 className="klwb-detail-title">
                <i className="fas fa-book me-2"></i>{t('trainingResources')}
              </h5>
            </div>
            <div className="p-4">
              <div className="row">
                {trainingCourses.map(resource => (
                  <div key={resource.id} className="col-md-6 mb-4">
                    <div className="klwb-detail-card h-100">
                      <div className="p-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <span className="klwb-status-badge klwb-status-approved">{resource.category}</span>
                          <span className="klwb-status-badge klwb-status-processing">{resource.level}</span>
                        </div>
                        <h6 style={{ color: 'var(--klwb-primary)' }}>{resource.title}</h6>
                        <p className="text-muted small">{resource.description}</p>
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="fas fa-user me-1"></i>{resource.instructor}
                          </small>
                        </div>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div>
                            <span className="klwb-status-badge klwb-status-approved">{resource.price}</span>
                            <small className="text-muted ms-2">
                              <i className="fas fa-clock me-1"></i>{resource.duration}
                            </small>
                          </div>
                          <div>
                            <span style={{ color: 'var(--klwb-warning)' }}>
                              <i className="fas fa-star"></i> {resource.rating}
                            </span>
                            <small className="text-muted ms-1">({resource.students})</small>
                          </div>
                        </div>
                        <button
                          className="klwb-btn-primary btn-sm w-100"
                          onClick={() => handleEnrollment(resource.id)}
                        >
                          <i className="fas fa-graduation-cap me-1"></i>{t('enrollNow')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Producer Directory */}
        <div className="col-lg-4">
          <div className="klwb-detail-card">
            <div className="klwb-detail-header">
              <h5 className="klwb-detail-title">
                <i className="fas fa-users me-2"></i>{t('producerDirectory')}
              </h5>
            </div>
            <div className="p-4">
              {/* Filters */}
              <div className="mb-3">
                <label className="form-label">{t('search')}</label>
                <input
                  type="text"
                  className="klwb-form-control"
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">{t('region')}</label>
                <select
                  className="klwb-form-control"
                  value={selectedRegion}
                  onChange={(e) => {
                    setSelectedRegion(e.target.value);
                    setSelectedState('all');
                  }}
                >
                  <option value="all">{t('allRegions')}</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">{t('state')}</label>
                <select
                  className="klwb-form-control"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                >
                  <option value="all">{t('allStates')}</option>
                  {getRegionStates(selectedRegion).map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Producer List */}
              <div className="producer-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {filteredProducers.map(producer => (
                  <div key={producer.id} className="klwb-detail-card mb-2">
                    <div className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="card-title mb-0">{producer.name}</h6>
                        <span className="text-warning">
                          <i className="fas fa-star"></i> {producer.rating}
                        </span>
                      </div>
                      <p className="card-text text-muted small mb-2">{producer.expertise}</p>
                      <div className="mb-2">
                        <small className="text-muted">
                          <i className="fas fa-map-marker-alt me-1"></i>{producer.location}
                        </small>
                        <small className="text-muted ms-2">
                          <i className="fas fa-clock me-1"></i>{producer.experience}
                        </small>
                      </div>
                      <div className="mb-2">
                        {producer.specializations.slice(0, 2).map((spec, index) => (
                          <span key={index} className="badge bg-light text-dark me-1 small">
                            {spec}
                          </span>
                        ))}
                      </div>
                      <button className="klwb-btn-secondary btn-sm w-100">
                        <i className="fas fa-phone me-1"></i>{t('contact')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="row mt-4">
        <div className="col-md-3 mb-3">
          <div className="klwb-kpi-card red">
            <div className="klwb-kpi-content">
              <div className="klwb-kpi-icon">
                <i className="fas fa-users"></i>
              </div>
              <h2 className="klwb-kpi-number">{producers.length}</h2>
              <p className="klwb-kpi-label">{t('registeredProducers')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="klwb-kpi-card green">
            <div className="klwb-kpi-content">
              <div className="klwb-kpi-icon">
                <i className="fas fa-book"></i>
              </div>
              <h2 className="klwb-kpi-number">{trainingCourses.length}</h2>
              <p className="klwb-kpi-label">{t('trainingCourses')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="klwb-kpi-card cyan">
            <div className="klwb-kpi-content">
              <div className="klwb-kpi-icon">
                <i className="fas fa-map"></i>
              </div>
              <h2 className="klwb-kpi-number">{regions.length}</h2>
              <p className="klwb-kpi-label">{t('regionsCovered')}</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 mb-3">
          <div className="klwb-kpi-card purple">
            <div className="klwb-kpi-content">
              <div className="klwb-kpi-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h2 className="klwb-kpi-number">5,210</h2>
              <p className="klwb-kpi-label">{t('studentsEnrolled')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationTraining;
