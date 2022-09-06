import {timestamp_to_date} from "./utils.js"
import {table_selection_handler} from "./utils.js"

var svg;
var table;
var height = 270
var width = 118

export function table_info(data_papers, selected = [], brushed = []){
let lista = ["id", "DOI", "Title", "First_author", "Journal", "Topic", "Publish_time", "Nation"]

   
    let data = data_papers.map(function(x){
        let to_ret = 
        {
            "DOI": x.DOI, "Title": x.Title,"First_author": x.First_author, 
            "Journal": x.Journal,"Topic": x.Topic, "Publish_time": x.Publish_time,"Nation": x.Nation
        }
        return to_ret
    })

    table = d3.select('#zone_4_id')
              .append('table')
              .attr("preserveAspectRatio", "xMinYMin meet")
              .attr("viewBox", `0 0 ${height} ${width}`)
              .style("border-collapse", "collapse")
              
    
    // headers
    table.append("thead")
    .append("tr")
    .selectAll("th")
    .data(lista)
    .enter().append("th")
    .text(function(d) { return d; })
    .style("color", "black")
    .style("padding", "5px")
    .style("background-color", "grey")
    .style("font-weight", "bold")
    .style("text-transform", "uppercase")
    /*
    .on("click", function(){
        d3.select(this).style("background-color", "yellow")
    })*/
    let counter = 0
    // data
    table.append("tbody")
    .selectAll("tr").data(data)
    .enter().append("tr")
        .attr("id", function(d){return d.DOI})
        .attr("class", "table_row_unselected")
        .on("click", function(d){
/*
            let isBrushing = d3.select("#zone_2_id").selectAll(".selection").filter(function(d){ 
                return d3.select(this).style("display") == "inline"
            }).size()  > 0 ? true : false ;
*/
            let element = d3.select(this)
            let classes_ = element.attr("class").split(" ")
            let class_ = classes_[0]
            let brushed_class = ``
            if(classes_.length > 1){brushed_class = ` table_row_brushed`}
         
            if(class_ == "table_row_unselected"){
                element.attr("class", `table_row_selected${brushed_class}`)
                table_selection_handler(d.DOI,'selected')
            }
            else{
                element.attr("class", `table_row_unselected${brushed_class}`)
                table_selection_handler(d.DOI,'unselected')
            }
        })
        .selectAll("td")
        .data(function(d){return [counter++].concat(Object.values(d))})
        .enter().append("td")
            .style("font-size", "13px")
            .text(function(d, i) {
                if(i == 6) {return timestamp_to_date(new Date(d))}
                else{return d;}
            })
            .style("padding", "5px")
  


}