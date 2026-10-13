import React, { FC } from "react";
import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";

import styles from "./Landing.module.css";

const Landing: FC = () => {
  return (
    <div className={styles.container}>
      <Navbar />
      <Header />
    </div>
  );
};

export default Landing;
