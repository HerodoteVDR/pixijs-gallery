import {useState} from 'react'

import './App.css'
import Gallery from "./Gallery";
import React from "react";
import Navigation from "./Navigation.tsx";

function App() {

    return (
        <>
            <Navigation/>
            <Gallery/>
        </>
    )
}

export default App
