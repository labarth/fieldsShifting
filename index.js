const fieldNodes = [document.getElementById('field-f09a4fa2-d45f-46c3-901a-f25f8c30733b')];
const fieldNode = document.getElementById('field-f09a4fa2-d45f-46c3-901a-f25f8c30733b');
const block = fieldNode.parentElement.childNodes[0];

const isIncludedRect = (genRect, rect) => {
  const correctRect = {
    top: genRect.top - 5,
    left: genRect.left - 5,
    right: genRect.right + 5,
    bottom: genRect.bottom + 5,
  };

  return (
    (correctRect.top <= rect.top) &&
    (correctRect.left <= rect.left) &&
    (correctRect.right >= rect.right) &&
    (correctRect.bottom >= rect.bottom)
  )
}

const getMinRectNode = (nodes) => {
  let min = nodes[0].getBoundingClientRect().width * nodes[0].getBoundingClientRect().height;
  let node = nodes[0];

  for (let i = 1; i < nodes.length; i++) {
    const current = nodes[i].getBoundingClientRect().width * nodes[i].getBoundingClientRect().height;
    if (current < min) {
      min = current;
      node = nodes[i];
    }
  }

  return node;
}

const isNode = (node) => node.nodeType === 1;

const findNearestNodeByCoordinates = (block, field) => {
  const fieldRect = field.getBoundingClientRect();
  let firstItemRect;
  let stack = Array.prototype.slice.call(block.childNodes);
  const result = [];
  let item = null;

  while (stack.length) {
    if (isNode(stack[0])) {
      firstItemRect = stack[0].getBoundingClientRect();
    } else {
      const parentNode = stack[0].parentElement;
      result.push(parentNode);
    }

    if (isIncludedRect(firstItemRect, fieldRect)) {
      item = stack[0];

      if (stack[0].childNodes) {
        let childNodes = item.childNodes;
        stack.shift();
        stack = [...Array.prototype.slice.call(childNodes), ...stack];
      }
    } else {
      stack.shift();
    }
  }

  return result.length ? getMinRectNode(result) : item;
};

// console.log(findNearestNodeByCoordinates(block, fieldNode));

// const el = document.querySelector('.jxJXJH > span');
// const offset = 3;

const reposField = ({ element, offset, field }) => {
  const positionElement = document.createElement('span');
  element.childNodes[0].splitText(offset);
  element.insertBefore(positionElement, element.childNodes[1]);
  positionElement.style.position = 'relative';

  const { top: posElTop, left: posElLeft } = positionElement.getBoundingClientRect();
  const { top: fieldTop, left: fieldLeft } = field.getBoundingClientRect();

  field.style.bottom = 'unset';
  field.style.right = 'unset';
  field.style.top = `${fieldTop - posElTop}px`;
  field.style.left = `${fieldLeft - posElLeft}px`;
  positionElement.appendChild(field);
};


fieldNodes.forEach((field) => {
  const alexBaran = {
    element: document.querySelector('.jxJXJH > span'),
    offset: 3,
  };

  if (alexBaran !== null) {
    reposField({ element: alexBaran.element, offset: alexBaran.offset, field });
  }

});