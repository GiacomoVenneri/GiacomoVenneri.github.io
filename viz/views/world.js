import {timestamp_to_date, map_selection_handler, findSimilar} from "./utils.js"

var svg;
var projection;
var path;
var dataset_paper;
var heatMapcolor;
var countries
var maxNpaper
var papersPerNation;
var hash;

export function world(data_papers){

    dataset_paper = data_papers

    svg = d3.select("#zone_1_id")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("cursor", "pointer")
        .append("g")
        .attr("id", "g_map")
        .attr("transform", "translate(0, 0)")
                
    d3.queue()
        .defer(d3.json, "world.topojson")
        .await(load_map)

}

function load_map(error, data_world){

    

    dataset_paper.forEach(function(d){

    papersPerNation = d3.nest()
        .key(function(d) {return d["Nation"];})
        .rollup((function(d) {return d3.sum(d, function(e) {return 1; });}))
        .entries(dataset_paper);
    });
    maxNpaper = d3.max(papersPerNation.map(x => x.value))
    hash = Object.create(null);
    papersPerNation.forEach(function (x) {hash[x.key] = x.value;});
    countries = topojson.feature(data_world, data_world.objects.countries).features

    projection = d3.geoMercator()
            .translate(["300","220"])
            .scale(130)

    path = d3.geoPath().projection(projection)

    svg.selectAll(".country")
        .data(countries).enter()
        .append("path")
        .attr("class", "map_unselected")
        .attr("value", 0)
        .attr("stroke", "rgb(40, 40, 40)")
        .attr("id", function(d){return d.properties.name})
        .attr("d", path)
        .on("click", function(d){

            let geo_id = this.id
                if(hash[geo_id] == null){ 
                    let simil = findSimilar(hash, this.id)
                    if(simil[1] == 1){ geo_id = simil[0]}
                }
      
            let element = d3.select(this)
            if(element.attr("class") == "map_unselected"){
                element.attr("class", "map_selected")
                map_selection_handler(geo_id, "selected", dataset_paper)
            }
            else{
                element.attr("class", "map_unselected")
                map_selection_handler(geo_id, "unselected", dataset_paper)
                element.attr("fill", function(d){ 
                let val = element.attr("value")
                if(val == "unknown"){return "black"}
                return heatMapcolor(Math.ceil(10*val/maxNpaper))
                })
            }
        })
        .on("mouseover", function(d) {mouseover(d, d3.select(this).attr("value"))})
        .on("mousemove", function(d) {mousemove(d)})
        .on("mouseout", function(d) {mouseout(d)})

    d3.select("#zone_1_id").call(d3.zoom().on("zoom", function () {svg.attr("transform", d3.zoomTransform(this))}))
    d3.select("#zone_1_id").on("dblclick.zoom", null);

    update_nations("#3d9983")
}

/// FUNCTIONS

function update_nations(color){

    

    // Define color
    heatMapcolor = d3.scaleLinear().domain([0,10]).range(["white", color])

    svg.selectAll("path")
        .attr("value", function(d){
            let geo_id = this.id
            if(hash[geo_id] == null){ 
                let simil = findSimilar(hash, this.id)
                if(simil[1] == 1){ geo_id = simil[0]}
            }
            return hash[geo_id] == null ? "unknown" :  (Math.ceil(hash[geo_id]))})
            
        .attr("fill", function(d){
            let val = d3.select(this).attr("value")
            if(val == "unknown"){return "black"}
            return heatMapcolor(Math.ceil(10*val/maxNpaper))}
            )
}

function mouseover(d, n_papers){
    
    let tooltip = d3.select("#tooltip")

    tooltip.style("opacity", 1);
    if(d3.event.pageY > window.innerHeight/2){tooltip.selectAll(".south-tail").style("opacity", 1)}
    else{tooltip.selectAll(".north-tail").style("opacity", 1);}

    let val = "lfjzb"

    d3.select("#tooltip-text").html(function(){
        
        return  `<b>${d.properties.name}</b><br>Number of papers: <b>${n_papers}</b>`
    })

    
}

function mousemove(d){

    let direction = 25 // tooltip over
    if(d3.event.pageY > window.innerHeight/2){direction = -80} // tooltip down
    d3.select("#tooltip")
      .style("left", (d3.event.pageX-35) + "px")
      .style("top", (d3.event.pageY + direction) + "px")
}

function mouseout(d){

    let tooltip = d3.select("#tooltip")
    tooltip.selectAll("div").style("opacity", 0).html("")
    tooltip.select("span").html("")

    
    tooltip
        .style("opacity", 0)
        .style("left", 0 + "px")
        .style("top", 0 + "px")

    
}
