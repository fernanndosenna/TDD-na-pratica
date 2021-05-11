let express = require("express");
let app = express();
let mongoose = require("mongoose");
let user = require("./models/User");
let bcrypt = require("bcrypt")
let jwt = require("jsonwebtoken");
let JWTSecret = "fklsddsajkdsahdosalslkdçadkjsalçdksajçlgkjf"

//settings
//bodyparser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//mongoose
mongoose.connect("mongodb://localhost:27017/guiapics",{useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        //console.log("Conectado com o banco!");
    }).catch(err => {
        console.log(err)
    })

//carregando model
let User = mongoose.model("User", user);


app.get("/",(req,res) => {
    res.json({});
})

//cadastro de usuário
app.post("/user", async (req,res) => {
    let { name, email, password } = req.body;

    if(name == "" || email == "" || password == ""){
        res.sendStatus(400);
        return;
    }

    try {
        let user = await User.findOne({"email": email})

        if( user != undefined){
            res.statusCode = 400;
            res.json({error: "E-mail já cadastrado"})
            return
        }

        let pass = password;
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(pass,salt);

         let newUser = new User({name, email, password: hash})
         await newUser.save();
         res.json({email: email})
    } catch (err) {
    console.log(err)
     res.sendStatus(500);
    }

})

//autenticacao de usuário
app.post("/auth", async(req,res) => {
    let { email, password } = req.body;

    let user = await User.findOne({"email" : email});

    if(user == undefined){
        res.statusCode = 403;
        res.json({errors: {email: "E-mail não cadastrado"}});
        return;
    }

    let isPasswordRight = await bcrypt.compare(password, user.password);

    if(!isPasswordRight){
        res.statusCode = 403;
        res.json({errors: {password: "Senha incorreta"}})
        return;
    }

    jwt.sign({email, name: user.name, id: user._id}, JWTSecret, {expiresIn: '48'}, (err,token) => {
        if(err){
            res.sendStatus(500);
            console.log(err)
        }else{
            res.json({ token });
        }
    })
})




//rota para deleçao de usuário após o teste não fazendo parte da aplicação
app.delete("/user/:email", async (req,res) => {
    let { email } = req.body
    await User.deleteOne({"email": email});
    res.sendStatus(200);
})

module.exports = app;