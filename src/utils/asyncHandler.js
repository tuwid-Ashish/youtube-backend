export const asyncHandler=(requestHandler)=>{
   (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=> next(err))
    }
}


// const asyncHandlertrycatch =(fn)=> async (req,res,next)=>{
//  try {
//     await fn(eq,res,next)
//  } catch (error) {
//     res.status(error.code || 500).json({
//         success:false,
//         message: error.message
//     })

//  }
// }