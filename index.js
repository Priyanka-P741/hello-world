require('dotenv/config');
const express = require("express");
const app = express();
const jwt = require('jsonwebtoken');
const role=require('./role');
//const status = require('http-status');
//const ConnectRoles = require('connect-roles');
const mysql = require('mysql');
const connection = mysql.createConnection({
    host :'localhost',
    user :'root',
    password :'',
    database :'user_admin'
});
connection.connect(function(err){
    if(!err) {
        console.log("database is connected");
    } else {
        console.log("err to connect database");
    }
});
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const {hash,  compare} = require('bcryptjs');
const { User } = require('./models');
const { Admin } =require('./models');

const { Validator } = require('node-input-validator');



app.listen(process.env.PORT, () => 
console.log('server listtening on port ${process.env.port}'),
);
app.use(cookieParser());
app.use(cors());
// app.use(
//     cors({
//         orgin: 'http://localhost:9000',
//         credentials: true,
//     })
// );
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.post('/register', async(req, res) => {
    
    const {role,username,email,password} = req.body;
    const v = new Validator(req.body, {
        role: 'required',
        username: 'required|maxLength:15',
        email: 'required|email',
        password: 'required|minLength:5'
      });
     
      v.check().then((matched) => {
        if (!matched) {
          res.status(422).send(v.errors);
        }
      }); 
    try{ 
            const u = await User.findOne({where:{email:email}});
        if(u) {
            res.json({ message: 'user already exist'});
        }
            
        
        if(!u){
        const hashedPassword = await hash(password,10);
        await User.create({
            id: User.length,
            role:req.body.role,
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword
        });
        res.json({ message: 'User Created'});
        console.log(hashedPassword);
     }
    } catch (err) {
        res.json({
            error: err
        });
   }
  })
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const v = new Validator(req.body, {
        email: 'required|email',
        password: 'required'
      });
     
      v.check().then((matched) => {
        if (!matched) {
          res.status(422).send(v.errors);
        }
      });

    try {
        const u = await User.findOne({where:{email:email}});
        if(!u){
            res.json({ message: 'user not exist'});
        }
        else{
            const value = await compare( password,u.password );
            if(!value)
            {
                res.json({ message: 'password incorrect'});
            }
            else{
                res.json({ message: 'LogIn successfully'});
            }
        }
    } catch (err) {
        res.json({
            error: err
        });
   }

  })
app.post('/:id/profile', async (req, res) => {
    const { username,email,password } = req.body;
    const u = await User.findOne({where:{id:req.params.id}});
    res.json(u);
})
app.post('/admin/register', async (req, res) => {
    const{adminusername,adminemail,adminpassword} = req.body;

    try{
        const u = await Admin.findOne({where:{adminemail:adminemail}});
        if(!u) {
            const hashedPassword = await hash(adminpassword,10);
        await Admin.create({
            //id: u.length,
            adminusername:req.body.adminusername,
            adminemail:req.body.adminemail,
            adminpassword:hashedPassword
        });
        res.json({ message: 'Admin Created'});
         //console.log(hashedPassword);
     } else{
         res.json({ message: 'Admin exist'})
     }
    } catch(err) {
        res.json({
            error: err
        });
   }
});
app.post('/admin/login', async (req, res) =>{
    const{adminusername,adminemail,adminpassword} = req.body;

    try {
    const u = await Admin.findOne({where:{adminemail:adminemail}});
    if(!u) {
        res.json({message:'Admin not exist'});
    } else {
        const value = await compare( adminpassword,u.adminpassword );
            if(!value)
            {
                res.json({ message: 'admin password incorrect'});
            }
            else{
                res.json({ message: 'Admin Login successfully'});
            }
    }
    }catch (err) {
        res.json({
            error: err
        });
   }
});
app.post('/admin/', async (req, res) =>{
    //const AdminId = req.params.id; 
    //const{adminusername,adminemail,adminpassword} = req.body;
 try { 
       const u = await Admin.findAll({
        include: [{
            model:User,
            // attributes: ['id','Admin_id','username','email','password'],
            //where:{}
        }]
        
       });
       res.json(u);
} catch(err) {
    res.json({
        error: err
    });
}
});

app.post('/auth', async (req, res) =>{
    // const role = req.body.role;
    // const username = req.body.username;
     const email = req.body.email;
    const password = req.body.password;
   try{ 
    const u = await User.findOne({where:{email:email}});
    if(!u){
             res.json({ message: 'user not exist'});
}
    else {
      const value = await compare( password,u.password );
      if(!value){
          res.json({ message: 'password not match'});
      }
      else {
          const a = await User.findOne({where:{role:u.role}});
          if(!a) {
              res.json({ message: 'only for admin user'});
          } else {
             const b = await User.findAll({
            });
            res.json(b);
          }
          
      }
    }
} catch(err) {
     res.json({
        error: err
    });
}
})










// app.post('/reg', async(req, res) => {
//     const id = req.body.id;
//     const role = req.body.role;
//     const username = req.body.username;
//     const email = req.body.email;
//     const password = req.body.password;
//     //User.findAll({where:{email:email}});
    
 
//     try{ 
        
//         const u = await User.findOne({where:{email:email}});
//          //Users.findOne(user => user.email === email);
//         if(u) {
//             res.json({ message: 'user already exist'});
//         }            
//         if(!u){
//             const token = jwt.sign({ id:id, role:role }, "secretkey");
//         await User.create({
//             id: User.length,
//             role:role,
//             username:username,
//             email:req.body.email,
//             password:token
//         });
//         res.json({ message: 'User Created'});
//         console.log(token);
//      }
//     } catch (err) {
//         res.json({
//             error: err
//         });
//    }
//   })

// app.post('/auth', async (req, res) =>{
//     const token = req.header('x-auth-header');if (!token) return res.status(401).send('Access Denied: No Token Provided!');
// try {
// const decoded = jwt.verify(token, "secretkey");if(role[decoded.role]{
//     req.user=decoded;
// return res.status(200).send("success");
// }
// else
// return res.status(401).send('Access Denied: You dont have correct privilege to perform this operation');
// }
// catch (err) {
// res.status(401).send('Invalid Token')
// }

// });
