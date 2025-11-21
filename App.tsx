import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { FrameworkSelector } from './components/FrameworkSelector';
import { InputForm } from './components/InputForm';
import { OutputDisplay } from './components/OutputDisplay';
import { BrandManager } from './components/BrandManager';
import { Language, Framework, Tone, ContentRequest, ContentPillar, BrandProfile } from './types';
import { generateCopy } from './services/geminiService';
import { TRANSLATIONS, DEFAULT_BRANDS } from './constants';

const App: React.FC = () => {
  // UI Language default to English
  const [uiLanguage] = useState<Language>(Language.EN);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  // Brand State
  const [brands, setBrands] = useState<BrandProfile[]>(DEFAULT_BRANDS);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState<ContentRequest>({
    topic: '',
    description: '',
    framework: Framework.AIDA,
    pillar: ContentPillar.PROMOTIONAL,
    language: Language.EN,
    tone: Tone.PROFESSIONAL,
    targetAudience: ''
  });

  // Scroll to results when generated
  const resultRef = useRef<HTMLDivElement>(null);

  // Effect: Handle Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect: When brand changes, update formData defaults
  useEffect(() => {
    if (selectedBrandId) {
      const brand = brands.find(b => b.id === selectedBrandId);
      if (brand) {
        setFormData(prev => ({
          ...prev,
          tone: brand.defaultTone,
          targetAudience: brand.defaultAudience,
          brand: brand // Attach brand object to request for AI context
        }));
      }
    } else {
      // Reset brand context if deselected
      setFormData(prev => ({ ...prev, brand: undefined }));
    }
  }, [selectedBrandId, brands]);

  const handleAddBrand = (newBrand: BrandProfile) => {
    setBrands(prev => [...prev, newBrand]);
    setSelectedBrandId(newBrand.id); // Auto select the new brand
  };

  const handleDeleteBrand = (brandId: string) => {
    setBrands(prev => prev.filter(b => b.id !== brandId));
    if (selectedBrandId === brandId) {
      setSelectedBrandId(null);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedContent(null); // Clear previous while loading
    
    try {
      const result = await generateCopy(formData);
      setGeneratedContent(result);
      
      // Scroll to result after a brief delay for render
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setGeneratedContent(null);
    setFormData(prev => ({ 
      ...prev, 
      topic: '', 
      description: '',
      // Keep target audience if brand is selected, otherwise clear
      targetAudience: selectedBrandId ? prev.targetAudience : ''
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex flex-col font-sans transition-colors duration-300">
      <Header 
        currentLang={uiLanguage} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)} 
      />

      <main className="flex-grow max-w-5xl mx-auto px-4 py-8 w-full">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Brand Manager Section */}
            <section>
              <BrandManager 
                brands={brands}
                selectedBrandId={selectedBrandId}
                onSelectBrand={setSelectedBrandId}
                onAddBrand={handleAddBrand}
                onDeleteBrand={handleDeleteBrand}
                currentLang={uiLanguage}
              />
            </section>

            {/* Framework Selection */}
            <section>
              <FrameworkSelector 
                selected={formData.framework} 
                onSelect={(fw) => setFormData(prev => ({ ...prev, framework: fw }))}
                currentLang={uiLanguage}
              />
            </section>

            {/* Input Form */}
            <section>
              <InputForm 
                request={formData} 
                onChange={setFormData} 
                onSubmit={handleGenerate}
                isLoading={loading}
                currentUiLang={uiLanguage}
                selectedBrand={brands.find(b => b.id === selectedBrandId)}
              />
            </section>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7" ref={resultRef}>
            {generatedContent ? (
              <OutputDisplay 
                content={generatedContent} 
                currentUiLang={uiLanguage}
                outputLang={formData.language}
                onClear={handleClear}
              />
            ) : (
              /* Empty State Placeholder */
              <div className="h-full min-h-[400px] bg-white dark:bg-[#1E2A38] rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500 sticky top-24 transition-colors">
                <div className="w-16 h-16 bg-slate-50 dark:bg-[#0f172a] rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#1E2A38] dark:text-white mb-2">Ready to Create</h3>
                <p className="max-w-xs mx-auto text-sm text-slate-500 dark:text-slate-400">
                  Select a framework, choose your <strong>Content Pillar</strong> and <strong>Language</strong>, and let the AI do the rest.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
      
      {/* Footer with Branding */}
      <footer className="py-6 text-center border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1E2A38] mt-auto transition-colors">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Powered by <span className="text-[#1E2A38] dark:text-[#31d190] font-bold">PrimeNova Digital Solution</span>
        </p>
      </footer>
    </div>
  );
};

export default App;