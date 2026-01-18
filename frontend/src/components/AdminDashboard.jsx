import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';

export default function AdminDashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [pendingShopkeepers, setPendingShopkeepers] = useState([]);
  const [approvedShopkeepers, setApprovedShopkeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/admin/login');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('mm_token');
      const [pendingRes, approvedRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/pending-shopkeepers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/admin/shopkeepers', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();

      setPendingShopkeepers(pendingData);
      setApprovedShopkeepers(approvedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (shopkeeperId) => {
    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch(
        `http://localhost:5000/api/admin/shopkeepers/${shopkeeperId}/approve`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert('Shopkeeper approved successfully!');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to approve');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Failed to approve shopkeeper');
    }
  };

  const handleReject = async (shopkeeperId) => {
    if (!confirm('Are you sure you want to reject this shopkeeper?')) return;

    try {
      const token = localStorage.getItem('mm_token');
      const response = await fetch(
        `http://localhost:5000/api/admin/shopkeepers/${shopkeeperId}/reject`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        alert('Shopkeeper rejected and removed');
        fetchData();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to reject');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject shopkeeper');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mm_token');
    localStorage.removeItem('mm_user');
    setUser(null);
    navigate('/admin/login');
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Admin Header */}
          <div className="mm-surface mm-border rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="mm-text-muted">Manage shopkeeper registrations and platform</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-2 mm-btn mm-btn-danger"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mm-surface mm-border rounded-lg mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('pending')}
                className={`flex-1 py-4 px-6 font-semibold transition ${activeTab === 'pending' ? '' : 'mm-text-muted'}`}
                style={activeTab === 'pending' ? {color:'var(--accent)', borderBottom:'2px solid var(--accent)'} : {}}
              >
                Pending Approvals ({pendingShopkeepers.length})
              </button>
              <button
                onClick={() => setActiveTab('approved')}
                className={`flex-1 py-4 px-6 font-semibold transition ${activeTab === 'approved' ? '' : 'mm-text-muted'}`}
                style={activeTab === 'approved' ? {color:'var(--accent)', borderBottom:'2px solid var(--accent)'} : {}}
              >
                Approved Shopkeepers ({approvedShopkeepers.length})
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <p className="text-center mm-text-muted">Loading...</p>
              ) : activeTab === 'pending' ? (
                <div>
                  {pendingShopkeepers.length === 0 ? (
                    <p className="text-center mm-text-muted py-8">No pending approvals</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingShopkeepers.map((shop) => (
                        <div key={shop._id} className="rounded-lg p-4" style={{background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.35)'}}>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Shop Name</p>
                              <p className="font-bold text-lg">{shop.shopName}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Owner</p>
                              <p className="font-bold text-lg">{shop.username}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Email</p>
                              <p>{shop.email}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Phone</p>
                              <p>{shop.phoneNumber}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm mm-text-muted mb-1">Address</p>
                              <p>{shop.address}</p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <button onClick={() => handleApprove(shop._id)} className="flex-1 px-4 py-2 mm-btn" style={{background:'#16a34a', borderColor:'transparent', color:'#fff'}}>
                              Approve
                            </button>
                            <button onClick={() => handleReject(shop._id)} className="flex-1 px-4 py-2 mm-btn mm-btn-danger">
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {approvedShopkeepers.length === 0 ? (
                    <p className="text-center mm-text-muted py-8">No approved shopkeepers yet</p>
                  ) : (
                    <div className="space-y-4">
                      {approvedShopkeepers.map((shop) => (
                        <div key={shop._id} className="rounded-lg p-4" style={{background:'rgba(34,197,94,0.12)', border:'1px solid rgba(34,197,94,0.35)'}}>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Shop Name</p>
                              <p className="font-bold text-lg">{shop.shopName}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Owner</p>
                              <p className="font-bold text-lg">{shop.username}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Email</p>
                              <p>{shop.email}</p>
                            </div>
                            <div>
                              <p className="text-sm mm-text-muted mb-1">Phone</p>
                              <p>{shop.phoneNumber}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-sm mm-text-muted mb-1">Address</p>
                              <p>{shop.address}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
