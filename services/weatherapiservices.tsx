/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */

const api_key=process.env.NEXT_PUBLIC_API_KEY;
const base_url =process.env.NEXT_PUBLIC_API_URL;

import { useState } from "react";

export const getweatherapi = async (city : string ) => {
    try{
        const currentresponse =  await fetch(`${base_url}/weather?q=${city}&appid=${api_key}&units=metric`);
        if (!currentresponse.ok) throw new Error("City not found");
        const currentData = await currentresponse.json();

        return currentData;
    }catch(error){
        console.log(error);
        alert("error in fetching the city");
    }
} 

export const getforecastapi = async (city : string) => {
    try{
        const forecastresponse = await fetch(`${base_url}/forecast?q=${city}&appid=${api_key}&units=metric`);
        const forecastData = await forecastresponse.json();

        return forecastData;
    }catch(error){
        console.log(error);
        alert("error in fetching the forcast data");
    }
}
