import React, {useEffect, useState} from 'react';
import clsx from 'clsx';
import { timeFormat } from 'd3-time-format';
import {range} from 'd3-array';
import {ChevronsLeft, ChevronsRight} from 'react-feather';



export default function Grid(props) {
  const {data, className, pages, pageLen, onToggle, startPage, setStartPage, style, bigWindow} = props

  const maxPage = Math.ceil(data.length/pageLen)
  const [curPage, setCurPage]=useState(0);

  console.log('curPage', curPage);
  const offset=bigWindow ? 9 : 5;
  const cls = "m-1 rounded-full border-2 border-gray px-2"

  return (
  <div
    className={clsx(className,
    'flex flex-col w-full overflow-x-hidden overflow-y-auto')}
    style={style}
  >
    <div className="flex flex-wrap items-center">

      {curPage>= offset &&
          <button className={clsx(cls, 'flex items-center justify-center')} onClick={() => setCurPage(curPage-offset)}>
            <ChevronsLeft/>
          </button>
      }
      {
      range(curPage, curPage+offset).map(d =>
        <button
          className={clsx(cls,
            startPage===d && 'bg-myLightRed') }
            onClick={() => setStartPage(d)}>
            {d}
        </button>
        )}
    { curPage < maxPage - offset &&
          <button className={clsx(cls, 'flex items-center justify-center')} onClick={() => setCurPage(curPage+offset)}>
            <ChevronsRight/>
          </button>
      }
    </div>
    <ol
      className={clsx('flex-grow overflow-y-auto py-4 px-8 ',
      'list-decimal text-left overflow-x-hidden')}>
      {data.slice(...pages)
        .map(d =>
          <li className="my-1 border-b text-gray-800">
            <a href={d.url}>{d.title}</a>
          </li>
          )}
      </ol>
  </div>
  )
}
