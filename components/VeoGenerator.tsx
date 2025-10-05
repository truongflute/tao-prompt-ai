import React, { useState, useCallback, useMemo } from 'react';
import { Duration, DurationOption, Style, StyleOption, Language, LanguageOption, Voice, VoiceOption, HistoryItem } from '../types';
import { generateVeoPrompt } from '../services/geminiService';
import { MagicWandIcon, CopyIcon, CheckIcon, LoadingSpinner, DownloadIcon } from './Icons';

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

const DURATION_OPTIONS: DurationOption[] = [
  { value: Duration.VeryShort, label: 'Rất ngắn', description: '~8 giây (1 cảnh)' },
  { value: Duration.Short, label: 'Ngắn', description: '~16 giây (2 cảnh)' },
  { value: Duration.Medium, label: 'Trung bình', description: '~24 giây (3 cảnh)' },
  { value: Duration.Long, label: 'Dài', description: '~32 giây (4 cảnh)' },
  { value: Duration.VeryLong, label: 'Rất dài', description: '~40 giây (5 cảnh)' },
  { value: Duration.Epic, label: 'Sử thi', description: '> 48 giây (> 6 cảnh)' },
];

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: Language.Vietnamese, label: 'Tiếng Việt', description: 'Nhân vật nói tiếng Việt' },
  { value: Language.English, label: 'Tiếng Anh', description: 'Nhân vật nói tiếng Anh' },
  { value: Language.Japanese, label: 'Tiếng Nhật', description: 'Nhân vật nói tiếng Nhật' },
];

const VOICE_OPTIONS: VoiceOption[] = [
  { value: Voice.Default, label: 'Mặc định', description: 'AI tự quyết định giọng' },
  { value: Voice.Child, label: 'Trẻ em', description: 'Giọng cao, trong trẻo' },
  { value: Voice.TeenMale, label: 'Thiếu niên (Nam)', description: 'Giọng nam trẻ' },
  { value: Voice.TeenFemale, label: 'Thiếu niên (Nữ)', description: 'Giọng nữ trẻ' },
  { value: Voice.AdultMale, label: 'Người lớn (Nam)', description: 'Giọng nam trung' },
  { value: Voice.AdultFemale, label: 'Người lớn (Nữ)', description: 'Giọng nữ trung' },
  { value: Voice.ElderlyMale, label: 'Người già (Nam)', description: 'Giọng nam trầm, lớn tuổi' },
  { value: Voice.ElderlyFemale, label: 'Người già (Nữ)', description: 'Giọng nữ nhẹ, lớn tuổi' },
];

const STYLE_OPTIONS: StyleOption[] = [
  { value: Style.Cinematic, label: 'Điện ảnh', description: 'Chân thực, chất lượng cao' },
  { value: Style.Anime, label: 'Anime', description: 'Hoạt hình Nhật Bản' },
  { value: Style.Claymation, label: 'Đất sét', description: 'Hoạt hình tĩnh vật' },
  { value: Style.PixelArt, label: 'Pixel Art', description: 'Phong cách retro 8-bit' },
  { value: Style.Documentary, label: 'Tài liệu', description: 'Thực tế, tự nhiên' },
  { value: Style.Surreal, label: 'Siêu thực', description: 'Trừu tượng, như mơ' },
  { value: Style.Hyperrealistic, label: 'Siêu thực tế', description: 'Cực kỳ chi tiết, 8K' },
  { value: Style.Watercolor, label: 'Màu nước', description: 'Nghệ thuật, mềm mại' },
  { value: Style.Cartoon, label: 'Hoạt hình', description: 'Phim hoạt hình 2D' },
  { value: Style.Lego, label: 'Lego', description: 'Hoạt hình Lego' },
  { value: Style.Vintage, label: 'Cổ điển', description: 'Phong cách phim cũ 1950s' },
  { value: Style.Noir, label: 'Phim Đen', description: 'Đen trắng, kịch tính' },
  { value: Style.Vaporwave, label: 'Vaporwave', description: 'Thẩm mỹ retro 80s/90s' },
  { value: Style.Steampunk, label: 'Steampunk', description: 'Cơ khí, hơi nước, cổ điển' },
  { value: Style.Cyberpunk, label: 'Cyberpunk', description: 'Tương lai, neon, u ám' },
  { value: Style.Fantasy, label: 'Fantasy', description: 'Sử thi, phép thuật, hùng vĩ' },
  { value: Style.Horror, label: 'Kinh dị', description: 'U ám, căng thẳng, đáng sợ' },
  { value: Style.Sketch, label: 'Phác thảo', description: 'Nét vẽ tay đen trắng' },
  { value: Style.Gothic, label: 'Gothic', description: 'Bí ẩn, kiến trúc cổ' },
  { value: Style.Psychedelic, label: 'Ảo giác', description: 'Màu sắc, hoa văn xoáy' },
  { value: Style.Minimalist, label: 'Tối giản', description: 'Đơn giản, sạch sẽ' },
  { value: Style.Cartoon1930s, label: 'Hoạt hình 1930s', description: 'Đen trắng, kiểu cũ' },
  { value: Style.Cartoon80s, label: 'Hoạt hình 80s', description: 'Sặc sỡ, hành động' },
  { value: Style.AnimatedSitcom, label: 'Sitcom Hoạt hình', description: 'Hài hước, hiện đại' },
  { value: Style.ThreeDAnimation, label: 'Hoạt hình 3D', description: 'Phong cách Pixar/Disney' },
  { value: Style.Papercraft, label: 'Thủ công giấy', description: 'Hoạt hình cắt giấy' },
  { value: Style.OilPainting, label: 'Sơn dầu', description: 'Tranh sơn dầu chuyển động' },
  { value: Style.GlitchArt, label: 'Nghệ thuật Glitch', description: 'Hiệu ứng kỹ thuật số' },
  { value: Style.StopMotion, label: 'Stop Motion', description: 'Hoạt hình tĩnh vật' },
  { value: Style.UkiyoE, label: 'Tranh Ukiyo-e', description: 'Tranh khắc gỗ Nhật Bản' },
  { value: Style.Macro, label: 'Cận cảnh (Macro)', description: 'Quay siêu gần, chi tiết' },
  { value: Style.DroneFootage, label: 'Cảnh quay Drone', description: 'Góc quay từ trên cao' },
];

