import React, {useEffect, useState, useCallback} from 'react';
// import myForce from './myForce';
// import radial from 'd3-radial';
import rectCollide from './rectCollide';
import sortBy from 'lodash/sortBy';
// import boundedBox from './boundedBox';
// import TSNE from './TSNE';
import Force from './Force';
import './App.css';
import * as d3 from 'd3';
import {scaleLinear, treemap, extent, hierarchy}  from 'd3';
import treemapSpiral from './treemapSpiral';
import {group} from 'd3-array'
import clsx from 'clsx';
import { Plus, Minus, X } from 'react-feather';
import useMeasure from './useMeasure';


const TagDetail = (props)=> {
  const {datum, smallScreen, className, onClose, size}=props;

  const pad=30
  const [bind, {width:w, height:h}] = useMeasure();
  const radius = w/2 -pad;
  const innerRad = radius * 0.67;
  const innerRadPad = 0;
  const arc = d3.arc().innerRadius(innerRad).outerRadius(radius - 1);
  const spread = datum.values.map(d => d.tags.map(tag => ({...d, tag}))).flat();
  const nested = Array.from(group(spread, d=> d.tag), ([ key, value ]) => ({key, value})).filter(d =>d.key !==datum.key)

  const pie = d3.pie()
    .padAngle(0.0105)
    .sort(null)
    .value(d => d.value.length)

  const arcs = pie(nested);

  console.log('arcs', arcs);

  return <div
    className={ clsx(`h-full w-full relative flex flex-col
      items-between`, className ) }>
      <div className="flex justify-between">
        <h2
          className={
            clsx("p-2 text-left", smallScreen ? 'text-xl': 'text-2xl' )}>
          #{datum.key}
        </h2>
        <button className="z-10 mx-2 my-1" onClick={onClose}><X/></button>
    </div>
    <div className="z-50 absolute bottom-0 flex flex-wrap bg-white">
      {nested.slice(0,10).map(d => <div className="mr-1">#{d.key}</div>)}
      <button className="font-bold">More...</button>
    </div>
    <div {...bind}className="flex flex-col flex-grow relative z-20">
      <svg  className="flex-grow" >
        <g transform={`translate(${size/2}, ${size/2 -30})`}>
          {arcs.map(d => <path
            className="fill-current text-red-500" d={arc(d)}/>)
          }
          {arcs.map(d => <text
            dy="0.33em"
            x={arc.centroid(d)[0]}
y={arc.centroid(d)[1]}
className="" >{d.data.key} </text>)
          }
        </g>
      </svg>
      <div
        className="absolute flex items-center justify-center h-full w-full">
        <Force
          width={innerRad *2 - innerRadPad} height={innerRad*2 - innerRadPad}
          data={datum.values}/>
      </div>
    </div>
  </div>
}

const TagCont = (props) => {
  const {extended:ext, selected, datum, left, top, width, smallScreen,
    height, id, onSelect, data, onOpen, onReset, onClose}=props;

  // const fData = data.filter(d =>d.tags.includes(datum.key))

  const [bind, {width:w, height:h}] = useMeasure();

  const onClick = (e)=>  {
    e.stopPropagation();
    if(ext) return null
    !selected && onSelect(datum.key);
  }

  const s = 80; //Math.min(100,20+fData.length )
  return <div {...bind} onClick={onClick}
    style={{
      left: ext? width/2: left,
      top: ext ? height/2:top,
      transform: `rotate(${Math.random() <0.5 ? '-':'+'}${Math.random()* 0}deg)`,
      height:ext? `${s}vh`:Math.max(50,height),
      width:ext? `${s}vh`:width,
      transition: 'all 400ms',
      boxShadow: '5px 5px gray'
    }}
        className={clsx( "m-auto bg-red-100 border-2 border-black" , ext ? 'z-50 fixed': 'z-10 absolute', selected && !ext ? 'bg-red-400': 'bg-red-100') }>

        {ext ?
          <TagDetail
            key={datum.key}
            datum={datum}
            onClose={onClose}
            smallScreen={smallScreen}
            size={w}
          /> :
          <button className="h-full flex w-full items-center">
            <div
              className={ clsx( "w-full truncate p-1 flex", smallScreen ? 'text-xl': 'text-2xl' ) }>

              {selected &&
                <button onClick={(e) => {
                  e.stopPropagation();
                  onReset();
                }} className="mr-3 flex items-center"  ><Minus/></button> }
                <div className="m-auto truncate flex-shrink"
                  style={{minWidth:0}}>{datum.key}</div>

              {selected &&
                <button onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }} className="mr-3 flex items-center"  ><Plus/></button> }
            </div>
          </button>
        }
      </div>
}


// import picHanging from './pictureHanging.js';
const pad=10;
var collisionForce = rectCollide()
  .iterations(200)
  .strength(2)
  .size(d => ( [d.size+pad/2, d.size+pad/2] ) )


function makeTreemap({data, width, height, padX, padY, key, selectedKeys}) {
  const ratio = 1.5;
  const h = !key ? data.length* 10: data.length*20;

  const sorted = sortBy(data, a => !selectedKeys.includes(a.key));
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

    const treeFn = nodes =>  makeTreemap({data: nodes.slice(0, smallScreen ? 25:75), width, height, padX:25, padY: 35, key, selectedKeys})

    setTiles(treeFn(nodes));
  }, [width, height, smallScreen, data, data.length, key, selectedKeys])

  const selNode = key && tiles.find(d => d.datum.key === key);
  // console.log('selNode', selNode);

  const filterByTag = k => {
    setData([ k, data.filter(d => d.tags.includes(k)) ]);
  }

  return <div {...bind} className={clsx("relative overflow-y-auto flex-grow", className)}>
    {selNode && <div>{selNode.datum.id} </div>}
    <div style={{width, height}}>
      {tiles.map(d =>
        <TagCont selected={selectedKeys.includes(d.datum.key)}
          smallScreen={smallScreen} {...d} extended={d.datum.key===key} data={data}
          onSelect={() => filterByTag(d.datum.key)}
          onReset={() => resetData(d.datum.key)}
          onOpen={() => setKey(d.datum.key)}
          onClose={() => setKey(null)}
          id={d.key}
        />)}
    </div>
  </div>
}



