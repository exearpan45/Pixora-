import React, { useState, useEffect } from 'react';
import { ExifData, ActiveTool } from './types';
import { parseExifMetadata } from './utils/exif';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { UploadZone } from './components/UploadZone';
import { ImageWorkspace } from './components/ImageWorkspace';
import { BatchStudio } from './components/BatchStudio';
import { ToolsDirectory } from './components/ToolsDirectory';
import { RecentWork } from './components/RecentWork';
import { SeoGuides } from './components/SeoGuides';
import { AboutModal } from './components/AboutModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SampleItem } from './constants/samples';
import { LayoutGrid, Layers, Clock, BookOpen, Info, Image as ImageIcon } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'workspace' | 'tools' | 'batch' | 'recent' | 'guides' | 'about'>('workspace');
  
  // Active Image State
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [activeSrc, setActiveSrc] = useState<string>('');
  const [activeFileName, setActiveFileName] = useState<string>('');
  const [exifData, setExifData] = useState<ExifData>({ hasMetadata: false, rawTagsCount: 0 });
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [pendingToolToActivate, setPendingToolToActivate] = useState<ActiveTool | null>(null);
  const [openQuickFix, setOpenQuickFix] = useState(false);

  // Handle single file upload
  const handleImageSelected = async (file: File) => {
    setActiveFile(file);
    const objectUrl = URL.createObjectURL(file);
    setActiveSrc(objectUrl);
    setActiveFileName(file.name);

    // Extract EXIF asynchronously
    try {
      const parsedExif = await parseExifMetadata(file);
      setExifData(parsedExif);
      if (file.size > 1.2 * 1024 * 1024 || parsedExif.hasMetadata) {
        setOpenQuickFix(true);
      }
    } catch {
      setExifData({ hasMetadata: false, rawTagsCount: 0 });
    }

    setCurrentTab('workspace');
  };

  // Handle sample photography selection
  const handleSampleSelected = async (sample: SampleItem) => {
    setActiveFile(null);
    setActiveSrc(sample.src);
    setActiveFileName(sample.fileName);
    setExifData({
      hasMetadata: true,
      rawTagsCount: 14,
      make: 'Sony Alpha',
      model: 'ILCE-7RM4',
      dateTime: '2026:09:27 02:12:00',
      software: 'Adobe Photoshop Lightroom Classic',
      gpsLatitude: '37° 46\' 29.8" N',
      gpsLongitude: '122° 25\' 9.8" W',
    });
    setOpenQuickFix(true);
    setCurrentTab('workspace');
  };

  // Handle batch selection
  const handleBatchSelected = (files: File[]) => {
    setBatchFiles(files);
    setCurrentTab('batch');
  };

  // Handle re-opening from recent history
  const handleLoadRecentItem = (dataUrl: string, name: string) => {
    setActiveFile(null);
    setActiveSrc(dataUrl);
    setActiveFileName(name);
    setExifData({ hasMetadata: false, rawTagsCount: 0 });
    setCurrentTab('workspace');
  };

  // Select tool from directory
  const handleSelectToolFromDirectory = (toolId: ActiveTool) => {
    setPendingToolToActivate(toolId);
    if (!activeSrc) {
      setCurrentTab('workspace');
    } else {
      setCurrentTab('workspace');
    }
  };

  // Start new / upload fresh image
  const handleStartNew = () => {
    setActiveFile(null);
    setActiveSrc('');
    setActiveFileName('');
    setExifData({ hasMetadata: false, rawTagsCount: 0 });
    setOpenQuickFix(false);
    setCurrentTab('workspace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Top Bar Contract compliant navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onUploadClick={handleStartNew}
        hasActiveImage={!!activeSrc}
        onOpenQuickFix={() => setOpenQuickFix(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 pb-16 md:pb-0">
        {currentTab === 'workspace' && (
          <>
            {activeSrc ? (
              <ImageWorkspace
                initialFile={activeFile || undefined}
                initialSrc={activeSrc}
                fileName={activeFileName}
                exif={exifData}
                onStartNew={handleStartNew}
                openQuickFixByDefault={openQuickFix}
                initialTool={pendingToolToActivate || 'adjust'}
              />
            ) : (
              <UploadZone
                onImageSelected={handleImageSelected}
                onSampleSelected={handleSampleSelected}
                onBatchSelected={handleBatchSelected}
              />
            )}
          </>
        )}

        {currentTab === 'tools' && (
          <ToolsDirectory onSelectTool={handleSelectToolFromDirectory} />
        )}

        {currentTab === 'batch' && (
          <BatchStudio
            initialFiles={batchFiles}
            onOpenInWorkspace={(file) => handleImageSelected(file)}
          />
        )}

        {currentTab === 'recent' && (
          <RecentWork onLoadRecentItem={handleLoadRecentItem} />
        )}

        {currentTab === 'guides' && (
          <SeoGuides onOpenTool={handleSelectToolFromDirectory} />
        )}

        {currentTab === 'about' && <AboutModal />}
      </div>

      {/* Footer (hidden when active workspace editor is open to maximize screen presence) */}
      {!(currentTab === 'workspace' && activeSrc) && (
        <Footer onNavigate={setCurrentTab} onSelectToolDirect={handleSelectToolFromDirectory} />
      )}

      {/* Mobile Bottom Navigation (compact touch bar) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e1422]/95 backdrop-blur-lg border-t border-slate-800 flex items-center justify-around py-2 px-1 text-[10px]">
        <button
          onClick={() => setCurrentTab('workspace')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentTab === 'workspace' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => setCurrentTab('tools')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentTab === 'tools' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Tools</span>
        </button>
        <button
          onClick={() => setCurrentTab('batch')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentTab === 'batch' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Batch</span>
        </button>
        <button
          onClick={() => setCurrentTab('recent')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentTab === 'recent' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Recent</span>
        </button>
        <button
          onClick={() => setCurrentTab('about')}
          className={`flex flex-col items-center gap-1 p-1 transition cursor-pointer ${
            currentTab === 'about' ? 'text-indigo-400 font-semibold' : 'text-slate-400'
          }`}
        >
          <Info className="w-4 h-4" />
          <span>About</span>
        </button>
      </div>

      {/* Offline Alert Indicator */}
      <OfflineIndicator />

    </div>
  );
}
