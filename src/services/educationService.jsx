import { firestore as db } from '../firebase/config.jsx';
import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDocs,
    getDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';

class EducationService {
    constructor() {
        this.progressCollection = 'userProgress';
        this.certificatesCollection = 'userCertificates';
        this.quizResultsCollection = 'quizResults';
    }

    // ==================== USER PROGRESS ====================

    /**
     * Update user progress for a course
     */
    async updateProgress(userId, courseId, progressData) {
        try {
            // Check if progress exists
            const q = query(
                collection(db, this.progressCollection),
                where('userId', '==', userId),
                where('courseId', '==', courseId)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                // Create new progress
                const progress = {
                    userId,
                    courseId,
                    ...progressData,
                    startedAt: Timestamp.now(),
                    updatedAt: Timestamp.now()
                };

                const docRef = await addDoc(collection(db, this.progressCollection), progress);
                return { id: docRef.id, ...progress };
            } else {
                // Update existing progress
                const progressRef = doc(db, this.progressCollection, snapshot.docs[0].id);
                await updateDoc(progressRef, {
                    ...progressData,
                    updatedAt: Timestamp.now()
                });
                return { id: snapshot.docs[0].id, ...progressData };
            }
        } catch (error) {
            console.error('Error updating progress:', error);
            throw error;
        }
    }

    /**
     * Get user progress for a course
     */
    async getProgress(userId, courseId) {
        try {
            const q = query(
                collection(db, this.progressCollection),
                where('userId', '==', userId),
                where('courseId', '==', courseId)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                return null;
            }

            return {
                id: snapshot.docs[0].id,
                ...snapshot.docs[0].data()
            };
        } catch (error) {
            console.error('Error fetching progress:', error);
            return null;
        }
    }

    /**
     * Get all user progress
     */
    async getAllProgress(userId) {
        try {
            const q = query(
                collection(db, this.progressCollection),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching all progress:', error);
            return [];
        }
    }

    // ==================== QUIZ RESULTS ====================

    /**
     * Save quiz result
     */
    async saveQuizResult(resultData) {
        try {
            const result = {
                ...resultData,
                completedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.quizResultsCollection), result);

            // Update course progress if quiz passed
            if (resultData.passed) {
                await this.updateProgress(resultData.userId, resultData.courseId, {
                    quizCompleted: true,
                    quizScore: resultData.score
                });
            }

            return { id: docRef.id, ...result };
        } catch (error) {
            console.error('Error saving quiz result:', error);
            throw error;
        }
    }

    /**
     * Get quiz results for a user
     */
    async getQuizResults(userId, courseId = null) {
        try {
            let q;
            if (courseId) {
                q = query(
                    collection(db, this.quizResultsCollection),
                    where('userId', '==', userId),
                    where('courseId', '==', courseId)
                );
            } else {
                q = query(
                    collection(db, this.quizResultsCollection),
                    where('userId', '==', userId)
                );
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching quiz results:', error);
            return [];
        }
    }

    // ==================== CERTIFICATES ====================

    /**
     * Generate certificate
     */
    async generateCertificate(userId, courseId, courseName) {
        try {
            const certificate = {
                userId,
                courseId,
                courseName,
                certificateNumber: this.generateCertificateNumber(),
                issuedAt: Timestamp.now()
            };

            const docRef = await addDoc(collection(db, this.certificatesCollection), certificate);

            // Mark course as completed
            await this.updateProgress(userId, courseId, {
                completed: true,
                completedAt: Timestamp.now(),
                certificateId: docRef.id
            });

            return { id: docRef.id, ...certificate };
        } catch (error) {
            console.error('Error generating certificate:', error);
            throw error;
        }
    }

    /**
     * Get user certificates
     */
    async getUserCertificates(userId) {
        try {
            const q = query(
                collection(db, this.certificatesCollection),
                where('userId', '==', userId)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error fetching certificates:', error);
            return [];
        }
    }

    /**
     * Get certificate by ID
     */
    async getCertificate(certificateId) {
        try {
            const docRef = doc(db, this.certificatesCollection, certificateId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching certificate:', error);
            return null;
        }
    }

    /**
     * Generate unique certificate number
     */
    generateCertificateNumber() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `CERT-KWM-${timestamp}-${random}`;
    }

    // ==================== COURSE DATA ====================

    /**
     * Get available courses
     */
    getCourses() {
        return [
            {
                id: 'wool-basics',
                title: 'Wool Production Basics',
                description: 'Learn the fundamentals of wool production from sheep breeding to shearing',
                duration: '2 hours',
                level: 'Beginner',
                modules: 5,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                icon: 'fas fa-book',
                quizQuestions: [
                    {
                        id: 1,
                        question: 'What is the ideal time for sheep shearing?',
                        options: ['Spring', 'Summer', 'Autumn', 'Winter'],
                        correctAnswer: 0
                    },
                    {
                        id: 2,
                        question: 'Which breed produces the finest wool?',
                        options: ['Merino', 'Suffolk', 'Dorset', 'Hampshire'],
                        correctAnswer: 0
                    },
                    {
                        id: 3,
                        question: 'What is the moisture content limit for storing wool?',
                        options: ['5%', '10%', '15%', '20%'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                id: 'quality-grading',
                title: 'Wool Quality Grading',
                description: 'Master the techniques for grading and assessing wool quality',
                duration: '3 hours',
                level: 'Intermediate',
                modules: 6,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                icon: 'fas fa-star',
                quizQuestions: [
                    {
                        id: 1,
                        question: 'What does micron measurement indicate?',
                        options: ['Wool length', 'Wool fineness', 'Wool color', 'Wool strength'],
                        correctAnswer: 1
                    },
                    {
                        id: 2,
                        question: 'Which grade indicates the finest wool?',
                        options: ['Grade A', 'Grade B', 'Grade C', 'Grade D'],
                        correctAnswer: 0
                    }
                ]
            },
            {
                id: 'market-trends',
                title: 'Understanding Wool Markets',
                description: 'Learn about wool pricing, market trends, and trading strategies',
                duration: '2.5 hours',
                level: 'Advanced',
                modules: 4,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                icon: 'fas fa-chart-line',
                quizQuestions: [
                    {
                        id: 1,
                        question: 'What factors affect wool prices the most?',
                        options: ['Quality and demand', 'Color only', 'Breed only', 'Season only'],
                        correctAnswer: 0
                    },
                    {
                        id: 2,
                        question: 'When are wool prices typically highest?',
                        options: ['Before shearing season', 'After shearing season', 'Mid-year', 'End of year'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                id: 'sustainable-practices',
                title: 'Sustainable Wool Farming',
                description: 'Best practices for sustainable and ethical wool production',
                duration: '2 hours',
                level: 'Intermediate',
                modules: 5,
                videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                icon: 'fas fa-leaf',
                quizQuestions: [
                    {
                        id: 1,
                        question: 'What is regenerative grazing?',
                        options: ['Overgrazing', 'Rotational grazing', 'No grazing', 'Random grazing'],
                        correctAnswer: 1
                    }
                ]
            }
        ];
    }
}

const educationService = new EducationService();
export default educationService;
