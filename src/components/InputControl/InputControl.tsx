import React, { FC, InputHTMLAttributes } from "react";

import styles from "./InputControl.module.css";

interface InputControlProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const InputControl: FC<InputControlProps> = ({ label, ...props }) => {
  return (
    <div className={styles.container}>
      {label && <label>{label}</label>}
      <input type="text" {...props} />
    </div>
  );
};

export default InputControl;
