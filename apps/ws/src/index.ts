import http from "http";
import { Server } from "socket.io";
import express from "express";
import cors from "cors";
import * as CANNON from "cannon-es";

const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0), // m/s²
});
world.broadphase = new CANNON.NaiveBroadphase();
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane(),
  collisionFilterGroup: 2,
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // make it face up
world.addBody(groundBody);
const app = express();

app.use(cors());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

class Player {
  body: CANNON.Body;
  inputs = { forward: false, right: false, left: false };
  counter = 0;

  constructor() {
    this.body = new CANNON.Body({
      mass: 15, // kg
      shape: new CANNON.Cylinder(2, 2, 5),
      collisionFilterGroup: 1,
      collisionFilterMask: 2,
    });
    this.body.position.set(0, 20, 0);
    world.addBody(this.body);
  }

  remove() {
    world.removeBody(this.body);
  }

  move() {
    if (this.inputs.forward) {
      let directionVector = new CANNON.Vec3(0, 0, 1);
      directionVector.z -= 0.3;
      directionVector = this.body.quaternion.vmult(directionVector);

      this.body.position.x += directionVector.x;
      this.body.position.y += directionVector.y;
      this.body.position.z += directionVector.z;
    }
    if (this.inputs.left || this.inputs.right) {
      const qu = this.body.quaternion.clone();
      const n = new CANNON.Quaternion();
      const negative = this.inputs.right ? 1 : -1;
      n.setFromEuler(0, 0.1 * negative, 0);
      const res = qu.mult(n).normalize();
      this.body.quaternion.set(res.x, res.y, res.z, res.w);
    }
  }
}

const players: Map<string, Player> = new Map();

io.on("connection", (socket) => {
  const player = new Player();

  players.set(socket.id, player);

  socket.on("input", (inputs) => {
    player.inputs = inputs;
  });

  socket.on("disconnect", () => {
    player.remove();
    players.delete(socket.id);
    io.emit("destroy", socket.id);
  });
});

httpServer.listen(4001);

setInterval(() => {
  players.forEach((player, key) => {
    player.move();
    io.emit("movement", {
      id: key,
      body: {
        position: player.body.position,
        quaternion: player.body.quaternion,
      },
    });
  });
  world.fixedStep();
}, 1000 / 30);
