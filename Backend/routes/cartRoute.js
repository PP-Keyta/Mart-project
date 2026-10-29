import express from "express"
import * as cartC from "../controllers/cartController.js"


const router =express.Router()

router.get('/cart',cartC.getCart);
router.post('/cart',cartC.addToCart);
router.delete('/cart/items/:itemId',cartC.removeCartItem);
router.delete('/cart',cartC.clearCart);
router.post('/cart/checkout',cartC.checkoutCart);
router.get('/orders',cartC.getOrders);
router.get('/orders/:orderId',cartC.getOrderDetail);
router.get('/orders/member/:memberId',cartC.getOrdersByMember);

export default router;