import React, {useState, useEffect} from 'react';
import './App.css';
import * as d3 from 'd3';
// import fetchJsonP from 'fetch-jsonp';

import {timeParse} from 'd3-time-format';

import diigoRaw from './diigo.json';

import TimeLine from './TimeLine';
import TagCloud from './TagCloud';
import Grid from './Grid';
import BreadCrumbs from './BreadCrumbs';


const parseTime=timeParse('%Y-%m-%d %H:%M:%S')

const initData = diigoRaw.filter(d => d.tags).map(d => ({...d,
    tags: d.tags.split(','),
    date: parseTime(d.created_at)
  }));


function App() {
  const [keyData, setKeyData] = useState([ 'all', initData, null, 'year'])

  const [startPage, setStartPage]=useState(0);
  const [inputStr, setInputStr]=useState('');
  const pageLen =100;
  const pages = [ startPage * pageLen, startPage*pageLen+pageLen ];

  const dictRef = React.useRef([]);
  const keys = dictRef.current.map(d => d[0])  ;
  const spliceData = k => {
    setKeyData(dictRef.current.find(d => d[0] === k));
    dictRef.current
      .splice(dictRef.current.findIndex(d => d[0] === k));
  }

const fn = d => inputStr==='' || d.title && d.title.toLowerCase && d.title.toLowerCase().includes(inputStr) || d.tags.find(t => t && t.toLowerCase().includes(inputStr))

  const slicedData= keyData[1].slice(...(keyData[1].length > pages[0]? pages : [0, 1000])).filter(fn)

  const timeStr = keyData[3];
  const bigWindow = window && window.innerWidth > 800
  return (
    <div className="bg-yellow-100 h-screen w-screen flex flex-col p-2 md:px-32 xl:px-64 md:pb-8 overflow-y-hidden sm:overflow-y-auto">
      <h1 className="text-4xl m-2 italic">TagSeaVis 🔍🌊</h1>
      <BreadCrumbs keys={keys} onSplice={spliceData}/>
      <TimeLine
        timeDim={timeStr}
        initData={initData}
        className="mb-3"
        onClick={(d) => {
          console.log('d', d);
          setKeyData([keyData[0], d.docs, d.key, timeStr==='year' ? 'month': 'year'])
        }}
        selectedKey={keyData[2]} data={keyData[1]}
      />
      <div className="flex-grow flex flex-col lg:flex-row flex-col lg:justify-center overflow-y-hidden"
      >
        <TagCloud selectedKeys={keys}
          pages={pages}
          className="mb-3 pr-3 flex-grow pb-1" data={slicedData} initData={initData}
          setData={(k)=> {
            setKeyData([k, keyData[1].filter(d => d.tags.includes(k))])
            setStartPage(0);
            dictRef.current.push([k, keyData[1]])
          }}
          resetData={spliceData} />
        <div>
          <input className="border p-1 w-full rounded"
            placeholder="Search for Title or Tag"
            onChange={e => setInputStr(e.target.value)}

          />
          <Grid key={keyData[1].map(d => d.key).join(',')}
            pageLen={pageLen} pages={pages} startPage={startPage}
            setStartPage={setStartPage} className="flex-grow h-64 md:h-full mt-4"
            style={{ width:  bigWindow&& 550}} data={keyData[1].filter(fn)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
