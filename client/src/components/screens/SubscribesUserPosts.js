import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from "../../App";
import{Link} from 'react-router-dom';
const Home = () => {
    const [data, setData] = useState([]);
    const {state} = useContext(UserContext);
    useEffect(() => {
        fetch('/getsubpost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                setData(result.posts);
            })
    }, [])

    const likePost = (id) => {
        fetch('like', {
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
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        return result;
                    } else {
                        return item;
                    }
                })
                setData(newData)
            }).catch(err => console.log(err))
    }

    const unlikePost = (id) => {
        fetch('unlike', {
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
                const newData = data.map(item => {
                    if (item._id === result._id) {
                        return result;
                    } else {
                        return item;
                    }
                })
                setData(newData)
            }).catch(err => console.log(err))
    }

    const makeComment = (text, postId)=>{
        fetch('/comment',{
            method:"put",
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
            const newData = data.map(item => {
                if (item._id === result._id) {
                    return result;
                } else {
                    return item;
                }
            })
            setData(newData)
        }).catch(err => console.log(err))
    }

    const deletePost =(postid)=>{
        fetch(`/deletepost/${postid}`,{
            method:"delete",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            const newData = data.filter(item=>{
                return item._id !== result._id
            })
            setData(newData)
        }).catch(err => console.log(err))
    }
    const deleteComment =(postid,commentid)=>{
        fetch(`/deletecomment/${postid}/${commentid}`,{
            method:"delete",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        })
        .then(res => res.json())
        .then(result => {
            const newData = data.map(item => {
                if (item._id === result.post._id) {
                    return result.post;
                } else {
                    return item;
                }
            })
            setData(newData)
        }).catch(err => console.log(err))
    }
    return (
        <div className="home">
            { data.length === 0 ? <h2 style={{margin:"1%"}}>please follow some one to show his posts</h2> :
                data.map(item => {
                    return (
                        <div className="card home-card" key={item._id}>
                            <h5 style={{padding:'5px'}}> <Link to={item.postedBy._id !== state._id ?`/profile/${item.postedBy._id}`:"/profile/"}>
                            <img style={{ width: "50px", height: "50px", borderRadius: "80px" }}
                                src={item.postedBy.pic} alt= {item.postedBy.name+" profile image"}/>
                                <span style={{display:"inline-block", position: "relative", bottom: "15px", left: "10px",}}>{item.postedBy.name}</span>
                                </Link> 
                            {item.postedBy._id === state._id && <i className="material-icons" style={{float:"right"}}
                                        onClick={() => { deletePost(item._id) }}>delete_forever</i>}
                                {item.postedBy._id === state._id && <Link to={`/updatepost/${item._id}`}><i className="material-icons" style={{ float: "right" }}>settings</i></Link>}

                            </h5>
                            <div className="card-image">
                                <img src={item.photo} alt={"Post Image by "+ item.postedBy.name}/>
                            </div>
                            <div className="card-content">
                            {item.likes.includes(state._id)
                                    ? <i className="material-icons" style={{ color: "red" }}
                                        onClick={() => { unlikePost(item._id) }}>favorite</i>
                                    : <i className="material-icons" style={{ color: "red" }}
                                        onClick={() => { likePost(item._id) }}>favorite_border</i>
                                }
                                <h6>{item.likes.length} likes</h6>
                                <h6><b>{item.title}</b></h6>
                                <p>{item.body}</p>
                                {
                                    item.comments.map(comment=>{
                                        return(<h6 key={comment._id}>
                                            <span style={{fontWeight:"500"}}>{comment.postedBy.name}</span> {comment.text}
                                            { comment.postedBy._id === state._id ?<i className="material-icons" style={{ cursor: "pointer" ,float:"right"}}
                                        onClick={() => { deleteComment(item._id,comment._id) }}>delete_forever</i>:""}
                                        </h6>)
                                    })
                                }
                                <form onSubmit={(e)=>{
                                    e.preventDefault()
                                    makeComment(e.target[0].value,item._id)
                                    e.target[0].value=""
                                }}>
                                <input type="text" placeholder="add comment" />
                                </form>
                            </div>
                        </div>
                    );
                })
            }

        </div>
    )
}

export default Home;