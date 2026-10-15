import React, { FC } from "react";

import InputControl from "../InputControl/InputControl";
import { fromMonthInputValue, toMonthInputValue } from "../../utils/monthYear";

interface MonthYearControlProps {
  label: string;
  value?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

const MonthYearControl: FC<MonthYearControlProps> = ({ label, value, disabled, onChange }) => (
  <InputControl
    label={label}
    type="month"
    disabled={disabled}
    value={toMonthInputValue(value)}
    onChange={(event) => onChange(fromMonthInputValue(event.target.value))}
  />
);

export default MonthYearControl;
