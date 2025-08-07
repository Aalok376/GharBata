import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Users,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Search,
  Filter,
  Ban,
  ShieldOff,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserX,
  FileText,
  BarChart3,
  Star,
  MapPin,
  Mail,
  Phone,
  Settings,
  RefreshCw,
  Download,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Shield,
  Gavel,
  X,
  Send
} from 'lucide-react'

// Move constants outside component to prevent recreation
const API_BASE_URL = 'http://localhost:5000/api'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  under_review: 'bg-orange-100 text-orange-800',
  resolved: 'bg-green-100 text-green-800',
  dismissed: 'bg-gray-100 text-gray-800'
}

const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
}

const BUTTON_VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
  success: 'bg-green-600 text-white hover:bg-green-700',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
  orange: 'bg-orange-600 text-white hover:bg-orange-700'
}

const BUTTON_SIZES = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg'
}

const TAB_CONFIG = [
  { id: 'overview', name: 'Overview', icon: BarChart3 },
  { id: 'bookings', name: 'Bookings', icon: Calendar },
  { id: 'issues', name: 'Issues', icon: AlertTriangle },
  { id: 'technicians', name: 'Technicians', icon: Users }
]

// Optimized utility functions (moved outside component)
const getStatusColor = (status) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
const getSeverityColor = (severity) => SEVERITY_COLORS[severity] || 'bg-gray-100 text-gray-800'
const formatIssueType = (issueType) => issueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

// Optimized components with proper memoization
const Modal = React.memo(({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-xl p-6 w-full ${maxWidth} mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
})

const Button = React.memo(({
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className = '',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variantClass = BUTTON_VARIANTS[variant]
  const sizeClass = BUTTON_SIZES[size]

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${className}`}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  )
})

const StatusBadge = React.memo(({ status, type = 'status' }) => {
  const colorClass = type === 'severity' ? getSeverityColor(status) : getStatusColor(status)
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
      {status}
    </span>
  )
})

const Table = React.memo(({ headers, children, title }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    {title && (
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  </div>
))

const FilterSection = React.memo(({ children }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex flex-wrap gap-4">
      {children}
    </div>
  </div>
))

const StatCard = React.memo(({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-lg`}>
        <Icon className={`h-6 w-6 text-${color}-600`} />
      </div>
    </div>
  </div>
))

// Optimized textarea components
const UnbanReasonTextarea = React.memo(({ value, onChange }) => (
  <textarea
    id="unban-reason"
    name="unban-reason"
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    rows="3"
    placeholder="Enter the reason for unbanning this technician..."
    required
  />
))

const AdminNotesTextarea = React.memo(({ value, onChange }) => (
  <textarea
    id="admin-notes"
    name="admin-notes"
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    rows="3"
    placeholder="Add notes about your decision..."
  />
))

const TechnicianActionReasonTextarea = React.memo(({ value, onChange }) => (
  <textarea
    id="technician-action-reason"
    name="technician-action-reason"
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    rows="3"
    placeholder="Enter the reason for this action..."
    required
  />
))

const WarningMessageTextarea = React.memo(({ value, onChange }) => (
  <textarea
    id="warning-message"
    name="warning-message"
    value={value}
    onChange={onChange}
    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    rows="3"
    placeholder="Enter warning message for the technician..."
  />
))

const ContactMessageTextarea = React.memo(({ value, onChange, placeholder, onEnter }) => {
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && value.trim()) {
      onEnter?.()
    }
  }, [value, onEnter])

  return (
    <textarea
      id="contact-message"
      name="contact-message"
      value={value}
      onChange={onChange}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      rows="4"
    />
  )
})

