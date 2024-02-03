import { Object3D } from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import xBot from "./assets/xBot.fbx?url";
import * as THREE from "three";

class Entity {
  object!: Object3D;

  constructor() {
    const geometry = new THREE.CylinderGeometry(2, 2, 5);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const cylinder = new THREE.Mesh(geometry, material);
    this.object = cylinder;
  }

  async init() {
    const loader = new FBXLoader();
    const model = await loader.loadAsync(xBot);
    model.scale.set(0.1, 0.1, 0.1);
    model.position.set(0, 0, 0);
    this.object.add(model);

    return this.object;
  }

  update(body: any) {
    this.object.position.copy(body.position);
    this.object.quaternion.copy(body.quaternion);
  }

  remove() {
    this.object.removeFromParent();
  }
}

export default Entity;
