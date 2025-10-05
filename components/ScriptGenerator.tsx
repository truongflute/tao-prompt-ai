import React, { useState, useCallback, useMemo } from 'react';
import { Part } from '@google/genai';
import { generateScript } from '../services/geminiService';
import { Script, HistoryItem } from '../types';
import {
  SparklesIcon, CopyIcon, CheckIcon, LoadingSpinner, ImageIcon, XIcon,
  UserIcon, MapPinIcon, BookOpenIcon, WindIcon, PaletteIcon
} from './Icons';

const HISTORY_KEY = 'prompt-history';

const saveToHistory = (type: 'script' | 'veo', prompt: string) => {
    try {
        const item: HistoryItem = {
            id: crypto.randomUUID(),
            type,
            prompt,
            timestamp: Date.now()
        };
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        const history: HistoryItem[] = storedHistory ? JSON.parse(storedHistory) : [];
        history.unshift(item);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save to history", error);
    }
};

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const ScriptGenerator: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [script, setScript] = useState<Script | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        alert('Vui lòng chọn ảnh định dạng PNG, JPEG, hoặc WEBP.');
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };
  
  const formattedScript = useMemo(() => {
    if (!script) return '';
    return `
Nhân vật:
${script.character}

Bối cảnh:
${script.setting}

Cốt truyện:
${script.plot}

Không khí/Cảm xúc:
${script.atmosphere}

Phong cách đề xuất:
${script.styleSuggestion}
    `.trim();
  }, [script]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() && !imageFile) {
        setError('Vui lòng nhập ý tưởng hoặc tải lên một hình ảnh.');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setScript(null);
    setIsCopied(false);

    try {
        let imagePart: Part | null = null;
        if (imageFile) {
            imagePart = await fileToGenerativePart(imageFile);
        }
        const generatedScript = await generateScript(idea, imagePart);
        setScript(generatedScript);

        const scriptText = `
Nhân vật:
${generatedScript.character}

Bối cảnh:
${generatedScript.setting}

Cốt truyện:
${generatedScript.plot}

Không khí/Cảm xúc:
${generatedScript.atmosphere}

Phong cách đề xuất:
${generatedScript.styleSuggestion}
    `.trim();
        saveToHistory('script', scriptText);

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra.';
        setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [idea, imageFile]);

  const handleCopy = useCallback(() => {
    if (!formattedScript) return;
    navigator.clipboard.writeText(formattedScript).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    });
  }, [formattedScript]);
  
  const ScriptCard = ({ icon, title, content, colorClass }: { icon: React.ReactNode, title: string, content: string, colorClass: string }) => (
    <div className={`bg-gray-800/50 rounded-lg p-4 border-l-4 ${colorClass}`}>
        <div className="flex items-center gap-3 mb-2">
            {icon}
            <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <p className="text-gray-300 whitespace-pre-wrap">{content}</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto font-sans text-gray-200">
      <div className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-2">
            Gợi Ý Tạo Kịch Bản AI
        </h1>
        <p className="text-gray-400 text-lg">
            Biến ý tưởng hoặc hình ảnh của bạn thành một kịch bản hoàn chỉnh.
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Nhập ý tưởng kịch bản của bạn ở đây..."
            className="w-full h-28 p-4 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all duration-300 resize-none placeholder:text-gray-500"
            disabled={isLoading}
          />

          <div className="flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="image-upload" className="w-full sm:w-auto flex-shrink-0 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                  <ImageIcon className="w-5 h-5"/>
                  <span>Chọn ảnh</span>
              </label>
              <input id="image-upload" type="file" accept="image/png, image/jpeg, image/webp" className="hidden" onChange={handleImageChange} disabled={isLoading}/>
              {imagePreview && (
                  <div className="relative">
                      <img src={imagePreview} alt="Xem trước" className="w-20 h-20 object-cover rounded-md" />
                      <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1" aria-label="Gỡ bỏ ảnh">
                          <XIcon className="w-4 h-4" />
                      </button>
                  </div>
              )}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || (!idea.trim() && !imageFile)}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:scale-105 transition-transform duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 text-lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="w-6 h-6 animate-spin"/>
                Đang xử lý...
              </>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                Tạo Kịch bản
              </>
            )}
          </button>
        </form>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center p-8">
            <LoadingSpinner className="w-12 h-12 animate-spin text-purple-400" />
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg text-center" role="alert">
            {error}
        </div>
      )}

      {script && (
        <div className="relative bg-gray-900/70 border border-gray-700 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
            <button onClick={handleCopy} className="absolute top-4 right-4 flex items-center gap-2 py-2 px-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                {isCopied ? <CheckIcon className="w-5 h-5 text-green-400"/> : <CopyIcon className="w-5 h-5"/>}
                <span className="text-sm">{isCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 md:mt-0">
                <ScriptCard icon={<UserIcon className="w-6 h-6 text-cyan-400"/>} title="Nhân vật" content={script.character} colorClass="border-cyan-500" />
                <ScriptCard icon={<MapPinIcon className="w-6 h-6 text-green-400"/>} title="Bối cảnh" content={script.setting} colorClass="border-green-500" />
                <ScriptCard icon={<BookOpenIcon className="w-6 h-6 text-amber-400"/>} title="Cốt truyện" content={script.plot} colorClass="border-amber-500" />
                <ScriptCard icon={<WindIcon className="w-6 h-6 text-rose-400"/>} title="Không khí" content={script.atmosphere} colorClass="border-rose-500" />
                <ScriptCard icon={<PaletteIcon className="w-6 h-6 text-violet-400"/>} title="Phong cách đề xuất" content={script.styleSuggestion} colorClass="border-violet-500" />
            </div>
        </div>
      )}
    </div>
  );
};

export default ScriptGenerator;