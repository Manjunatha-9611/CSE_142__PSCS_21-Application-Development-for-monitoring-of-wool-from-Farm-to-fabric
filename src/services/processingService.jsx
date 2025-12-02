import { firestore as db } from '../firebase/config.jsx';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp
} from 'firebase/firestore';

class ProcessingService {
    constructor() {
        this.providersCollection = 'processingProviders';
        this.bookingsCollection = 'processingBookings';
        this.reviewsCollection = 'processingReviews';
    }

    // ==================== SERVICE PROVIDERS ====================

    /**
     * Get all service providers
     */
    async getServiceProviders(serviceType = null) {
        try {
            let q;
            if (serviceType) {
                q = query(
                    collection(db, this.providersCollection),
                    where('serviceType', '==', serviceType),
                    where('isActive', '==', true)
                );
            } else {
                q = query(
                    collection(db, this.providersCollection),
                    where('isActive', '==', true)
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching service providers:', error);
            throw error;
        }
    }

    /**
     * Register a new service provider
     */
    async registerProvider(providerData) {
        try {
            const provider = {
                ...providerData,
                isActive: true,
                rating: 0,
                totalReviews: 0,
                totalBookings: 0,
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.providersCollection), provider);
            return { id: docRef.id, ...provider };
        } catch (error) {
            console.error('Error registering provider:', error);
            throw error;
        }
    }

    // ==================== BOOKINGS ====================

    /**
     * Create a new booking
     */
    async createBooking(bookingData) {
        try {
            const booking = {
                ...bookingData,
                status: 'pending',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.bookingsCollection), booking);

            // Update provider booking count
            const providerRef = doc(db, this.providersCollection, bookingData.providerId);
            const providerSnapshot = await getDocs(query(
                collection(db, this.providersCollection),
                where('__name__', '==', bookingData.providerId)
            ));

            if (!providerSnapshot.empty) {
                const providerData = providerSnapshot.docs[0].data();
                await updateDoc(providerRef, {
                    totalBookings: (providerData.totalBookings || 0) + 1
                });
            }

            return { id: docRef.id, ...booking };
        } catch (error) {
            console.error('Error creating booking:', error);
            throw error;
        }
    }

    /**
     * Get user bookings
     */
    async getUserBookings(userId) {
        try {
            const q = query(
                collection(db, this.bookingsCollection),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            throw error;
        }
    }

    /**
     * Get all bookings (for government)
     */
    async getAllBookings() {
        try {
            const q = query(
                collection(db, this.bookingsCollection),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching all bookings:', error);
            throw error;
        }
    }

    /**
     * Update booking status
     */
    async updateBookingStatus(bookingId, status, notes = '') {
        try {
            const bookingRef = doc(db, this.bookingsCollection, bookingId);
            await updateDoc(bookingRef, {
                status,
                statusNotes: notes,
                updatedAt: Timestamp.now()
            });
            return true;
        } catch (error) {
            console.error('Error updating booking status:', error);
            throw error;
        }
    }

    // ==================== REVIEWS ====================

    /**
     * Add review for a provider
     */
    async addReview(reviewData) {
        try {
            const review = {
                ...reviewData,
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.reviewsCollection), review);

            // Update provider rating
            await this.updateProviderRating(reviewData.providerId);

            return { id: docRef.id, ...review };
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }

    /**
     * Get reviews for a provider
     */
    async getProviderReviews(providerId) {
        try {
            const q = query(
                collection(db, this.reviewsCollection),
                where('providerId', '==', providerId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching provider reviews:', error);
            return [];
        }
    }

    /**
     * Update provider rating based on reviews
     */
    async updateProviderRating(providerId) {
        try {
            const reviews = await this.getProviderReviews(providerId);

            if (reviews.length === 0) return;

            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const avgRating = totalRating / reviews.length;

            const providerRef = doc(db, this.providersCollection, providerId);
            await updateDoc(providerRef, {
                rating: avgRating,
                totalReviews: reviews.length
            });
        } catch (error) {
            console.error('Error updating provider rating:', error);
        }
    }

    // ==================== SERVICE TYPES ====================

    /**
     * Get available service types
     */
    getServiceTypes() {
        return [
            {
                id: 'shearing',
                name: 'Shearing',
                description: 'Professional sheep shearing services',
                icon: 'fas fa-cut'
            },
            {
                id: 'sorting',
                name: 'Sorting & Grading',
                description: 'Wool sorting and quality grading',
                icon: 'fas fa-sort-amount-up'
            },
            {
                id: 'dyeing',
                name: 'Dyeing',
                description: 'Professional wool dyeing services',
                icon: 'fas fa-palette'
            },
            {
                id: 'cleaning',
                name: 'Cleaning & Scouring',
                description: 'Wool cleaning and scouring services',
                icon: 'fas fa-shower'
            },
            {
                id: 'carding',
                name: 'Carding',
                description: 'Wool carding and preparation',
                icon: 'fas fa-layer-group'
            },
            {
                id: 'spinning',
                name: 'Spinning',
                description: 'Wool spinning into yarn',
                icon: 'fas fa-sync'
            }
        ];
    }
}

const processingService = new ProcessingService();
export default processingService;
