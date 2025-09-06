import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Play, Pause, RotateCcw, Save, Sparkles } from '@phosphor-icons/react';

import { scheduleAutoCreate } from '@/autoCreate/scheduler';
import type { 
  EffectId, 
  Intensity, 
  AutoCreateResult, 
  AutoCreateConfig, 
  Beat, 
  EffectEvent, 
  CutEvent 
} from '@/autoCreate/types';

// Mock data for demonstration
const MOCK_BEATS: Beat[] = [
  { t: 0.5, strength: 0.8 },
  { t: 1.0, strength: 0.6 },
  { t: 1.5, strength: 0.9 },
  { t: 2.0, strength: 0.4 },
  { t: 2.5, strength: 0.7 },
  { t: 3.0, strength: 0.95 },
  { t: 3.5, strength: 0.3 },
  { t: 4.0, strength: 0.8 },
  { t: 4.5, strength: 0.5 },
  { t: 5.0, strength: 1.0 },
  { t: 5.5, strength: 0.6 },
  { t: 6.0, strength: 0.7 },
  { t: 6.5, strength: 0.4 },
  { t: 7.0, strength: 0.9 },
  { t: 7.5, strength: 0.8 },
  { t: 8.0, strength: 0.6 },
];

const EFFECT_LABELS: Record<EffectId, string> = {
  flash: 'Flash',
  punchIn: 'Punch-In',
  glitch: 'Glitch',
  strobe: 'Strobe',
  speedRamp: 'Speed-Ramp',
  cutOnBeat: 'Cut-On-Beat',
};

interface AutoCreateProps {
  onBack: () => void;
}

