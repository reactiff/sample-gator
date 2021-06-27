import Serie from './Serie';
import createSeries from './Serie/createSeries';
import {
    IteratorCallback,
    IteratorPosition,
    Sampler,
    Dictionary,
} from './types';

function _preload(track: ClosedCircuitBuffer, data: any) {
    const sampleTime = track.sampler.getSampleTime(data[track.sampler.timeKey]);

    if (!track.lastPeriodTime) {
        track.lastPeriodTime = sampleTime;
    } 
    else if (track.sampler.newSamplePredicate(track.current, data, sampleTime, track.lastPeriodTime)) { // shouldAdvance?
        if (!advance(track, sampleTime, true)) {
            return false; // done
        }     
    }

    track.sampler.collect(track, track.current, data, sampleTime);

    return true;
}

function _capture(track: ClosedCircuitBuffer, data: any) {
    
    const sampleTime = track.sampler.getSampleTime(data[track.sampler.timeKey]);
    let loadingComplete = false;

    if (!track.lastPeriodTime) {
        track.lastPeriodTime = sampleTime;
    } 
    else if (track.sampler.newSamplePredicate(track.current, data, sampleTime, track.lastPeriodTime)) {
        advance(track, sampleTime, false);     
    }

    track.sampler.collect(track, track.current, data, sampleTime);
    
    if (track.onUpdate) track.onUpdate();
}

function increment(track: ClosedCircuitBuffer) {
    track.counter++;
    track.cursor++;
    if (track.cursor === track.array.length) {
        track.cursor = 0;
    }
}

export function advance(track: ClosedCircuitBuffer, nextTime?: number, preload?: boolean) {
    
    if (preload && track.counter + 1 === track.length) return false;

    const time = nextTime || track.current[track.sampler.timeKey];
    
    // if any samples were skipped, fill them before capturing
    if (track.sampler.interval > 0) {
        fillMissingSamples(track, time);
    }

    increment(track);
    
    Object.assign(track.array[track.cursor], track.sampler.blank);
    track.array[track.cursor][track.sampler.timeKey] = time;
    track.lastPeriodTime = time;

    return true;
}

function fillMissingSamples(track: ClosedCircuitBuffer, time: number) {

    // when loading from history, we need to account for missing data
    // and insert missing samples, something that would normally
    // be taken care of by the timer

    let normallySkippedMax = 1;
    if (track.sampler.suppressAutoSampling) {
        normallySkippedMax = 0;
    }

    if (track.sampler.interval > 0 && track.lastPeriodTime) {
        const elapsed = time - track.lastPeriodTime;
        const missingSamples = elapsed / track.sampler.interval - normallySkippedMax;
        if (missingSamples > 0) {
            for (let i = 0; i<missingSamples; i++) {

                const insertedTime = track.lastPeriodTime + track.sampler.interval;

                increment(track);

                Object.assign(track.array[track.cursor], track.sampler.blank);
                track.array[track.cursor][track.sampler.timeKey] = insertedTime;
                
                const prevSlot = track.get(-1);
                track.sampler.ffill(track.array[track.cursor], prevSlot);                          
                
                track.lastPeriodTime = insertedTime;
            }
        }
    }
}

class ClosedCircuitBuffer {
    key: string = '';
    tags: any = {};
    array: any[] = [];
    cursor: number = 0;
    counter = 0;
    lastPeriodTime: number = 0;
    sampler: Sampler;
    serieInstances: any = {};
    series: Dictionary<Serie> = {};
    onUpdate?: () => void;

    constructor(length: number, sampler: Sampler) {
        const arrayLike = { length }; 
        this.sampler = sampler!;
        this.array = Array.from(arrayLike).map(this.sampler.createSample);
        this.cursor = length ? 0 : -1;
        createSeries(this);
    }

    /** 
      * Preload buffer with data
      * @param data 
      * */
    preload(data: any) {
        return _preload(this, data);
    }

    /**
     * Record real-time data from a stream
     * @param data 
     */
    capture(data: any) {
        _capture(this, data);
    }
    
    lifo(callback: IteratorCallback, offset: number, limit = -1) {
        const absOffset     = Math.abs(offset || 0);
        const requestedLmt  = limit >= 0 ? Math.abs(limit) : 0;
        const offsetAdjLmt  = this.array.length - absOffset;
        const pos: IteratorPosition = {
            index: this.cursor - absOffset, // starting position (adjusted for offset)
            relative: 0,                    
            ordinal: 0,                     // zero based iteration number
        };
        let j   = this.array.length;
        while (j--) {
            if (absOffset  && pos.ordinal >= offsetAdjLmt) break;
            if (limit >= 0 && pos.ordinal >= requestedLmt) break;
            // loop around
            if (pos.index < 0) pos.index = this.array.length - 1; 
            callback(pos, this.array);
            pos.ordinal++;
            pos.index--;
            pos.relative--;
        }
    }

    fifo(callback: IteratorCallback, limit = -1) {
        const arrlen = this.array.length;
        let lmt = limit >= 0 ? limit : arrlen;
        const pos: IteratorPosition = {
            index: 0,                   
            relative: -(arrlen - 1),                    
            ordinal: 0,                 
        };
        let j = arrlen;
        let i = 0;
        while (j-- && lmt--) {
            pos.index = (arrlen + this.cursor - j) % arrlen;
            callback(pos, this.array);
            pos.ordinal++;
            pos.relative++;
        }
    }

    ////////////////////////////////////////////////////////

    get length() {
        return this.array.length;
    }

    get current() {
        return this.array[this.cursor];
    }

    get(offset = 0) {
        return this.array[this.getIndex(offset)];
    }

    getIndex(offset = 0) {
        let index = this.cursor + offset
        if (offset > 0) {
            return index  % this.array.length;
        }
        while (index < 0) {
            index = this.array.length + index;
        }
        return index;
    }
}

export default ClosedCircuitBuffer;

