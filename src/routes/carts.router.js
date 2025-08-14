import { Router } from 'express';
import { CartModel } from '../models/Cart.model.js';
import { ProductModel } from '../models/Product.model.js';

const router = Router();

router.post('/', async (_req, res) => {
  const cart = await CartModel.create({ products: [] });
  res.status(201).json({ status: 'success', payload: cart });
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate('products.product')
      .lean();
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch {
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const product = await ProductModel.findById(pid).lean();
    if (!product) return res.status(404).json({ status: 'error', message: 'Producto no existe' });

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    const item = cart.products.find(p => p.product.equals(pid));
    if (item) item.quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch {
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => !p.product.equals(pid));
    await cart.save();
    res.json({ status: 'success', message: 'Producto removido del carrito' });
  } catch {
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

router.put('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    if (!Array.isArray(products)) {
      return res.status(400).json({ status: 'error', message: 'Se espera un arreglo "products"' });
    }

    const ids = products.map(p => p.product);
    const count = await ProductModel.countDocuments({ _id: { $in: ids } });
    if (count !== ids.length) {
      return res.status(400).json({ status: 'error', message: 'Algún productId no existe' });
    }

    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products },
      { new: true }
    );

    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch {
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== 'number' || quantity < 1) {
      return res.status(400).json({ status: 'error', message: 'quantity inválida' });
    }

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    const item = cart.products.find(p => p.product.equals(pid));
    if (!item) return res.status(404).json({ status: 'error', message: 'Producto no está en el carrito' });

    item.quantity = quantity;
    await cart.save();

    res.json({ status: 'success', payload: cart });
  } catch {
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

router.delete('/:cid', async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });

    cart.products = [];
    await cart.save();
    res.json({ status: 'success', message: 'Carrito vaciado' });
  } catch {
    res.status(400).json({ status: 'error', message: 'ID inválido' });
  }
});

export default router;