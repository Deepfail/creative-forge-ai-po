import { scheduleAutoCreate } from '../scheduler';
import type { Beat, EffectId, Intensity } from '../types';

describe('Auto-Create Scheduler', () => {
  const mockBeats: Beat[] = [
    { t: 1.0, strength: 0.8 },
    { t: 2.0, strength: 0.6 },
    { t: 3.0, strength: 0.9 },
    { t: 4.0, strength: 0.4 },
    { t: 5.0, strength: 0.7 },
  ];

  test('produces deterministic results with same seed', () => {
    const args = {
      beats: mockBeats,
      selectedEffects: ['flash', 'punchIn'] as EffectId[],
      preset: 'med' as Intensity,
      seed: 12345,
    };

    const result1 = scheduleAutoCreate(args);
    const result2 = scheduleAutoCreate(args);

    expect(result1).toEqual(result2);
    expect(result1.seed).toBe(12345);
    expect(result1.preset).toBe('med');
  });

  test('produces different results with different seeds', () => {
    const baseArgs = {
      beats: mockBeats,
      selectedEffects: ['flash', 'punchIn'] as EffectId[],
      preset: 'med' as Intensity,
    };

    const result1 = scheduleAutoCreate({ ...baseArgs, seed: 111 });
    const result2 = scheduleAutoCreate({ ...baseArgs, seed: 222 });

    // Results should be different (very unlikely to be identical)
    expect(result1.effects).not.toEqual(result2.effects);
  });

  test('respects intensity presets', () => {
    const args = {
      beats: mockBeats,
      selectedEffects: ['flash'] as EffectId[],
      seed: 42,
    };

    const lowResult = scheduleAutoCreate({ ...args, preset: 'low' });
    const highResult = scheduleAutoCreate({ ...args, preset: 'high' });

    // High intensity should generally produce more effects
    expect(highResult.effects.length).toBeGreaterThanOrEqual(lowResult.effects.length);
  });

  test('generates cuts when cutOnBeat is selected', () => {
    const result = scheduleAutoCreate({
      beats: mockBeats,
      selectedEffects: ['cutOnBeat'] as EffectId[],
      preset: 'med',
      seed: 123,
    });

    expect(result.cuts.length).toBeGreaterThan(0);
    expect(result.effects.length).toBe(0); // cutOnBeat doesn't generate effects
  });

  test('filters effects by beat strength', () => {
    const weakBeats: Beat[] = [
      { t: 1.0, strength: 0.1 }, // Very weak
      { t: 2.0, strength: 0.2 }, // Weak
      { t: 3.0, strength: 0.9 }, // Strong
    ];

    const result = scheduleAutoCreate({
      beats: weakBeats,
      selectedEffects: ['flash'] as EffectId[],
      preset: 'med', // med preset has minStrength 0.5
      seed: 456,
    });

    // Should only place effects on strong beats
    result.effects.forEach(effect => {
      const beat = weakBeats.find(b => Math.abs(b.t - effect.at) < 0.01);
      expect(beat?.strength).toBeGreaterThanOrEqual(0.5);
    });
  });

  test('snaps cuts to shot boundaries when shots provided', () => {
    const shots = [
      { start: 0, end: 2.5 },
      { start: 2.5, end: 5.0 },
    ];

    const result = scheduleAutoCreate({
      beats: mockBeats,
      selectedEffects: ['cutOnBeat'] as EffectId[],
      preset: 'med',
      seed: 789,
      shots,
    });

    // All cuts should be close to shot boundaries
    result.cuts.forEach(cut => {
      const isNearShotBoundary = shots.some(shot => 
        Math.abs(cut.at - shot.start) < 0.1 || Math.abs(cut.at - shot.end) < 0.1
      );
      expect(isNearShotBoundary).toBe(true);
    });
  });

  test('resolves effect collisions', () => {
    // Create many strong beats close together to test collision resolution
    const denseBeats: Beat[] = Array.from({ length: 20 }, (_, i) => ({
      t: i * 0.1, // Every 100ms
      strength: 0.9,
    }));

    const result = scheduleAutoCreate({
      beats: denseBeats,
      selectedEffects: ['flash'] as EffectId[],
      preset: 'high',
      seed: 999,
    });

    // Check that no effects are too close together (minimum 150ms gap)
    for (let i = 1; i < result.effects.length; i++) {
      const gap = result.effects[i].at - result.effects[i-1].at;
      expect(gap).toBeGreaterThanOrEqual(0.149); // Allow for floating point precision
    }
  });

  test('generates valid effect parameters', () => {
    const result = scheduleAutoCreate({
      beats: mockBeats,
      selectedEffects: ['flash', 'punchIn', 'speedRamp'] as EffectId[],
      preset: 'med',
      seed: 111,
    });

    result.effects.forEach(effect => {
      expect(effect.at).toBeGreaterThanOrEqual(0);
      expect(effect.dur).toBeGreaterThan(0);
      expect(effect.confidence).toBeGreaterThan(0);
      expect(effect.confidence).toBeLessThanOrEqual(1);
      
      // Check effect-specific parameters
      if (effect.id === 'punchIn') {
        expect(effect.params?.scale).toBeDefined();
      }
      if (effect.id === 'speedRamp') {
        expect(effect.params?.speedFrom).toBeDefined();
        expect(effect.params?.speedTo).toBeDefined();
      }
    });
  });

  test('handles empty beats array gracefully', () => {
    const result = scheduleAutoCreate({
      beats: [],
      selectedEffects: ['flash'] as EffectId[],
      preset: 'med',
      seed: 123,
    });

    expect(result.effects).toEqual([]);
    expect(result.cuts).toEqual([]);
  });

  test('handles empty selectedEffects array gracefully', () => {
    const result = scheduleAutoCreate({
      beats: mockBeats,
      selectedEffects: [],
      preset: 'med',
      seed: 123,
    });

    expect(result.effects).toEqual([]);
    expect(result.cuts).toEqual([]);
  });
});