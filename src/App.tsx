/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Campaigns from "./components/Campaigns";
import AIInsights from "./components/AIInsights";
import Reports from "./components/Reports";
import Login from "./components/Login";
import Settings from "./components/Settings";

import Advertisers from "./components/Advertisers";
import Publishers from "./components/Publishers";

import Customization from "./components/Customization";
import GenericSection from "./components/GenericSection";
import CouponCodes from "./components/CouponCodes";
import GlobalGoals from "./components/GlobalGoals";
import TeamManagement from "./components/TeamManagement";
import Approvals from "./components/Approvals";
import Creatives from "./components/Creatives";
import BulkTargeting from "./components/BulkTargeting";
import SkanTest from "./components/SkanTest";
import OfferCheck from "./components/OfferCheck";
import TrackingLink from "./components/TrackingLink";
import CampaignAccess from "./components/CampaignAccess";
import FeaturedCampaigns from "./components/FeaturedCampaigns";
import TrafficChannels from "./components/TrafficChannels";
import SmartLink from "./components/SmartLink";
import ApiDocs from "./components/ApiDocs";
import Integrations from "./components/automation/Integrations";
import Ecommerce from "./components/automation/Ecommerce";
import NeuroCreativeLab from "./components/NeuroCreativeLab";
import Workflows from "./components/automation/Workflows";
import AntiFraud from "./components/automation/AntiFraud";
import DataImports from "./components/automation/DataImports";
import FTPUploads from "./components/automation/FTPUploads";
import FilterRules from "./components/automation/FilterRules";
import GlobalChecker from "./components/automation/GlobalChecker";
import LinkTestTools from "./components/automation/LinkTestTools";
import Alerts from "./components/automation/Alerts";
import { 
  Users, 
  History, 
  ReceiptText, 
  HelpCircle, 
  CreditCard,
  UserCircle,
  Wand2,
  Link2,
  Lock,
  Route as RouteIcon,
  Image as ImageIcon,
  ShieldCheck,
  Ticket,
  Trophy,
  Zap,
  Smartphone,
  Layers,
  Megaphone,
  Terminal,
  Filter,
  Globe,
  Layout as LayoutIcon
} from "lucide-react";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fa] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Layout>{children}</Layout>;
};

function AppContent() {
  const { user, loading } = useAuth();

    if (loading) return <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f7fa'}}><div style={{width:'48px',height:'48px',border:'4px solid #2563eb',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div></div>;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/manage"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/create"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/wizard"
        element={
          <ProtectedRoute>
            <GenericSection title="Campaign Wizard" description="Step-by-step assistant to launch optimized ad directives." icon={Wand2} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/tracking-link"
        element={
          <ProtectedRoute>
            <TrackingLink />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/access"
        element={
          <ProtectedRoute>
            <CampaignAccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/traffic-channels"
        element={
          <ProtectedRoute>
            <TrafficChannels />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/creatives"
        element={
          <ProtectedRoute>
            <Creatives />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/offer-check"
        element={
          <ProtectedRoute>
            <OfferCheck />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/coupons"
        element={
          <ProtectedRoute>
            <CouponCodes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/global-goals"
        element={
          <ProtectedRoute>
            <GlobalGoals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/featured"
        element={
          <ProtectedRoute>
            <FeaturedCampaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/skadnetwork"
        element={
          <ProtectedRoute>
            <SkanTest />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns/bulk"
        element={
          <ProtectedRoute>
            <BulkTargeting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publishers"
        element={
          <ProtectedRoute>
            <Publishers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/publishers/add"
        element={
          <ProtectedRoute>
            <Publishers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advertisers"
        element={
          <ProtectedRoute>
            <Advertisers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/advertisers/add"
        element={
          <ProtectedRoute>
            <Advertisers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/integrations"
        element={
          <ProtectedRoute>
            <Integrations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/ecommerce"
        element={
          <ProtectedRoute>
            <Ecommerce />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/workflow"
        element={
          <ProtectedRoute>
            <Workflows />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/anti-fraud"
        element={
          <ProtectedRoute>
            <AntiFraud />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/data-imports"
        element={
          <ProtectedRoute>
            <DataImports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/ftp-uploads"
        element={
          <ProtectedRoute>
            <FTPUploads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/filter-rules"
        element={
          <ProtectedRoute>
            <FilterRules />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/auto-checker"
        element={
          <ProtectedRoute>
            <OfferCheck />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/link-test"
        element={
          <ProtectedRoute>
            <LinkTestTools />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/global-checker"
        element={
          <ProtectedRoute>
            <GlobalChecker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/smart-link"
        element={
          <ProtectedRoute>
            <SmartLink />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/alerts"
        element={
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/automation/api"
        element={
          <ProtectedRoute>
            <ApiDocs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customize"
        element={
          <ProtectedRoute>
            <Customization />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <GenericSection title="Invoices" description="Manage billing records and payment receipts." icon={ReceiptText} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <ProtectedRoute>
            <GenericSection title="Billing" description="Configure payment methods and usage limits." icon={CreditCard} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <TeamManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/approvals"
        element={
          <ProtectedRoute>
            <Approvals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute>
            <GenericSection title="Data Audit Logs" description="Historical record of system activities and changes." icon={History} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <GenericSection title="Account Profile" description="Update your personal details and security settings." icon={UserCircle} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/support"
        element={
          <ProtectedRoute>
            <GenericSection title="Help & Support" description="Access documentation or contact our engineering desk." icon={HelpCircle} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/:type"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={<Navigate to="/reports/campaign" />}
      />
      <Route
        path="/ai-insights"
        element={
          <ProtectedRoute>
            <AIInsights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/creative-lab/neuro-analysis"
        element={
          <ProtectedRoute>
            <NeuroCreativeLab />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'#f5f7fa',padding:'2rem'}}>
          <h1 style={{fontSize:'1.5rem',fontWeight:700,color:'#1e293b',marginBottom:'0.5rem'}}>Something went wrong</h1>
          <p style={{color:'#64748b',marginBottom:'1.5rem'}}>{this.state.error?.message}</p>
          <button onClick={()=>{ this.setState({hasError:false,error:null}); window.location.href='/'; }} style={{padding:'0.5rem 1.5rem',background:'#2563eb',color:'#fff',border:'none',borderRadius:'0.5rem',cursor:'pointer',fontWeight:600}}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}


export default function App() {
  return (
<ErrorBoundary>
          <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
        </ErrorBoundary>
  );
}
