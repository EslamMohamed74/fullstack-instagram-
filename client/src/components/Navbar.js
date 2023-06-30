import React, { useEffect, useContext, useRef, useState } from 'react';
import { Link, useHistory } from 'react-router-dom'
import { UserContext } from '../App';
import M from 'materialize-css/dist/js/materialize.min.js';

const NavBar = () => {
    const SearchModal = useRef(null)
    const [search, setSearch] = useState()
    const [userDetails, setUserDetails] = useState([])
    const { state, dispatch } = useContext(UserContext);
    const history = useHistory();
    useEffect(() => {
        let sidenav = document.querySelector('#slide-out');
        M.Sidenav.init(sidenav, {});
        var elems = document.querySelectorAll('.modal');
        M.Modal.init(elems, {});
    }, []);
    const renderList = () => {
        if (state) {
            return [
                <li key="1"><i data-target="modal1" className="material-icons modal-trigger nav-item " style={{ color: "black" }}>search</i></li>,
                <li key="2"><Link to="/profile">Profile</Link></li>,
                <li key="3"><Link to="/create">Creat Post</Link></li>,
                <li key="4"><Link to="/myfollowingpost">My Following Posts</Link></li>,
                <li key="5"><button className="btn #c62828 red darken-3" 
                    onClick={() => {
                        localStorage.clear();
                        dispatch({ type: "CLEAR" })
                        history.push('/login')
                    }}>
                    Logout
                </button>
                </li>
            ];
        } else {
            return [
                <li key="6"><Link to="/signup">Signup</Link></li>,
                <li key="7"><Link to="/login">Login</Link></li>
            ];
        }
    }

    const fetchUsers = (query) => {
        setSearch(query)
        if(query){
            fetch("/search-users", {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query
                })
            }).then(res => res.json())
                .then(result => {
                    setUserDetails(result.user)
                }).catch(err => {
                    console.log(err);
                })
        }
        
    }

    return (
        <>
            <nav>
                <div className="nav-wrapper white">
                    <Link to={state ? "/" : "/login"} className="brand-logo left">React Instagram</Link>
                    <a href="#" data-target="slide-out" className="sidenav-trigger hide-on-med right"><i className="material-icons">menu</i></a>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        {renderList()}
                    </ul>
                </div>
            </nav>
            <ul id="slide-out" className="sidenav">
                {renderList()}
            </ul>
            <div id="modal1" className="modal" ref={SearchModal} style={{ color: "black" }}>
                <div className="modal-content">
                    <input
                        type="text"
                        placeholder="Search users by email"
                        value={search}
                        onChange={(e) => fetchUsers(e.target.value)}
                    />
                    <ul className="collection">
                        {userDetails.map(item => {
                            return (<Link key={item._id} to={item._id !== state._id ? `/profile/${item._id}` : "/profile/"}
                                onClick={() => {
                                    M.Modal.getInstance(SearchModal.current).close()
                                    setSearch("")
                                }}>
                                <li className="collection-item">
                                <img style={{ width: "50px", height: "50px", borderRadius: "80px" }}
                                    src={item.pic} />
                                <span style={{ display: "inline-block", position: "relative", bottom: "15px", left: "10px", }}>{item.name}</span>
                                </li></Link>)
                        })}
                    </ul>
                </div>

                <div className="modal-footer">
                    <button className="modal-close waves-effect waves-green btn-flat" onClick={(e) => setSearch("")}>Close</button>
                </div>
            </div>
        </>
    )
}

export default NavBar;