//========================================================================
//                          Libraries
//========================================================================

const express = require('express')
const publicRouter = express.Router()
const privateRouter = express.Router()
const adminRouter = express.Router()
const lineMapdb = require('../../models/lineMap')
const validator = require('validator')
const async = require('async')
const ObjectId = require('mongoose').Types.ObjectId
const logger = require('../../config/logger').mainLogger
const fs = require('fs')


publicRouter.get('/', function (req, res) {
  lineMapdb.lineMap.find({}, "competition name").lean().exec(function (err, data) {
    if (err) {
      logger.error(err)
      res.status(400).send({msg: "Could not get maps"})
    } else {
      res.status(200).send(data)
    }
  })
})


publicRouter.get('/tiletypes', function (req, res) {
  const tileTypes = req.query.id || req.body.id

  var query
  if (tileTypes != null && tileTypes.constructor === String) {
    query = lineMapdb.tileType.findById(tileTypes)
  } else if (Array.isArray(tileTypes)) {
    query = lineMapdb.tileType.find({_id : {$in : tileTypes.filter(ObjectId.isValid)}})
  } else {
    query = lineMapdb.tileType.find({})
  }

  query.lean().exec(function (err, data) {
    if (err) {
      logger.error(err)
      res.status(400).send({msg: "Could not get tiletypes"})
    } else {
      res.status(200).send(data)
    }
  })
})

publicRouter.get('/:mapid', function (req, res, next) {
  const id = req.params.mapid

  if (!ObjectId.isValid(id)) {
    return next()
  }

  var populate
  if (req.query['populate'] !== undefined) {
    populate = {path: 'tiles', populate: {path: 'tileType'}}
  }

  var query = lineMapdb.lineMap.findById(id)
  if (populate !== undefined) {
    query.populate(populate)
  }
  query.lean().exec(function (err, data) {
    if (err) {
      logger.error(err)
      res.status(400).send({msg: "Could not get map"})
    } else {
      res.status(200).send(data)
    }
  })
})

adminRouter.get('/:mapid/delete', function (req, res, next) {
  var id = req.params.mapid

  if (!ObjectId.isValid(id)) {
    return next()
  }

  mapdb.map.remove({_id: id}, function (err) {
    if (err) {
      logger.error(err)
      res.status(400).send({msg: "Could not remove map"})
    } else {
      res.status(200).send({msg: "Map has been removed!"})
    }
  })
})

adminRouter.get('/:mapid/update', function (req, res, next) {
  var id = req.params.mapid

  if (!ObjectId.isValid(id)) {
    return next()
  }


})

adminRouter.post('/', function (req, res) {
  var map = req.body

  //logger.debug(map)

  var tiles = []
  for (var i in map.tiles) {
    if (map.tiles.hasOwnProperty(i)) {
      var tile = map.tiles[i]

      if (isNaN(i)) {
        var coords = i.split(',')
        tile.x = coords[0]
        tile.y = coords[1]
        tile.z = coords[2]
      }

      //logger.debug(tile)

      var tileTypeId = typeof tile.tileType ===
                       'object' ? tile.tileType._id : tile.tileType
      tiles.push({
        x        : tile.x,
        y        : tile.y,
        z        : tile.z,
        tileType : tileTypeId,
        rot      : tile.rot,
        items    : {
          obstacles : tile.items.obstacles,
          speedbumps: tile.items.speedbumps
        },
        levelUp  : tile.levelUp,
        levelDown: tile.levelDown
      })
    }
  }

  //logger.debug(tiles)

  var newMap = new lineMapdb.lineMap({
    competition      : map.competition,
    name             : map.name,
    height           : map.height,
    width            : map.width,
    length           : map.length,
    tiles            : tiles,
    startTile        : {
      x: map.startTile.x,
      y: map.startTile.y,
      z: map.startTile.z
    },
    numberOfDropTiles: map.numberOfDropTiles
  })

  //logger.debug(newMap)

  newMap.save(function (err, data) {
    if (err) {
      logger.error(err)
      res.status(400).send({msg: "Error saving map"})
    } else {
      res.location("/api/maps/line/" + data._id)
      res.status(201).send({msg: "New map has been saved", id: data._id})
    }
  })
})

publicRouter.all('*', function (req, res, next) {
  next()
})
privateRouter.all('*', function (req, res, next) {
  next()
})

module.exports.public = publicRouter
module.exports.private = privateRouter
module.exports.admin = adminRouter
