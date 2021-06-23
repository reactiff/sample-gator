# sample-gator
Real-time streaming data sample-r and aggre-gator with closed-circuit recording, efficient memory management and FIFO/LIFO readout sweeps, providing endless (and seamless) data capture, and processing.

[![NPM](https://img.shields.io/npm/v/sample-gator.svg)](https://www.npmjs.com/package/sample-gator) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.comS)<img src="https://github.com/reactiff/sample-gator/raw/master/logo.jpg" alt="drawing" height="20" style="margin-left: 3px; margin-bottom: 0px; border-radius: 2px" />
  

## Why

You are building a real-time high frequency data processing app that does something along the lines of:
- IOT data collection / Sensor monitoring / Real-time analytics
- Algorithmic Trading / Real-time Risk analysis / Data Aggregation
- Audio / Video / Real-time Digital Signal Processing
- AI / ML Prediction / Classification / Regression
- Real-time Data Science
  

## What

This library will easily do the following for you:
- Capture and allocate real-time sporadic data into periodic, interval based samples
- Map data to custom fields (Series) 
- Perform spot, rolling and cumulative calculations e.g. min, max, mean, sum, stdev, etc.
- Interpolate and impute values across any number of axes
- Bifurcate/segregate data into tracks based on attributes
- Capture and synchronize data from multiple sources
  

## Flyweight Pattern

The lib offers several important advantages in Performance and Memory utilization, as it records data into Closed-circuit buffers caleld Tracks, similar to the way CCTV works.  
You may also know this Design Pattern as [Flyweight](https://en.wikipedia.org/wiki/Flyweight_pattern).  Each track is essentially an array of fixed length, 
containing empty placeholders in the shape of your data.   


## How
All you need to do is:
1. Set the sampling rate - the time interval in milliseconds between each sample.
2. Add fields with formulas

<br>

--- 

<br />

## Install 



```bash
yarn add sample-gator
```

<br>

--- 

<br />

## Usage in React
To use it in React, you need three files:

| File | Purpose | 
| - | - |
| App.tsx | To use or display the data |
| createSampler.ts | (no changes needed) |
| setup.ts | Your configuration, fields, calculations |

<br>

--- 

<br />


```tsx
// App.tsx - Write your app logic here.

import React, { useEffect, useState } from "react";
import createSampler, { tracks, columns } from './createSampler';
import MultiTrackTableRenderer from "../MultiTrackTableRenderer";

export default () => {
  const [dataSets, setDataSets] = useState<any>();

  // Init sampler
  useEffect(() => {

    createSampler({ 
      onTrackUpdate: () => {
        
        // Each track (if many) is read separately
        // buy you can combind data from multiple tracks
        
        const data = {};
                
        tracks.forEach(track => {

          const array   = new Array(track.length);
          const columns = columns[track.key];

          // instead of reading into an array, 
          // you can plot it into a chart, for example
          // for more efficiency
          track.fifo((pos, buffer) => {
            items[pos.ordinal] = buffer[pos.index];
          });

          data[track.key] = { array, columns };

        });

        // data from all tracks are here
        // indexed by track key
        setDataSets(data);

      }
    })
  }, []);
  return <>
    {Object.entries(dataSets).map(([key, value]) => 
        <DataTable key={key} data={value.array} columns={value.columns} />
    )}
  </>
}
```

<br>

--- 

<br />

## This is the setup script in three parts.  Define your cfields and custom expressions here.

```ts
// setup.ts                     - Configure your fields and calculations here

import Sampler from "sample-gator";
import RandomWalk from '@reactiff/random-walk';

export const INTERVAL = 1000; // ms
export const LENGTH = 20;
export const FIELDS: any = {
  time:   { fn: (d: any) => d.time },
  price:  { fn: (d: any) => d.price,  fill: (d: any, pv: any) => pv },
  qty:    { fn: (d: any) => d.qty,    fill: (d: any, pv: any) => pv },
  exch:   { fn: (d: any) => d.exch,   fill: (d: any, pv: any) => pv },
};

// Combination of fields making up unique tracks
export const TRACK_KEYS = ["exch"];

// DATA LOADING AND SIMULATION
export const SAMPLING_ENABLED   = true;
```
---

```ts
// ... (continued setup.ts)     - Defining Custom Expressions

export const EXPRESSIONS = {
    
  sma3: (series: any) => series.price.mean(3),
  sma5: (series: any) => series.price.mean(5),
  sma8: (series: any) => series.price.mean(8),
  sma10: (series: any) => series.price.mean(10),
  ema10: (series: any) => {
    const n = 10;
    const key = `ema${n}`;
    const price = series.price;
    const calcSerie = series[key];
    if (calcSerie.availableLength < n + 1) return undefined;
    let prev = calcSerie.value(-1);
    if (!prev) prev = price.mean(n, -1);
    const k = 2 / (n + 1);
    const ema = price.value() * k + prev * (1 - k);
    return ema;
  },
  cross: (_: any) => {
    // check cross to the up side
    if (_.ema10.value( 0) > _.sma10.value( 0) && _.ema10.value(-1) < _.sma10.value(-1)) return 1
    // check cross to the down side
    if (_.ema10.value( 0) < _.sma10.value( 0) && _.ema10.value(-1) > _.sma10.value(-1)) return -1;
    return undefined;
  }
}
```
---

```ts
// ... (continued setup.ts)     - Preloading Data

const date                      = new Date();
const rndWalk                   = new RandomWalk(1, 1000, 500, 10, 10);

// DATA PRELOADING
export const PRELOADING_ENABLED = true;
export const PRELOAD            = (sampler: Sampler, buffer: any) => {
    
    const st                    = date.getTime()
    const rm                    = st % 1000

    buffer.time                 = st - rm - 1000;

    for (let i = 0; i < LENGTH - 1; i++) {

        buffer.time             += 1000;
        buffer.price            = rndWalk.next();
        buffer.qty              = Math.round(Math.random() * 100 - 50);
        buffer.exch             = 'ABC';

        sampler.preload(buffer);
    }
}
```
---


```ts
// ... (continued setup.ts)     - Simulating Live Data Events

const SIM_FIXED_INTERVAL        = 200;
const SIM_RANDOM_INTERVAL       = false;
const SIM_MIN_INTERVAL          = 20;
const SIM_MAX_INTERVAL          = 1500;

export const SIMULATION_ENABLED = true;
export const SIMULATE           = (sampler: Sampler, input_buffer: any) => {
    
    input_buffer.time           = new Date().getTime();
    input_buffer.price          = rndWalk.next();
    input_buffer.qty            = Math.round(Math.random() * 100 - 50);

    const exch                  = exchanges[0] // exchanges[Math.round(Math.random())];
    input_buffer.exch           = exch;

    console.log('Sent: ', exch);

    sampler.capture(input_buffer);
    
    let interval                = SIM_FIXED_INTERVAL;

    if (SIM_RANDOM_INTERVAL) {
      interval = Math.random() * (SIM_MAX_INTERVAL - SIM_MIN_INTERVAL) + SIM_MIN_INTERVAL;
    }

    setTimeout((s, b) => {
      SIMULATE(s, b)
    }, interval, sampler, input_buffer );
}
```
---

<br />

## 3) createSampler.ts

```ts
// YOU DO NOT NEED TO CHANGE ANYTHING IN THIS FILE, UNLESS YOU HAVE TO

import Sampler, { ClosedCircuitBuffer } from "sample-gator";
import * as __ from "./setup";
export type TrackDataDictionary = { [index: string]: any[] };
export type SamplerEventHandlers = {
  onIntervalData?: () => void;
  onTrackUpdate?: (track: ClosedCircuitBuffer) => void;
};

const _events: SamplerEventHandlers = {
  onIntervalData: undefined,
  onTrackUpdate: undefined,
};

const input_buffer: any = {};
export const output: TrackDataDictionary = {};
export const columns: TrackDataDictionary = {};
export const tracks: ClosedCircuitBuffer[] = [];

const createSampler = (eventHandlers: SamplerEventHandlers) => {
  Object.assign(_events, eventHandlers);

  const gator = new Sampler({
    interval: __.INTERVAL,
    bufferLength: __.LENGTH,
    trackKeys: __.TRACK_KEYS,
    fields: __.FIELDS,
  });

  // init INPUT placeholder
  const blank = gator.sampler.createSample();
  Object.assign(input_buffer, blank);
  Object.entries(__.EXPRESSIONS).map(([key, fn]: any[]) => gator.addExpression(key, fn));

  gator.onTrackStart = (track) => {
    output[track.key] = new Array(__.LENGTH);
    tracks.push(track);
    columns[track.key] = Object.keys(track.series);
    track.onUpdate = () => {
      _events.onTrackUpdate && _events.onTrackUpdate(track);
    };
  };

  gator.onInterval = () => _events.onIntervalData && _events.onIntervalData();

  if (__.PRELOADING_ENABLED) {
    __.PRELOAD(gator, input_buffer);
    _events.onIntervalData && _events.onIntervalData();
  }

  if (__.SAMPLING_ENABLED) gator.startSampling();
  if (__.SIMULATION_ENABLED) __.SIMULATE(gator, input_buffer);
};

export default createSampler;
```

<br />

---

<br />

## fifo() / lifo()

These methods facilitate reading data from the Closed-circuit buffer, 
taking care of complicated cursor and offset positions.  

They both accept a callback of form:

```ts
(pos, track) => void
```

| Param | Description |
| ----- | ----------- |
| track | internal array of samples |
| pos   | indexer: { index, ordinal, relative } |

<br>

**pos props**

| Prop | Purpose |
| ---- | ------- |
| pos.index | <sup>1</sup> Sample index in the Track |
| pos.ordinal | **True** iteration number (always zero based) |
| pos.relative | Relative offset from cursor |

<br>

> <sup>1</sup>  Sample index should only be used for accessing the Sample in the Track.
> It doesn't always start with zero, rather it starts with internal cursor position 
> within the Closed-circuit loop.

<br>

---

## Defining fields and spot calculations

In previous example we used an array of field names corresponding to data fields.  You can define your own fields and how they should be calculated.

```ts
import { value, when } from 'sample-gator';

const field = {            
    _buy:       (d) => when(d.qty > 0, () => d.buy  = 1),  // [^4]
    _sell:      (d) => when(d.qty < 0, () => d.sell = 1),

    open:       {   
                    fn: (d, curr) => value(curr, d.price), 
                    fill: (d, pv) => p.close 
                },                  // [^5]

    high:       {   
                    fn: (d, curr) => Math.max(
                        d.price, 
                        value(curr, d.price)), 
                    fill: (d, pv) => p.close 
                }, 

    buyVol:     {   
                    fn: (d, curr) => when(d.buy, 
                        value(curr, 0) + d.qty), 
                    fill: () => 0 
                },
                
    cumNetVol:  {   
                    fn: (d, curr) => value(curr, 0) + d.qty, 
                    cumulative: true  // [^6]
                },
};
```
[^4] - Underscore fields are special
        - they are run first
        - they do not get added to sample (hidden)
        - they perform some operation e.g. here they set a value on the data object itself
        <br>

[^5] - The fill() callback defines how the field's value should be calculated for empty Samples

[^6] - Cumulative fields do not get reset with each new sample, rather their values are rolled forward

<br>

<details>
<summary>Importing field groups</summary>

```ts
import { FieldGroups } from '.';

const fields: {
    ...FieldGroups.cryptoTrade.time.fields,
    ...FieldGroups.cryptoTrade.ohlc.fields,
    ...FieldGroups.cryptoTrade.side.fields,
    ...FieldGroups.cryptoTrade.stats.fields,
    ...FieldGroups.cryptoTrade.volume.fields,
    ...FieldGroups.cryptoTrade.mv.fields,
},

```
</details>

<br>




---

## Rolling Window / Moving Average calculations 
<br>

### (SMA)
You can define expressions by performing Rolling Window calculations, also known as Moving Averages on a single Serie, over N number of samples in its history.  Here is how you would define a Simple Moving Average (SMA) of 10:

```ts
// Simple Moving Average over 10:
buffer.addExpression('sma10', (series) => {
    // get closing price Serie
    return series.close.mean(10);
})
```

once such expression is added, it can also be used in other expressions.  For example, Exponential Moving Average (EMA) uses a slightly different formula, where it uses its previous value as the basis of calculation.  However, there is no previous sample for the very First value in the serie of course, that's why previous SMA of same length is used.  Therefore, an EMA expression requires N + 1 elements in the serie to work.
<br>

### (EMA)
```ts
// Exponential Moving Average of 10
buffer.addExpression('ema10', (series) => {

    const sma10 = series.sma10; 
    const ema10 = series.ema10; // reference this serie  
  
    if (ema10.availableLength < 11) {
        return undefined;
    }

    // get previous value
    let prev = ema10.value(-1);
    if (!prev) {
        prev = sma10.value(-1);
        // or calculate on the fly:
        prev = series.price.mean(n, -1);
    }

    const k = 2 / (n + 1);
    const ema = series.price.value() * k + prev * (1 - k);

    return ema;
})
```   

## Crossing Moving Averages
Here is another useful example where we check if EMA and SMA cross each other.  Note that the output is only generated when one of the two conditions is met:
<br>

### (EMA crosses SMA)
```ts
buffer.addExpression('ema10xsma10', (_: any) => {

  // check cross to the up side
  if (_.ema10.value( 0) > _.sma10.value( 0) &&
      _.ema10.value(-1) < _.sma10.value(-1)) {
        return 1;
  }

  // check cross to the down side
  if (_.ema10.value( 0) < _.sma10.value( 0) &&
      _.ema10.value(-1) > _.sma10.value(-1)) {
        return -1;
  }
  
  return undefined;
});
```

## License

MIT © [Rick Ellis](https://github.com/reactiff)
