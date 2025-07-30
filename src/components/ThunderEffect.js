import React from "react";
import "./WeatherEffect.css";

const ThunderEffect = () => {
  return (
    <video autoPlay muted loop playsInline className="background-video">
      <source src={`${process.env.PUBLIC_URL}/thunder.mp4`} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default ThunderEffect;
