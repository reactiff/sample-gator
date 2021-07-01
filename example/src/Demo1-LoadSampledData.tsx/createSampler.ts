import Sampler, { ClosedCircuitBuffer } from "sample-gator";
import * as __ from "./setup";

export type TrackDataDictionary = { [index: string]: any[] };
export type SamplerEventHandlers = {
  onIntervalData?: () => void;
};

const _events: SamplerEventHandlers = {
  onIntervalData: undefined,
};

const input_buffer: any = {};
export const output: TrackDataDictionary = {};
export const columns: TrackDataDictionary = {};
export const tracks: ClosedCircuitBuffer[] = [];

const init = (eventHandlers: SamplerEventHandlers) => {
  Object.assign(_events, eventHandlers);

  // init INPUT placeholder
  Object.entries(__.FIELDS).forEach(([k, v]) => {
    input_buffer[k] = v.initial;
  });

  const gator = new Sampler({
    interval: __.INTERVAL,
    bufferLength: __.LENGTH,
    trackKeys: __.TRACK_KEYS,
    fields: __.FIELDS,
  });

  if (Reflect.has(__, "EXPRESSIONS")) {
    const xx = (__ as any).EXPRESSIONS;
    Object.entries(xx).forEach(([key, fn]: any[]) => {
      gator.addExpression(key, fn);
    });
  }

  const readTrackData = (track: ClosedCircuitBuffer) => {
    track.fifo((pos, buffer) => {
      output[track.key][pos.ordinal] = buffer[pos.index];
    });
  };

  gator.onTrackStart = (track) => {
    // create an output buffer for each track when one starts
    output[track.key] = new Array(__.LENGTH);
    tracks.push(track);
    columns[track.key] = Object.keys(track.series);
    track.onUpdate = () => {
      readTrackData(track);
    };
  };

  gator.onInterval = () => {
    tracks.forEach((track) => readTrackData(track));
    _events.onIntervalData && _events.onIntervalData();
  };

  if (__.PRELOADING_ENABLED) {
    __.PRELOAD(gator, input_buffer);
    _events.onIntervalData && _events.onIntervalData();
  }

  if (__.SAMPLING_ENABLED) {
    gator.startSampling();
  }

  if (__.SIMULATION_ENABLED) {
    __.SIMULATE(gator, input_buffer);
  }
};

export default init;
