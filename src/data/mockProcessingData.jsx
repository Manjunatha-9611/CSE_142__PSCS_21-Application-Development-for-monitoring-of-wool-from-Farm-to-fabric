// Mock Data Helper for Processing Services
// This file provides sample data for development and testing

import { firestore as db } from '../firebase/config.jsx';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * Seed sample processing service providers
 */
export const seedProcessingProviders = async () => {
    const providers = [
        {
            name: 'Karnataka Wool Shearing Services',
            serviceType: 'shearing',
            description: 'Professional sheep shearing with modern equipment. Over 15 years of experience.',
            location: 'Bangalore, Karnataka',
            pricePerKg: 45,
            processingTime: '1-2 days',
            rating: 4.8,
            totalReviews: 127,
            totalBookings: 458,
            certifications: ['ISO 9001', 'Animal Welfare Certified'],
            isActive: true,
            createdAt: Timestamp.now()
        },
        {
            name: 'Premium Wool Sorting Co.',
            serviceType: 'sorting',
            description: 'Expert wool sorting and grading services using advanced technology.',
            location: 'Mysore, Karnataka',
            pricePerKg: 35,
            processingTime: '2-3 days',
            rating: 4.6,
            totalReviews: 89,
            totalBookings: 312,
            certifications: ['Quality Assured'],
            isActive: true,
            createdAt: Timestamp.now()
        },
        {
            name: 'Rainbow Wool Dyeing',
            serviceType: 'dyeing',
            description: 'Natural and synthetic wool dyeing with eco-friendly processes.',
            location: 'Hubli, Karnataka',
            pricePerKg: 120,
            processingTime: '3-5 days',
            rating: 4.9,
            totalReviews: 156,
            totalBookings: 523,
            certifications: ['Eco-Friendly', 'ISO 14001'],
            isActive: true,
            createdAt: Timestamp.now()
        },
        {
            name: 'Clean Wool Scouring Services',
            serviceType: 'cleaning',
            description: 'Industrial wool cleaning and scouring with modern machinery.',
            location: 'Belgaum, Karnataka',
            pricePerKg: 55,
            processingTime: '1-2 days',
            rating: 4.7,
            totalReviews: 98,
            totalBookings: 387,
            certifications: ['ISO 9001'],
            isActive: true,
            createdAt: Timestamp.now()
        },
        {
            name: 'Carding Masters',
            serviceType: 'carding',
            description: 'Precision wool carding and preparation for spinning.',
            location: 'Mangalore, Karnataka',
            pricePerKg: 40,
            processingTime: '2-3 days',
            rating: 4.5,
            totalReviews: 67,
            totalBookings: 234,
            certifications: ['Quality Assured'],
            isActive: true,
            createdAt: Timestamp.now()
        },
        {
            name: 'Traditional Spinning Mills',
            serviceType: 'spinning',
            description: 'Traditional and modern wool spinning services.',
            location: 'Davangere, Karnataka',
            pricePerKg: 85,
            processingTime: '4-7 days',
            rating: 4.7,
            totalReviews: 134,
            totalBookings: 456,
            certifications: ['Handloom Mark', 'ISO 9001'],
            isActive: true,
            createdAt: Timestamp.now()
        }
    ];

    try {
        console.log('Seeding processing service providers...');
        const promises = providers.map(provider =>
            addDoc(collection(db, 'processingProviders'), provider)
        );
        await Promise.all(promises);
        console.log('Successfully seeded processing service providers!');
        return true;
    } catch (error) {
        console.error('Error seeding processing providers:', error);
        return false;
    }
};

/**
 * Make seeding functions available globally for dev purposes
 */
if (typeof window !== 'undefined') {
    window.seedProcessingProviders = seedProcessingProviders;
}

export default {
    seedProcessingProviders
};
