import React from 'react';

export default function BreadCrumbs(props) {
  const {keys, onSplice}=props;
  const cls = "cursor-pointer flex items-center bg-teal-100 text-lg mr-1 border-2 border-black rounded-full px-3";
  const crumbs = keys.map(d => <button onClick={() => onSplice(d)} className={cls}><div className="">{d}</div></button>)


  return <div className="flex h-8">{!keys.length ? <div className={ cls }><div>All</div></div> : crumbs}</div>
}
