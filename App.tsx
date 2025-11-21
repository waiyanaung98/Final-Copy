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

      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-8">
        
        <div className="space-y-8">
          
          {/* INPUT SECTION: Stacked Vertically */}
          <div className="space-y-6">
            
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

          {/* OUTPUT SECTION: Appears Below Inputs */}
          <div ref={resultRef} className="pt-4">
            {generatedContent ? (
              <div className="animate-fade-in">
                 <OutputDisplay 
                  content={generatedContent} 
                  currentUiLang={uiLanguage}
                  outputLang={formData.language}
                  onClear={handleClear}
                />
              </div>
            ) : (
              /* Subtle Empty State */
              <div className="py-12 border-t-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                   </svg>
                </div>
                <p className="text-slate-400 dark:text-slate-500 text-sm">
                  Generated content will appear here
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