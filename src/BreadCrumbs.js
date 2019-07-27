import React from 'react';

export default function BreadCrumbs(props) {
  const {keys, onSplice}=props;
  const cls = "mr-1 font-bold text-xl";
  const crumbs = keys.map(d => <div onClick={() => onSplice(d)}className={cls}>{d}>></div>)


  return <div className="flex h-8">{!keys.length ? <div className={ cls }>'All'</div> : crumbs}</div>
}
