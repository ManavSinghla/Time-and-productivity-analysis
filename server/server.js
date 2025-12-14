import express from 'express';

const app=express();
const port=5000;

// Middleware
app.use(express.json());

// Starting server
app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`);
})

// Testing Server
app.get("/",(req,res)=>{
    res.send("Server is running fine");
})