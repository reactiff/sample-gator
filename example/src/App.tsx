import React from "react";

import ui from '@reactiff/ui-core';

// import Demo1 from './Demo1-LoadSampledData.tsx';
import Demo2 from './Demo2-LoadUnsampledHF.tsx';

// import Demo3 from './Demo1-LoadSampledData.tsx';
// import Demo4 from './Demo1-LoadSampledData.tsx';

export default () => {


  const tabs = {

    // demo1: <><h2>Demo 1 - Load pre-sampeld data</h2> <Demo1 /></>,
    demo2: <><h2>Demo 2 - Load unsampled HF data</h2><Demo2 /></>

  };

  const keys = Object.keys(tabs);

  return <ui.tabs items={keys} keyForItem={key => key} elementForItem={(key) => tabs[key]} />
}


  
