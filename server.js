// Nick Francisco 
// CS 493 - Cloud Application Development
// Assignment 3 = Build a Restful API

const express = require('express');
const app = express();

const { Datastore } = require('@google-cloud/datastore');
const bodyParser = require('body-parser');

const datastore = new Datastore();

const BOAT = "Boat";
const SLIP = "Slip";

const router = express.Router();

app.use(bodyParser.json());

function fromDatastore(item) {
    item.id = item[Datastore.KEY].id;
    return item;
}

/* ------------- Begin Boat and Slip Model Functions ------------- */

// GET all boats FUNC
function get_boats() {
    const q = datastore.createQuery(BOAT);
    return datastore.runQuery(q).then((entities) => {
        return entities[0].map(fromDatastore);
    });
}

// GET all slips FUNC
function get_slips() {
    const q = datastore.createQuery(SLIP);
    return datastore.runQuery(q).then((entities) => {
        return entities[0].map(fromDatastore);
    });
}

// GET specific boat FUNC
function get_boat(id) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    return datastore.get(key).then((entity) => {
        if (entity[0] === undefined || entity[0] === null) {
            // No entity found. Don't try to add the id attribute
            return entity;
        } else {
            // Use Array.map to call the function fromDatastore. This function
            // adds id attribute to every element in the array entity
            return entity.map(fromDatastore);
        }
    });
}

// GET specific slip FUNC
function get_slip(id) {
    const key = datastore.key([SLIP, parseInt(id, 10)]);
    return datastore.get(key).then((entity) => {
        if (entity[0] === undefined || entity[0] === null) {
            // No entity found. Don't try to add the id attribute
            return entity;
        } else {
            // Use Array.map to call the function fromDatastore. This function
            // adds id attribute to every element in the array entity
            return entity.map(fromDatastore);
        }
    });
}

// POST boat FUNC
function post_boat(name, type, length) {
    var key = datastore.key(BOAT);
    const new_boat = { "name": name, "type": type, "length": length };
    return datastore.save({ "key": key, "data": new_boat }).then(() => { return key });
}

// POST slip FUNC
function post_slip(number, boatID) {
    var key = datastore.key(SLIP);
    const new_slip = { "number": number, "current_boat": boatID };
    return datastore.save({ "key": key, "data": new_slip }).then(() => { return key });
}

// PUT boat 
function put_boat(id, name, type, length) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    const boat = { "name": name, "type": type, "length": length };
    return datastore.save({ "key": key, "data": boat });
}

// PUT /slips/slipID/boatID
function put_boat_slip(slipId, boatId, slipNumber) {
    const key = datastore.key([SLIP, parseInt(slipId, 10)]);
    const slip = { "number": slipNumber, "current_boat": boatId };
    return datastore.save({ "key": key, "data": slip });
}

// PATCH boat
function patch_boat(id, name, type, length) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    const boat = { "name": name, "type": type, "length": length };
    return datastore.save({ "key": key, "data": boat }).then(() => { return key });
}

//DELETE boat
function delete_boat(id) {
    const key = datastore.key([BOAT, parseInt(id, 10)]);
    return datastore.delete(key);
}

