import Sampler from "sample-gator";
import RandomWalk from '@reactiff/random-walk';

export const INTERVAL = 1000;           // ms
export const LENGTH = 20;

type SampleFields = {
  time: any,
  price: any,
  qty: any,
  exch: any,  
}

export const FIELDS: SampleFields = {
  time: { fn: (d: SampleFields) => d.time, fill: (d: SampleFields, p: SampleFields) => p, initial: 0 },
  price: { fn: (d: SampleFields) => d.price, fill: (d: SampleFields, p: SampleFields) => p, initial: 0 },
  qty: { fn: (d: SampleFields) => d.qty, fill: (d: SampleFields, p: SampleFields) => p, initial: 0 },
  exch: { fn: (d: SampleFields) => d.exch, fill: (d: SampleFields, p: SampleFields) => p, initial: '' },
};

export const TRACK_KEYS = ["exch"];
export const EXPRESSIONS = {}; 

// DATA LOADING AND SIMULATION

export const SAMPLING_ENABLED   = false;

const date                      = new Date();

// DATA PRELOADING
export const PRELOADING_ENABLED = true;

const exchanges = ['A1', 'B1'];
export const PRELOAD            = (sampler: Sampler, buffer: any) => {
    
    const st                    = date.getTime()
    const rm                    = st % 1000

    buffer.time                 = st - rm - 1000;

    for (let i = 0; i < LENGTH - 1; i++) {

        buffer.time             += 1000;
        buffer.price            = buffer.price + (Math.random() - 0.5);
        buffer.qty              = Math.round(Math.random() * 100 - 50);
        buffer.exch             = exchanges[Math.round(Math.random())];
        
        // TODO capture and preload are CONFUSING
        //      maybe should be only one method
        sampler.preload(buffer);
    }
}
  



// DATA SIMULATION

const rndWalk                   = new RandomWalk(1, 1000, 500, 10, 10);
const SIM_INTERVAL              = 200;

export const SIMULATION_ENABLED = false;
export const SIMULATE           = (sampler: Sampler, input_buffer: any) => {
    
    input_buffer.time           = date.getTime();
    input_buffer.price          = rndWalk.next();
    input_buffer.qty            = Math.round(Math.random() * 100 - 50);

    sampler.capture(input_buffer);
    
    setTimeout( SIMULATE, SIM_INTERVAL );
}





