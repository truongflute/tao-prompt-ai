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

const getStoryArcInstruction = (duration: Duration): string => {
    if (duration === Duration.VeryShort) {
        return `
        1.  **Single, Focused Scene:** This is your core directive. For this very short video, you must create a single, impactful scene (around 8 seconds). This scene should capture a pivotal moment, a strong emotion, or a visually striking action. It should imply a larger story rather than telling a full one.
            - **Focus on the Moment:** Do not try to fit a full Setup, Confrontation, and Resolution. Instead, focus on executing one of these perfectly. For example, the scene could be just the Confrontation (a character making a sudden discovery) or just the Resolution (the aftermath of an unseen event).
            - **Visual Storytelling:** The scene must be rich in visual detail that hints at the before and after. If a character is looking at a map, the scene is about that moment of decision, not the entire journey.
            - **Compelling Frame:** The scene must be a strong, memorable, and well-composed shot. It should feel like a key frame from a larger film.
        `;
    }
    
    if (duration === Duration.Short) {
        return `
        1.  **Condensed Story Arc:** This is your core directive. You are directing a short, continuous film sequence across two scenes (around 16 seconds total). The video must have a clear, condensed story arc.
            - **Cause and Effect:** Every action in the first scene must be the direct cause of the second scene. The narrative chain must be unbreakable. Scene 1's end *triggers* Scene 2's start. For example, Scene 1 is the **Setup/Confrontation** (a character finds a mysterious key), and Scene 2 is the **Resolution** (they use the key on a lock, and we see their reaction to what's inside).
            - **Continuity of State:** Meticulously track the physical and emotional state of all characters and objects between the two scenes.
            - **Emotional Continuity:** A character's emotion in Scene 2 must be a direct, logical evolution of their emotion in Scene 1.
            - **Seamless Cinematic Transitions:** Explicitly link the two scenes with directorial language like "The camera follows their hand as they insert the key, transitioning us into the next scene...".
            - **Compelling Opening & Closing:** The first scene must establish the situation. The final scene must provide a clear outcome or a memorable final frame.
        `;
    }

    // For Medium, Long, VeryLong, Epic
    return `
        1.  **Micro-Story Arc & Narrative Chain:** This is your core directive. You are directing a single, continuous film sequence. The video must have a complete story arc: a **Setup** (introducing the character/situation), a **Confrontation** (an action, discovery, or challenge), and a **Resolution** (the outcome or new state).
            - **Cause and Effect:** Every action in a scene must be a direct result of the previous scene and the direct cause of the next. The narrative chain must be unbreakable. Scene 1's end *triggers* Scene 2's start.
            - **Continuity of State:** Meticulously track the physical and emotional state of all characters and objects. If a character is holding a dripping umbrella in Scene 1, they MUST still be holding it at the start of Scene 2, and the ground around them should be wet.
            - **Emotional Continuity:** A character's emotion in Scene 2 must be a direct, logical evolution of their emotion in Scene 1. If they were startled, they might now be cautiously investigating. Describe this emotional progression.
            - **Seamless Cinematic Transitions:** Explicitly link scenes with directorial language. Do not just start a new scene. Use phrases like: "A match cut transitions from the burning match to the rising sun...", or "The camera follows her gaze, whip panning to reveal...", or "A slow dissolve merges the reflection in the puddle with the starry night sky...".
            - **Compelling Opening & Closing:** The first scene must be a strong **establishing shot** that hooks the viewer. The final scene must provide a sense of closure or a memorable **final frame**.
    `;
}


