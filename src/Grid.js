import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import { timeFormat } from 'd3-time-format';
import {range} from 'd3-array';


export default function Grid(props) {
  const {data, className, style} =props

  const [startPage, setStartPage]=useState(0);

  const maxCount=30;
  const maxPage = Math.ceil(data.length/maxCount)

  return <div className={clsx( className, 'flex flex-col')} style={style}>
    <div className="flex">{range(0, maxPage).map(d =>
      <button className={ clsx("m-1 border-2 border-gray p-1", startPage===d && 'bg-gray-600') } onClick={() => setStartPage(d)}>{d}</button>)}
    </div>
    <ol className={clsx(  'flex-grow overflow-y-auto py-4 px-8 list-decimal text-left')}>
      {data.slice(startPage * maxCount, startPage*maxCount+maxCount).map(d => <li className="my-1 border-b text-gray-800"><a href={d.url}>{d.title}</a></li>)}
  </ol>
    </div>
}
