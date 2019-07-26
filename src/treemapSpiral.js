import {sum} from 'd3';

export default function treemapSpiral(parent, x0, y0, x1, y1) {
  const EAST = 0;
  const SOUTH = 1;
  const WEST = 2;
  const NORTH = 3;
  let direction = EAST;
  const nodes = parent.children;
  let node;
  const n = nodes.length;
  let i = -1;
  let newX0 = x0;
  let newX1 = x1;
  let newY0 = y0;
  let newY1 = y1;
  let availWidth = x1 - x0;
  let availHeight = y1 - y0;
  let avgAspectRatio = 0;
  let nodeAspectRatio = 0;
  const segment = [];
  let segmentSum = 0;
  let nodesSum = 0;

  for (i = n; i--; ) nodesSum += nodes[i].value;

  i = -1;

  while (++i < n) {
    node = nodes[i];

    segment.push(node);

    segmentSum += node.value;

    if (direction === EAST) {
      // Update positions for each node.
        segment.forEach((d, i, arr) => {
        d.x0 = i ? arr[i - 1].x1 : newX0;
        d.x1 = d.x0 + (d.value / segmentSum) * availWidth;
        d.y0 = newY0;
        d.y1 = newY0 + (segmentSum / nodesSum) * availHeight;
      });
    } else if (direction === SOUTH) {
      segment.forEach((d, i, arr) => {
        d.x0 = newX1 - (segmentSum / nodesSum) * availWidth;
        d.x1 = newX1;
        d.y0 = i ? arr[i - 1].y1 : newY0;
        d.y1 = d.y0 + (d.value / segmentSum) * availHeight;
      });
    } else if (direction === WEST) {
      segment.forEach((d, i, arr) => {
        d.x1 = i ? arr[i - 1].x0 : newX1;
        d.x0 = d.x1 - (d.value / segmentSum) * availWidth;
        d.y0 = newY1 - (segmentSum / nodesSum) * availHeight;
        d.y1 = newY1;
      });
    } else if (direction === NORTH) {
      segment.forEach((d, i, arr) => {
        d.x1 = newX0 + (segmentSum / nodesSum) * availWidth;
        d.x0 = newX0;
        d.y1 = i ? arr[i - 1].y0 : newY1;
        d.y0 = d.y1 - (d.value / segmentSum) * availHeight;
      });
    }

    // Compute new aspect ratio.
    nodeAspectRatio =
      direction & 1
        ? (node.y1 - node.y0) / (node.x1 - node.x0)
        : (node.x1 - node.x0) / (node.y1 - node.y0);
    avgAspectRatio = sum(segment, (d) => {
      return direction & 1
        ? (d.y1 - d.y0) / (d.x1 - d.x0)
        : (d.x1 - d.x0) / (d.y1 - d.y0);
    });

    // If avg aspect ratio is small, update boundaries and start a new segment.
    if (avgAspectRatio / segment.length < 1.618033988749895) {
      if (direction === EAST) {
        newY0 = node.y1;
        availHeight = newY1 - newY0;
      } else if (direction === SOUTH) {
        newX1 = node.x0;
        availWidth = newX1 - newX0;
      } else if (direction === WEST) {
        newY1 = node.y0;
        availHeight = newY1 - newY0;
      } else if (direction === NORTH) {
        newX0 = node.x1;
        availWidth = newX1 - newX0;
      }

      nodesSum -= segmentSum;
      segment.length = 0;
      segmentSum = 0;
      avgAspectRatio = 0;
      direction = (direction + 1) % 4;
    }
  }
}
