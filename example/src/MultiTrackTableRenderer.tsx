import React from "react";
import ui from '@reactiff/ui-core';

const style = {
  border: 'thin solid white',
  margin: 0,
  padding: 8,
  '& table tr td': {
    paddingBottom: 8,
  },
  '& table tr td:first-of-type': {
    textAlign: 'left',
  }
};

export default (props: { data: any }) => {
  
  const multiTrack = props.data;
  const keys = Object.keys(multiTrack);

  

  return <ui.row css={{flexWrap: 'wrap'}}>
    {
      keys.map((key, index) => {
        const track = multiTrack[key];
        return <ui.col key={key} css={style} grow>
          <ui.table 
            cols={['__count', 'info', ...track.columns]} 
            items={track.array} 
          />
        </ui.col>
      })
    }
  </ui.row>
}
