import React, {Component} from 'react';
//import * as d3 from 'd3'
//import { Container } from 'reactstrap';
import { Neo4jGraphRenderer } from 'neo4j-graph-renderer';

// build a new class from the Componeents class
class GraphVis extends Component{
    render(){
        return(
            <div className="Graph">
                <Neo4jGraphRenderer url='bolt://52.87.235.130:32924' user='neo4j'
                password='quarterdecks-woods-banks' query="MATCH (n)-[r]->(m) RETURN n,r,m"/>
            </div>
        )
    }
};

export default GraphVis

/*
refer to  neo4j-graph-renderer docs
return(
    <div className="graph">
        <Neo4jGraphRenderer url={process.env.NEO4J_URL} user={process.env.NEO4J_USER}
        password={process.env.NEO4J_PASSWORD} query="MATCH (n)-[r]->(m) RETURN n,r,m"/>
    </div>
*/
/*
function renderGraph() {
    var width = 800, height = 800;
    var force = d3.layout.force()
      .charge(-200).linkDistance(30).size([width, height]);
  
    var svg = d3.select("#graph").append("svg")
      .attr("width", "100%").attr("height", "100%")
      .attr("pointer-events", "all");
  
    api
      .getGraph()
      .then(graph => {
        force.nodes(graph.nodes).links(graph.links).start();
  
        var link = svg.selectAll(".link")
          .data(graph.links).enter()
          .append("line").attr("class", "link");
  
        var node = svg.selectAll(".node")
          .data(graph.nodes).enter()
          .append("circle")
          .attr("class", d => {
            return "node " + d.label
          })
          .attr("r", 10)
          .call(force.drag);
  
        // html title attribute
        node.append("title")
          .text(d => {
            return d.title;
          });
  
        // force feed algo ticks
        force.on("tick", () => {
          link.attr("x1", d => {
            return d.source.x;
          }).attr("y1", d => {
            return d.source.y;
          }).attr("x2", d => {
            return d.target.x;
          }).attr("y2", d => {
            return d.target.y;
          });
  
          node.attr("cx", d => {
            return d.x;
          }).attr("cy", d => {
            return d.y;
          });
        });
      });
  }

  */