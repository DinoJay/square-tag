import React, {useEffect, useState} from 'react';
import tsnejs from 'tsne';
import './App.css';
import TagCloud from './TagCloud';
import * as d3 from 'd3';

import diigo from './diigo.json';

const distanceTag = (a, b) =>{
  let intersection =
       a.filter(x => b.includes(x));
  return 1/( intersection.length===0 ? 0.01: intersection.length)
}

const dimX = 0
const dimY = 1


const TSNE = props => {
  const {data}=props;
  const [solution, setSolution]=useState([]);
  const [num, setNum]=useState(0);
  const [width, height]= [1500,1500];

  const modelRef = React.useRef();
  useEffect(() => {
    modelRef.current = new tsnejs.tSNE({
      dim: 2,
      perplexity: 80,
      epsilon:100
    })
    const dists = data.map(a => data.map(b => distanceTag(a.tags, b.tags)))
    modelRef.current.initDataDist(dists);
  }, [data])


  useEffect(() =>{
    if(num>400) return ()=>null;
    modelRef.current.step();
    setTimeout(() => {
      const newSol = modelRef.current.getSolution();
      console.log('njum', num);
      setSolution(newSol);
      setNum(num+1);

    }, 300)
      // console.log('newSol', newSol);

  }, [num])

  console.log('solution', solution);

  const X = d3
    .scaleLinear()
    .domain(d3.extent(solution, d => d[dimX]))
    .range([20, width - 20]);
  const Y = d3
    .scaleLinear()
    .domain(d3.extent(solution, d => d[dimY]))
    .range([20, (width * 2) / 3 - 20]);

  const fill = point=> d3.hsl(X(point[dimX]) * 360, 0.3 + 0.5 * Y(point[dimY]), 0.3 + 0.5 * Y(point[dimY]));

  const circles = solution.map((s,i) => {

    const r= 15
    return <rect className="fill-current text-red-300 border-2" width={r} height={r} x={X(s[dimX])-r/2} y={Y(s[dimY])-r/2} fill={fill(s)}>
        <title>${data[i].tags.join(' ')}</title>
      </rect>
  })


  return <div><svg width={width} height={height}>{circles}</svg></div>

}


function App() {
  const data = diigo.filter(d => d.tags).map(d=> ({...d, tags: d.tags.split(',')}))
  return (
    <div className="App">
      <TagCloud data={data} />
    </div>
  );
}

export default App;
