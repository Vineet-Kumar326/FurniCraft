/*const mangoose=require('mongoose');
const productSchema = new mangoose.Schema({
    productname: {
        type: String,
   
    },
    price: {
        type: Number,
        
    },
    description: {
        type: String,
         
    },
    category: {
        type: String,
        
    },
    image: {
        type: String,
        
    },  
    stock: {
        type: Number,
        
    },
    //reviews in array of objects username and review, rating and optional comment
    reviews: {
        type: Number,
        
    },
    rating: {
        type: Number,
        
    },
    //createdAt and updatedAt fields
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    // Define any other fields you need for your product model

}, {
    collection: 'products', 
    timestamps: true,
});
// Define the product schema with the required fields
const Productmodel = mangoose.model('Product', productSchema);
module.exports = Productmodel;*/


const mongoose=require('mongoose');

const productschema=new mongoose.Schema({
   productname:{
       type:String
       
   },
   price:{
       type:Number
       
   },
    description:{
         type:String
         
    },
    category:{
        type:String
       
    },
    image:{
        type:String
    },
    rating:{
        type:Number
    },
    stock:{
        type:Number,
        default:0
    },
   //reviews in array of objects username and review and rating and optional
    reviews:[{
         username:{
              type:String,
              required:true
         },
         review:{
              type:String,
              required:true
         },
         rating:{
              type:Number,
              required:true
         }
    }],

    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
    

},{
    collection:'products',
    timestamps:true
});
const productmodel=mongoose.model('products',productschema);
module.exports=productmodel;