import React, {useEffect, useState, useCallback} from 'react';
import {useTransition, useSpring, animated} from 'react-spring'
import { Flipper, Flipped } from 'react-flip-toolkit'

import { interpolate } from 'flubber'
// import myForce from './myForce';
//
// import radial from 'd3-radial';
import rectCollide from './rectCollide';
import sortBy from 'lodash/sortBy';
import fileIconSrc from './file.svg'
// import boundedBox from './boundedBox';
// import TSNE from './TSNE';
import './App.css';
import * as d3 from 'd3';
import {group} from 'd3-array'
import clsx from 'clsx';
import { Plus, Minus, X, ZoomIn, ZoomOut} from 'react-feather';
import useMeasure from './useMeasure';

const BLACK='#404040';
const angle = d => {
    var a = (d.startAngle + d.endAngle) * 90 / Math.PI - 90;
    return a > 90 ? a - 180 : a;
}

  const onAppear = (el, i) => {
    setTimeout(() => {
      el.classList.add("fadeIn");
      setTimeout(() => {
        el.style.opacity = 1;
        el.classList.remove("fadeIn");
      }, 300);
    }, i );
  }

  const onExit = (el, i, removeElement) => {
    setTimeout(() => {
      el.classList.add("fadeOut");
      setTimeout(removeElement, 500);
    }, i );
  }


const MoreTags = (props)=> {
  const {tags, className, selectedKeys, onAdd}=props
  const [ext, setExt] = useState(false);
  const slicedTags =  sortBy(sortBy(tags.filter(d => !selectedKeys.includes(d.key)).slice(0, ext ? 100: 10)), d => d.value.length).reverse();

  const max = d3.max(slicedTags, d => d.value.length);

  if(slicedTags.length === 0) return null;

  return <div className={
    clsx('absolute bottom-0 bg-white border-t-2 flex p-1 overflow-y-auto z-50 w-full', className,
      ext && 'p-2') }
      style={{transition: 'all 300ms', maxHeight:ext ? '50%': '8rem',
    }}>
    <div
      className="h-full w-full flex flex-shrink-1 truncate overflow-hidden"
      style={{transition: 'all 300ms', display: ext && 'grid',
        gridTemplateColumns: ext && 'auto auto auto auto',
      }}
    >
    {slicedTags.map(d =>
      <div
        role="button"
        onClick={() => onAdd(d)}
        className={ clsx('cursor-pointer mx-1 ',
          ext ? 'text-xl': 'text-xl',
          selectedKeys.includes(d.key) && "font-bold" ) }
        >
          {!ext && `#${d.key}`}
          {ext &&
            <div className="">
              <div>#{d.key}</div>
              <div className="m-1 flex rounded-full border-2 border-black h-8 bg-teal-100"
                style={{width: `${ d.value.length * 98/ max}%`, minWidth: '1rem'}}
              >
              <div className="m-auto">{d.value.length}</div>
              </div>
            </div>
          }
      </div>
    )}
    </div>
      <button className={clsx("bg-white ml-1 rounded-full border-4 px-1 text-xl font-bold", ext&& 'absolute top-0 right-0 ' ) }
        onClick={()=> setExt(!ext)}>
        {ext ? <Minus/>: 'More...'}
      </button>
    </div>
}

