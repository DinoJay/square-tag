import React, {useEffect, useState} from 'react';
import tsnejs from 'tsne';
import './App.css';
import * as d3 from 'd3';

import {timeParse} from 'd3-time-format';

import diigo from './diigo.json';

import TimeLine from './TimeLine';
import TagCloud from './TagCloud';
import Grid from './Grid';
import BreadCrumbs from './BreadCrumbs';

const parseTime=timeParse('%Y/%m/%d %H:%M:%S %Z')

const initData = diigo.filter(d => d.tags).map(d => ({...d,
    tags: d.tags.split(','),
    date: parseTime(d.updated_at)
  }));


function App() {
  const [keyData, setKeyData] = useState([ 'all', initData, null])

  const dictRef = React.useRef([]);
  const keys = dictRef.current.map(d => d[0]) ;
  const spliceData = k => {
    setKeyData(dictRef.current.find(d => d[0] ===k));
    dictRef.current
      .splice(dictRef.current.findIndex(d => d[0] ===k));
  }


  return (
    <div className="bg-yellow-100 h-screen w-screen flex flex-col md:px-32 xl:px-128 md:pb-8 ">
      <h1 className="text-3xl m-2">TagVis</h1>
      <BreadCrumbs keys={keys} onSplice={spliceData}/>
      <TimeLine
        onClick={() => setKeyData([keyData[0], keyData[1].slice(0, 20)])}
            selectedKey={keyData[0]} data={keyData[1]}
      />
      <div className="flex-grow flex flex-col lg:flex-row flex-col ">
        <TagCloud selectedKeys={keys}
          style={{minHeight: 300}}
          className="mb-3 pr-3" data={keyData[1]} initData={initData}
          setData={([k, newData])=> {
            setKeyData([k, newData])
            dictRef.current.push([k, keyData[1]])
          }}
          resetData={spliceData} />
        <Grid className="flex-grow md:h-full mt-4"
          style={{ maxWidth: 400}} data={keyData[1]}
        />
    </div>
    </div>
  );
}

export default App;
