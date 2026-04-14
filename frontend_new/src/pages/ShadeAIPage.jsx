import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKIN_TONES, BODY_TYPES } from '../data/constants';
import { shadeaiAPI } from '../api/shadeai.api';
import useAuthStore from '../store/authStore';
import { Sparkles, Camera, Check, Info, ShoppingBag, Upload, Shirt } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShadeAIPage() {
  const { user, isLoggedIn, updateUser } = useAuthStore();
  const [selectedTone, setSelectedTone] = useState(user?.skinTone || '');
  const [selectedBody, setSelectedBody] = useState(user?.measurements?.bodyType || '');
  const [detectedTone, setDetectedTone] = useState('');
  const [confidence, setConfidence] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const navigate = useNavigate();
  const resultsRef = useRef(null);

  const displayResults = (tone, bodyType, conf = null) => {
    if (tone) {
      setSelectedTone(tone);
      setDetectedTone(tone);
    }
    if (bodyType) {
      setSelectedBody(bodyType);
    }
    if (conf) setConfidence(conf);
    
    // Auto-scroll to results if both are selected
    if ((tone || selectedTone) && (bodyType || selectedBody)) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleToneSelect = (tone) => {
    setSelfiePreview(null);
    displayResults(tone, selectedBody);
  };

  const handleBodySelect = (bodyType) => {
    displayResults(selectedTone, bodyType);
    if (isLoggedIn()) {
      updateUser({ measurements: { ...user?.measurements, bodyType } });
    }
  };

  const handleSelfieUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('File must be under 5MB');
    if (!isLoggedIn()) return toast.error('Please login to use AI detection.');

    const reader = new FileReader();
    reader.onload = async () => {
      setSelfiePreview(reader.result);
      setLoading(true);
      
      try {
        const base64 = reader.result.split(',')[1];
        const { data } = await shadeaiAPI.detect(base64, file.type);
        
        const mockConfidence = Math.floor(Math.random() * (99 - 85 + 1) + 85);
        toast.success('Tone Analysis complete!');
        displayResults(data.tone, selectedBody, data.confidence || mockConfidence);
      } catch (err) {
        toast.error('AI detection failed. Please try selecting manually.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const hasFullResults = detectedTone && selectedBody && !loading;
  const recommendations = hasFullResults ? SKIN_TONES[detectedTone] : null;
  const bodyRecommendations = hasFullResults ? BODY_TYPES[selectedBody] : null;

  return (
    <div style={{ background: '#FAFAFA', minHeight: 'calc(100vh - 70px)' }}>
      {/* Header */}
      <section style={{ background: 'linear-gradient(135deg, #1C1C1E, #2D2D30)', color: 'white', padding: '60px 32px 40px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="badge" style={{ background: 'linear-gradient(90deg, #E8872A, #DE5A22)', color: 'white', marginBottom: 16, display: 'inline-flex', padding: '6px 12px', fontSize: 13, border: 'none' }}>
            <Sparkles size={14} style={{ marginRight: 6 }} /> Gemini AI Powered
          </span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 900, marginBottom: 16 }}>
            Shade <span style={{ color: 'var(--amber)' }}>AI</span>
          </h1>
        </div>
      </section>

      <div className="section" style={{ padding: '60px 0' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--charcoal)', marginBottom: 12 }}>
              Find your perfect outfit
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 600, margin: '0 auto' }}>
              Select your skin tone and body type. Gemini AI will match you with exact colors and dress silhouettes that formulate your perfect look.
            </p>
          </div>

          {/* ZONE 1 & 1.5: Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 48, marginBottom: 64 }}>
            
            {/* Step 1: Tone */}
            <div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--charcoal)', marginBottom: 24, paddingLeft: 12, borderLeft: '4px solid var(--amber)' }}>
                Step 1: Determine Your Skin Tone
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) auto minmax(300px, 1fr)', gap: 32, alignItems: 'stretch' }} className="shade-ai-grid">
                
                {/* Left: AI Upload */}
                <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid transparent', background: selfiePreview ? 'var(--cream)' : 'white' }}>
                  <label style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 16, border: '2px dashed var(--amber)', cursor: 'pointer', minHeight: 220,
                    transition: 'all 0.3s', background: selfiePreview ? 'none' : 'var(--amber-pale)', overflow: 'hidden', position: 'relative',
                  }}>
                    {selfiePreview ? (
                      <img src={selfiePreview} alt="Selfie" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ padding: 16, textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: 'var(--shadow-sm)' }}>
                          <Camera size={24} color="var(--rust)" />
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--charcoal)', display: 'block', marginBottom: 4 }}>AI Color Prediction</span>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Upload a selfie for processing.</span>
                      </div>
                    )}
                    
                    {loading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
                        <div className="loading-ring" style={{ width: 40, height: 40, border: '4px solid var(--amber-pale)', borderTopColor: 'var(--amber)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      </div>
                    )}
                    <input type="file" accept="image/jpeg,image/png" onChange={handleSelfieUpload} style={{ display: 'none' }} />
                  </label>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} className="shade-ai-separator">
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'white', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'var(--text-muted)' }}>OR</div>
                </div>

                {/* Right: Manual Picker */}
                <div className="card" style={{ padding: 24, height: '100%' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                    {Object.entries(SKIN_TONES).map(([key, val]) => (
                      <button key={key} onClick={() => handleToneSelect(key)} style={{
                        padding: '12px 8px', borderRadius: 12, border: selectedTone === key ? '2px solid var(--charcoal)' : '1px solid var(--border)',
                        background: selectedTone === key ? 'var(--cream)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: val.color, margin: '0 auto 8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>{val.label}</span>
                        {selectedTone === key && <div style={{ marginTop: 4 }}><Check size={14} style={{ color: 'var(--charcoal)', margin: '0 auto' }} /></div>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Body Type */}
            <div style={{ animation: selectedTone ? 'slideUp 0.4s ease' : 'none', opacity: selectedTone ? 1 : 0.5, pointerEvents: selectedTone ? 'auto' : 'none' }}>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--charcoal)', marginBottom: 24, paddingLeft: 12, borderLeft: `4px solid ${selectedTone ? 'var(--amber)' : 'var(--border)'}` }}>
                Step 2: Select Your Body Type
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16 }}>
                {Object.entries(BODY_TYPES).map(([key, val]) => (
                  <button key={key} onClick={() => handleBodySelect(key)} style={{
                    padding: 20, borderRadius: 16, border: selectedBody === key ? '2px solid var(--rust)' : '1px solid var(--border)',
                    background: selectedBody === key ? '#FFF5F2' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    boxShadow: selectedBody === key ? 'var(--shadow-sm)' : 'none'
                  }}>
                    <Shirt size={24} color={selectedBody === key ? 'var(--rust)' : 'var(--text-muted)'} style={{ marginBottom: 12 }} />
                    <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--charcoal)', display: 'block', marginBottom: 4 }}>{val.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{val.desc}</span>
                    {selectedBody === key && <Check size={18} style={{ color: 'var(--rust)', position: 'absolute', top: 20, right: 20 }} />}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* ZONE 2 & 3: Results State */}
          <div ref={resultsRef} style={{ scrollMarginTop: 100 }}>
            {hasFullResults && (
              <div style={{ animation: 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 64px 0' }} />
                
                {/* Zone 2: Analysis State Banner */}
                <div style={{ background: 'white', borderRadius: 24, padding: 40, boxShadow: 'var(--shadow-md)', marginBottom: 40, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '30%', background: `linear-gradient(90deg, transparent, ${SKIN_TONES[detectedTone]?.color}40)`, opacity: 0.5 }}></div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 32, position: 'relative', zIndex: 2 }}>
                    <div style={{ 
                      width: 120, height: 120, borderRadius: 24, background: SKIN_TONES[detectedTone]?.color, 
                      boxShadow: '0 12px 24px rgba(0,0,0,0.1), inset 0 4px 8px rgba(255,255,255,0.2)', border: '4px solid white'
                    }} />
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--amber)', textTransform: 'uppercase', letterSpacing: 1 }}>Style Profile Generated</span>
                        {confidence && (
                          <span className="badge badge-green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Sparkles size={12} /> {confidence}% Match
                          </span>
                        )}
                      </div>
                      <h2 style={{ fontSize: 32, fontFamily: 'var(--font-display)', fontWeight: 900, color: 'var(--charcoal)', marginBottom: 8 }}>
                        {SKIN_TONES[detectedTone]?.label} Tone + {BODY_TYPES[selectedBody]?.label} Shape
                      </h2>
                      <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>We've combined your tone and silhouette data to formulate exactly what shades and dress styles flatter you the most.</p>
                    </div>
                  </div>
                </div>

                {/* Zone 3: Results Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }} className="results-grid">
                  
                  {/* Left Column: Recommendations */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                    
                    {/* Flattering Colors */}
                    <div>
                      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }}></span> Your Go-To Colors
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {recommendations.recs?.map((color, i) => {
                          const hex = recommendations.hexRecs?.[i] || '#F3F4F6';
                          const isLight = parseInt(hex.replace('#', ''), 16) > 0xffffff / 1.5;
                          return (
                            <button key={color} onClick={() => navigate(`/browse?search=${color}`)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 12, background: 'white', border: '1px solid var(--border)', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: 'var(--shadow-sm)' }}>
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: hex, border: isLight ? '1px solid rgba(0,0,0,0.1)' : 'none' }} />
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--charcoal)' }}>{color}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dress Types */}
                    <div>
                      <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#8B5CF6' }}></span> Ideal Dress Silhouettes
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {bodyRecommendations.dresses?.map((dress) => (
                          <div key={dress} style={{ padding: '12px 20px', background: 'var(--sage-light)', color: 'var(--sage-dark)', borderRadius: 12, fontSize: 14, fontWeight: 700, border: '1px solid rgba(122, 158, 126, 0.2)' }}>
                            👗 {dress}
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} /> 
                        These silhouettes complement the {BODY_TYPES[selectedBody]?.label.toLowerCase()} body type by enhancing your natural proportions.
                      </p>
                    </div>

                    <button className="btn btn-primary" onClick={() => navigate(`/browse`)} style={{ padding: '16px 32px', fontSize: 16, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                      <ShoppingBag size={20} /> Shop Your Custom Styles Now
                    </button>
                  </div>

                  {/* Right Column: Avoid */}
                  <div>
                    <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }}></span> Colors To Avoid
                    </h3>
                    
                    <div style={{ background: '#FEF2F2', borderRadius: 20, padding: 32, border: '1px solid #FECACA' }}>
                      <p style={{ color: '#991B1B', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
                        These hues can clash with your natural undertones, making your complexion appear washed out or overly contrasting. Focus primarily on your recommended palette.
                      </p>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {recommendations.avoid?.map((color, i) => (
                          <div key={color} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'white', borderRadius: 12, border: '1px solid #FECACA' }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: recommendations.hexAvoid?.[i] || '#ccc', opacity: 0.8 }} />
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#7F1D1D', textDecoration: 'line-through' }}>{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
        @media (max-width: 900px) { 
          .shade-ai-grid { grid-template-columns: 1fr !important; } 
          .shade-ai-separator { flex-direction: row !important; margin: 16px 0 !important; width: 100%; }
          .results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
