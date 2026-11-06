export const accentPresets = [
  { id: 'violet', hsl: '243 100% 68%', borderHsl: '243 65% 55%' },
  { id: 'blue', hsl: '217 91% 60%', borderHsl: '217 72% 48%' },
  { id: 'green', hsl: '153 60% 42%', borderHsl: '153 60% 34%' },
  { id: 'rose', hsl: '344 76% 58%', borderHsl: '344 65% 46%' },
] as const;

export type AccentPreset = (typeof accentPresets)[number]['id'];

export function isAccentPreset(value: unknown): value is AccentPreset {
  return accentPresets.some((preset) => preset.id === value);
}
