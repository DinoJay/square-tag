import React from 'react';

export default function BreadCrumbs(props) {
  const {keys}=props;

  return <div className="flex">{keys.map(d => <div>{d}</div>)}</div>
}
