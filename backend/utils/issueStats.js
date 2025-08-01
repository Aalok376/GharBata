import Booking from '../models/modelBooking.js'

export async function getIssuesStatistics() {
  try {
    const stats = await Booking.aggregate([
      { $unwind: '$issues' },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$issues.status', 'pending'] }, 1, 0] }
          },
          under_review: {
            $sum: { $cond: [{ $eq: ['$issues.status', 'under_review'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$issues.status', 'resolved'] }, 1, 0] }
          },
          dismissed: {
            $sum: { $cond: [{ $eq: ['$issues.status', 'dismissed'] }, 1, 0] }
          },
          urgent: {
            $sum: { $cond: [{ $eq: ['$issues.severity', 'urgent'] }, 1, 0] }
          },
          high: {
            $sum: { $cond: [{ $eq: ['$issues.severity', 'high'] }, 1, 0] }
          },
          medium: {
            $sum: { $cond: [{ $eq: ['$issues.severity', 'medium'] }, 1, 0] }
          },
          low: {
            $sum: { $cond: [{ $eq: ['$issues.severity', 'low'] }, 1, 0] }
          }
        }
      }
    ])

    return stats[0] || {
      total: 0, pending: 0, under_review: 0, resolved: 0, dismissed: 0,
      urgent: 0, high: 0, medium: 0, low: 0
    }
  } catch (error) {
    console.error('Error getting issues statistics:', error)
    return {
      total: 0, pending: 0, under_review: 0, resolved: 0, dismissed: 0,
      urgent: 0, high: 0, medium: 0, low: 0
    }
  }
}
