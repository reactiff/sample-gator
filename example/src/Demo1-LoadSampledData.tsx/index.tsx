import React from "react";
import init, { tracks, columns } from './createSampler';
import { useEffect } from "react";
import { useState } from "react";

import MultiTrackTableRenderer from "../MultiTrackTableRenderer";

const Demo1 = () => {

  const [multiTrack, setMultiTrack] = useState<any>();

  // Init sampler
  useEffect(() => {

    init({ 
      onIntervalData: () => {

        const data = {};

        tracks.forEach(track => {
          const items = new Array(track.length);
          track.fifo((pos, buffer) => {
            items[pos.ordinal] = buffer[pos.index];
          });
          data[track.key] = { array: items, columns: columns[track.key] };
        })

        setMultiTrack(data);

      }
    })

  }, []);

  if (!multiTrack) return null;

  return <MultiTrackTableRenderer data={multiTrack} /> 
}

export default Demo1;