import { Router } from 'express';
import { ProductModel } from '../models/Product.model.js';
import { CartModel } from '../models/Cart.model.js';

const router = Router();

router.get('/products', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;

  const lim = Math.max(1, parseInt(limit));
  const pg = Math.max(1, parseInt(page));

  const filter = {};
  if (query) {
    const [key, val] = String(query).split(':');
    if (key === 'category' && val) filter.category = val;
    if (key === 'status' && val !== undefined) filter.status = val === 'true';
  }

  let sortOption;
  if (sort === 'asc') sortOption = { price: 1 };
  if (sort === 'desc') sortOption = { price: -1 };

  const totalCount = await ProductModel.countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(totalCount / lim));
  const skip = (pg - 1) * lim;

  const products = await ProductModel.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(lim)
    .lean();

  const hasPrev = pg > 1;
  const hasNext = pg < totalPages;

  res.render('index', {
    products,
    page: pg,
    totalPages,
    hasPrev,
    hasNext,
    prevPage: hasPrev ? pg - 1 : null,
    nextPage: hasNext ? pg + 1 : null,
    limit: lim,
    sort,
    query
  });
});

router.get('/products/:pid', async (req, res) => {
  const prod = await ProductModel.findById(req.params.pid).lean();
  if (!prod) return res.status(404).send('Producto no encontrado');
  res.render('productDetail', { product: prod });
});

router.get('/carts/:cid', async (req, res) => {
  const cart = await CartModel.findById(req.params.cid)
    .populate('products.product')
    .lean();
  if (!cart) return res.status(404).send('Carrito no encontrado');
  res.render('cart', { cart });
});

export default router;
