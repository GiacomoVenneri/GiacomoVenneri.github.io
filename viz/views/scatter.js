import {timestamp_to_date, handle_scatter_visibility, findSimilar} from "./utils.js"
var column_name= {
    1: "Publish_time", 
    2: "reference_to",
    3: "citedBy",
    4: "Topic",
    5: "in_deg",
    6: "betweennes"
 }
var width = 220
var height = 300//300
var scatter_zone;
var x, y, xAxis, yAxis;
var svg;
var name_x = "Publish_time"
var name_y = "in_deg"
var menu;

export function scatter(data_papers){
    
    svg = d3.select("#zone_3_id")
    .append("svg")
        .attr("id", "svg3")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${height} ${width}`)
        //.style("background-color", "red")
        .attr("transform", "scale(0.985) translate(1,1)")
        .classed("svg-content", true)

    menu = d3.select("#zone_3_id")
        .append("div")
            .style("position", " absolute")
            .style("background-color", "lightgray")
            .style("width", "99%")
            .style("height", "4%")
            .style("top", ".3%")
            .style("left", ".2%")
            .style("border", "2px solid lightgrey")

    menu.append("text").style("color", "black").html(" X-axis: ")
    var select_opt_X = menu.append("select").attr("id", "opt_x").on("change", function() {update_x_axis(this.value, data_papers)})
    select_opt_X.append("option").attr("value","1").attr("id", "Publish_time").attr("selected","true").text("Publish_time")
    select_opt_X.append("option").attr("value","2").attr("id", "reference_to").text("reference_to")
    select_opt_X.append("option").attr("value","3").attr("id", "citedBy").text("citedBy")
    select_opt_X.append("option").attr("value","4").attr("id", "Topic").text("Topic")
    select_opt_X.append("option").attr("value","5").attr("id", "in_deg").text("in_deg")
    select_opt_X.append("option").attr("value","6").attr("id", "in_deg").text("betweennes")

    menu.append("text").style("color", "black").html(" Y-axis: ")
    var select_opt_Y = menu.append("select").attr("id", "opt_y").on("change", function() {update_y_axis(this.value, data_papers)})
    select_opt_Y.append("option").attr("value","1").attr("id", "Publish_time").text("Publish_time")
    select_opt_Y.append("option").attr("value","2").attr("id", "reference_to").text("reference_to")
    select_opt_Y.append("option").attr("value","3").attr("id", "citedBy").text("citedBy")
    select_opt_Y.append("option").attr("value","4").attr("id", "Topic").text("Topic")
    select_opt_Y.append("option").attr("value","5").attr("id", "in_deg").attr("selected","true").text("in_deg")
    select_opt_Y.append("option").attr("value","6").attr("id", "betweennes").text("betweennes")
    
            


    x = d3.scaleLinear().range([0, 250])
    y = d3.scaleLinear().range([180, 0])

    x.domain(d3.extent(data_papers, function(d) { return +d[name_x]; }));
    y.domain(d3.extent(data_papers, function(d) { return +d[name_y]; }));

    
    xAxis = svg.append("g")
        .attr("class", "axis axis--x lightfill")
        .attr("transform", "translate(20, 200)")
        .call(d3.axisBottom(x))
        .attr("font-size", "6px")
        .append("text")
            .attr("id", "xLabel")
            .html(`${name_x}`)
            .style("font-size", "5px")
            .attr("transform", "translate(265, 15)")
    if(name_x == "Publish_time"){
        svg.select(".axis--x").selectAll(".tick").select("text").html(function(){
            return timestamp_to_date(new Date(parseInt(d3.select(this).html().replaceAll(",", ""))))
        })
    }


    yAxis = svg.append("g")
        .attr("class", "axis axis--y lightfill")
        .attr("transform", "translate(20," + 20 + ")")
        .call(d3.axisLeft(y))
        .attr("font-size", "6px")
        .append("text")
        .attr("id", "yLabel")
            .html(`${name_y}`)
            .style("font-size", "5px")
            .attr("transform", "translate(10, -4)")

    

 
    var clip = svg.append("defs").append("SVG:clipPath")
    .attr("id", "clip")
    .append("SVG:rect")
        .attr("width",  254)
        .attr("height", 184 )
        .attr("x", 20)
        .attr("y", 16)

    scatter_zone = svg.append('g')
        .attr("clip-path", "url(#clip)")
        
        //.attr("transform", "translate(30," + 1 + ")")
   
    scatter_zone.selectAll("circle").data(data_papers).enter()
        .append("circle")
        .attr("id", function(d){return d.DOI})
        .attr('class', 'circle_unselected')
        .attr("cx", function (d) { return 21+ x(d[name_x]) } )
        .attr("cy", function (d) { return 19+ y(d[name_y]) } )
        .attr("r", 1.5)
        .style("stroke", "black")
        .style("stroke-width", "0.1") 
   

        svg.append("g")
        .call(d3.brush()
            .extent([[18, 17], [width+41+12, 180+19+3]])
            .on("brush", highlightBrushedCircles).on("end", endBrush));
    
}



function endBrush(){

   
    if(d3.event.selection == null){
        svg.selectAll('circle').style("visibility", "visible")
        d3.select("#zone_2_id").select(".foreground").selectAll("path").style("visibility", "visible")
        d3.select("#zone_4_id").select("tbody").selectAll("tr").style("visibility", "visible")

    let papersPerNation;
    let visible_circles = svg.selectAll('circle').data()
    visible_circles.forEach(function(d){

        papersPerNation = d3.nest()
            .key(function(d) {return d["Nation"];})
            .rollup((function(d) {return d3.sum(d, function(e) {return 1; });}))
            .entries(visible_circles);
    });
    let maxNpaper = d3.max(papersPerNation.map(x => x.value))
    let hash = Object.create(null);
    papersPerNation.forEach(function (x) {hash[x.key] = x.value;});
    let heatMapcolor = d3.scaleLinear().domain([0,10]).range(["white", "#3d9983"])

    d3.select("#zone_1_id").selectAll("path")
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
    else{handle_scatter_visibility()}
    
            
    //console.log(s);
}

function highlightBrushedCircles(){
    //console.log("brushing...")
    var s = d3.event.selection,
             x0 = s[0][0]-21,
             y0 = s[0][1]-19,
             x1 = s[1][0]-21,
             y1 = s[1][1]-19;

    svg.selectAll('circle')
        .style("visibility", function (d) {
            let current = d3.select(this)
            let x_tester = d[name_x];
            let y_tester = d[name_y];
            if(name_x == "citedBy"  || name_x == "reference_to" ){x_tester = x_tester.length}
            if(name_y == "citedBy"  || name_y == "reference_to" ){y_tester = y_tester.length}
    
            if ( !(x0 <= x(x_tester) && x(x_tester) <= x1  && y0 <= y(y_tester) && y(y_tester) <= y1) ){return "hidden"; }
            else{
                current.raise()
                return "visible"
            }
        });

}

function update_x_axis(value, data_papers){
    name_x = column_name[value]
    if(name_x == "Topic"){
        x = d3.scaleOrdinal()
            .domain([...new Set(data_papers.map((d) => d["Topic"]))])
            .range([250, 125, 0]); 
    }
    else{
        x = d3.scaleLinear().range([0, 250])
        x.domain(d3.extent(data_papers, function(d) {
        if(name_x == "citedBy"  || name_x == "reference_to" ){return d[name_x].length;}
        else{{return d[name_x]}}
    }));
    }
    

    
    svg.select(".axis--x").remove()

    xAxis = svg.append("g")
        .attr("class", "axis axis--x lightfill")
        .attr("transform", "translate(20, 200)")
        .call(d3.axisBottom(x))
        .attr("font-size", "6px")
        .append("text")
            .attr("id", "xLabel")
            .html(`${name_x}`)
            .style("font-size", "5px")
            .attr("transform", "translate(265, 15)")
    if(name_x == "Publish_time"){
        svg.select(".axis--x").selectAll(".tick").select("text").html(function(){
            return timestamp_to_date(new Date(parseInt(d3.select(this).html().replaceAll(",", ""))))
        })
    }

    var cerchi = scatter_zone.selectAll("circle");
    cerchi.transition().duration(1000).attr("cx", function (d) { 
        if(name_x == "citedBy"  || name_x == "reference_to" ){return 21+x(d[name_x].length);}
        else{{return 21+x(d[name_x])}}
     })
    d3.select("#xLabel").html(`${name_x}`)
    
}

function update_y_axis(value, data_papers){
    name_y = column_name[value]
    if(name_y == "Topic"){
        y = d3.scaleOrdinal()
            .domain([...new Set(data_papers.map((d) => d["Topic"]))])
            .range([180, 90, 0]); 
    }
    else{
        y = d3.scaleLinear().range([180, 0])
        y.domain(d3.extent(data_papers, function(d) {
        if(name_y == "citedBy"  || name_y == "reference_to" ){return d[name_y].length;}
        else{{return d[name_y]}}
    }));
    }
    

    
    svg.select(".axis--y").remove()

    yAxis = svg.append("g")
        .attr("class", "axis axis--y lightfill")
        .attr("transform", "translate(20," + 20 + ")")
        .call(d3.axisLeft(y))
        .attr("font-size", "6px")
        .append("text")
        .attr("id", "yLabel")
            .html(`${name_y}`)
            .style("font-size", "5px")
            .attr("transform", "translate(10, -4)")

    if(name_y == "Publish_time"){
        svg.select(".axis--y").selectAll(".tick").select("text").html(function(){
            return timestamp_to_date(new Date(parseInt(d3.select(this).html().replaceAll(",", ""))))
        })
    }

    var cerchi = scatter_zone.selectAll("circle");
    cerchi.transition().duration(1000).attr("cy", function (d) { 
        if(name_y == "citedBy"  || name_y == "reference_to" ){return 19+y(d[name_y].length);}
        else{{return 19+y(d[name_y])}}
     })
    d3.select("#yLabel").html(`${name_y}`)
    
}
