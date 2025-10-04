import { GoogleGenAI, Type, Part } from "@google/genai";
import { Duration, Style, Language, Voice } from '../types';

const getDurationText = (duration: Duration): string => {
  switch (duration) {
    case Duration.VeryShort:
      return "around 8 seconds, consisting of 1 scene";
    case Duration.Short:
      return "around 16 seconds, consisting of 2 scenes";
    case Duration.Medium:
      return "around 24 seconds, consisting of 3 scenes";
    case Duration.Long:
      return "around 32 seconds, consisting of 4 scenes";
    case Duration.VeryLong:
      return "around 40 seconds, consisting of 5 scenes";
    case Duration.Epic:
      return "longer than 48 seconds, consisting of at least 6 scenes";
    default:
      return "around 24 seconds, consisting of 3 scenes";
  }
};

const getLanguageText = (language: Language): { name: string, instruction: string } => {
  switch (language) {
    case Language.English:
      return {
        name: 'English',
        instruction: `The character MUST speak English. Explicitly state: "The character speaks fluent and natural English." For any dialogue, add "(in English)" before the line.`
      };
    case Language.Japanese:
      return {
        name: 'Japanese',
        instruction: `The character MUST speak Japanese. Explicitly state: "The character speaks fluent and natural Japanese." For any dialogue, add "(in Japanese)" before the line.`
      };
    case Language.Vietnamese:
    default:
      return {
        name: 'Vietnamese',
        instruction: `The character MUST speak Vietnamese. Explicitly state: "The character speaks fluent and natural Vietnamese." For any dialogue, add "(in Vietnamese)" before the line, as shown in the example above.`
      };
  }
};

const getVoiceText = (voice: Voice, languageName: string): string => {
  switch (voice) {
    case Voice.Child:
      return `The character MUST have a high-pitched, energetic child's voice, speaking fluent and natural ${languageName}. Specify this in the character description.`;
    case Voice.TeenMale:
      return `The character MUST have a young male voice, possibly with some adolescent cracking, speaking fluent and natural ${languageName}. Specify this in the character description.`;
    case Voice.TeenFemale:
      return `The character MUST have a young female voice, speaking fluent and natural ${languageName}. Specify this in the character description.`;
    case Voice.AdultMale:
      return `The character MUST have a standard adult male voice, with a medium pitch, speaking fluent and natural ${languageName}. Specify this in the character description.`;
    case Voice.AdultFemale:
      return `The character MUST have a standard adult female voice, with a medium pitch, speaking fluent and natural ${languageName}. Specify this in the character description.`;
    case Voice.ElderlyMale:
      return `The character MUST have an older, perhaps gravelly or frail, male voice, speaking fluent and natural ${languageName}. Specify this in the character description.`;
    case Voice.ElderlyFemale:
      return `The character MUST have an older, perhaps softer or frail, female voice, speaking fluent and natural ${languageName}. Specify this in the character description.`;
    case Voice.Default:
    default:
      return `The character's voice MUST be appropriate for their described age, gender, and emotional state, speaking fluent and natural ${languageName}. The AI should determine the best voice. Specify this in the character description.`;
  }
};

const STYLES_LIST = Object.values(Style).join(', ');

