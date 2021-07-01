import React, { useEffect, useState } from "react";
import createSampler, { tracks, columns } from './createSampler';
import MultiTrackTableRenderer from "../MultiTrackTableRenderer";

const Demo = () => {

  const [multiTrack, setMultiTrack] = useState<any>();

  // Init sampler
  useEffect(() => {

    const stitch = () => {
      const data = {};
      tracks.forEach(track => {
        const items = new Array(track.length);
        track.fifo((pos, buffer) => {
          items[pos.ordinal] = buffer[pos.index];
        });
        data[track.key] = { array: items, columns: columns[track.key] };
      });
      setMultiTrack(data);
    }
    
    return createSampler({ 
      // when preload completes
      onLoad: () => stitch(),
      // every time a new interval sample is created
      onIntervalData: () => stitch(),
      // whenever any track is updated
      onTrackUpdate: () => stitch(),
    })
  }, []);

  if (!multiTrack) return null;
  return <MultiTrackTableRenderer data={multiTrack} /> 
}

export default Demo;