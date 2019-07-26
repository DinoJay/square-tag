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

// const distanceTag = (a, b) =>{
//   let intersection =
//        a.filter(x => b.includes(x));
//   return 1/( intersection.length===0 ? 0.01: intersection.length)
// }

const initData = diigo.filter(d => d.tags).map(d => ({...d,
    tags: d.tags.split(','),
    date: parseTime(d.updated_at)
  }));


function App() {
  const [keyData, setKeyData] = useState([ 'all', initData])

  const dictRef = React.useRef(new Map());

  const keys = [ ...dictRef.current.keys() ];
  useEffect(() => {
    console.log('dictRef', dictRef.current);

  }, [keys])


  return (
    <div className="h-screen w-screen flex flex-col md:px-32 md:pb-8">
      <h1 className="text-3xl m-2">TagVis</h1>
      <BreadCrumbs keys={keys}/>
      <div className="flex-grow flex flex-col ">
        <TagCloud selectedKeys={keys}
          className="mb-3" data={keyData[1]} initData={initData}
          setData={([k, newData])=> {
            setKeyData([k, newData])
            dictRef.current.set(k, keyData[1])
            console.log('dictRef.curr', dictRef.current);
          }}
          resetData={(k) => {

            setKeyData([k, dictRef.current.get(k)]);
            dictRef.current.delete(k);
            console.log('resetData', Object.values(dictRef.current))
          }} />
        <TimeLine selectedKey={keyData[0]} data={keyData[1]}/>
    </div>
      <Grid className="h-64 mt-4" data={keyData[1]} />
    </div>
  );
}

export default App;