const AutoCreate: React.FC<AutoCreateProps> = ({ onBack }) => {
  const [config, setConfig] = useState<AutoCreateConfig>({
    selectedEffects: ['flash', 'punchIn'],
    intensityPreset: 'med',
    seed: Math.floor(Math.random() * 10000),
    respectShotBoundaries: true,
  });

  const [result, setResult] = useState<AutoCreateResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);

  const totalDuration = 8.0; // Mock 8-second track

  // Playback simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration]);

  const handleEffectToggle = (effectId: EffectId, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      selectedEffects: checked
        ? [...prev.selectedEffects, effectId]
        : prev.selectedEffects.filter(id => id !== effectId)
    }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      // Simulate loading beats.json
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Generate result
      setProgress(50);
      const generated = scheduleAutoCreate({
        beats: MOCK_BEATS,
        selectedEffects: config.selectedEffects,
        preset: config.intensityPreset,
        seed: config.seed,
        shots: config.respectShotBoundaries ? [
          { start: 0, end: 2.5 },
          { start: 2.5, end: 5.0 },
          { start: 5.0, end: 8.0 },
        ] : undefined,
      });
      
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setResult(generated);
      setProgress(100);
      toast.success(`Generated ${generated.effects.length} effects and ${generated.cuts.length} cuts`);
      
    } catch (error) {
      toast.error('Failed to generate auto-create result');
      console.error(error);
    } finally {
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleReroll = () => {
    setConfig(prev => ({
      ...prev,
      seed: Math.floor(Math.random() * 10000)
    }));
  };

  const handleClear = () => {
    setResult(null);
    setCurrentTime(0);
    setIsPlaying(false);
  };

  const handleCommit = async () => {
    if (!result) return;
    
    try {
      // Mock cutlist JSON structure
      const cutlist = {
        version: "1.0",
        segments: result.cuts.map((cut, i) => ({
          id: i,
          start: i === 0 ? 0 : result.cuts[i-1].at,
          end: cut.at,
          effects: result.effects.filter(eff => 
            eff.at >= (i === 0 ? 0 : result.cuts[i-1].at) && eff.at < cut.at
          ),
        })),
        metadata: {
          seed: result.seed,
          preset: result.preset,
          generatedAt: new Date().toISOString(),
        },
      };
      
      // In a real implementation, this would write to render/cutlist.json
      console.log('Would write cutlist.json:', cutlist);
      toast.success('Committed to render pipeline');
      
    } catch (error) {
      toast.error('Failed to commit to cutlist');
      console.error(error);
    }
  };

  const getActiveEffectsAtTime = (time: number): EffectEvent[] => {
    if (!result) return [];
    return result.effects.filter(eff => 
      eff.at <= time && time <= (eff.at + (eff.dur || 0))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
            <Sparkles className="text-primary" size={32} weight="fill" />
            <h1 className="text-3xl font-bold text-foreground">
              Auto-Create: Beat-Driven Montage
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Library (Mock) */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-3 border rounded bg-muted/50">
                  <div className="text-sm font-medium">sample_track.mp3</div>
                  <div className="text-xs text-muted-foreground">8.0s • 120 BPM</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Beats analyzed: {MOCK_BEATS.length} detected
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Center: Preview */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock video preview */}
                <div className="aspect-video bg-black rounded-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <div className="text-white/70 text-sm">Video Preview</div>
                  </div>
                  
                  {/* Effect overlays */}
                  {getActiveEffectsAtTime(currentTime).map((effect, i) => (
                    <div key={i} className="absolute inset-0 pointer-events-none">
                      {effect.id === 'flash' && (
                        <div className="absolute inset-0 bg-white/50 animate-pulse" />
                      )}
                      {effect.id === 'glitch' && (
                        <div className="absolute inset-0 bg-red-500/20 animate-bounce" />
                      )}
                      {effect.id === 'strobe' && (
                        <div className="absolute inset-0 bg-yellow-500/30 animate-ping" />
                      )}
                    </div>
                  ))}
                  
                  {/* Effect badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {getActiveEffectsAtTime(currentTime).map((effect, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {EFFECT_LABELS[effect.id]}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Playback controls */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    disabled={!result}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </Button>
                  <div className="flex-1">
                    <Progress value={(currentTime / totalDuration) * 100} />
                  </div>
                  <div className="text-xs text-muted-foreground min-w-16">
                    {currentTime.toFixed(1)}s / {totalDuration}s
                  </div>
                </div>

                {/* Timeline with markers */}
                <div className="relative">
                  <div className="h-8 bg-muted/50 rounded">
                    {/* Beat markers */}
                    {MOCK_BEATS.map((beat, i) => (
                      <div
                        key={i}
                        className="absolute top-0 w-0.5 h-8 bg-primary/50"
                        style={{ left: `${(beat.t / totalDuration) * 100}%` }}
                        title={`Beat at ${beat.t}s (strength: ${beat.strength?.toFixed(2)})`}
                      />
                    ))}
                    
                    {/* Effect markers */}
                    {result?.effects.map((effect, i) => (
                      <div
                        key={i}
                        className="absolute top-1 w-1 h-6 bg-yellow-500 rounded"
                        style={{ left: `${(effect.at / totalDuration) * 100}%` }}
                        title={`${EFFECT_LABELS[effect.id]} at ${effect.at.toFixed(2)}s`}
                      />
                    ))}
                    
                    {/* Cut markers */}
                    {result?.cuts.map((cut, i) => (
                      <div
                        key={i}
                        className="absolute top-0 w-0.5 h-8 bg-red-500"
                        style={{ left: `${(cut.at / totalDuration) * 100}%` }}
                        title={`Cut at ${cut.at.toFixed(2)}s`}
                      />
                    ))}
                    
                    {/* Playhead */}
                    <div
                      className="absolute top-0 w-0.5 h-8 bg-white z-10"
                      style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0s</span>
                    <span>{totalDuration}s</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Actions */}
          <Card className="bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle>Auto-Create Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Effect Selection */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Effects</Label>
                <div className="space-y-2">
                  {(Object.keys(EFFECT_LABELS) as EffectId[]).map(effectId => (
                    <div key={effectId} className="flex items-center space-x-2">
                      <Checkbox
                        id={effectId}
                        checked={config.selectedEffects.includes(effectId)}
                        onCheckedChange={(checked) => 
                          handleEffectToggle(effectId, checked as boolean)
                        }
                      />
                      <Label htmlFor={effectId} className="text-sm">
                        {EFFECT_LABELS[effectId]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Intensity */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Intensity</Label>
                <RadioGroup
                  value={config.intensityPreset}
                  onValueChange={(value: Intensity) => 
                    setConfig(prev => ({ ...prev, intensityPreset: value }))
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">Low</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="med" id="med" />
                    <Label htmlFor="med">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">High</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Seed */}
              <div>
                <Label htmlFor="seed" className="text-sm font-medium mb-2 block">
                  Seed
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="seed"
                    type="number"
                    value={config.seed}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, seed: parseInt(e.target.value) || 0 }))
                    }
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={handleReroll}>
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>

              {/* Respect Shot Boundaries */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="shotBoundaries"
                  checked={config.respectShotBoundaries}
                  onCheckedChange={(checked) => 
                    setConfig(prev => ({ ...prev, respectShotBoundaries: checked as boolean }))
                  }
                />
                <Label htmlFor="shotBoundaries" className="text-sm">
                  Respect shot boundaries
                </Label>
              </div>

              {/* Progress */}
              {isGenerating && (
                <div className="space-y-2">
                  <Label className="text-sm">Generating...</Label>
                  <Progress value={progress} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || config.selectedEffects.length === 0}
                  className="w-full"
                >
                  <Sparkles size={16} className="mr-2" />
                  Generate Beat-Sync
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleReroll}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    Re-roll
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClear}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
                
                <Button 
                  onClick={handleCommit}
                  disabled={!result || isGenerating}
                  variant="secondary"
                  className="w-full"
                >
                  <Save size={16} className="mr-2" />
                  Commit to Cutlist
                </Button>
              </div>

              {/* Results Summary */}
              {result && (
                <div className="space-y-2 p-3 bg-muted/50 rounded">
                  <div className="text-sm font-medium">Generated:</div>
                  <div className="text-xs text-muted-foreground">
                    • {result.effects.length} effects<br/>
                    • {result.cuts.length} cuts<br/>
                    • Seed: {result.seed}<br/>
                    • Preset: {result.preset}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutoCreate;