const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')
const Tour = require('./../models/tourModel')



exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
        console.log(req.params.id)
    const doc =  await Model.findByIdAndDelete(req.params.id)
    
    res.send({
        status: 200
    })
})

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    
    var doc = await Model.findByIdAndUpdate(req.params.id, req.body)
    var doc = await Model.findById(req.params.id)
    if(!doc) return next(new AppError('No document found with that ID', 404))
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
})

exports.createOne = (Model) => catchAsync(async (req, res, next) => {
    console.log(req.body)
    
    try{
        const doc = await Model.create(req.body);
        
        res.status(201).json({
            status: 'success',
            data: {
                doc
            }
        })
    }catch(err){
       res.send(err)
    }
})


exports.getAddedBy = (Model) => catchAsync(async (req, res, next) => {
    console.log(req.body)
    try {
        const users = await Model.find({ addedBy: req.body.id });
        res.json(users);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
      }
})

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if(popOptions) query = query.populate(popOptions)
    const doc = await query;
    if(!doc){
       return next(new AppError('No tour found with that ID', 404))
    }
        // console.log(req.params);
        res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
})

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
    console.log('up')
   try{
        const all = await Model.find()
        console.log('all')
        res.status(200).json({
        status: 'success',
        data: all,
        requestTime: req.requestTime
        })
        next()
   }catch(err){
        console.log(err)
   }
})

exports.getUserFromToken = (Model) => catchAsync(async (req, res, next) => {
    const tours = await Model.find()
        res.status(200).json({
        status: 'success',
        data: tours,
        requestTime: req.requestTime
        })
        next()
})