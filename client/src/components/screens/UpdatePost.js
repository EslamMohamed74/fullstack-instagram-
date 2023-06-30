import React, { useState, useEffect } from "react";
import { useHistory, useParams } from 'react-router-dom';
import M from 'materialize-css';

const UpdatePost = () => {
    const history = useHistory();
    const { postid } = useParams();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [image, setImage] = useState("");
    const [url, setUrl] = useState("");
    const [updateClick, setupdateClick] = useState(false);

    useEffect(() => {
        fetch(`/post/${postid}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                setTitle(result.post.title);
                setBody(result.post.body);
                setUrl(result.post.photo);

            })
    }, [])

    useEffect(() => {
        if (updateClick) {
            fetch(`/updatepost/${postid}`, {
                method: "put",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem('jwt')
                },
                body: JSON.stringify({
                    title,
                    body,
                    pic: url

                })
            }).then(res => res.json())
                .then(data => {
                    if (data.error) {
                        M.toast({ html: data.error, classes: "#c62828 red darken-3" });
                    }
                    else {
                        M.toast({ html: "Post Update Successfully", classes: "#43a047 green darken-1" });
                        history.push(`/post/${postid}`);
                    }
                }).catch(err => {
                    console.log(err);
                })
        }
    }, [updateClick])

    const postDetails = () => {
        const data = new FormData();
        data.append("file", image)
        data.append("upload_preset", "insta-clone")
        data.append("cloud_name", "eslam-cloud")
        fetch("	https://api.cloudinary.com/v1_1/eslam-cloud/image/upload", {
            method: "post",
            body: data
        })
            .then(res => res.json())
            .then(data => {
                setUrl(data.url)
                setupdateClick(true)

            })
            .catch(err => {
                console.log(err)
            })
    }
    return (
        <div
            className="card input-filed"
            style={{
                margin: "30px auto",
                maxWidth: "500px",
                padding: "20px",
                textAlign: "center",
            }}
        >
            <input
                type="text"
                placeholder="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <input
                type="text"
                placeholder="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />
            <div className="card home-card">
                <div className="card-image">
                    <img src={url} alt="Post Image"/>
                </div>
            </div>
            <div className="file-field input-field">
                <div className="btn blue draken-1">
                    <span>Upload Image</span>
                    <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text" />
                </div>
            </div>
            <button className="btn waves-effect blue draken-1" onClick={() => postDetails()}>Update Post</button>
        </div>
    );
};

export default UpdatePost; 
