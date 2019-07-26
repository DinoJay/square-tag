import React, {useEffect, useState, useRef} from 'react';
import fileIconSrc from './file.svg'

import { forceSimulation, forceX, forceY, forceManyBody, forceCenter, forceCollide} from 'd3-force';
import boundedBox from './boundedBox';
var margin = 30,
    w = 500 - margin * 2,
    h = w,
    // radius = w / 2,
    strokeWidth = 0,
    nodeBaseRad = 0;

export function pythag(r, b, coord, radius) {
  // console.log({r, b, coord, w, radius});
    const hyp2 = Math.pow(radius, 2);

  console.log({w, r})
    // force use of b coord that exists in circle to avoid sqrt(x<0)
    const b1 = Math.min(radius*2 - r , Math.max(r + strokeWidth, b));

    const b2 = Math.pow((b1 - radius), 2);
    const a = Math.sqrt(hyp2 - b2);

    // radius - sqrt(hyp^2 - b^2) < coord < sqrt(hyp^2 - b^2) + radius
    return Math.max(radius - a + r + strokeWidth,
                Math.min(a + radius - r - strokeWidth, coord));

  // console.log('coord', coord);
    // return coord;
}


export default function Force(props) {
  const {data, width, height} = props;
  const [nodes, setNodes] = useState([]);
  const forceRef = useRef();

  useEffect(() => {
  var boxForce = boundedBox()
    .bounds([[0, 0], [width, height]])
      .size(d => [d.size, d.size] )

    forceRef.current = forceSimulation(data.map(d => ({...d, size: 40})))

      // .force("charge", forceManyBody().strength(-10))
      // .force("collide", forceCollide(d => d.size).strength(0.2))
      .force("center", forceCenter(width/2, height/2))
      .force("X", forceX(width/2).strength(0.002))
      .force("Y", forceY(height/2).strength(0.002))

      // .force('box', boxForce)
      .on('tick', () => {
        setNodes([ ...forceRef.current.nodes() ]);
    })
  }, [data, height, width])

  return <div className="relative" style={{width, height}} >
    {nodes.map(d => <div className="absolute" style={{
      width:d.size, height: d.size,
      left: d.x-d.size/2,//pythag(d.size, d.x-d.size/2, d.y-d.size/2, width/2),
      top: d.y-d.size/2,//pythag(d.size, d.y-d.size/2, d.x-d.size/2, width/2)}}
    }}
    >
      <img src={fileIconSrc} />
      {d.id}
    </div>)}
    </div>
}
