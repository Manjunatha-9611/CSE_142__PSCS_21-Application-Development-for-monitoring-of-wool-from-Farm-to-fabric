import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/config.jsx';
import realtimeDbService from './realtimeDbService.jsx';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
  }

  async signUp(email, password, userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userProfile = {
        email: user.email,
        name: userData.name,
        role: userData.role,
        createdAt: new Date().toISOString(),
        ...userData
      };
      
      await realtimeDbService.writeData(`users/${user.uid}`, userProfile);

      return { success: true, user: { ...user, ...userProfile } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user data from Firebase
      let userData = { role: 'farmer', name: 'User' };
      const result = await realtimeDbService.readData(`users/${user.uid}`);
      if (result.success && result.data) {
        userData = result.data;
      }
      
      this.currentUser = user;
      this.userRole = userData?.role;
      
      return { success: true, user: { ...user, ...userData } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userRole = null;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        let userData = { role: 'farmer', name: 'User' };
        const result = await realtimeDbService.readData(`users/${user.uid}`);
        if (result.success && result.data) {
          userData = result.data;
        }
        
        this.currentUser = user;
        this.userRole = userData?.role;
        callback({ ...user, ...userData });
      } else {
        this.currentUser = null;
        this.userRole = null;
        callback(null);
      }
    });
  }

  hasRole(requiredRole) {
    return this.userRole === requiredRole;
  }

  hasAnyRole(roles) {
    return roles.includes(this.userRole);
  }
}

const authService = new AuthService();
export default authService;