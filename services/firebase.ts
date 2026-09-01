import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  collectionGroup,
  getDocs, 
  query, 
  orderBy, 
  limit, 
  deleteDoc,
  updateDoc,
  increment,
  onSnapshot,
  where,
  writeBatch,
  Unsubscribe
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { 
  QuizResultRecord, 
  SharedQuiz, 
  UserProfile, 
  QuizConfig, 
  Question, 
  SavedQuizRecord, 
  LeaderboardUser,
  AttendanceRecord,
  ChatMessage,
  MaintenanceConfig,
  AdminUserQuizEntry
} from '../types';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const MAX_CLOUD_QUIZZES_LIMIT = 10;

// Helper to get formatted IST date and time
export const getISTDateString = (d: Date = new Date()): string => {
  const istOffsetMs = 5.5 * 3600 * 1000;
  const istDate = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + istOffsetMs);
  const yyyy = istDate.getFullYear();
  const mm = String(istDate.getMonth() + 1).padStart(2, '0');
  const dd = String(istDate.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const getISTTimeString = (d: Date = new Date()): string => {
  const istOffsetMs = 5.5 * 3600 * 1000;
  const istDate = new Date(d.getTime() + (d.getTimezoneOffset() * 60000) + istOffsetMs);
  let hours = istDate.getHours();
  const minutes = String(istDate.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm} IST`;
};

// Auth helper functions
export const signInWithGoogle = async (): Promise<UserProfile | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    if (!user) return null;

    const todayDate = getISTDateString();
    const userRef = doc(db, 'users', user.uid);
    const existingDoc = await getDoc(userRef);
    const existingData = existingDoc.exists() ? existingDoc.data() : {};

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      createdAt: existingData.createdAt || new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      quizzesCompleted: existingData.quizzesCompleted || 0,
      totalQuestionsAnswered: existingData.totalQuestionsAnswered || 0,
      totalScore: existingData.totalScore || 0,
      savedQuizzesCount: existingData.savedQuizzesCount || 0,
      currentStreak: existingData.currentStreak || 1,
      lastCheckInDate: existingData.lastCheckInDate || todayDate,
      attendanceDaysCount: existingData.attendanceDaysCount || 1,
    };

    await setDoc(userRef, {
      ...userProfile,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    // Auto-record daily login attendance
    recordAttendance(userProfile, 'daily_login').catch(console.warn);

    return userProfile;
  } catch (error: any) {
    if (
      error?.code === 'auth/popup-closed-by-user' || 
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      return null;
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error('Sign-in popup was blocked by your browser. Please allow popups or open the app in a new tab.');
    }
    console.error('Google Sign-in Error:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign-out Error:', error);
    throw error;
  }
};

export const listenToAuthChanges = (callback: (user: UserProfile | null) => void): Unsubscribe => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      // Real-time listener for user profile document
      const userRef = doc(db, 'users', user.uid);
      const unsubUser = onSnapshot(userRef, (userDoc) => {
        const todayStr = getISTDateString();
        if (userDoc.exists()) {
          const data = userDoc.data();
          const profile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: data.displayName || user.displayName,
            photoURL: data.photoURL || user.photoURL,
            createdAt: data.createdAt,
            lastLoginAt: data.lastLoginAt,
            quizzesCompleted: data.quizzesCompleted || 0,
            totalQuestionsAnswered: data.totalQuestionsAnswered || 0,
            totalScore: data.totalScore || 0,
            savedQuizzesCount: data.savedQuizzesCount || 0,
            currentStreak: data.currentStreak || 1,
            lastCheckInDate: data.lastCheckInDate,
            attendanceDaysCount: data.attendanceDaysCount || 1,
            isBanned: data.isBanned || false,
            banReason: data.banReason || '',
          };

          // Automatically record daily login attendance if not yet checked in today
          if (data.lastCheckInDate !== todayStr) {
            recordAttendance(profile, 'daily_login').catch(console.warn);
          }

          callback(profile);
        } else {
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            currentStreak: 1,
            lastCheckInDate: todayStr,
            attendanceDaysCount: 1,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          };
          recordAttendance(newProfile, 'daily_login').catch(console.warn);
          callback(newProfile);
        }
      }, (error) => {
        console.warn('Auth snapshot error:', error);
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        });
      });
      return unsubUser;
    } else {
      callback(null);
    }
  });
};

// ==========================================
// ATTENDANCE & STREAK SYSTEM (Real-Time)
// ==========================================

export const recordAttendance = async (
  user: UserProfile,
  activityType: 'manual_checkin' | 'quiz_completion' | 'daily_login',
  extra?: { subject?: string; score?: number }
): Promise<AttendanceRecord> => {
  try {
    const todayStr = getISTDateString();
    const timeStr = getISTTimeString();
    const attendanceDocId = `${user.uid}_${todayStr}`;
    const attendanceRef = doc(db, 'attendance', attendanceDocId);

    // Calculate streak
    let newStreak = user.currentStreak || 1;
    let isNewDay = true;

    if (user.lastCheckInDate) {
      if (user.lastCheckInDate === todayStr) {
        // Already checked in today, keep same streak
        isNewDay = false;
        newStreak = user.currentStreak || 1;
      } else {
        // Calculate day difference
        const lastDate = new Date(user.lastCheckInDate + 'T00:00:00');
        const today = new Date(todayStr + 'T00:00:00');
        const diffDays = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        
        if (diffDays === 1) {
          // Consecutive day: Increment streak
          newStreak = (user.currentStreak || 0) + 1;
        } else {
          // Streak broken: Reset to 1
          newStreak = 1;
        }
      }
    }

    const record: AttendanceRecord = {
      id: attendanceDocId,
      userId: user.uid,
      displayName: user.displayName || 'NCERT Scholar',
      email: user.email,
      photoURL: user.photoURL,
      date: todayStr,
      timestamp: Date.now(),
      timeStr,
      activityType,
      currentStreak: newStreak,
      subjectAttempted: extra?.subject,
      scoreGained: extra?.score
    };

    // Save attendance record
    await setDoc(attendanceRef, record, { merge: true });

    // Update user profile streak & stats
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      currentStreak: newStreak,
      lastCheckInDate: todayStr,
      attendanceDaysCount: isNewDay ? increment(1) : (user.attendanceDaysCount || 1),
      lastActive: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return record;
  } catch (error) {
    console.error('Failed to record attendance:', error);
    throw error;
  }
};

/**
 * Real-time subscription to global attendance log (for admin & live attendance feed)
 */
export const subscribeToAttendance = (
  callback: (records: AttendanceRecord[]) => void,
  dateFilter?: string
): Unsubscribe => {
  try {
    const attendanceCol = collection(db, 'attendance');
    const q = query(attendanceCol, limit(1000));

    return onSnapshot(q, (snapshot) => {
      let records: AttendanceRecord[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as AttendanceRecord;
        records.push({
          ...data,
          id: docSnap.id
        });
      });
      // Sort newest first
      records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      if (dateFilter && dateFilter.trim() !== '') {
        const targetDate = dateFilter.trim();
        records = records.filter(r => r.date === targetDate);
      }

      callback(records);
    }, (error) => {
      console.warn('Attendance onSnapshot error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up attendance subscription:', error);
    callback([]);
    return () => {};
  }
};

/**
 * Direct fetch for all attendance records (for admin dashboard initial hydration)
 */
export const fetchAllAttendanceForAdmin = async (dateFilter?: string): Promise<AttendanceRecord[]> => {
  try {
    const attendanceCol = collection(db, 'attendance');
    const q = query(attendanceCol, limit(1000));
    const snapshot = await getDocs(q);
    let records: AttendanceRecord[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as AttendanceRecord;
      records.push({
        ...data,
        id: docSnap.id
      });
    });
    records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    if (dateFilter && dateFilter.trim() !== '') {
      records = records.filter(r => r.date === dateFilter.trim());
    }
    return records;
  } catch (error) {
    console.error('Error fetching attendance for admin:', error);
    return [];
  }
};

/**
 * Fetch personal attendance history for a single user
 */
export const fetchUserAttendance = async (userId: string): Promise<AttendanceRecord[]> => {
  try {
    const attendanceCol = collection(db, 'attendance');
    const q = query(attendanceCol, limit(1000));
    const snapshot = await getDocs(q);
    const records: AttendanceRecord[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data() as AttendanceRecord;
      if (data.userId === userId) {
        records.push({
          ...data,
          id: docSnap.id
        });
      }
    });
    records.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return records;
  } catch (error) {
    console.error('Error fetching user attendance:', error);
    return [];
  }
};

// ==========================================
// QUIZ HISTORY (Real-Time Synchronized)
// ==========================================

export const saveQuizResultToCloud = async (
  userId: string, 
  result: QuizResultRecord,
  userProfile?: UserProfile | null
): Promise<void> => {
  try {
    const timestamp = result.timestamp || Date.now();
    const timeIST = result.timeIST || getISTTimeString();
    const date = result.date || getISTDateString();
    const userName = userProfile?.displayName || result.userName || 'Scholar';
    const userEmail = userProfile?.email || null;
    const userPhoto = userProfile?.photoURL || null;

    const fullResultData = {
      ...result,
      userId,
      timestamp,
      timeIST,
      date,
      userName,
      userDisplayName: userName,
      userEmail,
      userPhoto,
      subject: result.subject || result.config?.subject || 'Assessment',
      class: result.class || result.config?.class || 'NCERT',
      topics: result.topics || result.config?.topics || [],
      strength: result.strength || result.config?.strength || 'Medium',
      score: result.score,
      total: result.total,
      percentage: Math.round((result.score / Math.max(1, result.total)) * 100)
    };

    // 1. Save in user's subcollection
    const historyRef = doc(db, 'users', userId, 'quizHistory', result.id);
    await setDoc(historyRef, fullResultData, { merge: true });

    // 2. Mirror into top-level quizAssessments collection for fast direct query in Admin Panel
    try {
      const topLevelRef = doc(db, 'quizAssessments', `${userId}_${result.id}`);
      await setDoc(topLevelRef, fullResultData, { merge: true });
    } catch (mirrorErr) {
      console.warn('Mirror quizAssessments write notice:', mirrorErr);
    }

    // 3. Also update aggregated user stats in users/{userId}
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      lastQuizAt: new Date().toISOString(),
      quizzesCompleted: increment(1),
      totalQuestionsAnswered: increment(result.total),
      totalScore: increment(result.score),
      lastActive: new Date().toISOString()
    }, { merge: true });

    // 4. Automatically record attendance for completing a quiz
    const profileToRecord: UserProfile = userProfile || {
      uid: userId,
      displayName: userName,
      email: userEmail,
      photoURL: userPhoto
    };
    recordAttendance(profileToRecord, 'quiz_completion', {
      subject: `${result.config?.class || 'NCERT'} ${result.config?.subject || 'Assessment'}`,
      score: result.score
    }).catch(console.warn);
  } catch (error) {
    console.error('Failed to save quiz result to Firestore:', error);
  }
};

export const fetchUserQuizHistory = async (userId: string): Promise<QuizResultRecord[]> => {
  try {
    const historyCol = collection(db, 'users', userId, 'quizHistory');
    const q = query(historyCol, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    const list: QuizResultRecord[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as QuizResultRecord);
    });
    return list;
  } catch (error) {
    console.error('Failed to fetch user quiz history:', error);
    return [];
  }
};

/**
 * Real-time subscription to user's quiz history
 */
export const subscribeToUserQuizHistory = (
  userId: string,
  callback: (history: QuizResultRecord[]) => void
): Unsubscribe => {
  try {
    const historyCol = collection(db, 'users', userId, 'quizHistory');
    const q = query(historyCol, orderBy('timestamp', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      const list: QuizResultRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as QuizResultRecord);
      });
      callback(list);
    }, (error) => {
      console.warn('Quiz history subscription error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Failed to subscribe to quiz history:', error);
    callback([]);
    return () => {};
  }
};

export const deleteUserQuizResult = async (userId: string, resultId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'quizHistory', resultId);
    const snap = await getDoc(docRef);
    const oldData = snap.exists() ? (snap.data() as QuizResultRecord) : null;
    await deleteDoc(docRef);

    if (oldData) {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        quizzesCompleted: increment(-1),
        totalQuestionsAnswered: increment(-oldData.total),
        totalScore: increment(-oldData.score),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Failed to delete quiz result:', error);
  }
};

/**
 * Admin: Delete any user's specific quiz result and recalculate aggregate metrics
 */
export const adminDeleteUserQuizResult = async (userId: string, resultId: string): Promise<void> => {
  return deleteUserQuizResult(userId, resultId);
};

/**
 * Admin: Modify score and details of any quiz result
 */
export const adminUpdateUserQuizResult = async (
  userId: string,
  resultId: string,
  updatedFields: Partial<QuizResultRecord>
): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'quizHistory', resultId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Result record not found');
    const oldData = snap.data() as QuizResultRecord;

    await setDoc(docRef, updatedFields, { merge: true });

    // If score or total questions changed, update aggregate user score
    if (updatedFields.score !== undefined || updatedFields.total !== undefined) {
      const scoreDiff = (updatedFields.score !== undefined ? updatedFields.score : oldData.score) - oldData.score;
      const totalDiff = (updatedFields.total !== undefined ? updatedFields.total : oldData.total) - oldData.total;
      
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        totalScore: increment(scoreDiff),
        totalQuestionsAnswered: increment(totalDiff),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (error) {
    console.error('Admin update quiz result error:', error);
    throw error;
  }
};

/**
 * Admin: Delete all quiz history records for a user
 */
export const adminDeleteAllUserQuizHistory = async (userId: string): Promise<void> => {
  try {
    const historyCol = collection(db, 'users', userId, 'quizHistory');
    const snapshot = await getDocs(historyCol);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      quizzesCompleted: 0,
      totalQuestionsAnswered: 0,
      totalScore: 0,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Admin delete all quiz history error:', error);
    throw error;
  }
};

/**
 * Admin: Update user profile stats (score, streak, quizzes, attendance, display name)
 */
export const adminUpdateUserProfile = async (
  userId: string,
  updatedData: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Admin update user profile error:', error);
    throw error;
  }
};


// ==========================================
// CLOUD QUIZ STORAGE VAULT (Limit: 50 Quizzes)
// ==========================================

export const fetchUserSavedQuizzes = async (userId: string): Promise<SavedQuizRecord[]> => {
  try {
    const savedCol = collection(db, 'users', userId, 'savedQuizzes');
    const q = query(savedCol, orderBy('timestamp', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    
    const list: SavedQuizRecord[] = [];
    snapshot.forEach(docSnap => {
      list.push(docSnap.data() as SavedQuizRecord);
    });
    return list;
  } catch (error) {
    console.error('Failed to fetch user saved quizzes:', error);
    return [];
  }
};

/**
 * Real-time subscription to saved quizzes in cloud vault
 */
export const subscribeToUserSavedQuizzes = (
  userId: string,
  callback: (quizzes: SavedQuizRecord[]) => void
): Unsubscribe => {
  try {
    const savedCol = collection(db, 'users', userId, 'savedQuizzes');
    const q = query(savedCol, orderBy('timestamp', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      const list: SavedQuizRecord[] = [];
      snapshot.forEach(docSnap => {
        list.push(docSnap.data() as SavedQuizRecord);
      });
      callback(list);
    }, (error) => {
      console.warn('Saved quizzes subscription error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Failed to subscribe to saved quizzes:', error);
    callback([]);
    return () => {};
  }
};

export const saveQuizToCloudBank = async (
  userId: string,
  title: string,
  config: QuizConfig,
  questions: Question[],
  description?: string,
  isPreSaved: boolean = false
): Promise<SavedQuizRecord> => {
  try {
    const existing = await fetchUserSavedQuizzes(userId);
    if (existing.length >= MAX_CLOUD_QUIZZES_LIMIT) {
      throw new Error(`Cloud Storage Quota Reached: You have reached the maximum limit of ${MAX_CLOUD_QUIZZES_LIMIT} saved quizzes. Please delete some quizzes to free up slots.`);
    }

    const quizId = 'saved_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const newRecord: SavedQuizRecord = {
      id: quizId,
      userId,
      title: title.trim() || `${config.class} ${config.subject} Assessment`,
      description: description?.trim() || `${config.topics.slice(0, 3).join(', ')} (${questions.length} Qs, ${config.strength})`,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      config,
      questions,
      isPreSaved
    };

    const docRef = doc(db, 'users', userId, 'savedQuizzes', quizId);
    await setDoc(docRef, newRecord);

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      savedQuizzesCount: existing.length + 1,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return newRecord;
  } catch (error) {
    console.error('Save to Cloud Bank Error:', error);
    throw error;
  }
};

export const deleteSavedQuiz = async (userId: string, quizId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'users', userId, 'savedQuizzes', quizId);
    await deleteDoc(docRef);

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      savedQuizzesCount: increment(-1),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Failed to delete saved quiz:', error);
    throw error;
  }
};

export const deleteAllSavedQuizzes = async (userId: string): Promise<void> => {
  try {
    const savedCol = collection(db, 'users', userId, 'savedQuizzes');
    const snapshot = await getDocs(savedCol);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      savedQuizzesCount: 0,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Failed to delete all saved quizzes:', error);
    throw error;
  }
};

// ==========================================
// SHARED QUIZZES (Public Challenges)
// ==========================================

export const publishSharedQuiz = async (
  config: QuizConfig,
  questions: Question[],
  user?: UserProfile | null
): Promise<string> => {
  try {
    const quizId = 'q_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const topicsStr = config.topics.length > 0 ? config.topics.slice(0, 2).join(', ') : config.subject;
    const title = `${config.class} ${config.subject}: ${topicsStr} (${config.quantity} Qs)`;

    const sharedData: SharedQuiz = {
      id: quizId,
      creatorId: user?.uid || 'guest',
      creatorName: user?.displayName || 'NCERT Scholar',
      creatorPhoto: user?.photoURL || '',
      title,
      createdAt: new Date().toISOString(),
      timestamp: Date.now(),
      config,
      questions,
      playsCount: 0
    };

    const quizRef = doc(db, 'sharedQuizzes', quizId);
    await setDoc(quizRef, sharedData);
    return quizId;
  } catch (error) {
    console.error('Failed to publish shared quiz:', error);
    throw error;
  }
};

export const fetchSharedQuiz = async (quizId: string): Promise<SharedQuiz | null> => {
  try {
    const quizRef = doc(db, 'sharedQuizzes', quizId);
    const snapshot = await getDoc(quizRef);
    if (!snapshot.exists()) return null;
    return snapshot.data() as SharedQuiz;
  } catch (error) {
    console.error('Failed to fetch shared quiz:', error);
    return null;
  }
};

export const incrementQuizPlays = async (quizId: string): Promise<void> => {
  try {
    const quizRef = doc(db, 'sharedQuizzes', quizId);
    await updateDoc(quizRef, {
      playsCount: increment(1)
    });
  } catch (e) {
    // silent fail
  }
};

// ==========================================
// ADMIN REAL-TIME DYNAMIC AUTHENTICATION & QUERIES
// ==========================================

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  if (!password || typeof password !== 'string') return false;
  const cleanInput = password.trim().replace(/[:\s-]/g, '').toLowerCase();
  if (!cleanInput) return false;

  try {
    const response = await fetch('/api/admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password: cleanInput }),
    });

    if (response.ok) {
      const data = await response.json();
      return !!data.success;
    }
  } catch (e) {
    console.warn('Backend admin verify unreachable, performing client-side IST validation:', e);
  }

  const now = Date.now();
  for (const offset of [-60000, 0, 60000]) {
    const istMs = (now + offset) + (5.5 * 3600 * 1000);
    const istDate = new Date(istMs);

    const hours24 = istDate.getUTCHours();
    const hours12 = hours24 % 12 || 12;
    const mins = istDate.getUTCMinutes();

    const mm = String(mins).padStart(2, '0');
    const hh24 = String(hours24).padStart(2, '0');
    const hh12 = String(hours12).padStart(2, '0');

    const candidates = [
      `${hh24}${mm}`,
      `${hours24}${mm}`,
      `${hh12}${mm}`,
      `${hours12}${mm}`,
    ];

    if (candidates.includes(cleanInput)) {
      return true;
    }
  }

  return false;
};

/**
 * Real-time subscription to all users for Admin
 */
export const subscribeToAllUsersForAdmin = (
  callback: (users: UserProfile[]) => void
): Unsubscribe => {
  try {
    const usersCol = collection(db, 'users');
    return onSnapshot(usersCol, (snapshot) => {
      const users: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        users.push({
          uid: docSnap.id,
          email: data.email || null,
          displayName: data.displayName || 'Anonymous User',
          photoURL: data.photoURL || null,
          createdAt: data.createdAt || data.lastLoginAt || new Date().toISOString(),
          lastLoginAt: data.lastLoginAt || data.updatedAt,
          updatedAt: data.updatedAt,
          quizzesCompleted: data.quizzesCompleted || 0,
          totalQuestionsAnswered: data.totalQuestionsAnswered || 0,
          totalScore: data.totalScore || 0,
          savedQuizzesCount: data.savedQuizzesCount || 0,
          currentStreak: data.currentStreak || 0,
          lastCheckInDate: data.lastCheckInDate,
          attendanceDaysCount: data.attendanceDaysCount || 0
        });
      });
      callback(users);
    }, (error) => {
      console.warn('Admin users snapshot error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to admin users:', error);
    callback([]);
    return () => {};
  }
};

export const fetchAllUsersForAdmin = async (): Promise<UserProfile[]> => {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    const users: UserProfile[] = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      users.push({
        uid: docSnap.id,
        email: data.email || null,
        displayName: data.displayName || 'Anonymous User',
        photoURL: data.photoURL || null,
        createdAt: data.createdAt || data.lastLoginAt || new Date().toISOString(),
        lastLoginAt: data.lastLoginAt || data.updatedAt,
        updatedAt: data.updatedAt,
        quizzesCompleted: data.quizzesCompleted || 0,
        totalQuestionsAnswered: data.totalQuestionsAnswered || 0,
        totalScore: data.totalScore || 0,
        savedQuizzesCount: data.savedQuizzesCount || 0,
        currentStreak: data.currentStreak || 0,
        lastCheckInDate: data.lastCheckInDate,
        attendanceDaysCount: data.attendanceDaysCount || 0
      });
    });
    return users;
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return [];
  }
};

export const fetchUserHistoryForAdmin = async (userId: string): Promise<QuizResultRecord[]> => {
  return fetchUserQuizHistory(userId);
};

export const fetchUserSavedQuizzesForAdmin = async (userId: string): Promise<SavedQuizRecord[]> => {
  return fetchUserSavedQuizzes(userId);
};

/**
 * Real-time subscription to all assessments across all scholars (for Admin panel)
 */
export const subscribeToAllQuizzesForAdmin = (
  callback: (quizzes: AdminUserQuizEntry[]) => void
): Unsubscribe => {
  try {
    // Listen to top-level quizAssessments mirror collection
    const assessmentsCol = collection(db, 'quizAssessments');
    const q = query(assessmentsCol, limit(500));

    return onSnapshot(q, (snapshot) => {
      const records: AdminUserQuizEntry[] = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as QuizResultRecord;
        const parentUserId = (data as any).userId || docSnap.id.split('_')[0] || 'anonymous';
        records.push({
          ...data,
          id: data.id || docSnap.id,
          userId: parentUserId,
          subject: data.subject || data.config?.subject || 'Assessment',
          class: data.class || data.config?.class || 'NCERT',
          topics: data.topics || data.config?.topics || [],
          strength: data.strength || data.config?.strength || 'Medium',
          userDisplayName: (data as any).userDisplayName || (data as any).userName || undefined,
          userEmail: (data as any).userEmail || undefined,
          userPhoto: (data as any).userPhoto || undefined,
          date: data.date || getISTDateString(),
          timeIST: data.timeIST || (data.timestamp ? getISTTimeString(new Date(data.timestamp)) : '')
        });
      });

      records.sort((a, b) => {
        const tA = a.timestamp || (a.date ? new Date(a.date).getTime() : 0);
        const tB = b.timestamp || (b.date ? new Date(b.date).getTime() : 0);
        return tB - tA;
      });

      callback(records);
    }, (error) => {
      console.warn('subscribeToAllQuizzesForAdmin notice:', error);
      // Fallback: trigger manual fetch
      fetchAllQuizzesAcrossUsersForAdmin().then(callback).catch(() => callback([]));
    });
  } catch (err) {
    console.warn('subscribeToAllQuizzesForAdmin setup error:', err);
    fetchAllQuizzesAcrossUsersForAdmin().then(callback).catch(() => callback([]));
    return () => {};
  }
};

/**
 * Fetch all quizzes/assessments completed by all scholars (Multi-tiered resilient fetcher)
 */
export const fetchAllQuizzesAcrossUsersForAdmin = async (): Promise<AdminUserQuizEntry[]> => {
  const resultMap = new Map<string, AdminUserQuizEntry>();

  // 1. First Tier: Top-level quizAssessments collection
  try {
    const assessmentsCol = collection(db, 'quizAssessments');
    const snap = await getDocs(query(assessmentsCol, limit(500)));
    snap.forEach(docSnap => {
      const data = docSnap.data() as QuizResultRecord;
      const parentUserId = (data as any).userId || docSnap.id.split('_')[0] || 'anonymous';
      const key = `${parentUserId}_${data.id || docSnap.id}`;
      resultMap.set(key, {
        ...data,
        id: data.id || docSnap.id,
        userId: parentUserId,
        subject: data.subject || data.config?.subject || 'Assessment',
        class: data.class || data.config?.class || 'NCERT',
        topics: data.topics || data.config?.topics || [],
        strength: data.strength || data.config?.strength || 'Medium',
        userDisplayName: (data as any).userDisplayName || (data as any).userName || undefined,
        userEmail: (data as any).userEmail || undefined,
        userPhoto: (data as any).userPhoto || undefined,
        date: data.date || getISTDateString(),
        timeIST: data.timeIST || (data.timestamp ? getISTTimeString(new Date(data.timestamp)) : '')
      });
    });
  } catch (err) {
    console.warn('Tier 1 quizAssessments query notice:', err);
  }

  // 2. Second Tier: CollectionGroup quizHistory (WITHOUT orderBy to prevent index errors)
  try {
    const cgQuery = query(collectionGroup(db, 'quizHistory'), limit(500));
    const cgSnap = await getDocs(cgQuery);
    cgSnap.forEach(docSnap => {
      const data = docSnap.data() as QuizResultRecord;
      const parentUserId = docSnap.ref.parent.parent?.id || (data as any).userId || 'anonymous';
      const key = `${parentUserId}_${data.id || docSnap.id}`;
      if (!resultMap.has(key)) {
        resultMap.set(key, {
          ...data,
          id: data.id || docSnap.id,
          userId: parentUserId,
          subject: data.subject || data.config?.subject || 'Assessment',
          class: data.class || data.config?.class || 'NCERT',
          topics: data.topics || data.config?.topics || [],
          strength: data.strength || data.config?.strength || 'Medium',
          userDisplayName: (data as any).userDisplayName || (data as any).userName || undefined,
          userEmail: (data as any).userEmail || undefined,
          userPhoto: (data as any).userPhoto || undefined,
          date: data.date || getISTDateString(),
          timeIST: data.timeIST || (data.timestamp ? getISTTimeString(new Date(data.timestamp)) : '')
        });
      }
    });
  } catch (cgErr) {
    console.warn('Tier 2 CollectionGroup quizHistory query notice:', cgErr);
  }

  // 3. Third Tier: Per-user subcollection fetch using Promise.allSettled
  try {
    const usersCol = collection(db, 'users');
    const usersSnap = await getDocs(query(usersCol, limit(200)));
    const promises = usersSnap.docs.map(async (userDoc) => {
      const userData = userDoc.data();
      const userId = userDoc.id;
      try {
        const historyCol = collection(db, 'users', userId, 'quizHistory');
        const hSnap = await getDocs(query(historyCol, limit(50)));
        hSnap.forEach(hDoc => {
          const d = hDoc.data() as QuizResultRecord;
          const key = `${userId}_${d.id || hDoc.id}`;
          if (!resultMap.has(key)) {
            resultMap.set(key, {
              ...d,
              id: d.id || hDoc.id,
              userId,
              subject: d.subject || d.config?.subject || 'Assessment',
              class: d.class || d.config?.class || 'NCERT',
              topics: d.topics || d.config?.topics || [],
              strength: d.strength || d.config?.strength || 'Medium',
              userDisplayName: userData.displayName || d.userName || undefined,
              userEmail: userData.email || undefined,
              userPhoto: userData.photoURL || undefined,
              date: d.date || getISTDateString(),
              timeIST: d.timeIST || (d.timestamp ? getISTTimeString(new Date(d.timestamp)) : '')
            });
          }
        });
      } catch (userErr) {
        // Ignored for individual user doc
      }
    });

    await Promise.allSettled(promises);
  } catch (usersErr) {
    console.warn('Tier 3 users subcollection fetch notice:', usersErr);
  }

  const allResults = Array.from(resultMap.values());
  return allResults.sort((a, b) => {
    const tA = a.timestamp || (a.date ? new Date(a.date).getTime() : 0);
    const tB = b.timestamp || (b.date ? new Date(b.date).getTime() : 0);
    return tB - tA;
  });
};

/**
 * Delete a user's quiz attempt as Admin
 */
export const adminDeleteUserQuizAttempt = async (userId: string, resultId: string): Promise<void> => {
  try {
    // 1. Delete from subcollection
    const ref = doc(db, 'users', userId, 'quizHistory', resultId);
    await deleteDoc(ref).catch(console.warn);

    // 2. Delete from top-level mirror
    const mirrorRef = doc(db, 'quizAssessments', `${userId}_${resultId}`);
    await deleteDoc(mirrorRef).catch(console.warn);
  } catch (error) {
    console.error('Admin delete user quiz attempt error:', error);
    throw error;
  }
};

/**
 * Real-time subscription to shared quizzes for Admin
 */
export const subscribeToSharedQuizzesForAdmin = (
  callback: (quizzes: SharedQuiz[]) => void
): Unsubscribe => {
  try {
    const sharedCol = collection(db, 'sharedQuizzes');
    const q = query(sharedCol, orderBy('timestamp', 'desc'), limit(100));
    return onSnapshot(q, (snapshot) => {
      const quizzes: SharedQuiz[] = [];
      snapshot.forEach(docSnap => {
        quizzes.push(docSnap.data() as SharedQuiz);
      });
      callback(quizzes);
    }, (error) => {
      console.warn('Admin shared quizzes snapshot error:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error subscribing to shared quizzes:', error);
    callback([]);
    return () => {};
  }
};

export const fetchAllSharedQuizzesForAdmin = async (): Promise<SharedQuiz[]> => {
  try {
    const sharedCol = collection(db, 'sharedQuizzes');
    const snapshot = await getDocs(query(sharedCol, orderBy('timestamp', 'desc'), limit(50)));
    const quizzes: SharedQuiz[] = [];
    snapshot.forEach(docSnap => {
      quizzes.push(docSnap.data() as SharedQuiz);
    });
    return quizzes;
  } catch (error) {
    console.error('Admin fetch shared quizzes error:', error);
    return [];
  }
};

export const deleteSharedQuizByAdmin = async (quizId: string): Promise<void> => {
  try {
    const quizRef = doc(db, 'sharedQuizzes', quizId);
    await deleteDoc(quizRef);
  } catch (error) {
    console.error('Admin delete shared quiz error:', error);
    throw error;
  }
};

/**
 * Delete a shared quiz (allowed if user is creator or admin)
 */
export const deleteSharedQuiz = async (
  quizId: string,
  userId?: string | null,
  isAdmin: boolean = false
): Promise<void> => {
  try {
    const quizRef = doc(db, 'sharedQuizzes', quizId);
    if (!isAdmin && userId) {
      const snap = await getDoc(quizRef);
      if (snap.exists()) {
        const data = snap.data() as SharedQuiz;
        if (data.creatorId !== userId) {
          throw new Error('Permission denied: You can only delete quizzes you created.');
        }
      }
    }
    await deleteDoc(quizRef);
  } catch (error) {
    console.error('Failed to delete shared quiz:', error);
    throw error;
  }
};

/**
 * Real-time subscription to public shared quizzes list for community tab
 */
export const subscribeToAllSharedQuizzes = (
  callback: (quizzes: SharedQuiz[]) => void
): Unsubscribe => {
  return subscribeToSharedQuizzesForAdmin(callback);
};


// ==========================================
// PUBLIC LEADERBOARD AGGREGATION (Real-Time)
// ==========================================

export interface LeaderboardResult {
  topUsers: LeaderboardUser[];
  currentUserRank: LeaderboardUser | null;
  totalParticipants: number;
  lastUpdated: string;
}

const processLeaderboardSnapshot = (
  snapshotDocs: any[],
  currentUserId?: string | null,
  sortBy: 'score' | 'quizzes' | 'accuracy' = 'score'
): LeaderboardResult => {
  const userList: LeaderboardUser[] = [];

  snapshotDocs.forEach((docSnap) => {
    const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap;
    const uid = docSnap.id || data.uid;
    const quizzesCompleted = Number(data.quizzesCompleted) || 0;
    const totalScore = Number(data.totalScore) || 0;
    const totalQuestionsAnswered = Number(data.totalQuestionsAnswered) || 0;

    const accuracy = totalQuestionsAnswered > 0 
      ? Math.min(100, Math.round((totalScore / totalQuestionsAnswered) * 100))
      : 0;

    let displayName = data.displayName || '';
    if (!displayName && data.email) {
      const [local, domain] = data.email.split('@');
      if (local.length > 2) {
        displayName = `${local[0]}***${local[local.length - 1]}@${domain || 'domain'}`;
      } else {
        displayName = `${local}***@${domain || 'domain'}`;
      }
    }
    if (!displayName) {
      displayName = `Scholar ${uid ? uid.substring(0, 4) : 'User'}`;
    }

    userList.push({
      rank: 0,
      uid,
      displayName,
      email: data.email || null,
      photoURL: data.photoURL || null,
      totalScore,
      quizzesCompleted,
      totalQuestionsAnswered,
      accuracy,
      lastActive: data.lastQuizAt || data.updatedAt || data.lastLoginAt || data.createdAt,
      isCurrentUser: currentUserId ? uid === currentUserId : false
    });
  });

  userList.sort((a, b) => {
    if (sortBy === 'quizzes') {
      if (b.quizzesCompleted !== a.quizzesCompleted) return b.quizzesCompleted - a.quizzesCompleted;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.accuracy - a.accuracy;
    }
    if (sortBy === 'accuracy') {
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
      return b.quizzesCompleted - a.quizzesCompleted;
    }
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
    return b.quizzesCompleted - a.quizzesCompleted;
  });

  userList.forEach((user, index) => {
    user.rank = index + 1;
  });

  const topUsers = userList.slice(0, 10);
  const currentUserRank = currentUserId 
    ? userList.find((u) => u.uid === currentUserId) || null 
    : null;

  return {
    topUsers,
    currentUserRank,
    totalParticipants: userList.length,
    lastUpdated: getISTTimeString()
  };
};

/**
 * Real-time subscription to Leaderboard rankings
 */
export const subscribeToLeaderboard = (
  currentUserId: string | null | undefined,
  sortBy: 'score' | 'quizzes' | 'accuracy',
  callback: (result: LeaderboardResult) => void
): Unsubscribe => {
  try {
    const usersCol = collection(db, 'users');
    return onSnapshot(usersCol, (snapshot) => {
      const result = processLeaderboardSnapshot(snapshot.docs, currentUserId, sortBy);
      callback(result);
    }, (error) => {
      console.warn('Leaderboard onSnapshot error:', error);
      fetchLeaderboardTopUsers(currentUserId, sortBy).then(callback);
    });
  } catch (error) {
    console.error('Error setting up leaderboard subscription:', error);
    fetchLeaderboardTopUsers(currentUserId, sortBy).then(callback);
    return () => {};
  }
};

export const fetchLeaderboardTopUsers = async (
  currentUserId?: string | null,
  sortBy: 'score' | 'quizzes' | 'accuracy' = 'score'
): Promise<LeaderboardResult> => {
  try {
    const usersCol = collection(db, 'users');
    const snapshot = await getDocs(usersCol);
    return processLeaderboardSnapshot(snapshot.docs, currentUserId, sortBy);
  } catch (error) {
    console.error('Error fetching leaderboard top users:', error);
    return {
      topUsers: [],
      currentUserRank: null,
      totalParticipants: 0,
      lastUpdated: getISTTimeString()
    };
  }
};

/**
 * Public Real-time Study Room Chat
 */

export const sendPublicChatMessage = async (
  user: UserProfile,
  messageText: string,
  subjectTag: string = 'General'
): Promise<ChatMessage> => {
  if (!user || !user.uid) {
    throw new Error('You must be signed in to participate in the public study chat.');
  }

  const trimmed = messageText.trim();
  if (!trimmed) {
    throw new Error('Message cannot be empty.');
  }

  if (trimmed.length > 1000) {
    throw new Error('Message exceeds the 1000 character limit.');
  }

  const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const chatMsg: ChatMessage = {
    id: messageId,
    userId: user.uid,
    userName: user.displayName || 'Anonymous Scholar',
    userPhoto: user.photoURL || null,
    message: trimmed,
    timestamp: Date.now(),
    createdAt: new Date().toISOString(),
    subjectTag: subjectTag || 'General'
  };

  const msgRef = doc(db, 'publicChat', messageId);
  await setDoc(msgRef, chatMsg);
  return chatMsg;
};

export const listenToPublicChat = (
  callback: (messages: ChatMessage[]) => void,
  limitCount: number = 80
): Unsubscribe => {
  try {
    const chatCol = collection(db, 'publicChat');
    const q = query(chatCol, orderBy('timestamp', 'desc'), limit(limitCount));

    return onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ChatMessage;
        msgs.push({
          ...data,
          id: docSnap.id
        });
      });
      // Sort in chronological order (oldest first) so chat reads naturally top-to-bottom
      msgs.sort((a, b) => a.timestamp - b.timestamp);
      callback(msgs);
    }, (err) => {
      console.warn('Public Chat onSnapshot error:', err);
    });
  } catch (err) {
    console.error('Failed to set up public chat listener:', err);
    return () => {};
  }
};

export const deletePublicChatMessage = async (messageId: string): Promise<void> => {
  const msgRef = doc(db, 'publicChat', messageId);
  await deleteDoc(msgRef);
};

export const togglePublicChatReaction = async (
  messageId: string,
  emoji: string,
  userId: string
): Promise<void> => {
  try {
    const msgRef = doc(db, 'publicChat', messageId);
    const snap = await getDoc(msgRef);
    if (!snap.exists()) return;
    const data = snap.data() as ChatMessage;
    const currentReactions = data.reactions || {};
    const usersForEmoji = currentReactions[emoji] || [];
    
    let updatedUsers: string[];
    if (usersForEmoji.includes(userId)) {
      updatedUsers = usersForEmoji.filter(id => id !== userId);
    } else {
      updatedUsers = [...usersForEmoji, userId];
    }
    
    const updatedReactions = { ...currentReactions };
    if (updatedUsers.length === 0) {
      delete updatedReactions[emoji];
    } else {
      updatedReactions[emoji] = updatedUsers;
    }
    
    await updateDoc(msgRef, { reactions: updatedReactions });
  } catch (err) {
    console.error('Failed to toggle chat reaction:', err);
  }
};

// ==========================================
// SYSTEM MAINTENANCE MODE
// ==========================================

export const listenToMaintenanceMode = (
  callback: (config: MaintenanceConfig) => void
): Unsubscribe => {
  try {
    const docRef = doc(db, 'system', 'maintenance');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as MaintenanceConfig);
      } else {
        // Default: maintenance inactive
        callback({ isActive: false });
      }
    }, (err) => {
      console.warn('Maintenance mode onSnapshot error:', err);
      callback({ isActive: false });
    });
  } catch (err) {
    console.error('Failed to listen to maintenance mode:', err);
    return () => {};
  }
};

export const updateMaintenanceMode = async (
  config: Partial<MaintenanceConfig>
): Promise<void> => {
  try {
    const docRef = doc(db, 'system', 'maintenance');
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Update maintenance mode error:', error);
    throw error;
  }
};

// ==========================================
// ADMIN GOD-MODE CONTROLS & MANAGEMENT
// ==========================================

/**
 * Admin: Delete a single user and their subcollections
 */
export const adminDeleteUser = async (userId: string): Promise<void> => {
  try {
    // Delete user doc
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);

    // Delete attendance records for this user
    const attCol = collection(db, 'attendance');
    const q = query(attCol, where('userId', '==', userId));
    const attSnap = await getDocs(q);
    const batch = writeBatch(db);
    attSnap.forEach(d => batch.delete(d.ref));
    await batch.commit();
  } catch (error) {
    console.error('Admin delete user error:', error);
    throw error;
  }
};

/**
 * Admin: Delete ALL users across the platform
 */
export const adminDeleteAllUsers = async (): Promise<number> => {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach(d => {
      batch.delete(d.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    console.error('Admin delete all users error:', error);
    throw error;
  }
};

/**
 * Admin: Delete a single attendance record
 */
export const adminDeleteAttendanceRecord = async (recordId: string): Promise<void> => {
  try {
    const ref = doc(db, 'attendance', recordId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Admin delete attendance record error:', error);
    throw error;
  }
};

/**
 * Admin: Delete ALL attendance records
 */
export const adminDeleteAllAttendanceRecords = async (): Promise<number> => {
  try {
    const col = collection(db, 'attendance');
    const snap = await getDocs(col);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach(d => {
      batch.delete(d.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    console.error('Admin delete all attendance error:', error);
    throw error;
  }
};

/**
 * Admin: Delete a shared challenge quiz
 */
export const adminDeleteSharedQuiz = async (quizId: string): Promise<void> => {
  try {
    const ref = doc(db, 'sharedQuizzes', quizId);
    await deleteDoc(ref);
  } catch (error) {
    console.error('Admin delete shared quiz error:', error);
    throw error;
  }
};

/**
 * Admin: Delete ALL shared challenge quizzes
 */
export const adminDeleteAllSharedQuizzes = async (): Promise<number> => {
  try {
    const col = collection(db, 'sharedQuizzes');
    const snap = await getDocs(col);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach(d => {
      batch.delete(d.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    console.error('Admin delete all shared quizzes error:', error);
    throw error;
  }
};

/**
 * Admin: Delete ALL public chat messages
 */
export const adminDeleteAllPublicChatMessages = async (): Promise<number> => {
  try {
    const col = collection(db, 'publicChat');
    const snap = await getDocs(col);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach(d => {
      batch.delete(d.ref);
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    console.error('Admin delete all public chat error:', error);
    throw error;
  }
};

/**
 * Admin: Reset all scholar statistics and leaderboard scores
 */
export const adminResetAllLeaderboards = async (): Promise<number> => {
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    const batch = writeBatch(db);
    let count = 0;
    snap.forEach(d => {
      batch.update(d.ref, {
        totalScore: 0,
        quizzesCompleted: 0,
        totalQuestionsAnswered: 0,
        currentStreak: 0
      });
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    console.error('Admin reset leaderboards error:', error);
    throw error;
  }
};

/**
 * Admin: Ban or Unban a user
 */
export const adminBanUser = async (
  userId: string,
  isBanned: boolean,
  banReason?: string
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      isBanned,
      banReason: isBanned ? (banReason || 'Administrative suspension') : null,
      bannedAt: isBanned ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error('Admin ban user error:', error);
    throw error;
  }
};





