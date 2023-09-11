/// <reference path="../pb_data/types.d.ts" />

routerAdd("GET", "/rootapi/tags", (c) => {

    const result = arrayOf(new DynamicModel({
        // describe the shape of the data (used also as initial values)
        "id": "",
        "tags": [],
    }))
    
    $app.dao().db()
        .newQuery("SELECT DISTINCT tags FROM recipes LIMIT 10000")
        .all(result) // throw an error on db failure
    
    if (result.length > 0) {
        console.log(result[0].id)
    }
    
    return c.json(200, { result })
})

onAfterBootstrap((e) => {
    console.log("App initialized!")
})