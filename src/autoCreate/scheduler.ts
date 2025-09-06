import type { 
  Beat, 
  EffectId, 
  Intensity, 
  AutoCreateResult, 
  EffectEvent, 
  CutEvent, 
  Shot 
} from "./types";

// Simple seeded RNG for deterministic results
class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
}

interface PresetConfig {
  global: {
    minStrength: number;
    minSpacingSec: number;
    baseProb: number;
    cutStride: number;
    cutMinStrength: number;
  };
  effects: Record<EffectId, {
    minStrength: number;
    minSpacingSec: number;
    baseProb: number;
    durMin: number;
    durMax: number;
    params?: Record<string, any>;
  }>;
}

const PRESET_CONFIGS: Record<Intensity, PresetConfig> = {
  low: {
    global: {
      minStrength: 0.7,
      minSpacingSec: 1.0,
      baseProb: 0.3,
      cutStride: 4,
      cutMinStrength: 0.8,
    },
    effects: {
      flash: { minStrength: 0.7, minSpacingSec: 1.2, baseProb: 0.4, durMin: 0.08, durMax: 0.12 },
      punchIn: { minStrength: 0.7, minSpacingSec: 1.5, baseProb: 0.3, durMin: 0.3, durMax: 0.5, params: { scale: 1.05 } },
      glitch: { minStrength: 0.8, minSpacingSec: 1.0, baseProb: 0.2, durMin: 0.12, durMax: 0.2 },
      strobe: { minStrength: 0.7, minSpacingSec: 1.8, baseProb: 0.25, durMin: 0.2, durMax: 0.4 },
      speedRamp: { minStrength: 0.8, minSpacingSec: 2.0, baseProb: 0.2, durMin: 0.4, durMax: 0.8, params: { speedFrom: 0.75, speedTo: 1.25 } },
      cutOnBeat: { minStrength: 0.8, minSpacingSec: 0, baseProb: 1.0, durMin: 0, durMax: 0 },
    },
  },
  med: {
    global: {
      minStrength: 0.5,
      minSpacingSec: 0.75,
      baseProb: 0.5,
      cutStride: 2,
      cutMinStrength: 0.6,
    },
    effects: {
      flash: { minStrength: 0.5, minSpacingSec: 0.8, baseProb: 0.6, durMin: 0.08, durMax: 0.12 },
      punchIn: { minStrength: 0.5, minSpacingSec: 1.0, baseProb: 0.5, durMin: 0.3, durMax: 0.5, params: { scale: 1.1 } },
      glitch: { minStrength: 0.6, minSpacingSec: 0.6, baseProb: 0.4, durMin: 0.12, durMax: 0.2 },
      strobe: { minStrength: 0.5, minSpacingSec: 1.2, baseProb: 0.45, durMin: 0.2, durMax: 0.4 },
      speedRamp: { minStrength: 0.6, minSpacingSec: 1.5, baseProb: 0.35, durMin: 0.4, durMax: 0.8, params: { speedFrom: 0.75, speedTo: 1.25 } },
      cutOnBeat: { minStrength: 0.6, minSpacingSec: 0, baseProb: 1.0, durMin: 0, durMax: 0 },
    },
  },
  high: {
    global: {
      minStrength: 0.3,
      minSpacingSec: 0.5,
      baseProb: 0.7,
      cutStride: 1,
      cutMinStrength: 0.4,
    },
    effects: {
      flash: { minStrength: 0.3, minSpacingSec: 0.4, baseProb: 0.8, durMin: 0.08, durMax: 0.12 },
      punchIn: { minStrength: 0.3, minSpacingSec: 0.6, baseProb: 0.7, durMin: 0.3, durMax: 0.5, params: { scale: 1.15 } },
      glitch: { minStrength: 0.4, minSpacingSec: 0.3, baseProb: 0.6, durMin: 0.12, durMax: 0.2 },
      strobe: { minStrength: 0.3, minSpacingSec: 0.8, baseProb: 0.65, durMin: 0.2, durMax: 0.4 },
      speedRamp: { minStrength: 0.4, minSpacingSec: 1.0, baseProb: 0.5, durMin: 0.4, durMax: 0.8, params: { speedFrom: 0.75, speedTo: 1.25 } },
      cutOnBeat: { minStrength: 0.4, minSpacingSec: 0, baseProb: 1.0, durMin: 0, durMax: 0 },
    },
  },
};

