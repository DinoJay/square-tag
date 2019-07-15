import React, {useEffect, useState} from 'react';
import myForce from './myForce';
import radial from 'd3-radial';
import rectCollide from './rectCollide';
import boundedBox from './boundedBox';
import tsnejs from 'tsne';
import './App.css';
import * as d3 from 'd3';
import {group} from 'd3-array'
import clsx from 'clsx';

import picHanging from './pictureHanging.js';
const pad=10;
var collisionForce = rectCollide()
  .size(function (d) { return [d.size+pad/2, d.size+pad/2] })


export default function TagCloud(props) {

  const {data}=props

  const spreadData= data.map(d=> d.tags.map(tag => ({...d, tag}))).flat();
  const groupedDataMap= group(spreadData, d=> d.tag);

  const nodes = [ ...groupedDataMap.entries() ].map(( [key, values] ) => ({key, values})).map(d => ({...d, size:d.values.length * 2 +50}))
  const [width, height]=[1300,1800];

var boxForce = boundedBox()
    .bounds([[0, 0], [width, height]])
    .size(function (d) { return [d.size, d.size] })


  const [pics, setPics]=useState([]);
  const [key, setKey]=useState(null);

  var spiral = radial.spiral()
    .center([width/2, height/2]).increment(30)

  const simulation =React.useRef();

  useEffect(() => {
    console.log('new');
    const spiralNodes = spiral(nodes.slice(0,300)).map(d => ({...d, sx: d.x, sy: d.y}));
    simulation.current = d3.forceSimulation(spiralNodes)
     .velocityDecay(0)
      .alphaTarget(1)

      // .force("charge", d3.forceManyBody().strength(d => d.url === key ? 1 : 1))
      .force('coll', collisionForce)
      .force("x", d3.forceX(d => d.sx).strength(1))
      .force("y", d3.forceY(d => d.sy).strength(1))

      .force('box', boxForce)
      // .force("center", d3.forceCenter(width / 2, height / 2))
      // .force('f', myForce())
    // .force('c', d3.forceCollide(80))
      // .force('center', d3.forceCenter([1000,500]))
      .on('tick', () => {
      setPics(spiralNodes);
    })

  // picHanging(nodes.slice(0,100), [32, 27], (d) => Math.min(9, Math.max(3, d.values.length ) ), setPics)
    // *eslint
/* eslint-disable */
  }, [nodes.length])
/* eslint-enable */

    useEffect(() => {
      console.log('key', key)
      // simulation.current.restart();

    }, [key])

  return <div className="mt-16 relative overflow-visible" style={{ height, width }}>
    {pics.map(d =>
      <div onClick={()=> setKey(d.key)} style={{left: d.x, top: d.y, height:d.size, width:d.size}}
        className="bg-red-200 absolute border-2 border-black" key={d.key}>
        <div className="truncate m-1">{d.key}</div>
      </div>)}
    </div>
}
