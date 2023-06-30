import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../App";
import { Link } from "react-router-dom";

const Profile = () => {
    const [mypics, setPics] = useState([]);
    const { state, dispatch } = useContext(UserContext);
    const [image, setImage] = useState("");
    useEffect(() => {
        fetch("/mypost", {
            headers: {
                Authorization: "Bearer " + localStorage.getItem("jwt"),
            },
        })
            .then((res) => res.json())
            .then((result) => {
                setPics(result.mypost);
            });
    }, []);
    useEffect(() => {
        if (image) {
            const data = new FormData();
            data.append("file", image);
            data.append("upload_preset", "insta-clone");
            data.append("cloud_name", "eslam-cloud");
            fetch("	https://api.cloudinary.com/v1_1/eslam-cloud/image/upload", {
                method: "post",
                body: data,
            })
                .then((res) => res.json())
                .then((data) => {
                    fetch("/updatepic", {
                        method: "put",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + localStorage.getItem("jwt"),
                        },
                        body: JSON.stringify({
                            pic: data.url,
                        }),
                    })
                        .then((res) => res.json())
                        .then((result) => {
                            localStorage.setItem("user", JSON.stringify({ ...state, pic: result.pic }))
                            dispatch({ type: "UPDATEPIC", payload: result.pic })
                        });
                })

                .catch((err) => {
                    console.log(err);
                });
        }
    }, [image]);

    const updatePhoto = (file) => {
        setImage(file);
    };
    return (
        <div className="container">
            <div style={{ margin: "18px 0px", borderBottom: "1px solid grey" }}>
                <div className="row">
                    <div className="col s2"></div>
                    <div className="col m2 s12 center-align">
                        <img
                            className="circle responsive-img"
                            width="100%"
                            src={state ? state.pic : ""}
                            alt={state.name + " Picture"}
                        />
                    </div>
                    <div className="col m8 s12 ">
                        <div className="row">
                            <div className="col s12">
                                <h4>{state ? state.name : "loading"}</h4>

                            </div>
                            <div className="col s12">
                                <h6>{state ? state.email : "loading"}</h6>

                            </div>

                            <div className="col m3 s4">
                                <h6>{mypics ? mypics.length : 0} posts</h6>
                            </div>
                            <div className="col m3 s4">
                                <h6>{state ? state.followers.length : 0} followers</h6>
                            </div>
                            <div className="col m3 s4">
                                <h6>{state ? state.following.length : 0} following</h6>
                            </div>
                        </div>
                    </div>
                
                </div>

                <div className="file-field input-field" style={{ margin: "10px" }}>
                    <div className="btn blue draken-1">
                        <span>Update Pic</span>
                        <input
                            type="file"
                            onChange={(e) => updatePhoto(e.target.files[0])}
                        />
                    </div>
                    <div className="file-path-wrapper">
                        <input className="file-path validate" type="text" />
                    </div>
                </div>
            </div>
            <div className="row center-align">
                {mypics.map((item) => {
                    return (
                        <div className="col m4 s12" key={item._id} >
                            <Link to={`/post/${item._id}`} >
                            <img
                                className="responsive-img"
                                src={item.photo}
                                alt={item.title}
                            />
                        </Link>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Profile;