function makeEffectEvent(
  effectId: EffectId,
  time: number,
  strength: number,
  config: PresetConfig['effects'][EffectId],
  rng: SeededRNG
): EffectEvent {
  const durRange = config.durMax - config.durMin;
  const duration = config.durMin + rng.next() * durRange;
  
  return {
    id: effectId,
    at: time,
    dur: duration,
    params: { ...config.params },
    confidence: strength * config.baseProb,
  };
}

function resolveCollisions(effects: EffectEvent[], minGap: number): EffectEvent[] {
  if (effects.length <= 1) return effects;
  
  // Sort by time
  const sorted = [...effects].sort((a, b) => a.at - b.at);
  const result: EffectEvent[] = [];
  
  for (const effect of sorted) {
    const lastResult = result[result.length - 1];
    
    if (!lastResult || effect.at - lastResult.at >= minGap) {
      result.push(effect);
    } else {
      // Keep the one with higher confidence
      if (effect.confidence! > lastResult.confidence!) {
        result[result.length - 1] = effect;
      }
    }
  }
  
  return result;
}

function snapToShotBoundary(shots: Shot[], time: number): number {
  let bestTime = time;
  let minDistance = Infinity;
  
  for (const shot of shots) {
    const distToStart = Math.abs(time - shot.start);
    const distToEnd = Math.abs(time - shot.end);
    
    if (distToStart < minDistance) {
      minDistance = distToStart;
      bestTime = shot.start;
    }
    
    if (distToEnd < minDistance) {
      minDistance = distToEnd;
      bestTime = shot.end;
    }
  }
  
  return bestTime;
}

export function scheduleAutoCreate(args: {
  beats: Beat[];
  selectedEffects: EffectId[];
  preset: Intensity;
  seed: number;
  shots?: Shot[];
}): AutoCreateResult {
  const { beats, selectedEffects, preset, seed, shots } = args;
  const rng = new SeededRNG(seed);
  const config = PRESET_CONFIGS[preset];
  
  const effects: EffectEvent[] = [];
  const cuts: CutEvent[] = [];
  
  // Schedule effects (excluding cutOnBeat)
  for (const effectId of selectedEffects) {
    if (effectId === "cutOnBeat") continue;
    
    const effectConfig = config.effects[effectId];
    let lastAt = -Infinity;
    
    for (const beat of beats) {
      const strength = beat.strength ?? 0.5;
      
      // Check strength threshold
      if (strength < effectConfig.minStrength) continue;
      
      // Check spacing
      if (beat.t - lastAt < effectConfig.minSpacingSec) continue;
      
      // Probability calculation
      const prob = effectConfig.baseProb * (0.5 + 0.5 * strength);
      if (rng.next() < prob) {
        const event = makeEffectEvent(effectId, beat.t, strength, effectConfig, rng);
        effects.push(event);
        lastAt = event.at;
      }
    }
  }
  
  // Schedule cuts
  if (selectedEffects.includes("cutOnBeat")) {
    const stride = config.global.cutStride;
    for (let i = 0; i < beats.length; i += stride) {
      const beat = beats[i];
      const strength = beat.strength ?? 0.5;
      
      if (strength >= config.global.cutMinStrength) {
        cuts.push({ at: beat.t, snapToShot: true });
      }
    }
  }
  
  // De-conflict effects
  const dedupedEffects = resolveCollisions(effects, 0.15);
  
  // Snap cuts to shot boundaries if shots are provided
  const finalCuts = shots && shots.length > 0
    ? cuts.map(cut => ({ ...cut, at: snapToShotBoundary(shots, cut.at) }))
    : cuts;
  
  return {
    effects: dedupedEffects,
    cuts: finalCuts,
    seed,
    preset,
  };
}