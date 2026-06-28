import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { Target, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "motion/react";

export default function Login() {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0C0C0C]">
      {/* Editorial Visual Panel */}
      <div className="relative hidden lg:flex items-center justify-center border-r border-[#222222] p-20 overflow-hidden">
        <div className="absolute inset-0 grayscale opacity-20 contrast-150">
          <img 
            src="https://picsum.photos/seed/editorial/1920/1080?blur=4" 
            alt="Editorial Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 text-center">
          <div className="font-serif italic text-[120px] text-white leading-none tracking-tighter mb-8">
            AdMagic
          </div>
          <div className="space-y-4 max-w-sm mx-auto">
            <span className="panel-label">Autonomous Marketing Platform</span>
            <p className="text-lg text-[#888888] font-serif leading-relaxed italic">
              A high-precision neural laboratory for performance arbitrage.
            </p>
          </div>
        </div>
        <div className="absolute bottom-20 left-20">
          <div className="flex items-center space-x-8">
            <div className="flex items-center text-[10px] uppercase font-bold tracking-widest text-[#BFFF00]">
              <Sparkles className="w-3 h-3 mr-2" />
              AI SYNTHESIS
            </div>
            <div className="flex items-center text-[10px] uppercase font-bold tracking-widest text-[#888888]">
              <Target className="w-3 h-3 mr-2" />
              REAL-TIME CONTROL
            </div>
          </div>
        </div>
      </div>

      {/* Access Panel */}
      <div className="flex items-center justify-center p-12 lg:p-24 relative overflow-hidden">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-20">
            <div className="font-serif italic text-6xl text-white leading-none tracking-tighter mb-4">
              AdMagic
            </div>
          </div>
          <div className="space-y-2 mb-16 text-center lg:text-left">
            <span className="panel-label">Secure Access Protocol</span>
            <h1 className="text-4xl font-bold text-white tracking-tighter font-serif italic italic">Sign In</h1>
          </div>
          
          <div className="space-y-6">
            <button 
              onClick={handleLogin}
              className="btn-editorial w-full py-5 flex items-center justify-center group"
            >
              <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Authenticate with Google</span>
            </button>
            <p className="text-[10px] text-center text-[#888888] uppercase tracking-widest font-bold pt-8">
              By accessing the system, you agree to neural laboratory protocols.
            </p>
          </div>
        </div>

        {/* Branding decoration */}
        <div className="absolute top-10 right-10 text-[10px] uppercase font-bold text-[#888888] tracking-widest leading-none rotate-90 origin-right whitespace-nowrap">
          AD_ENGINE AI LABS // VERSION 2.0.4-B
        </div>
      </div>
    </div>
  );
}
