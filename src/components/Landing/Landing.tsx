import React, { FC } from "react";
import Header from "../Header/Header";

import styles from "./Landing.module.css";

const Landing: FC = () => {
  return (
    <div className={styles.container}>
      <Header />
    </div>
  );
};

export default Landing;
