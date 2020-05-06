const isInside = ({ rect, y }) => {
  return (y >= rect.top) && (y <= rect.bottom);
}

const hasVerticalIntersection = ({ nodeRect, fieldRect }) => {
  return isInside({ rect: nodeRect, y: fieldRect.top }) || isInside({ rect: nodeRect, y: fieldRect.bottom });
};

const getDistance = (pointA, pointB) => {
  const x = pointA.x - pointB.x;
  const y = pointA.y - pointB.y;
  return Math.sqrt(x*x + y*y);  
};


const findTextNodeIntersections = ({ blockNode, fieldNode }) => {
  const treeWalker = document.createTreeWalker(blockNode, NodeFilter.SHOW_TEXT);
  const fieldRect = fieldNode.getBoundingClientRect();
  let currentNode = treeWalker.currentNode;

  const nodes = [];
  const nodeRange = document.createRange();

  while(currentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE) {
      nodeRange.selectNode(currentNode);
      const nodeRect = nodeRange.getBoundingClientRect();

      if (hasVerticalIntersection({ nodeRect, fieldRect })) {
        nodes.push(currentNode);
      }
    }
    currentNode = treeWalker.nextNode(); 
  }
  nodeRange.detach();

  return nodes;
};

const getMinDistanceSymbol = ({ textNode, fieldRect }) => {
  const textNodeRange = document.createRange();
  const textLength = textNode.textContent.length;
  const min = {
    distance: Number.POSITIVE_INFINITY,
    offset: -1,
  };

  for (let i = 0; i < textLength - 1; i++) {
    textNodeRange.setStart(textNode, i);
    textNodeRange.setEnd(textNode, i + 1);

    const distance = getDistance(fieldRect, textNodeRange.getBoundingClientRect());
    if (distance < min.distance) {
      min.distance = distance;
      min.offset = i;
    }
  }
  textNodeRange.detach();

  return min;
};

const getNearestTextNodeSymbol = ({ blockNode, fieldNode }) => {
  if (!blockNode || !fieldNode) {
    return null;
  }

  const fieldRect = fieldNode.getBoundingClientRect();
  const textNodes = findTextNodeIntersections({ blockNode, fieldNode });

  if (textNodes.length) {
    const min = {
      distance: Number.POSITIVE_INFINITY,
      offset: -1,
      node: null,
    };

    textNodes.forEach((textNode) => {
      const { distance, offset } = getMinDistanceSymbol({ textNode, fieldRect });
      if (distance < min.distance) {
        min.distance = distance;
        min.offset = offset;
        min.node = textNode;
      }
    });

    return min;
  }

  return null;
};



const fieldNode = document.getElementById('field-f09a4fa2-d45f-46c3-901a-f25f8c30733b');
const blockNode = fieldNode.parentElement.childNodes[0];

const min = getNearestTextNodeSymbol({ blockNode, fieldNode });

console.log(min);