const DocPreview = (props) => {
  const {style, selectedKeys, values, id, zoomed, size, onClick}=props;

  const docResult = d=> values.filter(d => d.tags.find(t => selectedKeys.includes(t)))

  return(
    <div style={{ ...style, transition: 'all 300ms',width: size, height: size}}
        className="absolute bg-yellow-100 overflow-hidden flex items-center justify-center rounded-full border-2 ">
        <div className="text-3xl text-center" style={{minWidth: '20%'}}>
          {values.filter(d => d.tags.find(t => selectedKeys.includes(t))).length}
        </div>
        <div className={ clsx(' flex-row-reverse items-center',
          'border-l border-r flex-wrap py-8 justify-center',
          'overflow-y-auto overflow-x-hidden ', !zoomed && 'flex')
        } style={{height: size, minWidth: '60%'}}>
          {zoomed && docResult(values).map(d =>
            <div
              className="m-1 flex items-center pb-1 border-b-2
                         border-solid border-gray-300 overflow-x-hidden"
            >
                 <img alt="doc" src={fileIconSrc} width={zoomed? 50:70}
                  height={zoomed ? 50 : 70}
                />
              <a target="_blank" href={d.url}>{d.title}</a>
            </div>
          )}
              { !zoomed &&  <h2 className="text-3xl">#{id}</h2> }
        </div>
        <div className="text-2xl flex flex-col items-center"
          style={{minWidth: '20%'}}
        >
          <button onClick={onClick} >
            {zoomed ?
                <ZoomOut className="text-black" size={40}/>:
                <ZoomIn className="text-black text-curren" size={40}/>
            }
          </button>
        </div>
      </div>)
}

const pieHook = ({fData, zoomed, onSelectTag, onTagChange, cache, ref, innerRad, radius}) => {

  const arc = d3.arc()
    .innerRadius(innerRad)
    // .padAngle(0.1)
    .outerRadius(radius - 1);

  const bigArc = d3.arc().innerRadius(radius).outerRadius(radius + pad/2);

  const pie = d3.pie()
    .padAngle(0.0305)
    .sort(null)
    .value(d => d.value.length)

    const arcData = pie(fData);
    const prevData = pie(cache.current);
    const group = d3.select(ref.current);

  const groupWithData = group.selectAll("g.arc").data(arcData, d=> d.data.key);

    groupWithData.exit().remove();

    const groupWithUpdate = groupWithData
      .enter()
      .append("g")
      .attr("class", "arc");

    const arcTween = (d, i) => {
      const interpolator = d3.interpolate(prevData
        .find(e=> e.data.key === d.data.key), d);
      return t => arc(interpolator(t));
    };

    const path = groupWithUpdate
      .append("path")
      .merge(groupWithData.select('path.arc'));

    path
      .attr('class', 'arc fill-current text-myLightRed cursor-pointer')
      .on('click', d => onTagChange(d.data))
      .transition(500)
      .attrTween('d', arcTween);

    groupWithUpdate
      .append('text')
      .attr('class', ' fill-current text-black text-lg')
      .merge(groupWithData.select('text'))
      .attr('dy', '0.33em')
      .attr('text-anchor', 'middle')
      .attr('transform', a =>
        `translate( ${arc.centroid(a)} ) rotate(${angle(a)})`
      )
      .text(d => !zoomed ? d.data.key:null);


    groupWithUpdate
      .append('text')
      .merge(groupWithData.select('text.remove'))
      .on('click', d => onTagChange(d.data))
      .attr('class', 'cursor-pointer remove fill-current font-bold text-black text-xl ')
      .attr('dy', '0.33em')
      // .attr('dx', '0.53em')
      .attr('text-anchor', 'middle')
      .attr('transform', a =>
        `translate( ${bigArc.centroid(a)} ) rotate(${angle(a)})`
      )
      .text(!zoomed ? '◔':null);

}



const Pie = props => {

  const {selectedKeys, w, h, onTagChange, id, innerRad, radius, tags, zoomed,
          onSelectTag} = props

  const fData= tags.filter(t => t.key !== id && selectedKeys.includes(t.key))
  const cache = React.useRef(fData);
  const ref = React.useRef(null);


  useEffect(
    () => {
      pieHook({ fData, zoomed, onTagChange, onSelectTag, cache, ref,
        innerRad, radius });
      cache.current = fData;
    }
  );

  return <svg className="flex-grow overflow-visible" >
    <g
      ref={ref}
      transform={`translate(${w/2}, ${radius})`}/>
    </svg>
}

const TagDetail = (props)=> {
  const {smallScreen, key, values, className, onClose, id, size}=props;
  const INIT_FAC=0.53;
  const ZOOMED_FAC=0.80;
  const [radFac, setRadFac]=useState(INIT_FAC);
  const toggleRadFac = ()=> setRadFac(radFac===INIT_FAC ? ZOOMED_FAC: INIT_FAC);
  const [bind, {width:w, height:h}] = useMeasure();

  const spread = values.map(d => d.tags.map(tag => ({...d, tag}))).flat().filter(d => d.tag !== id)

  const nested = Array.from(group(spread, d=> d.tag), ([ key, value ]) => ({key, value})).filter(d =>d.key !==null)

  const tags = sortBy(nested, d => -d.value.length)
  const [selectedKeys, setSelectedKeys] = useState(tags.slice(0,10)
    .map(d=>d.key))

  const onTagChange =
    d => setSelectedKeys(selectedKeys.includes(d.key)? selectedKeys.filter(k => k!== d.key) : [...selectedKeys, d.key])

  const onSelectTag = d => setSelectedKeys([d.key])

  const pad=0
  const zoomed = radFac ===ZOOMED_FAC;
  const radius = (zoomed ? w:h)/2.3 -pad;
  const innerRad = radius * radFac;
  const innerRadPad = 0;

  return <div className={ clsx(`bg-white relative h-full w-full flex flex-col
      items-between`, className) }>
        <button className="z-10 mx-2 right-0 top-0 my-1" onClick={onClose}><X/></button>
    <div {...bind} className="flex flex-col flex-grow relative z-20">
      <Pie {...props} {...{radius, w, h, pad, onTagChange, innerRad, zoomed,
                tags, selectedKeys, onSelectTag, }}
      />
      <DocPreview
        {...props}
        values={values}
        onClick={toggleRadFac}
        zoomed={zoomed}
        size={innerRad*2}
        selectedKeys={selectedKeys}
        style={{
          left: w/2 -innerRad,
          top: radius -innerRad,
          width: innerRad *2,
          height:innerRad *2,
        // shapeOutside: "circle(70% at 0% 50%) border-box"
        }}
      >
      </DocPreview>
    </div>
    <MoreTags selectedKeys={selectedKeys} onAdd={onTagChange} className="" tags={nested}/>
  </div>
}

const Extendable = (props)=> {
  const {extended:ext,id, weight, opacity, left, top, children, onClick} = props;

  return <Flipped flipId={id}
    onAppear={onAppear}
    onExit={onExit}
  >
    <div onClick={onClick}
      className={clsx( 'overflow-hidden masonry-el bg-yellow-100 border-2 border-black' ,
      ext ? 'z-50 fixed': 'rounded-full z-10 overflow-hidden') }
      style={{
        gridColumn:`span ${ext ? '30': weight[0]}` ,
        gridRow: `span ${ext ? '30' : weight[1]}`,
        // transition: 'width 400ms, height 400ms',
        // left: ext && 'auto',
        // top: ext && 'auto',
        // right:ext && 'auto',
        // bottom:ext && 'auto',
        height: ext ? '75vh':null,
        maxHeight: 600,
        maxWidth: 700,
        opacity,
        width:ext?'100vw':null,
        // marginLeft: ext && 'auto',
        // marginRight: ext && 'auto',
        boxShadow: '5px 5px gray'
    }}
    >
      <div className="h-full m-auto bg-yellow-100" style={{ }}>
        {children}
      </div>
    </div>
  </Flipped>
}

const TagPreview = props => {
  const {selected, smallScreen, id, onReset, onOpen}=props;
  return <button className={clsx("h-full truncate rounded-full text-black flex w-full items-center", selected ? 'bg-myLightRed' : 'bg-teal-100') }
  onClick={()=> selected && onOpen()}
  >
    <div
      className={ clsx( "w-full truncate p-1 flex",
        'text-xl md:text-2xl' ) } >
      {selected &&
        <button onClick={(e) => {
          e.stopPropagation();
          onReset();
        }} className="mr-3 flex items-center font-bold"  ><Minus/></button> }
        <div className="m-auto truncate flex-shrink"
          style={{minWidth:0}}>{id}</div>

      {selected &&
        <button onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }} className="mr-3 flex items-center"  ><Plus/></button> }
    </div>
  </button>
}



