const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('./../utils/catchAsync');
const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

//I dont need check body because of the mongoose library handle this in model for us.

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) Cover Image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  console.log(req.query);
  next();
};

exports.getAllTours = factory.getAll(Tour);
// try {
//BUILD QUERY
// 1A) -----Filtering the query-----
// const queryObj = { ...req.query };
// // console.log('query:', queryObj);
// const excludeFields = ['page', 'sort', 'limit', 'fields'];
// excludeFields.forEach(el => delete queryObj[el]);

// //GELEN OBJEYI JSON FORMATINA DÖNÜŞTÜR.
// let queryStr = JSON.stringify(queryObj);
// //EŞLEŞEN HEPSİNİ g (hepsi) başına $ koy değiştir
// queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
// //Değiştirdikten sonra JSON FORMATINI OBJE FORMATINA DEĞİŞTİR parse
// console.log('last query:', JSON.parse(queryStr));

// //Advenced filtered with new object
// let query = Tour.find(JSON.parse(queryStr));

// 2) ------SORTING THE QUERY-------
// if (req.query.sort) {
//   const sortBy = req.query.sort.split(',').join(' ');
//   console.log(sortBy);
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('-createdAt');
// }

// 3) ----FIELD THE QUERY-----
// if (req.query.fields) {
//   const fields = req.query.fields.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// 4) ------PAGINATION PART------
// ?page=2&limit=10 -> page 1, 1-10, page 2, 11-20
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 100;
// const skip = (page - 1) * limit;
// query = query.skip(skip).limit(limit);
// if (req.query.page) {
//   const numTours = await Tour.countDocuments();
//   if (skip >= numTours) throw new Error('This page does not exist');
// }
//EXECUTE QUERY

//   const features = new APIFeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   //Send RESPONSE

//   res.status(200).json({
//     status: 'success',
//     // requestedAt: req.requestTime,
//     results: tours.length,
//     data: {
//       tours
//     }
//   });
// } catch (err) {
//   res.status(404).json({
//     status: 'fail',
//     message: err
//   });
// }

// try {
//   const tour = await Tour.findById(req.params.id);
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });
// } catch (err) {
//   res.status(404).json({
//     status: 'fail',
//     message: err
//   });
// }
// console.log(req.params);
//const id = req.params.id * 1;

// const tour = tours.find(el => el.id === id);

// res.status(200).json({
//   status: 'success',
//   data: {
//     tour
//   }
// });

exports.createTour = factory.createOne(Tour);
// try {
//   // const newTour = new Tour({});
//   // newTour.save();

//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
// } catch (err) {
//   res.status(400).json({
//     status: 'fail',
//     message: err
//   });
// }
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);

//   if (!tour) return next(new AppError('No tour found with that ID', 404));

//   res.status(204).json({
//     status: 'success',
//     data: null
//   });
//   // try {
//   //   await Tour.findByIdAndDelete(req.params.id);
//   //   res.status(204).json({
//   //     status: 'success',
//   //     data: null
//   //   });
//   // } catch (err) {
//   //   res.status(404).json({
//   //     status: 'fail',
//   //     message: err
//   //   });
//   // }
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
      //$match: { difficulty: 'easy', maxGroupSize: 25 }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
    // {
    //   $match: { numRatings: { $lt: 159 } }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: { stats }
  });
  // try {
  //   const stats = await Tour.aggregate([
  //     {
  //       $match: { ratingsAverage: { $gte: 4.5 } }
  //       //$match: { difficulty: 'easy', maxGroupSize: 25 }
  //     },
  //     {
  //       $group: {
  //         _id: { $toUpper: '$difficulty' },
  //         numTours: { $sum: 1 },
  //         numRatings: { $sum: '$ratingsQuantity' },
  //         avgRating: { $avg: '$ratingsAverage' },
  //         avgPrice: { $avg: '$price' },
  //         minPrice: { $min: '$price' },
  //         maxPrice: { $max: '$price' }
  //       }
  //     },
  //     {
  //       $sort: { avgPrice: 1 }
  //     }
  //     // {
  //     //   $match: { numRatings: { $lt: 159 } }
  //     // }
  //   ]);
  //   res.status(200).json({
  //     status: 'success',
  //     data: { stats }
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numberToursStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: {
        numberToursStarts: -1
      }
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: { plan }
  });
  // try {
  //   const year = req.params.year * 1;

  //   const plan = await Tour.aggregate([
  //     {
  //       $unwind: '$startDates'
  //     },
  //     {
  //       $match: {
  //         startDates: {
  //           $gte: new Date(`${year}-01-01`),
  //           $lte: new Date(`${year}-12-31`)
  //         }
  //       }
  //     },
  //     {
  //       $group: {
  //         _id: { $month: '$startDates' },
  //         numberToursStarts: { $sum: 1 },
  //         tours: { $push: '$name' }
  //       }
  //     },
  //     {
  //       $addFields: { month: '$_id' }
  //     },
  //     {
  //       $project: {
  //         _id: 0
  //       }
  //     },
  //     {
  //       $sort: {
  //         numberToursStarts: -1
  //       }
  //     },
  //     {
  //       $limit: 12
  //     }
  //   ]);
  //   res.status(200).json({
  //     status: 'success',
  //     data: { plan }
  //   });
  // } catch (err) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: err
  //   });
  // }
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat, lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitute and longitude in the format lat, lng',
        400
      )
    );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    results: distances.length,
    data: {
      data: distances
    }
  });
});
