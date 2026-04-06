import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "react-feather";

import resumeSvg from "../../assets/standout.svg";

import styles from "./Header.module.css";

const Header: FC = () => {
  const navigate = useNavigate();

  const handleBuildResume = () => {
    navigate("/resumebuilder");
  };

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <p className={styles.heading}>
          A <span>Resume</span> that stands out!
        </p>
        <p className={styles.heading}>
          Create <span>Impressive </span>Resumes in Minutes.{" "}
          <span>It's free.</span>
        </p>
        <button className={styles.scrollButton} onClick={handleBuildResume}>
          <span>Click Here To Build Your Resume</span>
          <ChevronRight size={28} />
        </button>
      </div>
      <div className={styles.right}>
        <img src={resumeSvg} alt="Resume" />
      </div>
    </div>
  );
};

export default Header;
