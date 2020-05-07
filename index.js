const isInside = ({ rect, y }) => {
  return (y >= rect.top) && (y <= rect.bottom);
};

const hasVerticalIntersection = ({ nodeRect, fieldRect }) => {
  const allCases = [
    { rect: nodeRect, y: fieldRect.top },
    { rect: nodeRect, y: fieldRect.bottom },
    { rect: fieldRect, y: nodeRect.top },
    { rect: fieldRect, y: nodeRect.bottom },
  ];

  return allCases.some(isInside);
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

  for (let i = 0; i < textLength; i++) {
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


const fieldNodes = Array.prototype.slice.call(document.querySelectorAll('[class*="field_absolute"]'));

const repositionField = ({ element, offset, field }) => {
  const positionElement = document.createElement('span');
  element.childNodes[0].splitText(offset);
  element.insertBefore(positionElement, element.childNodes[1]);
  positionElement.style.position = 'relative';
  positionElement.style.fontWeight = 'normal';
  const { top: posElTop, left: posElLeft } = positionElement.getBoundingClientRect();
  const { top: fieldTop, left: fieldLeft } = field.getBoundingClientRect();

  field.style.bottom = 'unset';
  field.style.right = 'unset';
  field.style.top = `${fieldTop - posElTop}px`;
  field.style.left = `${fieldLeft - posElLeft}px`;
  positionElement.appendChild(field);
};

const moveFields = (fields) => fields.forEach((field) => {
  const place = getNearestTextNodeSymbol({ blockNode: field.parentElement.childNodes[0] , fieldNode: field });

  if (place !== null && place.node) {
    repositionField({ element: place.node.parentElement, offset: place.offset, field });
  }

});

moveFields(fieldNodes);
