import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../App';
import { useParams, Link } from 'react-router-dom';
import Loader from './Loader'

const UserProfile = () => {
    const [userProfile, setProfile] = useState(null);
    const { state, dispatch } = useContext(UserContext);
    const { userid } = useParams();
    const [showfollow, setShowFollow] = useState(state ? !state.following.includes(userid) : true);

    useEffect(() => {
        fetch(`/user/${userid}`, {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                setProfile(result)
            })
    }, [])

    const followUser = () => {
        fetch(`/follow`, {
            method: "put",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ followId: userid })
        }).then(res => res.json())
            .then(data => {
                dispatch({ type: "UPDATE", payload: { following: data.following, followers: data.followers } })
                localStorage.setItem("user", JSON.stringify(data))
                setProfile((prevState) => {
                    return {
                        ...prevState,
                        user: {
                            ...prevState.user,
                            followers: [...prevState.user.followers, data._id]
                        }
                    }
                })
                setShowFollow(false)
            })
    }

    const unfollowUser = () => {
        fetch(`/unfollow`, {
            method: "put",
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt"),
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ unfollowId: userid })
        }).then(res => res.json())
            .then(data => {
                dispatch({ type: "UPDATE", payload: { following: data.following, followers: data.followers } })
                localStorage.setItem("user", JSON.stringify(data))
                setProfile((prevState) => {
                    const newFollower = prevState.user.followers.filter(item => item !== data._id)
                    return {
                        ...prevState,
                        user: {
                            ...prevState.user,
                            followers: newFollower
                        }
                    }
                })
                setShowFollow(true)
            })
    }
    return (
        <>
            {userProfile ?
                <div className="container">
                    <div style={{ margin: "18px 0px", borderBottom: "1px solid grey" }}>
                        <div className="row">
                            <div className="col s2"></div>
                            <div className="col m2 s12 center-align">
                                <img className="circle responsive-img" width="100%"
                                    src={userProfile.user.pic} alt={userProfile.user.name + " Picture"} />
                            </div>
                            <div className="col m8 s12 ">
                                <div className="row">
                                    <div className="col s12">
                                        <h4>{userProfile.user.name}</h4>

                                    </div>
                                    <div className="col s12">
                                        <h6>{userProfile.user.email}</h6>

                                    </div>

                                    <div className="col m3 s4">
                                        <h6>{userProfile.posts.length} posts</h6>
                                    </div>
                                    <div className="col m3 s4">
                                        <h6>{userProfile.user.followers.length} followers</h6>
                                    </div>
                                    <div className="col m3 s4">
                                        <h6>{userProfile.user.following.length} following</h6>
                                    </div>
                                </div>
                                <div className="col s12">
                                    {showfollow ?
                                        <button style={{ margin: "10px" }} className="btn waves-effect blue draken-1"
                                            onClick={() => followUser()}>
                                            follow
                            </button> :
                                        <button style={{ margin: "10px" }} className="btn waves-effect blue draken-1"
                                            onClick={() => unfollowUser()}>
                                            Unfollow
                            </button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row center-align">
                        {
                            userProfile.posts.map(item => {
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
                                )
                            })
                        }
                    </div>
                </div>
                : <Loader />}

        </>
    )
}

export default UserProfile;