const TagCont = (props) => {
  const {extended:ext, opacity, selected, key, left, top, width, smallScreen,
    height, id, onSelect, data, onOpen, onReset, onClose}=props;

  const onClick = (e)=>  {
    e.stopPropagation();
    if(ext) return null
    !selected && onSelect(key);
  }

  return <Extendable {...props} onClick={onClick} >
      {ext ?
        <TagDetail
          {...props}
          key={id}
          onClose={onClose}
          smallScreen={smallScreen}
        /> :
          <TagPreview
            {...props}
            selected={selected}
          smallScreen={smallScreen} onReset={onReset}
          onOpen={onOpen}
        />
      }
      </Extendable>
}


// import picHanging from './pictureHanging.js';
const pad=10;
var collisionForce = rectCollide()
  .iterations(200)
  .strength(2)
  .size(d => ( [d.size+pad/2, d.size+pad/2] ) )

export default function TagCloud(props) {

  const {className, data, setData, pages=[0, 100],
    selectedKeys, resetData, style} = props

  const [key, setKey]=useState(null);

  const filterByTag = k => setData(k);

    const spreadData = data.map(d=> d.tags.map(tag => ({...d, tag}))).flat();

    const groupedDataMap = group(spreadData, d=> d.tag);

    const ceilCells = a => {
      if(a > 100) return [12,8];
      if(a > 50) return [9,8];
      if(a > 20) return [8,6];
      if(a > 10) return [6,5];
      return [ 5,3];
    }
  const nodes = [ ...groupedDataMap.entries() ]
    .map(( [key, values] ) => ({key, values}))
      .map(d => ({...d, weight: ceilCells(d.values.length )}))
      .sort((a,b) => a.weight - b.weight)

      return (
      <div className={className} style={style}>
      <Flipper
        flipKey={`${nodes.map(d => d.key).join(',') }${key}`}
        className={clsx('masonry-layout overflow-y-auto flex-grow',
        nodes.length < 10 ? 'masonry-small-layout': 'masonry-layout')}
        style={{ ...style, }}
      >
      {nodes.map((d) =>
        <TagCont {...d} selected={selectedKeys.includes(d.key)}
          extended={d.key === key}
          key={d.key}
          {...d} {...props}
          onSelect={() => filterByTag(d.key)}
          onReset={() => resetData(d.key)}
          onOpen={() => setKey(d.key)}
          onClose={() => setKey(null)}
          id={d.key}
        />
    )}
</Flipper></div>)
}



