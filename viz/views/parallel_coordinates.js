import {timestamp_to_date, handle_brushing} from "./utils.js"

var dataset_paper;
var dimensions;
var foreground;
var extents;
var y;
var line = d3.line()
var svg;

/*
function timestamp_to_date(timestamp){
    var info = timestamp.toString().split(' ')
    return info[1]+"/"+info[3]
}
*/


export function parallel_coordinates(data_papers){
    dataset_paper = data_papers

    svg = d3.select("#zone_2_id").append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 270 95")
    .attr("id", "svg2")
    .attr("transform", "scale(0.985) translate(0,-1)")

    var x = d3.scaleBand().rangeRound([10, 345]).padding(.1)
    y = {}
    
    x.domain(dimensions = d3.keys(dataset_paper[0]).filter(function(d) {
     
        if(d == "Publish_time"){
            return y[d] = d3.scaleLinear()
                .domain(d3.extent(data_papers, function(p) { return +p[d]; }))
                .range([87, 3]);
        }
        else if(d == "Topic"){
            return y[d] = d3.scaleOrdinal()
            .domain([...new Set(data_papers.map((d) => d["Topic"]))])
            .range([87, 42, 3]); 
        }
        
        else if(d == "reference_to"){
            return y[d] = d3.scaleLinear()
                .domain(d3.extent(data_papers, function(p) {return (p[d].length);}))
                .range([87, 3]); 
        }
        else if(d == "citedBy"){
            return y[d] = d3.scaleLinear()
                .domain(d3.extent(data_papers, function(p) {return (p[d].length);}))
                .range([87, 3]); 
        }
        else{return false}
        
    }));



    foreground = svg.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(data_papers)
        .enter().append("path")
        .style("visibility", "visible")
            .attr("id", function(d){return d.DOI})
            .attr("class", "path_unselected")
            .attr("d", function(d){return line(dimensions.map(function(p){
                    if(p == "reference_to" || p == "citedBy"){
                        return [x(p), y[p](d[p].length)]
                    }
                    else{return [x(p), y[p](d[p])]}
                }))
            })
            .attr("transform", function(d) { return "translate(" + "0, 5" + ")"; })
        
            
    
    
    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", function(d){return ` dimension dimension_${d}`})
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })

    svg.selectAll(".dimension")
        .append("g")
        .append("text")
            .attr("class", "column_name")
            .html(function(d){return d })
            .style("fill", "white")
            .attr("transform", function(d) { return "translate(" + "-10, 5" + ")"; })
        


    // Add an axis.
    g.append("g")
        .attr("class", "axis")
        .style("font-family", "sans-serif")
        .each(function(d) {  

            d3.select(this)
            .call(d3.axisLeft(y[d]))
            .attr("font-size", "4px")


        })
        .attr("transform", function(d) { return "translate(" + "0, 5" + ")"; })

    
    svg.select(".dimension_Publish_time").selectAll(".tick").select("text").html(function(){
        return timestamp_to_date(new Date(parseInt(d3.select(this).html().replaceAll(",", ""))))
    })


    g.append("g")
        .attr("class", function(d){return `brush_${d}`})
        .each(function(d) {
            d3.select(this).call(y[d].brush = d3.brushY().extent([[-4, 0], [4,110]])
            .on("brush start", function(){brushstart()})
            .on("end", brushend))
            .on("dblclick", clean_brush)
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    extents = dimensions.map(function(p) { return [0,0]; });
}

var ids = []
function brushstart(ignore = null) {
    ids = []
    d3.event.sourceEvent.stopPropagation();

    for(var i=0;i<dimensions.length;++i) {
        
        if(d3.event.target==y[dimensions[i]].brush) {
           
            extents[i]=d3.event.selection
            
            extents[i][0] -=5;extents[i][1] -=5; // due to translation of 5 of the axis
            //console.log("before: ",y[dimensions[i]].invert(50))
           
            if(dimensions[i] == "Topic"){
            
               if(extents[i][0] <= y["Topic"]("Viral molecular biology")){extents[i][0] = 3}
               else if(extents[i][0] <= y["Topic"]("Societal response")){extents[i][0] = 42}
               else if(extents[i][0] <= y["Topic"]("Hospital Care")){extents[i][0] = 87}
               else{extents[i][0] == null}

               if(extents[i][1] >= y["Topic"]("Hospital Care")){extents[i][1] = 87}
               else if(extents[i][1] >= y["Topic"]("Societal response")){extents[i][1] = 42}
               else if(extents[i][1] >= y["Topic"]("Viral molecular biology")){extents[i][1] = 3}
               else{extents[i][1] == null}
               //console.log("AFTER: ", extents[i])
            }
            else{extents[i] = extents[i].map(y[dimensions[i]].invert,y[dimensions[i]]);}
          
        }
    }
    

    /*
    let paths_selected  = svg.select(".foreground").selectAll("path").filter(function(d) { 
        return d3.select(this).attr("class") == "path_selected"
    });

    let paths_unselected  = svg.select(".foreground").selectAll("path").filter(function(d) { 
        return d3.select(this).attr("class") != "path_selected"
    });

    */
    let used_paths= svg.select(".foreground").selectAll("path").filter(function(d){ 
        return d3.select(this).style("visibility") == "visible"
    })

    used_paths.attr("class", function(d){
        
        ids.push(d.DOI)
        var eliminato = false
        var res = dimensions.every(function(p, i) {
            //console.log("start_ign", ignore)
            if(ignore != null && ignore == p){return true}
            
            var check_2 = extents[i][0]==0 && extents[i][1]==0
            //console.log(`dimension: ${p} --> (${extents[i][0]}, ${extents[i][1]}) `)
            if(check_2) return true;
                
            let tester = d[p]
            if(p == "Topic"){
                tester = y["Topic"](tester)
                if(extents[i][0] > extents[i][1]){ return false}
            }
            if(p == "reference_to" || p == "citedBy"){tester = tester.length}

            //console.log("tester: ", tester)
            var check_1 = false
            if(p == "Topic"){if(extents[i][0] <= tester && tester <= extents[i][1]){check_1 = true}}
            else{if(extents[i][1] <= tester && tester <= extents[i][0]){check_1 = true}}
            
            if(extents[i][1] <= extents[i][0]){
               
                
                
            }
            
            //console.log("check: ", check_1)
            if(!check_1 && !(eliminato)){
                eliminato = true
                ids.pop()
            }
            return check_1
            })
        return res == true ? "path_unselected path_brushed" : "path_unselected"
    })
    
    svg.selectAll(".path_brushed").raise()
    
   

}

function brushend() {
    handle_brushing(ids)
}

function clean_brush(ignore){
   
    let n_of_brush = 0
    for(var i=0;i<dimensions.length;++i) {
        if(ignore == dimensions[i]){extents[i] = [0,0]}
        if(extents[i][0]!=0 || extents[i][1]!=0){n_of_brush++}
    }
  

    var ids = []
    svg.select(".foreground").selectAll("path").attr("class", function(d){
        ids.push(d.DOI)
        var eliminato = false
        var res = dimensions.every(function(p, i) {
            //console.log("start_ign", ignore)
            if(ignore != null && ignore == p){
                return n_of_brush == 0 ? false : true
            }
            
            var check_2 = extents[i][0]==0 && extents[i][1]==0
            //console.log(`dimension: ${p} --> (${extents[i][0]}, ${extents[i][1]}) `)
            if(check_2) return true;
                
            let tester = d[p]
            if(p == "Topic"){
                tester = y["Topic"](tester)
                if(extents[i][0] > extents[i][1]){ return false}
            }
            if(p == "reference_to" || p == "citedBy"){tester = tester.length}

            //console.log("tester: ", tester)
            var check_1 = false
            if(p == "Topic"){if(extents[i][0] <= tester && tester <= extents[i][1]){check_1 = true}}
            else{if(extents[i][1] <= tester && tester <= extents[i][0]){check_1 = true}}
            
            if(extents[i][1] <= extents[i][0]){
               
                
                
            }
            
            
            if(!check_1 && !(eliminato)){
                eliminato = true
                ids.pop()
            }
            return check_1
            })
            return res == true ? "path_brushed" : "path_unselected"
    })
    
    
    svg.selectAll(".path_brushed").raise()
    
}
