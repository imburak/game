import "./style.css";
import Scene from "./scene";
import EntityManager from "./entityManager";
import Entity from "./entity";
import io from "socket.io-client";

const socket = io("ws://localhost:4001");

const scene = new Scene();

const entityManager = new EntityManager();

socket.on("destroy", (id) => {
  const entity = entityManager.getEntity(id);

  if (entity) entity.remove();
});

socket.on("movement", (data) => {
  const entity = entityManager.getEntity(data.id);

  if (!entity) {
    const entity = new Entity();

    entityManager.addEntity(data.id, entity);

    entity.init();

    scene.add(entity.object);
  } else {
    entity.update(data.body);
  }
});

const inputs = { right: false, left: false, forward: false };

const proxy = new Proxy(inputs, {
  set(obj, prop, value) {
    socket.emit("input", { ...obj, [prop]: value });
    return Reflect.set(obj, prop, value);
  },
  get: function (target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  },
});

document.addEventListener("keydown", (e) => {
  if (["w", "ArrowUp"].includes(e.key) && !proxy.forward) proxy.forward = true;
  else if (["a", "ArrowRight"].includes(e.key) && !proxy.right)
    proxy.right = true;
  else if (["d", "ArrowLeft"].includes(e.key) && !proxy.left) proxy.left = true;
});

document.addEventListener("keyup", (e) => {
  if (["w", "ArrowUp"].includes(e.key)) proxy.forward = false;
  else if (["a", "ArrowRight"].includes(e.key)) proxy.right = false;
  else if (["d", "ArrowLeft"].includes(e.key)) proxy.left = false;
});
