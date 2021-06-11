import Sampler, { ClosedCircuitBuffer } from '.';

const INTERVAL  = 1000;
const LENGTH    = 100; 

const sampler = new Sampler({
  interval: INTERVAL,
  bufferLength: LENGTH,
  fields: ['time', 'price', 'qty'],
  trackKeys: ['exch'],
  suppressAutoSampling: true
})

const date = new Date() // for gettine time
const output = new Array(LENGTH);
const input: any = {
  time: 0,
  price: 100,
  qty: 0,
  exch: 'TEST'
}

function preloadData() {
  const st = date.getTime()
  const rm = st % 1000
  input.time = st - rm - 1000
  for (let i = 0; i < LENGTH; i++) {
    input.time += 1000
    input.price = input.price + (Math.random() - 0.5)
    input.qty = Math.round(Math.random() * 100 - 50)
    sampler.preload(input)
  }
}

const mockOnTrackStart = jest.fn()
  .mockName('onTrackStart')
  .mockImplementation((track: ClosedCircuitBuffer) => {});

sampler.onTrackStart = mockOnTrackStart;


preloadData()

/////////////////////////////////////////////////////////////

describe('Testing Sampler Initialization', () => {
  it('been called exactly once', () => {
    expect(mockOnTrackStart).toBeCalledTimes(1);
  })
  const arg = mockOnTrackStart.mock.calls[0][0];
  it('was passed an instance of ClosedCircuitBuffer', () => {
    expect(arg instanceof ClosedCircuitBuffer).toBeTruthy();
  })
  it('track.key was TEST', () => {
    expect(arg.key === 'TEST').toBeTruthy();
  })
})

describe('ClosedCircuitBuffer', () => {
  it('is truthy', () => {
    expect(ClosedCircuitBuffer).toBeTruthy()
  })
})
