export function timestamp_to_date(timestamp){
    
    var info = timestamp.toString().split(' ')
    return info[1]+"/"+info[3]
}

export function table_selection_handler(doi, state){
    

   //UPDATE PARALLEL COORDINATES
   let paths = d3.select("#zone_2_id").select(".foreground").selectAll("path")
    paths.attr("class", function(d){
        let current = d3.select(this)
        if(d.DOI == doi) {
            let classes_ = current.attr("class").split(" ")
            let brushed_class = ``
            if(classes_.length > 1){brushed_class = ` path_brushed`}
            current.raise()
            return `path_${state}${brushed_class}`
        }
        else{ return d3.select(this).attr("class")}
    })

    //UPDATE SCATTER
    let circles = d3.select("#zone_3_id").selectAll("circle")
    circles.attr("class", function(d){
        let current = d3.select(this)
        if(d.DOI == doi) {
            let classes_ = current.attr("class").split(" ")
            let brushed_class = ``
            if(classes_.length > 1){brushed_class = ` circle_brushed`}
            current.raise()
            return `circle_${state}${brushed_class}`
        }
        else{ return d3.select(this).attr("class")}
    })
  
}

export function map_selection_handler(country, state, data){

    let isBrushing = d3.select("#zone_2_id").selectAll(".selection").filter(function(d){ 
        return d3.select(this).style("display") == "inline"
    }).size()  > 0 ? true : false ;


    //UPDATE TABLE
    let rows = d3.select("#zone_4_id").select("tbody").selectAll("tr").filter(function(d){ 
        return d3.select(this).style("visibility") == "visible"
    })

    if(isBrushing){
        let rows_brushed  = rows.filter(function(d) { 
            return d3.select(this).attr("class").split(" ").length > 1
        });
        rows = rows_brushed
    }
    rows.attr("class",function(d){
        let current = d3.select(this)
        if(d.Nation == country){
            let classes_ = current.attr("class").split(" ")
            let brushed_class = ``
            if(classes_.length > 1){
                brushed_class = ` table_row_brushed`
                current.lower()
            }
            if(state == "selected"){current.lower()}
            return `table_row_${state}${brushed_class}`
        }
        else{return current.attr("class")}
    })


  
    //UPDATE PARALLEL COORDINATES
    let paths = d3.select("#zone_2_id").select(".foreground").selectAll("path")
    if(isBrushing){
        let paths_brushed  = paths.filter(function(d) { 
            return d3.select(this).attr("class").split(" ").length > 1
        });
        paths = paths_brushed
    }
    paths.attr("class",function(d){
        let current = d3.select(this)
        if(d.Nation == country){
            let classes_ = current.attr("class").split(" ")
            let brushed_class = ``
            if(classes_.length > 1){brushed_class = ` path_brushed`}
            current.raise()
            return `path_${state}${brushed_class}`
        }
        else{return d3.select(this).attr("class")}
    })

    //UPDATE SCATTER
    let circles = d3.select("#zone_3_id").selectAll("circle")
    if(isBrushing){
        let circles_brushed  = circles.filter(function(d) { 
            return d3.select(this).attr("class").split(" ").length > 1
        });
        circles = circles_brushed
    }
    circles.attr("class",function(d){
        let current = d3.select(this)
        if(d.Nation == country){
            let classes_ = current.attr("class").split(" ")
            let brushed_class = ``
            if(classes_.length > 1){brushed_class = ` circle_brushed`}
            current.raise()
            return `circle_${state}${brushed_class}`
        }
        else{return d3.select(this).attr("class")}
    })

    
    
}

export function handle_brushing(list_doi){
    d3.select("#zone_1_id").selectAll(".map_selected").attr("class", "map_unselected")
    d3.select("#zone_3_id").selectAll(".circle_selected").attr("class", "circle_unselected")
    d3.select("#zone_4_id").selectAll(".table_row_selected").attr("class", "table_row_unselected")

    d3.select("#zone_3_id").selectAll("circle").attr("class", function(){
        let elem = d3.select(this)
        if (list_doi.includes(elem.attr("id"))){
                elem.raise()
                return `${elem.attr("class")} circle_brushed`
        }
        else return "circle_unselected"
    })

    d3.select("#zone_4_id").selectAll("tr").attr("class", function(){
        let elem = d3.select(this)
        if (list_doi.includes(elem.attr("id"))){
                elem.lower()
                return `${d3.select(this).attr("class")} table_row_brushed `
        }
        else return "table_row_unselected"
    })

    




}

export function handle_scatter_visibility(){
    
    let path_ref = d3.select("#zone_2_id").select(".foreground").selectAll("path")
    let rows_ref = d3.select("#zone_4_id").select("tbody").selectAll("tr") 


    let visible_circles =  d3.select("#zone_3_id").selectAll('circle').filter(function(d){ 
        return d3.select(this).style("visibility") == "visible"
    }).data()
    let visible_dois = visible_circles.map(x => x.DOI)
    
    //UPDATE PARALLEL COORDINATES
    path_ref.filter(function(d){ 
        let current = d3.select(this)
        if(visible_dois.includes(current.attr("id"))){current.style("visibility", "visible");return false}
        return true
    }).style("visibility", "hidden")

    //UPDATE TABLE
    rows_ref.filter(function(d){ 
        let current = d3.select(this)
        if(visible_dois.includes(current.attr("id"))){current.style("visibility", "visible");return false}
        return true
    }).style("visibility", "hidden").raise()

    //UPDATE MAPS
    let papersPerNation;
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

export function findSimilar(hash, country_name){

    return Object.keys(hash)
        .map(function(x){
            if( x.includes(country_name) || country_name.includes(x)){return [x, 1]}
            else{return [x, 0]}
        })
        .reduce(function(x1,x2){return ( x1.length == 0 || x2[1] > x1[1] ) ? x2 : x1;},[])

}