const Fawn = require('fawn');
const {Product} = require('../models/products');
const {Customer} = require('../models/customers')
const {CartOrder, validate} = require('../models/cartOrders');
const mongoose = require('mongoose');

Fawn.init(mongoose);

async function getCartOrders (req, res) {     
    const cartOrders = await CartOrder.find();
    res.send(cartOrders);
}

async function getCartOrderByID (req, res) {     
    const cartOrders = await CartOrder.findById(req.params.id);

    if(!cartOrders) return res.status(404).send('Product with given ID is not found');
    
    res.send(cartOrders);
}


async function createCartOrder (req, res) {     
    const {error} = validate(req.body);
    if (error) return res.status(404).send(error.details[0].message);

    const customer = await Customer.findById(req.body.customerId);
    if (!customer) return res.status(404).send('Invalide Customer');

    const product = await Product.findById(req.body.productId);
    if (!product) return res.status(404).send('Invalide Product');

    if (product.numberInStock === 0) return res.status(400).send('Product not in stock.');

    //create the new CartOrder
    let newCartOrder = new CartOrder({ 
        customer:{
            _id: customer._id,
            UserName: customer.UserName,
            Email: customer.Email,
            Phone: customer.Phone
        },
        product:{
            _id: product._id,
            Pro_Name: product.Pro_Name,
            Pro_Price: product.Pro_Price
        },
        SelectedQuantity: req.body.SelectedQuantity,
    });

    if(req.body.SelectedQuantity <= product.numberInStock){
    try{
        new Fawn.Task()
            .save('cartorders', newCartOrder)
            .update('products', { _id: product._id}, {
                $inc: { numberInStock: -req.body.SelectedQuantity}
            })
            .run();
    
        res.send(newCartOrder);
    }
    catch(ex)
    {
        res.status(500).send('Somthing Faild');
    }
}
else{
    res.status(500).send("Stock is not enough for this order");
}
}

async function updateCartOrder (req, res) {     
    const {error} = validate(req.body);
    if (error) return res.status(404).send(error.details[0].message);
    
        //update the Order
        const UpdateCartdOrder = await CartOrder.findByIdAndUpdate(req.params.id, {
            customer:{
                _id: customer._id,
                UserName: customer.UserName,
                Email: customer.Email,
                Phone: customer.Phone
            },
            product:{
                _id: product._id,
                Pro_Name: product.Pro_Name,
                Pro_Price: product.Pro_Price
            },
            SelectedQuantity: req.body.SelectedQuantity,
            }, {
            new: true
          });
    
        //return the updated CartdOrder
        res.send(UpdateCartdOrder);
}

async function deleteCartdOrder (req, res) {     
    //find the Product
    const DeletedCartOrder = await CartOrder.findByIdAndRemove(req.params.id);

    if(!DeletedCartOrder) return res.status(404).send('genre is not found');

    res.send(DeletedCartOrder);

}

exports.getCartOrders = getCartOrders;
exports.getCartOrderByID = getCartOrderByID;
exports.createCartOrder = createCartOrder;
exports.updateCartOrder = updateCartOrder;
exports.deleteCartdOrder = deleteCartdOrder;
 