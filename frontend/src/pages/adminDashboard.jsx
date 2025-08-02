import React, { useState, useEffect } from 'react'
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

const AdminDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview')
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
  const [loading, setLoading] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [selectedTechnician, setSelectedTechnician] = useState(null)
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState('')
  const [banSeverity, setBanSeverity] = useState('permanent')
  const [issueNotes, setIssueNotes] = useState('')
  const [selectedIssueAction, setSelectedIssueAction] = useState('')
  const [unbanReason, setUnbanReason] = useState('')
  const [technicianAction, setTechnicianAction] = useState('')
  const [technicianActionReason, setTechnicianActionReason] = useState('')
  const [warningMessage, setWarningMessage] = useState('')
  const [suspensionDays, setSuspensionDays] = useState('3')
  const [tempBanDays, setTempBanDays] = useState('7')

  const [contactType, setContactType] = useState('');
  const [message, setMessage] = useState('');

  // Modal states
  const [modals, setModals] = useState({
    unban: false,
    issue: false,
    booking: false,
    technicianView: false,
    contact: false
  })

  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    issue_type: 'all',
    date_from: '',
    date_to: '',
    search: ''
  })

  // API Base URL - Replace with your actual API URL
  const API_BASE_URL = 'http://localhost:5000/api'

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      under_review: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[severity] || 'bg-gray-100 text-gray-800'
  }

  const formatIssueType = (issueType) => {
    return issueType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const openModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }))
  }

  const closeModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
    // Reset modal-specific states
    if (modalName === 'unban') setUnbanReason('')
    if (modalName === 'issue') {
      setIssueNotes('')
      setSelectedIssueAction('')
      setTechnicianAction('')
      setTechnicianActionReason('')
      setWarningMessage('')
      setSuspensionDays('3')
      setTempBanDays('7')
    }
  }

  // Reusable Components
  const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl' }) => {
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
  }

  const Button = ({
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

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
      success: 'bg-green-600 text-white hover:bg-green-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
      orange: 'bg-orange-600 text-white hover:bg-orange-700'
    }

    const sizes = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg'
    }

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </button>
    )
  }

  const StatusBadge = ({ status, type = 'status' }) => {
    const colorClass = type === 'severity' ? getSeverityColor(status) : getStatusColor(status)
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {status}
      </span>
    )
  }

  const Table = ({ headers, children, title }) => (
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
  )

  const FilterSection = ({ children }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex flex-wrap gap-4">
        {children}
      </div>
    </div>
  )

  const handleContactClick = (type) => {
    setContactType(type);
    setMessage('');
    openModal('contact');
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      alert('Please enter a message before sending.');
      return;
    }

    // Here you would typically send the message to your backend
    console.log(`Sending message to ${contactType}:`, message);
    alert(`Message sent to ${contactType}!\n\nMessage: ${message}`);

    // Reset and close modal using your existing function
    setMessage('');
    closeModal('contact');
  };

  const handleCloseContactModal = () => {
    closeModal('contact'); // Use your existing function
    setMessage('');
  }

  // API Functions
  const fetchStats = async () => {
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
  }

  const fetchSpecificStats = async (technicianId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/bookings/stats/overview?technician_id=${technicianId}`, {
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
  }

  const fetchBookings = async () => {
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
  }

  const fetchIssues = async () => {
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
  }

  const fetchBannedTechnicians = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/technicians/banned`, {
        method: 'GET',
        credentials: 'include'
      })

      console.log(response)

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
  }

  // Handler functions
  const handleUnbanTechnician = async () => {
    if (!unbanReason.trim()) return

    setLoading(true)
    try {

      const response = await fetch(`${API_BASE_URL}/admin/technicians/${selectedTechnician._id}/unban`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: unbanReason })
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
  }

  const handleIssueAction = async () => {
    if (!selectedIssueAction) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/${selectedIssue.booking._id}/issues/${selectedIssue.issue._id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedIssueAction,
          admin_notes: issueNotes
        })
      })

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      await fetchIssues()
      await fetchStats()
      closeModal('issue')
      alert(`Issue ${selectedIssueAction} successfully`)
    } catch (error) {
      console.error('Error updating issue:', error)
      alert('Failed to update issue. Please try again.')
    }
    setLoading(false)
  }

  const handleTechnicianAction = async () => {
    if (!technicianAction || !technicianActionReason.trim()) return

    setLoading(true)
    try {
      const technicianId = selectedIssue.booking.technician_id.user._id

      let endpoint = ''
      let payload = {}

      switch (technicianAction) {
        case 'warning':
          endpoint = `/admin/technicians/${technicianId}/warn`
          payload = {
            reason: technicianActionReason,
            warning_message: warningMessage,
            issue_id: selectedIssue.issue._id,
            booking_id: selectedIssue.booking._id
          }
          break
        case 'temporary_ban':
          endpoint = `/admin/technicians/${technicianId}/ban`
          payload = {
            reason: technicianActionReason,
            severity: 'temporary',
            ban_duration_days: parseInt(tempBanDays),
            issue_id: selectedIssue.issue._id,
            booking_id: selectedIssue.booking._id
          }
          break
        case 'permanent_ban':
          endpoint = `/admin/technicians/${technicianId}/ban`
          payload = {
            reason: technicianActionReason,
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
          admin_notes: `Action taken against technician: ${technicianAction} - ${technicianActionReason}`
        })
      })

      await fetchIssues()
      await fetchStats()
      await fetchBannedTechnicians()
      closeModal('issue')
      alert(`Technician action (${technicianAction}) applied successfully`)
    } catch (error) {
      console.error('Error applying technician action:', error)
      alert('Failed to apply technician action. Please try again.')
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchStats()
    fetchBookings()
    fetchIssues()
    fetchBannedTechnicians()
  }, [])

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings()
    } else if (activeTab === 'issues') {
      fetchIssues()
    }
  }, [filters, activeTab])

  // Statistics Card Component
  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
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
  )

  // Tab Components
  const OverviewTab = () => (
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
  )

  const BookingsTab = () => (
    <div className="space-y-6">
      <FilterSection>
        <div className="flex-1 min-w-64">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
        </div>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.date_from}
          onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
        />
        <input
          type="date"
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.date_to}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
        />
      </FilterSection>

      <Table
        title="All Bookings"
        headers={['Service', 'Customer', 'Technician', 'Date', 'Status', 'Price', 'Issues', 'Actions']}
      >
        {bookings.filter(booking => {
          if (filters.search) {
            const searchTerm = filters.search.toLowerCase()
            return booking.service.toLowerCase().includes(searchTerm) ||
              `${booking.fname} ${booking.lname}`.toLowerCase().includes(searchTerm)
          }
          return true
        }).map((booking) => (
          <tr key={booking._id} className="hover:bg-gray-50">
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
                  setSelectedBooking(booking)
                  openModal('booking')
                }}
                className="text-blue-600 hover:text-blue-900"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )

  const IssuesTab = () => (
    <div className="space-y-6">
      <FilterSection>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.severity}
          onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
        >
          <option value="all">All Severity</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={filters.issue_type}
          onChange={(e) => setFilters({ ...filters, issue_type: e.target.value })}
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
          <div key={item.issue._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
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
                {/* Combined View/Action button */}
                <button
                  onClick={() => {
                    setSelectedIssue(item)
                    openModal('issue')
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="View Details & Take Action"
                >
                  <Gavel className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const TechniciansTab = () => (
    <div className="space-y-6">
      <Table
        title="Banned Technicians"
        headers={['Technician', 'Ban Reason', 'Banned Date', 'Severity', 'End Date', 'Actions']}
      >
        {bannedTechnicians.map((technician) => (
          <tr key={technician._id} className="hover:bg-gray-50">
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
                  setSelectedTechnician(technician)
                  openModal('unban')
                }}
                className="text-green-600 hover:text-green-900 mr-3"
                title="Unban Technician"
              >
                <ShieldOff className="h-4 w-4" />
              </button>
              <button
                onClick={async () => {
                  setSelectedTechnician(technician)
                  await fetchSpecificStats(technician._id)
                  openModal('technicianView')
                }}
                className="text-blue-600 hover:text-blue-900"
                title="View Details"
              >
                <Eye className="h-4 w-4" />
              </button>
            </td>
          </tr>
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
  )

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
                onClick={() => {
                  setLoading(true)
                  Promise.all([
                    fetchStats(),
                    fetchBookings(),
                    fetchIssues(),
                    fetchBannedTechnicians()
                  ]).finally(() => setLoading(false))
                }}
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
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'bookings', name: 'Bookings', icon: Calendar },
              { id: 'issues', name: 'Issues', icon: AlertTriangle },
              { id: 'technicians', name: 'Technicians', icon: Users }
            ].map((tab) => (
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
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'bookings' && <BookingsTab />}
        {activeTab === 'issues' && <IssuesTab />}
        {activeTab === 'technicians' && <TechniciansTab />}
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
      <Modal
        isOpen={modals.unban}
        onClose={() => closeModal('unban')}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Unban Reason *</label>
            <textarea
              value={unbanReason}
              onChange={(e) => setUnbanReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter the reason for unbanning this technician..."
              required
            />
          </div>
        </div>
        <div className="flex space-x-3 mt-6">
          <Button variant="secondary" onClick={() => closeModal('unban')} className="flex-1">
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleUnbanTechnician}
            disabled={!unbanReason.trim()}
            loading={loading}
            className="flex-1"
          >
            Unban Technician
          </Button>
        </div>
      </Modal>

      {/* Technician View Modal */}
      <Modal
        isOpen={modals.technicianView}
        onClose={() => closeModal('technicianView')}
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
                onClick={() => {
                  closeModal('technicianView')
                  openModal('unban')
                }}
                className="flex items-center"
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Unban Technician
              </Button>
              <Button
                variant="secondary"
                onClick={() => alert('Contact technician functionality would be implemented here')}
                className="flex items-center"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Technician
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => closeModal('technicianView')}>
            Close
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={modals.issue}
        onClose={() => closeModal('issue')}
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

            {selectedIssue.issue.status === 'pending' && (
              <div className="border rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-3">Take Action</h5>

                {/* Action Type Selection */}
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setSelectedIssueAction('issue_action')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border ${selectedIssueAction === 'issue_action'
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Issue Resolution
                  </button>
                  <button
                    onClick={() => setSelectedIssueAction('technician_action')}
                    className={`px-3 py-2 text-sm font-medium rounded-lg border ${selectedIssueAction === 'technician_action'
                      ? 'bg-orange-50 border-orange-200 text-orange-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    Technician Action
                  </button>
                </div>

                {/* Issue Resolution Actions */}
                {selectedIssueAction === 'issue_action' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issue Resolution</label>
                      <select
                        value={issueNotes ? 'custom' : ''}
                        onChange={(e) => {
                          if (e.target.value === 'resolved') {
                            setIssueNotes('Issue has been reviewed and resolved appropriately.')
                          } else if (e.target.value === 'under_review') {
                            setIssueNotes('Issue is being investigated further.')
                          } else if (e.target.value === 'dismissed') {
                            setIssueNotes('Issue has been reviewed and deemed not actionable.')
                          } else {
                            setIssueNotes('')
                          }
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
                      <textarea
                        value={issueNotes}
                        onChange={(e) => setIssueNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        placeholder="Add notes about your decision..."
                      />
                    </div>

                    {issueNotes && (
                      <div className={`p-3 rounded-lg border ${issueNotes.includes('resolved') ? 'bg-green-50 border-green-200' :
                        issueNotes.includes('review') ? 'bg-yellow-50 border-yellow-200' :
                          'bg-gray-50 border-gray-200'
                        }`}>
                        <p className={`text-sm ${issueNotes.includes('resolved') ? 'text-green-700' :
                          issueNotes.includes('review') ? 'text-yellow-700' :
                            'text-gray-700'
                          }`}>
                          <strong>Preview:</strong> {
                            issueNotes.includes('resolved') ? 'This issue will be marked as resolved.' :
                              issueNotes.includes('review') ? 'This issue will be put under review for further investigation.' :
                                'This issue will be dismissed as invalid or not actionable.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Technician Action Section */}
                {selectedIssueAction === 'technician_action' && (
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="font-medium text-gray-900">{selectedIssue.booking.technician_id?.user?.fname} {selectedIssue.booking.technician_id?.user?.lname}</p>
                      <p className="text-sm text-gray-600">Issue: {formatIssueType(selectedIssue.issue.issue_type)}</p>
                      <p className="text-sm text-gray-600">Severity: {selectedIssue.issue.severity}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                      <select
                        value={technicianAction}
                        onChange={(e) => setTechnicianAction(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Select action...</option>
                        <option value="warning">Send Warning</option>
                        <option value="temporary_ban">Temporary Ban</option>
                        <option value="permanent_ban">Permanent Ban</option>
                      </select>
                    </div>

                    {/* Action Reason - Always required */}
                    {technicianAction && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Action Reason *
                        </label>
                        <textarea
                          value={technicianActionReason}
                          onChange={(e) => setTechnicianActionReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          rows="3"
                          placeholder="Enter the reason for this action..."
                          required
                        />
                      </div>
                    )}

                    {/* Warning Message - Only for warnings */}
                    {technicianAction === 'warning' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Warning Message</label>
                        <textarea
                          value={warningMessage}
                          onChange={(e) => setWarningMessage(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          rows="3"
                          placeholder="Enter warning message for the technician..."
                        />
                      </div>
                    )}

                    {/* Suspension Duration - Only for suspensions */}
                    {technicianAction === 'suspend' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Suspension Duration (Days)</label>
                        <input
                          type="number"
                          min="1"
                          max="30"
                          value={suspensionDays}
                          onChange={(e) => setSuspensionDays(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter number of days..."
                        />
                      </div>
                    )}

                    {/* Temporary Ban Duration - Only for temporary bans */}
                    {technicianAction === 'temporary_ban' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ban Duration (Days)</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={tempBanDays}
                          onChange={(e) => setTempBanDays(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter number of days..."
                        />
                      </div>
                    )}

                    {technicianAction && technicianActionReason.trim() && (
                      <div className={`p-3 rounded-lg border ${technicianAction === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                        technicianAction === 'suspend' ? 'bg-orange-50 border-orange-200' :
                          technicianAction === 'temporary_ban' ? 'bg-red-50 border-red-200' :
                            'bg-red-100 border-red-300'
                        }`}>
                        <p className={`text-sm ${technicianAction === 'warning' ? 'text-yellow-700' :
                          technicianAction === 'suspend' ? 'text-orange-700' :
                            'text-red-700'
                          }`}>
                          <strong>Action Preview:</strong>
                          {technicianAction === 'warning' && ' A warning will be sent to the technician.'}
                          {technicianAction === 'suspend' && ` Technician will be suspended for ${suspensionDays} days.`}
                          {technicianAction === 'temporary_ban' && ` Technician will be banned for ${tempBanDays} days.`}
                          {technicianAction === 'permanent_ban' && ' Technician will be permanently banned.'}
                        </p>
                        <p className="text-xs mt-1 opacity-75">
                          Reason: {technicianActionReason}
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
          <Button variant="secondary" onClick={() => closeModal('issue')} className="flex-1">
            Close
          </Button>

          {/* Issue Resolution Confirmation */}
          {selectedIssue?.issue.status === 'pending' && selectedIssueAction === 'issue_action' && issueNotes.trim() && (
            <Button
              variant="primary"
              onClick={() => {
                const action = issueNotes.includes('resolved') ? 'resolved' :
                  issueNotes.includes('review') ? 'under_review' : 'dismissed'
                const originalAction = selectedIssueAction
                setSelectedIssueAction(action)
                handleIssueAction().then(() => {
                  setSelectedIssueAction(originalAction)
                })
              }}
              loading={loading}
              className="flex-1"
            >
              Update Issue Status
            </Button>
          )}

          {/* Technician Action Confirmation */}
          {selectedIssue?.issue.status === 'pending' &&
            selectedIssueAction === 'technician_action' &&
            technicianAction &&
            technicianActionReason.trim() &&
            (technicianAction !== 'warning' || warningMessage.trim()) &&
            (technicianAction !== 'suspend' || (suspensionDays && parseInt(suspensionDays) > 0)) &&
            (technicianAction !== 'temporary_ban' || (tempBanDays && parseInt(tempBanDays) > 0)) && (
              <Button
                variant={technicianAction === 'warning' ? 'warning' : technicianAction === 'suspend' ? 'orange' : 'danger'}
                onClick={handleTechnicianAction}
                loading={loading}
                className="flex-1"
              >
                Apply {technicianAction === 'warning' ? 'Warning' :
                  technicianAction === 'suspend' ? 'Suspension' :
                    technicianAction === 'temporary_ban' ? 'Temporary Ban' : 'Permanent Ban'}
              </Button>
            )}
        </div>
      </Modal>

      <Modal
        isOpen={modals.booking}
        onClose={() => closeModal('booking')}
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
                  onClick={() => handleContactClick('Client')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Client
                </Button>

                <Button
                  size="sm"
                  variant="success"
                  onClick={() => handleContactClick('Technician')}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Technician
                </Button>

                {selectedBooking.issues && selectedBooking.issues.length > 0 && (
                  <Button size="sm" variant="warning" onClick={() => {
                    setActiveTab('issues')
                    closeModal('booking')
                  }}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View Related Issues
                  </Button>
                )}
              </div>
            </div>


            {/* Contact Modal using your modal system */}
            {modals.contact && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-xl mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contact {contactType}
                    </h3>
                    <button
                      onClick={handleCloseContactModal}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <input
                        type="text"
                        id="contact-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && message.trim()) {
                            handleSendMessage();
                          }
                        }}
                        placeholder={`Write your message to the ${contactType.toLowerCase()}...`}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" // Increased padding and text size
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleCloseContactModal}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button variant="secondary" onClick={() => closeModal('booking')}>
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default AdminDashboard