//DELETE slip
function delete_slip(id) {
    const key = datastore.key([SLIP, parseInt(id, 10)]);
    return datastore.delete(key);
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

// GET /boats ROUTER
router.get('/boats', function (req, res) {
    const boats = get_boats()
        .then((boats) => {
            res.status(200).json(boats);
        });
});

// GET /slips ROUTER
router.get('/slips', function (req, res) {
    const slips = get_slips()
        .then((slips) => {
            res.status(200).json(slips);
        });
});

// GET /boats/:id
router.get('/boats/:id', function (req, res) {
    get_boat(req.params.id)
        .then(boat => {
            if (boat[0] === undefined || boat[0] === null) {
                // The 0th element is undefined. This means there is no boat with this id
                res.status(404).json({ 'Error': 'No boat with this boat_id exists' });
            } else {
                // Return the 0th element which is the boat with this id
                res.status(200).json(boat[0]);
            }
        });
});

// GET /slips/:id
router.get('/slips/:id', function (req, res) {
    get_slip(req.params.id)
        .then(slip => {
            if (slip[0] === undefined || slip[0] === null) {
                // The 0th element is undefined. This means there is no slip with this id
                res.status(404).json({ 'Error': 'No slip with this slip_id exists' });
            } else {
                // Return the 0th element which is the slip with this id
                res.status(200).json(slip[0]);
            }
        });
});

// POST /boats ROUTER
router.post('/boats', function (req, res) {
        // Check for missing attribute
        if (req.body.name == null || req.body.type == null || req.body.length == null) {
            res.status(400).send('{ "Error": "The request object is missing at least one of the required attributes"}');
        } else {
            post_boat(req.body.name, req.body.type, req.body.length)
                .then(key => { 
                    get_boat(key.id)
                        .then(boat => {
                            res.status(201).json(boat[0]) 
                        })                
                });
        }
});

// POST /slips ROUTER
router.post('/slips', function (req, res) {
    // Check for missing attribute
    if (req.body.number == null ) {
        res.status(400).send('{ "Error": "The request object is missing the required number"}');
    } else {
        const boatId = null
        post_slip(req.body.number, boatId)
            .then(key => { 
                get_slip(key.id)
                    .then(slip => {
                        res.status(201).json(slip[0]) 
                    })       
        });
    }
});

// PUT /boats/:id ROUTER
router.put('/boats/:id', function (req, res) {
    put_boat(req.params.id, req.body.name, req.body.type, req.body.length)
        .then(res.status(200).end());
});

// Boat arives at slip
// PUT /slips/:slipID/:boatID
router.put('/slips/:slipID/:boatID', function (req, res) { 
    var slipNum = 0;
    // Check if slip exists
    get_slip(req.params.slipID)
        .then(slip => {
            // Does not exist
            if (slip[0] === undefined || slip[0] === null) {
                // The 0th element is undefined. This means there is no slip with this id
                res.status(404).json({ 'Error': 'The specified boat and/or slip does not exist' });
                return;
            } 
            // Slip exists
            else {
                // Save slip number
                slipNum = slip[0].number; 
                // Check if boat exists
                get_boat(req.params.boatID)
                    .then(boat => {
                        // Does not exist
                        if (boat[0] === undefined || boat[0] === null) {
                            // The 0th element is undefined. This means there is no boat with this id
                            res.status(404).json({ 'Error': 'The specified boat and/or slip does not exist' });
                            return;
                        } 
                        // Boat exists 
                        else {
                            // Check if slip is empy
                            if (slip[0].current_boat != null) {
                                res.status(403).send({ 'Error': 'The slip is not empty' });
                                return;
                            } 
                            // Slip empty
                            else {
                                // Update slip
                                put_boat_slip(req.params.slipID, req.params.boatID, slipNum)
                                    .then(res.status(204).set('Content-Length', '0').end())
                            } 
                        }
                    });               
            }           
        });
});

// PATCH /boats/:id ROUTER
router.patch('/boats/:id', function (req, res) {
    // Check for missing attribute
    if (req.body.name == null || req.body.type == null || req.body.length == null) {
        res.status(400).send('{ "Error": "The request object is missing at least one of the required attributes"}');
    } else {
        // Check if boat id exists 
        get_boat(req.params.id)
            .then(boat => {
                // Boat id does not exist
                if (boat[0] === undefined || boat[0] === null) {
                    res.status(404).json({ 'Error': 'No boat with this boat_id exists' });
                    return;
                } 
                // Boat id exists, patching boat
                else {
                    patch_boat(req.params.id, req.body.name, req.body.type, req.body.length)
                        .then((key) => {
                            get_boat(req.params.id)
                                .then(boat => {
                                    // Send updated attributes back
                                    res.status(200).json(boat[0]);     
                                });                          
                        });
                }
            });      
    }
});

// Boat departs slip
router.delete('/slips/:slipID/:boatID', function (req, res) { 

    // Check if slip exists
    get_slip(req.params.slipID)
        .then(slip => { 
            // Does not exist
            if (slip[0] === undefined || slip[0] === null) {
                // The 0th element is undefined. This means there is no slip with this id
                res.status(404).json({ 'Error': 'No boat with this boat_id is at the slip with this slip_id' });
                return;
            } 
            // Slip exists 
            else {
                // Check if boat exists
                get_boat(req.params.boatID)
                    .then(boat => { 
                        // Does not exist
                        if (boat[0] === undefined || boat[0] === null) {
                            // The 0th element is undefined. This means there is no boat with this id
                            res.status(404).json({ 'Error': 'No boat with this boat_id is at the slip with this slip_id' });
                            return;
                        } 
                        // Boat exists
                        else {
                            // Check if specific boat is at slip
                            if (slip[0].current_boat == boat[0].id) {
                                // Update slip with no boat
                                put_boat_slip(req.params.slipID, null, slip[0].number)
                                    .then(res.status(204).set('Content-Length', '0').end())
                            }
                            // Boat not at this slip
                            else {
                                res.status(404).json({ 'Error': 'No boat with this boat_id is at the slip with this slip_id' });
                                return;
                            }
                        }
                    });
            }
        });
});

// DELETE /boats/:id ROUTER
router.delete('/boats/:id', function (req, res) {
    // Check if boat exists 
    get_boat(req.params.id)
    .then(boat => { 
        // Does not exist
        if (boat[0] === undefined || boat[0] === null) {
            // The 0th element is undefined. This means there is no boat with this id
            res.status(404).json({ 'Error': 'No boat with this boat_id exists' });
            return;
        } 
        // Boat exists 
        else {
            // Check if boat is at a slip
            // Get all slips
            get_slips()
            .then(slips => {
                // Loop through slips and check for boat to delete
                for (let i = 0; i < slips.length; ++i) {
                    // Ship is at slip
                    if(slips[i].current_boat == req.params.id) {
                        // Update slip with no boat before deleting
                        put_boat_slip(slips[i].id, null, slips[i].number)
                            .then( )
                    }
                }
                // Delete boat
                delete_boat(req.params.id).then(res.status(204).end())                
            })
        }
    });    
});

// DELETE /slip/:id ROUTER
router.delete('/slips/:id', function (req, res) {
    // Check if slip exists
    get_slip(req.params.id)
        .then(slip => { 
            // Does not exist
            if (slip[0] === undefined || slip[0] === null) {
                // The 0th element is undefined. This means there is no slip with this id
                res.status(404).json({ 'Error': 'No slip with this slip_id exists' });
                return;
            } 
            // Slip exists 
            else {
                delete_slip(req.params.id).then(res.status(204).end())
            }
        });
});

/* ------------- End Controller Functions ------------- */

app.use('/', router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});