const getStyleText = (style: Style): string => {
  switch (style) {
    case Style.Cinematic:
      return "A cinematic, photorealistic style with dramatic lighting, shallow depth of field, and high-end camera work. The color palette should be rich and moody.";
    case Style.Anime:
      return "A vibrant Japanese anime style, reminiscent of Studio Ghibli films, with expressive characters, hand-drawn backgrounds, and fluid animation.";
    case Style.Claymation:
      return "A charming stop-motion claymation style, similar to Aardman Animations. Characters and objects should have a handcrafted look with visible fingerprints and textures.";
    case Style.PixelArt:
      return "A retro 16-bit pixel art style. The scene should be composed of visible pixels, with a limited color palette and animations characteristic of classic video games.";
    case Style.Documentary:
      return "A realistic, grounded documentary style. Use handheld camera shots, natural lighting, and a fly-on-the-wall perspective.";
    case Style.Surreal:
      return "A surreal, dream-like art style. Use impossible geometry, strange color combinations, and symbolic imagery to create an abstract and thought-provoking atmosphere.";
    case Style.Hyperrealistic:
      return "An ultra-detailed, hyperrealistic 8K CGI style. Every texture, reflection, and light source should be rendered with extreme fidelity, aiming for a look that's almost indistinguishable from reality.";
    case Style.Watercolor:
      return "A beautiful and fluid watercolor painting style. The visuals should appear as if painted on paper, with soft edges, color bleeds, and visible brush strokes.";
    case Style.Cartoon:
      return "A vibrant 2D cartoon animation style, like modern TV cartoons. Characterized by bold outlines, solid colors, and expressive, fluid animation.";
    case Style.Lego:
      return "A stop-motion or CGI style that perfectly replicates the look of LEGO bricks. Characters, vehicles, and environments are all constructed from LEGO pieces. The animation should have the distinct, slightly rigid movement of LEGO minifigures.";
    case Style.Vintage:
      return "A vintage film style, reminiscent of the 1950s. Use grainy textures, faded Technicolor-like colors, and classic film aspect ratios to create a nostalgic feel.";
    case Style.Noir:
      return "A classic black and white film noir style. Emphasize high-contrast lighting, deep shadows (chiaroscuro), dramatic camera angles, and a mysterious, gritty urban atmosphere.";
    case Style.Vaporwave:
      return "A vaporwave aesthetic with a nostalgic 80s and 90s retro-futuristic vibe. Use neon pinks and blues, glitch art effects, Roman busts, and surreal, dreamlike landscapes.";
    case Style.Steampunk:
        return "A steampunk aesthetic, featuring intricate brass machinery, steam-powered contraptions, Victorian-era fashion, and a color palette of browns, bronze, and copper. The atmosphere is one of industrial revolution meets fantasy.";
    case Style.Cyberpunk:
        return "A high-tech, dystopian cyberpunk world. Dominated by neon-drenched cityscapes, towering skyscrapers, rain-slicked streets, holographic advertisements, and characters with cybernetic enhancements. The mood is gritty and futuristic.";
    case Style.Fantasy:
        return "An epic high-fantasy style. Think sprawling landscapes, majestic castles, mythical creatures, and magical effects. The visuals should be grand and cinematic, inspired by classic fantasy sagas.";
    case Style.Horror:
        return "A suspenseful horror style. Use dark, shadowy lighting, unsettling camera angles, a muted and cold color palette, and an eerie, tense atmosphere to build suspense and fear.";
    case Style.Sketch:
        return "A black and white pencil sketch animation style. The visuals should look like they're being drawn in real-time in an artist's sketchbook, with visible pencil lines, cross-hatching, and a dynamic, unfinished quality.";
    case Style.Gothic:
        return "A dark and romantic gothic style. Characterized by imposing, ornate architecture (cathedrals, castles), deep shadows, a desaturated color palette with occasional splashes of deep red or purple, and a mysterious, melancholic mood.";
    case Style.Psychedelic:
        return "A vibrant, trippy psychedelic style inspired by 1960s art. Features swirling, kaleidoscopic patterns, bold and clashing colors, distorted visuals, and fluid, dream-like transitions.";
    case Style.Minimalist:
        return "A clean, minimalist aesthetic. Focus on simple geometric shapes, a limited and deliberate color palette (often monochromatic or with a single accent color), and abundant negative space. The composition is key.";
    case Style.Cartoon1930s:
        return "A vintage 1930s American cartoon style. Black and white, with 'rubber hose' animation where characters have noodle-like limbs. The visuals should be whimsical, slightly surreal, with bouncing movements synchronized to a jazzy soundtrack.";
    case Style.Cartoon80s:
        return "A vibrant Saturday morning cartoon style from the 1980s. Characterized by bright, saturated colors, bold outlines, and a slightly grainy, cel-animated look. The action should be dynamic and heroic.";
    case Style.AnimatedSitcom:
        return "A modern animated sitcom style, similar to shows like The Simpsons or Bob's Burgers. Features a clean 2D look, relatively simple character designs with expressive faces, and a focus on comedic timing in a contemporary setting.";
    case Style.ThreeDAnimation:
      return "A polished and smooth 3D animation style, similar to modern CGI films from Pixar or DreamWorks. Features detailed character models, realistic lighting and textures, and fluid motion.";
    case Style.Papercraft:
      return "A charming stop-motion style using paper cutouts and handcrafted paper models. The world has a distinct layered, 2.5D look with visible paper textures and delicate movements.";
    case Style.OilPainting:
      return "A living oil painting style. The visuals have the rich texture, thick brushstrokes (impasto), and vibrant, blended colors of a classic oil painting in motion. Each frame looks like it belongs in a museum.";
    case Style.GlitchArt:
      return "An experimental glitch art style. The visuals are characterized by digital artifacts, color bleeding, pixelation, datamoshing, and other intentional distortions, creating a chaotic and futuristic aesthetic.";
    case Style.StopMotion:
      return "A classic stop-motion animation style. Objects are physically manipulated in small increments between individually photographed frames, creating a unique, tangible, and slightly jittery movement.";
    case Style.UkiyoE:
      return "A Japanese Ukiyo-e woodblock print style in motion. Characterized by flat areas of color, bold outlines, and compositions inspired by traditional Japanese art from the Edo period.";
    case Style.Macro:
      return "An extreme close-up macro photography style. The video focuses on minuscule details, revealing the hidden textures and intricacies of small subjects. Features an extremely shallow depth of field, making the background a soft blur.";
    case Style.DroneFootage:
      return "A breathtaking aerial drone footage style. Characterized by smooth, sweeping camera movements, high-altitude perspectives, and epic shots of landscapes or cityscapes. Creates a sense of scale and grandeur.";
    default:
      return "A cinematic, photorealistic style.";
  }
};


