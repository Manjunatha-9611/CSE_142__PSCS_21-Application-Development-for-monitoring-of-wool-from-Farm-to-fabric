import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import processingService from '../services/processingService.jsx';

const ProcessingServices = ({ user }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('browse');
    const [serviceTypes, setServiceTypes] = useState([]);
    const [providers, setProviders] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [selectedType, setSelectedType] = useState('all');
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const [bookingForm, setBookingForm] = useState({
        serviceType: '',
        batchId: '',
        quantity: '',
        scheduledDate: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, [user]);

    const loadData = async () => {
        try {
            setLoading(true);

            const types = processingService.getServiceTypes();
            setServiceTypes(types);

            const allProviders = await processingService.getServiceProviders();
            setProviders(allProviders);

            const bookings = await processingService.getUserBookings(user.uid);
            setMyBookings(bookings);
        } catch (error) {
            console.error('Error loading processing services data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProviders = selectedType === 'all'
        ? providers
        : providers.filter(p => p.serviceType === selectedType);

    const handleBookService = async (e) => {
        e.preventDefault();

        if (!selectedProvider) return;

        try {
            await processingService.createBooking({
                ...bookingForm,
                userId: user.uid,
                userName: user.displayName || user.email,
                providerId: selectedProvider.id,
                providerName: selectedProvider.name,
                quantity: parseFloat(bookingForm.quantity)
            });

            setShowBookingModal(false);
            setSelectedProvider(null);
            setBookingForm({ serviceType: '', batchId: '', quantity: '', scheduledDate: '', notes: '' });
            loadData();
            alert(t('bookingCreatedSuccess'));
        } catch (error) {
            console.error('Error creating booking:', error);
            alert(t('failedToCreateBooking'));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-warning',
            confirmed: 'bg-info',
            in_progress: 'bg-primary',
            completed: 'bg-success',
            cancelled: 'bg-danger'
        };
        return badges[status] || 'bg-secondary';
    };

    if (loading) {
        return (
            <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl)' }}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <h5>{t('loadingProcessingServices')}</h5>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid" style={{ padding: 'var(--klwb-spacing-xl) var(--klwb-spacing-lg)' }}>
            {/* Header */}
            <div className="klwb-detail-card mb-4">
                <div className="klwb-detail-header">
                    <h2 className="klwb-detail-title">
                        <i className="fas fa-cogs me-2"></i>
                        {t('processingServices')}
                    </h2>
                    <p className="mb-0 text-muted">{t('processingSubtitle')}</p>
                </div>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'browse' ? 'active' : ''}`}
                        onClick={() => setActiveTab('browse')}
                    >
                        <i className="fas fa-search me-2"></i>
                        {t('browseServices')}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'bookings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('bookings')}
                    >
                        <i className="fas fa-calendar-check me-2"></i>
                        {t('myBookings')} ({myBookings.length})
                    </button>
                </li>
            </ul>

            {/* Browse Services Tab */}
            {activeTab === 'browse' && (
                <>
                    {/* Service Type Filter */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body">
                                    <h6 className="mb-3">
                                        <i className="fas fa-filter me-2"></i>
                                        {t('filterByServiceType')}
                                    </h6>
                                    <div className="btn-group flex-wrap" role="group">
                                        <button
                                            className={`btn ${selectedType === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                            onClick={() => setSelectedType('all')}
                                        >
                                            {t('allServices')}
                                        </button>
                                        {serviceTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                className={`btn ${selectedType === type.id ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setSelectedType(type.id)}
                                            >
                                                <i className={`${type.icon} me-1`}></i>
                                                {type.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Providers Grid */}
                    <div className="row">
                        {filteredProviders.length === 0 ? (
                            <div className="col-12">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body text-center py-5">
                                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">{t('noProvidersFound')}</h5>
                                        <p className="text-muted">{t('tryAdjustingFilters')}</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            filteredProviders.map((provider) => {
                                const serviceType = serviceTypes.find(t => t.id === provider.serviceType);

                                return (
                                    <div key={provider.id} className="col-md-6 col-lg-4 mb-4">
                                        <div className="card border-0 shadow-sm h-100">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div>
                                                        <h5 className="card-title mb-1">{provider.name}</h5>
                                                        <div className="text-warning mb-2">
                                                            {[...Array(5)].map((_, i) => (
                                                                <i
                                                                    key={i}
                                                                    className={`fas fa-star ${i < Math.floor(provider.rating || 0) ? '' : 'text-muted'}`}
                                                                ></i>
                                                            ))}
                                                            <small className="text-muted ms-2">
                                                                ({provider.totalReviews || 0} {t('reviews')})
                                                            </small>
                                                        </div>
                                                    </div>
                                                    {serviceType && (
                                                        <div className="badge bg-primary">
                                                            <i className={`${serviceType.icon} me-1`}></i>
                                                            {serviceType.name}
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-muted small mb-3">{provider.description}</p>

                                                <div className="mb-3">
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>
                                                            <i className="fas fa-map-marker-alt text-primary me-1"></i>
                                                            {t('location')}:
                                                        </span>
                                                        <strong>{provider.location}</strong>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>
                                                            <i className="fas fa-rupee-sign text-success me-1"></i>
                                                            {t('price')}:
                                                        </span>
                                                        <strong>₹{provider.pricePerKg}/kg</strong>
                                                    </div>
                                                    <div className="d-flex justify-content-between mb-2">
                                                        <span>
                                                            <i className="fas fa-clock text-info me-1"></i>
                                                            {t('processingTime')}:
                                                        </span>
                                                        <strong>{provider.processingTime}</strong>
                                                    </div>
                                                    <div className="d-flex justify-content-between">
                                                        <span>
                                                            <i className="fas fa-calendar-check text-warning me-1"></i>
                                                            {t('totalBookings')}:
                                                        </span>
                                                        <strong>{provider.totalBookings || 0}</strong>
                                                    </div>
                                                </div>

                                                {provider.certifications && provider.certifications.length > 0 && (
                                                    <div className="mb-3">
                                                        <small className="text-muted">{t('certifications')}:</small>
                                                        <div className="d-flex flex-wrap gap-1 mt-1">
                                                            {provider.certifications.map((cert, idx) => (
                                                                <span key={idx} className="badge bg-success">
                                                                    <i className="fas fa-certificate me-1"></i>
                                                                    {cert}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <button
                                                    className="klwb-btn-primary w-100"
                                                    onClick={() => {
                                                        setSelectedProvider(provider);
                                                        setBookingForm({
                                                            ...bookingForm,
                                                            serviceType: provider.serviceType
                                                        });
                                                        setShowBookingModal(true);
                                                    }}
                                                >
                                                    <i className="fas fa-calendar-plus me-2"></i>
                                                    {t('bookService')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* My Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="row">
                    {myBookings.length === 0 ? (
                        <div className="col-12">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body text-center py-5">
                                    <i className="fas fa-calendar-times fa-3x text-muted mb-3"></i>
                                    <h5 className="text-muted">{t('noBookingsYet')}</h5>
                                    <p className="text-muted">{t('browseServicesToBook')}</p>
                                    <button
                                        className="klwb-btn-primary mt-3"
                                        onClick={() => setActiveTab('browse')}
                                    >
                                        <i className="fas fa-search me-2"></i>
                                        {t('browseServices')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        myBookings.map((booking) => (
                            <div key={booking.id} className="col-12 mb-3">
                                <div className="card border-0 shadow-sm">
                                    <div className="card-body">
                                        <div className="row align-items-center">
                                            <div className="col-md-8">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <h5 className="mb-1">{booking.providerName}</h5>
                                                        <p className="text-muted mb-0">
                                                            {t('service')}: {serviceTypes.find(t => t.id === booking.serviceType)?.name}
                                                        </p>
                                                    </div>
                                                    <span className={`badge ${getStatusBadge(booking.status)}`}>
                                                        {booking.status.replace('_', ' ').toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="row mt-3">
                                                    <div className="col-6">
                                                        <small className="text-muted d-block">{t('batchId')}</small>
                                                        <strong>{booking.batchId}</strong>
                                                    </div>
                                                    <div className="col-6">
                                                        <small className="text-muted d-block">{t('quantity')}</small>
                                                        <strong>{booking.quantity} kg</strong>
                                                    </div>
                                                    <div className="col-6 mt-2">
                                                        <small className="text-muted d-block">{t('scheduledDate')}</small>
                                                        <strong>{booking.scheduledDate}</strong>
                                                    </div>
                                                    <div className="col-6 mt-2">
                                                        <small className="text-muted d-block">{t('bookedOn')}</small>
                                                        <strong>
                                                            {booking.createdAt?.toDate ?
                                                                booking.createdAt.toDate().toLocaleDateString() :
                                                                'N/A'}
                                                        </strong>
                                                    </div>
                                                </div>

                                                {booking.notes && (
                                                    <div className="mt-3">
                                                        <small className="text-muted d-block">{t('notes')}</small>
                                                        <p className="mb-0">{booking.notes}</p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="col-md-4 text-end">
                                                <div className="d-grid gap-2">
                                                    {booking.status === 'completed' && (
                                                        <button className="btn btn-sm btn-outline-warning">
                                                            <i className="fas fa-star me-1"></i>
                                                            {t('rateService')}
                                                        </button>
                                                    )}
                                                    {booking.status === 'pending' && (
                                                        <button className="btn btn-sm btn-outline-danger">
                                                            <i className="fas fa-times me-1"></i>
                                                            {t('cancelBooking')}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Booking Modal */}
            {showBookingModal && selectedProvider && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-calendar-plus me-2"></i>
                                    {t('bookService')}: {selectedProvider.name}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setShowBookingModal(false);
                                        setSelectedProvider(null);
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleBookService}>
                                <div className="modal-body">
                                    <div className="alert alert-info">
                                        <strong>{t('price')}:</strong> ₹{selectedProvider.pricePerKg}/kg<br />
                                        <strong>{t('processingTime')}:</strong> {selectedProvider.processingTime}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('batchId')} *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={bookingForm.batchId}
                                            onChange={(e) => setBookingForm({ ...bookingForm, batchId: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('quantity')} (kg) *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={bookingForm.quantity}
                                            onChange={(e) => setBookingForm({ ...bookingForm, quantity: e.target.value })}
                                            required
                                            min="1"
                                            step="0.1"
                                        />
                                        {bookingForm.quantity && (
                                            <small className="text-muted">
                                                {t('estimatedCost')}: ₹{(parseFloat(bookingForm.quantity) * selectedProvider.pricePerKg).toFixed(2)}
                                            </small>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('preferredDate')} *</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={bookingForm.scheduledDate}
                                            onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                                            required
                                            min={new Date().toISOString().split('T')[0]}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">{t('additionalNotes')}</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={bookingForm.notes}
                                            onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                            placeholder={t('notesPlaceholder')}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowBookingModal(false);
                                            setSelectedProvider(null);
                                        }}
                                    >
                                        {t('cancel')}
                                    </button>
                                    <button type="submit" className="klwb-btn-primary">
                                        <i className="fas fa-check me-2"></i>
                                        {t('confirmBooking')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProcessingServices;
