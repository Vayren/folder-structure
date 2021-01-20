const URL = "https://secure-basin-85712.herokuapp.com/api/folders";

async function getStructure(URL) {
  const data = await fetch(URL);
  return await data.json();
}

async function createFolderTreeStructure() {
  const margin = { top: 20 };
  const width = window.innerWidth;
  const height = window.innerHeight;
  const duration = 750;

  const tree = d3.layout.tree()
      .size([width, height]);
  const diagonal = d3.svg.diagonal()
      .projection((d) => [d.x, d.y]);

  const svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height)
        .append("g")
      .attr("transform", "translate(" + 0 + "," + margin.top + ")");

  const root = await getStructure(URL);

  let i = 0;

  root.children.forEach(collapse);
  root.x0 = width / 2;
  root.y0 = 0;

  update(root);
  
  function collapse(node) {
    if (node.children) {
      node._children = node.children;
      node._children.forEach(collapse);
      node.children = null;
    }
  }

  function update(source) {
    const nodes = tree.nodes(root);
    const links = tree.links(nodes);

    // NODES
    nodes.forEach((node) => node.y = node.depth * 180);

    const node = svg.selectAll("g.node")
        .data(nodes, (node) => node.id || (node.id = ++i));

    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", (node) => "translate(" + source.x0 + "," + source.y0 + ")")
        .on("click", click);
    
    nodeEnter.append("rect")
        .attr("rx", 5)
        .attr("ry", 5)
        .attr('width', 0)
        .attr('height', 0)
        .attr('fill', '#fff');
      
    nodeEnter.append('svg')
        .attr('width', 0)
        .attr('height', 0)
        .append('use')
        .attr('href', (node) => {
          return node.type === 'file' ? './sprite.svg#icon-file-empty':
          './sprite.svg#icon-folder';
        })
        .style('fill', node => {
          return node.type === 'file' ? '#555' : '#f0c38e';
        });
    
    nodeEnter.append("text")
        .attr("x", (node) =>  node.children || node._children ? -18 : 18)
        .attr("dy", "0.5em")
        .attr("text-anchor", (node) => node.children || node._children ? "end" : "start")
        .text((node) => node.name)
        .style("fill-opacity", 0);
  
    const nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", (node) => "translate(" + node.x + "," + node.y + ")");
    
    nodeUpdate.select("rect")
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', -10)
        .attr('y', -10);
    
    nodeUpdate.select("svg")
        .attr('width', 20)
        .attr('height', 20)
        .attr('x', -10)
        .attr('y', -10);
    
    nodeUpdate.select("text")
        .style("fill-opacity", 1);
        
    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", (node) => "translate(" + source.x + "," + source.y + ")")
        .remove();
    
    nodeExit.select('rect')
        .attr('width', 0)
        .attr('height', 0)
        .attr('x', 0)
        .attr('y', 0);
    
    nodeExit.select('svg')
        .attr('width', 0)
        .attr('height', 0)
        .attr('x', 0)
        .attr('y', 0);
    
    nodeExit.select('text')
        .style('fill-opacity', 0);

    // LINKS
    const link = svg.selectAll("path.link")
        .data(links, (link) => link.target.id);
    
    link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
          const o = { x: source.x0, y: source.y0 };

          return diagonal({source: o, target: o});
        });
    
    link.transition()
        .duration(duration)
        .attr("d", diagonal);
    
    link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
          const o = { x: source.x, y: source.y };

          return diagonal({source: o, target: o});
        })
        .remove();
      
    nodes.forEach(function(node) {
          node.x0 = node.x;
          node.y0 = node.y;
        });
  }

  function click(node) {
    if (node.children) {
    node._children = node.children;
    node.children = null;
  } else {
    node.children = node._children;
    node._children = null;
  }

  update(node);
}
}

createFolderTreeStructure();
