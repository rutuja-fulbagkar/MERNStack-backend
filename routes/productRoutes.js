import express from 'express';
import { createProduct , getAllProducts ,updateProduct,getSingleProduct,deleteProduct,archiveProduct,getArchivedProducts,getAllProductsWithoutPagination} from '../controllers/productController/productController.js';
import upload from '../middlewares/productMiddleware/upload.js';
const router = express.Router();

// Route for creating a product with file uploads
router.post(
  '/products',
  upload.fields([
    { name: 'downloadableFile', maxCount: 1 }, // Single downloadable file
    { name: 'images', maxCount: 5 }, // Up to 5 images
  ]),
  createProduct
);


router.get('/products', getAllProducts);
router.put('/update/:id', updateProduct);
router.get('/products/:id', getSingleProduct);
router.delete('/products/:id', deleteProduct);
router.put('/archive/:id', archiveProduct);
router.get('/archived', getArchivedProducts);
router.get('/getAllProductsWithoutPagination',getAllProductsWithoutPagination)


export default router;