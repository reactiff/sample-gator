import ClosedCircuitBuffer from "../ClosedCircuitBuffer";
import { SerieOptions, AggregateFn1Def, AggregateFn1, CustomAggregateFnDef, CustomAggregateFn, CustomAggregateVoidCallback } from '../types';

export type CompetingValuePair = { current?: number, best?: number };

const fnMin: AggregateFn1Def = (serie: Serie, options: SerieOptions, n: number, offset?: number) => {
    const availLength = serie.availableLength||0;
    const limit = Math.min(availLength, n);
    const v: CompetingValuePair = {};
    const { track, field } = serie;
    track.lifo(idx => {
        v.current = track.array[idx.index][field];
        if (typeof v.current !== 'undefined') {
            if (typeof v.best === 'undefined' || v.current < v.best) {
                v.best = v.current;
            }
        }
    }, offset||0, limit)
    return v.best;
}

const fnMax: AggregateFn1Def = (serie: Serie, options: SerieOptions, n: number, offset?: number) => {
    const availLength = serie.availableLength||0;
    const limit = Math.min(availLength, n);
    const v: CompetingValuePair = {};
    const { track, field } = serie;
    track.lifo(idx => {
        v.current = track.array[idx.index][field];
        if (typeof v.current !== 'undefined') {
            if (typeof v.best === 'undefined' || v.current > v.best) {
                v.best = v.current;
            }
        }
    }, offset||0, limit);
    return v.best;
}


const fnSum: AggregateFn1Def = (serie: Serie, options: SerieOptions, n: number, offset?: number) => {
    const availLength = serie.availableLength||0;
    const limit = Math.min(availLength, n);
    let sum = 0;
    const { track, field } = serie;
    track.lifo(idx => {
        sum += track.array[idx.index][field];
    }, offset||0, limit);
    return sum;
}

const fnMean: AggregateFn1Def = (serie: Serie, options: SerieOptions, n: number, offset?: number) => {
    const availLength = serie.availableLength||0;
    const limit = Math.min(availLength, n);
    let sum = 0;
    let cnt = 0;
    const { track, field } = serie;
    track.lifo(idx => {
        sum += track.array[idx.index][field];
        cnt++;
    }, offset||0, limit);
    if (cnt === 0) return undefined;
    return sum / cnt;
}

const fnCustom = (serie: Serie, options: SerieOptions, n: number, offset: number, callback: CustomAggregateVoidCallback) => {
    const availLength = serie.availableLength||0;
    const limit = Math.min(availLength, n);
    const { track, field } = serie;
    track.lifo(idx => {
        callback(idx, track.array[idx.index][field])
    }, offset||0, limit);
    return undefined;
}

/**
 * Uses Bessel's correction of bias.
 * @param {array} array 
 */
 
const fnStDev: AggregateFn1Def = (serie: Serie, options: SerieOptions, n: number, offset?: number) => {
    const availLength = serie.availableLength||0;
    const limit = Math.min(availLength, n);
    const { track, field } = serie;
    const mean = serie.mean(n, offset)!;
    let sumOfSq = 0;
    let cnt = 0;
    serie.fn(n, offset||0, (pos, val) => {
        sumOfSq += (val - mean) ** 2;
        cnt++;
    });
    if (cnt === 0) return undefined;
    return Math.sqrt(sumOfSq / cnt);
}

function attachAggregateFn(serie: Serie, options: SerieOptions, fn: AggregateFn1Def) {
    return (n: number, offset = 0) => {
        if (offset > 0) throw new Error('offset must be negative');
        return fn(serie, options, n, offset);
    };
}
function attachCustomAggregateFn(serie: Serie, options: SerieOptions, fn: CustomAggregateFnDef) {
    return (n: number, offset = 0, callback: CustomAggregateVoidCallback) => {
        if (offset > 0) throw new Error('offset must be negative');
        return fn(serie, options, n, offset, callback);
    };
}

export default class Serie {
    
    fn:  CustomAggregateFn;
    min: AggregateFn1;
    max: AggregateFn1;

    mean: AggregateFn1;
    
    stDev: AggregateFn1;

    value: (offset?: number) => number | undefined;

    track: ClosedCircuitBuffer;
    field: string;

    constructor(options: SerieOptions) {
        this.track = options.track;
        this.field = options.field;

        this.min = attachAggregateFn(this, options, fnMin);
        this.max = attachAggregateFn(this, options, fnMax);
        this.mean = attachAggregateFn(this, options, fnMean);
        this.fn  = attachCustomAggregateFn(this, options, fnCustom);
        this.stDev = attachAggregateFn(this, options, fnStDev);

        this.value = (offset = 0) => {
            const availLength = this.track.getOffsetAdjAvailableLength(offset);
            if (availLength === 0) return undefined;
            return this.track.get(offset)[this.field];
        }
    }

    get availableLength() {
        const availLength = this.track.getOffsetAdjAvailableLength(0);
        return availLength;
    }
    

    static createSerie(field: string, track: ClosedCircuitBuffer) {
        return new Serie({
            field,
            track,
        });
    }
}