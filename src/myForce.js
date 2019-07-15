/**
 * Pulls nodes toward a specified `(x, y)` target point.
 */

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
  function findNext(i, nodes) {
    const dist = 0.01;
    let angle = 0;
    let counter = 0;
    // TODO get real bounds
    // const max = 100000;

    while(true){
      const itemSize = Math.random() * 50 + 7;
        // Spiral code from https://stackoverflow.com/questions/6824391/drawing-a-spiral-on-an-html-canvas-using-javascript
      const m =10;
      const incr = 1 / (dist + dist * angle)
      const x = (dist * angle) * Math.cos(angle)
      const y = (dist * angle) * Math.sin(angle) //+ offset[1]
      const targetRect = {
        vx: ( x - itemSize / 2 ) *m,
        vy: ( y - itemSize / 2 ) * m,
        x: ( x - itemSize / 2 ) *m,
        y: ( y - itemSize / 2 ) * m,
        w: itemSize,
        h: itemSize,
      };
      if (nodes.every(p => !collisionCheck(p, targetRect))) {
        return targetRect
      }
      counter += 1;
      angle += incr;
    }
  }
export default function (target) {
  let nodes,
    // targets,
    strength,
    strengths;

  function force (alpha) {
    let node, target, strength;
    for (let i=0; i<nodes.length; i++) {
      // node = nodes[i];
      // target = targets[i];
      const node = findNext(i, nodes)
      console.log('node', node);
      // strength = strengths[i];
      // node.vx += (target[0] - node.x) * strength * alpha;
      // node.vy += (target[1] - node.y) * strength * alpha;
    }
  }

  function initialize () {
    if (!nodes) return;

    // populate local `strengths` using `strength` accessor
    strengths = new Array(nodes.length);
    for (let i=0; i<nodes.length; i++) strengths[i] = strength(nodes[i], i, nodes);

    // populate local `targets` using `target` accessor
    // targets = new Array(nodes.length);
    // for (let i=0; i<nodes.length; i++) targets[i] = target(nodes[i], i, nodes);
  }

  force.initialize = _ => {
    nodes = _;
    initialize();
  };

  force.strength = _ => {
    // return existing value if no value passed
    if (_ == null) return strength;

    // coerce `strength` accessor into a function
    strength = typeof _ === 'function' ? _ : () => +_;

    // reinitialize
    initialize();

    // allow chaining
    return force;
  };

  force.target = _ => {
    // return existing value if no value passed
    if (_ == null) return target;

    // coerce `target` accessor into a function
    target = typeof _ === 'function' ? _ : () => _;

    // reinitialize
    initialize();

    // allow chaining
    return force;
  };

  if (!strength) force.strength(0.1);
  // if (!target) force.target([ 0, 0 ]);

  return force;

}
