import ClosedCircuitBuffer, { advance } from "./ClosedCircuitBuffer";
import { BufferFilter, Expression, Sampler, SamplerOptions, Dictionary } from './types';
import { createSampler } from './createSampler';
import { value as valueOrDefault } from './helpers';

const noFilter = () => true;

class Aggregator {  

  timer:          any;
  sampler:        Sampler;
  tracks:         Dictionary<ClosedCircuitBuffer> = {};
  sampling:       boolean         = false;
  
  // -- EVENTS 
  onTrackStart?:  (track: ClosedCircuitBuffer) => void;
  onInterval?:    () => void;
  onLoad?:        () => void;
  
  constructor(options: SamplerOptions) {
    this.sampler = createSampler(options);
  }

  addExpression(name: string, expression: Expression) {
    this.sampler.addExpression(name, expression);
  }

  getTracks(filter?: BufferFilter) {
    return Object.entries(this.tracks)
      .filter(kv => (filter || (() => true))(kv[0], kv[1]))
      .map(kv => kv[1]);
  }
  
  startSampling() {
    if (this.sampler.suppressAutoSampling) return;
    if (this.sampling) return;
    const _instance = this;
    // timer for buffer group
    this.timer = setInterval(() => {
      _instance.sampler.tracks.forEach((_track) => {
        advance(_track);
      })
      _instance.onInterval && _instance.onInterval();
    }, this.sampler.interval);
    this.sampling = true;
  }

  stopSampling() {
    clearInterval(this.timer);
    this.sampling = false;
  }

  preload(data: any) {
    const track = this.getOrCreateTrack(data);
    const loaded = track.preload(data);
    if (!loaded) this.onLoad && this.onLoad();
    return loaded;
  }

  capture(data: any, filter?: BufferFilter) {
    const track = this.getOrCreateTrack(data);
    track.capture(data);
  }

  getOrCreateTrack(data: any) {
    const sampler = this.sampler;
    const trackKey = sampler.trackKeys.map(pk => valueOrDefault(data[pk], '')).join('.');
    if (!this.tracks[trackKey]) {
        const track = new ClosedCircuitBuffer(sampler.bufferLength, sampler);
        sampler.trackKeys.forEach(pk => track.tags[pk] = data[pk]);
        track.key = trackKey;
        this.tracks[trackKey] = track;
        sampler.tracks.push(track);
        this.onTrackStart && this.onTrackStart(track);
    }
    return this.tracks[trackKey];
  }
}

export default Aggregator;
