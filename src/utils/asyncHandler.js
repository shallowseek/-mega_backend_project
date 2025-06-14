const asyncHandler = (requestHandler)=>{
    return (req,res,next)=>{
        Promise.resolve(requestHandler(req,res,next)).catch((err)=>next(err))
    } 

}
export {asyncHandler}





// const asyncHandler = (fn)=> async (req,res,next)=>{
//     // So (fn) => () => {} is a function that returns a function - a common pattern for creating reusable middleware and utilities in JavaScript!

//     // but  i have a questiion when we call asyncHandler it returns a function,  but we don't have any mechanism to call that returned function ?Excellent observation! You're absolutely right to question this. The key is understanding that Express.js automatically calls the returned function for you.
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(error.code||500).json({
//             sucess:false,
//             message:error.message
//         })
//     }


// }