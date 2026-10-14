import React, { FC, InputHTMLAttributes, useId } from "react";

import styles from "./InputControl.module.css";

interface InputControlProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const InputControl: FC<InputControlProps> = ({ label, ...props }) => {
  const generatedId = useId();
  const inputId = props.id || generatedId;
  return (
    <div className={styles.container}>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input type="text" {...props} id={inputId} />
    </div>
  );
};

export default InputControl;
