import * as d3 from 'd3';
function collisionCheck(base_rect, new_rect) {
  const padding = 0.2;
  if (
    base_rect.x < new_rect.x + new_rect.w + padding &&
    base_rect.x + base_rect.w > new_rect.x - padding &&
    base_rect.y < new_rect.y + new_rect.h + padding &&
    base_rect.h + base_rect.y > new_rect.y - padding
  ) {
    return true;
  }
  return false;
}

export default (pictures, offset, sizeFn, onChange) => {
  const state = {pictures: []};

  function findNext(i) {
    const dist = 0.01;
    let angle = 0;
    let counter = 0;
    // TODO get real bounds
    // const max = 100000;
    while (counter < 100000) {

    const itemSize = sizeFn ? sizeFn(pictures[i]): Math.random() * 10 + 7;
      // Spiral code from https://stackoverflow.com/questions/6824391/drawing-a-spiral-on-an-html-canvas-using-javascript
      const incr = 1 / (dist + dist * angle)
      const x = (dist * angle) * Math.cos(angle) + offset[0]
      const y = (dist * angle) * Math.sin(angle) + offset[1]
      const targetRect = {
        x: x - itemSize / 2,
        y: y - itemSize / 2,
        w: itemSize,
        h: itemSize,
      };
      const checks = [];
      const m=20;
      if (state.pictures.every(p => !collisionCheck(p, targetRect))) {
        state.pictures.push(targetRect);
        onChange(state.pictures.map((d, i) => ({
          ...pictures[i],
          x: d.x * m,
          y: d.y * m,
          xy: [d.x * m, d.y * m],
          height: d.h * m,
          width: d.w * m,
          h: d.h * m,
        })
))
        break;
      }
      counter += 1;
      angle += incr;
    }
  }


  for (let i = 0; i < pictures.length; i++) {
    findNext(i);
  }
  const m =20
  // return state.pictures.map((d, i) => ({
  //   ...pictures[i],
  //   x: d.x * m,
  //   y: d.y * m,
  //   xy: [d.x * m, d.y * m],
  //   height: d.h * m,
  //   width: d.w * m,
  //   h: d.h * m,
  // }));
};
