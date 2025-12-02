import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import firebaseService from '../services/firebaseService.jsx';
import AuthGuard from '../components/AuthGuard.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import woolQualityService from '../services/woolQualityService.jsx';
import WoolQualityDetails from '../components/WoolQualityDetails.jsx';

const ProductCatalog = ({ user }) => {
  const { t } = useLanguage();
  useTheme(); // For theme context
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    grade: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [productQuality, setProductQuality] = useState({});

  useEffect(() => {
    loadProducts();
    // Load existing cart
    const savedCart = JSON.parse(localStorage.getItem('woolCart') || '[]');
    setCart(savedCart);
  }, []);

  const loadProducts = async () => {
    try {
      const batches = await firebaseService.getAllAvailableBatches();

      const products = batches.map(batch => ({
        id: batch.batchId,
        name: `${batch.farmerName || t('unknownFarmer')}'s ${batch.woolType} ${t('wool')}`,
        price: batch.price,
        image: '/api/placeholder/300/200',
        category: batch.woolType,
        grade: batch.qualityGrade || 'A',
        weight: batch.weight,
        seller: batch.farmerName,
        sellerContact: batch.farmerContact || '',
        location: batch.location,
        inStock: batch.status !== 'SOLD',
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviews: Math.floor(Math.random() * 100) + 10,
        trackingId: batch.batchId,
        description: `${t('highQuality')} ${batch.woolType} ${t('woolFrom')} ${batch.farmerName || t('trustedFarmer')}`
      }));
      setProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const addToCart = async (product) => {
    if (!user) {
      alert(t('loginToAddToCart'));
      return;
    }

    try {
      // Save to localStorage for persistence
      const existingCart = JSON.parse(localStorage.getItem('woolCart') || '[]');
      const existingItem = existingCart.find(item => item.id === product.id);

      let newCart;
      if (existingItem) {
        newCart = existingCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        newCart = [...existingCart, { ...product, quantity: 1 }];
      }

      localStorage.setItem('woolCart', JSON.stringify(newCart));
      console.log('Cart saved to localStorage:', newCart);
      setCart(newCart);
      alert(`${product.name} ${t('addedToCart')}`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(t('failedToAddToCart'));
    }
  };

  const handleShowQuality = async (product) => {
    if (!product.id) return;
    if (!productQuality[product.id]) {
      const records = await woolQualityService.getQualityRecordByBatch(product.id);
      setProductQuality((prev) => ({ ...prev, [product.id]: records[0] || null }));
    }
    setSelectedProductId(product.id);
  };

  const filteredProducts = products.filter(product => {
    return (
      (!filters.search || product.name.toLowerCase().includes(filters.search.toLowerCase())) &&
      (!filters.category || product.category === filters.category) &&
      (!filters.minPrice || product.price >= parseFloat(filters.minPrice)) &&
      (!filters.maxPrice || product.price <= parseFloat(filters.maxPrice)) &&
      (!filters.grade || product.grade === filters.grade) &&
      product.inStock
    );
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return b.rating - a.rating;
      default: return 0;
    }
  });

  return (
    <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)' }}>
      {/* Header */}
      <div className="klwb-detail-card mb-4">
        <div className="klwb-detail-header">
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="klwb-detail-title">
              <i className="fas fa-shopping-bag me-2"></i>
              {t('productCatalogTitle')}
            </h2>
            <div className="d-flex gap-3 align-items-center">
              <span className="klwb-status-badge klwb-status-processing">
                <i className="fas fa-shopping-cart me-1"></i>
                {cart.length} {t('items')}
              </span>
              <Link to="/cart" className="klwb-btn-primary">
                <i className="fas fa-shopping-cart me-2"></i>
                {t('viewCart')} (₹{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(0)})
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="klwb-detail-card mb-4">
        <div className="klwb-detail-header">
          <h5 className="klwb-detail-title">
            <i className="fas fa-filter me-2"></i>
            {t('filterSearch')}
          </h5>
        </div>
        <div className="p-4">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="klwb-form-label">{t('searchProducts')}</label>
              <input
                type="text"
                className="klwb-form-control"
                placeholder={t('searchPlaceholder')}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="klwb-form-label">{t('woolType')}</label>
              <select
                className="klwb-form-control"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">{t('allTypes')}</option>
                <option value="Merino">Merino</option>
                <option value="Romney">Romney</option>
                <option value="Corriedale">Corriedale</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="klwb-form-label">{t('qualityGrade')}</label>
              <select
                className="klwb-form-control"
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
              >
                <option value="">{t('allGrades')}</option>
                <option value="A+">{t('gradeAPlus')}</option>
                <option value="A">{t('gradeA')}</option>
                <option value="B">{t('gradeB')}</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="klwb-form-label">{t('minPrice')} (₹)</label>
              <input
                type="number"
                className="klwb-form-control"
                placeholder={t('minPrice')}
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              />
            </div>
            <div className="col-md-2">
              <label className="klwb-form-label">{t('sortBy')}</label>
              <select
                className="klwb-form-control"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">{t('newestFirst')}</option>
                <option value="price-low">{t('priceLowToHigh')}</option>
                <option value="price-high">{t('priceHighToLow')}</option>
                <option value="rating">{t('highestRated')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="klwb-detail-card">
        <div className="klwb-detail-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="klwb-detail-title">
              <i className="fas fa-boxes me-2"></i>
              {t('availableProducts')} ({sortedProducts.length})
            </h5>
            <span className="text-muted">{t('showing')} {sortedProducts.length} {t('of')} {products.length} {t('products')}</span>
          </div>
        </div>
        <div className="p-4">
          <div className="row">
            {sortedProducts.map(product => (
              <div key={product.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div className="klwb-detail-card h-100">
                  <div className="position-relative">
                    <div className="text-center p-4" style={{ background: 'var(--klwb-gray-lighter)', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="fas fa-cut fa-3x" style={{ color: 'var(--klwb-primary)' }}></i>
                    </div>
                    <span className={`position-absolute top-0 end-0 m-2 klwb-status-badge klwb-status-${product.grade === 'A+' ? 'approved' : 'processing'}`}>
                      {product.grade} {t('grade')}
                    </span>
                  </div>

                  <div className="p-3">
                    <h6 className="mb-2" style={{ color: 'var(--klwb-primary)' }}>{product.name}</h6>
                    <p className="text-muted small mb-2">
                      <i className="fas fa-user me-1"></i>{product.seller}
                      {product.location && <><br /><i className="fas fa-map-marker-alt me-1"></i>{product.location}</>}
                    </p>

                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="h6 mb-0" style={{ color: 'var(--klwb-success)' }}>₹{product.price}/kg</span>
                      <div className="text-end">
                        <i className="fas fa-star" style={{ color: 'var(--klwb-warning)' }}></i>
                        <small className="ms-1">{product.rating} ({product.reviews})</small>
                      </div>
                    </div>

                    <p className="small mb-3" style={{ color: 'var(--klwb-text-muted)' }}>
                      <i className="fas fa-weight me-1"></i>{t('available')}: {product.weight} kg
                    </p>

                    <div className="d-grid gap-2">
                      <AuthGuard user={user} action="add to cart">
                        <button
                          className={`klwb-btn-primary ${!product.inStock ? 'disabled' : ''}`}
                          onClick={() => addToCart(product)}
                          disabled={!product.inStock}
                        >
                          <i className="fas fa-cart-plus me-2"></i>
                          {product.inStock ? t('addToCart') : t('outOfStock')}
                        </button>
                      </AuthGuard>
                      <button
                        className="klwb-btn-secondary btn-sm"
                        onClick={() => handleShowQuality(product)}
                      >
                        <i className="fas fa-certificate me-2"></i>
                        {t('qualityDetails')}
                      </button>
                    </div>

                    {selectedProductId === product.id && (
                      <div className="mt-3">
                        <WoolQualityDetails quality={productQuality[product.id]} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {sortedProducts.length === 0 && (
        <div className="klwb-detail-card">
          <div className="text-center py-5">
            <i className="fas fa-search fa-4x mb-3" style={{ color: 'var(--klwb-gray)' }}></i>
            <h5 style={{ color: 'var(--klwb-text-muted)' }}>{t('noProductsFound')}</h5>
            <p style={{ color: 'var(--klwb-text-muted)' }}>{t('tryAdjustingFilters')}</p>
            <button
              className="klwb-btn-secondary mt-3"
              onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', grade: '' })}
            >
              <i className="fas fa-refresh me-2"></i>
              {t('clearAllFilters')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;