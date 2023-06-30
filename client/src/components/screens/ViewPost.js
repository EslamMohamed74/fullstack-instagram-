import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from "../../App";
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Loader from './Loader'

const ViewPost = () => {
    const [data, setData] = useState(null);
    const { postid } = useParams();
    const { state, dispatch } = useContext(UserContext);
    useEffect(() => {
        fetch(`/post/${postid}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                setData(result.post);
            })
    }, [])

    const likePost = (id) => {
        fetch('/like', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        }).then(res => res.json())
            .then(result => {
                setData(result)
            }).catch(err => console.log(err))
    }

    const unlikePost = (id) => {
        fetch('/unlike', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId: id
            })
        }).then(res => res.json())
            .then(result => {
                setData(result)
            }).catch(err => console.log(err))
    }

    const makeComment = (text, postId) => {
        fetch('/comment', {
            method: "put",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            },
            body: JSON.stringify({
                postId,
                text
            })
        }).then(res => res.json())
            .then(result => {
                setData(result)
            }).catch(err => console.log(err))
    }

    const deletePost = (postid) => {
        fetch(`/deletepost/${postid}`, {
            method: "delete",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                setData(result)
            }).catch(err => console.log(err))
    }
    const deleteComment = (postid, commentid) => {
        fetch(`/deletecomment/${postid}/${commentid}`, {
            method: "delete",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
            .then(res => res.json())
            .then(result => {
                setData(result)
            }).catch(err => console.log(err))
    }
    return (
        <>
        {data?
        <div className="home">
            {
                <div className="card home-card">
                    <h5 style={{ padding: '5px' }}> <Link to={data.postedBy._id !== state._id ? `/profile/${data.postedBy._id}` : "/profile/"}>
                        <img style={{ width: "50px", height: "50px", borderRadius: "80px" }}
                            src={data.postedBy.pic} />
                        <span style={{ display: "inline-block", position: "relative", bottom: "15px", left: "10px", }}>{data.postedBy.name}</span>
                    </Link>
                    {data.postedBy._id == state._id && <i className="material-icons" style={{ float: "right" }}
                            onClick={() => { deletePost(data._id) }}>delete_forever</i>}
                    {data.postedBy._id == state._id && <Link to={`/updatepost/${data._id}`}><i className="material-icons" style={{ float: "right" }}>settings</i></Link>}
                        
                    </h5>
                    <div className="card-image">
                        <img src={data.photo} />
                    </div>
                    <div className="card-content">
                        
                        {data.likes.includes(state._id)
                            ? <i className="material-icons" style={{ color: "red" }}
                                onClick={() => { unlikePost(data._id) }}>favorite</i>
                            : <i className="material-icons" style={{ color: "red" }}
                                onClick={() => { likePost(data._id) }}>favorite_border</i>
                        }
                        <h6>{data.likes.length} likes</h6>
                        <h6><b>{data.title}</b></h6>
                        <p>{data.body}</p>
                        {
                            data.comments.map(comment => {
                                return (<h6 key={comment._id}>
                                    <span style={{ fontWeight: "500" }}>{comment.postedBy.name}</span> {comment.text}
                                    { comment.postedBy._id == state._id ? <i className="material-icons" style={{ cursor: "pointer", float: "right" }}
                                        onClick={() => { deleteComment(data._id, comment._id) }}>delete_forever</i> : ""}
                                </h6>)
                            })
                        }
                        <form onSubmit={(e) => {
                            e.preventDefault()
                            makeComment(e.target[0].value, data._id)
                            e.target[0].value = ""
                        }}>
                            <input type="text" placeholder="add comment" />
                        </form>
                    </div>
                </div>
            }

        </div>
        :<Loader />}
        
        </>
    )
}

export default ViewPost;