import React, {useEffect, useState, useCallback} from 'react';
import myForce from './myForce';
import radial from 'd3-radial';
import rectCollide from './rectCollide';
import boundedBox from './boundedBox';
import TSNE from './TSNE';
import Force from './Force';
import './App.css';
import * as d3 from 'd3';
import {scaleLinear, treemap, extent, hierarchy}  from 'd3';
import treemapSpiral from './treemapSpiral';
import {group} from 'd3-array'
import clsx from 'clsx';
import useMeasure from './useMeasure';


const TagDetail = (props)=> {
  const {datum, smallScreen, className, size}=props;

  const pad=30
  const radius = size/2 -pad;
  const innerRad = radius * 0.67;
  const innerRadPad = 10;
  const arc = d3.arc().innerRadius(innerRad).outerRadius(radius - 1);
  const spread = datum.values.map(d => d.tags.map(tag => ({...d, tag}))).flat();
  const nested = Array.from(group(spread, d=> d.tag), ([ key, value ]) => ({key, value}));

  const pie = d3.pie()
    .padAngle(0.0105)
    .sort(null)
    .value(d => d.value.length)

  const arcs = pie(nested);

  return <div className={ clsx( "h-full w-full relative flex flex-col items-between", className ) }>
    <h2 className={clsx("p-2 text-left", smallScreen ? 'text-xl': 'text-2xl' )}>#{datum.key}</h2>
    <svg className="absolute" width={size} height={size}>
      <g transform={`translate(${size/2}, ${size/2})`}>
        {arcs.map(d => <path
          className="fill-current text-red-500" d={arc(d)}/>)
        }
      </g>
    </svg>
    <div className="absolute flex items-center justify-center h-full w-full">
      <Force
        width={innerRad *2 - innerRadPad} height={innerRad*2 - innerRadPad}
        data={datum.values}/>
    </div>
  </div>
}

const TagCont = (props) => {
  const {extended:ext, selected, datum, left, top, width, smallScreen, height, id, onClick, data}=props;

  // const fData = data.filter(d =>d.tags.includes(datum.key))

  const [bind, {width:w, height:h}] = useMeasure();


  const s = 60; //Math.min(100,20+fData.length )
  return <div {...bind} onClick={()=> !ext ? onClick(datum.key):onClick(null)}
    style={{
      left: ext? width/2: left,
      top: ext ? height/2:top,
      transform: `rotate(${Math.random() <0.5 ? '-':'+'}${Math.random()* 0}deg)`,
      height:ext? `${s}vh`:Math.max(50,height),
      width:ext? `${s}vh`:width,
      transition: 'all 400ms',
      boxShadow: '5px 5px gray'
    }}
        className={clsx( "m-auto bg-red-100 border-2 border-black" , ext ? 'z-50 fixed': 'z-10 absolute', selected ? 'bg-red-600': 'bg-red-100') }>

        {ext ?
          <TagDetail
            key={datum.key}
            datum={datum}
            smallScreen={smallScreen}
            size={w}
          /> :
          <div className="h-full flex">
            <div
              className={ clsx( "m-auto truncate p-1", smallScreen ? 'text-xl': 'text-2xl' ) }>
              {datum.key}
            </div>
          </div>
        }
      </div>
}


// import picHanging from './pictureHanging.js';
const pad=10;
var collisionForce = rectCollide()
  .iterations(200)
  .strength(2)
  .size(d => ( [d.size+pad/2, d.size+pad/2] ) )


function makeTreemap({data, width, height, padX, padY, key}) {
  const ratio = 1.5;
  const h = !key ? data.length* 10: data.length*20;

  const sorted = data.sort((a, b) => a.weight - b.weight);
  const myTreeMap = treemap()
    .size([width / ratio , h])
    .paddingInner(0)
    .round(true)
    .tile(treemapSpiral);

  const size = scaleLinear()
    .domain(extent(data, d => d.weight))
    .range([30, 100]);

  const first = {name: 'root', children: sorted};
  const root = hierarchy(first).sum(d => size(d.weight));
  myTreeMap(root);
  if (!root.children) return [];
  root.children.forEach(d => {
    d.datum = d.data;
    d.left = padX / 2 + Math.round(d.x0 * ratio);
    d.top = padY / 2 + Math.round(d.y0);

    d.width = Math.round(d.x1 * ratio) - Math.round(d.x0 * ratio) - padX / 2;
    d.height = Math.round(d.y1) - Math.round(d.y0) - padY / 2;
  });

  return root.children;
}

export default function TagCloud(props) {

  const {className, data, setData, selectedKeys, resetData}=props

  const [bind, {width, height}] = useMeasure();

  const smallScreen  = width<650;
  const [tiles, setTiles]=useState([]);
  const [key, setKey]=useState(null);

  useEffect(() => {
    const spreadData = data.map(d=> d.tags.map(tag => ({...d, tag}))).flat();
    const groupedDataMap = group(spreadData, d=> d.tag);

    const nodes = [ ...groupedDataMap.entries() ].map(( [key, values] ) => ({key, values}))
      .map(d => ({...d, weight:d.values.length **2 }))
      .sort((a,b) => b.weight-a.weight)


    const treeFn = nodes =>  makeTreemap({data: nodes.slice(0, smallScreen ? 25:75), width, height, padX:25, padY: 35, key})

    setTiles(treeFn(nodes));
  }, [width, height, smallScreen, data, data.length, key])

  const selNode = key && tiles.find(d => d.datum.key === key);
  // console.log('selNode', selNode);

  const filterByTag = k => {
    selectedKeys.includes(k) ? resetData(k) : setData([ k, data.filter(d => d.tags.includes(k)) ]);
  }

  // console.log('selectedKeys', selectedKeys);

  return <div {...bind} className={clsx("relative overflow-y-auto flex-grow", className)}>
    {selNode && <div>{selNode.datum.id} </div>}
    <div style={{width, height}}>
      {tiles.map(d => <TagCont selected={selectedKeys.includes(d.key)}smallScreen={smallScreen} {...d} data={data} onClick={filterByTag} id={d.key}
        selected={key===d.datum.key}/>)}
    </div>

  </div>
}



