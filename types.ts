export enum Duration {
  VeryShort = 'very_short',
  Short = 'short',
  Medium = 'medium',
  Long = 'long',
  VeryLong = 'very_long',
  Epic = 'epic',
}

export type DurationOption = {
  value: Duration;
  label: string;
  description: string;
};

export enum Language {
  Vietnamese = 'vietnamese',
  English = 'english',
  Japanese = 'japanese',
}

export type LanguageOption = {
  value: Language;
  label: string;
  description: string;
};

export enum Voice {
  Default = 'default',
  Child = 'child',
  TeenMale = 'teen_male',
  TeenFemale = 'teen_female',
  AdultMale = 'adult_male',
  AdultFemale = 'adult_female',
  ElderlyMale = 'elderly_male',
  ElderlyFemale = 'elderly_female',
}

export type VoiceOption = {
  value: Voice;
  label: string;
  description: string;
};

export enum Style {
  Cinematic = 'cinematic',
  Anime = 'anime',
  Claymation = 'claymation',
  PixelArt = 'pixel_art',
  Documentary = 'documentary',
  Surreal = 'surreal',
  Hyperrealistic = 'hyperrealistic',
  Watercolor = 'watercolor',
  Cartoon = 'cartoon',
  Lego = 'lego',
  Vintage = 'vintage',
  Noir = 'noir',
  Vaporwave = 'vaporwave',
  Steampunk = 'steampunk',
  Cyberpunk = 'cyberpunk',
  Fantasy = 'fantasy',
  Horror = 'horror',
  Sketch = 'sketch',
  Gothic = 'gothic',
  Psychedelic = 'psychedelic',
  Minimalist = 'minimalist',
  Cartoon1930s = 'cartoon_1930s',
  Cartoon80s = 'cartoon_80s',
  AnimatedSitcom = 'animated_sitcom',
  ThreeDAnimation = '3d_animation',
  Papercraft = 'papercraft',
  OilPainting = 'oil_painting',
  GlitchArt = 'glitch_art',
  StopMotion = 'stop_motion',
  UkiyoE = 'ukiyo_e',
  Macro = 'macro',
  DroneFootage = 'drone_footage',
}

export type StyleOption = {
  value: Style;
  label: string;
  description: string;
};

export type Script = {
  character: string;
  setting: string;
  plot: string;
  atmosphere: string;
  styleSuggestion: string;
};
