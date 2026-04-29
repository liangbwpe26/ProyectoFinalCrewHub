import React, { Fragment } from "react";

// Módulo encargado exclusivamente de renderizar los errores en pantalla
const ShowErrors = ({ errors }) => {
    
    // Si no hay errores, no modificamos el DOM
    if (!errors || errors.length === 0) return null;

    return (
        <Fragment>
            <div className="errors_container">
                <ul>
                    {errors.map((error, index) => (
                        <li key={index} style={{ color: "red", fontWeight: "bold" }}>
                            {error}
                        </li>
                    ))}
                </ul>
            </div>
        </Fragment>
    );
};

export default ShowErrors;