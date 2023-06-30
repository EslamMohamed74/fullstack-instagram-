import React from 'react';
const Loader = () => {
    return (
        <div className="container center-align">
            <div className="row">
                <div className="col s12" style={{padding:"20vw 0px"}}>
                    <div className="preloader-wrapper big active">
                        <div className="spinner-layer spinner-blue-only">
                            <div className="circle-clipper left">
                                <div className="circle"></div>
                            </div><div className="gap-patch">
                                <div className="circle"></div>
                            </div><div className="circle-clipper right">
                                <div className="circle"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Loader;