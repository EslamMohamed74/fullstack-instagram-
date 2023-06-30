const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const requireLogin = require("../middleware/requireLogin");
const { route } = require("./auth");
const Post = mongoose.model("Post");

router.get('/allpost', requireLogin, (req, res) => {
    Post.find()
        .populate("postedBy", "_id name pic")
        .populate("comments.postedBy", "_id name pic")
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/post/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
        .populate("postedBy", "_id name pic")
        .populate("comments.postedBy", "_id name pic")
        .then(post => {
            res.json({ post })
        })
        .catch(err => {
            console.log(err)
        })
})

router.get('/getsubpost', requireLogin, (req, res) => {
    Post.find({postedBy:{$in:req.user.following}})
        .populate("postedBy", "_id name pic")
        .populate("comments.postedBy", "_id name pic")
        .sort('-createdAt')
        .then(posts => {
            res.json({ posts })
        })
        .catch(err => {
            console.log(err)
        })
})

router.post("/createpost", requireLogin, (req, res) => {
    const { title, body, pic } = req.body;
    if (!title || !body || !pic) {
        return res.status(422).json({ error: "please add all the fields" });
    }
    req.user.password = undefined;
    const post = new Post({
        title,
        body,
        photo: pic,
        postedBy: req.user,
    });
    post
        .save()
        .then((result) => {
            res.json({ post: result });
        })
        .catch((err) => {
            console.log(err);
        });
});

router.put('/updatepost/:postId', requireLogin, (req, res) => {
    const { title, body, pic } = req.body;
    if (!title || !body || !pic) {
        return res.status(422).json({ error: "please add all the fields" });
    }

    req.user.password = undefined;
    Post.updateOne({ $and: [{"_id": req.params.postId}, {"postedBy": req.user._id}] },{
        $set:{title, body, photo:pic}
    }, {
        new: true
    })
    .then(Update => {
        res.json({ Update })
    })
    .catch(err => {
        console.log(err)
    })
    
})


router.get('/mypost', requireLogin, (req, res) => {
    Post.find({ postedBy: req.user._id })
        .populate("postedBy", "_id name")
        .then(mypost => {
            res.json({ mypost })
        })
        .catch(err => {
            console.log(err)
        })
})

router.put('/like', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { likes: req.user.id }
    }, {
        new: true
    })
    .populate("postedBy", "_id name pic")
    .populate("comments.postedBy", "_id name pic")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

router.put('/unlike', requireLogin, (req, res) => {
    Post.findByIdAndUpdate(req.body.postId, {
        $pull: { likes: req.user.id }
    }, {
        new: true
    })
    .populate("postedBy", "_id name pic")
    .populate("comments.postedBy", "_id name pic")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})

router.put('/comment', requireLogin, (req, res) => {
    const comment = {
        text: req.body.text,
        postedBy: req.user._id
    }
    Post.findByIdAndUpdate(req.body.postId, {
        $push: { comments: comment }
    }, {
        new: true
    })
    .populate("postedBy", "_id name pic")
    .populate("comments.postedBy", "_id name pic")
        .exec((err, result) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                res.json(result)
            }
        })
})


router.delete('/deletepost/:postId', requireLogin, (req, res) => {
    Post.findOne({ _id: req.params.postId })
    .populate("postedBy", "_id name pic")
        .exec((err, post) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                if (post.postedBy._id.toString() === req.user._id.toString()) {
                    post.remove()
                        .then(result => {
                            res.json(result)
                        }).catch(err => {
                            console.log(err)
                        })
                }

            }
        })
})

router.delete('/deletecomment/:postId/:commentId', requireLogin, (req, res) => {
    Post.findById({ _id: req.params.postId })
    .populate("postedBy", "_id name pic")
    .populate("comments.postedBy", "_id name pic")
        .exec((err, post) => {
            if (err) {
                return res.status(422).json({ error: err })
            } else {
                const commentToDelete = post.comments.find(
                    (comment) => comment.id === req.params.commentId
                );
                // Make sure comment exists
                if (!commentToDelete) {
                    return res.status(404).json({ msg: "Comment does not exist" });
                }

                if (commentToDelete.postedBy._id.toString() === req.user._id.toString()) {
                    // Get remove index
                    const removeIndex = post.comments
                        .map((comment) => comment.id)
                        .indexOf(req.params.commentId);

                    post.comments.splice(removeIndex, 1);

                    post.save();

                    res.json({ post });
                }
            }
        })
})

module.exports = router;
