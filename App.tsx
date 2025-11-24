
import React, { useEffect, useState } from 'react';
import { db, auth } from './firebase';
import { ref, onValue } from 'firebase/database';
import { User, ViewState } from './types';
import { HomeView } from './components/HomeView';
import { WalletView } from './components/WalletView';
import { TeamView } from './components/TeamView';
import { ProfileView } from './components/ProfileView';
import { LevelView } from './components/LevelView';
import { ReferralStructure } from './components/ReferralStructure';
import { BottomNav } from './components/BottomNav';
import { Auth } from './components/Auth';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>(ViewState.HOME);

  useEffect(() => {
    let unsubDB: (() => void) | undefined;
    const legacyUid = localStorage.getItem('legacy_uid');
    
    const unsubscribeAuth = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        if (unsubDB) unsubDB(); 
        const userRef = ref(db, 'users/' + authUser.uid);
        unsubDB = onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setCurrentUser(snapshot.val());
            localStorage.removeItem('legacy_uid');
          }
          setLoading(false);
        });
      } else {
        if (legacyUid) {
           const userRef = ref(db, 'users/' + legacyUid);
           unsubDB = onValue(userRef, (snapshot) => {
                if (snapshot.exists()) {
                    setCurrentUser(snapshot.val());
                } else {
                    localStorage.removeItem('legacy_uid');
                    setCurrentUser(null);
                }
                setLoading(false);
           });
        } else {
            setCurrentUser(null);
            setLoading(false);
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubDB) unsubDB();
    };
  }, []);

  const handleLegacyLogin = (uid: string) => {
      localStorage.setItem('legacy_uid', uid);
      setLoading(true);
      const userRef = ref(db, 'users/' + uid);
      onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
            setCurrentUser(snapshot.val());
        }
        setLoading(false);
      }, { onlyOnce: true });
  };

  const handleLogout = () => {
      localStorage.removeItem('legacy_uid');
      auth.signOut();
      setCurrentUser(null);
      setView(ViewState.HOME);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-violet-600" size={32} />
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onLogin={handleLegacyLogin} />;
  }

  const renderView = () => {
    switch(view) {
      case ViewState.HOME:
        return <HomeView user={currentUser} onLogout={handleLogout} onNavigate={setView} />;
      case ViewState.WALLET:
        return <WalletView user={currentUser} />;
      case ViewState.REFERRALS:
        return <TeamView currentUser={currentUser} />;
      case ViewState.STRUCTURE:
        return <ReferralStructure />;
      case ViewState.PROFILE:
        return <ProfileView user={currentUser} onBack={() => setView(ViewState.HOME)} />;
      case ViewState.LEVELS:
        return <LevelView user={currentUser} onBack={() => setView(ViewState.HOME)} />;
      default:
        return <HomeView user={currentUser} onLogout={handleLogout} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative">
         <main className="p-4 overflow-y-auto h-screen pb-24 scrollbar-hide">
            {renderView()}
         </main>
         {view !== ViewState.PROFILE && view !== ViewState.LEVELS && (
            <div className="absolute bottom-0 w-full">
              <BottomNav currentView={view} onChangeView={setView} />
            </div>
         )}
      </div>
    </div>
  );
}
