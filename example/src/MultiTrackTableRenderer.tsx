import React from "react";
import DataTable from './components/DataTable';
import ui from '@reactiff/ui-core';

export default (props: { data: any }) => {

  const multiTrack = props.data;
  const keys = Object.keys(multiTrack);

  return <ui.row>
    {
      keys.map((key, index) => {
        return <DataTable 
          key={key}
          cols={multiTrack[key].columns} 
          items={multiTrack[key].array} 
        />
      })
    }
  </ui.row>
}
