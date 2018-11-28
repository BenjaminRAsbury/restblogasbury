var expressSanitizer = require("express-sanitizer"),
    methodOverride  = require("method-override"),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    mongodb         = require("mongodb"),
    express         = require("express"),
    app             = express();

var url = process.env.DATABASEURL || "mongodb://localhost:27017/rest_blog";
// App Config
mongoose.connect(url, { useNewUrlParser: true });
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//MUST COME AFTER BODYPARSER
app.use(expressSanitizer());
mongoose.set('useFindAndModify', false);

// Mongoose/Model Config
var blogSchema = new mongoose.Schema({
    title: String,
    image: {
        type: String,
        default: "placeholderimage.jpg"
    },
    body: String,
    created: {
        type: Date,
        default: Date.now
    },
});
var Blog = mongoose.model("Blog", blogSchema);

// RESTful Routes
app.get("/", (req, res) => {
    res.redirect("/blogs");
});
// Index
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if (err) {
            console.log(err);
            console.log("Error: Blog.find");
        } else {
            res.render("index", {blogs: blogs});
        };
    });
});
// New
app.get("/blogs/new", (req, res) => {
    res.render("new");
});
// Create
app.post("/blogs", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    // console.log("================");
    // console.log(req.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if (err) {
            console.log(err);
            console.log("Error: Blog.create");
        } else {
            res.redirect("/blogs");
        };
    });
});
// Show
app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect("/");
        } else {
            res.render("show", {blog: foundBlog});
        };
    });
});
// Edit
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
       if (err) {
           res.redirect("/");
       } else {
           res.render("edit", {blog: foundBlog});
       };
   });
});
// Update
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findOneAndUpdate({"_id": req.params.id}, req.body.blog, (err, updatedBlog) => {
        if (err) {
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs/" + req.params.id);
        };
    });
});
// Destroy
app.delete("/blogs/:id", (req, res) => {
    Blog.findOneAndDelete({"_id": req.params.id}, (err) => {
        if (err) {
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        };
    });
});

app.listen(process.env.PORT || 3000, process.env.IP, () => {
    console.log("Blog Started");
});
