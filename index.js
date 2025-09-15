const express=require("express");
const app=express();
const PORT = process.env.PORT || 3000;
const path=require("path");
const multer=require("multer");
const {v4:uuidv4}=require("uuid");
const methodOverride=require("method-override");
const fs=require("fs");
app.use(methodOverride("_method"));


// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'resources/added_images'); // folder to store images
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // saves with original filename
  }
});

const upload = multer({ storage: storage });

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use(express.static(path.join(__dirname,"public")));
app.use(express.static(path.join(__dirname,"resources")));
app.use(express.static(path.join(__dirname,"resources/added_images")));

app.listen(PORT,()=>{
    console.log(`server was running on port ${PORT}`);
})

let users=[
    {
        id:uuidv4(),
        username:"parag",
        password:"455@jjffjf",
        profilePic:"/profile_pic.jpg",
        post:"Hare Krishna",
        morePost:[]
    },
    {
        id:uuidv4(),
        username:"Games & Tour",
        password:"455duhu",
        profilePic:"/gt.png",
        post:"Welcome to Games & Tour",
        morePost:[]
    },
    {
        id:uuidv4(),
        username:"Google",
        password:"455@jfdjj",
        profilePic:"/google.jpg",
        post:"Welcome to Google",
        morePost:[]
    }
]

app.get("/users",(req,res)=>{
    res.render("index.ejs",{users});
})

app.get("/users/post/:id",(req,res)=>{
    let {id}=req.params;
    let user=users.find(user=>user.id==id);
    res.render("post.ejs",{user});
})

app.post("/users/:id", upload.single('profilePic'), (req, res) => {
    let {id}=req.params;
  const { username, password, post } = req.body;
  const profilePicPath = req.file ? req.file.path : null;
  const newFile=path.basename(profilePicPath);
  let findPost=users.find(post=>post.id==id);
  const newPost = {
    id:uuidv4(),
    username,
    password: findPost.password,
    post,
    profilePic: newFile
  };
  
  findPost.morePost.push(newPost);
  res.redirect("/users");
});

app.get("/users/morepost/:id", (req, res) => {
  const { id } = req.params;
  const findPost = users.find(user => user.id == id);

  if (!findPost) {
    return res.status(404).send("User not found");
  }
  if (Array.isArray(findPost.morePost) && findPost.morePost.length > 0) {
    res.render("morepost.ejs", { user: findPost });
  } else {
    res.send("No more posts");
  }
});

app.get("/users/add",(req,res)=>{
  res.render("add.ejs");
})

app.post("/users",upload.single('profilePic'),(req,res)=>{
  let {username,password,profilePic,post}=req.body;
  const profilePicPath = req.file ? req.file.path : null;
  const newFile=path.basename(profilePicPath);
  let newUser={
    id:uuidv4(),
    username:username,
    password:password,
    profilePic:newFile,
    post:post,
    morePost:[]
  }
  users.push(newUser);
  res.redirect("/users");
})

app.get("/users/:id",(req,res)=>{
   let {id}=req.params;
   let findUser=users.find(user=>user.id==id);
   res.render("updateUser.ejs",{user:findUser});
})

app.patch("/users/:id",upload.single('profilePic'),(req,res)=>{
   let {id}=req.params;
   let findUser=users.find(user=>user.id==id);
   let {username,password,profilePic,post}=req.body;
  const profilePicPath = req.file ? req.file.path : null;
  const newFile=path.basename(profilePicPath);
  findUser.id=id;
  findUser.username=username;
  findUser.password=password;
  findUser.profilePic=newFile;
  findUser.post=post;
  res.redirect("/users");
})

app.get("/users/morepost/update/:id/:userid",(req,res)=>{
   let {id,userid}=req.params;
   let findUser=users.find(user=>user.id==userid);
   let moreposts=findUser.morePost.find(post=>post.id==id);
   res.render("morePostUpdate.ejs",{user:moreposts,userid});
})

app.patch("/users/morepost/:id/:userid", upload.single("profilePic"), (req, res) => {
   let { id, userid } = req.params;

   // find the parent user
   let findUser = users.find(user => user.id == userid);
   if (!findUser) {
      return res.status(404).send("User not found");
   }

   // find the specific post inside morePost
   let morepost = findUser.morePost.find(post => post.id == id);
   if (!morepost) {
      return res.status(404).send("Post not found");
   }

   let { post } = req.body;

   // update profilePic if uploaded
   if (req.file) {
      const profilePicPath = req.file.path;
      const newFile = path.basename(profilePicPath);
      morepost.profilePic = newFile;
   }

   // update post content
   morepost.post = post;

   // redirect back to that user’s morepost page
   res.redirect(`/users/morepost/${userid}`);
});

app.delete("/users/:id/:pic",(req,res)=>{
   let {id,pic}=req.params;
   const filename = req.params.pic;
   const filePath = path.join(__dirname, 'resources/added_images', filename);

  fs.unlink(filePath,()=>{
    res.status(200);
  });
   let user=users.indexOf(users.find(user=>{
       return user.id==id;
   }))
   users.splice(user,1);
   res.redirect("/users");
})

app.delete("/users/:id/:userid/:pic",(req,res)=>{
   let {id,userid}=req.params;
   let user=(users.find(user=>{
       return user.id==userid;
   }));
   const filename = req.params.pic;
   const filePath = path.join(__dirname, 'resources/added_images', filename);

  fs.unlink(filePath,()=>{
    res.status(200);
  });
   user.morePost.splice(user.morePost.indexOf(user.morePost.find(u=>{
        return u.id==id;
      })),1);
 
   res.redirect(`/users/morepost/${userid}`);
})