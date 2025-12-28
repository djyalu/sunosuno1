
export const PLACES = [
  { id: 'living_room', label: '🛋️ 거실 (Relaxing)', tags: 'Lounge, Background Music' },
  { id: 'gym', label: '💪 헬스장 (Workout)', tags: 'High Energy, Workout, Hardstyle' },
  { id: 'drive', label: '🚗 드라이브 (Drive)', tags: 'Driving, Night Drive' },
  { id: 'cafe', label: '☕ 카페 (Cafe)', tags: 'Cafe, Background Music' },
  { id: 'party', label: '🎉 파티 (Party)', tags: 'Party, Club, Dance' },
  { id: 'meditation', label: '🧘 명상 (Meditation)', tags: 'Meditation, 432Hz, Drone' },
  { id: 'bedroom', label: '🛏️ 내방 (Bedroom)', tags: 'Bedroom Pop, Chill' },
  { id: 'beach', label: '🏖️ 해변 (Beach)', tags: 'Summer, Upbeat, Festival' }
];

export const GENRES = [
  'Pop', 'K-Pop', 'J-Pop', 'R&B', 'Hip Hop', 'Rock', 'Alternative Rock',
  'Tropical House', 'Deep House', 'Future Bass', 'Progressive House', 'Tech House',
  'Synthwave', 'City Pop', 'Lo-fi', 'Chillwave', 'Vaporwave',
  'Jazz', 'Acid Jazz', 'Bossa Nova', 'Soul', 'Funk', 'Disco',
  'Acoustic', 'Folk', 'Indie Folk', 'Piano Ballad',
  'Cinematic', 'Orchestral', 'Ambient',
  'Trap', 'Drill', 'Phonk', 'Techno', 'Trance', 'Dubstep', 'DnB (Drum & Bass)',
  'Metal', 'Punk', 'Emo'
];

export const STRUCTURE_BLOCKS = [
  '[Intro]', '[Verse]', '[Pre-Chorus]', '[Chorus]', 
  '[Bridge]', '[Drop]', '[Solo]', '[Instrumental Interlude]', '[Outro]', '[Hook]', '[Rap Verse]'
];

export const STRUCTURE_PRESETS = [
  { label: 'K-Pop Dynamic', structure: ['[Intro]', '[Verse]', '[Pre-Chorus]', '[Chorus]', '[Rap Verse]', '[Bridge]', '[Chorus]', '[Outro]'] },
  { label: 'EDM Buildup', structure: ['[Intro]', '[Build-up]', '[Drop]', '[Verse]', '[Build-up]', '[Drop]', '[Outro]'] },
  { label: 'Standard Pop', structure: ['[Intro]', '[Verse 1]', '[Chorus]', '[Verse 2]', '[Chorus]', '[Bridge]', '[Chorus]', '[Outro]'] },
  { label: 'Hip-Hop/Trap', structure: ['[Intro]', '[Hook]', '[Verse 1]', '[Hook]', '[Verse 2]', '[Hook]', '[Outro]'] },
  { label: 'Ballad Emotional', structure: ['[Intro]', '[Verse 1]', '[Verse 2]', '[Chorus]', '[Bridge]', '[Chorus]', '[Outro]'] },
];

export const VOCAL_STYLES = [
  'Male Vocals', 'Female Vocals', 'Duet', 'Choir', 
  'Husky', 'Clear', 'Powerful', 'Soft', 'Falsetto', 'Rap', 'Whisper', 'Autotune'
];

export const MOODS = [
  'Epic (웅장한)', 'Emotional (감성적인)', 'Dark (어두운)', 'Uplifting (희망찬)', 
  'Melancholic (우울한)', 'Energetic (에너지)', 'Peaceful (평화로운)', 'Romantic (로맨틱)', 
  'Nostalgic (향수)', 'Aggressive (공격적)', 'Dreamy (몽환적)', 'Playful (경쾌한)', 
  'Mysterious (신비로운)', 'Triumphant (승리감)', 'Sexy (섹시한)', 'Groovy (흥겨운)'
];

export const INSTRUMENTS = [
  'Guitar', 'Piano', 'Synthesizer', 'Orchestra', 'Drums', 
  'Bass', 'Strings', 'Brass', 'Woodwinds', 'Electric Guitar',
  '808 Bass', 'Acoustic Guitar', 'Violin', 'Saxophone', 'Marimba', 'Steel Drums'
];

export const PRODUCTION_STYLES = [
  'Modern', 'Vintage', 'Lo-fi', 'Cinematic', 'High-Fidelity', 'Raw', 'Studio Quality'
];

export const DRUM_STYLES = [
  'Punchy & Tight', 'Minimal', 'Organic Swing', 'Trap/808', 'Big Room', 'Breakbeat', 'Rock', 'Latin Percussion'
];

export const BASS_STYLES = [
  '808 Sub', 'Slap Bass', 'Reese Bass', 'Acid 303', 'Groovy', 'Distorted', 'Synth Bass'
];

export const MIXING_STYLES = [
  'Wide Stereo', 'Warm/Analog', 'Bright/Crisp', 'Compressed/Loud', 'Atmospheric'
];

export const LANGUAGES = [
  'Korean', 'English', 'Japanese', 'Chinese', 'Spanish', 'French'
];