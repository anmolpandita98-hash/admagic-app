import React, { ReactNode, useState } from "react";
import { 
  LayoutDashboard, 
  Megaphone, 
  BarChart3, 
  Users, 
  Briefcase, 
  ReceiptText, 
  Settings, 
  Bell, 
  Search, 
  ChevronDown,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Menu,
  Sparkles,
  Target,
  FileBarChart,
  FileText,
  UserPlus,
  ShieldAlert,
  HelpCircle,
  CreditCard,
  Gift,
  MoreVertical,
  ExternalLink,
  History,
  CheckSquare,
  Zap,
  Brain,
  MonitorPlay
} from "lucide-react";
import { useAuth } from "../AuthContext";
import { auth } from "../firebase";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";

export default function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setProfileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f7fa]">
      {/* Trackier Left Sidebar */}
      <aside className="w-[260px] bg-[#1ea4d9] flex flex-col flex-shrink-0 z-40">
        <div className="h-[64px] flex items-center px-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-md flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight uppercase">AdMagic</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <SidebarLink to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === "/"} />
          
          <SidebarDropdown 
            icon={Megaphone} 
            label="Campaigns" 
            active={location.pathname.startsWith("/campaigns")}
            links={[
              { to: "/campaigns/manage", label: "Manage Campaigns" },
              { to: "/campaigns/create", label: "Create Campaign" },
              { to: "/campaigns/wizard", label: "Campaign Wizard" },
              { to: "/campaigns/tracking-link", label: "Tracking Link" },
              { to: "/campaigns/access", label: "Campaign Access" },
              { to: "/campaigns/traffic-channels", label: "Allowed Traffic Channels" },
              { to: "/campaigns/creatives", label: "Creatives" },
              { to: "/campaigns/offer-check", label: "Offer Check" },
              { to: "/campaigns/coupons", label: "Coupon Codes + Deals" },
              { to: "/campaigns/global-goals", label: "Global Goals" },
              { to: "/campaigns/featured", label: "Featured Campaigns" },
              { to: "/campaigns/skadnetwork", label: "Skadnetwork Test" },
              { to: "/campaigns/bulk", label: "Bulk Targeting" }
            ]}
          />

          <SidebarDropdown 
            icon={BarChart3} 
            label="Reports" 
            active={location.pathname.startsWith("/reports")}
            links={[
              { to: "/reports/campaign", label: "Campaigns Report" },
              { to: "/reports/publisher", label: "Publishers Report" },
              { to: "/reports/advertiser", label: "Advertisers Report" },
              { to: "/reports/daily", label: "Daily Report" },
              { to: "/reports/goal", label: "Goals Report" },
              { to: "/reports/hourly", label: "Hourly Report" },
              { to: "/reports/subid", label: "SubID / TimeZone Report" },
              { to: "/reports/cohort", label: "Cohort Report" },
              { to: "/reports/additional", label: "Additional Reports" },
              { to: "/reports/click", label: "Click Report" },
              { to: "/reports/conversion", label: "Conversion Report" },
              { to: "/reports/impression", label: "Impression Report" }
            ]}
          />

          <SidebarDropdown 
            icon={FileBarChart} 
            label="Saved Reports" 
            links={[
              { to: "/reports", label: "Custom Views" }
            ]}
          />

          <SidebarDropdown 
            icon={Users} 
            label="Publishers" 
            active={location.pathname.startsWith("/publishers")}
            links={[
              { to: "/publishers", label: "Manage" },
              { to: "/publishers/add", label: "Add New" }
            ]}
          />

          <SidebarDropdown 
            icon={Briefcase} 
            label="Advertisers" 
            active={location.pathname.startsWith("/advertisers")}
            links={[
              { to: "/advertisers", label: "Manage" },
              { to: "/advertisers/add", label: "Add New" }
            ]}
          />

          <SidebarDropdown 
            icon={ReceiptText} 
            label="Invoices" 
            active={location.pathname === "/invoices"}
            links={[
              { to: "/invoices", label: "All Invoices" }
            ]}
          />

          <SidebarDropdown 
            icon={Zap} 
            label="Automation" 
            active={location.pathname.startsWith("/automation")}
            links={[
              { to: "/automation/integrations", label: "Integrations" },
              { to: "/automation/ecommerce", label: "E-Commerce" },
              { to: "/automation/workflow", label: "Workflow Automation" },
              { to: "/automation/anti-fraud", label: "Anti-Fraud Tools" },
              { to: "/automation/data-imports", label: "Data Imports" },
              { to: "/automation/ftp-uploads", label: "FTP Uploads" },
              { to: "/automation/filter-rules", label: "Filter Rules" },
              { to: "/automation/auto-checker", label: "Auto Checker" },
              { to: "/automation/link-test", label: "Link Test Tools" },
              { to: "/automation/global-checker", label: "Global Checker" },
              { to: "/automation/smart-link", label: "Smart Link" },
              { to: "/automation/alerts", label: "Alerts" },
              { to: "/automation/api", label: "API" }
            ]}
          />

          <SidebarDropdown 
            icon={Brain} 
            label="Neuro Labs" 
            active={location.pathname.startsWith("/creative-lab")}
            links={[
              { to: "/creative-lab/neuro-analysis", label: "Neuro Creative Scan" }
            ]}
          />
          
          <SidebarLink to="/customize" icon={Settings} label="Customize" active={location.pathname === "/customize"} />
          
          <SidebarLink to="/notifications" icon={Bell} label="Notification" />
          
          <SidebarLink to="/support" icon={HelpCircle} label="Support" />
          
          <SidebarLink to="/billing" icon={CreditCard} label="Billing" />
        </nav>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[64px] bg-white border-b border-[#e2e8f0] flex items-center justify-between px-8 flex-shrink-0 z-30">
          <div className="flex items-center space-x-4">
            <button className="text-[#64748b] hover:text-[#1ea4d9]">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-[#1e293b]">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-[#f1f5f9] px-3 py-1.5 rounded-md border border-[#e2e8f0]">
              <Search className="w-4 h-4 text-[#64748b] mr-2" />
              <input type="text" placeholder="Search..." className="bg-transparent text-sm focus:outline-none w-48" />
            </div>

            <button className="relative text-[#64748b] hover:text-[#1ea4d9]">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <button className="text-[#64748b] hover:text-[#1ea4d9]">
              <Gift className="w-5 h-5" />
            </button>

            <div className="relative">
              <button 
                onClick={() => setProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 text-[#64748b] hover:text-[#1ea4d9]"
              >
                <div className="w-8 h-8 rounded-full border-2 border-[#1ea4d9] p-0.5 flex items-center justify-center overflow-hidden bg-white">
                  <Sparkles className="w-full h-full text-[#1ea4d9]" />
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0" onClick={() => setProfileOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white border border-[#e2e8f0] shadow-xl rounded-lg py-4 z-50 overflow-hidden"
                    >
                      <div className="px-6 py-2 border-b border-[#f1f5f9] mb-2">
                        <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-widest">Demo Account</span>
                      </div>
                      <div className="space-y-0.5">
                        <DropdownItem to="/profile" icon={UserIcon} label="Profile" onClick={() => setProfileOpen(false)} />
                        <DropdownItem to="/team" icon={Users} label="Team Members" onClick={() => setProfileOpen(false)} />
                        <DropdownItem to="/audit-log" icon={History} label="Data Audit Log" onClick={() => setProfileOpen(false)} />
                        <DropdownItem to="/approvals" icon={UserPlus} label="Approval Requests" onClick={() => setProfileOpen(false)} />
                        <DropdownItem to="/maker-checker" icon={CheckSquare} label="Maker Checker" onClick={() => setProfileOpen(false)} />
                        <DropdownItem to="/security" icon={ShieldAlert} label="Security Control" onClick={() => setProfileOpen(false)} />
                        <DropdownItem to="/billing" icon={CreditCard} label="Billing" onClick={() => setProfileOpen(false)} />
                        <DropdownItem to="/support" icon={HelpCircle} label="Support" onClick={() => setProfileOpen(false)} />
                        <div className="px-6 py-2">
                          <button 
                            onClick={() => auth.signOut()}
                            className="flex items-center w-full text-sm text-red-500 hover:text-red-600 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const SidebarLink = ({ to, icon: Icon, label, active, isExternal }: any) => {
  const content = (
    <>
      <Icon className="w-4 h-4 mr-3" />
      <span className="flex-1">{label}</span>
      {isExternal && <ExternalLink className="w-3 h-3 ml-2 opacity-50" />}
    </>
  );

  return (
    <Link 
      to={to || "#"} 
      className={`sidebar-link ${active ? "active" : ""}`}
    >
      {content}
    </Link>
  );
};

const SidebarDropdown = ({ icon: Icon, label, links, active }: any) => {
  const [isOpen, setIsOpen] = useState(active);
  const location = useLocation();

  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center px-6 py-3 text-sm transition-all border-l-4 border-transparent ${
          active ? "bg-black/10 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
        }`}
      >
        <Icon className="w-4 h-4 mr-3" />
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/20 overflow-hidden"
          >
            {links.map((link: any, i: number) => (
              <Link 
                key={i}
                to={link.to} 
                className={`flex items-center pl-14 py-2 text-[13px] transition-all hover:text-white ${
                  location.pathname === link.to ? "text-white font-bold" : "text-white/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DropdownItem = ({ to, icon: Icon, label, onClick }: any) => (
  <Link 
    to={to} 
    onClick={onClick}
    className="flex items-center px-6 py-2.5 text-sm text-[#475569] hover:bg-[#f8fafc] hover:text-[#1ea4d9] transition-all"
  >
    <Icon className="w-4 h-4 mr-3 text-[#94a3b8]" />
    {label}
  </Link>
);
