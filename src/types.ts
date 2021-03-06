import ClosedCircuitBuffer from "./ClosedCircuitBuffer";
import Serie from "./Serie";

export type Dictionary<T> = { [index: string]: T };

export type IteratorPosition = {  
    index: number,
    relative: number,
    ordinal: number,
};
export type IteratorCallback = (
    position: IteratorPosition, 
    buffer: any[]
) => void;

export type SampleData  = any;
export type SampleFactory = () => any;

export type ICollect  = (
    buffer: ClosedCircuitBuffer,
    currSlot: any,
    data: any,
    time: number,
) => void;

export type NewSamplePredicate = (
    currSlot: any,
    // prevSlot: any,
    data: any,
    time: number,
    lastPeriodTime: number,
) => boolean;

export type ForwardFill = (
    track: ClosedCircuitBuffer,
) => void;


export type FieldDict = {
    keys:           string[],
    publicKeys:     string[],
    hiddenKeys:     string[],
    expressionKeys: string[],
    ffills:         any[],
    hidden:         any,
    cumulative:     any,
    fn:             any,
    fill:           any,
};

export type Sampler = {
    series:                 Dictionary<Serie>,
    fields:                 FieldDict,
    cumulatives:            string[],
    timeKey:                string;
    createSample:           SampleFactory;
    collect:                ICollect;
    interval:               number;
    bufferLength:           number;
    newSamplePredicate:     NewSamplePredicate;
    getSampleTime:          (time: number) => number;
    trackKeys:              string[];
    tracks:                 ClosedCircuitBuffer[];
    suppressAutoSampling?:  boolean;
    ffill:                  ForwardFill;
    blank:                  any;
    expressions:            any[];
    expressionDict:         Dictionary<Expression>;
    addExpression:          (name: string, expression: Expression) => void;
}

export type SamplerOptions = {
    timeKey?:               string;
    interval:               number;
    bufferLength:           number;
    fields:                 SampleFields;
    trackKeys?:             string[];
    suppressAutoSampling?:  boolean;
}

// aggregator types
export type AccumulationFunction        = (data: any, currentAggregateValue?: number, accumulation?: any) => number | undefined;
export type ForwardFillFunction         = (data: any, previousValue: any) => number | undefined;

export type SampleFieldUnnamed          = { fn: AccumulationFunction, cumulative?: boolean, fill?: ForwardFillFunction };
export type SampleFieldDictEntry        = SampleFieldUnnamed | AccumulationFunction | string | number;

export type SampleFieldNamed            = { name: string, fn: AccumulationFunction, cumulative?: boolean, fill?: ForwardFillFunction };
export type SampleFieldArrayItem        = SampleFieldNamed | string;
export type SampleFieldArray            = SampleFieldArrayItem[];

export type SampleFields                = Dictionary<SampleFieldDictEntry> | SampleFieldArray;
export type ConditionalOp               = () => number | undefined;

export type SerieFactory                = () => Serie;

export type SerieOptions = {
    field:   string,
    track:  ClosedCircuitBuffer,
};

export type AggregateFn1Def             = (serie: Serie, options: SerieOptions, n: number, offset?: number) => number | undefined;
export type AggregateFn1                = (                                     n: number, offset?: number) => number | undefined;

export type CustomAggregateVoidCallback = (pos: IteratorPosition, value: number) => void;
export type CustomAggregateFnDef        = (serie: Serie, options: SerieOptions, n: number, offset: number, callback: CustomAggregateVoidCallback) => void;
export type CustomAggregateFn           = (                                     n: number, offset: number, callback: CustomAggregateVoidCallback) => void;


export type BufferFilter                = (name: string, buffer: ClosedCircuitBuffer) => boolean;
export type SamplingOrchestratorOptions = { samplers: Sampler[] };

export type SamplerEvent         = 'onTrackStart';

export type Expression                  = (series: Dictionary<Serie>) => number | undefined;