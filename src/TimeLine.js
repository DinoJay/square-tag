import React, {useEffect, useState} from 'react';
import {group} from 'd3-array'
import { timeFormat } from 'd3-time-format';
import clsx from 'clsx';

const formatTime = timeFormat('%Y/%m/%d %H:%M:%S %Z');
const formatMonth = timeFormat('%Y/%m');
const formatYear = timeFormat('%Y');
const formatDay = timeFormat('%Y/%m/%d ');


const groupBy = (data)=> {
  const mapKey = ([key, value]) => ({key, value});
  const onlyValue = ([_, value]) => value;
  return  Array.from(group(data, d=> formatYear(d.date),
    d => formatMonth(d.date), d => formatDay(d.date)).entries(), mapKey)
    .map(y => ({
      ...y,
      value: Array.from(y.value),
      docs: Array.from(y.value, ([key, value])=>
        Array.from(value, onlyValue)).flat(3)
    })
    ).map(y => ({...y,
      value: y.value.map(([key, m]) => ({
        key, value: Array.from(m, mapKey), docs: Array.from(m, onlyValue).flat(2)
      }))}
    ))
}



export default function TimeLine(props) {
  const {data, className, onClick}=props;
  const groupedData = groupBy(data);

  console.log('click', groupedData);
  return <div className={clsx(className, 'flex')}>
    {groupedData.map(d=> <div onClick={() => onClick(d)}className="flex items-center border m-1 border-2 p-2" style={{width: 100/groupedData.length+'%' }}><div>{d.key}</div> </div>)}
    </div>
}