export const generateVeoPrompt = async (idea: string, duration: Duration, style: Style, language: Language, voice: Voice): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const durationText = getDurationText(duration);
  const styleText = getStyleText(style);
  const languageInfo = getLanguageText(language);
  const voiceText = getVoiceText(voice, languageInfo.name);

  const systemInstruction = `
    You are an expert prompt engineer and creative storyteller for Google's Veo video generation model.
    Your task is to take a user's simple idea and transform it into a rich, cinematic, and emotionally resonant prompt that Veo can use to create a high-quality video. Your primary goal is to ensure absolute consistency in character and story across all scenes.

    Follow these rules strictly:
    1.  **Unbreakable Narrative Chain:** This is your most critical directive. You are not writing separate descriptions; you are writing a single, continuous film sequence. Each scene must flow into the next with perfect, unbroken logic.
        - **Cause and Effect:** Every action in a scene must have a clear cause from the previous scene and a clear effect that leads into the next. Think of it as a chain: Scene 1's end *causes* Scene 2's start. Scene 2's action *causes* Scene 3's situation.
        - **Continuity of State:** Meticulously track the physical state of all characters and important objects. If a character picks up a glowing orb in Scene 1, they MUST be holding that glowing orb at the start of Scene 2. If their clothes get wet, they stay wet. There are NO unexplained jumps or resets.
        - **Emotional Continuity:** The character's emotional state is not random. Their emotion in Scene 2 must be a direct evolution of their emotion in Scene 1. If they were frightened, they might now be cautiously peeking around a corner. If they were joyful, they might now be smiling serenely. Describe this emotional arc.
        - **Seamless Transitions:** Use cinematic transitions to explicitly link scenes. Don't just end one and start another. Use phrases like: "Cutting on action, the character's hand reaches for the door, and the next scene opens with...", or "A slow dissolve merges the rainy window with...", or "A whip pan follows the character's terrified gaze to reveal...". This reinforces the continuous flow.
    2.  **Absolute Character Consistency:** This is non-negotiable.
        - **Visual Blueprint:** Begin with a detailed "**Consistent Character:**" section. This is the master blueprint. Describe their physical appearance (face shape, eye color, hairstyle and color, build), clothing (be specific about every item), and any defining marks or accessories.
        - **Constant Reference:** In **every single scene**, you MUST refer back to this blueprint to maintain visual continuity. For example: "The character, still wearing their described red scarf and round glasses, now...". This is mandatory for every scene.
    3.  **Voice Profile:** ${voiceText}
    4.  **Language and Dialogue:** ${languageInfo.instruction} Dialogue MUST be perfectly synchronized with their physical performance. Weave the dialogue into the action description. For example: 'The character slams the book shut, dust motes dancing in a sliver of light. (in ${languageInfo.name}) "It's over," they whisper, their shoulders slumping in defeat, a direct continuation of the frustration building in the previous scene.'
    5.  **Subtitles:** The video MUST NOT have subtitles. State this clearly: "The video has no subtitles."
    6.  **Duration:** The video's length must match the user's request. Include a statement like "Video duration: ${durationText}."
    7.  **Visual Style:** The prompt MUST explicitly define and adhere to the following visual style: "${styleText}". This style must influence all visual descriptions, including color grading, lighting, and texture.
    8.  **Cinematic & Sensory Detail:**
        -   **Show, Don't Tell:** Describe actions and emotions visually. Instead of "the character is sad," describe "a single tear traces a path through the grime on their cheek."
        -   **Rich Cinematography:** Use specific cinematic language (e.g., 'dolly zoom', 'rack focus', 'point-of-view shot', 'long take', 'extreme close-up'). Camera movements should enhance the story's emotion.
        -   **Living Environments:** The setting is a character. Describe weather, lighting changes, background activity, and how the character interacts with their environment.
        -   **Sensory Experience:** Describe with rich sensory details: the quality of light ('harsh noon sun bleaching the colors from the street'), the texture of surfaces ('the slick, cold feel of polished marble'), the atmosphere ('a thick, expectant silence hangs in the air').
        -   **Immersive Sound Design:** Describe the complete audio environment: specific ambient sounds (a distant siren, leaves rustling), foley (the creak of a floorboard, the clink of a glass), and how sound contributes to the mood.
    9.  **Structure:** Break down the prompt into clear scenes (e.g., Scene 1, Scene 2), each conceptually around 8 seconds long. Each scene description should be a dense paragraph packed with the details mentioned above.
    10. **Output Format:** The final output should ONLY be the generated prompt itself. Do not include any extra explanations, greetings, or text outside of the prompt content.

    The user's idea is in Vietnamese. Your output prompt must be in English, but respect the ${languageInfo.name} language requirement for the character's speech.
  `;
  
  const prompt = `User Idea: "${idea}"`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.9,
            topP: 0.95,
        }
    });
    return response.text.replace(/\*\*/g, '');
  } catch (error) {
    console.error("Error generating prompt:", error);
    if (error instanceof Error) {
        throw new Error(`Đã xảy ra lỗi khi tạo prompt: ${error.message}`);
    }
    throw new Error("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
  }
};

