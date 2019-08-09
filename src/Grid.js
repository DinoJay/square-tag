import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import { timeFormat } from 'd3-time-format';
import {range} from 'd3-array';


export default function Grid(props) {
  const {data, className, pages, pageLen, startPage, setStartPage, style} =props

  const maxPage = Math.ceil(data.length/pageLen)

  return <div className={clsx( className, 'flex flex-col w-full overflow-y-auto')}
    style={style}>
    <div className="flex flex-wrap">{range(0, maxPage).map(d =>
      <button className={ clsx("m-1 rounded-full border-2 border-gray px-2", startPage===d && 'bg-gray-600') } onClick={() => setStartPage(d)}>{d}</button>)}
    </div>
    <ol className={clsx('flex-grow overflow-y-auto py-4 px-8 ',
      'list-decimal text-left')}>
      {data.slice(...pages).map(d => <li className="my-1 border-b text-gray-800"><a href={d.url}>{d.title}</a></li>)}
  </ol>
    </div>
}
