import React from 'react';
import { 
  Code2, 
  Hand, 
  Languages, 
  LayoutDashboard, 
  FolderKanban, 
  Bot, 
  GraduationCap, 
  BookOpen, 
  User, 
  Sparkles,
  Terminal,
  LogOut
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  islMode, 
  setIslMode, 
  currentLang, 
  setCurrentLang,
  userRole,
  setUserRole,
  userName,
  setUserName
}) {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी (Hindi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕன்னಡ (Kannada)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' }
  ];

  const leftNavItems = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects Hub', icon: FolderKanban },
    { id: 'my-workspace', label: 'My Workspace', icon: Terminal },
    { id: 'ai-mentor', label: 'AI Mentor', icon: Bot },
    { id: 'teacher', label: 'Teacher Portal', icon: GraduationCap },
  ];

  const academicsItem = { id: 'ncert', label: 'Academics', icon: BookOpen };

  const handleLogout = () => {
    setUserName('');
    localStorage.removeItem('codeseekho_username');
    setCurrentTab('landing');
  };

  const renderNavButton = (item, isAcademics = false) => {
    const Icon = item.icon;
    const isActive = currentTab === item.id;
    const isAuthorized = item.id !== 'teacher' || userRole === 'teacher';
    const isLocked = !userName;

    if (!isAuthorized) return null;

    if (isAcademics) {
      return (
        <button
          key={item.id}
          onClick={() => !isLocked && setCurrentTab(item.id)}
          disabled={isLocked}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            color: isLocked ? 'var(--text-faint)' : isActive ? '#FFFFFF' : '#7C3AED',
            backgroundColor: isLocked ? 'var(--bg-card)' : isActive ? 'var(--accent)' : 'rgba(139, 92, 246, 0.08)',
            border: isActive ? '1.5px solid var(--accent)' : '1px solid #A78BFA',
            boxShadow: isActive ? '0 2px 8px rgba(200, 75, 36, 0.3)' : '0 1px 3px rgba(139, 92, 246, 0.15)',
            transition: 'all 0.15s ease',
            cursor: isLocked ? 'not-allowed' : 'pointer',
            opacity: isLocked ? 0.45 : 1,
            marginLeft: '8px'
          }}
          title={isLocked ? "Log in to unlock this dashboard" : ""}
        >
          <Icon size={16} color={isLocked ? 'var(--text-faint)' : isActive ? '#FFFFFF' : '#7C3AED'} />
          <span>{item.label}</span>
          <span style={{
            fontSize: '9px',
            fontWeight: '800',
            padding: '1px 5px',
            borderRadius: '10px',
            backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : '#7C3AED',
            color: '#FFFFFF',
            marginLeft: '2px',
            letterSpacing: '0.5px'
          }}>
            NCERT
          </span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => !isLocked && setCurrentTab(item.id)}
        disabled={isLocked}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '5px 9px',
          borderRadius: 'var(--radius-md)',
          fontSize: '12px',
          fontWeight: isActive ? '700' : '600',
          whiteSpace: 'nowrap',
          color: isLocked ? 'var(--text-faint)' : isActive ? 'var(--accent)' : 'var(--text-main)',
          backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-card)',
          border: isActive ? '1.5px solid var(--accent)' : '1px solid var(--border-medium)',
          boxShadow: isActive ? '0 1px 3px rgba(200, 75, 36, 0.15)' : 'var(--shadow-sm)',
          transition: 'all 0.15s ease',
          cursor: isLocked ? 'not-allowed' : 'pointer',
          opacity: isLocked ? 0.45 : 1
        }}
        title={isLocked ? "Log in to unlock this dashboard" : ""}
      >
        <Icon size={15} color={isLocked ? 'var(--text-faint)' : isActive ? 'var(--accent)' : 'var(--text-muted)'} />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <header style={{
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-light)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Upper sub-bar for ISL Status & Problem Statement */}
      <div style={{
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-light)',
        padding: '6px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#16A34A',
              display: 'inline-block'
            }}></span>
            Backend Live: <strong style={{ color: 'var(--accent)' }}>decode-sih-2026.onrender.com</strong>
          </div>
          <span>•</span>
          <span>Problem Statement: <strong>Inclusive Education AI</strong></span>
        </div>

        {/* Header content on the right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* ISL Toggle Switch */}
          <button 
            onClick={() => setIslMode(!islMode)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: islMode ? '#FEF3C7' : 'var(--bg-card)',
              color: islMode ? '#92400E' : 'var(--text-muted)',
              border: islMode ? '1px solid #FCD34D' : '1px solid var(--border-medium)',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Toggle Indian Sign Language gesture video support"
          >
            <Hand size={14} color={islMode ? '#D97706' : 'currentColor'} />
            <span>ISL Video Support:</span>
            <span style={{ color: islMode ? '#B45309' : 'var(--text-main)', fontWeight: '700' }}>
              {islMode ? 'ON 🤟' : 'OFF'}
            </span>
          </button>

          {/* Regional Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Languages size={14} color="var(--text-faint)" />
            <select
              value={currentLang}
              onChange={(e) => setCurrentLang(e.target.value)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-main)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div style={{
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        maxWidth: '1600px',
        margin: '0 auto',
        gap: '8px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            flexShrink: 0
          }}>
            <Code2 size={20} strokeWidth={2.5} style={{ display: 'block' }} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              CodeSeekho <span style={{ color: 'var(--accent)' }}>AI</span>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-faint)', marginTop: '-2px', whiteSpace: 'nowrap' }}>
              Inclusive CS Education Platform
            </div>
          </div>
        </div>

        {/* Left Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'nowrap' }}>
          {leftNavItems.map(item => renderNavButton(item, false))}
        </nav>

        {/* Right Section: Academics (Highlighted) & User Role / Quick Landing Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {renderNavButton(academicsItem, true)}

          <button
            onClick={() => setCurrentTab('landing')}
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: 'var(--text-muted)',
              padding: '5px 9px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              backgroundColor: 'var(--bg-card)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Landing View
          </button>

          {userName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 9px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-medium)',
                fontSize: '11px',
                fontWeight: '700',
                whiteSpace: 'nowrap'
              }}>
                <User size={14} color="var(--accent)" />
                <span>{userName} {userRole === 'teacher' ? '(Teacher)' : ''}</span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#EF4444',
                  cursor: 'pointer'
                }}
                title="Logout"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed var(--border-medium)',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-muted)',
              whiteSpace: 'nowrap'
            }}>
              <User size={14} />
              <span>Not Logged In</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
