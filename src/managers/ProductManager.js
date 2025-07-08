import fs from 'fs/promises';

export default class ProductManager {
  constructor(path) {
    this.path = path;
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async getProductById(id) {
    const productos = await this.getProducts();
    return productos.find((p) => p.id === id);
  }

  async addProduct(producto) {
    const productos = await this.getProducts();

    const newId = productos.length > 0
      ? (parseInt(productos[productos.length - 1].id) + 1).toString()
      : '1';

    const nuevoProducto = {
      id: newId,
      status: true,
      ...producto,
    };

    productos.push(nuevoProducto);
    await fs.writeFile(this.path, JSON.stringify(productos, null, 2));
    return nuevoProducto;
  }

  async updateProduct(id, campos) {
    const productos = await this.getProducts();
    const index = productos.findIndex((p) => p.id === id);

    if (index === -1) return null;

    // No permitir modificar el ID
    delete campos.id;

    productos[index] = {
      ...productos[index],
      ...campos,
    };

    await fs.writeFile(this.path, JSON.stringify(productos, null, 2));
    return productos[index];
  }

  async deleteProduct(id) {
    const productos = await this.getProducts();
    const filtrados = productos.filter((p) => p.id !== id);

    if (productos.length === filtrados.length) return null;

    await fs.writeFile(this.path, JSON.stringify(filtrados, null, 2));
    return true;
  }
}