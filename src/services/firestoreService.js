import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/firebase/config'

export class FirestoreService {
  // 获取所有诈骗文章
  async getScams() {
    try {
      const scamsRef = collection(db, 'scams')
      const q = query(scamsRef, orderBy('createdAt', 'asc'))
      const querySnapshot = await getDocs(q)
      
      const scams = []
      querySnapshot.forEach((doc) => {
        scams.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: scams }
    } catch (error) {
      console.error('Failed to get scam articles:', error)
      return { success: false, error: error.message }
    }
  }

  // Get single scam article
  async getScam(id) {
    try {
      const scamRef = doc(db, 'scams', id)
      const scamSnap = await getDoc(scamRef)
      
      if (scamSnap.exists()) {
        return { 
          success: true, 
          data: { id: scamSnap.id, ...scamSnap.data() } 
        }
      } else {
        return { success: false, error: 'Article does not exist' }
      }
    } catch (error) {
      console.error('Failed to get scam article:', error)
      return { success: false, error: error.message }
    }
  }

  // 创建诈骗文章
  async createScam(scamData) {
    try {
      const scamsRef = collection(db, 'scams')
      const docRef = await addDoc(scamsRef, {
        ...scamData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to create scam article:', error)
      return { success: false, error: error.message }
    }
  }

  // Update scam article
  async updateScam(id, updateData) {
    try {
      const scamRef = doc(db, 'scams', id)
      await updateDoc(scamRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to update scam article:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete scam article
  async deleteScam(id) {
    try {
      const scamRef = doc(db, 'scams', id)
      await deleteDoc(scamRef)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete scam article:', error)
      return { success: false, error: error.message }
    }
  }

  // 添加评论
  async addComment(scamId, commentData) {
    try {
      const commentsRef = collection(db, 'scams', scamId, 'comments')
      const docRef = await addDoc(commentsRef, {
        ...commentData,
        createdAt: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to add comment:', error)
      return { success: false, error: error.message }
    }
  }

  // 获取文章的评论
  async getScamComments(scamId) {
    try {
      const commentsRef = collection(db, 'scams', scamId, 'comments')
      const querySnapshot = await getDocs(commentsRef)
      
      const comments = []
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: comments }
    } catch (error) {
      console.error('Failed to get scam comments:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete comment
  async deleteComment(scamId, commentId) {
    try {
      const commentRef = doc(db, 'scams', scamId, 'comments', commentId)
      await deleteDoc(commentRef)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete comment:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user data
  async getUser(userId) {
    try {
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      
      if (userSnap.exists()) {
        return { 
          success: true, 
          data: { id: userSnap.id, ...userSnap.data() } 
        }
      } else {
        return { success: false, error: 'User does not exist' }
      }
    } catch (error) {
      console.error('Failed to get user data:', error)
      return { success: false, error: error.message }
    }
  }

  // 创建或更新用户
  async saveUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      }, { merge: true })
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save user data:', error)
      return { success: false, error: error.message }
    }
  }

  // Real-time data change listener
  subscribeToScams(callback) {
    const scamsRef = collection(db, 'scams')
    const q = query(scamsRef, orderBy('createdAt', 'asc'))
    
    return onSnapshot(q, (querySnapshot) => {
      const scams = []
      querySnapshot.forEach((doc) => {
        scams.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback({ success: true, data: scams })
    }, (error) => {
      console.error('Failed to listen to data changes:', error)
      callback({ success: false, error: error.message })
    })
  }

  // Search scam articles
  async searchScams(searchTerm) {
    try {
      const scamsRef = collection(db, 'scams')
      const q = query(
        scamsRef,
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        orderBy('title'),
        limit(20)
      )
      
      const querySnapshot = await getDocs(q)
      const scams = []
      querySnapshot.forEach((doc) => {
        scams.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: scams }
    } catch (error) {
      console.error('Failed to search scam articles:', error)
      return { success: false, error: error.message }
    }
  }

  // Get statistics
  async getStats() {
    try {
      const scamsRef = collection(db, 'scams')
      const querySnapshot = await getDocs(scamsRef)
      
      const stats = {
        totalScams: querySnapshot.size,
        totalComments: 0,
        recentActivity: []
      }
      
      // Calculate total comments and recent activity
      for (const doc of querySnapshot.docs) {
        const scamData = doc.data()
        if (scamData.comments) {
          stats.totalComments += scamData.comments.length
        }
        
        if (scamData.createdAt) {
          stats.recentActivity.push({
            id: doc.id,
            title: scamData.title,
            createdAt: scamData.createdAt
          })
        }
      }
      
      // Sort recent activity by time
      stats.recentActivity.sort((a, b) => b.createdAt - a.createdAt)
      stats.recentActivity = stats.recentActivity.slice(0, 10)
      
      return { success: true, data: stats }
    } catch (error) {
      console.error('Failed to get statistics:', error)
      return { success: false, error: error.message }
    }
  }

  // Doctor-related methods
  async getDoctors() {
    try {
      const doctorsRef = collection(db, 'doctors')
      const q = query(doctorsRef, orderBy('createdAt', 'asc'))
      const querySnapshot = await getDocs(q)
      
      const doctors = []
      querySnapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: doctors }
    } catch (error) {
      console.error('Failed to get doctors:', error)
      return { success: false, error: error.message }
    }
  }

  async createDoctor(doctorData) {
    try {
      const doctorsRef = collection(db, 'doctors')
      const docRef = await addDoc(doctorsRef, {
        ...doctorData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to create doctor:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteDoctor(doctorId) {
    try {
      const doctorRef = doc(db, 'doctors', doctorId)
      await deleteDoc(doctorRef)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete doctor:', error)
      return { success: false, error: error.message }
    }
  }

  async getDoctorRatings() {
    try {
      const ratingsRef = collection(db, 'doctorRatings')
      const querySnapshot = await getDocs(ratingsRef)
      
      const ratings = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (!ratings[data.doctorId]) {
          ratings[data.doctorId] = []
        }
        ratings[data.doctorId].push({
          user: data.user,
          score: data.score
        })
      })
      
      return { success: true, data: ratings }
    } catch (error) {
      console.error('Failed to get doctor ratings:', error)
      return { success: false, error: error.message }
    }
  }

  async saveDoctorRatings(ratings) {
    try {
      // Clear existing ratings
      const ratingsRef = collection(db, 'doctorRatings')
      const querySnapshot = await getDocs(ratingsRef)
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }
      
      // Save new ratings
      for (const doctorId in ratings) {
        for (const rating of ratings[doctorId]) {
          await addDoc(ratingsRef, {
            doctorId,
            user: rating.user,
            score: rating.score,
            createdAt: serverTimestamp()
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save doctor ratings:', error)
      return { success: false, error: error.message }
    }
  }

  async getDoctorComments() {
    try {
      const commentsRef = collection(db, 'doctorComments')
      const querySnapshot = await getDocs(commentsRef)
      
      const comments = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (!comments[data.doctorId]) {
          comments[data.doctorId] = []
        }
        comments[data.doctorId].push({
          user: data.user,
          text: data.text
        })
      })
      
      return { success: true, data: comments }
    } catch (error) {
      console.error('Failed to get doctor comments:', error)
      return { success: false, error: error.message }
    }
  }

  async saveDoctorComments(comments) {
    try {
      // Clear existing comments
      const commentsRef = collection(db, 'doctorComments')
      const querySnapshot = await getDocs(commentsRef)
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }
      
      // Save new comments
      for (const doctorId in comments) {
        for (const comment of comments[doctorId]) {
          await addDoc(commentsRef, {
            doctorId,
            user: comment.user,
            text: comment.text,
            createdAt: serverTimestamp()
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save doctor comments:', error)
      return { success: false, error: error.message }
    }
  }

  // Event-related methods
  async getEvents() {
    try {
      const eventsRef = collection(db, 'events')
      const querySnapshot = await getDocs(eventsRef)
      
      const events = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log('Raw Firestore data for event:', doc.id, data)
        
        // Ensure all required fields are present
        const event = {
          id: doc.id,
          title: data.title || 'Untitled Event',
          desc: data.desc || 'No description',
          date: data.date || 'No date',
          time: data.time || 'No time',
          creator: data.creator || 'Unknown',
          createdAt: data.createdAt || new Date(),
          updatedAt: data.updatedAt || new Date()
        }
        
        events.push(event)
      })
      
      console.log('Processed events:', events)
      
      // Sort by creation time (oldest first)
      events.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)
        return dateA - dateB
      })
      
      return { success: true, data: events }
    } catch (error) {
      console.error('Failed to get events:', error)
      return { success: false, error: error.message }
    }
  }

  async createEvent(eventData) {
    try {
      const eventsRef = collection(db, 'events')
      const now = new Date()
      
      // Ensure all required fields are present
      const eventToSave = {
        title: eventData.title || 'Untitled Event',
        desc: eventData.desc || 'No description',
        date: eventData.date || 'No date',
        time: eventData.time || 'No time',
        creator: eventData.creator || 'Unknown',
        createdAt: now,
        updatedAt: now
      }
      
      console.log('Saving event to Firestore:', eventToSave)
      
      const docRef = await addDoc(eventsRef, eventToSave)
      
      console.log('Event saved with ID:', docRef.id)
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to create event:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteEvent(eventId) {
    try {
      const eventRef = doc(db, 'events', eventId)
      await deleteDoc(eventRef)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete event:', error)
      return { success: false, error: error.message }
    }
  }

  async getEventRatings() {
    try {
      const ratingsRef = collection(db, 'eventRatings')
      const querySnapshot = await getDocs(ratingsRef)
      
      const ratings = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (!ratings[data.eventId]) {
          ratings[data.eventId] = []
        }
        ratings[data.eventId].push({
          user: data.user,
          score: data.score
        })
      })
      
      return { success: true, data: ratings }
    } catch (error) {
      console.error('Failed to get event ratings:', error)
      return { success: false, error: error.message }
    }
  }

  async saveEventRatings(ratings) {
    try {
      // Clear existing ratings
      const ratingsRef = collection(db, 'eventRatings')
      const querySnapshot = await getDocs(ratingsRef)
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }
      
      // Save new ratings
      for (const eventId in ratings) {
        for (const rating of ratings[eventId]) {
          await addDoc(ratingsRef, {
            eventId,
            user: rating.user,
            score: rating.score,
            createdAt: serverTimestamp()
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save event ratings:', error)
      return { success: false, error: error.message }
    }
  }

  async getEventComments() {
    try {
      const commentsRef = collection(db, 'eventComments')
      const querySnapshot = await getDocs(commentsRef)
      
      const comments = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (!comments[data.eventId]) {
          comments[data.eventId] = []
        }
        comments[data.eventId].push({
          user: data.user,
          text: data.text
        })
      })
      
      return { success: true, data: comments }
    } catch (error) {
      console.error('Failed to get event comments:', error)
      return { success: false, error: error.message }
    }
  }

  async saveEventComments(comments) {
    try {
      // Clear existing comments
      const commentsRef = collection(db, 'eventComments')
      const querySnapshot = await getDocs(commentsRef)
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }
      
      // Save new comments
      for (const eventId in comments) {
        for (const comment of comments[eventId]) {
          await addDoc(commentsRef, {
            eventId,
            user: comment.user,
            text: comment.text,
            createdAt: serverTimestamp()
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save event comments:', error)
      return { success: false, error: error.message }
    }
  }

  // Volunteer-related methods
  async getVolunteers() {
    try {
      const volunteersRef = collection(db, 'volunteers')
      const q = query(volunteersRef, orderBy('createdAt', 'asc'))
      const querySnapshot = await getDocs(q)
      
      const volunteers = []
      querySnapshot.forEach((doc) => {
        volunteers.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: volunteers }
    } catch (error) {
      console.error('Failed to get volunteers:', error)
      return { success: false, error: error.message }
    }
  }

  async createVolunteer(volunteerData) {
    try {
      const volunteersRef = collection(db, 'volunteers')
      const docRef = await addDoc(volunteersRef, {
        ...volunteerData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to create volunteer:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteVolunteer(volunteerId) {
    try {
      const volunteerRef = doc(db, 'volunteers', volunteerId)
      await deleteDoc(volunteerRef)
      
      return { success: true }
    } catch (error) {
      console.error('Failed to delete volunteer:', error)
      return { success: false, error: error.message }
    }
  }

  async getVolunteerRatings() {
    try {
      const ratingsRef = collection(db, 'volunteerRatings')
      const querySnapshot = await getDocs(ratingsRef)
      
      const ratings = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (!ratings[data.volunteerId]) {
          ratings[data.volunteerId] = []
        }
        ratings[data.volunteerId].push({
          user: data.user,
          score: data.score
        })
      })
      
      return { success: true, data: ratings }
    } catch (error) {
      console.error('Failed to get volunteer ratings:', error)
      return { success: false, error: error.message }
    }
  }

  async saveVolunteerRatings(ratings) {
    try {
      // Clear existing ratings
      const ratingsRef = collection(db, 'volunteerRatings')
      const querySnapshot = await getDocs(ratingsRef)
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }
      
      // Save new ratings
      for (const volunteerId in ratings) {
        for (const rating of ratings[volunteerId]) {
          await addDoc(ratingsRef, {
            volunteerId,
            user: rating.user,
            score: rating.score,
            createdAt: serverTimestamp()
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save volunteer ratings:', error)
      return { success: false, error: error.message }
    }
  }

  async getVolunteerComments() {
    try {
      const commentsRef = collection(db, 'volunteerComments')
      const querySnapshot = await getDocs(commentsRef)
      
      const comments = {}
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (!comments[data.volunteerId]) {
          comments[data.volunteerId] = []
        }
        comments[data.volunteerId].push({
          user: data.user,
          text: data.text
        })
      })
      
      return { success: true, data: comments }
    } catch (error) {
      console.error('Failed to get volunteer comments:', error)
      return { success: false, error: error.message }
    }
  }

  async saveVolunteerComments(comments) {
    try {
      // Clear existing comments
      const commentsRef = collection(db, 'volunteerComments')
      const querySnapshot = await getDocs(commentsRef)
      for (const doc of querySnapshot.docs) {
        await deleteDoc(doc.ref)
      }
      
      // Save new comments
      for (const volunteerId in comments) {
        for (const comment of comments[volunteerId]) {
          await addDoc(commentsRef, {
            volunteerId,
            user: comment.user,
            text: comment.text,
            createdAt: serverTimestamp()
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('Failed to save volunteer comments:', error)
      return { success: false, error: error.message }
    }
  }

  // Individual comment management methods
  async addDoctorComment(doctorId, comment) {
    try {
      const commentsRef = collection(db, 'doctors', doctorId, 'comments')
      const docRef = await addDoc(commentsRef, {
        ...comment,
        createdAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to add doctor comment:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteDoctorComment(doctorId, commentId) {
    try {
      const commentRef = doc(db, 'doctors', doctorId, 'comments', commentId)
      await deleteDoc(commentRef)
      return { success: true }
    } catch (error) {
      console.error('Failed to delete doctor comment:', error)
      return { success: false, error: error.message }
    }
  }

  async getDoctorCommentsFromSubcollection(doctorId) {
    try {
      const commentsRef = collection(db, 'doctors', doctorId, 'comments')
      const querySnapshot = await getDocs(commentsRef)
      
      const comments = []
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: comments }
    } catch (error) {
      console.error('Failed to get doctor comments from subcollection:', error)
      return { success: false, error: error.message }
    }
  }

  async addEventComment(eventId, comment) {
    try {
      const commentsRef = collection(db, 'events', eventId, 'comments')
      const docRef = await addDoc(commentsRef, {
        ...comment,
        createdAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to add event comment:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteEventComment(eventId, commentId) {
    try {
      const commentRef = doc(db, 'events', eventId, 'comments', commentId)
      await deleteDoc(commentRef)
      return { success: true }
    } catch (error) {
      console.error('Failed to delete event comment:', error)
      return { success: false, error: error.message }
    }
  }

  async getEventCommentsFromSubcollection(eventId) {
    try {
      const commentsRef = collection(db, 'events', eventId, 'comments')
      const querySnapshot = await getDocs(commentsRef)
      
      const comments = []
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: comments }
    } catch (error) {
      console.error('Failed to get event comments from subcollection:', error)
      return { success: false, error: error.message }
    }
  }

  async addVolunteerComment(volunteerId, comment) {
    try {
      const commentsRef = collection(db, 'volunteers', volunteerId, 'comments')
      const docRef = await addDoc(commentsRef, {
        ...comment,
        createdAt: serverTimestamp()
      })
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Failed to add volunteer comment:', error)
      return { success: false, error: error.message }
    }
  }

  async deleteVolunteerComment(volunteerId, commentId) {
    try {
      const volunteerRef = doc(db, 'volunteers', volunteerId, 'comments', commentId)
      await deleteDoc(volunteerRef)
      return { success: true }
    } catch (error) {
      console.error('Failed to delete volunteer comment:', error)
      return { success: false, error: error.message }
    }
  }

  async getVolunteerCommentsFromSubcollection(volunteerId) {
    try {
      const commentsRef = collection(db, 'volunteers', volunteerId, 'comments')
      const querySnapshot = await getDocs(commentsRef)
      
      const comments = []
      querySnapshot.forEach((doc) => {
        comments.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      return { success: true, data: comments }
    } catch (error) {
      console.error('Failed to get volunteer comments from subcollection:', error)
      return { success: false, error: error.message }
    }
  }
}

export default new FirestoreService() 