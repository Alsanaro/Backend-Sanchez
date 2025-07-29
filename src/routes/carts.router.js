import { Router } from 'express';
import CartManager from '../managers/CartManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cartsPath = path.join(__dirname, '..', 'data', 'carts.json');

const cartManager = new CartManager(cartsPath);

router.post('/', async (req, res) => {
  const nuevoCarrito = await cartManager.createCart();
  res.status(201).json(nuevoCarrito);
});

router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const carrito = await cartManager.getCartById(cid);

  if (!carrito) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(carrito.products);
});

router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const carritoActualizado = await cartManager.addProductToCart(cid, pid);

  if (!carritoActualizado) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(carritoActualizado);
});

export default router;