const AdminDashboard = () => {
  // Consolidated state management
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)

  // Data states
  const [stats, setStats] = useState({
    total_bookings: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    total_revenue: 0,
    avg_rating: 0,
    total_issues: 0,
    pending_issues: 0,
    total_banned: 0
  })

  const [bookings, setBookings] = useState([])
  const [issues, setIssues] = useState([])
  const [bannedTechnicians, setBannedTechnicians] = useState([])

  // Selection states
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [selectedTechnician, setSelectedTechnician] = useState(null)

  // Form state with useRef to avoid recreation
  const formDataRef = useRef({
    unbanReason: '',
    issueNotes: '',
    selectedIssueAction: '',
    issueActionStatus: '', // NEW: Track the actual status to be set
    technicianAction: '',
    technicianActionReason: '',
    warningMessage: '',
    suspensionDays: '3',
    tempBanDays: '7',
    contactType: '',
    contactEmail: '', // NEW: Store the email address
    message: ''
  })

  // Modal states with useRef
  const modalsRef = useRef({
    unban: false,
    issue: false,
    booking: false,
    technicianView: false,
    contact: false
  })

  // Filters with useRef
  const filtersRef = useRef({
    status: 'all',
    severity: 'all',
    issue_type: 'all',
    date_from: '',
    date_to: '',
    search: ''
  })

  // Force re-render trigger (only when needed)
  const [, forceRender] = useState({})
  const triggerRerender = useCallback(() => forceRender({}), [])

  // Stable references to current values
  const formData = formDataRef.current
  const modals = modalsRef.current
  const filters = filtersRef.current

  // Optimized form handlers
  const updateFormData = useCallback((updates) => {
    Object.assign(formDataRef.current, updates)
    triggerRerender()
  }, [triggerRerender])

  const openModal = useCallback((modalName) => {
    modalsRef.current[modalName] = true
    triggerRerender()
  }, [triggerRerender])

  const closeModal = useCallback((modalName) => {
    modalsRef.current[modalName] = false

    // Reset modal-specific form data
    if (modalName === 'unban') {
      formDataRef.current.unbanReason = ''
    }
    if (modalName === 'issue') {
      Object.assign(formDataRef.current, {
        issueNotes: '',
        selectedIssueAction: '',
        issueActionStatus: '', // Reset this too
        technicianAction: '',
        technicianActionReason: '',
        warningMessage: '',
        suspensionDays: '3',
        tempBanDays: '7'
      })
    }
    if (modalName === 'contact') {
      Object.assign(formDataRef.current, {
        contactType: '',
        contactEmail: '',
        message: ''
      })
    }
    triggerRerender()
  }, [triggerRerender])

  // Optimized filter handlers
  const updateFilter = useCallback((key, value) => {
    filtersRef.current[key] = value
    triggerRerender()
  }, [triggerRerender])

  const handleSearchChange = useCallback((e) => updateFilter('search', e.target.value), [updateFilter])
  const handleStatusChange = useCallback((e) => updateFilter('status', e.target.value), [updateFilter])
  const handleSeverityChange = useCallback((e) => updateFilter('severity', e.target.value), [updateFilter])
  const handleIssueTypeChange = useCallback((e) => updateFilter('issue_type', e.target.value), [updateFilter])
  const handleDateFromChange = useCallback((e) => updateFilter('date_from', e.target.value), [updateFilter])
  const handleDateToChange = useCallback((e) => updateFilter('date_to', e.target.value), [updateFilter])

  // Optimized change handlers
  const handleChange = useCallback((field) => (e) => {
    updateFormData({ [field]: e.target.value })
  }, [updateFormData])

  // API Functions - memoized with useCallback
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/stats/overview`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      if (data.stats) {
        const statsData = data.stats
        setStats({
          total_bookings: statsData.total_bookings || 0,
          pending: statsData.pending || 0,
          confirmed: statsData.confirmed || 0,
          completed: statsData.completed || 0,
          cancelled: statsData.cancelled || 0,
          total_revenue: statsData.total_revenue || 0,
          avg_rating: statsData.avg_rating || 0,
          total_issues: statsData.total_issues || 0,
          pending_issues: statsData.issue_breakdown?.pending_issues || 0,
          total_banned: 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  const fetchSpecificStats = useCallback(async (technicianId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/stats/overview?technician_id=${technicianId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        const fetchedStats = data.stats || {}

        setSelectedTechnician(prevTechnician => ({
          ...prevTechnician,
          rating: fetchedStats.avg_rating || prevTechnician?.rating || 0,
          total_bookings: fetchedStats.total_bookings || prevTechnician?.total_bookings || 0,
          completed_bookings: fetchedStats.completed || prevTechnician?.completed_bookings || 0,
          issues_count: fetchedStats.total_issues || prevTechnician?.issues_count || 0
        }))
      } else {
        console.error('Failed to fetch stats')
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      params.append('limit', '50')

      const response = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setBookings(data.bookings || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }, [filters.status, filters.date_from, filters.date_to])

  const fetchIssues = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filters.status !== 'all') params.append('status', filters.status)
      if (filters.severity !== 'all') params.append('severity', filters.severity)
      if (filters.issue_type !== 'all') params.append('issue_type', filters.issue_type)
      if (filters.date_from) params.append('date_from', filters.date_from)
      if (filters.date_to) params.append('date_to', filters.date_to)
      params.append('limit', '50')

      const response = await fetch(`${API_BASE_URL}/bookings/issues/all?${params.toString()}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setIssues(data.issues || [])
    } catch (error) {
      console.error('Error fetching issues:', error)
    }
  }, [filters.status, filters.severity, filters.issue_type, filters.date_from, filters.date_to])

  const fetchBannedTechnicians = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/technicians/banned`, {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      setBannedTechnicians(data.banned_technicians || [])

      setStats(prev => ({
        ...prev,
        total_banned: data.stats?.total_banned || data.banned_technicians?.length || 0
      }))
    } catch (error) {
      console.error('Error fetching banned technicians:', error)
    }
  }, [])

  // Handler functions
  const handleUnbanTechnician = useCallback(async () => {
    if (!formData.unbanReason.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/technicians/${selectedTechnician._id}/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: formData.unbanReason })
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      await fetchBannedTechnicians()
      closeModal('unban')
      alert('Technician unbanned successfully')
    } catch (error) {
      console.error('Error unbanning technician:', error)
      alert('Failed to unban technician. Please try again.')
    }
    setLoading(false)
  }, [formData.unbanReason, selectedTechnician?._id, closeModal, fetchBannedTechnicians])

  // FIXED: Issue action handler now uses the correct status
  const handleIssueAction = useCallback(async () => {
    if (!formData.issueActionStatus) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${selectedIssue.booking._id}/issues/${selectedIssue.issue._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: formData.issueActionStatus, // Use the correct status
          admin_notes: formData.issueNotes
        })
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      await fetchIssues()
      await fetchStats()
      closeModal('issue')
      alert(`Issue ${formData.issueActionStatus} successfully`)
    } catch (error) {
      console.error('Error updating issue:', error)
      alert('Failed to update issue. Please try again.')
    }
    setLoading(false)
  }, [formData.issueActionStatus, formData.issueNotes, selectedIssue, closeModal, fetchIssues, fetchStats])

  const handleTechnicianAction = useCallback(async () => {
    if (!formData.technicianAction || !formData.technicianActionReason.trim()) return

    setLoading(true)
    try {
      const technicianId = selectedIssue.booking.technician_id._id

      let endpoint = ''
      let payload = {}

      switch (formData.technicianAction) {
        case 'warning':
          endpoint = `/admin/technicians/${technicianId}/warn`
          payload = {
            reason: formData.technicianActionReason,
            warning_message: formData.warningMessage,
            issue_id: selectedIssue.issue._id,
            booking_id: selectedIssue.booking._id
          }
          break
        case 'temporary_ban':
          endpoint = `/admin/technicians/${technicianId}/ban`
          payload = {
            reason: formData.technicianActionReason,
            severity: 'temporary',
            ban_duration_days: parseInt(formData.tempBanDays),
            issue_id: selectedIssue.issue._id,
            booking_id: selectedIssue.booking._id
          }
          break
        case 'permanent_ban':
          endpoint = `/admin/technicians/${technicianId}/ban`
          payload = {
            reason: formData.technicianActionReason,
            severity: 'permanent',
            issue_id: selectedIssue.issue._id,
            booking_id: selectedIssue.booking._id
          }
          break
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      // Update the issue status to resolved
      await fetch(`${API_BASE_URL}/bookings/${selectedIssue.booking._id}/issues/${selectedIssue.issue._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          status: 'resolved',
          admin_notes: `Action taken against technician: ${formData.technicianAction} - ${formData.technicianActionReason}`
        })
      })

      await fetchIssues()
      await fetchStats()
      await fetchBannedTechnicians()
      closeModal('issue')
      alert(`Technician action (${formData.technicianAction}) applied successfully`)
    } catch (error) {
      console.error('Error applying technician action:', error)
      alert('Failed to apply technician action. Please try again.')
    }
    setLoading(false)
  }, [formData.technicianAction, formData.technicianActionReason, formData.warningMessage, formData.tempBanDays, selectedIssue, closeModal, fetchIssues, fetchStats, fetchBannedTechnicians])

  // FIXED: Updated handleContactClick to store both type and email
  const handleContactClick = useCallback((type, email) => {
    updateFormData({ 
      contactType: type, 
      contactEmail: email,
      message: '' 
    })
    openModal('contact')
  }, [updateFormData, openModal])

  // FIXED: Updated handleSendMessage to call the API
  const handleSendMessage = useCallback(async () => {
    if (!formData.message.trim()) {
      alert('Please enter a message before sending.')
      return
    }

    if (!formData.contactEmail) {
      alert('No email address available.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/admin/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: formData.message,
          email: formData.contactEmail
        })
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()
      
      if (data.success) {
        alert(`Message sent successfully to ${formData.contactType}!`)
        closeModal('contact')
      } else {
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
    setLoading(false)
  }, [formData.message, formData.contactEmail, formData.contactType, closeModal])

  // Memoized filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return booking.service.toLowerCase().includes(searchTerm) ||
          `${booking.fname} ${booking.lname}`.toLowerCase().includes(searchTerm)
      }
      return true
    })
  }, [bookings, filters.search])

  // Memoized handlers for buttons to prevent recreations
  const handleRefresh = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetchStats(),
      fetchBookings(),
      fetchIssues(),
      fetchBannedTechnicians()
    ]).finally(() => setLoading(false))
  }, [fetchStats, fetchBookings, fetchIssues, fetchBannedTechnicians])

  // Tab components as separate memoized components to prevent unnecessary re-renders
  const OverviewTab = useMemo(() => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          title="Total Bookings"
          value={stats.total_bookings.toLocaleString()}
          subtitle="All time"
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="Revenue"
          value={`Rs.${stats.total_revenue.toLocaleString()}`}
          subtitle="Completed bookings"
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          title="Active Issues"
          value={stats.pending_issues}
          subtitle={`${stats.total_issues} total issues`}
          color="red"
        />
        <StatCard
          icon={UserX}
          title="Banned Technicians"
          value={stats.total_banned}
          subtitle="Currently banned"
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Status Distribution</h3>
          <div className="space-y-3">
            {[
              { status: 'Completed', count: stats.completed, color: 'green' },
              { status: 'Confirmed', count: stats.confirmed, color: 'blue' },
              { status: 'Cancelled', count: stats.cancelled, color: 'red' },
              { status: 'Pending', count: stats.pending, color: 'yellow' }
            ].map(({ status, count, color }) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{status}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 bg-${color}-500 rounded-full`}></div>
                  <span className="text-sm font-semibold">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('issues')}
              className="w-full flex items-center justify-between p-3 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-700">Review Pending Issues</span>
              </div>
              <span className="bg-red-200 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                {stats.pending_issues}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('technicians')}
              className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Ban className="h-5 w-5 text-orange-600" />
                <span className="font-medium text-orange-700">Manage Banned Technicians</span>
              </div>
              <span className="bg-orange-200 text-orange-800 px-2 py-1 rounded-full text-xs font-semibold">
                {stats.total_banned}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  ), [stats, setActiveTab])

  const BookingsTab = useMemo(() => (
    <div className="space-y-6">
      <FilterSection>
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              id="booking-search"
              name="booking-search"
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <select
          id="booking-status-filter"
          name="booking-status-filter"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={handleStatusChange}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          id="booking-date-from"
          name="booking-date-from"
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.date_from}
          onChange={handleDateFromChange}
        />
        <input
          id="booking-date-to"
          name="booking-date-to"
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.date_to}
          onChange={handleDateToChange}
        />
      </FilterSection>

      <Table
        title="All Bookings"
        headers={['Service', 'Customer', 'Technician', 'Date', 'Status', 'Price', 'Issues', 'Actions']}
      >
        {filteredBookings.map((booking) => (
          <BookingRow
            key={booking._id}
            booking={booking}
            onViewDetails={setSelectedBooking}
            onOpenModal={openModal}
          />
        ))}
      </Table>
    </div>
  ), [filters, filteredBookings, handleSearchChange, handleStatusChange, handleDateFromChange, handleDateToChange, openModal])

  const IssuesTab = useMemo(() => (
    <div className="space-y-6">
      <FilterSection>
        <select
          id="issue-status-filter"
          name="issue-status-filter"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={handleStatusChange}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select
          id="issue-severity-filter"
          name="issue-severity-filter"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.severity}
          onChange={handleSeverityChange}
        >
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          id="issue-type-filter"
          name="issue-type-filter"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.issue_type}
          onChange={handleIssueTypeChange}
        >
          <option value="all">All Types</option>
          <option value="technician_cancelled_after_acceptance">Cancelled After Acceptance</option>
          <option value="last_minute_cancellation">Last Minute Cancellation</option>
          <option value="unprofessional_behavior">Unprofessional Behavior</option>
          <option value="no_show">No Show</option>
          <option value="poor_communication">Poor Communication</option>
          <option value="other">Other</option>
        </select>
      </FilterSection>

      <div className="space-y-4">
        {issues.map((item) => (
          <IssueCard
            key={item.issue._id}
            item={item}
            onViewDetails={setSelectedIssue}
            onOpenModal={openModal}
          />
        ))}
      </div>
    </div>
  ), [filters, issues, handleStatusChange, handleSeverityChange, handleIssueTypeChange, openModal])

  const TechniciansTab = useMemo(() => (
    <div className="space-y-6">
      <Table
        title="Banned Technicians"
        headers={['Technician', 'Ban Reason', 'Banned Date', 'Severity', 'End Date', 'Actions']}
      >
        {bannedTechnicians.map((technician) => (
          <TechnicianRow
            key={technician._id}
            technician={technician}
            onViewDetails={setSelectedTechnician}
            onOpenModal={openModal}
            onFetchStats={fetchSpecificStats}
          />
        ))}
        {bannedTechnicians.length === 0 && (
          <tr>
            <td colSpan="6" className="text-center py-8 text-gray-500">
              No banned technicians found.
            </td>
          </tr>
        )}
      </Table>
    </div>
  ), [bannedTechnicians, openModal, fetchSpecificStats])

  // Effects
  useEffect(() => {
    fetchStats()
    fetchBookings()
    fetchIssues()
    fetchBannedTechnicians()
  }, [fetchStats, fetchBookings, fetchIssues, fetchBannedTechnicians])

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings()
    } else if (activeTab === 'issues') {
      fetchIssues()
    }
  }, [filters, activeTab, fetchBookings, fetchIssues])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && OverviewTab}
        {activeTab === 'bookings' && BookingsTab}
        {activeTab === 'issues' && IssuesTab}
        {activeTab === 'technicians' && TechniciansTab}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <RefreshCw className="h-6 w-6 text-blue-600 animate-spin" />
            <span className="text-lg font-medium">Loading...</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <UnbanModal
        isOpen={modals.unban}
        onClose={() => closeModal('unban')}
        selectedTechnician={selectedTechnician}
        formData={formData}
        onChange={handleChange}
        onSubmit={handleUnbanTechnician}
        loading={loading}
      />

      <TechnicianViewModal
        isOpen={modals.technicianView}
        onClose={() => closeModal('technicianView')}
        selectedTechnician={selectedTechnician}
        onUnban={() => {
          closeModal('technicianView')
          openModal('unban')
        }}
        onContact={handleContactClick}
      />

      <IssueModal
        isOpen={modals.issue}
        onClose={() => closeModal('issue')}
        selectedIssue={selectedIssue}
        formData={formData}
        onChange={handleChange}
        updateFormData={updateFormData}
        onIssueAction={handleIssueAction}
        onTechnicianAction={handleTechnicianAction}
        loading={loading}
      />

      <BookingModal
        isOpen={modals.booking}
        onClose={() => closeModal('booking')}
        selectedBooking={selectedBooking}
        onContact={handleContactClick}
        onViewIssues={() => {
          setActiveTab('issues')
          closeModal('booking')
        }}
      />

      <ContactModal
        isOpen={modals.contact}
        onClose={() => closeModal('contact')}
        formData={formData}
        onChange={handleChange}
        onSend={handleSendMessage}
        loading={loading}
      />
    </div>
  )
}

// Separate row components to prevent unnecessary re-renders
const BookingRow = React.memo(({ booking, onViewDetails, onOpenModal }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">{booking.service}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {`${booking.fname} ${booking.lname}`}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{booking.technician_id?.user?.fname} {booking.technician_id?.user?.lname}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">{new Date(booking.scheduled_date).toLocaleDateString()}</div>
      <div className="text-sm text-gray-500">{booking.scheduled_StartTime}-{booking.scheduled_EndTime}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <StatusBadge status={booking.booking_status} />
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm font-medium text-gray-900">Rs.{booking.final_price}</div>
      {booking.rating && (
        <div className="flex items-center">
          <Star className="h-4 w-4 text-yellow-400 fill-current" />
          <span className="text-sm text-gray-600 ml-1">{booking.rating}</span>
        </div>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {booking.issues?.length > 0 ? (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
          {booking.issues.length} issue(s)
        </span>
      ) : (
        <span className="text-gray-400 text-sm">None</span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button
        onClick={() => {
          onViewDetails(booking)
          onOpenModal('booking')
        }}
        className="text-blue-600 hover:text-blue-900"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </td>
  </tr>
))

// FIXED: IssueCard now shows action button for pending and under_review issues
const IssueCard = React.memo(({ item, onViewDetails, onOpenModal }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <StatusBadge status={item.issue.severity} type="severity" />
          <StatusBadge status={item.issue.status} />
          <span className="text-sm text-gray-500">
            {new Date(item.issue.reported_at).toLocaleDateString()}
          </span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {formatIssueType(item.issue.issue_type)}
        </h4>
        <p className="text-gray-700 mb-3">{item.issue.issue_description}</p>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Booking: {item.booking.service}</span>
          <span>Technician: {item.booking.technician_id?.user?.fname} {item.booking.technician_id?.user?.lname}</span>
          <span>Reported by: {item.issue.reported_by?.fname} {item.issue.reported_by?.lname}</span>
        </div>
      </div>
      <div className="flex space-x-2">
        {/* Show action button for pending and under_review issues */}
        {(item.issue.status === 'pending' || item.issue.status === 'under_review') && (
          <button
            onClick={() => {
              onViewDetails(item)
              onOpenModal('issue')
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="View Details & Take Action"
          >
            <Gavel className="h-4 w-4" />
          </button>
        )}
        {/* Always show view button for resolved/dismissed issues */}
        {(item.issue.status === 'resolved' || item.issue.status === 'dismissed') && (
          <button
            onClick={() => {
              onViewDetails(item)
              onOpenModal('issue')
            }}
            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  </div>
))

const TechnicianRow = React.memo(({ technician, onViewDetails, onOpenModal, onFetchStats }) => (
  <tr className="hover:bg-gray-50">
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="flex items-center">
        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
          <Users className="h-5 w-5 text-gray-600" />
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-gray-900">{technician.user.fname} {technician.user.lname}</div>
          <div className="text-sm text-gray-500">{technician.user.username}</div>
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="text-sm text-gray-900 max-w-xs truncate">{technician.ban_reason}</div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {new Date(technician.banned_at).toLocaleDateString()}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${technician.ban_severity === 'permanent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
        {technician.ban_severity}
      </span>
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      <div className="text-sm text-gray-900">
        {technician.ban_end_date ? new Date(technician.ban_end_date).toLocaleDateString() : 'N/A'}
      </div>
    </td>
    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
      <button
        onClick={() => {
          onViewDetails(technician)
          onOpenModal('unban')
        }}
        className="text-green-600 hover:text-green-900 mr-3"
        title="Unban Technician"
      >
        <ShieldOff className="h-4 w-4" />
      </button>
      <button
        onClick={async () => {
          onViewDetails(technician)
          await onFetchStats(technician._id)
          onOpenModal('technicianView')
        }}
        className="text-blue-600 hover:text-blue-900"
        title="View Details"
      >
        <Eye className="h-4 w-4" />
      </button>
    </td>
  </tr>
))

// Separate modal components
const UnbanModal = React.memo(({ isOpen, onClose, selectedTechnician, formData, onChange, onSubmit, loading }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Unban Technician"
    maxWidth="max-w-md"
  >
    {selectedTechnician && (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="font-medium">{selectedTechnician.user?.fname} {selectedTechnician.user?.lname}</p>
        <p className="text-sm text-gray-600">{selectedTechnician.user?.username}</p>
        <p className="text-sm text-red-600 mt-1">Banned: {selectedTechnician.ban_reason}</p>
      </div>
    )}
    <div className="space-y-4">
      <div>
        <label htmlFor="unban-reason" className="block text-sm font-medium text-gray-700 mb-1">Unban Reason *</label>
        <UnbanReasonTextarea
          value={formData.unbanReason}
          onChange={onChange('unbanReason')}
        />
      </div>
    </div>
    <div className="flex space-x-3 mt-6">
      <Button variant="secondary" onClick={onClose} className="flex-1">
        Cancel
      </Button>
      <Button
        variant="success"
        onClick={onSubmit}
        disabled={!formData.unbanReason.trim()}
        loading={loading}
        className="flex-1"
      >
        Unban Technician
      </Button>
    </div>
  </Modal>
))

const TechnicianViewModal = React.memo(({ isOpen, onClose, selectedTechnician, onUnban, onContact }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Technician Details"
    maxWidth="max-w-4xl"
  >
    {selectedTechnician && (
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="h-8 w-8 text-gray-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{selectedTechnician.user.fname} {selectedTechnician.user.lname}</h3>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <span className="text-sm text-gray-600">Email:</span>
                  <p className="font-medium">{selectedTechnician.user.username}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{selectedTechnician.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Total Bookings</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 mt-1">{selectedTechnician.total_bookings || 0}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-900 mt-1">{selectedTechnician.completed_bookings || 0}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-800">Issues</span>
            </div>
            <p className="text-2xl font-bold text-red-900 mt-1">{selectedTechnician.issues_count || 0}</p>
          </div>
        </div>

        {/* Ban Information */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
            <Ban className="h-5 w-5 mr-2" />
            Ban Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-red-800">Ban Reason:</span>
              <p className="text-red-700 mt-1">{selectedTechnician.ban_reason}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-red-800">Ban Severity:</span>
              <p className="text-red-700 mt-1 capitalize">{selectedTechnician.ban_severity}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-red-800">Banned Date:</span>
              <p className="text-red-700 mt-1">{new Date(selectedTechnician.banned_at).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-red-800">End Date:</span>
              <p className="text-red-700 mt-1">
                {selectedTechnician.ban_end_date
                  ? new Date(selectedTechnician.ban_end_date).toLocaleDateString()
                  : 'Permanent'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            variant="success"
            onClick={onUnban}
            className="flex items-center"
          >
            <ShieldOff className="h-4 w-4 mr-2" />
            Unban Technician
          </Button>
          <Button
            variant="secondary"
            onClick={() => onContact('Technician', selectedTechnician.user?.username)}
            className="flex items-center"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Technician
          </Button>
        </div>
      </div>
    )}

    <div className="flex justify-end mt-6">
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
    </div>
  </Modal>
))

// FIXED: IssueModal with proper status handling
const IssueModal = React.memo(({ isOpen, onClose, selectedIssue, formData, onChange, updateFormData, onIssueAction, onTechnicianAction, loading }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Issue Details & Actions"
  >
    {selectedIssue && (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <StatusBadge status={selectedIssue.issue.severity} type="severity" />
            <StatusBadge status={selectedIssue.issue.status} />
            <span className="text-sm text-gray-600">
              Reported: {new Date(selectedIssue.issue.reported_at).toLocaleDateString()}
            </span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            {formatIssueType(selectedIssue.issue.issue_type)}
          </h4>
          <p className="text-gray-700 mb-3">{selectedIssue.issue.issue_description}</p>

          <div className="border-t pt-3">
            <h5 className="font-medium text-gray-900 mb-2">Booking Details</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Service:</span>
                <span className="ml-2 font-medium">{selectedIssue.booking.service}</span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium">{new Date(selectedIssue.booking.scheduled_date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Technician:</span>
                <span className="ml-2 font-medium">{selectedIssue.booking.technician_id?.user?.fname} {selectedIssue.booking.technician_id?.user?.lname}</span>
              </div>
              <div>
                <span className="text-gray-600">Username:</span>
                <span className="ml-2 font-medium">{selectedIssue.booking.technician_id?.user?.username || 'Not available'}</span>
              </div>
              <div>
                <span className="text-gray-600">Previous Warnings:</span>
                <span className="ml-2 font-medium">{selectedIssue.booking.technician_id?.warning_history?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <StatusBadge status={selectedIssue.booking.booking_status} />
              </div>
            </div>
          </div>

          <div className="border-t pt-3 mt-3">
            <h5 className="font-medium text-gray-900 mb-2">Reported By</h5>
            <p className="text-sm text-gray-700">{selectedIssue.issue.reported_by?.fname} {selectedIssue.issue.reported_by?.lname}</p>
          </div>
        </div>

        {/* Only show action section for pending and under_review issues */}
        {(selectedIssue.issue.status === 'pending' || selectedIssue.issue.status === 'under_review') && (
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Take Action</h5>

            {/* Action Type Selection */}
            <div className="flex space-x-2 mb-4">
              <button
                onClick={() => updateFormData({ selectedIssueAction: 'issue_action' })}
                className={`px-3 py-2 text-sm font-medium rounded-lg border ${formData.selectedIssueAction === 'issue_action'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Issue Resolution
              </button>
              <button
                onClick={() => updateFormData({ selectedIssueAction: 'technician_action' })}
                className={`px-3 py-2 text-sm font-medium rounded-lg border ${formData.selectedIssueAction === 'technician_action'
                  ? 'bg-orange-50 border-orange-200 text-orange-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                Technician Action
              </button>
            </div>

            {/* Issue Resolution Actions */}
            {formData.selectedIssueAction === 'issue_action' && (
              <div className="space-y-3">
                <div>
                  <label htmlFor="issue-resolution" className="block text-sm font-medium text-gray-700 mb-1">Issue Resolution</label>
                  <select
                    id="issue-resolution"
                    name="issue-resolution"
                    value={formData.issueActionStatus}
                    onChange={(e) => {
                      const status = e.target.value
                      updateFormData({
                        issueActionStatus: status,
                        issueNotes: status === 'resolved' ? 'Issue has been reviewed and resolved appropriately.' :
                          status === 'under_review' ? 'Issue is being investigated further.' :
                            status === 'dismissed' ? 'Issue has been reviewed and deemed not actionable.' : ''
                      })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select resolution...</option>
                    <option value="resolved">Mark as Resolved</option>
                    <option value="under_review">Put Under Review</option>
                    <option value="dismissed">Dismiss Issue</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-notes" className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                  <AdminNotesTextarea
                    value={formData.issueNotes}
                    onChange={onChange('issueNotes')}
                  />
                </div>

                {formData.issueActionStatus && (
                  <div className={`p-3 rounded-lg border ${formData.issueActionStatus === 'resolved' ? 'bg-green-50 border-green-200' :
                    formData.issueActionStatus === 'under_review' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                    <p className={`text-sm ${formData.issueActionStatus === 'resolved' ? 'text-green-700' :
                      formData.issueActionStatus === 'under_review' ? 'text-yellow-700' :
                        'text-gray-700'
                      }`}>
                      <strong>Preview:</strong> {
                        formData.issueActionStatus === 'resolved' ? 'This issue will be marked as resolved.' :
                          formData.issueActionStatus === 'under_review' ? 'This issue will be put under review for further investigation.' :
                            'This issue will be dismissed as invalid or not actionable.'
                      }
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Technician Action Section */}
            {formData.selectedIssueAction === 'technician_action' && (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="font-medium text-gray-900">{selectedIssue.booking.technician_id?.user?.fname} {selectedIssue.booking.technician_id?.user?.lname}</p>
                  <p className="text-sm text-gray-600">Issue: {formatIssueType(selectedIssue.issue.issue_type)}</p>
                  <p className="text-sm text-gray-600">Severity: {selectedIssue.issue.severity}</p>
                </div>

                <div>
                  <label htmlFor="technician-action-type" className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select
                    id="technician-action-type"
                    name="technician-action-type"
                    value={formData.technicianAction}
                    onChange={(e) => updateFormData({ technicianAction: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Select action...</option>
                    <option value="warning">Send Warning</option>
                    <option value="temporary_ban">Temporary Ban</option>
                    <option value="permanent_ban">Permanent Ban</option>
                  </select>
                </div>

                {/* Action Reason - Always required */}
                {formData.technicianAction && (
                  <div>
                    <label htmlFor="technician-action-reason" className="block text-sm font-medium text-gray-700 mb-1">
                      Action Reason *
                    </label>
                    <TechnicianActionReasonTextarea
                      value={formData.technicianActionReason}
                      onChange={onChange('technicianActionReason')}
                    />
                  </div>
                )}

                {/* Warning Message - Only for warnings */}
                {formData.technicianAction === 'warning' && (
                  <div>
                    <label htmlFor="warning-message" className="block text-sm font-medium text-gray-700 mb-1">Warning Message</label>
                    <WarningMessageTextarea
                      value={formData.warningMessage}
                      onChange={onChange('warningMessage')}
                    />
                  </div>
                )}

                {/* Temporary Ban Duration - Only for temporary bans */}
                {formData.technicianAction === 'temporary_ban' && (
                  <div>
                    <label htmlFor="temp-ban-days" className="block text-sm font-medium text-gray-700 mb-1">Ban Duration (Days)</label>
                    <input
                      id="temp-ban-days"
                      name="temp-ban-days"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.tempBanDays}
                      onChange={(e) => updateFormData({ tempBanDays: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter number of days..."
                    />
                  </div>
                )}

                {formData.technicianAction && formData.technicianActionReason.trim() && (
                  <div className={`p-3 rounded-lg border ${formData.technicianAction === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    formData.technicianAction === 'temporary_ban' ? 'bg-red-50 border-red-200' :
                      'bg-red-100 border-red-300'
                    }`}>
                    <p className={`text-sm ${formData.technicianAction === 'warning' ? 'text-yellow-700' :
                      'text-red-700'
                      }`}>
                      <strong>Action Preview:</strong>
                      {formData.technicianAction === 'warning' && ' A warning will be sent to the technician.'}
                      {formData.technicianAction === 'temporary_ban' && ` Technician will be banned for ${formData.tempBanDays} days.`}
                      {formData.technicianAction === 'permanent_ban' && ' Technician will be permanently banned.'}
                    </p>
                    <p className="text-xs mt-1 opacity-75">
                      Reason: {formData.technicianActionReason}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {selectedIssue.issue.admin_notes && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h5 className="font-medium text-blue-900 mb-2">Previous Admin Notes</h5>
            <p className="text-sm text-blue-800">{selectedIssue.issue.admin_notes}</p>
          </div>
        )}
      </div>
    )}

    <div className="flex space-x-3 mt-6">
      <Button variant="secondary" onClick={onClose} className="flex-1">
        Close
      </Button>

      {/* Issue Resolution Confirmation */}
      {(selectedIssue?.issue.status === 'pending' || selectedIssue?.issue.status === 'under_review') &&
        formData.selectedIssueAction === 'issue_action' &&
        formData.issueActionStatus &&
        formData.issueNotes.trim() && (
          <Button
            variant="primary"
            onClick={onIssueAction}
            loading={loading}
            className="flex-1"
          >
            Update Issue Status
          </Button>
        )}

      {/* Technician Action Confirmation */}
      {(selectedIssue?.issue.status === 'pending' || selectedIssue?.issue.status === 'under_review') &&
        formData.selectedIssueAction === 'technician_action' &&
        formData.technicianAction &&
        formData.technicianActionReason.trim() &&
        (formData.technicianAction !== 'warning' || formData.warningMessage.trim()) &&
        (formData.technicianAction !== 'temporary_ban' || (formData.tempBanDays && parseInt(formData.tempBanDays) > 0)) && (
          <Button
            variant={formData.technicianAction === 'warning' ? 'warning' : 'danger'}
            onClick={onTechnicianAction}
            loading={loading}
            className="flex-1"
          >
            Apply {formData.technicianAction === 'warning' ? 'Warning' :
              formData.technicianAction === 'temporary_ban' ? 'Temporary Ban' : 'Permanent Ban'}
          </Button>
        )}
    </div>
  </Modal>
))

const BookingModal = React.memo(({ isOpen, onClose, selectedBooking, onContact, onViewIssues }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title="Booking Details"
  >
    {selectedBooking && (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Booking Information</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Service:</span>
                  <span className="ml-2 font-medium">{selectedBooking.service}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 font-medium">{new Date(selectedBooking.scheduled_date).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-gray-600">Time:</span>
                  <span className="ml-2 font-medium">{selectedBooking.scheduled_StartTime}-{selectedBooking.scheduled_EndTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <StatusBadge status={selectedBooking.booking_status} />
                </div>
                <div>
                  <span className="text-gray-600">Price:</span>
                  <span className="ml-2 font-medium">Rs.{selectedBooking.final_price}</span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Customer Information</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">
                    {`${selectedBooking.fname} ${selectedBooking.lname}`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Technician:</span>
                  <span className="ml-2 font-medium">{selectedBooking.technician_id?.user?.fname} {selectedBooking.technician_id?.user?.lname}</span>
                </div>
                {selectedBooking.rating && (
                  <div>
                    <span className="text-gray-600">Rating:</span>
                    <div className="ml-2 inline-flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{selectedBooking.rating}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {selectedBooking.issues && selectedBooking.issues.length > 0 && (
          <div className="border rounded-lg p-4">
            <h5 className="font-medium text-gray-900 mb-3">Associated Issues</h5>
            <div className="space-y-2">
              {selectedBooking.issues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-800">{formatIssueType(issue.issue_type)}</span>
                  <StatusBadge status={issue.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="border rounded-lg p-4">
          <h5 className="font-medium text-gray-900 mb-3">Quick Actions</h5>
          <div className="flex gap-3">
            <Button
              size="sm"
              onClick={() => onContact('Client', selectedBooking.email)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Client
            </Button>

            <Button
              size="sm"
              variant="success"
              onClick={() => onContact('Technician', selectedBooking?.technician_id?.user?.username)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Technician
            </Button>

            {selectedBooking.issues && selectedBooking.issues.length > 0 && (
              <Button size="sm" variant="warning" onClick={onViewIssues}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Related Issues
              </Button>
            )}
          </div>
        </div>
      </div>
    )}

    <div className="flex justify-end mt-6">
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
    </div>
  </Modal>
))

const ContactModal = React.memo(({ isOpen, onClose, formData, onChange, onSend, loading }) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Contact ${formData.contactType}`}
    maxWidth="max-w-xl"
  >
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-600">Sending message to:</p>
        <p className="font-medium text-gray-900">{formData.contactEmail}</p>
      </div>

      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <ContactMessageTextarea
          value={formData.message}
          onChange={onChange('message')}
          placeholder={`Write your message to the ${formData.contactType.toLowerCase()}...`}
          onEnter={onSend}
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onSend}
          disabled={!formData.message.trim()}
          loading={loading}
        >
          <Send className="h-4 w-4 mr-2" />
          Send Message
        </Button>
      </div>
    </div>
  </Modal>
))

export default AdminDashboard