import React, { FC } from "react";
import Header from "../Header/Header";
import LandingSections from "../LandingSections/LandingSections";
import Navbar from "../Navbar/Navbar";

import styles from "./Landing.module.css";

const Landing: FC = () => {
  return (
    <div className={styles.container} id="top">
      <Navbar />
      <Header />
      <LandingSections />
    </div>
  );
};

export default Landing;
