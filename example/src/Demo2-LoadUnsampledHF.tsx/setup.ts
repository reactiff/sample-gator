import Aggregator, { value } from "sample-gator";
import RandomWalk from '@reactiff/random-walk';
import { fnOrValue } from "@reactiff/ui-core";

export const PRELOADING_ENABLED = true;
export const SAMPLING_ENABLED   = true;
export const SIMULATION_ENABLED = true;

export const INPUT_INTERVAL     =   50; // () => Math.round(Math.random() * 1000); 
export const OUTPUT_INTERVAL    = 1000; // ms
export const LENGTH             =   20; 

export const FIELDS: any = {

  time:   { fn: (d: any) => d.time },

  price:  { fn: (d: any) => d.price },
  qty:    { fn: (d: any) => d.qty, fill: () => 0 },
  exch:   { fn: (d: any) => d.exch, fill: (prev: any) => prev.exch },

  open:   { fn: (d: any, slot?: any) => {
    
    return value(slot.open, d.price)
    
  }, fill: (prev: any) => { 
    return prev.close 
  }},                  


  high:   { fn: (d: any, slot?: any) => Math.max(d.price, value(slot.high, d.price)), fill: (prev: any) => prev.close },                  
  low:    { fn: (d: any, slot?: any) => Math.min(d.price, value(slot.low, d.price)), fill: (prev: any) => prev.close },                  
  close:  { fn: (d: any, slot?: any) => d.price },        

};

export const TRACK_KEYS = ["exch"];
export const EXPRESSIONS = {
  sma3: (series: any) => series.close.mean(3),
  sma5: (series: any) => series.close.mean(5),
  sma8: (series: any) => series.close.mean(8),
  sma10: (series: any) => series.close.mean(10),
  ema10: (series: any) => {
    const n = 10;
    const key = `ema${n}`;
    const price = series.close;
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
}; 

// DATA LOADING AND SIMULATION

const rndWalk                   = new RandomWalk(1, 1000, 500, 1, 10);

// DATA PRELOADING

const exchanges = 'A1'.split(',');

export const PRELOAD            = (aggregator: Aggregator, buffer: any) => {

  buffer.time = new Date().getTime()

  do {
    buffer.time                 += fnOrValue(INPUT_INTERVAL);
    buffer.price                = rndWalk.next();
    buffer.qty                  = Math.round(Math.random() * 100 - 50)
    buffer.exch                 = exchanges[Math.round(Math.random() * (exchanges.length - 1))];

  } while (aggregator.preload(buffer));
  
}
// DATA SIMULATION


export const SIMULATE           = (aggregator: Aggregator, input_buffer: any) => {
  const buffer = { ...input_buffer };
  setInterval((a, b) => {
    b.time           = new Date().getTime();
    b.price          = rndWalk.next();
    b.qty            = Math.round(Math.random() * 100 - 50);
    b.exch           = exchanges[0];
    a.capture(b);
  }, INPUT_INTERVAL, aggregator, buffer );
}





