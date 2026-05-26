const http=require('http')
const fs=require('fs').promises
const path=require('path')
const server=http.createServer(async (req,res)=>{
  if(req.method=="GET")
   { const html=await fs.readFile(path.join(__dirname,'demo.html'),'utf8')
    res.writeHead(200,{'Content-Type':'text/html'})
    res.end(html)
   }
   else if(req.method=="POST")
    {
      var msg=""
      req.on("data",(datachunck)=>{
        msg+=datachunck
      })
      req.on("end",()=>{
        console.log(msg)
        res.end()
      })
    }
})
server.listen(8000,"0.0.0.0",()=>{console.log("server running")})