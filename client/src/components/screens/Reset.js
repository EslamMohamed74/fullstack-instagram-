import React,{useState} from 'react';
import {useHistory} from 'react-router-dom';
import M from 'materialize-css'; 

const Reset = () => {
    const history = useHistory();
    const [email,setEmail] = useState("");

    const ResetPassword =()=>{
        if(!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)){
            M.toast({html: "Invalid Email",classes:"#c62828 red darken-3"});
            return;
        }
        fetch("/reset-password" ,{
            method:"post",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email
            })
        }).then(res=>res.json())
        .then(data=>{
            if(data.error){
                M.toast({html: data.error,classes:"#c62828 red darken-3"});
            }
            else{
                M.toast({html:data.message,classes:"#43a047 green darken-1"});
                history.push('/login');
            }
        }).catch(err=>{
            console.log(err);
        })
    }

    return (
        <div className="mycard">
            <div className="card auth-card input-field">
            <h2>React Instagram</h2>
            <input 
            type="text"
            placeholder="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            />
            
            <button className="btn waves-effect blue draken-1"
            onClick={()=>ResetPassword()}>
                Reset password
            </button>
        </div>
        </div>
    )
}

export default Reset;