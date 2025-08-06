import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Filter, RefreshCw, Calendar, DollarSign, User, Phone, CreditCard, AlertCircle, CheckCircle, Edit } from 'lucide-react'

const PaymentDashboard = () => {
    const [payments, setPayments] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState('desc')
    const [dateFilter, setDateFilter] = useState('all')
    const [customStartDate, setCustomStartDate] = useState('')
    const [customEndDate, setCustomEndDate] = useState('')

    const { role, id } = useParams()

    // Khalti number management states
    const [khaltiSetupStep, setKhaltiSetupStep] = useState('checking')
    const [khaltiNumber, setKhaltiNumber] = useState('')
    const [existingKhaltiNumber, setExistingKhaltiNumber] = useState('')
    const [khaltiLoading, setKhaltiLoading] = useState(false)
    const [khaltiError, setKhaltiError] = useState('')
    const [khaltiSuccess, setKhaltiSuccess] = useState(false)


    // API functions for Khalti management
    const checkKhaltiStatus = async () => {
        setKhaltiLoading(true)
        try {
            const Response = await fetch(`http://localhost:5000/api/payment/check-khalti-number?role=${role}&id=${id}`, {
                method: 'GET',
                credentials: 'include',
            })
            const mockResponse = await Response.json()

            if (mockResponse.exists) {
                setExistingKhaltiNumber(mockResponse.khaltiNumber)
                setKhaltiSetupStep('dashboard')
            } else {
                setKhaltiSetupStep('setup')
            }
        } catch (err) {
            setKhaltiError('Failed to check Khalti number status')
            setKhaltiSetupStep('setup')
        } finally {
            setKhaltiLoading(false)
        }
    }

    const addKhaltiNumber = async () => {
        if (!khaltiNumber.trim()) {
            setKhaltiError('Please enter a valid Khalti number')
            return
        }

        // Basic validation for Khalti number (10 digits starting with 98)
        const khaltiRegex = /^98\d{8}$/
        if (!khaltiRegex.test(khaltiNumber)) {
            setKhaltiError('Please enter a valid Khalti number (10 digits starting with 98)')
            return
        }

        setKhaltiLoading(true)
        setKhaltiError('')

        try {
            const Response = await fetch(`http://localhost:5000/api/payment/update-khalti-number`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role, id, khaltiNumber })
            })

            const mockResponse = await Response.json()

            // Check if the HTTP status is 200 (success) instead of looking for status in JSON
            if (Response.ok) {
                setExistingKhaltiNumber(khaltiNumber)
                setKhaltiSuccess(true)
                setKhaltiNumber('')
                setKhaltiError('')
                
                // Redirect to dashboard after 3 seconds
                setTimeout(() => {
                    setKhaltiSetupStep('dashboard')
                    setKhaltiSuccess(false)
                }, 3000)
            } else {
                // Handle error response
                setKhaltiError(mockResponse.error || 'Failed to add Khalti number. Please try again.')
            }
        } catch (err) {
            setKhaltiError('Failed to add Khalti number. Please try again.')
        } finally {
            setKhaltiLoading(false)
        }
    }

    const fetchPayments = async () => {
        setLoading(true)
        setError('')

        try {
            const Response = await fetch(`http://localhost:5000/api/payment/getPayments`, {
                method: 'GET',
                credentials: 'include',
            })
            const mockPayments = await Response.json()

            const payments=mockPayments.payments

            setPayments(payments)
        } catch (err) {
            setError('Failed to fetch payments')
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = () => {
        fetchPayments()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800'
            case 'pending': return 'bg-yellow-100 text-yellow-800'
            case 'initiated': return 'bg-blue-100 text-blue-800'
            case 'failed': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString()
    }

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-NP', {
            style: 'currency',
            currency: 'NPR'
        }).format(amount)
    }

    const filteredAndSortedPayments = payments

    useEffect(() => {
        checkKhaltiStatus()
    }, [])

    useEffect(() => {
        if (khaltiSetupStep === 'dashboard') {
            handleSearch()
        }
    }, [khaltiSetupStep])

    // Khalti Setup Loading Screen
    if (khaltiSetupStep === 'checking') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center">
                        <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Checking Account Setup</h2>
                        <p className="text-gray-600">Verifying your Khalti number configuration...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Khalti Setup Screen
    if (khaltiSetupStep === 'setup') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Khalti Number</h2>
                        <p className="text-gray-600">You need to add your Khalti number before accessing the payment dashboard.</p>
                    </div>

                    {/* Success Message */}
                    {khaltiSuccess && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                <div>
                                    <h3 className="text-green-800 font-medium">Khalti Number Added Successfully!</h3>
                                    <p className="text-green-700 text-sm mt-1">
                                        Your Khalti number has been saved. Redirecting to dashboard in a few seconds...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error Message */}
                    {khaltiError && !khaltiSuccess && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-red-800 text-sm">{khaltiError}</p>
                        </div>
                    )}

                    {/* Form - Hide when success is shown */}
                    {!khaltiSuccess && (
                        <>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Khalti Number
                                    </label>
                                    <input
                                        type="text"
                                        value={khaltiNumber}
                                        onChange={(e) => setKhaltiNumber(e.target.value)}
                                        placeholder="98XXXXXXXX"
                                        maxLength="10"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="text-sm text-gray-500 mt-1">Enter your 10-digit Khalti number starting with 98</p>
                                </div>

                                <button
                                    onClick={addKhaltiNumber}
                                    disabled={khaltiLoading}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {khaltiLoading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Adding Khalti Number...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4" />
                                            Add Khalti Number
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="text-sm font-medium text-blue-900 mb-2">Why do I need to add my Khalti number?</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Required for processing payments</li>
                                    <li>• Ensures secure transaction handling</li>
                                    <li>• Links your account to Khalti payment system</li>
                                </ul>
                            </div>
                        </>
                    )}

                    {/* Success state - show loading animation */}
                    {khaltiSuccess && (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="flex items-center justify-center gap-2 text-green-700">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Redirecting to dashboard...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Main Payment Dashboard (only shown after Khalti setup is complete)
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header with Khalti Info */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Dashboard</h1>
                            <p className="text-gray-600">View and manage your payment transactions</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Khalti Connected</span>
                            </div>
                            <p className="text-sm text-green-700">Number: {existingKhaltiNumber}</p>
                            <button
                                onClick={() => {
                                    setKhaltiSetupStep('setup')
                                    setKhaltiSuccess(false)
                                    setKhaltiError('')
                                }}
                                className="mt-2 text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                            >
                                <Edit className="w-3 h-3" />
                                Update Number
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="initiated">Initiated</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Time</option>
                                <option value="today">Today</option>
                                <option value="yesterday">Yesterday</option>
                                <option value="last7days">Last 7 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="last3months">Last 3 Months</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {/* Custom Date Range - Start Date */}
                        {dateFilter === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Custom Date Range - End Date */}
                        {dateFilter === 'custom' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                            <div className="flex gap-2">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="createdAt">Date Created</option>
                                    <option value="amount">Amount</option>
                                    <option value="status">Status</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                                >
                                    {sortOrder === 'asc' ? '↑' : '↓'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Search className="w-4 h-4" />
                            Apply Filters
                        </button>
                        <button
                            onClick={() => {
                                setStatusFilter('all')
                                setDateFilter('all')
                                setCustomStartDate('')
                                setCustomEndDate('')
                                setSortBy('createdAt')
                                setSortOrder('desc')
                                fetchPayments()
                            }}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                        <p className="text-gray-600">Loading payments...</p>
                    </div>
                )}

                {/* Payment Stats */}
                {!loading && filteredAndSortedPayments.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Payments</p>
                                    <p className="text-2xl font-bold text-gray-900">{filteredAndSortedPayments.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <User className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {filteredAndSortedPayments.filter(p => p.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Calendar className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Pending</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {filteredAndSortedPayments.filter(p => p.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments Table */}
                {!loading && (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {filteredAndSortedPayments.length === 0 ? (
                            <div className="p-12 text-center">
                                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                                <p className="text-gray-600">Try adjusting your search criteria or create a new payment.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Payment ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Amount
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Transaction ID
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredAndSortedPayments.map((payment) => (
                                            <tr key={payment._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{payment.pidx}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{payment.orderId}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {formatAmount(payment.amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{payment.customerInfo.name}</div>
                                                    <div className="text-sm text-gray-500">{payment.customerInfo.username}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{formatDate(payment.createdAt)}</div>
                                                    {payment.updatedAt !== payment.createdAt && (
                                                        <div className="text-sm text-gray-500">Updated: {formatDate(payment.updatedAt)}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {payment.transactionId || 'N/A'}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default PaymentDashboard