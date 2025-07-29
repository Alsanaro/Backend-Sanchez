import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const filePath = path.join(__dirname, '..', 'data', 'products.json');

const router = Router();
const productManager = new ProductManager(filePath);

router.get('/', async (req, res) => {
  const productos = await productManager.getProducts();
  res.render('home', { productos });
});

router.get('/realtimeproducts', async (req, res) => {
  const productos = await productManager.getProducts();
  res.render('realTimeProducts', { productos });
});

export default router;