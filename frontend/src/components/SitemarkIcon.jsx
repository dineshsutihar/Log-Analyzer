import * as React from "react";
import SvgIcon from "@mui/material/SvgIcon";

export default function SitemarkIcon() {
  return (
    <SvgIcon sx={{ height: 21, width: 100, mr: 2 }}>
      <svg
        width="86"
        height="19"
        viewBox="0 0 86 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="9" cy="9" r="7" fill="#00D3AB" />
        <line
          x1="13"
          y1="13"
          x2="17"
          y2="17"
          stroke="#4876EE"
          stroke-width="2"
          stroke-linecap="round"
        />
        <text
          x="22"
          y="14"
          fill="#4876EE"
          font-family="Arial, sans-serif"
          font-size="10"
          font-weight="bold"
        >
          Log Analyzer
        </text>
      </svg>
    </SvgIcon>
  );
}
