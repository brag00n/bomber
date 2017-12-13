const { TILE_SIZE, EMPTY_CELL, DESTRUCTIBLE_CELL, NON_DESTRUCTIBLE_CELL, SKINS } = require('../constants');

var { Player } = require('./player');
var { Bomb } = require('./bomb.js');

var uuidv4 = require('uuid/v4');
var faker = require('faker');

class Game {
  constructor({ map_name }) {
    this.id           = uuidv4();
    this.name         = faker.commerce.color()
    this.map_name     = map_name;

    this.layer_info   = require('../../client/maps/' + this.map_name + '.json').layers[0]
    this.max_players  = this.layer_info.properties.max_players

    // NOTE: we can`t use new Map - because Socket.io do not support such format
    this.players     = {}
    this.playerSkins = SKINS

    // NOTE: Copy objct - not reference
    this.playerSpawns = this.layer_info.properties.spawns.slice()

    this.bombs        = new Map();
  }

  addPlayer(id) {
    let skin = this.getAndRemoveSkin()
    let [spawn, spawnOnGrid] = this.getAndRemoveSpawn()

    let player = new Player({ id: id, skin: skin, spawn: spawn, spawnOnGrid: spawnOnGrid })
    this.players[player.id] = player
  }

  removePlayer(id) {
    let player = this.players[id];

    this.playerSkins.push(player.skin)
    this.playerSpawns.push(player.spawnOnGrid)

    delete this.players[id];
  }

  isEmpty() {
    return Object.keys(this.players).length === 0
  }

  getAndRemoveSkin() {
    // NOTE: we can user here simple .pop()
    let index = Math.floor(Math.random() * this.playerSkins.length);
    let randomSkin = this.playerSkins[index];
    this.playerSkins.splice(index, 1);

    return randomSkin;
  }

  addBomb({ col, row, power }) {
    let bomb = new Bomb({ game: this, col: col, row: row, power: power });
    if ( this.bombs.get(bomb.id) ) {
      return false
    }
    this.bombs.set(bomb.id, bomb);
    return bomb
  }

  getAndRemoveSpawn() {
    let index = Math.floor(Math.random() * this.playerSpawns.length);
    let spawnOnGrid = this.playerSpawns[index];
    this.playerSpawns.splice(index, 1);

    let spawn = { x: spawnOnGrid.col * TILE_SIZE, y: spawnOnGrid.row * TILE_SIZE };
    return [spawn, spawnOnGrid];
  }


  isFull() {
    return Object.keys(this.players).length === this.max_players
  }
}

exports.Game = Game;
