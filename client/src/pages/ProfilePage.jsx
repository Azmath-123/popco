import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { User, Package, MapPin, Coins, ShieldCheck, Plus, Trash2, Truck, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
export const ProfilePage = () => {
    const { currentUser, orders, logout, addAddress, deleteAddress, setDefaultAddress, switchRole, setIsAuthModalOpen } = useStore();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    // New address form state
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newLabel, setNewLabel] = useState('Home');
    const [newName, setNewName] = useState(currentUser?.name || '');
    const [newPhone, setNewPhone] = useState(currentUser?.phone || '');
    const [newAddressLine, setNewAddressLine] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newState, setNewState] = useState('');
    const [newPincode, setNewPincode] = useState('');
    if (!currentUser) {
        return (<div className="flex-1 max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-[var(--background)] border border-[var(--border)]/20 rounded-full flex items-center justify-center mx-auto text-[var(--foreground)]">
          <User size={36}/>
        </div>
        <h2 className="text-xl font-black uppercase text-[var(--foreground)]">Please Sign In</h2>
        <p className="text-xs text-[var(--foreground)]/70 font-sans">
          Sign in to view your orders, live shipment tracking, and mCoins rewards.
        </p>
        <button onClick={() => setIsAuthModalOpen(true)} className="px-8 py-3 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--primary)]/90">
          Sign In / Register
        </button>
      </div>);
    }
    const handleCreateAddress = (e) => {
        e.preventDefault();
        if (!newAddressLine || !newCity || !newPincode)
            return;
        addAddress({
            label: newLabel,
            name: newName || currentUser.name,
            phone: newPhone || currentUser.phone,
            addressLine1: newAddressLine,
            city: newCity,
            state: newState || 'Bihar',
            pincode: newPincode,
            isDefault: currentUser.addresses.length === 0,
        });
        setNewAddressLine('');
        setNewCity('');
        setNewPincode('');
        setShowAddAddress(false);
    };
    return (<div className="flex-1 bg-[var(--background)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Header Banner */}
        <div className="bg-[var(--primary)] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[var(--border)]/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-[var(--foreground)] text-2xl font-black flex items-center justify-center shadow-md">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                  {currentUser.name}
                </h1>
                <span className="text-[9px] font-extrabold uppercase bg-white/20 px-2 py-0.5 rounded text-white">
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-white/80 font-sans mt-0.5">
                {currentUser.email} • {currentUser.phone}
              </p>
              <p className="text-[10px] text-white/60 font-semibold mt-1">
                Member since {currentUser.joinedDate}
              </p>
            </div>
          </div>

          {/* Balance & Actions */}
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-xs p-3 px-5 rounded-2xl border border-white/15 text-left">
              <span className="text-[10px] uppercase font-bold text-white/70 block">Available mCoins</span>
              <div className="flex items-center gap-1.5 text-xl font-black text-amber-300">
                <Coins size={18}/>
                <span>{currentUser.mCoins}</span>
              </div>
            </div>

            <button onClick={logout} className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors" title="Sign Out">
              <LogOut size={18}/>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border)]/15 bg-white rounded-2xl p-1.5 text-xs font-black uppercase tracking-wider shadow-xs">
          <button onClick={() => setActiveTab('orders')} className={`flex-1 py-3 text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'orders'
            ? 'bg-[var(--primary)] text-white shadow-md'
            : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'}`}>
            <Package size={15}/>
            <span>Order History ({orders.length})</span>
          </button>

          <button onClick={() => setActiveTab('addresses')} className={`flex-1 py-3 text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'addresses'
            ? 'bg-[var(--primary)] text-white shadow-md'
            : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'}`}>
            <MapPin size={15}/>
            <span>Saved Addresses ({currentUser.addresses.length})</span>
          </button>

          <button onClick={() => setActiveTab('rewards')} className={`flex-1 py-3 text-center rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'rewards'
            ? 'bg-[var(--primary)] text-white shadow-md'
            : 'text-[var(--foreground)]/70 hover:text-[var(--foreground)]'}`}>
            <Coins size={15}/>
            <span>mCoins & Perks</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (<div className="space-y-4">
            {orders.length === 0 ? (<div className="bg-white p-12 text-center rounded-3xl border border-[var(--border)]/10 space-y-3">
                <Package size={36} className="mx-auto text-[var(--foreground)]/30"/>
                <h3 className="text-base font-black uppercase text-[var(--foreground)]">No Orders Yet</h3>
                <p className="text-xs text-[var(--foreground)]/70 font-sans">
                  Your placed orders will appear here with live tracking milestones.
                </p>
                <Link to="/#shop" className="inline-block px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider">
                  Shop Now
                </Link>
              </div>) : (orders.map((order) => {
                const isShippedOrDelivered = order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered';
                return (<div key={order.id} className="bg-white rounded-3xl border border-[var(--border)]/15 p-6 shadow-sm space-y-4">
                    {/* Header info */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border)]/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-[var(--foreground)] font-mono">
                            {order.orderNumber}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${order.orderStatus === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : order.orderStatus === 'Shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                            {order.orderStatus}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--foreground)]/60 font-semibold mt-0.5">
                          Placed on {order.date} • {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-[var(--foreground)]/60 block">Total Amount</span>
                        <span className="text-lg font-black text-[var(--foreground)]">₹{order.total}</span>
                      </div>
                    </div>

                    {/* Order tracking steps progress */}
                    <div className="bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]/10 space-y-3">
                      <div className="flex justify-between text-[11px] font-bold text-[var(--foreground)]">
                        <span className="flex items-center gap-1">
                          <Truck size={14} className="text-[var(--secondary-foreground)]"/>
                          <span>Carrier: {order.trackingCarrier || 'Delhivery Express'}</span>
                        </span>
                        <span className="font-mono text-[var(--secondary-foreground)]">
                          AWB: {order.trackingNumber || 'PENDING'}
                        </span>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider">
                        <div className="space-y-1">
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center mx-auto">
                            ✓
                          </div>
                          <span className="text-[var(--foreground)]">Confirmed</span>
                        </div>
                        <div className="space-y-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-white ${order.orderStatus !== 'Pending' ? 'bg-[var(--primary)]' : 'bg-gray-300'}`}>
                            ✓
                          </div>
                          <span className={order.orderStatus !== 'Pending' ? 'text-[var(--foreground)]' : 'text-gray-400'}>
                            Processing
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-white ${isShippedOrDelivered ? 'bg-[var(--primary)]' : 'bg-gray-300'}`}>
                            ✓
                          </div>
                          <span className={isShippedOrDelivered ? 'text-[var(--foreground)]' : 'text-gray-400'}>
                            In Transit
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto text-white ${order.orderStatus === 'Delivered' ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                            ✓
                          </div>
                          <span className={order.orderStatus === 'Delivered' ? 'text-emerald-700' : 'text-gray-400'}>
                            Delivered
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Ordered items preview */}
                    <div className="space-y-2 pt-2">
                      {order.items.map((item, idx) => (<div key={idx} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-3">
                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-contain rounded-lg bg-[var(--background)] p-1 border border-[var(--border)]/10"/>
                            <div>
                              <span className="font-bold text-[var(--foreground)]">{item.product.name}</span>
                              <span className="text-[10px] text-[var(--secondary-foreground)] font-semibold block">
                                {item.selectedPack.label} • Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-[var(--foreground)]">
                            ₹{(item.selectedPack.price || item.product.numericPrice) * item.quantity}
                          </span>
                        </div>))}
                    </div>
                  </div>);
            }))}
          </div>)}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (<div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase text-[var(--foreground)]">
                Saved Delivery Addresses
              </h3>
              <button onClick={() => setShowAddAddress(!showAddAddress)} className="px-4 py-2 bg-[var(--primary)] text-white text-xs font-bold uppercase rounded-full flex items-center gap-1.5 shadow-md">
                <Plus size={14}/>
                <span>{showAddAddress ? 'Cancel' : 'Add New Address'}</span>
              </button>
            </div>

            {/* Address form */}
            {showAddAddress && (<form onSubmit={handleCreateAddress} className="bg-white p-6 rounded-3xl border border-[var(--border)]/15 space-y-4">
                <h4 className="text-xs font-black uppercase text-[var(--foreground)]">New Address Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      Address Label (e.g. Home, Office)
                    </label>
                    <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      Recipient Name
                    </label>
                    <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      House / Flat / Street Address *
                    </label>
                    <input type="text" required value={newAddressLine} onChange={(e) => setNewAddressLine(e.target.value)} placeholder="e.g. 402 Lotus Residency, Kankarbagh" className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      City *
                    </label>
                    <input type="text" required value={newCity} onChange={(e) => setNewCity(e.target.value)} placeholder="Patna" className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--foreground)]/70 uppercase mb-1">
                      PIN Code *
                    </label>
                    <input type="text" required value={newPincode} onChange={(e) => setNewPincode(e.target.value)} placeholder="800001" className="w-full px-3 py-2 text-xs bg-[var(--background)] border border-[var(--border)]/20 rounded-lg font-bold"/>
                  </div>
                </div>

                <button type="submit" className="px-6 py-2.5 rounded-full bg-[var(--primary)] text-white text-xs font-black uppercase tracking-wider">
                  Save Address
                </button>
              </form>)}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentUser.addresses.map((addr) => (<div key={addr.id} className="bg-white p-5 rounded-3xl border border-[var(--border)]/15 shadow-xs space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-[var(--foreground)] bg-[var(--background)] px-2.5 py-1 rounded-md border border-[var(--border)]/10">
                      {addr.label}
                    </span>
                    {addr.isDefault && (<span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Default
                      </span>)}
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-[var(--foreground)]">{addr.name}</h4>
                    <p className="text-xs text-[var(--foreground)]/75 font-sans mt-1">{addr.addressLine1}</p>
                    <p className="text-xs text-[var(--foreground)]/75 font-sans">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[11px] text-[var(--foreground)]/60 font-semibold mt-1">Phone: {addr.phone}</p>
                  </div>

                  <div className="pt-2 border-t border-[var(--border)]/10 flex items-center justify-between text-xs font-bold">
                    {!addr.isDefault && (<button onClick={() => setDefaultAddress(addr.id)} className="text-[var(--secondary-foreground)] hover:text-[var(--foreground)] uppercase tracking-wider">
                        Set as Default
                      </button>)}
                    <button onClick={() => deleteAddress(addr.id)} className="text-red-600 hover:text-red-800 ml-auto flex items-center gap-1 uppercase">
                      <Trash2 size={13}/>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>))}
            </div>
          </div>)}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (<div className="bg-white p-8 rounded-3xl border border-[var(--border)]/15 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <Coins size={24}/>
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-[var(--foreground)]">
                  PopCo mCoins Loyalty Program
                </h3>
                <p className="text-xs text-[var(--foreground)]/70 font-sans">
                  Every 1 mCoin equals ₹1 Indian Rupee discount on your next checkout!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10">
                <span className="text-xs font-extrabold text-[var(--secondary-foreground)] uppercase block">Current Balance</span>
                <span className="text-3xl font-black text-[var(--foreground)]">{currentUser.mCoins} Coins</span>
                <span className="text-[10px] text-[var(--foreground)]/60 font-semibold block mt-1">
                  Worth ₹{currentUser.mCoins} Cash Discount
                </span>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10">
                <span className="text-xs font-extrabold text-[var(--secondary-foreground)] uppercase block">Earning Rate</span>
                <span className="text-3xl font-black text-[var(--foreground)]">5% Back</span>
                <span className="text-[10px] text-[var(--foreground)]/60 font-semibold block mt-1">
                  Credited immediately on every order
                </span>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]/10">
                <span className="text-xs font-extrabold text-[var(--secondary-foreground)] uppercase block">Welcome Bonus</span>
                <span className="text-3xl font-black text-emerald-800">100 Coins</span>
                <span className="text-[10px] text-[var(--foreground)]/60 font-semibold block mt-1">
                  Instant reward for new accounts
                </span>
              </div>
            </div>
          </div>)}

        {/* Demo Role Switcher Bar */}
        <div className="p-4 bg-white rounded-2xl border border-[var(--border)]/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[var(--foreground)]/80">
            <ShieldCheck size={16} className="text-[var(--secondary-foreground)]"/>
            <span className="font-bold">Role Simulator:</span>
            <span>Switch active view mode to test role-based access:</span>
          </div>

          <div className="flex items-center gap-2 font-bold">
            <button onClick={() => switchRole('customer')} className={`px-3 py-1 rounded-full border text-[11px] ${currentUser.role === 'customer'
            ? 'bg-[var(--primary)] text-white'
            : 'bg-[var(--background)] text-[var(--foreground)]'}`}>
              Customer
            </button>
            <button onClick={() => switchRole('super_admin')} className={`px-3 py-1 rounded-full border text-[11px] ${currentUser.role === 'super_admin'
            ? 'bg-[var(--secondary-foreground)] text-white'
            : 'bg-[var(--background)] text-[var(--secondary-foreground)]'}`}>
              Super Admin
            </button>
            <Link to="/admin" className="px-3 py-1 bg-[var(--primary)] text-white rounded-full text-[11px] hover:bg-[var(--secondary-foreground)] transition-colors">
              Go to Admin Panel →
            </Link>
          </div>
        </div>
      </div>
    </div>);
};