export const generateScript = async (idea: string, imagePart: Part | null): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
        Bạn là một chuyên gia viết kịch bản chuyên nghiệp và một đạo diễn hình ảnh tài ba.
        Nhiệm vụ của bạn là lấy một ý tưởng ngắn gọn và phát triển nó thành một kịch bản ngắn với cấu trúc JSON cụ thể.
        Nếu một hình ảnh được cung cấp, hãy sử dụng nó để mô tả ngoại hình của nhân vật trong phần 'character'.
        Sau khi viết kịch bản, hãy đề xuất một phong cách hình ảnh phù hợp nhất cho kịch bản đó từ danh sách được cung cấp.
        Hãy đảm bảo nội dung sáng tạo, hấp dẫn và đề xuất phong cách phải hợp lý.
        Danh sách các phong cách có thể chọn: [${STYLES_LIST}]
        Toàn bộ nội dung trong các trường JSON phải bằng tiếng Việt.
    `;

    const contents = imagePart ? { parts: [{ text: idea }, imagePart] } : { parts: [{ text: idea }] };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.8,
                topP: 0.95,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        character: { type: Type.STRING, description: "Mô tả chi tiết về nhân vật chính (ngoại hình, tính cách, trang phục). Phải viết bằng tiếng Việt." },
                        setting: { type: Type.STRING, description: "Mô tả bối cảnh, địa điểm diễn ra câu chuyện. Phải viết bằng tiếng Việt." },
                        plot: { type: Type.STRING, description: "Tóm tắt cốt truyện chính, bao gồm các sự kiện quan trọng. Phải viết bằng tiếng Việt." },
                        atmosphere: { type: Type.STRING, description: "Mô tả không khí, cảm xúc, và tông màu chung của kịch bản. Phải viết bằng tiếng Việt." },
                        styleSuggestion: { type: Type.STRING, description: `Đề xuất một phong cách hình ảnh từ danh sách cho trước. Chỉ trả về tên phong cách. Danh sách: [${STYLES_LIST}].` },
                    },
                    required: ["character", "setting", "plot", "atmosphere", "styleSuggestion"],
                },
            },
        });

        const jsonString = response.text.trim();
        const cleanedJsonString = jsonString.replace(/^```json\s*|```$/g, '');
        return JSON.parse(cleanedJsonString);

    } catch (error) {
        console.error("Error generating script:", error);
        if (error instanceof Error) {
            throw new Error(`Đã xảy ra lỗi khi tạo kịch bản: ${error.message}`);
        }
        throw new Error("Đã xảy ra lỗi không xác định khi tạo kịch bản. Vui lòng thử lại.");
    }
};
