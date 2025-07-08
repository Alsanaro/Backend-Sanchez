import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export default class CartManager {
  constructor(rutaArchivo) {
    this.path = rutaArchivo;
  }

  async _leerArchivo() {
    try {
      const data = await fs.readFile(this.path, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async _guardarArchivo(data) {
    await fs.writeFile(this.path, JSON.stringify(data, null, 2));
  }

  async getCartById(id) {
    const carritos = await this._leerArchivo();
    return carritos.find(c => c.id === id);
  }

  async createCart() {
    const carritos = await this._leerArchivo();
    const newCart = {
      id: crypto.randomUUID(),
      products: []
    };
    carritos.push(newCart);
    await this._guardarArchivo(carritos);
    return newCart;
  }

  async addProductToCart(cid, pid) {
    const carritos = await this._leerArchivo();
    const carrito = carritos.find(c => c.id === cid);

    if (!carrito) return null;

    const productoEnCarrito = carrito.products.find(p => p.product === pid);

    if (productoEnCarrito) {
      productoEnCarrito.quantity += 1;
    } else {
      carrito.products.push({ product: pid, quantity: 1 });
    }

    await this._guardarArchivo(carritos);
    return carrito;
  }
}