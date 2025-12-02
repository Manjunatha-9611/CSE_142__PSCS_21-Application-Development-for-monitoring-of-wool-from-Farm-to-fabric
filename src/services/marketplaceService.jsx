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

class MarketplaceService {
    constructor() {
        this.offersCollection = 'marketplaceOffers';
        this.messagesCollection = 'marketplaceMessages';
        this.reviewsCollection = 'marketplaceReviews';
        this.favoritesCollection = 'marketplaceFavorites';
    }

    // ==================== OFFERS ====================

    /**
     * Create a new offer
     */
    async createOffer(offerData) {
        try {
            const offer = {
                ...offerData,
                status: 'pending',
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.offersCollection), offer);
            return { id: docRef.id, ...offer };
        } catch (error) {
            console.error('Error creating offer:', error);
            throw error;
        }
    }

    /**
     * Get offers for a listing
     */
    async getListingOffers(listingId) {
        try {
            const q = query(
                collection(db, this.offersCollection),
                where('listingId', '==', listingId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching listing offers:', error);
            return [];
        }
    }

    /**
     * Get user's sent offers
     */
    async getUserOffers(userId) {
        try {
            const q = query(
                collection(db, this.offersCollection),
                where('buyerId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching user offers:', error);
            return [];
        }
    }

    /**
     * Update offer status
     */
    async updateOfferStatus(offerId, status, counterOffer = null) {
        try {
            const offerRef = doc(db, this.offersCollection, offerId);
            const updateData = {
                status,
                updatedAt: Timestamp.now()
            };

            if (counterOffer) {
                updateData.counterOffer = counterOffer;
            }

            await updateDoc(offerRef, updateData);
            return true;
        } catch (error) {
            console.error('Error updating offer status:', error);
            throw error;
        }
    }

    // ==================== MESSAGES ====================

    /**
     * Send message
     */
    async sendMessage(messageData) {
        try {
            const message = {
                ...messageData,
                read: false,
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.messagesCollection), message);
            return { id: docRef.id, ...message };
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Get conversation messages
     */
    async getConversation(listingId, userId1, userId2) {
        try {
            const q = query(
                collection(db, this.messagesCollection),
                where('listingId', '==', listingId),
                orderBy('createdAt', 'asc')
            );

            const snapshot = await getDocs(q);
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Filter messages between the two users
            return messages.filter(msg =>
                (msg.senderId === userId1 && msg.receiverId === userId2) ||
                (msg.senderId === userId2 && msg.receiverId === userId1)
            );
        } catch (error) {
            console.error('Error fetching conversation:', error);
            return [];
        }
    }

    /**
     * Mark messages as read
     */
    async markMessagesAsRead(messageIds) {
        try {
            const promises = messageIds.map(async (id) => {
                const msgRef = doc(db, this.messagesCollection, id);
                await updateDoc(msgRef, { read: true });
            });

            await Promise.all(promises);
            return true;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }

    // ==================== REVIEWS ====================

    /**
     * Add review
     */
    async addReview(reviewData) {
        try {
            const review = {
                ...reviewData,
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.reviewsCollection), review);
            return { id: docRef.id, ...review };
        } catch (error) {
            console.error('Error adding review:', error);
            throw error;
        }
    }

    /**
     * Get seller reviews
     */
    async getSellerReviews(sellerId) {
        try {
            const q = query(
                collection(db, this.reviewsCollection),
                where('sellerId', '==', sellerId),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching seller reviews:', error);
            return [];
        }
    }

    /**
     * Calculate seller rating
     */
    async getSellerRating(sellerId) {
        try {
            const reviews = await this.getSellerReviews(sellerId);

            if (reviews.length === 0) {
                return { rating: 0, totalReviews: 0 };
            }

            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            const avgRating = totalRating / reviews.length;

            return {
                rating: avgRating,
                totalReviews: reviews.length
            };
        } catch (error) {
            console.error('Error calculating seller rating:', error);
            return { rating: 0, totalReviews: 0 };
        }
    }

    // ==================== FAVORITES ====================

    /**
     * Add to favorites
     */
    async addToFavorites(userId, listingId) {
        try {
            const favorite = {
                userId,
                listingId,
                createdAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.favoritesCollection), favorite);
            return { id: docRef.id, ...favorite };
        } catch (error) {
            console.error('Error adding to favorites:', error);
            throw error;
        }
    }

    /**
     * Remove from favorites
     */
    async removeFromFavorites(userId, listingId) {
        try {
            const q = query(
                collection(db, this.favoritesCollection),
                where('userId', '==', userId),
                where('listingId', '==', listingId)
            );

            const snapshot = await getDocs(q);
            const promises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(promises);

            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            throw error;
        }
    }

    /**
     * Get user favorites
     */
    async getUserFavorites(userId) {
        try {
            const q = query(
                collection(db, this.favoritesCollection),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching user favorites:', error);
            return [];
        }
    }

    /**
     * Check if listing is favorited
     */
    async isFavorited(userId, listingId) {
        try {
            const favorites = await this.getUserFavorites(userId);
            return favorites.some(fav => fav.listingId === listingId);
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    }
}

const marketplaceService = new MarketplaceService();
export default marketplaceService;
