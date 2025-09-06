export type Beat = { 
  t: number; 
  strength?: number 
};

export type EffectId =
  | "flash"
  | "punchIn"
  | "glitch"
  | "strobe"
  | "speedRamp"
  | "cutOnBeat";

export type Intensity = "low" | "med" | "high";

export type EffectEvent = {
  id: EffectId;
  at: number;             // seconds in song time
  dur?: number;           // seconds
  params?: Record<string, number | string | boolean>;
  confidence?: number;    // 0..1 (strength/spacing derived)
};

export type CutEvent = {
  at: number;             // seconds in song time
  snapToShot?: boolean;
};

export type AutoCreateResult = {
  effects: EffectEvent[];
  cuts: CutEvent[];
  seed: number;
  preset: Intensity;
};

export type Shot = {
  start: number;
  end: number;
};

export type BeatsData = {
  beats: Beat[];
  tempo?: number;
  tempoCurve?: Array<{ t: number; bpm: number }>;
};

export type AutoCreateConfig = {
  selectedEffects: EffectId[];
  intensityPreset: Intensity;
  seed: number;
  respectShotBoundaries: boolean;
};