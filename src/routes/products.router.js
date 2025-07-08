import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

// Obtener la ruta absoluta al archivo products.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '..', 'data', 'products.json');

const productManager = new ProductManager(filePath);

// GET /api/products/
router.get('/', async (req, res) => {
  const productos = await productManager.getProducts();
  res.json(productos);
});

// GET /api/products/:pid
router.get('/:pid', async (req, res) => {
  const { pid } = req.params;
  const producto = await productManager.getProductById(pid);

  if (!producto) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(producto);
});

// POST /api/products/
router.post('/', async (req, res) => {
  const { title, description, code, price, stock, category, thumbnails } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const nuevoProducto = await productManager.addProduct({
    title,
    description,
    code,
    price,
    stock,
    category,
    thumbnails: thumbnails || [],
  });

  res.status(201).json(nuevoProducto);
});

// PUT /api/products/:pid
router.put('/:pid', async (req, res) => {
  const { pid } = req.params;
  const campos = req.body;

  const actualizado = await productManager.updateProduct(pid, campos);

  if (!actualizado) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json(actualizado);
});

// DELETE /api/products/:pid
router.delete('/:pid', async (req, res) => {
  const { pid } = req.params;

  const eliminado = await productManager.deleteProduct(pid);

  if (!eliminado) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  res.json({ mensaje: 'Producto eliminado correctamente' });
});

export default router;