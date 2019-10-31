import React, {useEffect, useState} from 'react';
import {group} from 'd3-array'
import { timeFormat } from 'd3-time-format';
import {ArrowLeft} from 'react-feather';
import clsx from 'clsx';

import { Flipper, Flipped } from 'react-flip-toolkit'

const formatTime = timeFormat('%Y/%m/%d %H:%M:%S %Z');
const formatMonth = timeFormat('%Y/%m');
const formatYear = timeFormat('%Y');
const formatDay = timeFormat('%Y/%m/%d ');


const groupBy = (data)=> {
  const mapKey = (timeStr) => ([key, value]) => ({key, timeStr, value});
  const onlyValue = ([_, value]) => value;
  return Array.from(group(data, d=> formatYear(d.date),
    d => formatMonth(d.date), d => formatDay(d.date)).entries(),
    mapKey('year'))
    .map(y => ({
      ...y,
      timeStr: 'year',
      value: Array.from(y.value),
      docs: Array.from(y.value, ([key, value]) =>
        Array.from(value, onlyValue)).flat(3)
    })
    ).map(y => ({...y,
      value: y.value.map(([key, m]) => ({
        key,
        timeStr: 'month',
        value: Array.from(m, mapKey('day')),
        docs: Array.from(m, onlyValue).flat(2)
      }))}
    ))
}



export default function TimeLine(props) {
  const {data, className, onClick, initData, timeDim, selectedKey}=props;
  const groupedData = groupBy(data);

  const cache = React.useRef([]);

  // useEffect(() => {
  //   // cache.current.pop();
  //   console.log('selectedKey', selectedKey);
  // }, [data, data.length, selectedKey])


  console.log('timeline cache', cache.current, 'selectedKey', selectedKey);

  return <div className={clsx(className, 'flex')}>
    {cache.current.length !== 0 && <div className="rounded-full px-1 flex items-center border m-1" onClick={() => {
      onClick({docs: cache.current.pop(), key: null })
    }}>
      <button><ArrowLeft className="m-1 text-red"/></button>
    </div>
    }
    {groupedData
      .map(d =>
        <div flipId={d.key} onClick={!selectedKey && (() => {
          onClick(d)
          cache.current.push(data);
        })} className={
        clsx('rounded-full flex items-center border m-1',
          'border-2 border-black p-2 flex-grow' ) }
        >
        {cache.current.length === 0 &&<div>{d.key}</div>}
        <div className="flex-grow flex flex-wrap">
          {( cache.current.length===1 || cache.current.length===2 ) && d.value.map(d =>
            <button
              disabled={cache.current.length ===2}
              onClick={() => {
              onClick(d)
              cache.current.push(data);
            }}
            className="mx-1 px-1 rounded flex-grow">
              {d.key}
            </button>)
          }
        </div>
      </div>)}
    </div>
}
