const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const APIFeatures = require('../utils/apiFeatures')


exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
    // console.log(req.params);

    const doc =  await Model.findByIdAndDelete(req.params.id)
    if(!doc) return next(new AppError('No document found with that ID', 404))
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
    // console.log(req.params);
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    if(!doc) return next(new AppError('No document found with that ID', 404))
    res.status(200).json({
        status: 'success',
        data: {
            doc
        }
    })
})

exports.createOne = (Model) => catchAsync(async (req, res, next) => {
    console.log(Model)
    try{
        const doc = await Model.create(req.body);
        res.status(201).json({
            status: 'success',
            data: {
                doc
            }
        })
    }catch(err){
        console.log(err)
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
    const tours = await Model.find()
        res.status(200).json({
        status: 'success',
        data: tours,
        requestTime: req.requestTime
        })
        next()
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