const VeoGenerator: React.FC = () => {
  const [idea, setIdea] = useState<string>('');
  const [duration, setDuration] = useState<Duration>(Duration.Medium);
  const [language, setLanguage] = useState<Language>(Language.Vietnamese);
  const [voice, setVoice] = useState<Voice>(Voice.Default);
  const [style, setStyle] = useState<Style>(Style.Cinematic);
  
  const [characterStylePrompt, setCharacterStylePrompt] = useState<string>('');
  const [scenes, setScenes] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isFullPromptCopied, setIsFullPromptCopied] = useState<boolean>(false);

  const handleIdeaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdea(e.target.value);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Vui lòng nhập ý tưởng của bạn.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setCharacterStylePrompt('');
    setScenes([]);
    setIsFullPromptCopied(false);

    try {
      const prompt = await generateVeoPrompt(idea, duration, style, language, voice);
      const sceneStartIndex = prompt.search(/scene 1[:\s]/i);

      if (sceneStartIndex !== -1) {
        const characterPart = prompt.substring(0, sceneStartIndex).trim();
        const scenesPart = prompt.substring(sceneStartIndex).trim();
        
        const sceneArray = scenesPart.split(/\n*(?=Scene \d+:)/i).map(s => s.trim()).filter(Boolean);

        setCharacterStylePrompt(characterPart);
        setScenes(sceneArray);
      } else {
        setCharacterStylePrompt(prompt);
        setScenes([]);
      }
      
      let promptToSave: string;
      if (sceneStartIndex !== -1) {
          const characterPart = prompt.substring(0, sceneStartIndex).trim().replace(/(\r\n|\n|\r)+/gm, " ");
          const scenesPart = prompt.substring(sceneStartIndex).trim();
          const sceneArray = scenesPart.split(/\n*(?=Scene \d+:)/i).map(s => s.trim()).filter(Boolean);

          promptToSave = sceneArray.map(scene => {
              const seamlessScene = scene.replace(/(\r\n|\n|\r)+/gm, " ").trim();
              return `${characterPart} ${seamlessScene}`;
          }).join('\n\n');
      } else {
          promptToSave = prompt.replace(/(\r\n|\n|\r)+/gm, " ").trim();
      }
      saveToHistory('veo', promptToSave);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Đã có lỗi xảy ra. Vui lòng thử lại.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [idea, duration, style, language, voice]);
  
  const copyToClipboard = useCallback((text: string, onCopy: () => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(onCopy);
  }, []);

  const fullSeamlessPrompt = useMemo(() => {
    if (!characterStylePrompt) return '';
    
    const seamlessCharacterStyle = characterStylePrompt.replace(/(\r\n|\n|\r)+/gm, " ").trim();

    if (scenes.length > 0) {
      return scenes.map(scene => {
        const seamlessScene = scene.replace(/(\r\n|\n|\r)+/gm, " ").trim();
        return `${seamlessCharacterStyle} ${seamlessScene}`;
      }).join('\n\n');
    }
    return seamlessCharacterStyle;
  }, [characterStylePrompt, scenes]);
  
  const copyFullPrompt = useCallback(() => {
    copyToClipboard(fullSeamlessPrompt, () => {
        setIsFullPromptCopied(true);
        setTimeout(() => setIsFullPromptCopied(false), 2000);
    });
  }, [fullSeamlessPrompt, copyToClipboard]);

  const handleDownload = useCallback(() => {
    if (!fullSeamlessPrompt) return;

    const blob = new Blob([fullSeamlessPrompt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'veo_prompts.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [fullSeamlessPrompt]);


  const hasGeneratedPrompt = fullSeamlessPrompt !== '';

  return (
    <div className="w-full max-w-4xl mx-auto font-sans">
      <header className="w-full text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary to-brand-accent mb-2">
          Veo Prompt Generator
        </h1>
        <p className="text-brand-text-secondary text-lg">
          Tạo prompt chuyên nghiệp cho video AI
        </p>
      </header>

      <main className="w-full flex-grow">
        <form onSubmit={handleSubmit} className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-white/10 space-y-6">
          
          <div>
            <label htmlFor="idea" className="block text-lg font-semibold mb-2 text-brand-text-primary">
              1. Nhập ý tưởng video của bạn
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={handleIdeaChange}
              placeholder="Ví dụ: một chú mèo phi hành gia khám phá các hành tinh làm bằng kẹo..."
              className="w-full h-24 p-4 bg-[#101014] border border-brand-secondary rounded-lg focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all duration-300 resize-none text-brand-text-primary placeholder:text-gray-500"
              aria-required="true"
            />
          </div>

          <div>
            <label className="block text-lg font-semibold mb-3 text-brand-text-primary">
              2. Chọn ngôn ngữ của nhân vật
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {LANGUAGE_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setLanguage(option.value)}
                  className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                    language === option.value
                      ? 'bg-brand-secondary border-brand-primary ring-2 ring-brand-primary'
                      : 'bg-[#101014] border-transparent hover:border-brand-accent'
                  }`}
                  aria-pressed={language === option.value}
                >
                  <p className="font-bold text-brand-text-primary">{option.label}</p>
                  <p className="text-sm text-brand-text-secondary">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-lg font-semibold mb-3 text-brand-text-primary">
              3. Chọn giọng nói của nhân vật
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {VOICE_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setVoice(option.value)}
                  className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                    voice === option.value
                      ? 'bg-brand-secondary border-brand-primary ring-2 ring-brand-primary'
                      : 'bg-[#101014] border-transparent hover:border-brand-accent'
                  }`}
                  aria-pressed={voice === option.value}
                >
                  <p className="font-bold text-brand-text-primary">{option.label}</p>
                  <p className="text-sm text-brand-text-secondary">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-3 text-brand-text-primary">
              4. Chọn độ dài video
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {DURATION_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setDuration(option.value)}
                  className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                    duration === option.value
                      ? 'bg-brand-secondary border-brand-primary ring-2 ring-brand-primary'
                      : 'bg-[#101014] border-transparent hover:border-brand-accent'
                  }`}
                  aria-pressed={duration === option.value}
                >
                  <p className="font-bold text-brand-text-primary">{option.label}</p>
                  <p className="text-sm text-brand-text-secondary">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-semibold mb-3 text-brand-text-primary">
              5. Chọn phong cách video
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STYLE_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => setStyle(option.value)}
                  className={`p-4 rounded-lg text-left transition-all duration-300 border-2 ${
                    style === option.value
                      ? 'bg-brand-secondary border-brand-primary ring-2 ring-brand-primary'
                      : 'bg-[#101014] border-transparent hover:border-brand-accent'
                  }`}
                  aria-pressed={style === option.value}
                >
                  <p className="font-bold text-brand-text-primary">{option.label}</p>
                   <p className="text-sm text-brand-text-secondary">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold rounded-lg hover:opacity-90 transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="w-6 h-6 animate-spin"/>
                Đang tạo Prompt...
              </>
            ) : (
              <>
                <MagicWandIcon className="w-6 h-6" />
                Tạo Prompt
              </>
            )}
          </button>
          
          {error && <p className="text-red-400 text-center" role="alert">{error}</p>}
        </form>

        <div className="mt-8">
          {isLoading ? (
            <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-white/10">
              <h2 className="text-2xl font-bold text-brand-text-primary mb-4">Đang tạo Prompt...</h2>
                <div aria-live="polite" aria-busy="true" className="space-y-3 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
          ) : (
            hasGeneratedPrompt && (
              <div className="bg-brand-surface p-6 rounded-2xl shadow-lg border border-white/10 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-brand-text-primary">
                    Prompt đã tạo
                  </h2>
                   <div className="flex items-center gap-2">
                    <button
                        onClick={copyFullPrompt}
                        className="flex items-center gap-2 py-2 px-4 bg-[#101014] border border-brand-secondary rounded-lg hover:bg-brand-secondary transition-colors duration-300"
                        aria-label="Sao chép toàn bộ prompt"
                    >
                        {isFullPromptCopied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-brand-text-secondary" />}
                        <span className="text-sm font-medium">{isFullPromptCopied ? 'Đã sao chép!' : 'Sao chép'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 py-2 px-4 bg-[#101014] border border-brand-secondary rounded-lg hover:bg-brand-secondary transition-colors duration-300"
                      aria-label="Tải xuống tất cả prompt"
                    >
                      <DownloadIcon className="w-5 h-5 text-brand-text-secondary" />
                      <span className="text-sm font-medium">Tải xuống (.txt)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-[#101014] p-4 rounded-lg border border-brand-secondary/50">
                  <pre className="text-left text-brand-text-secondary whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {fullSeamlessPrompt}
                  </pre>
                </div>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
};

export default VeoGenerator;