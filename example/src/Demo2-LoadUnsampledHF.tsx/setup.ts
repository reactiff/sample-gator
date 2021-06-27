import Aggregator from "sample-gator";
import RandomWalk from '@reactiff/random-walk';
import { fnOrValue } from "@reactiff/ui-core";

export const INPUT_INTERVAL   = () => Math.round(Math.random() * 1000); // ms
export const OUTPUT_INTERVAL  = 1000; // ms
export const LENGTH           = 15;

export const FIELDS: any = {
  time:   { fn: (d: any) => d.time },
  price:  { fn: (d: any) => d.price,  fill: (d: any, pv: any) => pv },
  qty:    { fn: (d: any) => d.qty,    fill: (d: any, pv: any) => pv },
  exch:   { fn: (d: any) => d.exch,   fill: (d: any, pv: any) => pv },
};

export const TRACK_KEYS = ["exch"];
export const EXPRESSIONS = {};
// {
//   sma3: (series: any) => series.price.mean(3),
//   sma5: (series: any) => series.price.mean(5),
//   sma8: (series: any) => series.price.mean(8),
//   sma10: (series: any) => series.price.mean(10),
//   ema10: (series: any) => {
//     const n = 10;
//     const key = `ema${n}`;
//     const price = series.price;
//     const calcSerie = series[key];
//     if (calcSerie.availableLength < n + 1) return undefined;
//     let prev = calcSerie.value(-1);
//     if (!prev) prev = price.mean(n, -1);
//     const k = 2 / (n + 1);
//     const ema = price.value() * k + prev * (1 - k);
//     return ema;
//   },
//   cross: (_: any) => {
//     // check cross to the up side
//     if (_.ema10.value( 0) > _.sma10.value( 0) && _.ema10.value(-1) < _.sma10.value(-1)) return 1
//     // check cross to the down side
//     if (_.ema10.value( 0) < _.sma10.value( 0) && _.ema10.value(-1) > _.sma10.value(-1)) return -1;
//     return undefined;
//   }
// }; 

// DATA LOADING AND SIMULATION

export const SAMPLING_ENABLED   = false;

const rndWalk                   = new RandomWalk(1, 1000, 500, 10, 10);

// DATA PRELOADING
export const PRELOADING_ENABLED = true;
const exchanges = 'A1'.split(',');

export const PRELOAD            = (aggregator: Aggregator, buffer: any) => {

  buffer.time = new Date().getTime()

  do {
    buffer.time                 += fnOrValue(INPUT_INTERVAL);
    buffer.price                = rndWalk.next();
    buffer.qty                  = Math.round(Math.random() * 100 - 50)
    
    const exchIndex = Math.round(Math.random() * (exchanges.length - 1));
    const exch = exchanges[exchIndex];

    buffer.exch                 = exch;


  } while (aggregator.preload(buffer));
  
   
}

// DATA SIMULATION

const SIM_FIXED_INTERVAL        = 200;
const SIM_RANDOM_INTERVAL       = false;
const SIM_MIN_INTERVAL          = 20;
const SIM_MAX_INTERVAL          = 1500;


export const SIMULATION_ENABLED = false;
export const SIMULATE           = (aggregator: Aggregator, input_buffer: any) => {
    
    input_buffer.time           = new Date().getTime();
    input_buffer.price          = rndWalk.next();
    input_buffer.qty            = Math.round(Math.random() * 100 - 50);

    const exch                  = exchanges[0] // exchanges[Math.round(Math.random())];
    input_buffer.exch           = exch;

    aggregator.capture(input_buffer);
    
    let interval                = SIM_FIXED_INTERVAL;

    if (SIM_RANDOM_INTERVAL) {
      interval = Math.random() * (SIM_MAX_INTERVAL - SIM_MIN_INTERVAL) + SIM_MIN_INTERVAL;
    }

    setTimeout((s, b) => {
      SIMULATE(s, b)
    }, interval, aggregator, input_buffer );
}





