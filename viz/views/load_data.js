import {world} from "./world.js"
import {parallel_coordinates} from "./parallel_coordinates.js"
import {scatter} from "./scatter.js"
import {table_info} from "./table_info.js"


d3.queue()
    .defer(d3.json, "\\..\\datasets\\dataset_complete_7001.json")
    .await(init)

function init(error, data_papers){

    world(data_papers)
    parallel_coordinates(data_papers)
    scatter(data_papers)
    table_info(data_papers)

}


