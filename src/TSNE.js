import React, {useEffect, useState} from 'react';
import tsnejs from 'tsne';
import clsx from 'clsx';
import { timeFormat } from 'd3-time-format';
import {range} from 'd3-array';
import * as d3 from 'd3';

const distanceTag = (a, b) =>{
  let intersection =
       a.filter(x => x !== 'd3' && b.includes(x));
  return 1/(intersection.length-10)
}

const dimX = 0
const dimY = 1

function pythag(r, b, coord) {

    r += nodeBaseRad;

  const margin = 30,
    w = 500 - margin * 2,
    radius = w / 2,
    strokeWidth = 4,
    hyp2 = Math.pow(radius, 2),
    nodeBaseRad = 5;


    // force use of b coord that exists in circle to avoid sqrt(x<0)
    b = Math.min(w - r - strokeWidth, Math.max(r + strokeWidth, b));

    var b2 = Math.pow((b - radius), 2),
        a = Math.sqrt(hyp2 - b2);

    // radius - sqrt(hyp^2 - b^2) < coord < sqrt(hyp^2 - b^2) + radius
    coord = Math.max(radius - a + r + strokeWidth,
                Math.min(a + radius - r - strokeWidth, coord));

    return coord;
}

export default props => {
  const {data, width, height}=props;
  const [solution, setSolution]=useState([]);
  const [num, setNum]=useState(0);
  // const [width, height]= [500,500];

  const modelRef = React.useRef();
  useEffect(() => {
    modelRef.current = new tsnejs.tSNE({
      dim: 2,
      perplexity: Math.min(data.length/2, 80),
      epsilon:200
    })
    const dists = data.map(a => data.map(b => distanceTag(a.tags, b.tags)))
    modelRef.current.initDataDist(dists);
  }, [data])


  useEffect(() =>{
    if(num>1000) return ()=>null;
    modelRef.current.step();
    setTimeout(() => {
      const newSol = modelRef.current.getSolution();
      setSolution(newSol);
      setNum(num+1);

    }, 0)
      // console.log('newSol', newSol);

  }, [num])

  const X = d3
    .scaleLinear()
    .domain(d3.extent(solution, d => d[dimX]))
    .range([20, width - 20]);
  const Y = d3
    .scaleLinear()
    .domain(d3.extent(solution, d => d[dimY]))
    .range([100, height- 100]);

  const fill = point=> d3.hsl(X(point[dimX]) * 360, 0.3 + 0.5 * Y(point[dimY]), 0.3 + 0.5 * Y(point[dimY]));

  const circles = solution.map((s,i) => {

    const r= 30
    return <rect className="fill-current text-red-800 border-2 " width={r} height={r} x={X(s[dimX])-r/2} y={Y(s[dimY])-r/2} fill={fill(s)}>
        <title>${data[i].tags.join(' ')}</title>
      </rect>
  })


  return <div><svg width={width} height={height}>{circles}</svg></div>

}
