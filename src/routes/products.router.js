import { Router } from 'express';
import { ProductModel } from '../models/Product.model.js';

export default function productsRouter(io) {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      const {
        limit = 10,
        page = 1,
        sort,
        query
      } = req.query;

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

      const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
      const hasPrevPage = pg > 1;
      const hasNextPage = pg < totalPages;

      const prevLink = hasPrevPage
        ? `${baseUrl}?page=${pg - 1}&limit=${lim}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
        : null;

      const nextLink = hasNextPage
        ? `${baseUrl}?page=${pg + 1}&limit=${lim}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`
        : null;

      return res.json({
        status: 'success',
        payload: products,
        totalPages,
        prevPage: hasPrevPage ? pg - 1 : null,
        nextPage: hasNextPage ? pg + 1 : null,
        page: pg,
        hasPrevPage,
        hasNextPage,
        prevLink,
        nextLink
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ status: 'error', message: 'Error al listar productos' });
    }
  });

  router.get('/:pid', async (req, res) => {
    try {
      const prod = await ProductModel.findById(req.params.pid).lean();
      if (!prod) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
      res.json({ status: 'success', payload: prod });
    } catch {
      res.status(400).json({ status: 'error', message: 'ID inválido' });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { title, description, code, price, stock, category, thumbnails, status } = req.body;
      if (!title || !code || price == null || stock == null || !category) {
        return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
      }
      const created = await ProductModel.create({
        title,
        description,
        code,
        price,
        stock,
        category,
        status: status ?? true,
        thumbnails: thumbnails || []
      });

      if (io) {
        const all = await ProductModel.find().lean();
        io.emit('updateProducts', all);
      }

      res.status(201).json({ status: 'success', payload: created });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(400).json({ status: 'error', message: 'code duplicado' });
      }
      res.status(500).json({ status: 'error', message: 'Error creando producto' });
    }
  });

  router.put('/:pid', async (req, res) => {
    try {
      const { pid } = req.params;
      const { _id, id, ...update } = req.body; // no permitir cambiar id
      const updated = await ProductModel.findByIdAndUpdate(pid, update, { new: true }).lean();
      if (!updated) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
      res.json({ status: 'success', payload: updated });
    } catch {
      res.status(400).json({ status: 'error', message: 'ID inválido' });
    }
  });

  router.delete('/:pid', async (req, res) => {
    try {
      const { pid } = req.params;
      const del = await ProductModel.findByIdAndDelete(pid).lean();
      if (!del) return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });

      if (io) {
        const all = await ProductModel.find().lean();
        io.emit('updateProducts', all);
      }

      res.json({ status: 'success', message: 'Producto eliminado' });
    } catch {
      res.status(400).json({ status: 'error', message: 'ID inválido' });
    }
  });

  return router;
}