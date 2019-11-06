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

  const onAppear = (el, i) => {
    setTimeout(() => {
      el.classList.add("fadeIn");
      setTimeout(() => {
        el.style.opacity = 1;
        el.classList.remove("fadeIn");
      }, 200);
    }, i );
  }

  const onExit = (el, i, removeElement) => {
    setTimeout(() => {
      el.classList.add("fadeOut");
      setTimeout(removeElement, 100);
    }, i );
  }


export default function TimeLine(props) {
  const {data, className, onClick, initData, timeDim, selectedKey}=props;
  const groupedData = groupBy(data);

  const cache = React.useRef([]);

  return ( <Flipper flipKey={cache.current.length} className={clsx(className, 'flex')}>
    {cache.current.length !== 0 &&
      <div className="rounded-full px-1 flex items-center border m-1 sm:flex-wrap"
      onClick={() => {
      onClick({docs: cache.current.pop(), key: null })
    }}>
      <button><ArrowLeft className="m-1 text-red"/></button>
    </div>
    }
    <div className="flex-grow flex sm:flex-wrap overflow-x-auto">
    {groupedData
        .map(d =>
          <Flipped flipId={d.key}
          >
          <button
            key={d.key}
            disabled={cache.current.length >0}
            onClick={!selectedKey ? (() => {
              onClick(d)
              cache.current.push(data);
            }):undefined} className={
              clsx('rounded-full flex items-center border m-1',
                'border-2 border-black p-2 flex-grow cursor-pointer sm:flex-wrap' ) }
              >
                {cache.current.length === 0 &&<div>{d.key}</div>}
          <div className="flex-grow flex sm:flex-wrap ">
          {( cache.current.length>0) && d.value.map(d =>
            <Flipped flipId={d.key}
            >
            <button
              onClick={() => {
                onClick(d)
                cache.current.push(data);
              }}
              className="mx-1 px-1 mb-1 rounded flex-grow border">
              {d.key}
            </button>
              </Flipped>)
          }
        </div>
      </button>
          </Flipped>
        )}
    </div>
    </Flipper>
  )
}
