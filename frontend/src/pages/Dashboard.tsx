import React from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: '₹4,52,380', icon: TrendingUp, trend: '+12.5%', isUp: true },
          { label: 'Bills Today', value: '142', icon: ShoppingCart, trend: '+3.2%', isUp: true },
          { label: 'New Customers', value: '28', icon: Users, trend: '-2.1%', isUp: false },
          { label: 'Low Stock Items', value: '15', icon: Package, trend: '+4', isUp: false },
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-outline-variant p-5 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-outline uppercase tracking-wider">{stat.label}</span>
              <stat.icon size={18} className="text-primary" />
            </div>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-2xl font-mono font-black">{stat.value}</span>
              <div className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-green-600' : 'text-red-600'}`}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-outline-variant p-6 min-h-[400px]">
          <h3 className="text-sm font-bold uppercase mb-4 tracking-widest border-l-4 border-primary pl-3">Recent Transactions</h3>
          <div className="overflow-x-auto mt-6">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-[10px] font-bold uppercase tracking-widest text-outline">
                  <th className="p-3 border border-outline-variant">Bill No</th>
                  <th className="p-3 border border-outline-variant">Customer</th>
                  <th className="p-3 border border-outline-variant">Items</th>
                  <th className="p-3 border border-outline-variant text-right">Amount</th>
                  <th className="p-3 border border-outline-variant">Status</th>
                </tr>
              </thead>
              <tbody className="font-mono text-sm">
                {[
                  { id: 'BL-9021', customer: 'WALK-IN', items: 3, amount: '₹1,240.00', status: 'PAID' },
                  { id: 'BL-9022', customer: 'RAJESH KUMAR', items: 12, amount: '₹8,920.50', status: 'PAID' },
                  { id: 'BL-9023', customer: 'ANITA SINGH', items: 1, amount: '₹450.00', status: 'PENDING' },
                  { id: 'BL-9024', customer: 'WALK-IN', items: 5, amount: '₹2,310.00', status: 'PAID' },
                  { id: 'BL-9025', customer: 'SURESH MEHTA', items: 8, amount: '₹14,500.00', status: 'PAID' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors cursor-pointer">
                    <td className="p-3 border border-outline-variant font-bold text-primary">{row.id}</td>
                    <td className="p-3 border border-outline-variant">{row.customer}</td>
                    <td className="p-3 border border-outline-variant">{row.items}</td>
                    <td className="p-3 border border-outline-variant text-right">{row.amount}</td>
                    <td className="p-3 border border-outline-variant">
                      <span className={`px-2 py-0.5 text-[10px] font-bold ${row.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface border border-outline-variant p-6">
          <h3 className="text-sm font-bold uppercase mb-4 tracking-widest border-l-4 border-primary pl-3">Top Selling Categories</h3>
          <div className="space-y-6 mt-8">
            {[
              { label: 'Mens Apparel', value: 45, color: 'bg-primary' },
              { label: 'Womens Ethnic', value: 32, color: 'bg-primary/70' },
              { label: 'Footwear', value: 18, color: 'bg-primary/50' },
              { label: 'Accessories', value: 5, color: 'bg-primary/30' },
            ].map((cat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                  <span>{cat.label}</span>
                  <span className="font-mono">{cat.value}%</span>
                </div>
                <div className="h-2 bg-surface-container w-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: `${cat.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
