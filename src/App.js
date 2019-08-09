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
  const [startPage, setStartPage]=useState(0);
  const pageLen=100;
  const pages = [ startPage * pageLen, startPage*pageLen+pageLen ];

  const dictRef = React.useRef([]);
  const keys = dictRef.current.map(d => d[0])  ;
  const spliceData = k => {
    setKeyData(dictRef.current.find(d => d[0] === k));
    dictRef.current
      .splice(dictRef.current.findIndex(d => d[0] === k));
  }

  console.log('keyData', keyData);
  const slicedData= keyData[1].slice(...(keyData[1].length > pages[0]? pages : [0, 500]));

  console.log('slicedData', slicedData, 'pages', pages);

  return (
    <div className="bg-yellow-100 h-screen w-screen flex flex-col md:px-32 xl:px-128 md:pb-8 ">
      <h1 className="text-3xl m-2">TagVis</h1>
      <BreadCrumbs keys={keys} onSplice={spliceData}/>
      <TimeLine
        className="mb-3"

        onClick={() => setKeyData([keyData[0], keyData[1].slice(0, 20)])}
            selectedKey={keyData[0]} data={keyData[1]}
      />
      <div className="flex-grow flex flex-col lg:flex-row flex-col ">
        <TagCloud selectedKeys={keys}
          pages={pages}
          style={{minHeight: 300}}
          className="mb-3 pr-3" data={slicedData} initData={initData}
          setData={(k)=> {
            setKeyData([k, keyData[1].filter(d => d.tags.includes(k))])
            setStartPage(0);
            dictRef.current.push([k, keyData[1]])
          }}
          resetData={spliceData} />
          <Grid key={keyData[1].map(d => d.key).join(',')} pageLen={pageLen} pages={pages} startPage={startPage} setStartPage={setStartPage} className="flex-grow md:h-full mt-4"
          style={{ maxWidth: 600}} data={keyData[1]}
        />
      </div>
    </div>
  );
}

export default App;
