import Aggregator, { ClosedCircuitBuffer } from "sample-gator";
import * as __ from "./setup";
export type TrackDataDictionary = { [index: string]: any[] };
export type SamplerEventHandlers = {
  onLoad?: () => void;
  onIntervalData?: () => void;
  onTrackUpdate?: (track: ClosedCircuitBuffer) => void;
};

const _events: SamplerEventHandlers = {
  onLoad:         undefined,
  onIntervalData: undefined,
  onTrackUpdate:  undefined,
};

const input_buffer: any = {};
export const output: TrackDataDictionary = {};
export const columns: TrackDataDictionary = {};
export const tracks: ClosedCircuitBuffer[] = [];

const createSampler = (eventHandlers: SamplerEventHandlers) => {
  Object.assign(_events, eventHandlers);

  const gator = new Aggregator({
    interval: __.OUTPUT_INTERVAL,
    bufferLength: __.LENGTH,
    trackKeys: __.TRACK_KEYS,
    fields: __.FIELDS,
  });

  // init INPUT placeholder
  const blank = gator.sampler.createSample();
  Object.assign(input_buffer, blank);
  Object.entries(__.EXPRESSIONS).forEach(([key, fn]: any[]) => gator.addExpression(key, fn));

  gator.onTrackStart = (track) => {
    output[track.key] = new Array(__.LENGTH);
    tracks.push(track);
    columns[track.key] = Object.keys(track.series);
    track.onUpdate = () => {
      _events.onTrackUpdate && _events.onTrackUpdate(track);
    };
  };

  gator.onInterval  = () => _events.onIntervalData && _events.onIntervalData();
  gator.onLoad      = () => _events.onLoad && _events.onLoad();

  if (__.PRELOADING_ENABLED) {
    __.PRELOAD(gator, input_buffer);
  }

  if (__.SAMPLING_ENABLED) gator.startSampling();
  if (__.SIMULATION_ENABLED) __.SIMULATE(gator, input_buffer);

  return () => {
    gator.stopSampling();
  };
};

export default createSampler;