export const generateVeoPrompt = async (idea: string, duration: Duration, style: Style, language: Language, voice: Voice): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const durationText = getDurationText(duration);
  const styleText = getStyleText(style);
  const languageInfo = getLanguageText(language);
  const voiceText = getVoiceText(voice, languageInfo.name);
  const storyArcInstruction = getStoryArcInstruction(duration);

  const systemInstruction = `
    You are an award-winning screenwriter and a visionary film director, expert in crafting prompts for Google's Veo video model.
    Your mission is to elevate a user's simple idea into a masterpiece of micro-storytelling. The prompt must be cinematic, emotionally resonant, and flawlessly coherent for Veo to generate a high-quality, continuous video. Character and narrative consistency are paramount.

    Adhere to these directives with absolute precision:
    ${storyArcInstruction}
    2.  **Absolute Character Consistency:** This is non-negotiable.
        - **Master Blueprint:** Begin with a detailed "**Consistent Character:**" section. This is the definitive guide. Describe their face, eyes, hair, build, every item of clothing, and unique accessories or marks.
        - **Mandatory Reiteration:** In **every single scene**, you MUST explicitly reference the character's consistent appearance. For example: "The character, their described faded denim jacket now damp from the rain, clutches the silver locket...". This is mandatory. For very short (single scene) videos, this reiteration should still be present to firmly establish the character's look.
    3.  **Voice Profile:** ${voiceText}
    4.  **Language and Dialogue:** ${languageInfo.instruction} Dialogue must be purposeful and perfectly synchronized with the action and emotion. It must reveal character or advance the plot. The dialogue in one scene must be a logical continuation of the previous scene's context. Weave it into the action: 'The character shoves the map into their pocket. (in ${languageInfo.name}) "There's no turning back," they mutter, their voice a mix of fear and determination, a direct result of the discovery in the prior scene.'
    5.  **Subtitles:** The video MUST NOT have subtitles. State this clearly: "The video has no subtitles."
    6.  **Duration:** The video's length must match the user's request. Include a statement like "Video duration: ${durationText}." This is a strict requirement. The number of scenes must align with this duration.
    7.  **Visual Style & Post-Production:** The prompt MUST explicitly define and adhere to the visual style: "${styleText}". This style dictates everything. Suggest post-production effects that fit, for example: "The entire video has a desaturated, blue-tinted color grade and a subtle film grain to enhance the noir atmosphere."
    8.  **Masterful Cinematography & Sensory Detail:**
        -   **Show, Don't Tell:** Instead of "she is scared," describe "her eyes widen, her breath catches in her throat, and her hand trembles as she reaches for the doorknob."
        -   **Intentional Cinematography:** Use specific, purposeful camera language (e.g., 'dolly zoom to heighten tension', 'rack focus to shift attention from the foreground to a new discovery in the background', 'a low-angle shot to make the character seem powerful', 'Dutch angle for unease', 'J-cut for a smooth audio transition').
        -   **Living Environments:** Describe weather, lighting with intent ('soft, diffused morning light streaming through a window,' 'the cold, sterile glow of neon signs reflecting on wet pavement'), and how the environment affects the character.
        -   **Immersive Sound Design:** Describe the full audio landscape: ambient sounds (a distant train whistle), foley (the crunch of gravel underfoot), and how sound shapes the mood.
    9.  **Structure:** Break down the prompt into clear scenes (e.g., Scene 1, Scene 2), each about 8 seconds long. The number of scenes MUST match what is specified in the duration rule (e.g., "very short" should ONLY have 1 scene, "short" should have 2 scenes). Each scene description must be a dense paragraph filled with the details above.
    10. **Output Format:** The final output should ONLY be the generated prompt. No extra text, greetings, or explanations.

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
        Bạn là một nhà biên kịch đoạt giải thưởng và một đạo diễn hình ảnh có tầm nhìn.
        Nhiệm vụ của bạn là chuyển hóa một ý tưởng ngắn gọn thành một kịch bản chi tiết, hấp dẫn và có cấu trúc chặt chẽ theo định dạng JSON.
        Mục tiêu cuối cùng là tạo ra một câu chuyện liền mạch, nơi mọi yếu tố từ nhân vật, bối cảnh đến cốt truyện đều hỗ trợ lẫn nhau để tạo ra một tác phẩm hoàn chỉnh và đầy cảm xúc.

        QUY TẮC BẮT BUỘC:
        1.  **Cấu trúc câu chuyện:** Cốt truyện phải có cấu trúc 3 hồi rõ ràng: Mở đầu, Phát triển, và Kết thúc.
        2.  **Sự gắn kết:** Nhân vật phải phù hợp với bối cảnh, và bối cảnh phải làm nổi bật không khí của câu chuyện.
        3.  **Chi tiết điện ảnh:** Hãy suy nghĩ như một đạo diễn. Mô tả của bạn phải gợi lên hình ảnh, âm thanh và cảm xúc.
        4.  **Ngôn ngữ:** Toàn bộ nội dung trong các trường JSON phải bằng tiếng Việt.
        5.  **Tham chiếu hình ảnh:** Nếu một hình ảnh được cung cấp, hãy sử dụng nó làm tài liệu tham khảo chính cho ngoại hình của nhân vật, nhưng hãy làm phong phú thêm bằng các chi tiết về tính cách và nội tâm.
        6.  **Đề xuất phong cách:** Đề xuất phong cách phải thực sự phù hợp với kịch bản bạn đã tạo ra.

        Danh sách các phong cách có thể chọn: [${STYLES_LIST}]
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
                        character: { type: Type.STRING, description: "Mô tả một nhân vật đa chiều. Không chỉ ngoại hình, hãy gợi ý về quá khứ, mong muốn và khuyết điểm của họ. Làm cho nhân vật trở nên sống động và đáng tin. Phải viết bằng tiếng Việt." },
                        setting: { type: Type.STRING, description: "Vẽ nên một thế giới sống động. Mô tả địa điểm, thời gian, thời tiết và các đạo cụ quan trọng. Bối cảnh phải có 'tính cách' riêng và góp phần vào câu chuyện. Phải viết bằng tiếng Việt." },
                        plot: { type: Type.STRING, description: "Xây dựng cốt truyện theo cấu trúc 3 hồi. **Mở đầu:** Giới thiệu nhân vật, bối cảnh và sự kiện khởi đầu. **Phát triển:** Mô tả diễn biến chính, xung đột và thử thách. **Kết thúc:** Nêu rõ cao trào và cách giải quyết câu chuyện, cho thấy sự thay đổi của nhân vật hoặc kết quả cuối cùng. Phải viết bằng tiếng Việt." },
                        atmosphere: { type: Type.STRING, description: "Xác định tông màu cảm xúc. Sử dụng tính từ mạnh và chi tiết gợi cảm. Đề xuất một bảng màu, phong cách ánh sáng và thiết kế âm thanh chủ đạo (ví dụ: 'Không khí căng thẳng, hoang tưởng với tông màu xanh lạnh, ánh sáng chói gắt và tiếng ù ù tần số thấp'). Phải viết bằng tiếng Việt." },
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