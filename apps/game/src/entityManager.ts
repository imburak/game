import Entity from "./entity";

class EntityManager {
  entities: Map<string, Entity>;

  constructor() {
    this.entities = new Map();
  }

  getEntity(id: string) {
    return this.entities.get(id);
  }

  addEntity(id: string, entity: Entity) {
    this.entities.set(id, entity);
  }

  removeEntity(id: string) {
    const entity = this.entities.get(id);

    if (!entity) return;

    entity.remove();
  }
}

export default EntityManager;
